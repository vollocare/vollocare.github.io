import { IRenderSystem, DebugInfo, AttackEffect } from './RenderSystem';
import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { Color } from '../types/common';
export interface RenderOptimizationConfig {
    enableFrustumCulling: boolean;
    frustumMargin: number;
    enableLOD: boolean;
    lodDistances: number[];
    enableBatching: boolean;
    maxBatchSize: number;
    enableOcclusion: boolean;
    maxRenderObjects: number;
    showLODLevels: boolean;
    showCullingBounds: boolean;
}
export declare enum LODLevel {
    HIGH = 0,// 高品質（近距離）
    MEDIUM = 1,// 中品質（中距離）
    LOW = 2,// 低品質（遠距離）
    HIDDEN = 3
}
export interface RenderBatch {
    lodLevel: LODLevel;
    units: IUnit[];
    obstacles: IObstacle[];
    effects: AttackEffect[];
}
export interface RenderStats {
    totalObjects: number;
    renderedObjects: number;
    culledObjects: number;
    lodBreakdown: {
        [key in LODLevel]: number;
    };
    batchCount: number;
    frameTime: number;
}
export declare class OptimizedRenderSystem implements IRenderSystem {
    private p;
    private displayWidth;
    private displayHeight;
    private config;
    private viewBounds;
    private cameraPosition;
    private renderBatches;
    private stats;
    private lastCameraPosition;
    private visibilityCache;
    private cacheExpireTime;
    constructor(p: p5Instance, displayWidth: number, displayHeight: number, config?: Partial<RenderOptimizationConfig>);
    render(): void;
    clear(): void;
    setViewPort(viewX: number, viewY: number): void;
    getViewPort(): {
        x: number;
        y: number;
    };
    renderText(text: string, x: number, y: number, color?: Color): void;
    renderUnits(units: IUnit[]): void;
    renderObstacles(obstacles: IObstacle[]): void;
    renderDebugInfo(info: DebugInfo): void;
    renderArrows(enabled: boolean): void;
    renderTargetLines(enabled: boolean): void;
    renderUnitStats(enabled: boolean): void;
    renderAttackEffects(effects: AttackEffect[]): void;
    renderHealthBars(units: IUnit[]): void;
    setBackgroundColor(color: Color): void;
    resize(width: number, height: number): void;
    private checkVisibility;
    private isInFrustum;
    private calculateLOD;
    private renderBatch;
    private renderUnitWithLOD;
    private renderObstacleWithLOD;
    private renderEffectWithLOD;
    private renderUnitSimple;
    private renderUnitMinimal;
    private renderUnitDetails;
    private renderHealthBar;
    private renderCullingBounds;
    private clearBatches;
    private resetStats;
    updateConfig(newConfig: Partial<RenderOptimizationConfig>): void;
    getRenderStats(): RenderStats;
    getConfig(): RenderOptimizationConfig;
}
//# sourceMappingURL=OptimizedRenderSystem.d.ts.map