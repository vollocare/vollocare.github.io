// GroupUnit 類別 - 單位群組管理
/// <reference path="../types/p5.d.ts" />

import { IUnit } from '../interfaces/IUnit';
import { IGroupUnit } from '../interfaces/IGroupUnit';
import { IVector } from '../types/vector';
import { Unit } from './Unit';
import { Vector } from '../utils/Vector';

export interface ITextRenderer {
  text(str: string, x: number, y: number): void;
}

export class GroupUnit implements IGroupUnit {
  public readonly id: number;
  public readonly groupId: number;
  
  private p: p5Instance;
  private unitObjs: IUnit[];
  private leader: IUnit;
  private destination: IVector | null = null;
  
  constructor(p: p5Instance, groupId: number, x: number = 0, y: number = 0) {
    this.p = p;
    this.id = Date.now() + Math.random(); // 唯一 ID
    this.groupId = groupId;
    this.unitObjs = [];
    
    // 創建領導單位
    this.leader = new Unit(p, x, y, groupId);
    this.leader.setAsLeader();
  }
  
  // 原有的更新方法（保留供向後相容）
  public updateWithEnemies(enemyUnits: IUnit[], deltaTime: number = 1, isPVP: boolean = false): void {
    // 更新領導單位
    this.leader.update(deltaTime);
    
    // 更新所有單位
    for (let i = this.unitObjs.length - 1; i >= 0; i--) {
      const unit = this.unitObjs[i];
      
      // 移除死亡單位
      if (!unit.isAlive || unit.health <= 0) {
        this.unitObjs.splice(i, 1);
        continue;
      }
      
      // 攻擊目標管理
      this.manageAttackTarget(unit, enemyUnits, isPVP);
      
      // 更新單位
      unit.update(deltaTime);
    }
  }
  
  private manageAttackTarget(unit: IUnit, enemyUnits: IUnit[], isPVP: boolean): void {
    // 檢查現有攻擊目標是否有效
    const currentTarget = (unit as any).attackUnit;
    
    // 清理無效目標
    if (currentTarget) {
      if (!currentTarget.isAlive || currentTarget.health <= 0) {
        (unit as any).attackUnit = null;
      } else {
        // 檢查距離是否過遠
        const distance = Vector.dist(currentTarget.position, unit.position);
        const visibleDistance = (unit as any).attackVisibleDistance || 120;
        if (distance > visibleDistance / 2) {
          (unit as any).attackUnit = null;
        }
      }
    }
    
    // PVP 模式下的目標管理
    if (!isPVP && (unit as any).attackUnit) {
      (unit as any).attackUnit = null;
      unit.setFollow();
    }
    
    // 在 PVP 模式下尋找新目標
    if (!(unit as any).attackUnit && isPVP) {
      this.findNewTarget(unit, enemyUnits);
    }
  }
  
  private findNewTarget(unit: IUnit, enemyUnits: IUnit[]): void {
    let minDistance = Number.MAX_VALUE;
    let closestEnemy: IUnit | null = null;
    const visibleDistance = (unit as any).attackVisibleDistance || 120;
    
    for (const enemy of enemyUnits) {
      if (enemy.isAlive && enemy.health > 0) {
        const distance = Vector.dist(enemy.position, unit.position);
        
        if (distance < visibleDistance && distance < minDistance) {
          minDistance = distance;
          closestEnemy = enemy;
        }
      }
    }
    
    if (closestEnemy) {
      unit.setAttack(closestEnemy);
    }
  }
  
  // 舊版本的 render 方法（向後相容）
  public renderWithText(p: p5Instance, textRenderer?: ITextRenderer): void {
    // 使用新的 render 方法
    this.render(p);
    
    // 如果需要文字渲染
    if (textRenderer) {
      textRenderer.text(this.groupId.toString(), this.leader.position.x + 10, this.leader.position.y);
    }
  }
  
  public setDestination(target: IVector): void {
    this.destination = target;
    
    // 設定領導單位目標
    this.leader.setDestination(target);
    
    // 設定所有非攻擊狀態的單位為跟隨模式
    for (const unit of this.unitObjs) {
      if (!unit.isAttacking()) {
        unit.setFollow();
      }
    }
  }
  
  public add(x: number, y: number): void {
    const newUnit = new Unit(this.p, x, y, this.groupId);
    newUnit.setFollow();
    this.unitObjs.push(newUnit);
  }
  
  // IGroupUnit 介面實作
  public addUnit(x: number, y: number): IUnit {
    const newUnit = new Unit(this.p, x, y, this.groupId);
    newUnit.setFollow();
    this.unitObjs.push(newUnit);
    return newUnit;
  }
  
  public getDestination(): IVector | null {
    return this.destination;
  }
  
