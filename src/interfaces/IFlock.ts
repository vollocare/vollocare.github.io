// 群體行為介面定義
import { IUnit } from './IUnit';
import { IObstacle } from './IObstacle';
import { IVector } from '../types/vector';
import { FlockWeights } from '../types/common';

export interface IFlockBehavior {
  // 群體行為權重設定
  weights: FlockWeights;
  
  // 核心群體行為
  separate(unit: IUnit, neighbors: IUnit[]): IVector;
  align(unit: IUnit, neighbors: IUnit[]): IVector;
  cohesion(unit: IUnit, neighbors: IUnit[]): IVector;
  
  // 避障行為
  avoid(unit: IUnit, obstacles: IObstacle[]): IVector;
  avoidUnits(unit: IUnit, otherUnits: IUnit[]): IVector;
  
  // 邊界處理
  boundaries(unit: IUnit, bounds: { left: number; right: number; top: number; bottom: number }): IVector;
  
  // 尋找鄰居
  findNeighbors(unit: IUnit, allUnits: IUnit[], radius: number): IUnit[];
  
  // 計算總合力
  calculateForces(unit: IUnit, allUnits: IUnit[], obstacles: IObstacle[]): IVector;
  
  // 權重設定
  setWeight(behavior: keyof FlockWeights, weight: number): void;
  getWeight(behavior: keyof FlockWeights): number;
  
  // 動態調整
  adjustWeightsForState(unit: IUnit): void;
}

export interface IFlock {
  // 單位管理
  units: IUnit[];
  behavior: IFlockBehavior;
  
  // 添加和移除單位
  addUnit(unit: IUnit): void;
  removeUnit(unit: IUnit): void;
  removeUnitById(id: string): void;
  
  // 批量操作
  addUnits(units: IUnit[]): void;
  removeAllUnits(): void;
  
  // 查詢方法
  getUnit(id: string): IUnit | undefined;
  getUnitsInRadius(center: IVector, radius: number): IUnit[];
  getUnitsInRange(min: IVector, max: IVector): IUnit[];
  
  // 生命週期
  update(deltaTime: number): void;
  render(p: p5Instance): void;
  
  // 統計信息
  getUnitCount(): number;
  getAliveUnits(): IUnit[];
  getDeadUnits(): IUnit[];
  
  // 群組管理
  getUnitsByGroup(groupId: number): IUnit[];
  getLeaders(): IUnit[];
  
  // 事件處理
  onUnitAdded?(unit: IUnit): void;
  onUnitRemoved?(unit: IUnit): void;
  onUnitDied?(unit: IUnit): void;
}