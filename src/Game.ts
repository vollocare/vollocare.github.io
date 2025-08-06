// 遊戲主入口點
/// <reference path="./types/p5.d.ts" />

import { GameSketch } from './sketch/GameSketch';

export class Game {
  private gameSketch: GameSketch | null = null;
  private p5Instance: any = null;
  
  constructor() {
    this.init();
  }
  
  private init(): void {
    // 創建 p5 sketch 函數
    const sketch = (p: p5Instance) => {
      this.gameSketch = new GameSketch(p);
    };
    
    // 創建 p5 實例
    this.p5Instance = new p5(sketch);
    
    console.log('Game initialized with p5.js Instance Mode');
  }
  
  // 遊戲控制方法
  public pause(): void {
    this.gameSketch?.pause();
  }
  
  public resume(): void {
    this.gameSketch?.resume();
  }
  
  public reset(): void {
    this.gameSketch?.reset();
  }
  
  // 獲取遊戲狀態
  public getGameSketch(): GameSketch | null {
    return this.gameSketch;
  }
  
  public isInitialized(): boolean {
    return this.gameSketch !== null && this.p5Instance !== null;
  }
  
  // 清理資源
  public destroy(): void {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    this.gameSketch = null;
    console.log('Game destroyed');
  }
}