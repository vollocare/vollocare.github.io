export declare enum UnitState {
    MOVE = "move",
    STOP = "stop",
    FOLLOW = "follow",
    ATTACK = "attack",
    ESCAPE = "escape",
    DIE = "die"
}
export declare enum ControlMode {
    PLAYER = 1,
    ENEMY = 2,
    ENEMY2 = 3
}
export interface GameConfig {
    displayWidth: number;
    displayHeight: number;
    maxUnits: number;
    isPVP: boolean;
    showStats: boolean;
    showDebug: boolean;
}
export interface Position {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}
export interface AttackConfig {
    damage: number;
    range: number;
    cooldown: number;
    duration: number;
}
export interface MovementConfig {
    maxSpeed: number;
    maxForce: number;
    separationDistance: number;
    neighborDistance: number;
    desiredSeparation: number;
}
export interface FlockWeights {
    separation: number;
    alignment: number;
    cohesion: number;
    avoidance: number;
    seek: number;
}
export declare enum EventType {
    UNIT_CREATED = "unit_created",
    UNIT_DESTROYED = "unit_destroyed",
    UNIT_ATTACK = "unit_attack",
    UNIT_DAMAGED = "unit_damaged",
    UNIT_STATE_CHANGED = "unit_state_changed",
    CONTROL_CHANGED = "control_changed"
}
export interface GameEvent {
    type: EventType;
    timestamp: number;
    source?: any;
    target?: any;
    data?: any;
}
export type Vector2D = {
    x: number;
    y: number;
};
export type Vector3D = Vector2D & {
    z: number;
};
export type Range = {
    min: number;
    max: number;
};
export type BoundingBox = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
//# sourceMappingURL=common.d.ts.map