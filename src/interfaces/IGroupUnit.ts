// IGroupUnit - 群組單位介面定義
/// <reference path="../types/p5.d.ts" />

import { IUnit } from './IUnit';
import { IVector } from '../types/vector';

export interface IGroupUnit {
  // 基本屬性
  readonly id: number;
  readonly groupId: number;
  
  // 單位管理
  getUnits(): IUnit[];
  getUnitCount(): number;
  getLeader(): IUnit | null;
  
  // 單位操作
  addUnit(x: number, y: number): IUnit;
  removeUnit(unit: IUnit): boolean;
  removeDeadUnits(): number;
  
  // 群組控制
  setDestination(destination: IVector): void;
  getDestination(): IVector | null;
  
  // 更新和渲染
  update(deltaTime: number): void;
  render(p: p5Instance): void;
  
  // 狀態查詢
  isActive(): boolean;
  getAveragePosition(): IVector;
  getBounds(): { min: IVector; max: IVector };
  
  // 群組統計
  getTotalHealth(): number;
  getAverageHealth(): number;
  getAliveUnits(): IUnit[];
  getDeadUnits(): IUnit[];
}