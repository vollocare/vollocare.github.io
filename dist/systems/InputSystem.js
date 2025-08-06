// InputSystem - 輸入系統，統一處理鍵盤和滑鼠輸入
/// <reference path="../types/p5.d.ts" />
import { Vector } from '../utils/Vector';
export var InputEventType;
(function (InputEventType) {
    InputEventType["MOUSE_CLICK"] = "mouse_click";
    InputEventType["MOUSE_MOVE"] = "mouse_move";
    InputEventType["KEY_DOWN"] = "key_down";
    InputEventType["KEY_UP"] = "key_up";
    InputEventType["CAMERA_MOVE"] = "camera_move";
})(InputEventType || (InputEventType = {}));
export const DEFAULT_KEY_MAPPING = {
    CAMERA_UP: 87, // W
    CAMERA_DOWN: 83, // S
    CAMERA_LEFT: 65, // A
    CAMERA_RIGHT: 68, // D
    TOGGLE_PVP: 80, // P
    CHANGE_CONTROL: 67, // C
    ADD_UNITS: 85, // U
    TOGGLE_ARROWS: 49, // 1
    TOGGLE_TARGET_LINES: 50, // 2
    TOGGLE_UNIT_STATS: 51, // 3
    TOGGLE_DEBUG: 52 // 4
};
export class InputSystem {
    constructor(p, keyMapping) {
        this.mousePressed = false;
        this.lastMousePressTime = 0;
        this.mouseClickDelay = 200; // 防止重複點擊
        this.cameraMoveSpeed = 10;
        // 輸入歷史記錄（用於除錯）
        this.inputHistory = [];
        this.p = p;
        this.keyMapping = { ...DEFAULT_KEY_MAPPING, ...keyMapping };
        this.pressedKeys = new Set();
        this.lastInputTime = 0;
        this.inputDelay = 41; // 大約 24 FPS 的間隔
        this.eventListeners = new Map();
        this.mousePosition = new Vector(p, 0, 0);
        this.lastMousePosition = new Vector(p, 0, 0);
        this.cameraMovement = new Vector(p, 0, 0);
        // 初始化事件監聽器映射
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        Object.values(InputEventType).forEach(eventType => {
            this.eventListeners.set(eventType, []);
        });
    }
    // 更新方法
    update(_deltaTime) {
        const currentTime = Date.now();
        // 檢查輸入延遲
        if (currentTime - this.lastInputTime < this.inputDelay) {
            return;
        }
        // 更新相機移動
        this.updateCameraMovement();
        // 更新滑鼠位置（如果有移動）
        if (this.mousePosition.x !== this.lastMousePosition.x ||
            this.mousePosition.y !== this.lastMousePosition.y) {
            this.triggerEvent({
                type: InputEventType.MOUSE_MOVE,
                timestamp: currentTime,
                mousePosition: this.mousePosition.copy()
            });
            this.lastMousePosition = this.mousePosition.copy();
        }
        this.lastInputTime = currentTime;
    }
    // 滑鼠輸入處理
    onMousePressed(mouseX, mouseY) {
        const currentTime = Date.now();
        // 防止重複點擊
        if (currentTime - this.lastMousePressTime < this.mouseClickDelay) {
            return;
        }
        this.mousePosition.set(mouseX, mouseY);
        this.mousePressed = true;
        this.lastMousePressTime = currentTime;
        // 觸發滑鼠點擊事件
        this.triggerEvent({
            type: InputEventType.MOUSE_CLICK,
            timestamp: currentTime,
            mousePosition: this.mousePosition.copy()
        });
    }
    getMousePosition() {
        return this.mousePosition.copy();
    }
    getWorldMousePosition(viewX, viewY, displayWidth, displayHeight) {
        const worldX = this.mousePosition.x - (displayWidth / 2 - viewX);
        const worldY = this.mousePosition.y - (displayHeight / 2 - viewY);
        return new Vector(this.p, worldX, worldY);
    }
    // 鍵盤輸入處理
    onKeyPressed(keyCode) {
        if (this.pressedKeys.has(keyCode)) {
            return; // 已經按下，避免重複觸發
        }
        this.pressedKeys.add(keyCode);
        // 觸發按鍵事件
        this.triggerEvent({
            type: InputEventType.KEY_DOWN,
            timestamp: Date.now(),
            keyCode
        });
        // 處理特殊按鍵
        this.handleSpecialKeys(keyCode);
    }
    onKeyReleased(keyCode) {
        this.pressedKeys.delete(keyCode);
        this.triggerEvent({
            type: InputEventType.KEY_UP,
            timestamp: Date.now(),
            keyCode
        });
    }
    isKeyPressed(keyCode) {
        return this.pressedKeys.has(keyCode);
    }
    // 相機控制
    getCameraMovement() {
        return this.cameraMovement.copy();
    }
    updateCameraMovement() {
        this.cameraMovement.set(0, 0);
        // 檢查相機移動按鍵
        if (this.isKeyPressed(this.keyMapping.CAMERA_UP)) {
            this.cameraMovement.y -= this.cameraMoveSpeed;
        }
        if (this.isKeyPressed(this.keyMapping.CAMERA_DOWN)) {
            this.cameraMovement.y += this.cameraMoveSpeed;
        }
        if (this.isKeyPressed(this.keyMapping.CAMERA_LEFT)) {
            this.cameraMovement.x -= this.cameraMoveSpeed;
        }
        if (this.isKeyPressed(this.keyMapping.CAMERA_RIGHT)) {
            this.cameraMovement.x += this.cameraMoveSpeed;
        }
        // 如果有相機移動，觸發事件
        if (this.cameraMovement.mag() > 0) {
            this.triggerEvent({
                type: InputEventType.CAMERA_MOVE,
                timestamp: Date.now(),
                movement: this.cameraMovement.copy()
            });
        }
    }
    // 處理特殊按鍵
    handleSpecialKeys(keyCode) {
        // 這裡可以處理一些立即響應的按鍵
        // 大部分邏輯會通過事件系統處理
        // 例如：ESC 鍵暫停遊戲
        if (keyCode === 27) { // ESC
            // 可以觸發暫停事件
        }
    }
    // 輸入映射配置
    setKeyMapping(action, keyCode) {
        if (action in this.keyMapping) {
            this.keyMapping[action] = keyCode;
        }
    }
    getKeyMapping(action) {
        return this.keyMapping[action];
    }
    // 輸入延遲處理
    setInputDelay(delay) {
        this.inputDelay = Math.max(0, delay);
    }
    setCameraMoveSpeed(speed) {
        this.cameraMoveSpeed = Math.max(1, speed);
    }
    setMouseClickDelay(delay) {
        this.mouseClickDelay = Math.max(0, delay);
    }
    // 事件監聽
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
                    console.error(`Error in input event callback for ${event.type}:`, error);
                }
            });
        }
    }
    // 輸入狀態查詢
    getInputState() {
        return {
            pressedKeys: Array.from(this.pressedKeys),
            mousePosition: this.mousePosition.copy(),
            mousePressed: this.mousePressed,
            cameraMovement: this.cameraMovement.copy()
        };
    }
    // 輔助方法
    isMovementKey(keyCode) {
        return keyCode === this.keyMapping.CAMERA_UP ||
            keyCode === this.keyMapping.CAMERA_DOWN ||
            keyCode === this.keyMapping.CAMERA_LEFT ||
            keyCode === this.keyMapping.CAMERA_RIGHT;
    }
    isAnyMovementKeyPressed() {
        return this.isKeyPressed(this.keyMapping.CAMERA_UP) ||
            this.isKeyPressed(this.keyMapping.CAMERA_DOWN) ||
            this.isKeyPressed(this.keyMapping.CAMERA_LEFT) ||
            this.isKeyPressed(this.keyMapping.CAMERA_RIGHT);
    }
    // private _maxHistorySize: number = 100; // 暫時未使用
    getInputHistory() {
        return [...this.inputHistory];
    }
    clearInputHistory() {
        this.inputHistory = [];
    }
}
// 輸入處理工具函數
export class InputUtils {
    // 按鍵碼轉換
    static keyCodeToString(keyCode) {
        const keyMap = {
            8: 'Backspace',
            9: 'Tab',
            13: 'Enter',
            16: 'Shift',
            17: 'Ctrl',
            18: 'Alt',
            27: 'Escape',
            32: 'Space',
            37: 'Left',
            38: 'Up',
            39: 'Right',
            40: 'Down',
            65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H',
            73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P',
            81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X',
            89: 'Y', 90: 'Z',
            48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7',
            56: '8', 57: '9'
        };
        return keyMap[keyCode] || `Key${keyCode}`;
    }
    // 檢查是否為數字鍵
    static isNumberKey(keyCode) {
        return keyCode >= 48 && keyCode <= 57;
    }
    // 檢查是否為字母鍵
    static isLetterKey(keyCode) {
        return keyCode >= 65 && keyCode <= 90;
    }
    // 檢查是否為功能鍵
    static isFunctionKey(keyCode) {
        return keyCode >= 112 && keyCode <= 123; // F1-F12
    }
}
//# sourceMappingURL=InputSystem.js.map