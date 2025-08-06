// InputSystem - 輸入系統，統一處理鍵盤和滑鼠輸入
/// <reference path="../types/p5.d.ts" />

import { IVector } from '../types/vector';
import { Vector } from '../utils/Vector';

export interface IInputSystem {
  // 更新方法
  update(deltaTime: number): void;
  
  // 滑鼠輸入
  onMousePressed(mouseX: number, mouseY: number): void;
  getMousePosition(): IVector;
  getWorldMousePosition(viewX: number, viewY: number, displayWidth: number, displayHeight: number): IVector;
  
  // 鍵盤輸入
  onKeyPressed(keyCode: number): void;
  onKeyReleased(keyCode: number): void;
  isKeyPressed(keyCode: number): boolean;
  
  // 相機控制
  getCameraMovement(): IVector;
  
  // 輸入映射配置
  setKeyMapping(action: string, keyCode: number): void;
  getKeyMapping(action: string): number | undefined;
  
  // 輸入延遲處理
  setInputDelay(delay: number): void;
  
  // 事件監聽
  addEventListener(eventType: InputEventType, callback: InputEventCallback): void;
  removeEventListener(eventType: InputEventType, callback: InputEventCallback): void;
}

export enum InputEventType {
  MOUSE_CLICK = 'mouse_click',
  MOUSE_MOVE = 'mouse_move',
  KEY_DOWN = 'key_down',
  KEY_UP = 'key_up',
  CAMERA_MOVE = 'camera_move'
}

export type InputEventCallback = (event: InputEvent) => void;

export interface InputEvent {
  type: InputEventType;
  timestamp: number;
  mousePosition?: IVector;
  worldPosition?: IVector;
  keyCode?: number;
  movement?: IVector;
}

export interface KeyMapping {
  // 相機控制
  CAMERA_UP: number;
  CAMERA_DOWN: number;
  CAMERA_LEFT: number;
  CAMERA_RIGHT: number;
  
  // 遊戲控制
  TOGGLE_PVP: number;
  CHANGE_CONTROL: number;
  ADD_UNITS: number;
  
  // 顯示選項
  TOGGLE_ARROWS: number;
  TOGGLE_TARGET_LINES: number;
  TOGGLE_UNIT_STATS: number;
  TOGGLE_DEBUG: number;
}

export const DEFAULT_KEY_MAPPING: KeyMapping = {
  CAMERA_UP: 87,    // W
  CAMERA_DOWN: 83,  // S
  CAMERA_LEFT: 65,  // A
  CAMERA_RIGHT: 68, // D
  TOGGLE_PVP: 80,   // P
  CHANGE_CONTROL: 67, // C
  ADD_UNITS: 85,    // U
  TOGGLE_ARROWS: 49,      // 1
  TOGGLE_TARGET_LINES: 50, // 2
  TOGGLE_UNIT_STATS: 51,   // 3
  TOGGLE_DEBUG: 52         // 4
};

export class InputSystem implements IInputSystem {
  private p: p5Instance;
  private keyMapping: KeyMapping;
  private pressedKeys: Set<number>;
  private lastInputTime: number;
  private inputDelay: number;
  private eventListeners: Map<InputEventType, InputEventCallback[]>;
  
  // 滑鼠狀態
  private mousePosition: IVector;
  private lastMousePosition: IVector;
  private mousePressed: boolean = false;
  private lastMousePressTime: number = 0;
  private mouseClickDelay: number = 200; // 防止重複點擊
  
  // 相機移動
  private cameraMovement: IVector;
  private cameraMoveSpeed: number = 10;
  
