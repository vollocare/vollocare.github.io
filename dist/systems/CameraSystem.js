// CameraSystem - 相機系統，處理視窗座標轉換和相機控制
/// <reference path="../types/p5.d.ts" />
import { Vector } from '../utils/Vector';
export var CameraMode;
(function (CameraMode) {
    CameraMode["FREE"] = "free";
    CameraMode["FOLLOW"] = "follow";
    CameraMode["FIXED"] = "fixed";
})(CameraMode || (CameraMode = {}));
export const DEFAULT_CAMERA_CONFIG = {
    position: { x: 512, y: 320, z: 554 },
    zoom: 1.0,
    followSmoothing: 0.1,
    followDeadZone: 50,
    minZoom: 0.5,
    maxZoom: 3.0,
    moveSpeed: 10,
    zoomSpeed: 0.1
};
export class CameraSystem {
    constructor(p, displayWidth, displayHeight, config) {
        // 跟隨目標
        this.followTargetObj = null;
        this.bounds = null;
        // 暫時移除 _updateShake 方法，未使用
        // 相機移動模式
        this.cameraMode = CameraMode.FREE;
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
    initializeCamera() {
        // 在 WEBGL 模式下創建相機
        if (this.p.createCamera) {
            this.camera = this.p.createCamera();
            this.updateCameraPosition();
        }
    }
    updateCameraPosition() {
        if (this.camera && this.camera.setPosition) {
            this.camera.setPosition(this.smoothPosition.x, this.smoothPosition.y, this.smoothPosition.z || 554);
        }
    }
    // 相機位置控制
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.targetPosition = this.position.copy();
        this.smoothPosition = this.position.copy();
        this.updateCameraPosition();
    }
    getPosition() {
        return this.position.copy();
    }
    move(deltaX, deltaY, deltaZ) {
        this.targetPosition.x += deltaX;
        this.targetPosition.y += deltaY;
        if (deltaZ !== undefined && this.targetPosition.z !== undefined) {
            this.targetPosition.z += deltaZ;
        }
        // 約束到邊界
        this.constrainToBounds();
    }
    // 座標轉換
    worldToScreen(worldPos) {
        // 將世界座標轉換為螢幕座標
        const screenX = worldPos.x - this.position.x + this.displayWidth / 2;
        const screenY = worldPos.y - this.position.y + this.displayHeight / 2;
        return new Vector(this.p, screenX, screenY);
    }
    screenToWorld(screenPos) {
        // 將螢幕座標轉換為世界座標
        const worldX = screenPos.x + this.position.x - this.displayWidth / 2;
        const worldY = screenPos.y + this.position.y - this.displayHeight / 2;
        return new Vector(this.p, worldX, worldY);
    }
    // 相機跟隨
    followTargetPosition(target, smoothing) {
        if (!target)
            return;
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
    setFollowTarget(target) {
        this.followTargetObj = target;
        // if (target) {
        //   this._lastFollowPosition = target.copy();
        // }
    }
    // 視窗邊界
    setBounds(bounds) {
        this.bounds = bounds;
    }
    getBounds() {
        return this.bounds;
    }
    constrainToBounds() {
        if (!this.bounds)
            return;
        const halfWidth = this.displayWidth / 2;
        const halfHeight = this.displayHeight / 2;
        // 約束 X 軸
        this.targetPosition.x = Math.max(this.bounds.left + halfWidth, Math.min(this.bounds.right - halfWidth, this.targetPosition.x));
        // 約束 Y 軸
        this.targetPosition.y = Math.max(this.bounds.top + halfHeight, Math.min(this.bounds.bottom - halfHeight, this.targetPosition.y));
    }
    // 縮放控制
    setZoom(zoom) {
        this.currentZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    }
    getZoom() {
        return this.currentZoom;
    }
    zoom(factor) {
        this.setZoom(this.currentZoom * factor);
    }
    // 更新
    update(deltaTime) {
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
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    // 狀態查詢
    isInView(worldPos, margin = 0) {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x >= -margin &&
            screenPos.x <= this.displayWidth + margin &&
            screenPos.y >= -margin &&
            screenPos.y <= this.displayHeight + margin;
    }
    getViewBounds() {
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
    shake(_intensity, _duration) {
        // 暫時未實作
    }
    setCameraMode(mode) {
        this.cameraMode = mode;
        if (mode !== CameraMode.FOLLOW) {
            this.followTargetObj = null;
        }
    }
    getCameraMode() {
        return this.cameraMode;
    }
    // 平滑縮放到目標
    zoomToTarget(target, targetZoom, _duration = 1000) {
        // 實作平滑縮放和移動到目標
        this.setFollowTarget(target);
        this.setZoom(targetZoom);
    }
    // 重置相機
    reset() {
        this.setPosition(this.config.position.x, this.config.position.y, this.config.position.z);
        this.setZoom(this.config.zoom);
        this.setFollowTarget(null);
        // this.shakeIntensity = 0;
        // this.shakeTimer = 0;
    }
    // 相機配置更新
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    // 視野計算
    getFOV() {
        // 基於 z 位置計算視野角度
        const z = this.position.z || 554;
        return Math.atan2(this.displayHeight / 2, z) * 2;
    }
    // 可視範圍內的物件篩選
    filterVisibleObjects(objects, margin = 100) {
        return objects.filter(obj => this.isInView(obj.position, margin));
    }
    // 相機統計資訊
    getStats() {
        return {
            position: this.getPosition(),
            zoom: this.getZoom(),
            viewBounds: this.getViewBounds(),
            followTarget: this.followTargetObj,
            mode: this.cameraMode
        };
    }
}
//# sourceMappingURL=CameraSystem.js.map