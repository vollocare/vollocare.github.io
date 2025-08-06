// Sketch 相關介面定義
import { IUnit } from './IUnit';
import { IFlock } from './IFlock';
import { IObstacleManager } from './IObstacle';
import { GameConfig, ControlMode } from '../types/common';
import { IVector } from '../types/vector';

export interface IGameSketch {
  // p5 實例
  readonly p: p5Instance;
  
  // 遊戲設定
  config: GameConfig;
  
  // 核心系統
  flock: IFlock;
  obstacleManager: IObstacleManager;
  
  // 視窗和相機
  viewX: number;
  viewY: number;
  
  // 控制系統
  currentControl: ControlMode;
  isPVP: boolean;
  
  // 統計和調試
  showStats: boolean;
  showDebug: boolean;
  frameCount: number;
  
  // 生命週期
  setup(): void;
  draw(): void;
  
  // 事件處理
  mousePressed(): void;
  keyPressed(): void;
  
  // 遊戲邏輯
  update(deltaTime: number): void;
  render(): void;
  
  // 控制方法
  switchControl(mode: ControlMode): void;
  togglePVP(): void;
  toggleStats(): void;
  toggleDebug(): void;
  
  // 相機控制
  updateCamera(): void;
  getWorldMousePosition(): IVector;
  
  // 工具方法
  reset(): void;
  pause(): void;
  resume(): void;
}

export interface IRenderSystem {
  // 渲染層級
  renderBackground(): void;
  renderEntities(): void;
  renderUI(): void;
  renderDebug(): void;
  
  // 文字渲染
  renderText(text: string, x: number, y: number, options?: TextRenderOptions): void;
  renderTextWithViewport(text: string, x: number, y: number, options?: TextRenderOptions): void;
  
  // 統計渲染
  renderStats(stats: GameStats): void;
  renderDebugInfo(debugInfo: DebugInfo): void;
  
  // 工具方法
  setCamera(x: number, y: number): void;
  resetCamera(): void;
}

export interface IInputSystem {
  // 鍵盤狀態
  isKeyPressed(key: string): boolean;
  isKeyDown(key: string): boolean;
  isKeyUp(key: string): boolean;
  
  // 滑鼠狀態
  getMousePosition(): IVector;
  getWorldMousePosition(): IVector;
  isMousePressed(button?: number): boolean;
  isMouseDown(button?: number): boolean;
  isMouseUp(button?: number): boolean;
  
  // 事件註冊
  onKeyPressed(callback: (key: string) => void): void;
  onKeyReleased(callback: (key: string) => void): void;
  onMousePressed(callback: (x: number, y: number, button: number) => void): void;
  onMouseReleased(callback: (x: number, y: number, button: number) => void): void;
  
  // 更新
  update(): void;
}

export interface IUISystem {
  // 按鈕管理
  addButton(id: string, x: number, y: number, width: number, height: number, text: string, callback: () => void): void;
  removeButton(id: string): void;
  updateButton(id: string, options: ButtonOptions): void;
  
  // 事件處理
  handleMouseClick(x: number, y: number): boolean;
  
  // 渲染
  render(): void;
  
  // 狀態管理
  setVisible(id: string, visible: boolean): void;
  setEnabled(id: string, enabled: boolean): void;
}

export interface ICameraSystem {
  // 相機位置
  x: number;
  y: number;
  
  // 相機控制
  move(dx: number, dy: number): void;
  setPosition(x: number, y: number): void;
  followTarget(target: IVector, smoothing?: number): void;
  
  // 座標轉換
  worldToScreen(worldPos: IVector): IVector;
  screenToWorld(screenPos: IVector): IVector;
  
  // 視窗邊界
  isInView(pos: IVector, margin?: number): boolean;
  getBounds(): { left: number; right: number; top: number; bottom: number };
  
  // 更新
  update(): void;
  applyTransform(p: p5Instance): void;
}

// 輔助介面
export interface TextRenderOptions {
  size?: number;
  color?: string;
  align?: string;
  valign?: string;
  font?: string;
}

export interface ButtonOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  enabled?: boolean;
  visible?: boolean;
}

export interface GameStats {
  fps: number;
  unitCount: number;
  obstacleCount: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
}

export interface DebugInfo {
  cameraPos: IVector;
  mousePos: IVector;
  worldMousePos: IVector;
  currentControl: ControlMode;
  isPVP: boolean;
  selectedUnit?: IUnit;
}