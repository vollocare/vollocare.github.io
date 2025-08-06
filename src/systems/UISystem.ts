// UISystem - UI 系統，管理按鈕控制邏輯和界面元素
/// <reference path="../types/p5.d.ts" />

import { ControlMode } from '../types/common';
import { IVector } from '../types/vector';

export interface IUISystem {
  // 系統管理
  initialize(): void;
  update(deltaTime: number): void;
  destroy(): void;
  
  // 按鈕管理
  createButton(id: string, text: string, x: number, y: number, callback: () => void): UIButton;
  getButton(id: string): UIButton | undefined;
  removeButton(id: string): void;
  
  // UI 狀態
  updateControlDisplay(control: ControlMode): void;
  updatePVPDisplay(isPVP: boolean): void;
  updateArrowDisplay(showArrows: boolean): void;
  updateTargetLineDisplay(showTargetLines: boolean): void;
  updateUnitStatsDisplay(showUnitStats: boolean): void;
  
  // 統計資訊顯示
  updateUnitCounts(unitCounts: number[]): void;
  
  // 事件處理
  addEventListener(eventType: UIEventType, callback: UIEventCallback): void;
  removeEventListener(eventType: UIEventType, callback: UIEventCallback): void;
}

export enum UIEventType {
  CONTROL_CHANGED = 'control_changed',
  PVP_TOGGLED = 'pvp_toggled',
  NEW_UNIT_REQUESTED = 'new_unit_requested',
  ARROW_TOGGLED = 'arrow_toggled',
  TARGET_LINE_TOGGLED = 'target_line_toggled',
  UNIT_STATS_TOGGLED = 'unit_stats_toggled',
  BUTTON_CLICKED = 'button_clicked'
}

export type UIEventCallback = (event: UIEvent) => void;

export interface UIEvent {
  type: UIEventType;
  timestamp: number;
  buttonId?: string;
  data?: any;
}

export interface UIButton {
  id: string;
  element: any; // p5 button element
  text: string;
  position: IVector;
  visible: boolean;
  enabled: boolean;
  callback: () => void;
  
  // 更新方法
  setText(text: string): void;
  setVisible(visible: boolean): void;
  setEnabled(enabled: boolean): void;
  setPosition(x: number, y: number): void;
  destroy(): void;
}

export interface UIPanel {
  id: string;
  position: IVector;
  size: IVector;
  visible: boolean;
  buttons: UIButton[];
  
  // 管理方法
  addButton(button: UIButton): void;
  removeButton(buttonId: string): void;
  setVisible(visible: boolean): void;
}

class Button implements UIButton {
  public id: string;
  public element: any;
  public text: string;
  public position: IVector;
  public visible: boolean = true;
  public enabled: boolean = true;
  public callback: () => void;
  
  constructor(p: p5Instance, id: string, text: string, x: number, y: number, callback: () => void) {
    this.id = id;
    this.text = text;
    this.position = { x, y } as IVector;
    this.callback = callback;
    
    // 創建 p5 按鈕元素
    this.element = (p as any).createButton(text);
    this.element.position(x, y);
    this.element.mousePressed(() => {
      if (this.visible && this.enabled) {
        this.callback();
      }
    });
  }
  
  public setText(text: string): void {
    this.text = text;
    if (this.element && this.element.html) {
      this.element.html(text);
    }
  }
  
  public setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.element) {
      this.element.style('display', visible ? 'block' : 'none');
    }
  }
  
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.element) {
      this.element.attribute('disabled', enabled ? null : 'disabled');
    }
  }
  
  public setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    if (this.element && this.element.position) {
      this.element.position(x, y);
    }
  }
  
  public destroy(): void {
    if (this.element && this.element.remove) {
      this.element.remove();
    }
    this.element = null;
  }
}

export class UISystem implements IUISystem {
  private p: p5Instance;
  private buttons: Map<string, UIButton>;
  private panels: Map<string, UIPanel>;
  private eventListeners: Map<UIEventType, UIEventCallback[]>;
  
  // UI 狀態
  private currentControl: ControlMode = ControlMode.PLAYER;
  private isPVP: boolean = false;
  private showArrows: boolean = true;
  private showTargetLines: boolean = true;
  private showUnitStats: boolean = true;
  
  // 顯示配置
  private displayWidth: number;
  // private _displayHeight: number; // 暫時未使用
  
  constructor(p: p5Instance, displayWidth: number, _displayHeight: number) {
    this.p = p;
    this.displayWidth = displayWidth;
    // this._displayHeight = displayHeight;
    this.buttons = new Map();
    this.panels = new Map();
    this.eventListeners = new Map();
    
    this.initializeEventListeners();
  }
  
