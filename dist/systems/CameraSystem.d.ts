import { IVector } from '../types/vector';
import { BoundingBox } from '../types/common';
export declare enum CameraMode {
    FREE = "free",
    FOLLOW = "follow",
    FIXED = "fixed"
}
export interface ICameraSystem {
    setPosition(x: number, y: number, z?: number): void;
    getPosition(): IVector;
    move(deltaX: number, deltaY: number, deltaZ?: number): void;
    worldToScreen(worldPos: IVector): IVector;
    screenToWorld(screenPos: IVector): IVector;
    followTargetPosition(target: IVector, smoothing?: number): void;
    setFollowTarget(target: IVector | null): void;
    setBounds(bounds: BoundingBox): void;
    getBounds(): BoundingBox | null;
    constrainToBounds(): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    zoom(factor: number): void;
    update(deltaTime: number): void;
    isInView(worldPos: IVector, margin?: number): boolean;
    getViewBounds(): BoundingBox;
}
export interface CameraConfig {
    position: IVector;
    zoom: number;
    followSmoothing: number;
    followDeadZone: number;
    bounds?: BoundingBox;
    minZoom: number;
    maxZoom: number;
    moveSpeed: number;
    zoomSpeed: number;
}
export declare const DEFAULT_CAMERA_CONFIG: CameraConfig;
export declare class CameraSystem implements ICameraSystem {
    private p;
    private camera;
    private config;
    private position;
    private targetPosition;
    private currentZoom;
    private followTargetObj;
    private displayWidth;
    private displayHeight;
    private bounds;
    private smoothPosition;
    private smoothZoom;
    constructor(p: p5Instance, displayWidth: number, displayHeight: number, config?: Partial<CameraConfig>);
    private initializeCamera;
    private updateCameraPosition;
    setPosition(x: number, y: number, z?: number): void;
    getPosition(): IVector;
    move(deltaX: number, deltaY: number, deltaZ?: number): void;
    worldToScreen(worldPos: IVector): IVector;
    screenToWorld(screenPos: IVector): IVector;
    followTargetPosition(target: IVector, smoothing?: number): void;
    setFollowTarget(target: IVector | null): void;
    setBounds(bounds: BoundingBox): void;
    getBounds(): BoundingBox | null;
    constrainToBounds(): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    zoom(factor: number): void;
    update(deltaTime: number): void;
    private lerp;
    isInView(worldPos: IVector, margin?: number): boolean;
    getViewBounds(): BoundingBox;
    shake(_intensity: number, _duration: number): void;
    private cameraMode;
    setCameraMode(mode: CameraMode): void;
    getCameraMode(): CameraMode;
    zoomToTarget(target: IVector, targetZoom: number, _duration?: number): void;
    reset(): void;
    updateConfig(config: Partial<CameraConfig>): void;
    getConfig(): CameraConfig;
    getFOV(): number;
    filterVisibleObjects<T extends {
        position: IVector;
    }>(objects: T[], margin?: number): T[];
    getStats(): {
        position: IVector;
        zoom: number;
        viewBounds: BoundingBox;
        followTarget: IVector | null;
        mode: CameraMode;
    };
}
//# sourceMappingURL=CameraSystem.d.ts.map