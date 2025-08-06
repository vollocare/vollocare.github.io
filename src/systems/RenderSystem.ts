// RenderSystem - 渲染系統，整合 TextWithViewPort 功能
/// <reference path="../types/p5.d.ts" />

import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { Color } from '../types/common';
import { IVector } from '../types/vector';

export interface IRenderSystem {
  // 基本渲染方法
  render(): void;
  clear(): void;
  
  // 視窗控制
  setViewPort(viewX: number, viewY: number): void;
  getViewPort(): { x: number; y: number };
  
  // 文字渲染（跟隨相機）
  renderText(text: string, x: number, y: number, color?: Color): void;
  
  // 實體渲染
  renderUnits(units: IUnit[]): void;
  renderObstacles(obstacles: IObstacle[]): void;
  
  // 除錯渲染
  renderDebugInfo(info: DebugInfo): void;
  renderArrows(enabled: boolean): void;
  renderTargetLines(enabled: boolean): void;
  renderUnitStats(enabled: boolean): void;
  
  // 效果渲染
  renderAttackEffects(effects: AttackEffect[]): void;
  renderHealthBars(units: IUnit[]): void;
  
  // 系統控制
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

export class TextWithViewPort {
  private p: p5Instance;
  private displayWidth: number = 0;
  private displayHeight: number;
  private viewX: number = 0;
  private viewY: number = 0;
  private textScreen: any; // p5.Graphics
  
  constructor(p: p5Instance, displayWidth: number, displayHeight: number) {
    this.p = p;
    // this._displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.textScreen = (p as any).createGraphics ? (p as any).createGraphics(displayWidth, displayHeight) : null;
  }
  
  public setViewPort(viewX: number, viewY: number): void {
    this.viewX = viewX;
    this.viewY = viewY;
  }
  
  public clear(): void {
    if (this.textScreen) {
      this.textScreen.clear();
    }
  }
  
  public fill(color: Color): void {
    if (this.textScreen) {
      this.textScreen.fill(color.r, color.g, color.b, color.a || 255);
    }
  }
  
  public text(text: string, x: number, y: number): void {
    if (this.textScreen) {
      const newX = x + this.displayWidth / 2 - this.viewX;
      const newY = y + this.displayHeight / 2 - this.viewY;
      this.textScreen.text(text, newX, newY);
    }
  }
  
  public render(): void {
    if (this.textScreen) {
      (this.p as any).image(
        this.textScreen,
        this.viewX - this.displayWidth / 2,
        this.viewY - this.displayHeight / 2
      );
    }
  }
}

export class RenderSystem implements IRenderSystem {
  private p: p5Instance;
  // private _displayWidth: number; // 暫時未使用
  private displayHeight: number;
  private textWithViewPort: TextWithViewPort;
  private backgroundColor: Color;
  
  // 渲染選項
  private showArrows: boolean = true;
  private showTargetLines: boolean = true;
  private showUnitStats: boolean = true;
  private showHealthBars: boolean = true;
  private showDebugInfo: boolean = true;
  
  // 渲染層級
  private renderLayers: Map<string, RenderLayer>;
  
  // 攻擊特效
  private attackEffects: AttackEffect[] = [];
  
  constructor(p: p5Instance, displayWidth: number, displayHeight: number) {
    this.p = p;
    // this._displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.textWithViewPort = new TextWithViewPort(p, displayWidth, displayHeight);
    this.backgroundColor = { r: 51, g: 51, b: 51 }; // 預設深灰背景
    
    // 初始化渲染層級
    this.renderLayers = new Map();
    this.initializeRenderLayers();
  }
  
  private initializeRenderLayers(): void {
    this.renderLayers.set('background', { name: 'background', visible: true, opacity: 1.0, zIndex: 0 });
    this.renderLayers.set('obstacles', { name: 'obstacles', visible: true, opacity: 1.0, zIndex: 1 });
    this.renderLayers.set('units', { name: 'units', visible: true, opacity: 1.0, zIndex: 2 });
    this.renderLayers.set('effects', { name: 'effects', visible: true, opacity: 1.0, zIndex: 3 });
    this.renderLayers.set('ui', { name: 'ui', visible: true, opacity: 1.0, zIndex: 4 });
    this.renderLayers.set('debug', { name: 'debug', visible: true, opacity: 1.0, zIndex: 5 });
  }
  
