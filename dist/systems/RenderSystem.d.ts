import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { Color } from '../types/common';
import { IVector } from '../types/vector';
export interface IRenderSystem {
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
}
export interface DebugInfo {
    frameRate: number;
    unitCount: number;
    obstacleCount: number;
    currentControl: number;
    isPVP: boolean;
    viewX: number;
    viewY: number;
}
export interface AttackEffect {
    id: string;
    position: IVector;
    targetPosition: IVector;
    duration: number;
    remainingTime: number;
    color: Color;
}
export interface RenderLayer {
    name: string;
    visible: boolean;
    opacity: number;
    zIndex: number;
}
export declare class TextWithViewPort {
    private p;
    private displayWidth;
    private displayHeight;
    private viewX;
    private viewY;
    private textScreen;
    constructor(p: p5Instance, displayWidth: number, displayHeight: number);
    setViewPort(viewX: number, viewY: number): void;
    clear(): void;
    fill(color: Color): void;
    text(text: string, x: number, y: number): void;
    render(): void;
}
export declare class RenderSystem implements IRenderSystem {
    private p;
    private displayHeight;
    private textWithViewPort;
    private backgroundColor;
    private showArrows;
    private showTargetLines;
    private showUnitStats;
    private showHealthBars;
    private showDebugInfo;
    private renderLayers;
    private attackEffects;
    constructor(p: p5Instance, displayWidth: number, displayHeight: number);
    private initializeRenderLayers;
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
    private renderUnitHealthBar;
    private renderUnitStatistics;
    private renderTargetLine;
    renderDebugInfo(info: DebugInfo): void;
    renderArrows(enabled: boolean): void;
    renderTargetLines(enabled: boolean): void;
    renderUnitStats(enabled: boolean): void;
    renderAttackEffects(effects: AttackEffect[]): void;
    private renderAttackEffect;
    renderHealthBars(_units: IUnit[]): void;
    setBackgroundColor(color: Color): void;
    resize(width: number, height: number): void;
    setLayerVisible(layerName: string, visible: boolean): void;
    setLayerOpacity(layerName: string, opacity: number): void;
    private isLayerVisible;
    getRenderSettings(): {
        showArrows: boolean;
        showTargetLines: boolean;
        showUnitStats: boolean;
        showHealthBars: boolean;
        showDebugInfo: boolean;
    };
    updateRenderSettings(settings: Partial<{
        showArrows: boolean;
        showTargetLines: boolean;
        showUnitStats: boolean;
        showHealthBars: boolean;
        showDebugInfo: boolean;
    }>): void;
}
//# sourceMappingURL=RenderSystem.d.ts.map