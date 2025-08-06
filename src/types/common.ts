// 共用型別定義

// 單位狀態列舉
export enum UnitState {
  MOVE = 'move',
  STOP = 'stop',
  FOLLOW = 'follow',
  ATTACK = 'attack',
  ESCAPE = 'escape',
  DIE = 'die'
}

// 控制模式列舉
export enum ControlMode {
  PLAYER = 1,
  ENEMY = 2,
  ENEMY2 = 3
}

// 遊戲設定介面
export interface GameConfig {
  displayWidth: number;
  displayHeight: number;
  maxUnits: number;
  isPVP: boolean;
  showStats: boolean;
  showDebug: boolean;
}

// 位置介面
export interface Position {
  x: number;
  y: number;
}

// 尺寸介面
export interface Size {
  width: number;
  height: number;
}

// 顏色介面
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// 攻擊設定介面
export interface AttackConfig {
  damage: number;
  range: number;
  cooldown: number;
  duration: number;
}

// 移動設定介面
export interface MovementConfig {
  maxSpeed: number;
  maxForce: number;
  separationDistance: number;
  neighborDistance: number;
  desiredSeparation: number;
}

// 群體行為權重介面
export interface FlockWeights {
  separation: number;
  alignment: number;
  cohesion: number;
  avoidance: number;
  seek: number;
}

// 事件類型列舉
export enum EventType {
  UNIT_CREATED = 'unit_created',
  UNIT_DESTROYED = 'unit_destroyed',
  UNIT_ATTACK = 'unit_attack',
  UNIT_DAMAGED = 'unit_damaged',
  UNIT_STATE_CHANGED = 'unit_state_changed',
  CONTROL_CHANGED = 'control_changed'
}

// 遊戲事件介面
export interface GameEvent {
  type: EventType;
  timestamp: number;
  source?: any;
  target?: any;
  data?: any;
}

// 數學工具類型
export type Vector2D = {
  x: number;
  y: number;
};

export type Vector3D = Vector2D & {
  z: number;
};

// 範圍類型
export type Range = {
  min: number;
  max: number;
};

// 邊界框類型
export type BoundingBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};