  constructor(p: p5Instance, keyMapping?: Partial<KeyMapping>) {
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
  
  private initializeEventListeners(): void {
    Object.values(InputEventType).forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }
  
  // 更新方法
  public update(_deltaTime: number): void {
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
  public onMousePressed(mouseX: number, mouseY: number): void {
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
  
  public getMousePosition(): IVector {
    return this.mousePosition.copy();
  }
  
  public getWorldMousePosition(viewX: number, viewY: number, displayWidth: number, displayHeight: number): IVector {
    const worldX = this.mousePosition.x - (displayWidth / 2 - viewX);
    const worldY = this.mousePosition.y - (displayHeight / 2 - viewY);
    return new Vector(this.p, worldX, worldY);
  }
  
  // 鍵盤輸入處理
  public onKeyPressed(keyCode: number): void {
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
  
  public onKeyReleased(keyCode: number): void {
    this.pressedKeys.delete(keyCode);
    
    this.triggerEvent({
      type: InputEventType.KEY_UP,
      timestamp: Date.now(),
      keyCode
    });
  }
  
  public isKeyPressed(keyCode: number): boolean {
    return this.pressedKeys.has(keyCode);
  }
  
  // 相機控制
  public getCameraMovement(): IVector {
    return this.cameraMovement.copy();
  }
  
  private updateCameraMovement(): void {
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
  private handleSpecialKeys(keyCode: number): void {
    // 這裡可以處理一些立即響應的按鍵
    // 大部分邏輯會通過事件系統處理
    
    // 例如：ESC 鍵暫停遊戲
    if (keyCode === 27) { // ESC
      // 可以觸發暫停事件
    }
  }
  
  // 輸入映射配置
  public setKeyMapping(action: string, keyCode: number): void {
    if (action in this.keyMapping) {
      (this.keyMapping as any)[action] = keyCode;
    }
  }
  
  public getKeyMapping(action: string): number | undefined {
    return (this.keyMapping as any)[action];
  }
  
  // 輸入延遲處理
  public setInputDelay(delay: number): void {
    this.inputDelay = Math.max(0, delay);
  }
  
  public setCameraMoveSpeed(speed: number): void {
    this.cameraMoveSpeed = Math.max(1, speed);
  }
  
  public setMouseClickDelay(delay: number): void {
    this.mouseClickDelay = Math.max(0, delay);
  }
  
  // 事件監聽
  public addEventListener(eventType: InputEventType, callback: InputEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners && !listeners.includes(callback)) {
      listeners.push(callback);
    }
  }
  
  public removeEventListener(eventType: InputEventType, callback: InputEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private triggerEvent(event: InputEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in input event callback for ${event.type}:`, error);
        }
      });
    }
  }
  
  // 輸入狀態查詢
  public getInputState(): {
    pressedKeys: number[];
    mousePosition: IVector;
    mousePressed: boolean;
    cameraMovement: IVector;
  } {
    return {
      pressedKeys: Array.from(this.pressedKeys),
      mousePosition: this.mousePosition.copy(),
      mousePressed: this.mousePressed,
      cameraMovement: this.cameraMovement.copy()
    };
  }
  
  // 輔助方法
  public isMovementKey(keyCode: number): boolean {
    return keyCode === this.keyMapping.CAMERA_UP ||
           keyCode === this.keyMapping.CAMERA_DOWN ||
           keyCode === this.keyMapping.CAMERA_LEFT ||
           keyCode === this.keyMapping.CAMERA_RIGHT;
  }
  
  public isAnyMovementKeyPressed(): boolean {
    return this.isKeyPressed(this.keyMapping.CAMERA_UP) ||
           this.isKeyPressed(this.keyMapping.CAMERA_DOWN) ||
           this.isKeyPressed(this.keyMapping.CAMERA_LEFT) ||
           this.isKeyPressed(this.keyMapping.CAMERA_RIGHT);
  }
  
  // 輸入歷史記錄（用於除錯）
  private inputHistory: InputEvent[] = [];
  // private _maxHistorySize: number = 100; // 暫時未使用
  
  public getInputHistory(): InputEvent[] {
    return [...this.inputHistory];
  }
  
  public clearInputHistory(): void {
    this.inputHistory = [];
  }
  
  // 暫時移除 _addToHistory 方法，未使用
}

// 輸入處理工具函數
export class InputUtils {
  // 按鍵碼轉換
  public static keyCodeToString(keyCode: number): string {
    const keyMap: { [key: number]: string } = {
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
  public static isNumberKey(keyCode: number): boolean {
    return keyCode >= 48 && keyCode <= 57;
  }
  
  // 檢查是否為字母鍵
  public static isLetterKey(keyCode: number): boolean {
    return keyCode >= 65 && keyCode <= 90;
  }
  
  // 檢查是否為功能鍵
  public static isFunctionKey(keyCode: number): boolean {
    return keyCode >= 112 && keyCode <= 123; // F1-F12
  }
}