// Unit 類別 - 單位實體實作
/// <reference path="../types/p5.d.ts" />
import { UnitState } from '../types/common';
import { Vector } from '../utils/Vector';
import { AttackVFX } from './AttackVFX';
export class Unit {
    constructor(p, x, y, groupId = 1) {
        this.p = p;
        this.id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // 初始化基本屬性
        this.position = new Vector(p, x, y);
        this.velocity = new Vector(p, p.random(-1, 1), p.random(-1, 1));
        this.acceleration = new Vector(p, 0, 0);
        this.direction = this.velocity.copy();
        this.destination = new Vector(p, x, y);
        // 物理屬性
        this.baseRadius = 2.0;
        this.r = 6.0;
        this.maxSpeed = 1;
        this.maxForce = 0.05;
        this.approachRange = this.maxSpeed + 0.5;
        // 生命系統
        this.health = 12;
        this.maxHealth = 12;
        this.life = 2880; // 兩分鐘
        this.isAlive = true;
        this.healthRecoveryCooldown = 0;
        // 狀態管理
        this.state = UnitState.MOVE;
        this.previousState = UnitState.STOP;
        this.stateChangeTime = Date.now();
        // 攻擊系統
        this.attackConfig = {
            damage: 1,
            range: 60,
            cooldown: 30,
            duration: 10
        };
        this.lastAttackTime = 0;
        this.canAttack = true;
        this.attackUnit = null;
        this.attackVisibleDistance = 120;
        this.attackRange = this.attackConfig.range;
        this.attackVFX = null;
        // 視覺屬性
        this.color = { r: 127, g: 127, b: 127 };
        // 群組相關
        this.groupId = groupId;
        this.isLeader = false;
        this.unitType = 0;
        this.p1p2 = groupId;
    }
    // 生命週期方法
    update(deltaTime) {
        // 生命減少 (leader 不會死亡)
        if (this.unitType !== 1) {
            this.life -= 1;
        }
        if (this.life <= 0) {
            this.health = 0;
            this.isAlive = false;
            if (this.state !== UnitState.DIE) {
                this.setState(UnitState.DIE);
            }
            return;
        }
        // 計算最高血量
        this.maxHealth = Math.floor(this.life / 288) + 2;
        // 回復血量
        if (this.health < this.maxHealth) {
            this.healthRecoveryCooldown--;
            if (this.healthRecoveryCooldown <= 0) {
                this.healthRecoveryCooldown = 150;
                this.health++;
            }
        }
        // 血量上限檢查
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        // 計算當前半徑
        if (this.unitType === 1) {
            this.r = this.baseRadius + 1;
        }
        else {
            this.r = this.health / 3 + this.baseRadius;
        }
        // 根據狀態更新
        this.updateByState(deltaTime);
        // 更新攻擊特效
        if (this.attackVFX && this.attackVFX.isExpired()) {
            this.attackVFX = null;
        }
    }
    updateByState(deltaTime) {
        switch (this.state) {
            case UnitState.MOVE:
                this.updateMoveState(deltaTime);
                break;
            case UnitState.FOLLOW:
                this.updateFollowState(deltaTime);
                break;
            case UnitState.ATTACK:
                this.updateAttackState(deltaTime);
                break;
            case UnitState.STOP:
                // 停止狀態不需要更新位置
                break;
            case UnitState.DIE:
                // 死亡狀態
                break;
        }
    }
    updateMoveState(_deltaTime) {
        if (this.acceleration.mag() === 0 && this.destination) {
            this.applyForce(this.seek(this.destination));
        }
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
        // 檢查是否到達目標
        if (this.destination) {
            const distance = Vector.dist(this.position, this.destination);
            if (distance <= this.approachRange) {
                this.setState(UnitState.STOP);
            }
        }
    }
    updateFollowState(_deltaTime) {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
    }
    updateAttackState(_deltaTime) {
        // PVP 模式檢查
        // TODO: 從遊戲狀態獲取 isPVP 狀態
        const isPVP = true; // 暫時設為 true
        if (!isPVP) {
            this.attackUnit = null;
            this.setState(UnitState.FOLLOW);
            return;
        }
        if (!this.attackUnit) {
            this.setState(UnitState.FOLLOW);
            return;
        }
        // 攻擊冷卻
        if (this.lastAttackTime > 0) {
            this.lastAttackTime--;
        }
        else {
            const distance = Vector.dist(this.attackUnit.position, this.position);
            if (distance <= this.attackRange && this.lastAttackTime <= 0 && isPVP) {
                this.performAttack(this.attackUnit);
            }
            else if (distance > this.attackVisibleDistance) {
                this.attackUnit = null;
            }
        }
        // 檢查目標是否死亡
        if (this.attackUnit && !this.attackUnit.isAlive) {
            this.attackUnit = null;
        }
        if (!this.attackUnit) {
            this.setState(UnitState.FOLLOW);
            return;
        }
        // 計算攻擊策略位置
        let targetPosition = this.attackUnit.position;
        const distance = Vector.dist(this.attackUnit.position, this.position);
        const directionToTarget = Vector.sub(this.p, this.attackUnit.position, this.position);
        if (this.health <= 6) {
            // 血量低時逃跑
            const escapeDirection = directionToTarget.copy().rotate(Math.PI);
            targetPosition = Vector.add(this.p, this.position, escapeDirection);
        }
        else if (this.lastAttackTime > 0 && distance < this.attackRange * 1.5) {
            // 攻擊冷卻時保持距離
            const sideDirection = directionToTarget.copy().rotate(0.44); // 約 25 度
            targetPosition = Vector.add(this.p, this.position, sideDirection);
        }
        this.applyForce(this.seek(targetPosition));
        // 更新物理
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
    }
    performAttack(target) {
        this.lastAttackTime = this.attackConfig.cooldown;
        const attackDirection = Vector.sub(this.p, target.position, this.position);
        this.attackVFX = new AttackVFX(this.p, this.position, attackDirection, 'red');
        target.takeDamage(this.attackConfig.damage, this);
    }
    render(p) {
        const theta = this.direction.heading() + p.radians(90);
        // 設定顏色
        p.fill(127);
        p.stroke(200);
        const colors = [
            { r: 154, g: 206, b: 167 },
            { r: 58, g: 126, b: 76 },
            'orange',
            'yellow',
            'green',
            'blue',
            'indigo',
            'violet'
        ];
        if (this.p1p2 !== 1) {
            const colorIndex = (this.p1p2 - 2) % colors.length;
            const selectedColor = colors[colorIndex];
            if (typeof selectedColor === 'string') {
                p.fill(selectedColor);
            }
            else {
                p.fill(selectedColor.r, selectedColor.g, selectedColor.b);
            }
        }
        if (this.unitType === 1) {
            p.stroke('red');
        }
        // 繪製三角形
        p.push();
        p.translate(this.position.x, this.position.y);
        p.rotate(theta);
        p.beginShape();
        p.vertex(0, -this.r * 2);
        p.vertex(-this.r, this.r * 2);
        p.vertex(this.r, this.r * 2);
        p.endShape(p.CLOSE);
        p.pop();
        // 繪製攻擊特效
        if (this.attackVFX) {
            this.attackVFX.draw();
        }
    }
    // 狀態管理方法
    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
            this.stateChangeTime = Date.now();
            this.onStateChanged?.(this.previousState, newState);
        }
    }
    canTransitionTo(_targetState) {
        // 死亡狀態不能轉換到其他狀態
        if (this.state === UnitState.DIE) {
            return false;
        }
        // 其他狀態轉換邏輯
        return true;
    }
    // 移動方法
    seek(target) {
        const desired = Vector.sub(this.p, target, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    flee(target) {
        const desired = Vector.sub(this.p, this.position, target);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    arrive(target, slowingRadius = 50) {
        const desired = Vector.sub(this.p, target, this.position);
        const distance = desired.mag();
        desired.normalize();
        if (distance < slowingRadius) {
            const speed = this.maxSpeed * (distance / slowingRadius);
            desired.mult(speed);
        }
        else {
            desired.mult(this.maxSpeed);
        }
        const steer = Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    // 攻擊方法
    attack(target) {
        if (!this.canAttack || this.lastAttackTime > 0) {
            return false;
        }
        if (this.isInAttackRange(target)) {
            this.setAttack(target);
            return true;
        }
        return false;
    }
    takeDamage(damage, _source) {
        const oldHealth = this.health;
        this.health = Math.max(0, this.health - damage);
        this.onHealthChanged?.(oldHealth, this.health);
        if (this.health <= 0 && this.isAlive) {
            this.isAlive = false;
            this.setState(UnitState.DIE);
            this.onDeath?.();
        }
    }
    isInAttackRange(target) {
        const distance = Vector.dist(this.position, target.position);
        return distance <= this.attackRange;
    }
    // 工具方法
    distanceTo(target) {
        const targetPos = 'position' in target ? target.position : target;
        return Vector.dist(this.position, targetPos);
    }
    angleTo(target) {
        const targetPos = 'position' in target ? target.position : target;
        const direction = Vector.sub(this.p, targetPos, this.position);
        return direction.heading();
    }
    copy() {
        const newUnit = new Unit(this.p, this.position.x, this.position.y, this.groupId);
        // 複製其他屬性...
        return newUnit;
    }
    // 增加力
    applyForce(force) {
        this.acceleration.add(force);
    }
    // 設定力
    setForce(force) {
        this.acceleration = force;
    }
    // 設定目標
    setDestination(target) {
        this.destination = target;
        this.velocity = this.direction.copy();
        this.setState(UnitState.MOVE);
    }
    // 設定跟隨
    setFollow() {
        this.setState(UnitState.FOLLOW);
    }
    // 設定停止
    setStop() {
        if (this.state === UnitState.FOLLOW || this.state === UnitState.MOVE) {
            this.direction = this.velocity.copy();
            this.velocity.mult(0);
            this.setState(UnitState.STOP);
        }
    }
    // 設定攻擊
    setAttack(enemyUnit) {
        this.attackUnit = enemyUnit;
        this.setState(UnitState.ATTACK);
    }
    // 狀態檢查方法
    isMove() {
        return this.state === UnitState.MOVE;
    }
    isFollow() {
        return this.state === UnitState.FOLLOW;
    }
    isAttacking() {
        return this.state === UnitState.ATTACK;
    }
    // 設定 leader
    setAsLeader() {
        this.isLeader = true;
        this.unitType = 1;
    }
}
//# sourceMappingURL=Unit.js.map