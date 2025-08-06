// CameraSystem - 相機系統，處理視窗座標轉換和相機控制
/// <reference path="../types/p5.d.ts" />

import { IVector } from '../types/vector';
import { Vector } from '../utils/Vector';
import { BoundingBox } from '../types/common';

export enum CameraMode {
  FREE = 'free',
  FOLLOW = 'follow',
  FIXED = 'fixed'
}

export interface ICameraSystem {
  // 相機位置控制
  setPosition(x: number, y: number, z?: number): void;
  getPosition(): IVector;
  move(deltaX: number, deltaY: number, deltaZ?: number): void;
  
  // 座標轉換
  worldToScreen(worldPos: IVector): IVector;
  screenToWorld(screenPos: IVector): IVector;
  
  // 相機跟隨
  followTargetPosition(target: IVector, smoothing?: number): void;
  setFollowTarget(target: IVector | null): void;
  
  // 視窗邊界
  setBounds(bounds: BoundingBox): void;
  getBounds(): BoundingBox | null;
  constrainToBounds(): void;
  
  // 縮放控制
  setZoom(zoom: number): void;
  getZoom(): number;
  zoom(factor: number): void;
  
  // 更新
  update(deltaTime: number): void;
  
  // 狀態查詢
  isInView(worldPos: IVector, margin?: number): boolean;
  getViewBounds(): BoundingBox;
}

export interface CameraConfig {
  // 基本設定
  position: IVector;
  zoom: number;
  
  // 跟隨設定
  followSmoothing: number;
  followDeadZone: number;
  
  // 移動限制
  bounds?: BoundingBox;
  minZoom: number;
  maxZoom: number;
  
  // 移動速度
  moveSpeed: number;
  zoomSpeed: number;
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  position: { x: 512, y: 320, z: 554 } as IVector,
  zoom: 1.0,
  followSmoothing: 0.1,
  followDeadZone: 50,
  minZoom: 0.5,
  maxZoom: 3.0,
  moveSpeed: 10,
  zoomSpeed: 0.1
};

export class CameraSystem implements ICameraSystem {
  private p: p5Instance;
  private camera: any; // p5 Camera object
  private config: CameraConfig;
  
  // 相機狀態
  private position: IVector;
  private targetPosition: IVector;
  private currentZoom: number;
  
  // 跟隨目標
  private followTargetObj: IVector | null = null;
  // private _lastFollowPosition: IVector; // 暫時未使用
  
  // 視窗設定
  private displayWidth: number;
  private displayHeight: number;
  private bounds: BoundingBox | null = null;
  
  // 平滑移動
  private smoothPosition: IVector;
  private smoothZoom: number;
  
  constructor(p: p5Instance, displayWidth: number, displayHeight: number, config?: Partial<CameraConfig>) {
    this.p = p;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.config = { ...DEFAULT_CAMERA_CONFIG, ...config };
    
    // 初始化位置
    this.position = new Vector(p, this.config.position.x, this.config.position.y, this.config.position.z || 554);
    this.targetPosition = this.position.copy();
    this.smoothPosition = this.position.copy();
    
    // 初始化縮放
    this.currentZoom = this.config.zoom;
    this.smoothZoom = this.currentZoom;
    
    // 初始化跟隨系統
    // this._lastFollowPosition = new Vector(p, 0, 0);
    
    // 創建 p5 相機
    this.initializeCamera();
  }
  
  private initializeCamera(): void {
    // 在 WEBGL 模式下創建相機
    if ((this.p as any).createCamera) {
      this.camera = (this.p as any).createCamera();
      this.updateCameraPosition();
    }
  }
  
  private updateCameraPosition(): void {
    if (this.camera && this.camera.setPosition) {
      this.camera.setPosition(
        this.smoothPosition.x,
        this.smoothPosition.y,
        this.smoothPosition.z || 554
      );
    }
  }
  
  // 相機位置控制
  public setPosition(x: number, y: number, z?: number): void {
    this.position.set(x, y, z);
    this.targetPosition = this.position.copy();
    this.smoothPosition = this.position.copy();
    this.updateCameraPosition();
  }
  
  public getPosition(): IVector {
    return this.position.copy();
  }
  
  public move(deltaX: number, deltaY: number, deltaZ?: number): void {
    this.targetPosition.x += deltaX;
    this.targetPosition.y += deltaY;
    if (deltaZ !== undefined && this.targetPosition.z !== undefined) {
      this.targetPosition.z += deltaZ;
    }
    
    // 約束到邊界
    this.constrainToBounds();
  }
  
  // 座標轉換
  public worldToScreen(worldPos: IVector): IVector {
    // 將世界座標轉換為螢幕座標
    const screenX = worldPos.x - this.position.x + this.displayWidth / 2;
    const screenY = worldPos.y - this.position.y + this.displayHeight / 2;
    return new Vector(this.p, screenX, screenY);
  }
  
  public screenToWorld(screenPos: IVector): IVector {
    // 將螢幕座標轉換為世界座標
    const worldX = screenPos.x + this.position.x - this.displayWidth / 2;
    const worldY = screenPos.y + this.position.y - this.displayHeight / 2;
    return new Vector(this.p, worldX, worldY);
  }
  
