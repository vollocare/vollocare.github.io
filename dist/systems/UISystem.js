// UISystem - UI 系統，管理按鈕控制邏輯和界面元素
/// <reference path="../types/p5.d.ts" />
import { ControlMode } from '../types/common';
export var UIEventType;
(function (UIEventType) {
    UIEventType["CONTROL_CHANGED"] = "control_changed";
    UIEventType["PVP_TOGGLED"] = "pvp_toggled";
    UIEventType["NEW_UNIT_REQUESTED"] = "new_unit_requested";
    UIEventType["ARROW_TOGGLED"] = "arrow_toggled";
    UIEventType["TARGET_LINE_TOGGLED"] = "target_line_toggled";
    UIEventType["UNIT_STATS_TOGGLED"] = "unit_stats_toggled";
    UIEventType["BUTTON_CLICKED"] = "button_clicked";
})(UIEventType || (UIEventType = {}));
class Button {
    constructor(p, id, text, x, y, callback) {
        this.visible = true;
        this.enabled = true;
        this.id = id;
        this.text = text;
        this.position = { x, y };
        this.callback = callback;
        // 創建 p5 按鈕元素
        this.element = p.createButton(text);
        this.element.position(x, y);
        this.element.mousePressed(() => {
            if (this.visible && this.enabled) {
                this.callback();
            }
        });
    }
    setText(text) {
        this.text = text;
        if (this.element && this.element.html) {
            this.element.html(text);
        }
    }
    setVisible(visible) {
        this.visible = visible;
        if (this.element) {
            this.element.style('display', visible ? 'block' : 'none');
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.element) {
            this.element.attribute('disabled', enabled ? null : 'disabled');
        }
    }
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        if (this.element && this.element.position) {
            this.element.position(x, y);
        }
    }
    destroy() {
        if (this.element && this.element.remove) {
            this.element.remove();
        }
        this.element = null;
    }
}
export class UISystem {
    // private _displayHeight: number; // 暫時未使用
    constructor(p, displayWidth, _displayHeight) {
        // UI 狀態
        this.currentControl = ControlMode.PLAYER;
        this.isPVP = false;
        this.showArrows = true;
        this.showTargetLines = true;
        this.showUnitStats = true;
        this.p = p;
        this.displayWidth = displayWidth;
        // this._displayHeight = displayHeight;
        this.buttons = new Map();
        this.panels = new Map();
        this.eventListeners = new Map();
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        Object.values(UIEventType).forEach(eventType => {
            this.eventListeners.set(eventType, []);
        });
    }
    // 系統管理
    initialize() {
        this.createDefaultButtons();
    }
    createDefaultButtons() {
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
    update(_deltaTime) {
        // UI 系統的更新邏輯（如果需要）
        // 例如：動畫、狀態檢查等
    }
    destroy() {
        // 清理所有按鈕
        this.buttons.forEach(button => {
            button.destroy();
        });
        this.buttons.clear();
        // 清理事件監聽器
        this.eventListeners.clear();
    }
    // 按鈕管理
    createButton(id, text, x, y, callback) {
        // 如果按鈕已存在，先移除
        if (this.buttons.has(id)) {
            this.removeButton(id);
        }
        const button = new Button(this.p, id, text, x, y, callback);
        this.buttons.set(id, button);
        return button;
    }
    getButton(id) {
        return this.buttons.get(id);
    }
    removeButton(id) {
        const button = this.buttons.get(id);
        if (button) {
            button.destroy();
            this.buttons.delete(id);
        }
    }
    // UI 事件處理方法
    changeControl() {
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
    requestNewUnits() {
        this.triggerEvent({
            type: UIEventType.NEW_UNIT_REQUESTED,
            timestamp: Date.now(),
            data: { control: this.currentControl }
        });
    }
    togglePVP() {
        this.isPVP = !this.isPVP;
        this.updatePVPDisplay(this.isPVP);
        this.triggerEvent({
            type: UIEventType.PVP_TOGGLED,
            timestamp: Date.now(),
            data: { isPVP: this.isPVP }
        });
    }
    toggleArrows() {
        this.showArrows = !this.showArrows;
        this.updateArrowDisplay(this.showArrows);
        this.triggerEvent({
            type: UIEventType.ARROW_TOGGLED,
            timestamp: Date.now(),
            data: { showArrows: this.showArrows }
        });
    }
    toggleTargetLines() {
        this.showTargetLines = !this.showTargetLines;
        this.updateTargetLineDisplay(this.showTargetLines);
        this.triggerEvent({
            type: UIEventType.TARGET_LINE_TOGGLED,
            timestamp: Date.now(),
            data: { showTargetLines: this.showTargetLines }
        });
    }
    toggleUnitStats() {
        this.showUnitStats = !this.showUnitStats;
        this.updateUnitStatsDisplay(this.showUnitStats);
        this.triggerEvent({
            type: UIEventType.UNIT_STATS_TOGGLED,
            timestamp: Date.now(),
            data: { showUnitStats: this.showUnitStats }
        });
    }
    // UI 狀態更新
    updateControlDisplay(control) {
        this.currentControl = control;
        const button = this.getButton('control_change');
        if (button) {
            button.setText(`控制_P${control}`);
        }
    }
    updatePVPDisplay(isPVP) {
        this.isPVP = isPVP;
        const button = this.getButton('pvp_toggle');
        if (button) {
            button.setText(isPVP ? 'PVP T' : 'PVP F');
        }
    }
    updateArrowDisplay(showArrows) {
        this.showArrows = showArrows;
        const button = this.getButton('arrow_toggle');
        if (button) {
            button.setText(showArrows ? 'Arrow ON' : 'Arrow OFF');
        }
    }
    updateTargetLineDisplay(showTargetLines) {
        this.showTargetLines = showTargetLines;
        const button = this.getButton('target_line_toggle');
        if (button) {
            button.setText(showTargetLines ? 'Target ON' : 'Target OFF');
        }
    }
    updateUnitStatsDisplay(showUnitStats) {
        this.showUnitStats = showUnitStats;
        const button = this.getButton('unit_stats_toggle');
        if (button) {
            button.setText(showUnitStats ? 'Stats ON' : 'Stats OFF');
        }
    }
    // 統計資訊顯示（在遊戲中顯示，不是 DOM 按鈕）
    updateUnitCounts(_unitCounts) {
        // 這個方法會被渲染系統調用來顯示單位統計
        // 實際的文字渲染會在 RenderSystem 中處理
    }
    // 事件系統
    addEventListener(eventType, callback) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners && !listeners.includes(callback)) {
            listeners.push(callback);
        }
    }
    removeEventListener(eventType, callback) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    triggerEvent(event) {
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(event);
                }
                catch (error) {
                    console.error(`Error in UI event callback for ${event.type}:`, error);
                }
            });
        }
    }
    // 狀態查詢
    getCurrentControl() {
        return this.currentControl;
    }
    getIsPVP() {
        return this.isPVP;
    }
    getDisplaySettings() {
        return {
            showArrows: this.showArrows,
            showTargetLines: this.showTargetLines,
            showUnitStats: this.showUnitStats
        };
    }
    // 批量狀態設定
    updateAllDisplaySettings(settings) {
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
    createPanel(id, x, y, width, height) {
        const panel = {
            id,
            position: { x, y },
            size: { x: width, y: height },
            visible: true,
            buttons: [],
            addButton: (button) => {
                panel.buttons.push(button);
            },
            removeButton: (buttonId) => {
                const index = panel.buttons.findIndex(b => b.id === buttonId);
                if (index !== -1) {
                    panel.buttons[index].destroy();
                    panel.buttons.splice(index, 1);
                }
            },
            setVisible: (visible) => {
                panel.visible = visible;
                panel.buttons.forEach(button => {
                    button.setVisible(visible);
                });
            }
        };
        this.panels.set(id, panel);
        return panel;
    }
    getPanel(id) {
        return this.panels.get(id);
    }
    removePanel(id) {
        const panel = this.panels.get(id);
        if (panel) {
            panel.buttons.forEach(button => {
                button.destroy();
            });
            this.panels.delete(id);
        }
    }
}
//# sourceMappingURL=UISystem.js.map