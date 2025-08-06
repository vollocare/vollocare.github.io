// Flock 類別 - 群體行為實現
/// <reference path="../types/p5.d.ts" />
import { DEFAULT_FLOCK_CONFIG } from '../interfaces/IFlockBehavior';
import { Vector } from '../utils/Vector';
export class Flock {
    constructor(p, config) {
        this.p = p;
        this.config = { ...DEFAULT_FLOCK_CONFIG, ...config };
    }
    // 主要運行方法
    run(leader, units, obstacles, enemies) {
        // 處理跟隨狀態的單位
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            if (unit.isFollow && unit.isFollow()) {
                this.applyFollowBehaviors(leader, unit, units, obstacles, enemies);
            }
            if (unit.isAttacking && unit.isAttacking()) {
                this.applyAttackBehaviors(leader, unit, units, obstacles, enemies);
            }
        }
        // 處理領導者的避障
        if (leader.isMove && leader.isMove()) {
            const avoidance = this.avoid(leader, obstacles);
            if (avoidance.mag() > 0) {
                if (this.config.showArrows) {
                    this.drawArrow(this.p, leader.position, Vector.mult(this.p, avoidance, 1000), 'white');
                }
                leader.applyForce(avoidance);
            }
        }
        // 群體停止邏輯
        this.handleGroupStopping(leader, units);
    }
    applyFollowBehaviors(leader, unit, units, obstacles, enemies) {
        const sep = this.separate(leader, unit, units);
        const ali = this.align(leader, unit, units);
        const coh = this.cohesion(leader, unit, units);
        const avo = this.avoid(unit, obstacles);
        const avoEnemy = this.avoidEnemies(unit, enemies);
        // 應用權重
        sep.mult(this.config.separationWeight);
        ali.mult(this.config.alignmentWeight);
        coh.mult(this.config.cohesionWeight);
        // 應用基本行為力
        unit.applyForce(sep);
        unit.applyForce(ali);
        unit.applyForce(coh);
        // 應用避障力
        if (avo.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, Vector.mult(this.p, avo, 1000), 'white');
            }
            avo.mult(this.config.avoidanceWeight);
            unit.applyForce(avo);
        }
        if (avoEnemy.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, Vector.mult(this.p, avoEnemy, 1000), 'purple');
            }
            avoEnemy.mult(this.config.enemyAvoidanceWeight);
            unit.applyForce(avoEnemy);
        }
    }
    applyAttackBehaviors(leader, unit, units, obstacles, enemies) {
        const sep = this.separate(leader, unit, units);
        const coh = this.cohesion(leader, unit, units);
        const avo = this.avoid(unit, obstacles);
        const avoEnemy = this.avoidEnemies(unit, enemies);
        // 攻擊狀態下的權重調整
        sep.mult(1.2);
        coh.mult(1.0);
        unit.applyForce(sep);
        unit.applyForce(coh);
        if (avo.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, Vector.mult(this.p, avo, 1000), 'white');
            }
            avo.mult(this.config.avoidanceWeight);
            unit.applyForce(avo);
        }
        if (avoEnemy.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, Vector.mult(this.p, avoEnemy, 1000), 'purple');
            }
            avoEnemy.mult(this.config.enemyAvoidanceWeight);
            unit.applyForce(avoEnemy);
        }
    }
    handleGroupStopping(leader, units) {
        if (!leader.isMove || leader.isMove())
            return;
        const sum = new Vector(this.p, 0, 0);
        for (let i = 0; i < units.length; i++) {
            sum.add(units[i].position);
        }
        if (units.length > 0) {
            sum.div(units.length);
        }
        const distance = Vector.dist(leader.position, sum);
        if (distance < this.config.desiredSeparation) {
            for (let i = 0; i < units.length; i++) {
                if (!units[i].isAttacking || !units[i].isAttacking()) {
                    units[i].setStop();
                }
            }
        }
    }
    // 分離行為 - 避免過度擁擠
    separate(leader, targetUnit, units) {
        const steer = new Vector(this.p, 0, 0);
        let count = 0;
        // 與領導者的分離
        const diffFromLeader = Vector.sub(this.p, targetUnit.position, leader.position);
        const distFromLeader = Vector.dist(targetUnit.position, leader.position);
        if (distFromLeader < this.config.desiredSeparation) {
            diffFromLeader.normalize();
            if (distFromLeader !== 0) {
                diffFromLeader.div(distFromLeader);
            }
            steer.add(diffFromLeader);
            count = 1;
        }
        // 與其他單位的分離
        for (let i = 0; i < units.length; i++) {
            const distance = Vector.dist(targetUnit.position, units[i].position);
            if (distance > 0 && distance < this.config.desiredSeparation) {
                const diff = Vector.sub(this.p, targetUnit.position, units[i].position);
                diff.normalize();
                if (distance !== 0) {
                    diff.div(distance);
                }
                steer.add(diff);
                count++;
            }
        }
        // 平均化
        if (count > 0) {
            steer.div(count);
        }
        // 應用 Reynolds 導向公式
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(targetUnit.maxSpeed);
            steer.sub(targetUnit.velocity);
            steer.limit(targetUnit.maxForce);
        }
        return steer;
    }
    // 對齊行為 - 朝向平均方向
    align(leader, targetUnit, units) {
        const sum = new Vector(this.p, 0, 0);
        let count = 1;
        // 太遠就不對齊
        const distance = Vector.dist(targetUnit.position, leader.position);
        if (distance > this.config.neighborDistance) {
            return new Vector(this.p, 0, 0);
        }
        // 加入領導者的方向
        if (leader.direction) {
            sum.add(leader.direction);
        }
        // 加入鄰近單位的速度
        for (let i = 0; i < units.length; i++) {
            const d = Vector.dist(targetUnit.position, units[i].position);
            if (d > 0) {
                sum.add(units[i].velocity);
                count++;
            }
        }
        sum.div(count);
        sum.normalize();
        sum.mult(targetUnit.maxSpeed);
        const steer = Vector.sub(this.p, sum, targetUnit.velocity);
        steer.limit(targetUnit.maxForce);
        return steer;
    }
    // 凝聚行為 - 朝向群體中心
    cohesion(leader, targetUnit, _units) {
        const sum = new Vector(this.p, 0, 0);
        sum.add(leader.position);
        // 註解掉的部分保持原樣，可能有特殊用途
        /*
        for (let i = 0; i < units.length; i++) {
          const d = Vector.dist(targetUnit.position, units[i].position);
          if (d > 0) {
            sum.add(units[i].position);
            count++;
          }
        }
        sum.div(count);
        */
        return targetUnit.seek(sum);
    }
    // 避障行為 - 避開障礙物
    avoid(targetUnit, obstacles) {
        const sum = new Vector(this.p, 0, 0);
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            const dist = Vector.dist(obstacle.position, targetUnit.position);
            const vLength = targetUnit.velocity.mag() * this.config.collisionVisibilityFactor;
            // 進入碰撞判斷
            if ((vLength + obstacle.radius + targetUnit.r) >= dist) {
                const a = Vector.sub(this.p, obstacle.position, targetUnit.position);
                const v = Vector.mult(this.p, targetUnit.velocity, this.config.collisionVisibilityFactor);
                v.normalize();
                v.mult(a.mag());
                const b = Vector.sub(this.p, v, a);
                const twoObjRadiusAddition = obstacle.radius + targetUnit.r;
                // 碰撞處理
                if (b.mag() <= twoObjRadiusAddition) {
                    if (b.mag() === 0) {
                        // 如果重疊，給一個隨機方向
                        const randomAngle = this.p.radians(10);
                        b.set(targetUnit.velocity.x * Math.cos(randomAngle) - targetUnit.velocity.y * Math.sin(randomAngle), targetUnit.velocity.x * Math.sin(randomAngle) + targetUnit.velocity.y * Math.cos(randomAngle));
                    }
                    if (b.mag() < twoObjRadiusAddition) {
                        b.normalize();
                        b.mult(twoObjRadiusAddition);
                    }
                    sum.add(b);
                }
            }
        }
        sum.limit(targetUnit.maxForce);
        return sum;
    }
    // 避開敵人
    avoidEnemies(targetUnit, enemies) {
        // 將敵人視為動態障礙物進行避障
        const enemyObstacles = enemies.map(enemy => ({
            id: enemy.id,
            position: enemy.position,
            radius: enemy.r * 2, // 敵人的避障半徑
            color: { r: 255, g: 0, b: 0 },
            strokeWeight: undefined,
            // 簡化的障礙物方法實作
            checkCollision: (unit) => Vector.dist(enemy.position, unit.position) < (enemy.r + unit.r),
            checkCollisionWithPoint: (point) => Vector.dist(enemy.position, point) < enemy.r,
            checkCollisionWithCircle: (center, radius) => Vector.dist(enemy.position, center) < (enemy.r + radius),
            distanceToPoint: (point) => Math.max(0, Vector.dist(enemy.position, point) - enemy.r),
            distanceToUnit: (unit) => Math.max(0, Vector.dist(enemy.position, unit.position) - enemy.r - unit.r),
            getAvoidanceForce: (unit) => {
                const direction = Vector.sub(this.p, unit.position, enemy.position);
                const distance = direction.mag();
                if (distance === 0)
                    return new Vector(this.p, this.p.random(-1, 1), this.p.random(-1, 1));
                direction.normalize();
                const avoidanceRadius = enemy.r + unit.r + 20;
                if (distance < avoidanceRadius) {
                    const strength = (avoidanceRadius - distance) / avoidanceRadius;
                    direction.mult(strength * unit.maxForce * 2);
                    return direction;
                }
                return new Vector(this.p, 0, 0);
            },
            getClosestPoint: (_point) => enemy.position.copy(),
            getBoundingBox: () => ({
                left: enemy.position.x - enemy.r,
                right: enemy.position.x + enemy.r,
                top: enemy.position.y - enemy.r,
                bottom: enemy.position.y + enemy.r
            }),
            render: () => { },
            isPointInside: (point) => Vector.dist(enemy.position, point) < enemy.r,
            copy: () => enemies[0] // 簡化實作
        }));
        return this.avoid(targetUnit, enemyObstacles);
    }
    // 繪製箭頭（除錯用）
    drawArrow(p, base, vec, color) {
        p.push();
        p.stroke(color);
        p.strokeWeight(3);
        p.fill(color);
        p.translate(base.x, base.y);
        p.line(0, 0, vec.x, vec.y);
        // 計算箭頭方向
        const heading = Math.atan2(vec.y, vec.x);
        p.rotate(heading);
        const arrowSize = 7;
        p.translate(vec.mag() - arrowSize, 0);
        // 繪製箭頭
        p.beginShape();
        p.vertex(0, arrowSize / 2);
        p.vertex(0, -arrowSize / 2);
        p.vertex(arrowSize, 0);
        p.endShape();
        p.pop();
    }
    // 配置方法
    setSeparationWeight(weight) {
        this.config.separationWeight = weight;
    }
    setAlignmentWeight(weight) {
        this.config.alignmentWeight = weight;
    }
    setCohesionWeight(weight) {
        this.config.cohesionWeight = weight;
    }
    setAvoidanceWeight(weight) {
        this.config.avoidanceWeight = weight;
    }
    setDesiredSeparation(distance) {
        this.config.desiredSeparation = distance;
    }
    setNeighborDistance(distance) {
        this.config.neighborDistance = distance;
    }
    setCollisionVisibilityFactor(factor) {
        this.config.collisionVisibilityFactor = factor;
    }
    enableArrows(enable) {
        this.config.showArrows = enable;
    }
    // 取得當前配置
    getConfiguration() {
        return { ...this.config };
    }
    // 更新配置
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
}
//# sourceMappingURL=Flock.js.map