  private initializeEventListeners(): void {
    Object.values(UIEventType).forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }
  
  // 系統管理
  public initialize(): void {
    this.createDefaultButtons();
  }
  
  private createDefaultButtons(): void {
    // 控制切換按鈕
    this.createButton('control_change', '控制_P1', 20, 20, () => {
      this.changeControl();
    });
    
    // 新增單位按鈕
    this.createButton('new_unit', '新單位', 20, 50, () => {
      this.requestNewUnits();
    });
    
    // PVP 模式切換
    this.createButton('pvp_toggle', 'PVP F', 20, 80, () => {
      this.togglePVP();
    });
    
    // 右側顯示選項按鈕
    const rightX = this.displayWidth - 120;
    
    this.createButton('arrow_toggle', 'Arrow ON', rightX, 20, () => {
      this.toggleArrows();
    });
    
    this.createButton('target_line_toggle', 'Target ON', rightX, 50, () => {
      this.toggleTargetLines();
    });
    
    this.createButton('unit_stats_toggle', 'Stats ON', rightX, 80, () => {
      this.toggleUnitStats();
    });
  }
  
  public update(_deltaTime: number): void {
    // UI 系統的更新邏輯（如果需要）
    // 例如：動畫、狀態檢查等
  }
  
  public destroy(): void {
    // 清理所有按鈕
    this.buttons.forEach(button => {
      button.destroy();
    });
    this.buttons.clear();
    
    // 清理事件監聽器
    this.eventListeners.clear();
  }
  
  // 按鈕管理
  public createButton(id: string, text: string, x: number, y: number, callback: () => void): UIButton {
    // 如果按鈕已存在，先移除
    if (this.buttons.has(id)) {
      this.removeButton(id);
    }
    
    const button = new Button(this.p, id, text, x, y, callback);
    this.buttons.set(id, button);
    return button;
  }
  
  public getButton(id: string): UIButton | undefined {
    return this.buttons.get(id);
  }
  
  public removeButton(id: string): void {
    const button = this.buttons.get(id);
    if (button) {
      button.destroy();
      this.buttons.delete(id);
    }
  }
  
  // UI 事件處理方法
  private changeControl(): void {
    // 循環切換控制模式
    switch (this.currentControl) {
      case ControlMode.PLAYER:
        this.currentControl = ControlMode.ENEMY;
        break;
      case ControlMode.ENEMY:
        this.currentControl = ControlMode.ENEMY2;
        break;
      case ControlMode.ENEMY2:
        this.currentControl = ControlMode.PLAYER;
        break;
      default:
        this.currentControl = ControlMode.PLAYER;
    }
    
    this.updateControlDisplay(this.currentControl);
    
    this.triggerEvent({
      type: UIEventType.CONTROL_CHANGED,
      timestamp: Date.now(),
      data: { control: this.currentControl }
    });
  }
  
  private requestNewUnits(): void {
    this.triggerEvent({
      type: UIEventType.NEW_UNIT_REQUESTED,
      timestamp: Date.now(),
      data: { control: this.currentControl }
    });
  }
  
  private togglePVP(): void {
    this.isPVP = !this.isPVP;
    this.updatePVPDisplay(this.isPVP);
    
    this.triggerEvent({
      type: UIEventType.PVP_TOGGLED,
      timestamp: Date.now(),
      data: { isPVP: this.isPVP }
    });
  }
  
  private toggleArrows(): void {
    this.showArrows = !this.showArrows;
    this.updateArrowDisplay(this.showArrows);
    
    this.triggerEvent({
      type: UIEventType.ARROW_TOGGLED,
      timestamp: Date.now(),
      data: { showArrows: this.showArrows }
    });
  }
  
  private toggleTargetLines(): void {
    this.showTargetLines = !this.showTargetLines;
    this.updateTargetLineDisplay(this.showTargetLines);
    
    this.triggerEvent({
      type: UIEventType.TARGET_LINE_TOGGLED,
      timestamp: Date.now(),
      data: { showTargetLines: this.showTargetLines }
    });
  }
  
  private toggleUnitStats(): void {
    this.showUnitStats = !this.showUnitStats;
    this.updateUnitStatsDisplay(this.showUnitStats);
    
    this.triggerEvent({
      type: UIEventType.UNIT_STATS_TOGGLED,
      timestamp: Date.now(),
      data: { showUnitStats: this.showUnitStats }
    });
  }
  
