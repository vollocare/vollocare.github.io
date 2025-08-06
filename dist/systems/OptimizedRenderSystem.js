// OptimizedRenderSystem - 優化渲染系統，包含視錐剔除、LOD、批次渲染等優化技術
/// <reference path="../types/p5.d.ts" />
import { Vector } from '../utils/Vector';
export var LODLevel;
(function (LODLevel) {
    LODLevel[LODLevel["HIGH"] = 0] = "HIGH";
    LODLevel[LODLevel["MEDIUM"] = 1] = "MEDIUM";
    LODLevel[LODLevel["LOW"] = 2] = "LOW";
    LODLevel[LODLevel["HIDDEN"] = 3] = "HIDDEN"; // 不渲染（極遠距離）
})(LODLevel || (LODLevel = {}));
export class OptimizedRenderSystem {
    constructor(p, displayWidth, displayHeight, config) {
        // 視錐和相機
        this.viewBounds = { left: 0, right: 0, top: 0, bottom: 0 };
        // 渲染批次
        this.renderBatches = new Map();
        // 統計資料
        this.stats = {
            totalObjects: 0,
            renderedObjects: 0,
            culledObjects: 0,
            lodBreakdown: { [LODLevel.HIGH]: 0, [LODLevel.MEDIUM]: 0, [LODLevel.LOW]: 0, [LODLevel.HIDDEN]: 0 },
            batchCount: 0,
            frameTime: 0
        };
        this.visibilityCache = new Map();
        this.cacheExpireTime = 100; // 100ms
        this.p = p;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        // 預設配置
        this.config = {
            enableFrustumCulling: true,
            frustumMargin: 100,
            enableLOD: true,
            lodDistances: [200, 500, 1000],
            enableBatching: true,
            maxBatchSize: 100,
            enableOcclusion: false,
            maxRenderObjects: 500,
            showLODLevels: false,
            showCullingBounds: false,
            ...config
        };
        // 初始化向量
        this.cameraPosition = new Vector(this.p, 0, 0);
        this.lastCameraPosition = new Vector(this.p, 0, 0);
        // 初始化渲染批次
        for (const level of Object.values(LODLevel)) {
            if (typeof level === 'number') {
                this.renderBatches.set(level, {
                    lodLevel: level,
                    units: [],
                    obstacles: [],
                    effects: []
                });
            }
        }
    }
    // 主渲染方法
    render() {
        const frameStart = performance.now();
        this.clear();
        this.resetStats();
        // 渲染各個批次
        for (const [, batch] of this.renderBatches) {
            if (batch.units.length === 0 && batch.obstacles.length === 0 && batch.effects.length === 0)
                continue;
            this.p.push();
            this.renderBatch(batch);
            this.p.pop();
            this.stats.batchCount++;
        }
        // 清空批次
        this.clearBatches();
        this.stats.frameTime = performance.now() - frameStart;
    }
    clear() {
        this.p.background(51);
    }
    // 視窗控制
    setViewPort(viewX, viewY) {
        this.cameraPosition = new Vector(this.p, viewX, viewY);
        // 更新視錐邊界
        const margin = this.config.frustumMargin;
        this.viewBounds = {
            left: viewX - this.displayWidth / 2 - margin,
            right: viewX + this.displayWidth / 2 + margin,
            top: viewY - this.displayHeight / 2 - margin,
            bottom: viewY + this.displayHeight / 2 + margin
        };
        // 如果相機移動較大，清理快取
        const dx = Math.abs(this.cameraPosition.x - this.lastCameraPosition.x);
        const dy = Math.abs(this.cameraPosition.y - this.lastCameraPosition.y);
        if (dx > 50 || dy > 50) {
            this.visibilityCache.clear();
            this.lastCameraPosition = { ...this.cameraPosition };
        }
    }
    getViewPort() {
        return this.cameraPosition;
    }
    // 文字渲染
    renderText(text, x, y, color) {
        if (color) {
            this.p.fill(color.r, color.g, color.b, color.a || 255);
        }
        else {
            this.p.fill(255);
        }
        this.p.text(text, x, y);
    }
    // 實體渲染 - 主要優化入口
    renderUnits(units) {
        this.stats.totalObjects += units.length;
        // 視錐剔除和 LOD 分類
        for (const unit of units) {
            if (!unit.isAlive)
                continue;
            const visibility = this.checkVisibility(unit);
            if (!visibility.visible) {
                this.stats.culledObjects++;
                continue;
            }
            // 添加到對應的批次
            const batch = this.renderBatches.get(visibility.lodLevel);
            if (batch) {
                batch.units.push(unit);
                this.stats.lodBreakdown[visibility.lodLevel]++;
                this.stats.renderedObjects++;
            }
        }
    }
    renderObstacles(obstacles) {
        this.stats.totalObjects += obstacles.length;
        for (const obstacle of obstacles) {
            const visibility = this.checkVisibility(obstacle);
            if (!visibility.visible) {
                this.stats.culledObjects++;
                continue;
            }
            const batch = this.renderBatches.get(visibility.lodLevel);
            if (batch) {
                batch.obstacles.push(obstacle);
                this.stats.renderedObjects++;
            }
        }
    }
    // 除錯渲染
    renderDebugInfo(_info) {
        const debugText = [
            `Render Stats:`,
            `Objects: ${this.stats.renderedObjects}/${this.stats.totalObjects}`,
            `Culled: ${this.stats.culledObjects}`,
            `Batches: ${this.stats.batchCount}`,
            `Frame: ${this.stats.frameTime.toFixed(2)}ms`,
            `High: ${this.stats.lodBreakdown[LODLevel.HIGH]}`,
            `Med: ${this.stats.lodBreakdown[LODLevel.MEDIUM]}`,
            `Low: ${this.stats.lodBreakdown[LODLevel.LOW]}`
        ];
        this.p.fill(255, 255, 0);
        this.p.textAlign(this.p.LEFT, this.p.TOP);
        let yOffset = this.displayHeight - 200;
        for (const text of debugText) {
            this.p.text(text, 10, yOffset);
            yOffset += 15;
        }
        // 渲染視錐邊界
        if (this.config.showCullingBounds) {
            this.renderCullingBounds();
        }
    }
    renderArrows(_enabled) {
        // 實作箭頭渲染
    }
    renderTargetLines(_enabled) {
        // 實作目標線渲染
    }
    renderUnitStats(_enabled) {
        // 實作單位統計渲染
    }
    renderAttackEffects(effects) {
        this.stats.totalObjects += effects.length;
        for (const effect of effects) {
            const visibility = this.checkVisibility({ position: effect.position, r: 10 });
            if (!visibility.visible) {
                this.stats.culledObjects++;
                continue;
            }
            const batch = this.renderBatches.get(visibility.lodLevel);
            if (batch) {
                batch.effects.push(effect);
                this.stats.renderedObjects++;
            }
        }
    }
    renderHealthBars(_units) {
        // 在 renderUnits 中處理
    }
    setBackgroundColor(_color) {
        // 設定背景色
    }
    resize(width, height) {
        this.displayWidth = width;
        this.displayHeight = height;
    }
    // 可見性檢查（視錐剔除 + LOD）
    checkVisibility(obj) {
        const objId = `${obj.position.x.toFixed(0)},${obj.position.y.toFixed(0)}`;
        // 檢查快取
        const cached = this.visibilityCache.get(objId);
        const now = Date.now();
        if (cached && now - cached.timestamp < this.cacheExpireTime) {
            return { visible: cached.visible, lodLevel: cached.lodLevel };
        }
        let visible = true;
        let lodLevel = LODLevel.HIGH;
        // 視錐剔除
        if (this.config.enableFrustumCulling) {
            const radius = obj.r || 1;
            visible = this.isInFrustum(obj.position, radius);
        }
        // LOD 計算
        if (visible && this.config.enableLOD) {
            lodLevel = this.calculateLOD(obj.position);
            if (lodLevel === LODLevel.HIDDEN) {
                visible = false;
            }
        }
        // 快取結果
        this.visibilityCache.set(objId, { visible, lodLevel, timestamp: now });
        return { visible, lodLevel };
    }
    isInFrustum(position, radius) {
        return position.x + radius > this.viewBounds.left &&
            position.x - radius < this.viewBounds.right &&
            position.y + radius > this.viewBounds.top &&
            position.y - radius < this.viewBounds.bottom;
    }
    calculateLOD(position) {
        const dx = position.x - this.cameraPosition.x;
        const dy = position.y - this.cameraPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const distances = this.config.lodDistances;
        if (distance < distances[0])
            return LODLevel.HIGH;
        if (distance < distances[1])
            return LODLevel.MEDIUM;
        if (distance < distances[2])
            return LODLevel.LOW;
        return LODLevel.HIDDEN;
    }
    // 批次渲染
    renderBatch(batch) {
        // 渲染障礙物
        for (const obstacle of batch.obstacles) {
            this.renderObstacleWithLOD(obstacle, batch.lodLevel);
        }
        // 渲染單位
        for (const unit of batch.units) {
            this.renderUnitWithLOD(unit, batch.lodLevel);
        }
        // 渲染特效
        for (const effect of batch.effects) {
            this.renderEffectWithLOD(effect, batch.lodLevel);
        }
    }
    renderUnitWithLOD(unit, lodLevel) {
        this.p.push();
        // LOD 偵錯顏色
        if (this.config.showLODLevels) {
            switch (lodLevel) {
                case LODLevel.HIGH:
                    this.p.tint(255, 255, 255);
                    break;
                case LODLevel.MEDIUM:
                    this.p.tint(255, 255, 0);
                    break;
                case LODLevel.LOW:
                    this.p.tint(255, 0, 0);
                    break;
            }
        }
        switch (lodLevel) {
            case LODLevel.HIGH:
                // 高品質渲染：完整細節
                unit.render(this.p);
                this.renderUnitDetails(unit);
                break;
            case LODLevel.MEDIUM:
                // 中品質渲染：基本形狀 + 生命條
                this.renderUnitSimple(unit);
                this.renderHealthBar(unit);
                break;
            case LODLevel.LOW:
                // 低品質渲染：僅基本形狀
                this.renderUnitMinimal(unit);
                break;
        }
        this.p.pop();
    }
    renderObstacleWithLOD(obstacle, lodLevel) {
        switch (lodLevel) {
            case LODLevel.HIGH:
            case LODLevel.MEDIUM:
                obstacle.render(this.p);
                break;
            case LODLevel.LOW:
                // 簡化渲染
                this.p.fill(100);
                this.p.noStroke();
                this.p.circle(obstacle.position.x, obstacle.position.y, obstacle.radius * 1.5);
                break;
        }
    }
    renderEffectWithLOD(effect, lodLevel) {
        if (lodLevel === LODLevel.LOW)
            return; // 遠距離不渲染特效
        const alpha = (effect.remainingTime / effect.duration) * 255;
        this.p.stroke(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.strokeWeight(lodLevel === LODLevel.HIGH ? 3 : 1);
        this.p.line(effect.position.x, effect.position.y, effect.targetPosition.x, effect.targetPosition.y);
    }
    // 單位渲染的不同品質等級
    renderUnitSimple(unit) {
        // 簡化的單位渲染
        const colors = [
            [0, 255, 0], // 群組 1 - 綠色
            [255, 0, 0], // 群組 2 - 紅色  
            [0, 0, 255], // 群組 3 - 藍色
        ];
        const colorIndex = Math.min((unit.groupId || 1) - 1, colors.length - 1);
        const color = colors[colorIndex];
        this.p.fill(color[0], color[1], color[2]);
        this.p.noStroke();
        this.p.circle(unit.position.x, unit.position.y, unit.r * 2);
    }
    renderUnitMinimal(unit) {
        // 最簡單的單位渲染
        this.p.fill(200);
        this.p.noStroke();
        this.p.circle(unit.position.x, unit.position.y, unit.r);
    }
    renderUnitDetails(unit) {
        // 高品質渲染的額外細節
        if (unit.state === 'attack') {
            // 攻擊狀態指示
            this.p.stroke(255, 0, 0);
            this.p.strokeWeight(2);
            this.p.noFill();
            this.p.circle(unit.position.x, unit.position.y, unit.r * 3);
        }
    }
    renderHealthBar(unit) {
        if (unit.health <= 0)
            return;
        const barWidth = unit.r * 2;
        const barHeight = 3;
        const offsetY = -unit.r - 8;
        // 背景
        this.p.fill(255, 0, 0);
        this.p.noStroke();
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, barWidth, barHeight);
        // 生命
        const healthRatio = unit.health / unit.maxHealth;
        this.p.fill(0, 255, 0);
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, barWidth * healthRatio, barHeight);
    }
    renderCullingBounds() {
        this.p.stroke(0, 255, 0, 100);
        this.p.strokeWeight(2);
        this.p.noFill();
        const bounds = this.viewBounds;
        this.p.rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    }
    // 批次管理
    clearBatches() {
        for (const batch of this.renderBatches.values()) {
            batch.units = [];
            batch.obstacles = [];
            batch.effects = [];
        }
    }
    resetStats() {
        this.stats = {
            totalObjects: 0,
            renderedObjects: 0,
            culledObjects: 0,
            lodBreakdown: { [LODLevel.HIGH]: 0, [LODLevel.MEDIUM]: 0, [LODLevel.LOW]: 0, [LODLevel.HIDDEN]: 0 },
            batchCount: 0,
            frameTime: 0
        };
    }
    // 配置和統計
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // 清理快取當配置改變時
        this.visibilityCache.clear();
    }
    getRenderStats() {
        return { ...this.stats };
    }
    getConfig() {
        return { ...this.config };
    }
}
//# sourceMappingURL=OptimizedRenderSystem.js.map