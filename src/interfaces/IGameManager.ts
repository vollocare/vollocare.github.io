// IGameManager - 主遊戲管理器介面
/// <reference path="../types/p5.d.ts" />

import { IGroupUnit } from './IGroupUnit';
import { IObstacle } from './IObstacle';
import { IPatrol } from './IPatrol';
import { ControlMode } from '../types/common';

export interface IGameManager {
  // 系統管理
  initialize(): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
  
  // 遊戲狀態管理
  isPaused(): boolean;
  setPaused(paused: boolean): void;
  
  // 群組單位管理
  getGroupUnits(): IGroupUnit[];
  getGroupUnit(index: number): IGroupUnit | undefined;
  addGroupUnit(groupUnit: IGroupUnit): void;
  removeGroupUnit(index: number): void;
  
  // 障礙物管理
  getObstacles(): IObstacle[];
  addObstacle(obstacle: IObstacle): void;
  removeObstacle(obstacle: IObstacle): void;
  
  // 巡邏系統
  getPatrol(): IPatrol;
  
  // 控制管理
  getCurrentControl(): ControlMode;
  setCurrentControl(control: ControlMode): void;
  
  // PVP 模式
  isPVPMode(): boolean;
  setPVPMode(enabled: boolean): void;
  
  // 遊戲配置
  getDisplaySize(): { width: number; height: number };
  
  // 統計資訊
  getGameStats(): {
    frameRate: number;
    totalUnits: number;
    totalObstacles: number;
    currentControl: ControlMode;
    isPVP: boolean;
    isActive: boolean;
  };
}