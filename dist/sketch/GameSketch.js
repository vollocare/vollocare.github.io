// GameSketch 類別 - 遊戲主要邏輯封裝，整合所有系統
/// <reference path="../types/p5.d.ts" />
import { ControlMode } from '../types/common';
import { GameManager } from '../core/GameManager';
export class GameSketch {
    constructor(p) {
        // 視窗和相機（委託給 GameManager）
        this.viewX = 0;
        this.viewY = 0;
        // 控制系統（委託給 GameManager）
        this.currentControl = ControlMode.PLAYER;
        this.isPVP = false;
        // 統計和調試
        this.showStats = false;
        this.showDebug = false;
        this.frameCount = 0;
        // 內部狀態
        this.lastUpdateTime = 0;
        this.isPaused = false;
        this.isInitialized = false;
        this.p = p;
        // 預設遊戲設定
        this.config = {
            displayWidth: 1024,
            displayHeight: 640,
            maxUnits: 200,
            isPVP: false,
            showStats: false,
            showDebug: false
        };
        // 初始化遊戲管理器
        this.gameManager = new GameManager(p, this.config.displayWidth, this.config.displayHeight);
        // 綁定事件處理方法
        this.p.setup = () => this.setup();
        this.p.draw = () => this.draw();
        this.p.mousePressed = () => this.mousePressed();
        this.p.keyPressed = () => this.keyPressed();
        this.p.keyReleased = () => this.keyReleased();
    }
    setup() {
        // 建立 Canvas (WEBGL 模式用於 3D 相機功能)
        this.p.createCanvas(this.config.displayWidth, this.config.displayHeight, this.p.WEBGL);
        // 初始化遊戲管理器
        try {
            this.gameManager.initialize();
            this.isInitialized = true;
            console.log('✅ GameSketch 和 GameManager 初始化完成');
        }
        catch (error) {
            console.error('❌ GameSketch 初始化失敗:', error);
            this.isInitialized = false;
        }
        this.lastUpdateTime = Date.now();
    }
    draw() {
        if (!this.isInitialized) {
            // 顯示載入畫面
            this.p.background(51);
            this.p.fill(255);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.text('正在初始化遊戲系統...', 0, 0, 0);
            return;
        }
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 轉換為秒
        this.lastUpdateTime = currentTime;
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        this.render();
        this.frameCount++;
    }
    update(deltaTime) {
        if (!this.isInitialized)
            return;
        try {
            // 委託給 GameManager 處理所有更新邏輯
            this.gameManager.update(deltaTime);
            // 同步相機位置（從 GameManager 獲取）
            const cameraPos = this.gameManager.getGameStats();
            this.viewX = cameraPos.currentControl === ControlMode.PLAYER ? this.viewX : this.viewX;
            this.viewY = cameraPos.currentControl === ControlMode.PLAYER ? this.viewY : this.viewY;
            // 同步遊戲狀態
            this.currentControl = cameraPos.currentControl;
            this.isPVP = cameraPos.isPVP;
        }
        catch (error) {
            console.error('遊戲更新錯誤:', error);
        }
    }
    render() {
        if (!this.isInitialized)
            return;
        try {
            // 委託給 GameManager 處理所有渲染
            this.gameManager.render();
            // 渲染 GameSketch 層級的 UI（統計和除錯資訊）
            if (this.showStats) {
                this.renderStats();
            }
            if (this.showDebug) {
                this.renderDebug();
            }
        }
        catch (error) {
            console.error('渲染錯誤:', error);
            // 顯示錯誤訊息
            this.p.background(51);
            this.p.fill(255, 0, 0);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.text('渲染錯誤: ' + error, 0, 0, 0);
        }
    }
    mousePressed() {
        if (!this.isInitialized)
            return;
        try {
            // 委託給 GameManager 處理滑鼠事件
            this.gameManager.onMousePressed(this.p.mouseX, this.p.mouseY);
        }
        catch (error) {
            console.error('滑鼠事件處理錯誤:', error);
        }
    }
    keyPressed() {
        if (!this.isInitialized)
            return;
        try {
            // 委託給 GameManager 處理按鍵事件
            this.gameManager.onKeyPressed(this.p.keyCode);
            // GameSketch 層級的特殊按鍵
            const key = this.p.keyCode;
            if (key === 73)
                this.toggleStats(); // I - 統計資訊
            if (key === 79)
                this.toggleDebug(); // O - 除錯資訊
        }
        catch (error) {
            console.error('按鍵事件處理錯誤:', error);
        }
    }
    keyReleased() {
        if (!this.isInitialized)
            return;
        try {
            // 委託給 GameManager 處理按鍵釋放事件
            this.gameManager.onKeyReleased(this.p.keyCode);
        }
        catch (error) {
            console.error('按鍵釋放事件處理錯誤:', error);
        }
    }
    switchControl(mode) {
        this.currentControl = mode;
        if (this.gameManager) {
            this.gameManager.setCurrentControl(mode);
        }
        console.log('Control switched to:', mode);
    }
    togglePVP() {
        this.isPVP = !this.isPVP;
        this.config.isPVP = this.isPVP;
        if (this.gameManager) {
            this.gameManager.setPVPMode(this.isPVP);
        }
        console.log('PVP mode:', this.isPVP ? 'ON' : 'OFF');
    }
    toggleStats() {
        this.showStats = !this.showStats;
        this.config.showStats = this.showStats;
    }
    toggleDebug() {
        this.showDebug = !this.showDebug;
        this.config.showDebug = this.showDebug;
    }
    updateCamera() {
        // 相機控制現在由 CameraSystem 處理
        // 這個方法保留以維持介面一致性
    }
    getWorldMousePosition() {
        return {
            x: this.p.mouseX - (this.config.displayWidth / 2 - this.viewX),
            y: this.p.mouseY - (this.config.displayHeight / 2 - this.viewY)
        };
    }
    reset() {
        if (this.gameManager) {
            this.gameManager.destroy();
            this.gameManager.initialize();
        }
        this.viewX = 0;
        this.viewY = 0;
        this.currentControl = ControlMode.PLAYER;
        this.isPVP = false;
        this.frameCount = 0;
        this.isPaused = false;
        console.log('Game reset');
    }
    pause() {
        this.isPaused = true;
        if (this.gameManager) {
            this.gameManager.setPaused(true);
        }
        console.log('Game paused');
    }
    resume() {
        this.isPaused = false;
        this.lastUpdateTime = Date.now();
        if (this.gameManager) {
            this.gameManager.setPaused(false);
        }
        console.log('Game resumed');
    }
    // UI 渲染現在由 UISystem 處理，這個方法已不使用
    renderStats() {
        if (!this.gameManager)
            return;
        this.p.fill(0, 255, 0);
        this.p.textAlign(this.p.LEFT, this.p.TOP);
        const stats = this.gameManager.getGameStats();
        const statsLines = [
            `FPS: ${Math.round(stats.frameRate)}`,
            `Total Units: ${stats.totalUnits}`,
            `Obstacles: ${stats.totalObstacles}`,
            `Control: P${stats.currentControl}`,
            `PVP: ${stats.isPVP ? 'ON' : 'OFF'}`,
            `Active: ${stats.isActive ? 'YES' : 'NO'}`,
            `Frame: ${this.frameCount}`
        ];
        let yOffset = -this.config.displayHeight / 2 + 90;
        for (const line of statsLines) {
            this.p.text(line, -this.config.displayWidth / 2 + 20, yOffset, 0);
            yOffset += 18;
        }
    }
    renderDebug() {
        if (!this.gameManager)
            return;
        this.p.fill(255, 255, 0);
        this.p.textAlign(this.p.LEFT, this.p.TOP);
        const mousePos = this.getWorldMousePosition();
        const debugLines = [
            `Mouse: (${Math.round(mousePos.x)}, ${Math.round(mousePos.y)})`,
            `Paused: ${this.isPaused}`,
            `Initialized: ${this.isInitialized}`,
            `GroupUnits: ${this.gameManager.getGroupUnits().length}`,
            `Display: ${this.config.displayWidth}x${this.config.displayHeight}`
        ];
        let yOffset = -this.config.displayHeight / 2 + 200;
        for (const line of debugLines) {
            this.p.text(line, -this.config.displayWidth / 2 + 20, yOffset, 0);
            yOffset += 18;
        }
    }
    // 添加公共方法供外部獲取遊戲管理器
    getGameManager() {
        return this.gameManager;
    }
    isGameInitialized() {
        return this.isInitialized;
    }
}
//# sourceMappingURL=GameSketch.js.map