  // UI 狀態更新
  public updateControlDisplay(control: ControlMode): void {
    this.currentControl = control;
    const button = this.getButton('control_change');
    if (button) {
      button.setText(`控制_P${control}`);
    }
  }
  
  public updatePVPDisplay(isPVP: boolean): void {
    this.isPVP = isPVP;
    const button = this.getButton('pvp_toggle');
    if (button) {
      button.setText(isPVP ? 'PVP T' : 'PVP F');
    }
  }
  
  public updateArrowDisplay(showArrows: boolean): void {
    this.showArrows = showArrows;
    const button = this.getButton('arrow_toggle');
    if (button) {
      button.setText(showArrows ? 'Arrow ON' : 'Arrow OFF');
    }
  }
  
  public updateTargetLineDisplay(showTargetLines: boolean): void {
    this.showTargetLines = showTargetLines;
    const button = this.getButton('target_line_toggle');
    if (button) {
      button.setText(showTargetLines ? 'Target ON' : 'Target OFF');
    }
  }
  
  public updateUnitStatsDisplay(showUnitStats: boolean): void {
    this.showUnitStats = showUnitStats;
    const button = this.getButton('unit_stats_toggle');
    if (button) {
      button.setText(showUnitStats ? 'Stats ON' : 'Stats OFF');
    }
  }
  
  // 統計資訊顯示（在遊戲中顯示，不是 DOM 按鈕）
  public updateUnitCounts(_unitCounts: number[]): void {
    // 這個方法會被渲染系統調用來顯示單位統計
    // 實際的文字渲染會在 RenderSystem 中處理
  }
  
  // 事件系統
  public addEventListener(eventType: UIEventType, callback: UIEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners && !listeners.includes(callback)) {
      listeners.push(callback);
    }
  }
  
  public removeEventListener(eventType: UIEventType, callback: UIEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private triggerEvent(event: UIEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in UI event callback for ${event.type}:`, error);
        }
      });
    }
  }
  
  // 狀態查詢
  public getCurrentControl(): ControlMode {
    return this.currentControl;
  }
  
  public getIsPVP(): boolean {
    return this.isPVP;
  }
  
  public getDisplaySettings(): {
    showArrows: boolean;
    showTargetLines: boolean;
    showUnitStats: boolean;
  } {
    return {
      showArrows: this.showArrows,
      showTargetLines: this.showTargetLines,
      showUnitStats: this.showUnitStats
    };
  }
  
  // 批量狀態設定
  public updateAllDisplaySettings(settings: {
    isPVP?: boolean;
    showArrows?: boolean;
    showTargetLines?: boolean;
    showUnitStats?: boolean;
  }): void {
    if (settings.isPVP !== undefined) {
      this.isPVP = settings.isPVP;
      this.updatePVPDisplay(this.isPVP);
    }
    
    if (settings.showArrows !== undefined) {
      this.showArrows = settings.showArrows;
      this.updateArrowDisplay(this.showArrows);
    }
    
    if (settings.showTargetLines !== undefined) {
      this.showTargetLines = settings.showTargetLines;
      this.updateTargetLineDisplay(this.showTargetLines);
    }
    
    if (settings.showUnitStats !== undefined) {
      this.showUnitStats = settings.showUnitStats;
      this.updateUnitStatsDisplay(this.showUnitStats);
    }
  }
  
  // 面板管理（高級功能）
  public createPanel(id: string, x: number, y: number, width: number, height: number): UIPanel {
    const panel: UIPanel = {
      id,
      position: { x, y } as IVector,
      size: { x: width, y: height } as IVector,
      visible: true,
      buttons: [],
      
      addButton: (button: UIButton) => {
        panel.buttons.push(button);
      },
      
      removeButton: (buttonId: string) => {
        const index = panel.buttons.findIndex(b => b.id === buttonId);
        if (index !== -1) {
          panel.buttons[index].destroy();
          panel.buttons.splice(index, 1);
        }
      },
      
      setVisible: (visible: boolean) => {
        panel.visible = visible;
        panel.buttons.forEach(button => {
          button.setVisible(visible);
        });
      }
    };
    
    this.panels.set(id, panel);
    return panel;
  }
  
  public getPanel(id: string): UIPanel | undefined {
    return this.panels.get(id);
  }
  
  public removePanel(id: string): void {
    const panel = this.panels.get(id);
    if (panel) {
      panel.buttons.forEach(button => {
        button.destroy();
      });
      this.panels.delete(id);
    }
  }
}