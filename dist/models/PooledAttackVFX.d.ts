import { IPoolable } from '../interfaces/IObjectPool';
import { IVector } from '../types/vector';
import { Color } from '../types/common';
export interface IAttackVFX extends IPoolable {
    id: string;
    position: IVector;
    targetPosition: IVector;
    color: Color;
    duration: number;
    remainingTime: number;
    initialize(startPos: IVector, endPos: IVector, color: Color, duration: number): void;
    update(deltaTime: number): boolean;
    render(p: p5Instance): void;
    isExpired(): boolean;
    getProgress(): number;
}
export declare class PooledAttackVFX implements IAttackVFX {
    id: string;
    position: IVector;
    targetPosition: IVector;
    color: Color;
    duration: number;
    remainingTime: number;
    private p;
    private active;
    private vfxType;
    private intensity;
    private animationProgress;
    private pulseOffset;
    constructor(p: p5Instance);
    initialize(startPos: IVector, endPos: IVector, color: Color, duration?: number): void;
    update(deltaTime: number): boolean;
    render(p: p5Instance): void;
    private renderLine;
    private renderBeam;
    private renderPulse;
    private renderExplosion;
    isExpired(): boolean;
    getProgress(): number;
    setVFXType(type: AttackVFXType): void;
    reset(): void;
    isActive(): boolean;
    setActive(active: boolean): void;
}
export declare enum AttackVFXType {
    LINE = "line",// 簡單線條
    BEAM = "beam",// 光束
    PULSE = "pulse",// 脈衝
    EXPLOSION = "explosion"
}
export declare function createAttackVFXPool(p: p5Instance, initialSize?: number, maxSize?: number): any;
//# sourceMappingURL=PooledAttackVFX.d.ts.map