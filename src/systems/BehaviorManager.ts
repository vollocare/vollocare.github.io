// BehaviorManager - 行為管理系統，實作狀態機模式
/// <reference path="../types/p5.d.ts" />

import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IFlockBehavior } from '../interfaces/IFlockBehavior';
import { UnitState } from '../types/common';
import { Flock } from '../models/Flock';

export interface IBehaviorManager {
  // 主要更新方法
  update(units: IUnit[], leader: IUnit, obstacles: IObstacle[], enemies: IUnit[], deltaTime: number): void;
  
  // 狀態轉換方法
  transitionUnitState(unit: IUnit, targetState: UnitState): boolean;
  
  // 行為系統設定
  setFlockBehavior(flockBehavior: IFlockBehavior): void;
  
  // 行為開關
  enableFlockingBehavior(enabled: boolean): void;
  enableCombatBehavior(enabled: boolean): void;
  enableAvoidanceBehavior(enabled: boolean): void;
}

export interface IBehaviorState {
  // 狀態名稱
  readonly stateName: UnitState;
  
  // 狀態進入
  onEnter(unit: IUnit): void;
  
  // 狀態更新
  onUpdate(unit: IUnit, deltaTime: number): void;
  
  // 狀態離開
  onExit(unit: IUnit): void;
  
  // 檢查是否可以轉換到目標狀態
  canTransitionTo(targetState: UnitState): boolean;
}

// 具體的行為狀態實作
class MoveBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.MOVE;
  
  public onEnter(unit: IUnit): void {
    // 設定移動相關參數
    unit.maxSpeed = 2.5;
    unit.color = { r: 100, g: 100, b: 255 }; // 藍色表示移動
  }
  
  public onUpdate(unit: IUnit, _deltaTime: number): void {
    // 移動狀態的更新邏輯
    if (unit.destination) {
      const seekForce = unit.seek(unit.destination);
      unit.applyForce(seekForce);
    }
  }
  
  public onExit(_unit: IUnit): void {
    // 離開移動狀態時的清理
  }
  
  public canTransitionTo(targetState: UnitState): boolean {
    return targetState === UnitState.STOP || 
           targetState === UnitState.FOLLOW || 
           targetState === UnitState.ATTACK ||
           targetState === UnitState.ESCAPE ||
           targetState === UnitState.DIE;
  }
}

class StopBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.STOP;
  
  public onEnter(unit: IUnit): void {
    unit.velocity.mult(0.1); // 快速停止
    unit.color = { r: 200, g: 200, b: 200 }; // 灰色表示停止
  }
  
  public onUpdate(unit: IUnit, _deltaTime: number): void {
    // 停止狀態下緩慢減速
    unit.velocity.mult(0.95);
  }
  
  public onExit(_unit: IUnit): void {
    // 離開停止狀態
  }
  
  public canTransitionTo(targetState: UnitState): boolean {
    return targetState === UnitState.MOVE || 
           targetState === UnitState.FOLLOW || 
           targetState === UnitState.ATTACK ||
           targetState === UnitState.DIE;
  }
}

class FollowBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.FOLLOW;
  
  public onEnter(unit: IUnit): void {
    unit.maxSpeed = 2.0;
    unit.color = { r: 100, g: 255, b: 100 }; // 綠色表示跟隨
  }
  
  public onUpdate(_unit: IUnit, _deltaTime: number): void {
    // 跟隨行為將由 Flock 系統處理
  }
  
  public onExit(_unit: IUnit): void {
    // 離開跟隨狀態
  }
  
  public canTransitionTo(targetState: UnitState): boolean {
    return targetState === UnitState.MOVE || 
           targetState === UnitState.STOP || 
           targetState === UnitState.ATTACK ||
           targetState === UnitState.ESCAPE ||
           targetState === UnitState.DIE;
  }
}

class AttackBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.ATTACK;
  
  public onEnter(unit: IUnit): void {
    unit.maxSpeed = 3.0; // 攻擊時速度較快
    unit.color = { r: 255, g: 100, b: 100 }; // 紅色表示攻擊
  }
  
  public onUpdate(_unit: IUnit, _deltaTime: number): void {
    // 攻擊行為將由專門的攻擊系統處理
  }
  
  public onExit(_unit: IUnit): void {
    // 離開攻擊狀態
  }
  
  public canTransitionTo(targetState: UnitState): boolean {
    return targetState === UnitState.MOVE || 
           targetState === UnitState.FOLLOW || 
           targetState === UnitState.ESCAPE ||
           targetState === UnitState.DIE;
  }
}

class EscapeBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.ESCAPE;
  
  public onEnter(unit: IUnit): void {
    unit.maxSpeed = 4.0; // 逃跑時速度最快
    unit.color = { r: 255, g: 255, b: 100 }; // 黃色表示逃跑
  }
  
  public onUpdate(unit: IUnit, _deltaTime: number): void {
    // 逃跑邏輯：遠離威脅
    if (unit.target) {
      const fleeForce = unit.flee(unit.target);
      unit.applyForce(fleeForce);
    }
  }
  
  public onExit(_unit: IUnit): void {
    // 離開逃跑狀態
  }
  
  public canTransitionTo(targetState: UnitState): boolean {
    return targetState === UnitState.MOVE || 
           targetState === UnitState.FOLLOW || 
           targetState === UnitState.ATTACK ||
           targetState === UnitState.DIE;
  }
}

class DieBehaviorState implements IBehaviorState {
  public readonly stateName = UnitState.DIE;
  
  public onEnter(unit: IUnit): void {
    unit.isAlive = false;
    unit.velocity.mult(0);
    unit.color = { r: 100, g: 100, b: 100, a: 128 }; // 半透明灰色表示死亡
  }
  
  public onUpdate(_unit: IUnit, _deltaTime: number): void {
    // 死亡狀態不進行任何更新
  }
  
  public onExit(_unit: IUnit): void {
    // 死亡是終極狀態，不應該離開
  }
  
  public canTransitionTo(_targetState: UnitState): boolean {
    return false; // 死亡狀態無法轉換到其他狀態
  }
}

export class BehaviorManager implements IBehaviorManager {
  // private _p: p5Instance; // 暫時未使用，但保留供未來擴展
  private flockBehavior: IFlockBehavior;
  private behaviorStates: Map<UnitState, IBehaviorState>;
  
  // 行為系統開關
  private flockingEnabled: boolean = true;
  private combatEnabled: boolean = true;
  private avoidanceEnabled: boolean = true;
  
  constructor(p: p5Instance) {
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
  public update(units: IUnit[], leader: IUnit, obstacles: IObstacle[], enemies: IUnit[], deltaTime: number): void {
    // 更新所有單位的狀態
    for (const unit of units) {
      if (!unit.isAlive) continue;
      
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
  public transitionUnitState(unit: IUnit, targetState: UnitState): boolean {
    if (unit.state === targetState) return true;
    
    const currentState = this.behaviorStates.get(unit.state);
    const targetStateObj = this.behaviorStates.get(targetState);
    
    if (!currentState || !targetStateObj) return false;
    
    // 檢查是否可以轉換
    if (!currentState.canTransitionTo(targetState)) return false;
    if (!unit.canTransitionTo(targetState)) return false;
    
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
  private checkAutomaticTransitions(unit: IUnit, enemies: IUnit[]): void {
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
  private processCombatBehavior(units: IUnit[], enemies: IUnit[]): void {
    for (const unit of units) {
      if (!unit.isAlive || unit.state !== UnitState.ATTACK) continue;
      
      // 尋找攻擊目標
      const target = this.findBestAttackTarget(unit, enemies);
      if (target) {
        // 檢查是否在攻擊範圍內
        if (unit.isInAttackRange(target)) {
          unit.attack(target);
        } else {
          // 移向目標
          const seekForce = unit.seek(target.position);
          unit.applyForce(seekForce);
        }
      }
    }
  }
  
  // 尋找最近的敵人
  private findNearestEnemy(unit: IUnit, enemies: IUnit[]): IUnit | null {
    if (enemies.length === 0) return null;
    
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
  private findBestAttackTarget(unit: IUnit, enemies: IUnit[]): IUnit | null {
    const aliveEnemies = enemies.filter(enemy => enemy.isAlive);
    if (aliveEnemies.length === 0) return null;
    
    // 優先攻擊最近的敵人
    return this.findNearestEnemy(unit, aliveEnemies);
  }
  
  // 設定方法
  public setFlockBehavior(flockBehavior: IFlockBehavior): void {
    this.flockBehavior = flockBehavior;
  }
  
  public enableFlockingBehavior(enabled: boolean): void {
    this.flockingEnabled = enabled;
  }
  
  public enableCombatBehavior(enabled: boolean): void {
    this.combatEnabled = enabled;
  }
  
  public enableAvoidanceBehavior(enabled: boolean): void {
    this.avoidanceEnabled = enabled;
  }
  
  // 取得狀態統計
  public getStateStatistics(units: IUnit[]): Map<UnitState, number> {
    const stats = new Map<UnitState, number>();
    
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
  public transitionUnitsToState(units: IUnit[], targetState: UnitState): number {
    let successCount = 0;
    
    for (const unit of units) {
      if (this.transitionUnitState(unit, targetState)) {
        successCount++;
      }
    }
    
    return successCount;
  }
  
  // 取得行為系統狀態
  public getSystemStatus(): {
    flockingEnabled: boolean;
    combatEnabled: boolean;
    avoidanceEnabled: boolean;
  } {
    return {
      flockingEnabled: this.flockingEnabled,
      combatEnabled: this.combatEnabled,
      avoidanceEnabled: this.avoidanceEnabled
    };
  }
}