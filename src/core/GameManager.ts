// GameManager - 主遊戲管理器，統一管理所有系統和遊戲狀態
/// <reference path="../types/p5.d.ts" />

import { IGameManager } from '../interfaces/IGameManager';
import { IGroupUnit } from '../interfaces/IGroupUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IPatrol } from '../interfaces/IPatrol';

import { GroupUnit } from '../models/GroupUnit';
import { Obstacle } from '../models/Obstacle';
import { Patrol } from '../models/Patrol';
import { Flock } from '../models/Flock';

import { RenderSystem } from '../systems/RenderSystem';
import { InputSystem, InputEventType } from '../systems/InputSystem';
import { UISystem, UIEventType } from '../systems/UISystem';
import { CameraSystem } from '../systems/CameraSystem';

import { ControlMode } from '../types/common';
import { IVector } from '../types/vector';

export class GameManager implements IGameManager {
  private p: p5Instance;
  private displayWidth: number;
  private displayHeight: number;
  
  // 系統
  private renderSystem: RenderSystem;
  private inputSystem: InputSystem;
  private uiSystem: UISystem;
  private cameraSystem: CameraSystem;
  private flock: Flock;
  
  // 遊戲實體
  private groupUnits: IGroupUnit[] = [];
  private obstacles: IObstacle[] = [];
  private patrol: IPatrol;
  
  // 遊戲狀態
  private paused: boolean = false;
  private currentControl: ControlMode = ControlMode.PLAYER;
  private isPVP: boolean = false;
  private pvpTimer: number = 1200;
  private lastFrameTime: number = 0;
  
  // 遊戲配置
  private readonly groupUnitCount: number = 9;
  
  constructor(p: p5Instance, displayWidth: number, displayHeight: number) {
    this.p = p;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    
    // 初始化系統
    this.renderSystem = new RenderSystem(p, displayWidth, displayHeight);
    this.inputSystem = new InputSystem(p);
    this.uiSystem = new UISystem(p, displayWidth, displayHeight);
    this.cameraSystem = new CameraSystem(p, displayWidth, displayHeight);
    this.flock = new Flock(p);
    
    // 初始化遊戲實體
    this.patrol = new Patrol(p);
    
    this.setupEventListeners();
  }
  
  // 初始化
  public initialize(): void {
    // 初始化相機
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;
    this.cameraSystem.setPosition(centerX, centerY, 554);
    
    // 初始化 UI
    this.uiSystem.initialize();
    
    // 創建群組單位
    this.initializeGroupUnits();
    
    // 創建障礙物
    this.initializeObstacles();
    
    // 設定巡邏系統
    this.initializePatrol();
    
    console.log('GameManager initialized successfully');
  }
  
  // 初始化群組單位
  private initializeGroupUnits(): void {
    for (let i = 0; i < this.groupUnitCount; i++) {
      const x = (this.displayWidth / this.groupUnitCount) * i + 20;
      const y = this.displayHeight - 50;
      const groupId = i + 1;
      
      const groupUnit = new GroupUnit(this.p, groupId, x, y);
      
      // 添加初始單位
      for (let j = 0; j < 5; j++) {
        groupUnit.addUnit(x + j * 10, y);
      }
      
      this.groupUnits.push(groupUnit);
    }
  }
  
  // 初始化障礙物
  private initializeObstacles(): void {
    const obstacleConfigs = [
      { x: 200, y: 150, radius: 80 },
      { x: 350, y: 250, radius: 65 },
      { x: 450, y: 350, radius: 65 },
      { x: 520, y: 150, radius: 65 },
      { x: 320, y: 100, radius: 25 },
      { x: 100, y: 300, radius: 55 },
      { x: 600, y: 300, radius: 100 },
      { x: 700, y: 200, radius: 70 },
      { x: 550, y: 480, radius: 65 },
      { x: 250, y: 450, radius: 85 },
      { x: 850, y: 400, radius: 85 }
    ];
    
    for (const config of obstacleConfigs) {
      const obstacle = new Obstacle(this.p, config.x, config.y, config.radius);
      this.obstacles.push(obstacle);
    }
  }
  
  // 初始化巡邏系統
  private initializePatrol(): void {
    // 添加巡邏點
    this.patrol.addPoint(50, 50, 350);
    this.patrol.addPoint(this.displayWidth - 50, 50, 400);
    this.patrol.addPoint(this.displayWidth - 50, this.displayHeight - 50, 350);
    this.patrol.addPoint(50, this.displayHeight - 50, 300);
    this.patrol.addPoint(this.displayWidth / 2, this.displayHeight - 50, 300);
    this.patrol.addPoint(this.displayWidth / 2, 50, 400);
    
    // 將群組單位加入巡邏系統
    for (let i = 0; i < this.groupUnits.length; i++) {
      const patrolIndex = i % this.patrol.getPointCount();
      const createX = this.displayWidth / this.groupUnitCount + 20;
      const createY = this.displayHeight - 50;
      
      this.patrol.addGroupUnit(this.groupUnits[i], patrolIndex, createX, createY);
    }
  }
  
