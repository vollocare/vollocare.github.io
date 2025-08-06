// Patrol - 巡邏系統，管理群組單位的路徑巡邏行為
/// <reference path="../types/p5.d.ts" />

import { IPatrol, IPatrolPoint, IPatrolGroupUnit } from '../interfaces/IPatrol';
import { IGroupUnit } from '../interfaces/IGroupUnit';
import { IVector } from '../types/vector';
import { Vector } from '../utils/Vector';

export class PatrolPoint implements IPatrolPoint {
  public position: IVector;
  public time: number;
  
  constructor(p: p5Instance, x: number, y: number, time: number) {
    this.position = new Vector(p, x, y);
    this.time = time;
  }
}

export class PatrolGroupUnit implements IPatrolGroupUnit {
  public groupUnit: IGroupUnit;
  public lastTime: number;
  public nowIndex: number;
  public createX: number;
  public createY: number;
  
  constructor(groupUnit: IGroupUnit, index: number, createX: number, createY: number) {
    this.groupUnit = groupUnit;
    this.lastTime = 0;
    this.nowIndex = index;
    this.createX = createX;
    this.createY = createY;
  }
}

export class Patrol implements IPatrol {
  public patrolPoints: IPatrolPoint[] = [];
  public patrolGroupUnits: IPatrolGroupUnit[] = [];
  
  private p: p5Instance;
  private active: boolean = true;
  private maxUnitsPerGroup: number = 100;
  private unitsAddedPerCycle: number = 20;
  
  constructor(p: p5Instance) {
    this.p = p;
  }
  
  // 添加巡邏點
  public addPoint(x: number, y: number, time: number): void {
    const point = new PatrolPoint(this.p, x, y, time);
    this.patrolPoints.push(point);
  }
  
  // 添加群組單位到巡邏系統
  public addGroupUnit(groupUnit: IGroupUnit, index: number, createX: number, createY: number): void {
    const patrolGroupUnit = new PatrolGroupUnit(groupUnit, index, createX, createY);
    this.patrolGroupUnits.push(patrolGroupUnit);
  }
  
  // 更新巡邏邏輯
  public update(): void {
    if (!this.active || this.patrolPoints.length === 0 || this.patrolGroupUnits.length === 0) {
      return;
    }
    
    for (const pGroupUnit of this.patrolGroupUnits) {
      pGroupUnit.lastTime--;
      
      if (pGroupUnit.lastTime <= 0) {
        // 移動到下一個巡邏點
        pGroupUnit.nowIndex++;
        if (pGroupUnit.nowIndex >= this.patrolPoints.length) {
          pGroupUnit.nowIndex = 0;
        }
        
        // 設定新的目標點和時間
        const targetPoint = this.patrolPoints[pGroupUnit.nowIndex];
        pGroupUnit.lastTime = targetPoint.time;
        pGroupUnit.groupUnit.setDestination(targetPoint.position);
        
        // 添加敵人單位
        this.spawnEnemyUnits(pGroupUnit);
      }
    }
  }
  
  // 生成敵人單位
  private spawnEnemyUnits(pGroupUnit: IPatrolGroupUnit): void {
    const currentUnitCount = pGroupUnit.groupUnit.getUnits().length;
    let unitsToAdd = this.maxUnitsPerGroup - currentUnitCount;
    
    if (unitsToAdd > this.unitsAddedPerCycle) {
      unitsToAdd = this.unitsAddedPerCycle;
    }
    
    for (let j = 0; j < unitsToAdd; j++) {
      // 隨機選擇巡邏點位置生成單位
      const randomIndex = Math.floor(Math.random() * this.patrolPoints.length);
      const spawnPoint = this.patrolPoints[randomIndex].position;
      
      pGroupUnit.groupUnit.addUnit(
        spawnPoint.x,
        spawnPoint.y + j * 5 // 稍微偏移避免重疊
      );
    }
  }
  
  // 渲染巡邏點
  public render(p: p5Instance): void {
    if (!this.active) return;
    
    p.push();
    
    for (const point of this.patrolPoints) {
      p.fill(255);
      p.stroke(255, 255, 255);
      p.strokeWeight(1);
      p.circle(point.position.x, point.position.y, 6);
      
      // 顯示巡邏點編號
      p.fill(255, 255, 0);
      p.noStroke();
      p.textAlign(p.CENTER as any, p.CENTER as any);
      p.textSize(10);
      const index = this.patrolPoints.indexOf(point);
      p.text(index.toString(), point.position.x, point.position.y - 15);
    }
    
    // 繪製巡邏路徑連線
    if (this.patrolPoints.length > 1) {
      p.stroke(100, 100, 100, 150);
      p.strokeWeight(1);
      p.noFill();
      
      for (let i = 0; i < this.patrolPoints.length; i++) {
        const current = this.patrolPoints[i];
        const next = this.patrolPoints[(i + 1) % this.patrolPoints.length];
        
        p.line(
          current.position.x, current.position.y,
          next.position.x, next.position.y
        );
      }
    }
    
    p.pop();
  }
  
  // 移除巡邏點
  public removePoint(index: number): void {
    if (index >= 0 && index < this.patrolPoints.length) {
      this.patrolPoints.splice(index, 1);
    }
  }
  
  // 移除群組單位
  public removeGroupUnit(groupUnit: IGroupUnit): void {
    const index = this.patrolGroupUnits.findIndex(pgu => pgu.groupUnit === groupUnit);
    if (index !== -1) {
      this.patrolGroupUnits.splice(index, 1);
    }
  }
  
  // 清空所有巡邏資料
  public clear(): void {
    this.patrolPoints = [];
    this.patrolGroupUnits = [];
  }
  
  // 狀態查詢
  public getPointCount(): number {
    return this.patrolPoints.length;
  }
  
  public getGroupUnitCount(): number {
    return this.patrolGroupUnits.length;
  }
  
  public isActive(): boolean {
    return this.active;
  }
  
  // 控制方法
  public setActive(active: boolean): void {
    this.active = active;
  }
  
  public setMaxUnitsPerGroup(max: number): void {
    this.maxUnitsPerGroup = Math.max(1, max);
  }
  
  public setUnitsAddedPerCycle(count: number): void {
    this.unitsAddedPerCycle = Math.max(1, count);
  }
  
  // 獲取統計資訊
  public getStats(): {
    pointCount: number;
    groupUnitCount: number;
    totalUnits: number;
    active: boolean;
  } {
    const totalUnits = this.patrolGroupUnits.reduce(
      (sum, pgu) => sum + pgu.groupUnit.getUnits().length,
      0
    );
    
    return {
      pointCount: this.getPointCount(),
      groupUnitCount: this.getGroupUnitCount(),
      totalUnits,
      active: this.active
    };
  }
}