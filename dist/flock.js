"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flock = void 0;
require("./globals");
class Flock {
    constructor() { }
    run(Leader, unitObjs, obstacles, enemy_unitObjs) {
        for (let i = 0; i < unitObjs.length; i++) {
            if (unitObjs[i].isFollow()) {
                const sep = this.separate(Leader, unitObjs[i], unitObjs);
                const ali = this.align(Leader, unitObjs[i], unitObjs);
                const coh = this.cohesion(Leader, unitObjs[i], unitObjs);
                const avo = this.avoid(unitObjs[i], obstacles);
                const avo_enemy = this.avoid(unitObjs[i], enemy_unitObjs);
                sep.mult(2.2);
                ali.mult(1.0);
                coh.mult(1.0);
                unitObjs[i].applyForce(sep);
                unitObjs[i].applyForce(ali);
                unitObjs[i].applyForce(coh);
                if (avo.mag() > 0) {
                    if (window.showArrows) {
                        const avoArrow = avo.copy();
                        avoArrow.mult(1000);
                        this.drawArrow(unitObjs[i].position, avoArrow, 'white');
                    }
                    avo.mult(2.0);
                    unitObjs[i].applyForce(avo);
                }
                if (avo_enemy.mag() > 0) {
                    if (window.showArrows) {
                        const avoEnemyArrow = avo_enemy.copy();
                        avoEnemyArrow.mult(1000);
                        this.drawArrow(unitObjs[i].position, avoEnemyArrow, 'purple');
                    }
                    avo_enemy.mult(2.0);
                    unitObjs[i].applyForce(avo_enemy);
                }
            }
            if (unitObjs[i].isAttack()) {
                const sep = this.separate(Leader, unitObjs[i], unitObjs);
                const coh = this.cohesion(Leader, unitObjs[i], unitObjs);
                const avo = this.avoid(unitObjs[i], obstacles);
                const avo_enemy = this.avoid(unitObjs[i], enemy_unitObjs);
                sep.mult(1.2);
                coh.mult(1.0);
                unitObjs[i].applyForce(sep);
                unitObjs[i].applyForce(coh);
                if (avo.mag() > 0) {
                    if (window.showArrows) {
                        const avoArrow = avo.copy();
                        avoArrow.mult(1000);
                        this.drawArrow(unitObjs[i].position, avoArrow, 'white');
                    }
                    avo.mult(2.0);
                    unitObjs[i].applyForce(avo);
                }
                if (avo_enemy.mag() > 0) {
                    if (window.showArrows) {
                        const avoEnemyArrow = avo_enemy.copy();
                        avoEnemyArrow.mult(1000);
                        this.drawArrow(unitObjs[i].position, avoEnemyArrow, 'purple');
                    }
                    avo_enemy.mult(2.0);
                    unitObjs[i].applyForce(avo_enemy);
                }
            }
        }
        if (Leader.isMove()) {
            const avo = this.avoid(Leader, obstacles);
            if (avo.mag() > 0) {
                if (window.showArrows) {
                    const leaderAvoArrow = avo.copy();
                    leaderAvoArrow.mult(1000);
                    this.drawArrow(Leader.position, leaderAvoArrow, 'white');
                }
                Leader.applyForce(avo);
            }
        }
        const desiredseparation = 10.0;
        if (!Leader.isMove()) {
            const sum = window.createVector(0, 0);
            for (let i = 0; i < unitObjs.length; i++) {
                sum.add(unitObjs[i].position);
            }
            if (unitObjs.length > 0) {
                sum.div(unitObjs.length);
            }
            const d = Leader.position.dist(sum);
            if (d < desiredseparation) {
                for (let i = 0; i < unitObjs.length; i++) {
                    if (!unitObjs[i].isAttack()) {
                        unitObjs[i].setStop();
                    }
                }
            }
        }
    }
    separate(Leader, targetUnitObj, unitObjs) {
        const desiredseparation = 25.0;
        const steer = window.createVector(0, 0);
        let count = 0;
        const diff = targetUnitObj.position.copy();
        diff.sub(Leader.position);
        const d = targetUnitObj.position.dist(Leader.position);
        if (d < desiredseparation) {
            diff.normalize();
            if (d !== 0) {
                diff.div(d);
            }
            steer.add(diff);
            count = 1;
        }
        for (let i = 0; i < unitObjs.length; i++) {
            const d = targetUnitObj.position.dist(unitObjs[i].position);
            if (d > 0 && d < desiredseparation) {
                const diff = targetUnitObj.position.copy();
                diff.sub(unitObjs[i].position);
                diff.normalize();
                if (d !== 0) {
                    diff.div(d);
                }
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(targetUnitObj.maxspeed);
            steer.sub(targetUnitObj.velocity);
            steer.limit(targetUnitObj.maxforce);
        }
        return steer;
    }
    align(Leader, targetUnitObj, unitObjs) {
        const sum = window.createVector(0, 0);
        let count = 1;
        const neighbordist = 30;
        const d = targetUnitObj.position.dist(Leader.position);
        if (d > neighbordist) {
            return window.createVector(0, 0);
        }
        sum.add(Leader.direction);
        for (let i = 0; i < unitObjs.length; i++) {
            const d = targetUnitObj.position.dist(unitObjs[i].position);
            if (d > 0) {
                sum.add(unitObjs[i].velocity);
                count++;
            }
        }
        sum.div(count);
        sum.normalize();
        sum.mult(targetUnitObj.maxspeed);
        const steer = sum.copy();
        steer.sub(targetUnitObj.velocity);
        steer.limit(targetUnitObj.maxforce);
        return steer;
    }
    cohesion(Leader, targetUnitObj, unitObjs) {
        const sum = window.createVector(0, 0);
        const count = 1;
        sum.add(Leader.position);
        return targetUnitObj.seek(sum);
    }
    avoid(targetUnitObj, obstacles) {
        const _COLLISION_VISIBILITY_FACTOR = 6;
        const sum = window.createVector(0, 0);
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            const dist = obstacle.position.dist(targetUnitObj.position);
            const vLength = targetUnitObj.velocity.mag() * _COLLISION_VISIBILITY_FACTOR;
            if ((vLength + obstacle.r + targetUnitObj.r) >= dist) {
                const a = obstacle.position.copy();
                a.sub(targetUnitObj.position);
                const v = targetUnitObj.velocity.copy();
                v.mult(_COLLISION_VISIBILITY_FACTOR);
                v.normalize();
                v.mult(a.mag());
                const b = v.copy();
                b.sub(a);
                const twoObj_radius_addition = obstacle.r + targetUnitObj.r;
                if (b.mag() <= twoObj_radius_addition) {
                    if (b.mag() === 0) {
                        const rotatedV = targetUnitObj.velocity.copy();
                        rotatedV.rotate(10);
                        b.add(rotatedV);
                    }
                    if (b.mag() < twoObj_radius_addition) {
                        b.normalize();
                        b.mult(twoObj_radius_addition);
                    }
                    sum.add(b);
                }
            }
        }
        sum.limit(targetUnitObj.maxforce);
        return sum;
    }
    drawArrow(base, vec, myColor) {
        window.push();
        window.stroke(myColor);
        window.strokeWeight(3);
        window.fill(myColor);
        window.translate(base.x, base.y);
        window.line(0, 0, vec.x, vec.y);
        window.rotate(vec.heading());
        const arrowSize = 7;
        window.translate(vec.mag() - arrowSize, 0);
        window.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        window.pop();
    }
}
exports.Flock = Flock;
