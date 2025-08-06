// IPatrol - 巡邏系統介面定義
/// <reference path="../types/p5.d.ts" />

import { IVector } from '../types/vector';
import { IGroupUnit } from './IGroupUnit';

export interface IPatrolPoint {
  position: IVector;
  time: number;
}

export interface IPatrolGroupUnit {
  groupUnit: IGroupUnit;
  lastTime: number;
  nowIndex: number;
  createX: number;
  createY: number;
}

export interface IPatrol {
  // 基本屬性
  patrolPoints: IPatrolPoint[];
  patrolGroupUnits: IPatrolGroupUnit[];
  
  // 方法
  addPoint(x: number, y: number, time: number): void;
  addGroupUnit(groupUnit: IGroupUnit, index: number, createX: number, createY: number): void;
  update(): void;
  render(p: p5Instance): void;
  
  // 管理方法
  removePoint(index: number): void;
  removeGroupUnit(groupUnit: IGroupUnit): void;
  clear(): void;
  
  // 狀態查詢
  getPointCount(): number;
  getGroupUnitCount(): number;
  isActive(): boolean;
}