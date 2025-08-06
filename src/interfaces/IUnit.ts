// 單位介面定義
import { UnitState, AttackConfig, Color } from '../types/common';
import { IVector } from '../types/vector';

export interface IUnit {
  // 基本屬性
  readonly id: string;
  position: IVector;
  velocity: IVector;
  acceleration: IVector;
  
  // 物理屬性
  readonly r: number; // 半徑
  maxSpeed: number;
  maxForce: number;
  
  // 生命系統
  health: number;
  maxHealth: number;
  isAlive: boolean;
  
  // 狀態管理
  state: UnitState;
  previousState: UnitState;
  stateChangeTime: number;
  
  // 攻擊系統
  attackConfig: AttackConfig;
  lastAttackTime: number;
  canAttack: boolean;
  
  // 視覺屬性
  color: Color;
  
  // 目標系統
  target?: IVector;
  destination?: IVector;
  direction: IVector; // 單位朝向
  
  // 群組相關
  groupId?: number;
  isLeader: boolean;
  
  // 生命週期方法
  update(deltaTime: number): void;
  render(p: p5Instance): void;
  
  // 狀態管理方法
  setState(newState: UnitState): void;
  canTransitionTo(targetState: UnitState): boolean;
  
  // 移動方法
  seek(target: IVector): IVector;
  flee(target: IVector): IVector;
  arrive(target: IVector, slowingRadius?: number): IVector;
  applyForce(force: IVector): void;
  
  // 攻擊方法
  attack(target: IUnit): boolean;
  takeDamage(damage: number, source?: IUnit): void;
  isInAttackRange(target: IUnit): boolean;
  
  // 工具方法
  distanceTo(target: IVector | IUnit): number;
  angleTo(target: IVector | IUnit): number;
  copy(): IUnit;
  
  // Unit 特有方法 (從原始 JavaScript 移植)
  setDestination(target: IVector): void;
  setFollow(): void;
  setStop(): void;
  setAttack(enemyUnit: IUnit): void;
  setAsLeader(): void;
  isMove(): boolean;
  isFollow(): boolean;
  isAttacking(): boolean;
  
  // 事件處理
  onStateChanged?(oldState: UnitState, newState: UnitState): void;
  onHealthChanged?(oldHealth: number, newHealth: number): void;
  onDeath?(): void;
}