  public update(deltaTime: number): void {
    // 更新領導單位
    this.leader.update(deltaTime);
    
    // 更新所有單位
    for (let i = this.unitObjs.length - 1; i >= 0; i--) {
      const unit = this.unitObjs[i];
      
      // 移除死亡單位
      if (!unit.isAlive || unit.health <= 0) {
        this.unitObjs.splice(i, 1);
        continue;
      }
      
      // 更新單位
      unit.update(deltaTime);
    }
  }
  
  public render(p: p5Instance): void {
    // 渲染領導單位
    this.leader.render(p);
    
    // 渲染所有單位
    for (const unit of this.unitObjs) {
      unit.render(p);
    }
  }
  
  public isActive(): boolean {
    return this.leader.isAlive;
  }
  
  public getAveragePosition(): IVector {
    return this.getGroupCenter();
  }
  
  public getBounds(): { min: IVector; max: IVector } {
    if (this.unitObjs.length === 0) {
      const pos = this.leader.position;
      const radius = this.leader.r;
      return {
        min: new Vector(this.p, pos.x - radius, pos.y - radius),
        max: new Vector(this.p, pos.x + radius, pos.y + radius)
      };
    }
    
    const allUnits = [this.leader, ...this.unitObjs];
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const unit of allUnits) {
      const radius = unit.r;
      minX = Math.min(minX, unit.position.x - radius);
      minY = Math.min(minY, unit.position.y - radius);
      maxX = Math.max(maxX, unit.position.x + radius);
      maxY = Math.max(maxY, unit.position.y + radius);
    }
    
    return {
      min: new Vector(this.p, minX, minY),
      max: new Vector(this.p, maxX, maxY)
    };
  }
  
  public getTotalHealth(): number {
    return this.unitObjs.reduce((sum, unit) => sum + unit.health, this.leader.health);
  }
  
  // 獲取方法
  public getLeader(): IUnit {
    return this.leader;
  }
  
  public getUnits(): IUnit[] {
    return [...this.unitObjs]; // 回傳副本避免外部修改
  }
  
  public getAllUnits(): IUnit[] {
    return [this.leader, ...this.unitObjs];
  }
  
  public getUnitCount(): number {
    return this.unitObjs.length;
  }
  
  public getTotalUnitCount(): number {
    return this.unitObjs.length + 1; // 包含 leader
  }
  
  public getGroupId(): number {
    return this.groupId;
  }
  
  public getAliveUnits(): IUnit[] {
    return this.unitObjs.filter(unit => unit.isAlive);
  }
  
  public getDeadUnits(): IUnit[] {
    return this.unitObjs.filter(unit => !unit.isAlive);
  }
  
  // 群組狀態管理
  public setGroupFollow(): void {
    for (const unit of this.unitObjs) {
      if (!unit.isAttacking()) {
        unit.setFollow();
      }
    }
  }
  
  public setGroupStop(): void {
    this.leader.setStop();
    for (const unit of this.unitObjs) {
      unit.setStop();
    }
  }
  
  // 移除單位
  public removeUnit(unit: IUnit): boolean {
    const index = this.unitObjs.indexOf(unit);
    if (index !== -1) {
      this.unitObjs.splice(index, 1);
      return true;
    }
    return false;
  }
  
  public removeUnitById(id: string): boolean {
    const index = this.unitObjs.findIndex(unit => unit.id === id);
    if (index !== -1) {
      this.unitObjs.splice(index, 1);
      return true;
    }
    return false;
  }
  
  public removeDeadUnits(): number {
    const initialCount = this.unitObjs.length;
    this.unitObjs = this.unitObjs.filter(unit => unit.isAlive);
    return initialCount - this.unitObjs.length;
  }
  
  // 群組統計
  public getAverageHealth(): number {
    if (this.unitObjs.length === 0) return this.leader.health;
    
    const totalHealth = this.unitObjs.reduce((sum, unit) => sum + unit.health, this.leader.health);
    return totalHealth / (this.unitObjs.length + 1);
  }
  
  public getGroupCenter(): IVector {
    if (this.unitObjs.length === 0) {
      return this.leader.position.copy();
    }
    
    let totalX = this.leader.position.x;
    let totalY = this.leader.position.y;
    
    for (const unit of this.unitObjs) {
      totalX += unit.position.x;
      totalY += unit.position.y;
    }
    
    const count = this.unitObjs.length + 1;
    return new Vector(this.p, totalX / count, totalY / count);
  }
  
  // 群組行為控制
  public isGroupIdle(): boolean {
    return this.leader.state === 'stop' && this.unitObjs.every(unit => 
      unit.state === 'stop' || unit.state === 'follow'
    );
  }
  
  public hasAttackingUnits(): boolean {
    return this.unitObjs.some(unit => unit.isAttacking());
  }
  
  public getAttackingUnits(): IUnit[] {
    return this.unitObjs.filter(unit => unit.isAttacking());
  }
  
  public getFollowingUnits(): IUnit[] {
    return this.unitObjs.filter(unit => unit.isFollow());
  }
}