import { IUnit } from './IUnit';
import { IFlock } from './IFlock';
import { IObstacleManager } from './IObstacle';
import { GameConfig, ControlMode } from '../types/common';
import { IVector } from '../types/vector';
export interface IGameSketch {
    readonly p: p5Instance;
    config: GameConfig;
    flock: IFlock;
    obstacleManager: IObstacleManager;
    viewX: number;
    viewY: number;
    currentControl: ControlMode;
    isPVP: boolean;
    showStats: boolean;
    showDebug: boolean;
    frameCount: number;
    setup(): void;
    draw(): void;
    mousePressed(): void;
    keyPressed(): void;
    update(deltaTime: number): void;
    render(): void;
    switchControl(mode: ControlMode): void;
    togglePVP(): void;
    toggleStats(): void;
    toggleDebug(): void;
    updateCamera(): void;
    getWorldMousePosition(): IVector;
    reset(): void;
    pause(): void;
    resume(): void;
}
export interface IRenderSystem {
    renderBackground(): void;
    renderEntities(): void;
    renderUI(): void;
    renderDebug(): void;
    renderText(text: string, x: number, y: number, options?: TextRenderOptions): void;
    renderTextWithViewport(text: string, x: number, y: number, options?: TextRenderOptions): void;
    renderStats(stats: GameStats): void;
    renderDebugInfo(debugInfo: DebugInfo): void;
    setCamera(x: number, y: number): void;
    resetCamera(): void;
}
export interface IInputSystem {
    isKeyPressed(key: string): boolean;
    isKeyDown(key: string): boolean;
    isKeyUp(key: string): boolean;
    getMousePosition(): IVector;
    getWorldMousePosition(): IVector;
    isMousePressed(button?: number): boolean;
    isMouseDown(button?: number): boolean;
    isMouseUp(button?: number): boolean;
    onKeyPressed(callback: (key: string) => void): void;
    onKeyReleased(callback: (key: string) => void): void;
    onMousePressed(callback: (x: number, y: number, button: number) => void): void;
    onMouseReleased(callback: (x: number, y: number, button: number) => void): void;
    update(): void;
}
export interface IUISystem {
    addButton(id: string, x: number, y: number, width: number, height: number, text: string, callback: () => void): void;
    removeButton(id: string): void;
    updateButton(id: string, options: ButtonOptions): void;
    handleMouseClick(x: number, y: number): boolean;
    render(): void;
    setVisible(id: string, visible: boolean): void;
    setEnabled(id: string, enabled: boolean): void;
}
export interface ICameraSystem {
    x: number;
    y: number;
    move(dx: number, dy: number): void;
    setPosition(x: number, y: number): void;
    followTarget(target: IVector, smoothing?: number): void;
    worldToScreen(worldPos: IVector): IVector;
    screenToWorld(screenPos: IVector): IVector;
    isInView(pos: IVector, margin?: number): boolean;
    getBounds(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    update(): void;
    applyTransform(p: p5Instance): void;
}
export interface TextRenderOptions {
    size?: number;
    color?: string;
    align?: string;
    valign?: string;
    font?: string;
}
export interface ButtonOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    enabled?: boolean;
    visible?: boolean;
}
export interface GameStats {
    fps: number;
    unitCount: number;
    obstacleCount: number;
    frameTime: number;
    updateTime: number;
    renderTime: number;
}
export interface DebugInfo {
    cameraPos: IVector;
    mousePos: IVector;
    worldMousePos: IVector;
    currentControl: ControlMode;
    isPVP: boolean;
    selectedUnit?: IUnit;
}
//# sourceMappingURL=ISketch.d.ts.map