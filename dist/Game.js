// 遊戲主入口點
/// <reference path="./types/p5.d.ts" />
import { GameSketch } from './sketch/GameSketch';
export class Game {
    constructor() {
        this.gameSketch = null;
        this.p5Instance = null;
        this.init();
    }
    init() {
        // 創建 p5 sketch 函數
        const sketch = (p) => {
            this.gameSketch = new GameSketch(p);
        };
        // 創建 p5 實例
        this.p5Instance = new p5(sketch);
        console.log('Game initialized with p5.js Instance Mode');
    }
    // 遊戲控制方法
    pause() {
        this.gameSketch?.pause();
    }
    resume() {
        this.gameSketch?.resume();
    }
    reset() {
        this.gameSketch?.reset();
    }
    // 獲取遊戲狀態
    getGameSketch() {
        return this.gameSketch;
    }
    isInitialized() {
        return this.gameSketch !== null && this.p5Instance !== null;
    }
    // 清理資源
    destroy() {
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        this.gameSketch = null;
        console.log('Game destroyed');
    }
}
//# sourceMappingURL=Game.js.map