  // 設定事件監聽器
  private setupEventListeners(): void {
    // 輸入事件
    this.inputSystem.addEventListener(InputEventType.MOUSE_CLICK, (event) => {
      if (event.mousePosition) {
        this.handleMouseClick(event.mousePosition);
      }
    });
    
    this.inputSystem.addEventListener(InputEventType.CAMERA_MOVE, (event) => {
      if (event.movement) {
        this.cameraSystem.move(event.movement.x, event.movement.y);
      }
    });
    
    // UI 事件
    this.uiSystem.addEventListener(UIEventType.CONTROL_CHANGED, (event) => {
      if (event.data?.control) {
        this.setCurrentControl(event.data.control);
      }
    });
    
    this.uiSystem.addEventListener(UIEventType.PVP_TOGGLED, (event) => {
      if (event.data?.isPVP !== undefined) {
        this.setPVPMode(event.data.isPVP);
      }
    });
    
    this.uiSystem.addEventListener(UIEventType.NEW_UNIT_REQUESTED, () => {
      this.addUnitsToCurrentGroup();
    });
    
    this.uiSystem.addEventListener(UIEventType.ARROW_TOGGLED, (event) => {
      if (event.data?.showArrows !== undefined) {
        this.renderSystem.renderArrows(event.data.showArrows);
      }
    });
    
    this.uiSystem.addEventListener(UIEventType.TARGET_LINE_TOGGLED, (event) => {
      if (event.data?.showTargetLines !== undefined) {
        this.renderSystem.renderTargetLines(event.data.showTargetLines);
      }
    });
    
    this.uiSystem.addEventListener(UIEventType.UNIT_STATS_TOGGLED, (event) => {
      if (event.data?.showUnitStats !== undefined) {
        this.renderSystem.renderUnitStats(event.data.showUnitStats);
      }
    });
  }
  
  // 處理滑鼠點擊
  private handleMouseClick(mousePosition: IVector): void {
    // 轉換為世界座標
    const worldPos = this.cameraSystem.screenToWorld(mousePosition);
    
    // 設定當前控制群組的目標位置
    const currentGroup = this.groupUnits[this.currentControl - 1];
    if (currentGroup) {
      currentGroup.setDestination(worldPos);
    }
  }
  
  // 添加單位到當前控制群組
  private addUnitsToCurrentGroup(): void {
    const currentGroup = this.groupUnits[this.currentControl - 1];
    if (currentGroup) {
      const centerX = this.displayWidth / 2;
      const centerY = this.displayHeight - 50;
      
      for (let i = 0; i < 20; i++) {
        currentGroup.addUnit(centerX, centerY);
      }
    }
  }
  
  // 更新遊戲邏輯
  public update(deltaTime: number): void {
    if (this.paused) return;
    
    // 限制更新頻率
    const currentTime = Date.now();
    if (currentTime - this.lastFrameTime < 41) return; // 約 24 FPS
    
    // 更新系統
    this.inputSystem.update(deltaTime);
    this.uiSystem.update(deltaTime);
    this.cameraSystem.update(deltaTime);
    
    // 更新相機視窗
    const cameraPos = this.cameraSystem.getPosition();
    this.renderSystem.setViewPort(cameraPos.x, cameraPos.y);
    
    // 更新群組行為
    this.updateGroupBehaviors();
    
    // 更新群組單位
    for (const groupUnit of this.groupUnits) {
      groupUnit.update(deltaTime);
    }
    
    // 更新巡邏系統
    this.patrol.update();
    
    // 更新 PVP 模式
    if (this.isPVP) {
      this.updatePVPMode();
    }
    
    this.lastFrameTime = currentTime;
  }
  
  // 更新群組行為
  private updateGroupBehaviors(): void {
    for (let i = 0; i < this.groupUnits.length; i++) {
      const currentGroup = this.groupUnits[i];
      const currentUnits = currentGroup.getUnits();
      
      // 收集所有敵對單位
      const enemyUnits = [];
      for (let j = 0; j < this.groupUnits.length; j++) {
        if (i !== j) {
          enemyUnits.push(...this.groupUnits[j].getUnits());
        }
      }
      
      // 執行群體行為
      const leader = currentGroup.getLeader();
      if (leader) {
        this.flock.run(leader, currentUnits, this.obstacles, enemyUnits);
      }
    }
  }
  
  // 更新 PVP 模式
  private updatePVPMode(): void {
    this.pvpTimer--;
    
    if (this.pvpTimer <= 0) {
      this.pvpTimer = 1200;
      
      // 讓所有群組攻擊玩家群組（第一個群組）
      const playerGroup = this.groupUnits[0];
      if (playerGroup) {
        const playerLeader = playerGroup.getLeader();
        if (playerLeader) {
          for (let i = 1; i < this.groupUnits.length; i++) {
            this.groupUnits[i].setDestination(playerLeader.position);
          }
        }
      }
    }
  }
  
