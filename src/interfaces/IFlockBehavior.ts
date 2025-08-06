// 群體行為介面定義
import { IVector } from '../types/vector';
import { IUnit } from './IUnit';
import { IObstacle } from './IObstacle';

export interface IFlockBehavior {
  // 三大核心群體行為
  separate(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
  align(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
  cohesion(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
  
  // 避障行為
  avoid(targetUnit: IUnit, obstacles: IObstacle[]): IVector;
  avoidEnemies(targetUnit: IUnit, enemies: IUnit[]): IVector;
  
  // 主要運行方法
  run(leader: IUnit, units: IUnit[], obstacles: IObstacle[], enemies: IUnit[]): void;
  
  // 行為權重配置
  setSeparationWeight(weight: number): void;
  setAlignmentWeight(weight: number): void;
  setCohesionWeight(weight: number): void;
  setAvoidanceWeight(weight: number): void;
  
  // 行為參數配置
  setDesiredSeparation(distance: number): void;
  setNeighborDistance(distance: number): void;
  setCollisionVisibilityFactor(factor: number): void;
  
  // 除錯與視覺化
  drawArrow(p: p5Instance, base: IVector, vec: IVector, color: string): void;
  enableArrows(enable: boolean): void;
}

export interface IFlockConfiguration {
  // 行為權重
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  avoidanceWeight: number;
  enemyAvoidanceWeight: number;
  
  // 行為參數
  desiredSeparation: number;
  neighborDistance: number;
  collisionVisibilityFactor: number;
  
  // 除錯設定
  showArrows: boolean;
}

export const DEFAULT_FLOCK_CONFIG: IFlockConfiguration = {
  separationWeight: 2.2,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  avoidanceWeight: 2.0,
  enemyAvoidanceWeight: 2.0,
  desiredSeparation: 25.0,
  neighborDistance: 30,
  collisionVisibilityFactor: 6,
  showArrows: false
};