  // 主要渲染方法
  public render(): void {
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
  
  public clear(): void {
    this.p.background(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b);
    this.textWithViewPort.clear();
  }
  
  // 視窗控制
  public setViewPort(viewX: number, viewY: number): void {
    this.textWithViewPort.setViewPort(viewX, viewY);
  }
  
  public getViewPort(): { x: number; y: number } {
    return { x: 0, y: 0 }; // 簡化實作，實際應該從 textWithViewPort 取得
  }
  
  // 文字渲染
  public renderText(text: string, x: number, y: number, color?: Color): void {
    if (color) {
      this.textWithViewPort.fill(color);
    } else {
      this.textWithViewPort.fill({ r: 255, g: 255, b: 255 }); // 預設白色
    }
    this.textWithViewPort.text(text, x, y);
  }
  
  // 實體渲染
  public renderUnits(units: IUnit[]): void {
    if (!this.isLayerVisible('units')) return;
    
    for (const unit of units) {
      if (!unit.isAlive) continue;
      
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
  
  public renderObstacles(obstacles: IObstacle[]): void {
    if (!this.isLayerVisible('obstacles')) return;
    
    for (const obstacle of obstacles) {
      obstacle.render(this.p);
    }
  }
  
  // 單位生命條渲染
  private renderUnitHealthBar(unit: IUnit): void {
    const barWidth = 30;
    const barHeight = 4;
    const offsetY = -unit.r - 10;
    
    this.p.push();
    
    // 背景條（紅色）
    this.p.fill(255, 0, 0);
    this.p.noStroke();
    (this.p as any).rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, barWidth, barHeight);
    
    // 生命條（綠色）
    const healthRatio = unit.health / unit.maxHealth;
    const healthWidth = barWidth * healthRatio;
    this.p.fill(0, 255, 0);
    (this.p as any).rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, healthWidth, barHeight);
    
    this.p.pop();
  }
  
  // 單位統計資訊渲染
  private renderUnitStatistics(unit: IUnit): void {
    const offsetY = unit.r + 15;
    const stats = `HP:${Math.round(unit.health)} S:${unit.state}`;
    
    this.renderText(stats, unit.position.x, unit.position.y + offsetY, { r: 200, g: 200, b: 200 });
  }
  
  // 目標線渲染
  private renderTargetLine(unit: IUnit): void {
    if (!unit.destination) return;
    
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
  public renderDebugInfo(info: DebugInfo): void {
    if (!this.showDebugInfo || !this.isLayerVisible('debug')) return;
    
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
  public renderArrows(enabled: boolean): void {
    this.showArrows = enabled;
    // 實際的箭頭渲染會在 Flock 系統中呼叫 drawArrow 方法
  }
  
  // 目標線渲染控制
  public renderTargetLines(enabled: boolean): void {
    this.showTargetLines = enabled;
  }
  
  // 單位統計渲染控制
  public renderUnitStats(enabled: boolean): void {
    this.showUnitStats = enabled;
  }
  
  // 攻擊特效渲染
  public renderAttackEffects(effects: AttackEffect[]): void {
    if (!this.isLayerVisible('effects')) return;
    
    this.attackEffects = effects.filter(effect => effect.remainingTime > 0);
    
    for (const effect of this.attackEffects) {
      this.renderAttackEffect(effect);
    }
  }
  
  private renderAttackEffect(effect: AttackEffect): void {
    const alpha = (effect.remainingTime / effect.duration) * 255;
    
    this.p.push();
    this.p.stroke(effect.color.r, effect.color.g, effect.color.b, alpha);
    this.p.strokeWeight(3);
    
    // 繪製攻擊線
    this.p.line(
      effect.position.x, effect.position.y,
      effect.targetPosition.x, effect.targetPosition.y
    );
    
    // 攻擊點特效
    this.p.fill(effect.color.r, effect.color.g, effect.color.b, alpha);
    this.p.noStroke();
    this.p.circle(effect.targetPosition.x, effect.targetPosition.y, 8);
    
    this.p.pop();
  }
  
  // 生命條渲染
  public renderHealthBars(_units: IUnit[]): void {
    this.showHealthBars = true;
    // 實際渲染在 renderUnits 中處理
  }
  
  // 系統控制
  public setBackgroundColor(color: Color): void {
    this.backgroundColor = color;
  }
  
  public resize(width: number, height: number): void {
    // this._displayWidth = width;
    this.displayHeight = height;
    this.textWithViewPort = new TextWithViewPort(this.p, width, height);
  }
  
  // 渲染層級控制
  public setLayerVisible(layerName: string, visible: boolean): void {
    const layer = this.renderLayers.get(layerName);
    if (layer) {
      layer.visible = visible;
    }
  }
  
  public setLayerOpacity(layerName: string, opacity: number): void {
    const layer = this.renderLayers.get(layerName);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }
  
  private isLayerVisible(layerName: string): boolean {
    const layer = this.renderLayers.get(layerName);
    return layer ? layer.visible : true;
  }
  
  // 渲染設定
  public getRenderSettings(): {
    showArrows: boolean;
    showTargetLines: boolean;
    showUnitStats: boolean;
    showHealthBars: boolean;
    showDebugInfo: boolean;
  } {
    return {
      showArrows: this.showArrows,
      showTargetLines: this.showTargetLines,
      showUnitStats: this.showUnitStats,
      showHealthBars: this.showHealthBars,
      showDebugInfo: this.showDebugInfo
    };
  }
  
  public updateRenderSettings(settings: Partial<{
    showArrows: boolean;
    showTargetLines: boolean;
    showUnitStats: boolean;
    showHealthBars: boolean;
    showDebugInfo: boolean;
  }>): void {
    if (settings.showArrows !== undefined) this.showArrows = settings.showArrows;
    if (settings.showTargetLines !== undefined) this.showTargetLines = settings.showTargetLines;
    if (settings.showUnitStats !== undefined) this.showUnitStats = settings.showUnitStats;
    if (settings.showHealthBars !== undefined) this.showHealthBars = settings.showHealthBars;
    if (settings.showDebugInfo !== undefined) this.showDebugInfo = settings.showDebugInfo;
  }
}