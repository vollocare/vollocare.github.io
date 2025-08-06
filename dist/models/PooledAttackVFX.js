// PooledAttackVFX - 可池化的攻擊視覺特效，提升大量特效的效能
/// <reference path="../types/p5.d.ts" />
import { Vector } from '../utils/Vector';
export class PooledAttackVFX {
    constructor(_p) {
        this.id = '';
        this.duration = 0;
        this.remainingTime = 0;
        // private p: p5Instance;
        this.active = false;
        this.vfxType = AttackVFXType.LINE;
        this.intensity = 1.0;
        // 動畫屬性
        this.animationProgress = 0;
        this.pulseOffset = 0;
        // this.p = _p;
        this.position = new Vector(_p, 0, 0);
        this.targetPosition = new Vector(_p, 0, 0);
        this.color = { r: 255, g: 255, b: 255, a: 255 };
        // 生成隨機脈衝偏移以避免所有特效同步
        this.pulseOffset = Math.random() * Math.PI * 2;
    }
    initialize(startPos, endPos, color, duration = 0.5) {
        this.id = `vfx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position.set(startPos.x, startPos.y);
        this.targetPosition.set(endPos.x, endPos.y);
        this.color = { ...color };
        this.duration = duration;
        this.remainingTime = duration;
        this.active = true;
        this.animationProgress = 0;
        this.intensity = 1.0;
    }
    update(deltaTime) {
        if (!this.active)
            return false;
        this.remainingTime -= deltaTime;
        this.animationProgress = 1 - (this.remainingTime / this.duration);
        // 計算強度（淡出效果）
        this.intensity = Math.max(0, this.remainingTime / this.duration);
        // 檢查是否過期
        if (this.remainingTime <= 0) {
            this.active = false;
            return false;
        }
        return true;
    }
    render(p) {
        if (!this.active || this.intensity <= 0)
            return;
        p.push();
        const alpha = this.intensity * (this.color.a || 255);
        switch (this.vfxType) {
            case AttackVFXType.LINE:
                this.renderLine(p, alpha);
                break;
            case AttackVFXType.BEAM:
                this.renderBeam(p, alpha);
                break;
            case AttackVFXType.PULSE:
                this.renderPulse(p, alpha);
                break;
            case AttackVFXType.EXPLOSION:
                this.renderExplosion(p, alpha);
                break;
        }
        p.pop();
    }
    renderLine(p, alpha) {
        // 簡單的攻擊線特效
        const strokeWeight = 3 * this.intensity;
        p.stroke(this.color.r, this.color.g, this.color.b, alpha);
        p.strokeWeight(strokeWeight);
        p.line(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);
        // 攻擊點特效
        p.fill(this.color.r, this.color.g, this.color.b, alpha);
        p.noStroke();
        const impactSize = 8 * this.intensity;
        p.circle(this.targetPosition.x, this.targetPosition.y, impactSize);
    }
    renderBeam(p, alpha) {
        // 光束特效（帶有寬度變化）
        const baseWidth = 2;
        const maxWidth = 6;
        const width = baseWidth + (maxWidth - baseWidth) * Math.sin(this.animationProgress * Math.PI);
        p.stroke(this.color.r, this.color.g, this.color.b, alpha);
        p.strokeWeight(width);
        p.line(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);
        // 添加發光效果
        p.stroke(this.color.r, this.color.g, this.color.b, alpha * 0.3);
        p.strokeWeight(width * 2);
        p.line(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);
    }
    renderPulse(p, alpha) {
        // 脈衝特效
        const time = Date.now() * 0.01 + this.pulseOffset;
        const pulseIntensity = (Math.sin(time) + 1) * 0.5;
        const pulseAlpha = alpha * pulseIntensity;
        p.stroke(this.color.r, this.color.g, this.color.b, pulseAlpha);
        p.strokeWeight(4);
        p.line(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);
        // 脈衝圓圈
        p.fill(this.color.r, this.color.g, this.color.b, pulseAlpha * 0.5);
        p.noStroke();
        const pulseSize = 12 + pulseIntensity * 6;
        p.circle(this.targetPosition.x, this.targetPosition.y, pulseSize);
    }
    renderExplosion(p, alpha) {
        // 爆炸特效
        const explosionSize = this.animationProgress * 20;
        const particles = 8;
        p.stroke(this.color.r, this.color.g, this.color.b, alpha);
        p.strokeWeight(2);
        for (let i = 0; i < particles; i++) {
            const angle = (i / particles) * Math.PI * 2;
            const distance = explosionSize * (0.5 + Math.random() * 0.5);
            const x1 = this.targetPosition.x;
            const y1 = this.targetPosition.y;
            const x2 = x1 + Math.cos(angle) * distance;
            const y2 = y1 + Math.sin(angle) * distance;
            p.line(x1, y1, x2, y2);
        }
    }
    isExpired() {
        return !this.active || this.remainingTime <= 0;
    }
    getProgress() {
        return Math.max(0, Math.min(1, this.animationProgress));
    }
    setVFXType(type) {
        this.vfxType = type;
    }
    // IPoolable 介面實作
    reset() {
        this.id = '';
        this.position.set(0, 0);
        this.targetPosition.set(0, 0);
        this.color = { r: 255, g: 255, b: 255, a: 255 };
        this.duration = 0;
        this.remainingTime = 0;
        this.active = false;
        this.animationProgress = 0;
        this.intensity = 1.0;
        this.vfxType = AttackVFXType.LINE;
    }
    isActive() {
        return this.active;
    }
    setActive(active) {
        this.active = active;
        if (!active) {
            this.remainingTime = 0;
        }
    }
}
export var AttackVFXType;
(function (AttackVFXType) {
    AttackVFXType["LINE"] = "line";
    AttackVFXType["BEAM"] = "beam";
    AttackVFXType["PULSE"] = "pulse";
    AttackVFXType["EXPLOSION"] = "explosion"; // 爆炸
})(AttackVFXType || (AttackVFXType = {}));
// 工廠函數用於創建物件池
export function createAttackVFXPool(p, initialSize = 20, maxSize = 100) {
    const ObjectPool = require('../utils/ObjectPool').ObjectPool;
    return new ObjectPool(() => new PooledAttackVFX(p), initialSize, maxSize);
}
//# sourceMappingURL=PooledAttackVFX.js.map