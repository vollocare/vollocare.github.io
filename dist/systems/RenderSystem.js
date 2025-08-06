// RenderSystem - 渲染系統，整合 TextWithViewPort 功能
/// <reference path="../types/p5.d.ts" />
export class TextWithViewPort {
    constructor(p, displayWidth, displayHeight) {
        this.displayWidth = 0;
        this.viewX = 0;
        this.viewY = 0;
        this.p = p;
        // this._displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.textScreen = p.createGraphics ? p.createGraphics(displayWidth, displayHeight) : null;
    }
    setViewPort(viewX, viewY) {
        this.viewX = viewX;
        this.viewY = viewY;
    }
    clear() {
        if (this.textScreen) {
            this.textScreen.clear();
        }
    }
    fill(color) {
        if (this.textScreen) {
            this.textScreen.fill(color.r, color.g, color.b, color.a || 255);
        }
    }
    text(text, x, y) {
        if (this.textScreen) {
            const newX = x + this.displayWidth / 2 - this.viewX;
            const newY = y + this.displayHeight / 2 - this.viewY;
            this.textScreen.text(text, newX, newY);
        }
    }
    render() {
        if (this.textScreen) {
            this.p.image(this.textScreen, this.viewX - this.displayWidth / 2, this.viewY - this.displayHeight / 2);
        }
    }
}
export class RenderSystem {
    constructor(p, displayWidth, displayHeight) {
        // 渲染選項
        this.showArrows = true;
        this.showTargetLines = true;
        this.showUnitStats = true;
        this.showHealthBars = true;
        this.showDebugInfo = true;
        // 攻擊特效
        this.attackEffects = [];
        this.p = p;
        // this._displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.textWithViewPort = new TextWithViewPort(p, displayWidth, displayHeight);
        this.backgroundColor = { r: 51, g: 51, b: 51 }; // 預設深灰背景
        // 初始化渲染層級
        this.renderLayers = new Map();
        this.initializeRenderLayers();
    }
    initializeRenderLayers() {
        this.renderLayers.set('background', { name: 'background', visible: true, opacity: 1.0, zIndex: 0 });
        this.renderLayers.set('obstacles', { name: 'obstacles', visible: true, opacity: 1.0, zIndex: 1 });
        this.renderLayers.set('units', { name: 'units', visible: true, opacity: 1.0, zIndex: 2 });
        this.renderLayers.set('effects', { name: 'effects', visible: true, opacity: 1.0, zIndex: 3 });
        this.renderLayers.set('ui', { name: 'ui', visible: true, opacity: 1.0, zIndex: 4 });
        this.renderLayers.set('debug', { name: 'debug', visible: true, opacity: 1.0, zIndex: 5 });
    }
    // 主要渲染方法
    render() {
        // 清空畫面
        this.clear();
        // 按層級順序渲染
        const sortedLayers = Array.from(this.renderLayers.values())
            .filter(layer => layer.visible)
            .sort((a, b) => a.zIndex - b.zIndex);
        for (const layer of sortedLayers) {
            this.p.push();
            // 設定層級透明度
            if (layer.opacity < 1.0) {
                this.p.fill(255, 255, 255, layer.opacity * 255);
            }
            // 這裡會在具體渲染時填充
            this.p.pop();
        }
        // 渲染文字層
        this.textWithViewPort.render();
    }
    clear() {
        this.p.background(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b);
        this.textWithViewPort.clear();
    }
    // 視窗控制
    setViewPort(viewX, viewY) {
        this.textWithViewPort.setViewPort(viewX, viewY);
    }
    getViewPort() {
        return { x: 0, y: 0 }; // 簡化實作，實際應該從 textWithViewPort 取得
    }
    // 文字渲染
    renderText(text, x, y, color) {
        if (color) {
            this.textWithViewPort.fill(color);
        }
        else {
            this.textWithViewPort.fill({ r: 255, g: 255, b: 255 }); // 預設白色
        }
        this.textWithViewPort.text(text, x, y);
    }
    // 實體渲染
    renderUnits(units) {
        if (!this.isLayerVisible('units'))
            return;
        for (const unit of units) {
            if (!unit.isAlive)
                continue;
            this.p.push();
            // 渲染單位本體
            unit.render(this.p);
            // 渲染生命條
            if (this.showHealthBars) {
                this.renderUnitHealthBar(unit);
            }
            // 渲染單位統計資訊
            if (this.showUnitStats) {
                this.renderUnitStatistics(unit);
            }
            // 渲染目標線
            if (this.showTargetLines && unit.destination) {
                this.renderTargetLine(unit);
            }
            this.p.pop();
        }
    }
    renderObstacles(obstacles) {
        if (!this.isLayerVisible('obstacles'))
            return;
        for (const obstacle of obstacles) {
            obstacle.render(this.p);
        }
    }
    // 單位生命條渲染
    renderUnitHealthBar(unit) {
        const barWidth = 30;
        const barHeight = 4;
        const offsetY = -unit.r - 10;
        this.p.push();
        // 背景條（紅色）
        this.p.fill(255, 0, 0);
        this.p.noStroke();
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, barWidth, barHeight);
        // 生命條（綠色）
        const healthRatio = unit.health / unit.maxHealth;
        const healthWidth = barWidth * healthRatio;
        this.p.fill(0, 255, 0);
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, healthWidth, barHeight);
        this.p.pop();
    }
    // 單位統計資訊渲染
    renderUnitStatistics(unit) {
        const offsetY = unit.r + 15;
        const stats = `HP:${Math.round(unit.health)} S:${unit.state}`;
        this.renderText(stats, unit.position.x, unit.position.y + offsetY, { r: 200, g: 200, b: 200 });
    }
    // 目標線渲染
    renderTargetLine(unit) {
        if (!unit.destination)
            return;
        this.p.push();
        this.p.stroke(100, 100, 255, 150); // 半透明藍色
        this.p.strokeWeight(1);
        this.p.line(unit.position.x, unit.position.y, unit.destination.x, unit.destination.y);
        // 目標點標記
        this.p.fill(100, 100, 255);
        this.p.noStroke();
        this.p.circle(unit.destination.x, unit.destination.y, 6);
        this.p.pop();
    }
    // 除錯資訊渲染
    renderDebugInfo(info) {
        if (!this.showDebugInfo || !this.isLayerVisible('debug'))
            return;
        const debugText = [
            `FPS: ${Math.round(info.frameRate)}`,
            `Units: ${info.unitCount}`,
            `Obstacles: ${info.obstacleCount}`,
            `Control: P${info.currentControl}`,
            `PVP: ${info.isPVP ? 'ON' : 'OFF'}`,
            `View: (${Math.round(info.viewX)}, ${Math.round(info.viewY)})`
        ];
        const startX = 10;
        let startY = this.displayHeight - 150;
        for (const text of debugText) {
            this.renderText(text, startX, startY, { r: 255, g: 255, b: 0 }); // 黃色
            startY += 20;
        }
    }
    // 箭頭渲染（群體行為可視化）
    renderArrows(enabled) {
        this.showArrows = enabled;
        // 實際的箭頭渲染會在 Flock 系統中呼叫 drawArrow 方法
    }
    // 目標線渲染控制
    renderTargetLines(enabled) {
        this.showTargetLines = enabled;
    }
    // 單位統計渲染控制
    renderUnitStats(enabled) {
        this.showUnitStats = enabled;
    }
    // 攻擊特效渲染
    renderAttackEffects(effects) {
        if (!this.isLayerVisible('effects'))
            return;
        this.attackEffects = effects.filter(effect => effect.remainingTime > 0);
        for (const effect of this.attackEffects) {
            this.renderAttackEffect(effect);
        }
    }
    renderAttackEffect(effect) {
        const alpha = (effect.remainingTime / effect.duration) * 255;
        this.p.push();
        this.p.stroke(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.strokeWeight(3);
        // 繪製攻擊線
        this.p.line(effect.position.x, effect.position.y, effect.targetPosition.x, effect.targetPosition.y);
        // 攻擊點特效
        this.p.fill(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.noStroke();
        this.p.circle(effect.targetPosition.x, effect.targetPosition.y, 8);
        this.p.pop();
    }
    // 生命條渲染
    renderHealthBars(_units) {
        this.showHealthBars = true;
        // 實際渲染在 renderUnits 中處理
    }
    // 系統控制
    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
    resize(width, height) {
        // this._displayWidth = width;
        this.displayHeight = height;
        this.textWithViewPort = new TextWithViewPort(this.p, width, height);
    }
    // 渲染層級控制
    setLayerVisible(layerName, visible) {
        const layer = this.renderLayers.get(layerName);
        if (layer) {
            layer.visible = visible;
        }
    }
    setLayerOpacity(layerName, opacity) {
        const layer = this.renderLayers.get(layerName);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
        }
    }
    isLayerVisible(layerName) {
        const layer = this.renderLayers.get(layerName);
        return layer ? layer.visible : true;
    }
    // 渲染設定
    getRenderSettings() {
        return {
            showArrows: this.showArrows,
            showTargetLines: this.showTargetLines,
            showUnitStats: this.showUnitStats,
            showHealthBars: this.showHealthBars,
            showDebugInfo: this.showDebugInfo
        };
    }
    updateRenderSettings(settings) {
        if (settings.showArrows !== undefined)
            this.showArrows = settings.showArrows;
        if (settings.showTargetLines !== undefined)
            this.showTargetLines = settings.showTargetLines;
        if (settings.showUnitStats !== undefined)
            this.showUnitStats = settings.showUnitStats;
        if (settings.showHealthBars !== undefined)
            this.showHealthBars = settings.showHealthBars;
        if (settings.showDebugInfo !== undefined)
            this.showDebugInfo = settings.showDebugInfo;
    }
}
//# sourceMappingURL=RenderSystem.js.map