  // 渲染
  public render(): void {
    // 清空畫面
    this.renderSystem.clear();
    
    // 渲染障礙物
    this.renderSystem.renderObstacles(this.obstacles);
    
    // 渲染所有群組的單位
    const allUnits = this.groupUnits.flatMap(group => group.getUnits());
    this.renderSystem.renderUnits(allUnits);
    
    // 渲染巡邏系統
    this.patrol.render(this.p);
    
    // 渲染 UI 文字
    this.renderGameUI();
    
    // 渲染除錯資訊
    const debugInfo = {
      frameRate: this.p.frameRate(),
      unitCount: allUnits.length,
      obstacleCount: this.obstacles.length,
      currentControl: this.currentControl,
      isPVP: this.isPVP,
      viewX: this.cameraSystem.getPosition().x,
      viewY: this.cameraSystem.getPosition().y
    };
    
    this.renderSystem.renderDebugInfo(debugInfo);
    
    // 執行最終渲染
    this.renderSystem.render();
  }
  
  // 渲染遊戲 UI 文字
  private renderGameUI(): void {
    const cameraPos = this.cameraSystem.getPosition();
    const viewX = cameraPos.x;
    const viewY = cameraPos.y;
    
    // 渲染群組單位統計
    for (let i = 0; i < this.groupUnits.length; i++) {
      const xPos = viewX - this.displayWidth / 2 + 100 + i * 50;
      const yPos = viewY - this.displayHeight / 2 + 20;
      const text = `P${i + 1}_${this.groupUnits[i].getUnits().length}`;
      
      this.renderSystem.renderText(text, xPos, yPos, { r: 249, g: 249, b: 246 });
    }
    
    // 渲染 PVP 計時器
    if (this.isPVP) {
      const timerText = `PT ${this.pvpTimer}`;
      const timerX = viewX + 85;
      const timerY = viewY - this.displayHeight / 2 + 50;
      
      this.renderSystem.renderText(timerText, timerX, timerY, { r: 255, g: 255, b: 0 });
    }
  }
  
  // 系統控制方法
  public destroy(): void {
    this.uiSystem.destroy();
    this.groupUnits = [];
    this.obstacles = [];
    this.patrol.clear();
  }
  
  public isPaused(): boolean {
    return this.paused;
  }
  
  public setPaused(paused: boolean): void {
    this.paused = paused;
  }
  
  // 群組單位管理
  public getGroupUnits(): IGroupUnit[] {
    return [...this.groupUnits];
  }
  
  public getGroupUnit(index: number): IGroupUnit | undefined {
    return this.groupUnits[index];
  }
  
  public addGroupUnit(groupUnit: IGroupUnit): void {
    this.groupUnits.push(groupUnit);
  }
  
  public removeGroupUnit(index: number): void {
    if (index >= 0 && index < this.groupUnits.length) {
      this.groupUnits.splice(index, 1);
    }
  }
  
  // 障礙物管理
  public getObstacles(): IObstacle[] {
    return [...this.obstacles];
  }
  
  public addObstacle(obstacle: IObstacle): void {
    this.obstacles.push(obstacle);
  }
  
  public removeObstacle(obstacle: IObstacle): void {
    const index = this.obstacles.indexOf(obstacle);
    if (index !== -1) {
      this.obstacles.splice(index, 1);
    }
  }
  
  // 巡邏系統
  public getPatrol(): IPatrol {
    return this.patrol;
  }
  
  // 控制管理
  public getCurrentControl(): ControlMode {
    return this.currentControl;
  }
  
  public setCurrentControl(control: ControlMode): void {
    this.currentControl = control;
    this.uiSystem.updateControlDisplay(control);
  }
  
  // PVP 模式
  public isPVPMode(): boolean {
    return this.isPVP;
  }
  
  public setPVPMode(enabled: boolean): void {
    this.isPVP = enabled;
    this.pvpTimer = enabled ? 50 : 1200;
    this.uiSystem.updatePVPDisplay(enabled);
  }
  
  // 遊戲配置
  public getDisplaySize(): { width: number; height: number } {
    return {
      width: this.displayWidth,
      height: this.displayHeight
    };
  }
  
  // 統計資訊
  public getGameStats(): {
    frameRate: number;
    totalUnits: number;
    totalObstacles: number;
    currentControl: ControlMode;
    isPVP: boolean;
    isActive: boolean;
  } {
    const totalUnits = this.groupUnits.reduce(
      (sum, group) => sum + group.getUnits().length,
      0
    );
    
    return {
      frameRate: this.p.frameRate(),
      totalUnits,
      totalObstacles: this.obstacles.length,
      currentControl: this.currentControl,
      isPVP: this.isPVP,
      isActive: !this.paused
    };
  }
  
  // 輸入處理方法（供 p5 事件調用）
  public onMousePressed(mouseX: number, mouseY: number): void {
    this.inputSystem.onMousePressed(mouseX, mouseY);
  }
  
  public onKeyPressed(keyCode: number): void {
    this.inputSystem.onKeyPressed(keyCode);
  }
  
  public onKeyReleased(keyCode: number): void {
    this.inputSystem.onKeyReleased(keyCode);
  }
}