  // 相機跟隨
  public followTargetPosition(target: IVector, smoothing?: number): void {
    if (!target) return;
    
    const smooth = smoothing !== undefined ? smoothing : this.config.followSmoothing;
    const deadZone = this.config.followDeadZone;
    
    // 計算目標與相機的距離
    const distance = Vector.dist(this.position, target);
    
    // 只有在超出死區時才移動相機
    if (distance > deadZone) {
      const direction = Vector.sub(this.p, target, this.position);
      direction.normalize();
      direction.mult(distance - deadZone);
      
      // 平滑跟隨
      direction.mult(smooth);
      this.targetPosition.add(direction);
      
      this.constrainToBounds();
    }
  }
  
  public setFollowTarget(target: IVector | null): void {
    this.followTargetObj = target;
    // if (target) {
    //   this._lastFollowPosition = target.copy();
    // }
  }
  
  // 視窗邊界
  public setBounds(bounds: BoundingBox): void {
    this.bounds = bounds;
  }
  
  public getBounds(): BoundingBox | null {
    return this.bounds;
  }
  
  public constrainToBounds(): void {
    if (!this.bounds) return;
    
    const halfWidth = this.displayWidth / 2;
    const halfHeight = this.displayHeight / 2;
    
    // 約束 X 軸
    this.targetPosition.x = Math.max(
      this.bounds.left + halfWidth,
      Math.min(this.bounds.right - halfWidth, this.targetPosition.x)
    );
    
    // 約束 Y 軸
    this.targetPosition.y = Math.max(
      this.bounds.top + halfHeight,
      Math.min(this.bounds.bottom - halfHeight, this.targetPosition.y)
    );
  }
  
  // 縮放控制
  public setZoom(zoom: number): void {
    this.currentZoom = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, zoom)
    );
  }
  
  public getZoom(): number {
    return this.currentZoom;
  }
  
  public zoom(factor: number): void {
    this.setZoom(this.currentZoom * factor);
  }
  
  // 更新
  public update(deltaTime: number): void {
    // 處理跟隨目標
    if (this.followTargetObj) {
      this.followTargetPosition(this.followTargetObj);
    }
    
    // 平滑移動到目標位置
    const lerpFactor = Math.min(1.0, deltaTime * 5); // 調整平滑度
    
    this.smoothPosition.x = this.lerp(this.smoothPosition.x, this.targetPosition.x, lerpFactor);
    this.smoothPosition.y = this.lerp(this.smoothPosition.y, this.targetPosition.y, lerpFactor);
    if (this.smoothPosition.z !== undefined && this.targetPosition.z !== undefined) {
      this.smoothPosition.z = this.lerp(this.smoothPosition.z, this.targetPosition.z, lerpFactor);
    }
    
    // 平滑縮放
    this.smoothZoom = this.lerp(this.smoothZoom, this.currentZoom, lerpFactor);
    
    // 更新實際相機位置
    this.position = this.smoothPosition.copy();
    this.updateCameraPosition();
  }
  
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
  
  // 狀態查詢
  public isInView(worldPos: IVector, margin: number = 0): boolean {
    const screenPos = this.worldToScreen(worldPos);
    
    return screenPos.x >= -margin &&
           screenPos.x <= this.displayWidth + margin &&
           screenPos.y >= -margin &&
           screenPos.y <= this.displayHeight + margin;
  }
  
  public getViewBounds(): BoundingBox {
    const halfWidth = this.displayWidth / 2;
    const halfHeight = this.displayHeight / 2;
    
    return {
      left: this.position.x - halfWidth,
      right: this.position.x + halfWidth,
      top: this.position.y - halfHeight,
      bottom: this.position.y + halfHeight
    };
  }
  
  // 相機震動效果（暫時移除）
  
  public shake(_intensity: number, _duration: number): void {
    // 暫時未實作
  }
  
  // 暫時移除 _updateShake 方法，未使用
  
  // 相機移動模式
  private cameraMode: CameraMode = CameraMode.FREE;
  
  public setCameraMode(mode: CameraMode): void {
    this.cameraMode = mode;
    
    if (mode !== CameraMode.FOLLOW) {
      this.followTargetObj = null;
    }
  }
  
  public getCameraMode(): CameraMode {
    return this.cameraMode as CameraMode;
  }
  
  // 平滑縮放到目標
  public zoomToTarget(target: IVector, targetZoom: number, _duration: number = 1000): void {
    // 實作平滑縮放和移動到目標
    this.setFollowTarget(target);
    this.setZoom(targetZoom);
  }
  
  // 重置相機
  public reset(): void {
    this.setPosition(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.setZoom(this.config.zoom);
    this.setFollowTarget(null);
    // this.shakeIntensity = 0;
    // this.shakeTimer = 0;
  }
  
  // 相機配置更新
  public updateConfig(config: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  public getConfig(): CameraConfig {
    return { ...this.config };
  }
  
  // 視野計算
  public getFOV(): number {
    // 基於 z 位置計算視野角度
    const z = this.position.z || 554;
    return Math.atan2(this.displayHeight / 2, z) * 2;
  }
  
  // 可視範圍內的物件篩選
  public filterVisibleObjects<T extends { position: IVector }>(objects: T[], margin: number = 100): T[] {
    return objects.filter(obj => this.isInView(obj.position, margin));
  }
  
  // 相機統計資訊
  public getStats(): {
    position: IVector;
    zoom: number;
    viewBounds: BoundingBox;
    followTarget: IVector | null;
    mode: CameraMode;
  } {
    return {
      position: this.getPosition(),
      zoom: this.getZoom(),
      viewBounds: this.getViewBounds(),
      followTarget: this.followTargetObj,
      mode: this.cameraMode
    };
  }
}