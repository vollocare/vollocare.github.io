// 障礙物介面定義
import { IVector } from '../types/vector';
import { IUnit } from './IUnit';
import { Color, BoundingBox } from '../types/common';

export interface IObstacle {
  // 基本屬性
  readonly id: string;
  position: IVector;
  radius: number;
  
  // 視覺屬性
  color: Color;
  strokeColor?: Color;
  strokeWeight: number | undefined;
  
  // 碰撞檢測
  checkCollision(unit: IUnit): boolean;
  checkCollisionWithPoint(point: IVector): boolean;
  checkCollisionWithCircle(center: IVector, radius: number): boolean;
  
  // 距離計算
  distanceToPoint(point: IVector): number;
  distanceToUnit(unit: IUnit): number;
  
  // 避障計算
  getAvoidanceForce(unit: IUnit): IVector;
  getClosestPoint(point: IVector): IVector;
  
  // 邊界框
  getBoundingBox(): BoundingBox;
  
  // 渲染
  render(p: p5Instance): void;
  
  // 工具方法
  isPointInside(point: IVector): boolean;
  copy(): IObstacle;
}

export interface IObstacleManager {
  // 障礙物集合
  obstacles: IObstacle[];
  
  // 添加和移除
  addObstacle(obstacle: IObstacle): void;
  removeObstacle(obstacle: IObstacle): void;
  removeObstacleById(id: string): void;
  
  // 批量操作
  addObstacles(obstacles: IObstacle[]): void;
  removeAllObstacles(): void;
  
  // 查詢方法
  getObstacle(id: string): IObstacle | undefined;
  getObstaclesInRadius(center: IVector, radius: number): IObstacle[];
  getObstaclesInRange(min: IVector, max: IVector): IObstacle[];
  
  // 碰撞檢測
  checkCollisions(unit: IUnit): IObstacle[];
  checkAnyCollision(unit: IUnit): boolean;
  
  // 避障計算
  calculateAvoidanceForce(unit: IUnit): IVector;
  getClosestObstacle(point: IVector): IObstacle | undefined;
  
  // 渲染
  render(p: p5Instance): void;
  
  // 統計
  getObstacleCount(): number;
  getTotalArea(): number;
  
  // 空間優化
  updateSpatialIndex?(): void;
  
  // 事件處理
  onObstacleAdded?(obstacle: IObstacle): void;
  onObstacleRemoved?(obstacle: IObstacle): void;
}