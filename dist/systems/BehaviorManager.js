// BehaviorManager - 行為管理系統，實作狀態機模式
/// <reference path="../types/p5.d.ts" />
import { UnitState } from '../types/common';
import { Flock } from '../models/Flock';
// 具體的行為狀態實作
class MoveBehaviorState {
    constructor() {
        this.stateName = UnitState.MOVE;
    }
    onEnter(unit) {
        // 設定移動相關參數
        unit.maxSpeed = 2.5;
        unit.color = { r: 100, g: 100, b: 255 }; // 藍色表示移動
    }
    onUpdate(unit, _deltaTime) {
        // 移動狀態的更新邏輯
        if (unit.destination) {
            const seekForce = unit.seek(unit.destination);
            unit.applyForce(seekForce);
        }
    }
    onExit(_unit) {
        // 離開移動狀態時的清理
    }
    canTransitionTo(targetState) {
        return targetState === UnitState.STOP ||
            targetState === UnitState.FOLLOW ||
            targetState === UnitState.ATTACK ||
            targetState === UnitState.ESCAPE ||
            targetState === UnitState.DIE;
    }
}
class StopBehaviorState {
    constructor() {
        this.stateName = UnitState.STOP;
    }
    onEnter(unit) {
        unit.velocity.mult(0.1); // 快速停止
        unit.color = { r: 200, g: 200, b: 200 }; // 灰色表示停止
    }
    onUpdate(unit, _deltaTime) {
        // 停止狀態下緩慢減速
        unit.velocity.mult(0.95);
    }
    onExit(_unit) {
        // 離開停止狀態
    }
    canTransitionTo(targetState) {
        return targetState === UnitState.MOVE ||
            targetState === UnitState.FOLLOW ||
            targetState === UnitState.ATTACK ||
            targetState === UnitState.DIE;
    }
}
class FollowBehaviorState {
    constructor() {
        this.stateName = UnitState.FOLLOW;
    }
    onEnter(unit) {
        unit.maxSpeed = 2.0;
        unit.color = { r: 100, g: 255, b: 100 }; // 綠色表示跟隨
    }
    onUpdate(_unit, _deltaTime) {
        // 跟隨行為將由 Flock 系統處理
    }
    onExit(_unit) {
        // 離開跟隨狀態
    }
    canTransitionTo(targetState) {
        return targetState === UnitState.MOVE ||
            targetState === UnitState.STOP ||
            targetState === UnitState.ATTACK ||
            targetState === UnitState.ESCAPE ||
            targetState === UnitState.DIE;
    }
}
class AttackBehaviorState {
    constructor() {
        this.stateName = UnitState.ATTACK;
    }
    onEnter(unit) {
        unit.maxSpeed = 3.0; // 攻擊時速度較快
        unit.color = { r: 255, g: 100, b: 100 }; // 紅色表示攻擊
    }
    onUpdate(_unit, _deltaTime) {
        // 攻擊行為將由專門的攻擊系統處理
    }
    onExit(_unit) {
        // 離開攻擊狀態
    }
    canTransitionTo(targetState) {
        return targetState === UnitState.MOVE ||
            targetState === UnitState.FOLLOW ||
            targetState === UnitState.ESCAPE ||
            targetState === UnitState.DIE;
    }
}
class EscapeBehaviorState {
    constructor() {
        this.stateName = UnitState.ESCAPE;
    }
    onEnter(unit) {
        unit.maxSpeed = 4.0; // 逃跑時速度最快
        unit.color = { r: 255, g: 255, b: 100 }; // 黃色表示逃跑
    }
    onUpdate(unit, _deltaTime) {
        // 逃跑邏輯：遠離威脅
        if (unit.target) {
            const fleeForce = unit.flee(unit.target);
            unit.applyForce(fleeForce);
        }
    }
    onExit(_unit) {
        // 離開逃跑狀態
    }
    canTransitionTo(targetState) {
        return targetState === UnitState.MOVE ||
            targetState === UnitState.FOLLOW ||
            targetState === UnitState.ATTACK ||
            targetState === UnitState.DIE;
    }
}
class DieBehaviorState {
    constructor() {
        this.stateName = UnitState.DIE;
    }
    onEnter(unit) {
        unit.isAlive = false;
        unit.velocity.mult(0);
        unit.color = { r: 100, g: 100, b: 100, a: 128 }; // 半透明灰色表示死亡
    }
    onUpdate(_unit, _deltaTime) {
        // 死亡狀態不進行任何更新
    }
    onExit(_unit) {
        // 死亡是終極狀態，不應該離開
    }
    canTransitionTo(_targetState) {
        return false; // 死亡狀態無法轉換到其他狀態
    }
}
export class BehaviorManager {
    constructor(p) {
        // 行為系統開關
        this.flockingEnabled = true;
        this.combatEnabled = true;
        this.avoidanceEnabled = true;
        // this._p = p;
        this.flockBehavior = new Flock(p);
        // 初始化所有行為狀態
        this.behaviorStates = new Map();
        this.behaviorStates.set(UnitState.MOVE, new MoveBehaviorState());
        this.behaviorStates.set(UnitState.STOP, new StopBehaviorState());
        this.behaviorStates.set(UnitState.FOLLOW, new FollowBehaviorState());
        this.behaviorStates.set(UnitState.ATTACK, new AttackBehaviorState());
        this.behaviorStates.set(UnitState.ESCAPE, new EscapeBehaviorState());
        this.behaviorStates.set(UnitState.DIE, new DieBehaviorState());
    }
    // 主要更新方法
    update(units, leader, obstacles, enemies, deltaTime) {
        // 更新所有單位的狀態
        for (const unit of units) {
            if (!unit.isAlive)
                continue;
            // 更新當前狀態
            const currentState = this.behaviorStates.get(unit.state);
            if (currentState) {
                currentState.onUpdate(unit, deltaTime);
            }
            // 檢查自動狀態轉換
            this.checkAutomaticTransitions(unit, enemies);
        }
        // 應用群體行為
        if (this.flockingEnabled) {
            this.flockBehavior.run(leader, units, obstacles, enemies);
        }
        // 處理戰鬥行為
        if (this.combatEnabled) {
            this.processCombatBehavior(units, enemies);
        }
    }
    // 狀態轉換方法
    transitionUnitState(unit, targetState) {
        if (unit.state === targetState)
            return true;
        const currentState = this.behaviorStates.get(unit.state);
        const targetStateObj = this.behaviorStates.get(targetState);
        if (!currentState || !targetStateObj)
            return false;
        // 檢查是否可以轉換
        if (!currentState.canTransitionTo(targetState))
            return false;
        if (!unit.canTransitionTo(targetState))
            return false;
        // 執行狀態轉換
        currentState.onExit(unit);
        const previousState = unit.state;
        unit.setState(targetState);
        targetStateObj.onEnter(unit);
        // 觸發狀態變更事件
        if (unit.onStateChanged) {
            unit.onStateChanged(previousState, targetState);
        }
        return true;
    }
    // 檢查自動狀態轉換
    checkAutomaticTransitions(unit, enemies) {
        if (!unit.isAlive) {
            this.transitionUnitState(unit, UnitState.DIE);
            return;
        }
        // 檢查生命值是否過低，需要逃跑
        if (unit.health < unit.maxHealth * 0.3 && unit.state !== UnitState.ESCAPE) {
            // 尋找最近的敵人作為逃跑目標
            const nearestEnemy = this.findNearestEnemy(unit, enemies);
            if (nearestEnemy && unit.distanceTo(nearestEnemy) < 100) {
                unit.target = nearestEnemy.position;
                this.transitionUnitState(unit, UnitState.ESCAPE);
            }
        }
        // 檢查是否需要從逃跑狀態恢復
        if (unit.state === UnitState.ESCAPE && unit.health > unit.maxHealth * 0.7) {
            this.transitionUnitState(unit, UnitState.FOLLOW);
        }
    }
    // 處理戰鬥行為
    processCombatBehavior(units, enemies) {
        for (const unit of units) {
            if (!unit.isAlive || unit.state !== UnitState.ATTACK)
                continue;
            // 尋找攻擊目標
            const target = this.findBestAttackTarget(unit, enemies);
            if (target) {
                // 檢查是否在攻擊範圍內
                if (unit.isInAttackRange(target)) {
                    unit.attack(target);
                }
                else {
                    // 移向目標
                    const seekForce = unit.seek(target.position);
                    unit.applyForce(seekForce);
                }
            }
        }
    }
    // 尋找最近的敵人
    findNearestEnemy(unit, enemies) {
        if (enemies.length === 0)
            return null;
        let nearestEnemy = enemies[0];
        let minDistance = unit.distanceTo(nearestEnemy);
        for (let i = 1; i < enemies.length; i++) {
            const distance = unit.distanceTo(enemies[i]);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemies[i];
            }
        }
        return nearestEnemy;
    }
    // 尋找最佳攻擊目標
    findBestAttackTarget(unit, enemies) {
        const aliveEnemies = enemies.filter(enemy => enemy.isAlive);
        if (aliveEnemies.length === 0)
            return null;
        // 優先攻擊最近的敵人
        return this.findNearestEnemy(unit, aliveEnemies);
    }
    // 設定方法
    setFlockBehavior(flockBehavior) {
        this.flockBehavior = flockBehavior;
    }
    enableFlockingBehavior(enabled) {
        this.flockingEnabled = enabled;
    }
    enableCombatBehavior(enabled) {
        this.combatEnabled = enabled;
    }
    enableAvoidanceBehavior(enabled) {
        this.avoidanceEnabled = enabled;
    }
    // 取得狀態統計
    getStateStatistics(units) {
        const stats = new Map();
        // 初始化計數器
        Object.values(UnitState).forEach(state => {
            if (typeof state === 'number') {
                stats.set(state, 0);
            }
        });
        // 統計各狀態的單位數量
        for (const unit of units) {
            const currentCount = stats.get(unit.state) || 0;
            stats.set(unit.state, currentCount + 1);
        }
        return stats;
    }
    // 批量狀態轉換
    transitionUnitsToState(units, targetState) {
        let successCount = 0;
        for (const unit of units) {
            if (this.transitionUnitState(unit, targetState)) {
                successCount++;
            }
        }
        return successCount;
    }
    // 取得行為系統狀態
    getSystemStatus() {
        return {
            flockingEnabled: this.flockingEnabled,
            combatEnabled: this.combatEnabled,
            avoidanceEnabled: this.avoidanceEnabled
        };
    }
}
//# sourceMappingURL=BehaviorManager.js.map