/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Game.ts":
/*!*********************!*\
  !*** ./src/Game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _sketch_GameSketch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sketch/GameSketch */ "./src/sketch/GameSketch.ts");
// 遊戲主入口點
/// <reference path="./types/p5.d.ts" />

class Game {
    constructor() {
        this.gameSketch = null;
        this.p5Instance = null;
        this.init();
    }
    init() {
        // 創建 p5 sketch 函數
        const sketch = (p) => {
            this.gameSketch = new _sketch_GameSketch__WEBPACK_IMPORTED_MODULE_0__.GameSketch(p);
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


/***/ }),

/***/ "./src/core/GameManager.ts":
/*!*********************************!*\
  !*** ./src/core/GameManager.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameManager: () => (/* binding */ GameManager)
/* harmony export */ });
/* harmony import */ var _models_GroupUnit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/GroupUnit */ "./src/models/GroupUnit.ts");
/* harmony import */ var _models_Obstacle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/Obstacle */ "./src/models/Obstacle.ts");
/* harmony import */ var _models_Patrol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../models/Patrol */ "./src/models/Patrol.ts");
/* harmony import */ var _models_Flock__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../models/Flock */ "./src/models/Flock.ts");
/* harmony import */ var _systems_RenderSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../systems/RenderSystem */ "./src/systems/RenderSystem.ts");
/* harmony import */ var _systems_InputSystem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../systems/InputSystem */ "./src/systems/InputSystem.ts");
/* harmony import */ var _systems_UISystem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../systems/UISystem */ "./src/systems/UISystem.ts");
/* harmony import */ var _systems_CameraSystem__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../systems/CameraSystem */ "./src/systems/CameraSystem.ts");
/* harmony import */ var _types_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../types/common */ "./src/types/common.ts");
// GameManager - 主遊戲管理器，統一管理所有系統和遊戲狀態
/// <reference path="../types/p5.d.ts" />









class GameManager {
    constructor(p, displayWidth, displayHeight) {
        // 遊戲實體
        this.groupUnits = [];
        this.obstacles = [];
        // 遊戲狀態
        this.paused = false;
        this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_8__.ControlMode.PLAYER;
        this.isPVP = false;
        this.pvpTimer = 1200;
        this.lastFrameTime = 0;
        // 遊戲配置
        this.groupUnitCount = 9;
        this.p = p;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        // 初始化系統
        this.renderSystem = new _systems_RenderSystem__WEBPACK_IMPORTED_MODULE_4__.RenderSystem(p, displayWidth, displayHeight);
        this.inputSystem = new _systems_InputSystem__WEBPACK_IMPORTED_MODULE_5__.InputSystem(p);
        this.uiSystem = new _systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UISystem(p, displayWidth, displayHeight);
        this.cameraSystem = new _systems_CameraSystem__WEBPACK_IMPORTED_MODULE_7__.CameraSystem(p, displayWidth, displayHeight);
        this.flock = new _models_Flock__WEBPACK_IMPORTED_MODULE_3__.Flock(p);
        // 初始化遊戲實體
        this.patrol = new _models_Patrol__WEBPACK_IMPORTED_MODULE_2__.Patrol(p);
        this.setupEventListeners();
    }
    // 初始化
    initialize() {
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
    initializeGroupUnits() {
        for (let i = 0; i < this.groupUnitCount; i++) {
            const x = (this.displayWidth / this.groupUnitCount) * i + 20;
            const y = this.displayHeight - 50;
            const groupId = i + 1;
            const groupUnit = new _models_GroupUnit__WEBPACK_IMPORTED_MODULE_0__.GroupUnit(this.p, groupId, x, y);
            // 添加初始單位
            for (let j = 0; j < 5; j++) {
                groupUnit.addUnit(x + j * 10, y);
            }
            this.groupUnits.push(groupUnit);
        }
    }
    // 初始化障礙物
    initializeObstacles() {
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
            const obstacle = new _models_Obstacle__WEBPACK_IMPORTED_MODULE_1__.Obstacle(this.p, config.x, config.y, config.radius);
            this.obstacles.push(obstacle);
        }
    }
    // 初始化巡邏系統
    initializePatrol() {
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
    setupEventListeners() {
        // 輸入事件
        this.inputSystem.addEventListener(_systems_InputSystem__WEBPACK_IMPORTED_MODULE_5__.InputEventType.MOUSE_CLICK, (event) => {
            if (event.mousePosition) {
                this.handleMouseClick(event.mousePosition);
            }
        });
        this.inputSystem.addEventListener(_systems_InputSystem__WEBPACK_IMPORTED_MODULE_5__.InputEventType.CAMERA_MOVE, (event) => {
            if (event.movement) {
                this.cameraSystem.move(event.movement.x, event.movement.y);
            }
        });
        // UI 事件
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.CONTROL_CHANGED, (event) => {
            if (event.data?.control) {
                this.setCurrentControl(event.data.control);
            }
        });
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.PVP_TOGGLED, (event) => {
            if (event.data?.isPVP !== undefined) {
                this.setPVPMode(event.data.isPVP);
            }
        });
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.NEW_UNIT_REQUESTED, () => {
            this.addUnitsToCurrentGroup();
        });
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.ARROW_TOGGLED, (event) => {
            if (event.data?.showArrows !== undefined) {
                this.renderSystem.renderArrows(event.data.showArrows);
            }
        });
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.TARGET_LINE_TOGGLED, (event) => {
            if (event.data?.showTargetLines !== undefined) {
                this.renderSystem.renderTargetLines(event.data.showTargetLines);
            }
        });
        this.uiSystem.addEventListener(_systems_UISystem__WEBPACK_IMPORTED_MODULE_6__.UIEventType.UNIT_STATS_TOGGLED, (event) => {
            if (event.data?.showUnitStats !== undefined) {
                this.renderSystem.renderUnitStats(event.data.showUnitStats);
            }
        });
    }
    // 處理滑鼠點擊
    handleMouseClick(mousePosition) {
        // 轉換為世界座標
        const worldPos = this.cameraSystem.screenToWorld(mousePosition);
        // 設定當前控制群組的目標位置
        const currentGroup = this.groupUnits[this.currentControl - 1];
        if (currentGroup) {
            currentGroup.setDestination(worldPos);
        }
    }
    // 添加單位到當前控制群組
    addUnitsToCurrentGroup() {
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
    update(deltaTime) {
        if (this.paused)
            return;
        // 限制更新頻率
        const currentTime = Date.now();
        if (currentTime - this.lastFrameTime < 41)
            return; // 約 24 FPS
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
    updateGroupBehaviors() {
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
    updatePVPMode() {
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
    render() {
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
    renderGameUI() {
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
    destroy() {
        this.uiSystem.destroy();
        this.groupUnits = [];
        this.obstacles = [];
        this.patrol.clear();
    }
    isPaused() {
        return this.paused;
    }
    setPaused(paused) {
        this.paused = paused;
    }
    // 群組單位管理
    getGroupUnits() {
        return [...this.groupUnits];
    }
    getGroupUnit(index) {
        return this.groupUnits[index];
    }
    addGroupUnit(groupUnit) {
        this.groupUnits.push(groupUnit);
    }
    removeGroupUnit(index) {
        if (index >= 0 && index < this.groupUnits.length) {
            this.groupUnits.splice(index, 1);
        }
    }
    // 障礙物管理
    getObstacles() {
        return [...this.obstacles];
    }
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }
    removeObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index !== -1) {
            this.obstacles.splice(index, 1);
        }
    }
    // 巡邏系統
    getPatrol() {
        return this.patrol;
    }
    // 控制管理
    getCurrentControl() {
        return this.currentControl;
    }
    setCurrentControl(control) {
        this.currentControl = control;
        this.uiSystem.updateControlDisplay(control);
    }
    // PVP 模式
    isPVPMode() {
        return this.isPVP;
    }
    setPVPMode(enabled) {
        this.isPVP = enabled;
        this.pvpTimer = enabled ? 50 : 1200;
        this.uiSystem.updatePVPDisplay(enabled);
    }
    // 遊戲配置
    getDisplaySize() {
        return {
            width: this.displayWidth,
            height: this.displayHeight
        };
    }
    // 統計資訊
    getGameStats() {
        const totalUnits = this.groupUnits.reduce((sum, group) => sum + group.getUnits().length, 0);
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
    onMousePressed(mouseX, mouseY) {
        this.inputSystem.onMousePressed(mouseX, mouseY);
    }
    onKeyPressed(keyCode) {
        this.inputSystem.onKeyPressed(keyCode);
    }
    onKeyReleased(keyCode) {
        this.inputSystem.onKeyReleased(keyCode);
    }
}


/***/ }),

/***/ "./src/interfaces/IFlockBehavior.ts":
/*!******************************************!*\
  !*** ./src/interfaces/IFlockBehavior.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_FLOCK_CONFIG: () => (/* binding */ DEFAULT_FLOCK_CONFIG)
/* harmony export */ });
const DEFAULT_FLOCK_CONFIG = {
    separationWeight: 2.2,
    alignmentWeight: 1.0,
    cohesionWeight: 1.0,
    avoidanceWeight: 2.0,
    enemyAvoidanceWeight: 2.0,
    desiredSeparation: 25.0,
    neighborDistance: 30,
    collisionVisibilityFactor: 6,
    showArrows: false
};


/***/ }),

/***/ "./src/models/AttackVFX.ts":
/*!*********************************!*\
  !*** ./src/models/AttackVFX.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AttackVFX: () => (/* binding */ AttackVFX)
/* harmony export */ });
// 攻擊視覺特效類別
/// <reference path="../types/p5.d.ts" />
class AttackVFX {
    constructor(p, base, vec, color) {
        this.p = p;
        this.showtime = 10;
        this.base = base;
        this.vec = vec;
        this.color = color;
    }
    draw() {
        this.showtime--;
        this.p.push();
        // 設定顏色
        if (typeof this.color === 'string') {
            this.p.stroke(this.color);
            this.p.fill(this.color);
        }
        else {
            this.p.stroke(this.color.r, this.color.g, this.color.b, this.color.a || 255);
            this.p.fill(this.color.r, this.color.g, this.color.b, this.color.a || 255);
        }
        this.p.strokeWeight(3);
        this.p.translate(this.base.x, this.base.y);
        this.p.line(0, 0, this.vec.x, this.vec.y);
        this.p.rotate(this.vec.heading());
        this.p.pop();
    }
    isExpired() {
        return this.showtime <= 0;
    }
    getRemainingTime() {
        return this.showtime;
    }
}


/***/ }),

/***/ "./src/models/Flock.ts":
/*!*****************************!*\
  !*** ./src/models/Flock.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Flock: () => (/* binding */ Flock)
/* harmony export */ });
/* harmony import */ var _interfaces_IFlockBehavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../interfaces/IFlockBehavior */ "./src/interfaces/IFlockBehavior.ts");
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// Flock 類別 - 群體行為實現
/// <reference path="../types/p5.d.ts" />


class Flock {
    constructor(p, config) {
        this.p = p;
        this.config = { ..._interfaces_IFlockBehavior__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_FLOCK_CONFIG, ...config };
    }
    // 主要運行方法
    run(leader, units, obstacles, enemies) {
        // 處理跟隨狀態的單位
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            if (unit.isFollow && unit.isFollow()) {
                this.applyFollowBehaviors(leader, unit, units, obstacles, enemies);
            }
            if (unit.isAttacking && unit.isAttacking()) {
                this.applyAttackBehaviors(leader, unit, units, obstacles, enemies);
            }
        }
        // 處理領導者的避障
        if (leader.isMove && leader.isMove()) {
            const avoidance = this.avoid(leader, obstacles);
            if (avoidance.mag() > 0) {
                if (this.config.showArrows) {
                    this.drawArrow(this.p, leader.position, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, avoidance, 1000), 'white');
                }
                leader.applyForce(avoidance);
            }
        }
        // 群體停止邏輯
        this.handleGroupStopping(leader, units);
    }
    applyFollowBehaviors(leader, unit, units, obstacles, enemies) {
        const sep = this.separate(leader, unit, units);
        const ali = this.align(leader, unit, units);
        const coh = this.cohesion(leader, unit, units);
        const avo = this.avoid(unit, obstacles);
        const avoEnemy = this.avoidEnemies(unit, enemies);
        // 應用權重
        sep.mult(this.config.separationWeight);
        ali.mult(this.config.alignmentWeight);
        coh.mult(this.config.cohesionWeight);
        // 應用基本行為力
        unit.applyForce(sep);
        unit.applyForce(ali);
        unit.applyForce(coh);
        // 應用避障力
        if (avo.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, avo, 1000), 'white');
            }
            avo.mult(this.config.avoidanceWeight);
            unit.applyForce(avo);
        }
        if (avoEnemy.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, avoEnemy, 1000), 'purple');
            }
            avoEnemy.mult(this.config.enemyAvoidanceWeight);
            unit.applyForce(avoEnemy);
        }
    }
    applyAttackBehaviors(leader, unit, units, obstacles, enemies) {
        const sep = this.separate(leader, unit, units);
        const coh = this.cohesion(leader, unit, units);
        const avo = this.avoid(unit, obstacles);
        const avoEnemy = this.avoidEnemies(unit, enemies);
        // 攻擊狀態下的權重調整
        sep.mult(1.2);
        coh.mult(1.0);
        unit.applyForce(sep);
        unit.applyForce(coh);
        if (avo.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, avo, 1000), 'white');
            }
            avo.mult(this.config.avoidanceWeight);
            unit.applyForce(avo);
        }
        if (avoEnemy.mag() > 0) {
            if (this.config.showArrows) {
                this.drawArrow(this.p, unit.position, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, avoEnemy, 1000), 'purple');
            }
            avoEnemy.mult(this.config.enemyAvoidanceWeight);
            unit.applyForce(avoEnemy);
        }
    }
    handleGroupStopping(leader, units) {
        if (!leader.isMove || leader.isMove())
            return;
        const sum = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        for (let i = 0; i < units.length; i++) {
            sum.add(units[i].position);
        }
        if (units.length > 0) {
            sum.div(units.length);
        }
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(leader.position, sum);
        if (distance < this.config.desiredSeparation) {
            for (let i = 0; i < units.length; i++) {
                if (!units[i].isAttacking || !units[i].isAttacking()) {
                    units[i].setStop();
                }
            }
        }
    }
    // 分離行為 - 避免過度擁擠
    separate(leader, targetUnit, units) {
        const steer = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        let count = 0;
        // 與領導者的分離
        const diffFromLeader = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, targetUnit.position, leader.position);
        const distFromLeader = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(targetUnit.position, leader.position);
        if (distFromLeader < this.config.desiredSeparation) {
            diffFromLeader.normalize();
            if (distFromLeader !== 0) {
                diffFromLeader.div(distFromLeader);
            }
            steer.add(diffFromLeader);
            count = 1;
        }
        // 與其他單位的分離
        for (let i = 0; i < units.length; i++) {
            const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(targetUnit.position, units[i].position);
            if (distance > 0 && distance < this.config.desiredSeparation) {
                const diff = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, targetUnit.position, units[i].position);
                diff.normalize();
                if (distance !== 0) {
                    diff.div(distance);
                }
                steer.add(diff);
                count++;
            }
        }
        // 平均化
        if (count > 0) {
            steer.div(count);
        }
        // 應用 Reynolds 導向公式
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(targetUnit.maxSpeed);
            steer.sub(targetUnit.velocity);
            steer.limit(targetUnit.maxForce);
        }
        return steer;
    }
    // 對齊行為 - 朝向平均方向
    align(leader, targetUnit, units) {
        const sum = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        let count = 1;
        // 太遠就不對齊
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(targetUnit.position, leader.position);
        if (distance > this.config.neighborDistance) {
            return new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        }
        // 加入領導者的方向
        if (leader.direction) {
            sum.add(leader.direction);
        }
        // 加入鄰近單位的速度
        for (let i = 0; i < units.length; i++) {
            const d = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(targetUnit.position, units[i].position);
            if (d > 0) {
                sum.add(units[i].velocity);
                count++;
            }
        }
        sum.div(count);
        sum.normalize();
        sum.mult(targetUnit.maxSpeed);
        const steer = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, sum, targetUnit.velocity);
        steer.limit(targetUnit.maxForce);
        return steer;
    }
    // 凝聚行為 - 朝向群體中心
    cohesion(leader, targetUnit, _units) {
        const sum = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        sum.add(leader.position);
        // 註解掉的部分保持原樣，可能有特殊用途
        /*
        for (let i = 0; i < units.length; i++) {
          const d = Vector.dist(targetUnit.position, units[i].position);
          if (d > 0) {
            sum.add(units[i].position);
            count++;
          }
        }
        sum.div(count);
        */
        return targetUnit.seek(sum);
    }
    // 避障行為 - 避開障礙物
    avoid(targetUnit, obstacles) {
        const sum = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
        for (let j = 0; j < obstacles.length; j++) {
            const obstacle = obstacles[j];
            const dist = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(obstacle.position, targetUnit.position);
            const vLength = targetUnit.velocity.mag() * this.config.collisionVisibilityFactor;
            // 進入碰撞判斷
            if ((vLength + obstacle.radius + targetUnit.r) >= dist) {
                const a = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, obstacle.position, targetUnit.position);
                const v = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.mult(this.p, targetUnit.velocity, this.config.collisionVisibilityFactor);
                v.normalize();
                v.mult(a.mag());
                const b = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, v, a);
                const twoObjRadiusAddition = obstacle.radius + targetUnit.r;
                // 碰撞處理
                if (b.mag() <= twoObjRadiusAddition) {
                    if (b.mag() === 0) {
                        // 如果重疊，給一個隨機方向
                        const randomAngle = this.p.radians(10);
                        b.set(targetUnit.velocity.x * Math.cos(randomAngle) - targetUnit.velocity.y * Math.sin(randomAngle), targetUnit.velocity.x * Math.sin(randomAngle) + targetUnit.velocity.y * Math.cos(randomAngle));
                    }
                    if (b.mag() < twoObjRadiusAddition) {
                        b.normalize();
                        b.mult(twoObjRadiusAddition);
                    }
                    sum.add(b);
                }
            }
        }
        sum.limit(targetUnit.maxForce);
        return sum;
    }
    // 避開敵人
    avoidEnemies(targetUnit, enemies) {
        // 將敵人視為動態障礙物進行避障
        const enemyObstacles = enemies.map(enemy => ({
            id: enemy.id,
            position: enemy.position,
            radius: enemy.r * 2, // 敵人的避障半徑
            color: { r: 255, g: 0, b: 0 },
            strokeWeight: undefined,
            // 簡化的障礙物方法實作
            checkCollision: (unit) => _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, unit.position) < (enemy.r + unit.r),
            checkCollisionWithPoint: (point) => _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, point) < enemy.r,
            checkCollisionWithCircle: (center, radius) => _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, center) < (enemy.r + radius),
            distanceToPoint: (point) => Math.max(0, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, point) - enemy.r),
            distanceToUnit: (unit) => Math.max(0, _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, unit.position) - enemy.r - unit.r),
            getAvoidanceForce: (unit) => {
                const direction = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, unit.position, enemy.position);
                const distance = direction.mag();
                if (distance === 0)
                    return new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, this.p.random(-1, 1), this.p.random(-1, 1));
                direction.normalize();
                const avoidanceRadius = enemy.r + unit.r + 20;
                if (distance < avoidanceRadius) {
                    const strength = (avoidanceRadius - distance) / avoidanceRadius;
                    direction.mult(strength * unit.maxForce * 2);
                    return direction;
                }
                return new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, 0, 0);
            },
            getClosestPoint: (_point) => enemy.position.copy(),
            getBoundingBox: () => ({
                left: enemy.position.x - enemy.r,
                right: enemy.position.x + enemy.r,
                top: enemy.position.y - enemy.r,
                bottom: enemy.position.y + enemy.r
            }),
            render: () => { },
            isPointInside: (point) => _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, point) < enemy.r,
            copy: () => enemies[0] // 簡化實作
        }));
        return this.avoid(targetUnit, enemyObstacles);
    }
    // 繪製箭頭（除錯用）
    drawArrow(p, base, vec, color) {
        p.push();
        p.stroke(color);
        p.strokeWeight(3);
        p.fill(color);
        p.translate(base.x, base.y);
        p.line(0, 0, vec.x, vec.y);
        // 計算箭頭方向
        const heading = Math.atan2(vec.y, vec.x);
        p.rotate(heading);
        const arrowSize = 7;
        p.translate(vec.mag() - arrowSize, 0);
        // 繪製箭頭
        p.beginShape();
        p.vertex(0, arrowSize / 2);
        p.vertex(0, -arrowSize / 2);
        p.vertex(arrowSize, 0);
        p.endShape();
        p.pop();
    }
    // 配置方法
    setSeparationWeight(weight) {
        this.config.separationWeight = weight;
    }
    setAlignmentWeight(weight) {
        this.config.alignmentWeight = weight;
    }
    setCohesionWeight(weight) {
        this.config.cohesionWeight = weight;
    }
    setAvoidanceWeight(weight) {
        this.config.avoidanceWeight = weight;
    }
    setDesiredSeparation(distance) {
        this.config.desiredSeparation = distance;
    }
    setNeighborDistance(distance) {
        this.config.neighborDistance = distance;
    }
    setCollisionVisibilityFactor(factor) {
        this.config.collisionVisibilityFactor = factor;
    }
    enableArrows(enable) {
        this.config.showArrows = enable;
    }
    // 取得當前配置
    getConfiguration() {
        return { ...this.config };
    }
    // 更新配置
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
    }
}


/***/ }),

/***/ "./src/models/GroupUnit.ts":
/*!*********************************!*\
  !*** ./src/models/GroupUnit.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupUnit: () => (/* binding */ GroupUnit)
/* harmony export */ });
/* harmony import */ var _Unit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Unit */ "./src/models/Unit.ts");
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// GroupUnit 類別 - 單位群組管理
/// <reference path="../types/p5.d.ts" />


class GroupUnit {
    constructor(p, groupId, x = 0, y = 0) {
        this.destination = null;
        this.p = p;
        this.id = Date.now() + Math.random(); // 唯一 ID
        this.groupId = groupId;
        this.unitObjs = [];
        // 創建領導單位
        this.leader = new _Unit__WEBPACK_IMPORTED_MODULE_0__.Unit(p, x, y, groupId);
        this.leader.setAsLeader();
    }
    // 原有的更新方法（保留供向後相容）
    updateWithEnemies(enemyUnits, deltaTime = 1, isPVP = false) {
        // 更新領導單位
        this.leader.update(deltaTime);
        // 更新所有單位
        for (let i = this.unitObjs.length - 1; i >= 0; i--) {
            const unit = this.unitObjs[i];
            // 移除死亡單位
            if (!unit.isAlive || unit.health <= 0) {
                this.unitObjs.splice(i, 1);
                continue;
            }
            // 攻擊目標管理
            this.manageAttackTarget(unit, enemyUnits, isPVP);
            // 更新單位
            unit.update(deltaTime);
        }
    }
    manageAttackTarget(unit, enemyUnits, isPVP) {
        // 檢查現有攻擊目標是否有效
        const currentTarget = unit.attackUnit;
        // 清理無效目標
        if (currentTarget) {
            if (!currentTarget.isAlive || currentTarget.health <= 0) {
                unit.attackUnit = null;
            }
            else {
                // 檢查距離是否過遠
                const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(currentTarget.position, unit.position);
                const visibleDistance = unit.attackVisibleDistance || 120;
                if (distance > visibleDistance / 2) {
                    unit.attackUnit = null;
                }
            }
        }
        // PVP 模式下的目標管理
        if (!isPVP && unit.attackUnit) {
            unit.attackUnit = null;
            unit.setFollow();
        }
        // 在 PVP 模式下尋找新目標
        if (!unit.attackUnit && isPVP) {
            this.findNewTarget(unit, enemyUnits);
        }
    }
    findNewTarget(unit, enemyUnits) {
        let minDistance = Number.MAX_VALUE;
        let closestEnemy = null;
        const visibleDistance = unit.attackVisibleDistance || 120;
        for (const enemy of enemyUnits) {
            if (enemy.isAlive && enemy.health > 0) {
                const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(enemy.position, unit.position);
                if (distance < visibleDistance && distance < minDistance) {
                    minDistance = distance;
                    closestEnemy = enemy;
                }
            }
        }
        if (closestEnemy) {
            unit.setAttack(closestEnemy);
        }
    }
    // 舊版本的 render 方法（向後相容）
    renderWithText(p, textRenderer) {
        // 使用新的 render 方法
        this.render(p);
        // 如果需要文字渲染
        if (textRenderer) {
            textRenderer.text(this.groupId.toString(), this.leader.position.x + 10, this.leader.position.y);
        }
    }
    setDestination(target) {
        this.destination = target;
        // 設定領導單位目標
        this.leader.setDestination(target);
        // 設定所有非攻擊狀態的單位為跟隨模式
        for (const unit of this.unitObjs) {
            if (!unit.isAttacking()) {
                unit.setFollow();
            }
        }
    }
    add(x, y) {
        const newUnit = new _Unit__WEBPACK_IMPORTED_MODULE_0__.Unit(this.p, x, y, this.groupId);
        newUnit.setFollow();
        this.unitObjs.push(newUnit);
    }
    // IGroupUnit 介面實作
    addUnit(x, y) {
        const newUnit = new _Unit__WEBPACK_IMPORTED_MODULE_0__.Unit(this.p, x, y, this.groupId);
        newUnit.setFollow();
        this.unitObjs.push(newUnit);
        return newUnit;
    }
    getDestination() {
        return this.destination;
    }
    update(deltaTime) {
        // 更新領導單位
        this.leader.update(deltaTime);
        // 更新所有單位
        for (let i = this.unitObjs.length - 1; i >= 0; i--) {
            const unit = this.unitObjs[i];
            // 移除死亡單位
            if (!unit.isAlive || unit.health <= 0) {
                this.unitObjs.splice(i, 1);
                continue;
            }
            // 更新單位
            unit.update(deltaTime);
        }
    }
    render(p) {
        // 渲染領導單位
        this.leader.render(p);
        // 渲染所有單位
        for (const unit of this.unitObjs) {
            unit.render(p);
        }
    }
    isActive() {
        return this.leader.isAlive;
    }
    getAveragePosition() {
        return this.getGroupCenter();
    }
    getBounds() {
        if (this.unitObjs.length === 0) {
            const pos = this.leader.position;
            const radius = this.leader.r;
            return {
                min: new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, pos.x - radius, pos.y - radius),
                max: new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, pos.x + radius, pos.y + radius)
            };
        }
        const allUnits = [this.leader, ...this.unitObjs];
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const unit of allUnits) {
            const radius = unit.r;
            minX = Math.min(minX, unit.position.x - radius);
            minY = Math.min(minY, unit.position.y - radius);
            maxX = Math.max(maxX, unit.position.x + radius);
            maxY = Math.max(maxY, unit.position.y + radius);
        }
        return {
            min: new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, minX, minY),
            max: new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, maxX, maxY)
        };
    }
    getTotalHealth() {
        return this.unitObjs.reduce((sum, unit) => sum + unit.health, this.leader.health);
    }
    // 獲取方法
    getLeader() {
        return this.leader;
    }
    getUnits() {
        return [...this.unitObjs]; // 回傳副本避免外部修改
    }
    getAllUnits() {
        return [this.leader, ...this.unitObjs];
    }
    getUnitCount() {
        return this.unitObjs.length;
    }
    getTotalUnitCount() {
        return this.unitObjs.length + 1; // 包含 leader
    }
    getGroupId() {
        return this.groupId;
    }
    getAliveUnits() {
        return this.unitObjs.filter(unit => unit.isAlive);
    }
    getDeadUnits() {
        return this.unitObjs.filter(unit => !unit.isAlive);
    }
    // 群組狀態管理
    setGroupFollow() {
        for (const unit of this.unitObjs) {
            if (!unit.isAttacking()) {
                unit.setFollow();
            }
        }
    }
    setGroupStop() {
        this.leader.setStop();
        for (const unit of this.unitObjs) {
            unit.setStop();
        }
    }
    // 移除單位
    removeUnit(unit) {
        const index = this.unitObjs.indexOf(unit);
        if (index !== -1) {
            this.unitObjs.splice(index, 1);
            return true;
        }
        return false;
    }
    removeUnitById(id) {
        const index = this.unitObjs.findIndex(unit => unit.id === id);
        if (index !== -1) {
            this.unitObjs.splice(index, 1);
            return true;
        }
        return false;
    }
    removeDeadUnits() {
        const initialCount = this.unitObjs.length;
        this.unitObjs = this.unitObjs.filter(unit => unit.isAlive);
        return initialCount - this.unitObjs.length;
    }
    // 群組統計
    getAverageHealth() {
        if (this.unitObjs.length === 0)
            return this.leader.health;
        const totalHealth = this.unitObjs.reduce((sum, unit) => sum + unit.health, this.leader.health);
        return totalHealth / (this.unitObjs.length + 1);
    }
    getGroupCenter() {
        if (this.unitObjs.length === 0) {
            return this.leader.position.copy();
        }
        let totalX = this.leader.position.x;
        let totalY = this.leader.position.y;
        for (const unit of this.unitObjs) {
            totalX += unit.position.x;
            totalY += unit.position.y;
        }
        const count = this.unitObjs.length + 1;
        return new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(this.p, totalX / count, totalY / count);
    }
    // 群組行為控制
    isGroupIdle() {
        return this.leader.state === 'stop' && this.unitObjs.every(unit => unit.state === 'stop' || unit.state === 'follow');
    }
    hasAttackingUnits() {
        return this.unitObjs.some(unit => unit.isAttacking());
    }
    getAttackingUnits() {
        return this.unitObjs.filter(unit => unit.isAttacking());
    }
    getFollowingUnits() {
        return this.unitObjs.filter(unit => unit.isFollow());
    }
}


/***/ }),

/***/ "./src/models/Obstacle.ts":
/*!********************************!*\
  !*** ./src/models/Obstacle.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Obstacle: () => (/* binding */ Obstacle)
/* harmony export */ });
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// Obstacle 類別 - 障礙物實體
/// <reference path="../types/p5.d.ts" />

class Obstacle {
    constructor(p, x, y, radius) {
        this.p = p;
        this.id = `obstacle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, x, y);
        this.radius = radius;
        // 預設顏色
        this.color = { r: 127, g: 127, b: 127 };
        this.strokeColor = { r: 255, g: 0, b: 0 }; // 紅色邊框
        this.strokeWeight = 1;
    }
    // 碰撞檢測
    checkCollision(unit) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(unit.position, this.position);
        return distance < (this.radius / 2 + unit.r); // radius 是直徑，所以除以 2
    }
    checkCollisionWithPoint(point) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(point, this.position);
        return distance < this.radius / 2;
    }
    checkCollisionWithCircle(center, radius) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(center, this.position);
        return distance < (this.radius / 2 + radius);
    }
    // 距離計算
    distanceToPoint(point) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(point, this.position);
        return Math.max(0, distance - this.radius / 2);
    }
    distanceToUnit(unit) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(unit.position, this.position);
        return Math.max(0, distance - this.radius / 2 - unit.r);
    }
    // 避障計算
    getAvoidanceForce(unit) {
        const direction = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.sub(this.p, unit.position, this.position);
        const distance = direction.mag();
        if (distance === 0) {
            // 如果位置重疊，給一個隨機方向
            return new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(this.p, this.p.random(-1, 1), this.p.random(-1, 1));
        }
        direction.normalize();
        // 避障力度與距離成反比
        const avoidanceRadius = this.radius / 2 + unit.r + 20; // 額外的安全距離
        if (distance < avoidanceRadius) {
            const strength = (avoidanceRadius - distance) / avoidanceRadius;
            direction.mult(strength * unit.maxForce * 2); // 乘以 2 增強避障力度
            return direction;
        }
        return new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(this.p, 0, 0);
    }
    getClosestPoint(point) {
        const direction = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.sub(this.p, point, this.position);
        const distance = direction.mag();
        if (distance <= this.radius / 2) {
            // 點在圓內，回傳圓心
            return this.position.copy();
        }
        // 點在圓外，回傳圓周上最近的點
        direction.normalize();
        direction.mult(this.radius / 2);
        return _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.add(this.p, this.position, direction);
    }
    // 邊界框
    getBoundingBox() {
        const halfRadius = this.radius / 2;
        return {
            left: this.position.x - halfRadius,
            right: this.position.x + halfRadius,
            top: this.position.y - halfRadius,
            bottom: this.position.y + halfRadius
        };
    }
    // 渲染
    render(p) {
        p.push();
        // 設定填充顏色
        p.fill(this.color.r, this.color.g, this.color.b, this.color.a || 255);
        // 設定邊框
        if (this.strokeColor) {
            p.stroke(this.strokeColor.r, this.strokeColor.g, this.strokeColor.b, this.strokeColor.a || 255);
            if (this.strokeWeight) {
                p.strokeWeight(this.strokeWeight);
            }
        }
        else {
            p.noStroke();
        }
        // 繪製圓形障礙物
        p.circle(this.position.x, this.position.y, this.radius);
        p.pop();
    }
    // 工具方法
    isPointInside(point) {
        return this.checkCollisionWithPoint(point);
    }
    copy() {
        const newObstacle = new Obstacle(this.p, this.position.x, this.position.y, this.radius);
        newObstacle.color = { ...this.color };
        if (this.strokeColor) {
            newObstacle.strokeColor = { ...this.strokeColor };
        }
        newObstacle.strokeWeight = this.strokeWeight;
        return newObstacle;
    }
    // 設定方法
    setColor(color) {
        this.color = color;
    }
    setStroke(color, weight) {
        this.strokeColor = color;
        this.strokeWeight = weight;
    }
    setPosition(x, y) {
        this.position.set(x, y);
    }
    setRadius(radius) {
        this.radius = Math.max(0, radius);
    }
}


/***/ }),

/***/ "./src/models/Patrol.ts":
/*!******************************!*\
  !*** ./src/models/Patrol.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Patrol: () => (/* binding */ Patrol),
/* harmony export */   PatrolGroupUnit: () => (/* binding */ PatrolGroupUnit),
/* harmony export */   PatrolPoint: () => (/* binding */ PatrolPoint)
/* harmony export */ });
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// Patrol - 巡邏系統，管理群組單位的路徑巡邏行為
/// <reference path="../types/p5.d.ts" />

class PatrolPoint {
    constructor(p, x, y, time) {
        this.position = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, x, y);
        this.time = time;
    }
}
class PatrolGroupUnit {
    constructor(groupUnit, index, createX, createY) {
        this.groupUnit = groupUnit;
        this.lastTime = 0;
        this.nowIndex = index;
        this.createX = createX;
        this.createY = createY;
    }
}
class Patrol {
    constructor(p) {
        this.patrolPoints = [];
        this.patrolGroupUnits = [];
        this.active = true;
        this.maxUnitsPerGroup = 100;
        this.unitsAddedPerCycle = 20;
        this.p = p;
    }
    // 添加巡邏點
    addPoint(x, y, time) {
        const point = new PatrolPoint(this.p, x, y, time);
        this.patrolPoints.push(point);
    }
    // 添加群組單位到巡邏系統
    addGroupUnit(groupUnit, index, createX, createY) {
        const patrolGroupUnit = new PatrolGroupUnit(groupUnit, index, createX, createY);
        this.patrolGroupUnits.push(patrolGroupUnit);
    }
    // 更新巡邏邏輯
    update() {
        if (!this.active || this.patrolPoints.length === 0 || this.patrolGroupUnits.length === 0) {
            return;
        }
        for (const pGroupUnit of this.patrolGroupUnits) {
            pGroupUnit.lastTime--;
            if (pGroupUnit.lastTime <= 0) {
                // 移動到下一個巡邏點
                pGroupUnit.nowIndex++;
                if (pGroupUnit.nowIndex >= this.patrolPoints.length) {
                    pGroupUnit.nowIndex = 0;
                }
                // 設定新的目標點和時間
                const targetPoint = this.patrolPoints[pGroupUnit.nowIndex];
                pGroupUnit.lastTime = targetPoint.time;
                pGroupUnit.groupUnit.setDestination(targetPoint.position);
                // 添加敵人單位
                this.spawnEnemyUnits(pGroupUnit);
            }
        }
    }
    // 生成敵人單位
    spawnEnemyUnits(pGroupUnit) {
        const currentUnitCount = pGroupUnit.groupUnit.getUnits().length;
        let unitsToAdd = this.maxUnitsPerGroup - currentUnitCount;
        if (unitsToAdd > this.unitsAddedPerCycle) {
            unitsToAdd = this.unitsAddedPerCycle;
        }
        for (let j = 0; j < unitsToAdd; j++) {
            // 隨機選擇巡邏點位置生成單位
            const randomIndex = Math.floor(Math.random() * this.patrolPoints.length);
            const spawnPoint = this.patrolPoints[randomIndex].position;
            pGroupUnit.groupUnit.addUnit(spawnPoint.x, spawnPoint.y + j * 5 // 稍微偏移避免重疊
            );
        }
    }
    // 渲染巡邏點
    render(p) {
        if (!this.active)
            return;
        p.push();
        for (const point of this.patrolPoints) {
            p.fill(255);
            p.stroke(255, 255, 255);
            p.strokeWeight(1);
            p.circle(point.position.x, point.position.y, 6);
            // 顯示巡邏點編號
            p.fill(255, 255, 0);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(10);
            const index = this.patrolPoints.indexOf(point);
            p.text(index.toString(), point.position.x, point.position.y - 15);
        }
        // 繪製巡邏路徑連線
        if (this.patrolPoints.length > 1) {
            p.stroke(100, 100, 100, 150);
            p.strokeWeight(1);
            p.noFill();
            for (let i = 0; i < this.patrolPoints.length; i++) {
                const current = this.patrolPoints[i];
                const next = this.patrolPoints[(i + 1) % this.patrolPoints.length];
                p.line(current.position.x, current.position.y, next.position.x, next.position.y);
            }
        }
        p.pop();
    }
    // 移除巡邏點
    removePoint(index) {
        if (index >= 0 && index < this.patrolPoints.length) {
            this.patrolPoints.splice(index, 1);
        }
    }
    // 移除群組單位
    removeGroupUnit(groupUnit) {
        const index = this.patrolGroupUnits.findIndex(pgu => pgu.groupUnit === groupUnit);
        if (index !== -1) {
            this.patrolGroupUnits.splice(index, 1);
        }
    }
    // 清空所有巡邏資料
    clear() {
        this.patrolPoints = [];
        this.patrolGroupUnits = [];
    }
    // 狀態查詢
    getPointCount() {
        return this.patrolPoints.length;
    }
    getGroupUnitCount() {
        return this.patrolGroupUnits.length;
    }
    isActive() {
        return this.active;
    }
    // 控制方法
    setActive(active) {
        this.active = active;
    }
    setMaxUnitsPerGroup(max) {
        this.maxUnitsPerGroup = Math.max(1, max);
    }
    setUnitsAddedPerCycle(count) {
        this.unitsAddedPerCycle = Math.max(1, count);
    }
    // 獲取統計資訊
    getStats() {
        const totalUnits = this.patrolGroupUnits.reduce((sum, pgu) => sum + pgu.groupUnit.getUnits().length, 0);
        return {
            pointCount: this.getPointCount(),
            groupUnitCount: this.getGroupUnitCount(),
            totalUnits,
            active: this.active
        };
    }
}


/***/ }),

/***/ "./src/models/Unit.ts":
/*!****************************!*\
  !*** ./src/models/Unit.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Unit: () => (/* binding */ Unit)
/* harmony export */ });
/* harmony import */ var _types_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/common */ "./src/types/common.ts");
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
/* harmony import */ var _AttackVFX__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AttackVFX */ "./src/models/AttackVFX.ts");
// Unit 類別 - 單位實體實作
/// <reference path="../types/p5.d.ts" />



class Unit {
    constructor(p, x, y, groupId = 1) {
        this.p = p;
        this.id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // 初始化基本屬性
        this.position = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(p, x, y);
        this.velocity = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(p, p.random(-1, 1), p.random(-1, 1));
        this.acceleration = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(p, 0, 0);
        this.direction = this.velocity.copy();
        this.destination = new _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector(p, x, y);
        // 物理屬性
        this.baseRadius = 2.0;
        this.r = 6.0;
        this.maxSpeed = 1;
        this.maxForce = 0.05;
        this.approachRange = this.maxSpeed + 0.5;
        // 生命系統
        this.health = 12;
        this.maxHealth = 12;
        this.life = 2880; // 兩分鐘
        this.isAlive = true;
        this.healthRecoveryCooldown = 0;
        // 狀態管理
        this.state = _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.MOVE;
        this.previousState = _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.STOP;
        this.stateChangeTime = Date.now();
        // 攻擊系統
        this.attackConfig = {
            damage: 1,
            range: 60,
            cooldown: 30,
            duration: 10
        };
        this.lastAttackTime = 0;
        this.canAttack = true;
        this.attackUnit = null;
        this.attackVisibleDistance = 120;
        this.attackRange = this.attackConfig.range;
        this.attackVFX = null;
        // 視覺屬性
        this.color = { r: 127, g: 127, b: 127 };
        // 群組相關
        this.groupId = groupId;
        this.isLeader = false;
        this.unitType = 0;
        this.p1p2 = groupId;
    }
    // 生命週期方法
    update(deltaTime) {
        // 生命減少 (leader 不會死亡)
        if (this.unitType !== 1) {
            this.life -= 1;
        }
        if (this.life <= 0) {
            this.health = 0;
            this.isAlive = false;
            if (this.state !== _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.DIE) {
                this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.DIE);
            }
            return;
        }
        // 計算最高血量
        this.maxHealth = Math.floor(this.life / 288) + 2;
        // 回復血量
        if (this.health < this.maxHealth) {
            this.healthRecoveryCooldown--;
            if (this.healthRecoveryCooldown <= 0) {
                this.healthRecoveryCooldown = 150;
                this.health++;
            }
        }
        // 血量上限檢查
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        // 計算當前半徑
        if (this.unitType === 1) {
            this.r = this.baseRadius + 1;
        }
        else {
            this.r = this.health / 3 + this.baseRadius;
        }
        // 根據狀態更新
        this.updateByState(deltaTime);
        // 更新攻擊特效
        if (this.attackVFX && this.attackVFX.isExpired()) {
            this.attackVFX = null;
        }
    }
    updateByState(deltaTime) {
        switch (this.state) {
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.MOVE:
                this.updateMoveState(deltaTime);
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW:
                this.updateFollowState(deltaTime);
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.ATTACK:
                this.updateAttackState(deltaTime);
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.STOP:
                // 停止狀態不需要更新位置
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.DIE:
                // 死亡狀態
                break;
        }
    }
    updateMoveState(_deltaTime) {
        if (this.acceleration.mag() === 0 && this.destination) {
            this.applyForce(this.seek(this.destination));
        }
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
        // 檢查是否到達目標
        if (this.destination) {
            const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(this.position, this.destination);
            if (distance <= this.approachRange) {
                this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.STOP);
            }
        }
    }
    updateFollowState(_deltaTime) {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
    }
    updateAttackState(_deltaTime) {
        // PVP 模式檢查
        // TODO: 從遊戲狀態獲取 isPVP 狀態
        const isPVP = true; // 暫時設為 true
        if (!isPVP) {
            this.attackUnit = null;
            this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW);
            return;
        }
        if (!this.attackUnit) {
            this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW);
            return;
        }
        // 攻擊冷卻
        if (this.lastAttackTime > 0) {
            this.lastAttackTime--;
        }
        else {
            const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(this.attackUnit.position, this.position);
            if (distance <= this.attackRange && this.lastAttackTime <= 0 && isPVP) {
                this.performAttack(this.attackUnit);
            }
            else if (distance > this.attackVisibleDistance) {
                this.attackUnit = null;
            }
        }
        // 檢查目標是否死亡
        if (this.attackUnit && !this.attackUnit.isAlive) {
            this.attackUnit = null;
        }
        if (!this.attackUnit) {
            this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW);
            return;
        }
        // 計算攻擊策略位置
        let targetPosition = this.attackUnit.position;
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(this.attackUnit.position, this.position);
        const directionToTarget = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, this.attackUnit.position, this.position);
        if (this.health <= 6) {
            // 血量低時逃跑
            const escapeDirection = directionToTarget.copy().rotate(Math.PI);
            targetPosition = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.add(this.p, this.position, escapeDirection);
        }
        else if (this.lastAttackTime > 0 && distance < this.attackRange * 1.5) {
            // 攻擊冷卻時保持距離
            const sideDirection = directionToTarget.copy().rotate(0.44); // 約 25 度
            targetPosition = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.add(this.p, this.position, sideDirection);
        }
        this.applyForce(this.seek(targetPosition));
        // 更新物理
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.direction = this.velocity.copy();
    }
    performAttack(target) {
        this.lastAttackTime = this.attackConfig.cooldown;
        const attackDirection = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, target.position, this.position);
        this.attackVFX = new _AttackVFX__WEBPACK_IMPORTED_MODULE_2__.AttackVFX(this.p, this.position, attackDirection, 'red');
        target.takeDamage(this.attackConfig.damage, this);
    }
    render(p) {
        const theta = this.direction.heading() + p.radians(90);
        // 設定顏色
        p.fill(127);
        p.stroke(200);
        const colors = [
            { r: 154, g: 206, b: 167 },
            { r: 58, g: 126, b: 76 },
            'orange',
            'yellow',
            'green',
            'blue',
            'indigo',
            'violet'
        ];
        if (this.p1p2 !== 1) {
            const colorIndex = (this.p1p2 - 2) % colors.length;
            const selectedColor = colors[colorIndex];
            if (typeof selectedColor === 'string') {
                p.fill(selectedColor);
            }
            else {
                p.fill(selectedColor.r, selectedColor.g, selectedColor.b);
            }
        }
        if (this.unitType === 1) {
            p.stroke('red');
        }
        // 繪製三角形
        p.push();
        p.translate(this.position.x, this.position.y);
        p.rotate(theta);
        p.beginShape();
        p.vertex(0, -this.r * 2);
        p.vertex(-this.r, this.r * 2);
        p.vertex(this.r, this.r * 2);
        p.endShape(p.CLOSE);
        p.pop();
        // 繪製攻擊特效
        if (this.attackVFX) {
            this.attackVFX.draw();
        }
    }
    // 狀態管理方法
    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
            this.stateChangeTime = Date.now();
            this.onStateChanged?.(this.previousState, newState);
        }
    }
    canTransitionTo(_targetState) {
        // 死亡狀態不能轉換到其他狀態
        if (this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.DIE) {
            return false;
        }
        // 其他狀態轉換邏輯
        return true;
    }
    // 移動方法
    seek(target) {
        const desired = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, target, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    flee(target) {
        const desired = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, this.position, target);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    arrive(target, slowingRadius = 50) {
        const desired = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, target, this.position);
        const distance = desired.mag();
        desired.normalize();
        if (distance < slowingRadius) {
            const speed = this.maxSpeed * (distance / slowingRadius);
            desired.mult(speed);
        }
        else {
            desired.mult(this.maxSpeed);
        }
        const steer = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
    // 攻擊方法
    attack(target) {
        if (!this.canAttack || this.lastAttackTime > 0) {
            return false;
        }
        if (this.isInAttackRange(target)) {
            this.setAttack(target);
            return true;
        }
        return false;
    }
    takeDamage(damage, _source) {
        const oldHealth = this.health;
        this.health = Math.max(0, this.health - damage);
        this.onHealthChanged?.(oldHealth, this.health);
        if (this.health <= 0 && this.isAlive) {
            this.isAlive = false;
            this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.DIE);
            this.onDeath?.();
        }
    }
    isInAttackRange(target) {
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(this.position, target.position);
        return distance <= this.attackRange;
    }
    // 工具方法
    distanceTo(target) {
        const targetPos = 'position' in target ? target.position : target;
        return _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.dist(this.position, targetPos);
    }
    angleTo(target) {
        const targetPos = 'position' in target ? target.position : target;
        const direction = _utils_Vector__WEBPACK_IMPORTED_MODULE_1__.Vector.sub(this.p, targetPos, this.position);
        return direction.heading();
    }
    copy() {
        const newUnit = new Unit(this.p, this.position.x, this.position.y, this.groupId);
        // 複製其他屬性...
        return newUnit;
    }
    // 增加力
    applyForce(force) {
        this.acceleration.add(force);
    }
    // 設定力
    setForce(force) {
        this.acceleration = force;
    }
    // 設定目標
    setDestination(target) {
        this.destination = target;
        this.velocity = this.direction.copy();
        this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.MOVE);
    }
    // 設定跟隨
    setFollow() {
        this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW);
    }
    // 設定停止
    setStop() {
        if (this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW || this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.MOVE) {
            this.direction = this.velocity.copy();
            this.velocity.mult(0);
            this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.STOP);
        }
    }
    // 設定攻擊
    setAttack(enemyUnit) {
        this.attackUnit = enemyUnit;
        this.setState(_types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.ATTACK);
    }
    // 狀態檢查方法
    isMove() {
        return this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.MOVE;
    }
    isFollow() {
        return this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.FOLLOW;
    }
    isAttacking() {
        return this.state === _types_common__WEBPACK_IMPORTED_MODULE_0__.UnitState.ATTACK;
    }
    // 設定 leader
    setAsLeader() {
        this.isLeader = true;
        this.unitType = 1;
    }
}


/***/ }),

/***/ "./src/sketch/GameSketch.ts":
/*!**********************************!*\
  !*** ./src/sketch/GameSketch.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameSketch: () => (/* binding */ GameSketch)
/* harmony export */ });
/* harmony import */ var _types_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/common */ "./src/types/common.ts");
/* harmony import */ var _core_GameManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/GameManager */ "./src/core/GameManager.ts");
// GameSketch 類別 - 遊戲主要邏輯封裝，整合所有系統
/// <reference path="../types/p5.d.ts" />


class GameSketch {
    constructor(p) {
        // 視窗和相機（委託給 GameManager）
        this.viewX = 0;
        this.viewY = 0;
        // 控制系統（委託給 GameManager）
        this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER;
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
        this.gameManager = new _core_GameManager__WEBPACK_IMPORTED_MODULE_1__.GameManager(p, this.config.displayWidth, this.config.displayHeight);
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
            this.viewX = cameraPos.currentControl === _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER ? this.viewX : this.viewX;
            this.viewY = cameraPos.currentControl === _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER ? this.viewY : this.viewY;
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
        this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER;
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


/***/ }),

/***/ "./src/systems/CameraSystem.ts":
/*!*************************************!*\
  !*** ./src/systems/CameraSystem.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CameraMode: () => (/* binding */ CameraMode),
/* harmony export */   CameraSystem: () => (/* binding */ CameraSystem),
/* harmony export */   DEFAULT_CAMERA_CONFIG: () => (/* binding */ DEFAULT_CAMERA_CONFIG)
/* harmony export */ });
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// CameraSystem - 相機系統，處理視窗座標轉換和相機控制
/// <reference path="../types/p5.d.ts" />

var CameraMode;
(function (CameraMode) {
    CameraMode["FREE"] = "free";
    CameraMode["FOLLOW"] = "follow";
    CameraMode["FIXED"] = "fixed";
})(CameraMode || (CameraMode = {}));
const DEFAULT_CAMERA_CONFIG = {
    position: { x: 512, y: 320, z: 554 },
    zoom: 1.0,
    followSmoothing: 0.1,
    followDeadZone: 50,
    minZoom: 0.5,
    maxZoom: 3.0,
    moveSpeed: 10,
    zoomSpeed: 0.1
};
class CameraSystem {
    constructor(p, displayWidth, displayHeight, config) {
        // 跟隨目標
        this.followTargetObj = null;
        this.bounds = null;
        // 暫時移除 _updateShake 方法，未使用
        // 相機移動模式
        this.cameraMode = CameraMode.FREE;
        this.p = p;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.config = { ...DEFAULT_CAMERA_CONFIG, ...config };
        // 初始化位置
        this.position = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, this.config.position.x, this.config.position.y, this.config.position.z || 554);
        this.targetPosition = this.position.copy();
        this.smoothPosition = this.position.copy();
        // 初始化縮放
        this.currentZoom = this.config.zoom;
        this.smoothZoom = this.currentZoom;
        // 初始化跟隨系統
        // this._lastFollowPosition = new Vector(p, 0, 0);
        // 創建 p5 相機
        this.initializeCamera();
    }
    initializeCamera() {
        // 在 WEBGL 模式下創建相機
        if (this.p.createCamera) {
            this.camera = this.p.createCamera();
            this.updateCameraPosition();
        }
    }
    updateCameraPosition() {
        if (this.camera && this.camera.setPosition) {
            this.camera.setPosition(this.smoothPosition.x, this.smoothPosition.y, this.smoothPosition.z || 554);
        }
    }
    // 相機位置控制
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.targetPosition = this.position.copy();
        this.smoothPosition = this.position.copy();
        this.updateCameraPosition();
    }
    getPosition() {
        return this.position.copy();
    }
    move(deltaX, deltaY, deltaZ) {
        this.targetPosition.x += deltaX;
        this.targetPosition.y += deltaY;
        if (deltaZ !== undefined && this.targetPosition.z !== undefined) {
            this.targetPosition.z += deltaZ;
        }
        // 約束到邊界
        this.constrainToBounds();
    }
    // 座標轉換
    worldToScreen(worldPos) {
        // 將世界座標轉換為螢幕座標
        const screenX = worldPos.x - this.position.x + this.displayWidth / 2;
        const screenY = worldPos.y - this.position.y + this.displayHeight / 2;
        return new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(this.p, screenX, screenY);
    }
    screenToWorld(screenPos) {
        // 將螢幕座標轉換為世界座標
        const worldX = screenPos.x + this.position.x - this.displayWidth / 2;
        const worldY = screenPos.y + this.position.y - this.displayHeight / 2;
        return new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(this.p, worldX, worldY);
    }
    // 相機跟隨
    followTargetPosition(target, smoothing) {
        if (!target)
            return;
        const smooth = smoothing !== undefined ? smoothing : this.config.followSmoothing;
        const deadZone = this.config.followDeadZone;
        // 計算目標與相機的距離
        const distance = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.dist(this.position, target);
        // 只有在超出死區時才移動相機
        if (distance > deadZone) {
            const direction = _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector.sub(this.p, target, this.position);
            direction.normalize();
            direction.mult(distance - deadZone);
            // 平滑跟隨
            direction.mult(smooth);
            this.targetPosition.add(direction);
            this.constrainToBounds();
        }
    }
    setFollowTarget(target) {
        this.followTargetObj = target;
        // if (target) {
        //   this._lastFollowPosition = target.copy();
        // }
    }
    // 視窗邊界
    setBounds(bounds) {
        this.bounds = bounds;
    }
    getBounds() {
        return this.bounds;
    }
    constrainToBounds() {
        if (!this.bounds)
            return;
        const halfWidth = this.displayWidth / 2;
        const halfHeight = this.displayHeight / 2;
        // 約束 X 軸
        this.targetPosition.x = Math.max(this.bounds.left + halfWidth, Math.min(this.bounds.right - halfWidth, this.targetPosition.x));
        // 約束 Y 軸
        this.targetPosition.y = Math.max(this.bounds.top + halfHeight, Math.min(this.bounds.bottom - halfHeight, this.targetPosition.y));
    }
    // 縮放控制
    setZoom(zoom) {
        this.currentZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    }
    getZoom() {
        return this.currentZoom;
    }
    zoom(factor) {
        this.setZoom(this.currentZoom * factor);
    }
    // 更新
    update(deltaTime) {
        // 處理跟隨目標
        if (this.followTargetObj) {
            this.followTargetPosition(this.followTargetObj);
        }
        // 平滑移動到目標位置
        const lerpFactor = Math.min(1.0, deltaTime * 5); // 調整平滑度
        this.smoothPosition.x = this.lerp(this.smoothPosition.x, this.targetPosition.x, lerpFactor);
        this.smoothPosition.y = this.lerp(this.smoothPosition.y, this.targetPosition.y, lerpFactor);
        if (this.smoothPosition.z !== undefined && this.targetPosition.z !== undefined) {
            this.smoothPosition.z = this.lerp(this.smoothPosition.z, this.targetPosition.z, lerpFactor);
        }
        // 平滑縮放
        this.smoothZoom = this.lerp(this.smoothZoom, this.currentZoom, lerpFactor);
        // 更新實際相機位置
        this.position = this.smoothPosition.copy();
        this.updateCameraPosition();
    }
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    // 狀態查詢
    isInView(worldPos, margin = 0) {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x >= -margin &&
            screenPos.x <= this.displayWidth + margin &&
            screenPos.y >= -margin &&
            screenPos.y <= this.displayHeight + margin;
    }
    getViewBounds() {
        const halfWidth = this.displayWidth / 2;
        const halfHeight = this.displayHeight / 2;
        return {
            left: this.position.x - halfWidth,
            right: this.position.x + halfWidth,
            top: this.position.y - halfHeight,
            bottom: this.position.y + halfHeight
        };
    }
    // 相機震動效果（暫時移除）
    shake(_intensity, _duration) {
        // 暫時未實作
    }
    setCameraMode(mode) {
        this.cameraMode = mode;
        if (mode !== CameraMode.FOLLOW) {
            this.followTargetObj = null;
        }
    }
    getCameraMode() {
        return this.cameraMode;
    }
    // 平滑縮放到目標
    zoomToTarget(target, targetZoom, _duration = 1000) {
        // 實作平滑縮放和移動到目標
        this.setFollowTarget(target);
        this.setZoom(targetZoom);
    }
    // 重置相機
    reset() {
        this.setPosition(this.config.position.x, this.config.position.y, this.config.position.z);
        this.setZoom(this.config.zoom);
        this.setFollowTarget(null);
        // this.shakeIntensity = 0;
        // this.shakeTimer = 0;
    }
    // 相機配置更新
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
    // 視野計算
    getFOV() {
        // 基於 z 位置計算視野角度
        const z = this.position.z || 554;
        return Math.atan2(this.displayHeight / 2, z) * 2;
    }
    // 可視範圍內的物件篩選
    filterVisibleObjects(objects, margin = 100) {
        return objects.filter(obj => this.isInView(obj.position, margin));
    }
    // 相機統計資訊
    getStats() {
        return {
            position: this.getPosition(),
            zoom: this.getZoom(),
            viewBounds: this.getViewBounds(),
            followTarget: this.followTargetObj,
            mode: this.cameraMode
        };
    }
}


/***/ }),

/***/ "./src/systems/InputSystem.ts":
/*!************************************!*\
  !*** ./src/systems/InputSystem.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_KEY_MAPPING: () => (/* binding */ DEFAULT_KEY_MAPPING),
/* harmony export */   InputEventType: () => (/* binding */ InputEventType),
/* harmony export */   InputSystem: () => (/* binding */ InputSystem),
/* harmony export */   InputUtils: () => (/* binding */ InputUtils)
/* harmony export */ });
/* harmony import */ var _utils_Vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/Vector */ "./src/utils/Vector.ts");
// InputSystem - 輸入系統，統一處理鍵盤和滑鼠輸入
/// <reference path="../types/p5.d.ts" />

var InputEventType;
(function (InputEventType) {
    InputEventType["MOUSE_CLICK"] = "mouse_click";
    InputEventType["MOUSE_MOVE"] = "mouse_move";
    InputEventType["KEY_DOWN"] = "key_down";
    InputEventType["KEY_UP"] = "key_up";
    InputEventType["CAMERA_MOVE"] = "camera_move";
})(InputEventType || (InputEventType = {}));
const DEFAULT_KEY_MAPPING = {
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
class InputSystem {
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
        this.mousePosition = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, 0, 0);
        this.lastMousePosition = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, 0, 0);
        this.cameraMovement = new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(p, 0, 0);
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
        return new _utils_Vector__WEBPACK_IMPORTED_MODULE_0__.Vector(this.p, worldX, worldY);
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
class InputUtils {
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


/***/ }),

/***/ "./src/systems/RenderSystem.ts":
/*!*************************************!*\
  !*** ./src/systems/RenderSystem.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderSystem: () => (/* binding */ RenderSystem),
/* harmony export */   TextWithViewPort: () => (/* binding */ TextWithViewPort)
/* harmony export */ });
// RenderSystem - 渲染系統，整合 TextWithViewPort 功能
/// <reference path="../types/p5.d.ts" />
class TextWithViewPort {
    constructor(p, displayWidth, displayHeight) {
        this.displayWidth = 0;
        this.viewX = 0;
        this.viewY = 0;
        this.p = p;
        // this._displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.textScreen = p.createGraphics ? p.createGraphics(displayWidth, displayHeight) : null;
    }
    setViewPort(viewX, viewY) {
        this.viewX = viewX;
        this.viewY = viewY;
    }
    clear() {
        if (this.textScreen) {
            this.textScreen.clear();
        }
    }
    fill(color) {
        if (this.textScreen) {
            this.textScreen.fill(color.r, color.g, color.b, color.a || 255);
        }
    }
    text(text, x, y) {
        if (this.textScreen) {
            const newX = x + this.displayWidth / 2 - this.viewX;
            const newY = y + this.displayHeight / 2 - this.viewY;
            this.textScreen.text(text, newX, newY);
        }
    }
    render() {
        if (this.textScreen) {
            this.p.image(this.textScreen, this.viewX - this.displayWidth / 2, this.viewY - this.displayHeight / 2);
        }
    }
}
class RenderSystem {
    constructor(p, displayWidth, displayHeight) {
        // 渲染選項
        this.showArrows = true;
        this.showTargetLines = true;
        this.showUnitStats = true;
        this.showHealthBars = true;
        this.showDebugInfo = true;
        // 攻擊特效
        this.attackEffects = [];
        this.p = p;
        // this._displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.textWithViewPort = new TextWithViewPort(p, displayWidth, displayHeight);
        this.backgroundColor = { r: 51, g: 51, b: 51 }; // 預設深灰背景
        // 初始化渲染層級
        this.renderLayers = new Map();
        this.initializeRenderLayers();
    }
    initializeRenderLayers() {
        this.renderLayers.set('background', { name: 'background', visible: true, opacity: 1.0, zIndex: 0 });
        this.renderLayers.set('obstacles', { name: 'obstacles', visible: true, opacity: 1.0, zIndex: 1 });
        this.renderLayers.set('units', { name: 'units', visible: true, opacity: 1.0, zIndex: 2 });
        this.renderLayers.set('effects', { name: 'effects', visible: true, opacity: 1.0, zIndex: 3 });
        this.renderLayers.set('ui', { name: 'ui', visible: true, opacity: 1.0, zIndex: 4 });
        this.renderLayers.set('debug', { name: 'debug', visible: true, opacity: 1.0, zIndex: 5 });
    }
    // 主要渲染方法
    render() {
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
    clear() {
        this.p.background(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b);
        this.textWithViewPort.clear();
    }
    // 視窗控制
    setViewPort(viewX, viewY) {
        this.textWithViewPort.setViewPort(viewX, viewY);
    }
    getViewPort() {
        return { x: 0, y: 0 }; // 簡化實作，實際應該從 textWithViewPort 取得
    }
    // 文字渲染
    renderText(text, x, y, color) {
        if (color) {
            this.textWithViewPort.fill(color);
        }
        else {
            this.textWithViewPort.fill({ r: 255, g: 255, b: 255 }); // 預設白色
        }
        this.textWithViewPort.text(text, x, y);
    }
    // 實體渲染
    renderUnits(units) {
        if (!this.isLayerVisible('units'))
            return;
        for (const unit of units) {
            if (!unit.isAlive)
                continue;
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
    renderObstacles(obstacles) {
        if (!this.isLayerVisible('obstacles'))
            return;
        for (const obstacle of obstacles) {
            obstacle.render(this.p);
        }
    }
    // 單位生命條渲染
    renderUnitHealthBar(unit) {
        const barWidth = 30;
        const barHeight = 4;
        const offsetY = -unit.r - 10;
        this.p.push();
        // 背景條（紅色）
        this.p.fill(255, 0, 0);
        this.p.noStroke();
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, barWidth, barHeight);
        // 生命條（綠色）
        const healthRatio = unit.health / unit.maxHealth;
        const healthWidth = barWidth * healthRatio;
        this.p.fill(0, 255, 0);
        this.p.rect(unit.position.x - barWidth / 2, unit.position.y + offsetY, healthWidth, barHeight);
        this.p.pop();
    }
    // 單位統計資訊渲染
    renderUnitStatistics(unit) {
        const offsetY = unit.r + 15;
        const stats = `HP:${Math.round(unit.health)} S:${unit.state}`;
        this.renderText(stats, unit.position.x, unit.position.y + offsetY, { r: 200, g: 200, b: 200 });
    }
    // 目標線渲染
    renderTargetLine(unit) {
        if (!unit.destination)
            return;
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
    renderDebugInfo(info) {
        if (!this.showDebugInfo || !this.isLayerVisible('debug'))
            return;
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
    renderArrows(enabled) {
        this.showArrows = enabled;
        // 實際的箭頭渲染會在 Flock 系統中呼叫 drawArrow 方法
    }
    // 目標線渲染控制
    renderTargetLines(enabled) {
        this.showTargetLines = enabled;
    }
    // 單位統計渲染控制
    renderUnitStats(enabled) {
        this.showUnitStats = enabled;
    }
    // 攻擊特效渲染
    renderAttackEffects(effects) {
        if (!this.isLayerVisible('effects'))
            return;
        this.attackEffects = effects.filter(effect => effect.remainingTime > 0);
        for (const effect of this.attackEffects) {
            this.renderAttackEffect(effect);
        }
    }
    renderAttackEffect(effect) {
        const alpha = (effect.remainingTime / effect.duration) * 255;
        this.p.push();
        this.p.stroke(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.strokeWeight(3);
        // 繪製攻擊線
        this.p.line(effect.position.x, effect.position.y, effect.targetPosition.x, effect.targetPosition.y);
        // 攻擊點特效
        this.p.fill(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.noStroke();
        this.p.circle(effect.targetPosition.x, effect.targetPosition.y, 8);
        this.p.pop();
    }
    // 生命條渲染
    renderHealthBars(_units) {
        this.showHealthBars = true;
        // 實際渲染在 renderUnits 中處理
    }
    // 系統控制
    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
    resize(width, height) {
        // this._displayWidth = width;
        this.displayHeight = height;
        this.textWithViewPort = new TextWithViewPort(this.p, width, height);
    }
    // 渲染層級控制
    setLayerVisible(layerName, visible) {
        const layer = this.renderLayers.get(layerName);
        if (layer) {
            layer.visible = visible;
        }
    }
    setLayerOpacity(layerName, opacity) {
        const layer = this.renderLayers.get(layerName);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
        }
    }
    isLayerVisible(layerName) {
        const layer = this.renderLayers.get(layerName);
        return layer ? layer.visible : true;
    }
    // 渲染設定
    getRenderSettings() {
        return {
            showArrows: this.showArrows,
            showTargetLines: this.showTargetLines,
            showUnitStats: this.showUnitStats,
            showHealthBars: this.showHealthBars,
            showDebugInfo: this.showDebugInfo
        };
    }
    updateRenderSettings(settings) {
        if (settings.showArrows !== undefined)
            this.showArrows = settings.showArrows;
        if (settings.showTargetLines !== undefined)
            this.showTargetLines = settings.showTargetLines;
        if (settings.showUnitStats !== undefined)
            this.showUnitStats = settings.showUnitStats;
        if (settings.showHealthBars !== undefined)
            this.showHealthBars = settings.showHealthBars;
        if (settings.showDebugInfo !== undefined)
            this.showDebugInfo = settings.showDebugInfo;
    }
}


/***/ }),

/***/ "./src/systems/UISystem.ts":
/*!*********************************!*\
  !*** ./src/systems/UISystem.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UIEventType: () => (/* binding */ UIEventType),
/* harmony export */   UISystem: () => (/* binding */ UISystem)
/* harmony export */ });
/* harmony import */ var _types_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/common */ "./src/types/common.ts");
// UISystem - UI 系統，管理按鈕控制邏輯和界面元素
/// <reference path="../types/p5.d.ts" />

var UIEventType;
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
class UISystem {
    // private _displayHeight: number; // 暫時未使用
    constructor(p, displayWidth, _displayHeight) {
        // UI 狀態
        this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER;
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
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER:
                this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.ENEMY;
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.ENEMY:
                this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.ENEMY2;
                break;
            case _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.ENEMY2:
                this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER;
                break;
            default:
                this.currentControl = _types_common__WEBPACK_IMPORTED_MODULE_0__.ControlMode.PLAYER;
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


/***/ }),

/***/ "./src/types/common.ts":
/*!*****************************!*\
  !*** ./src/types/common.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ControlMode: () => (/* binding */ ControlMode),
/* harmony export */   EventType: () => (/* binding */ EventType),
/* harmony export */   UnitState: () => (/* binding */ UnitState)
/* harmony export */ });
// 共用型別定義
// 單位狀態列舉
var UnitState;
(function (UnitState) {
    UnitState["MOVE"] = "move";
    UnitState["STOP"] = "stop";
    UnitState["FOLLOW"] = "follow";
    UnitState["ATTACK"] = "attack";
    UnitState["ESCAPE"] = "escape";
    UnitState["DIE"] = "die";
})(UnitState || (UnitState = {}));
// 控制模式列舉
var ControlMode;
(function (ControlMode) {
    ControlMode[ControlMode["PLAYER"] = 1] = "PLAYER";
    ControlMode[ControlMode["ENEMY"] = 2] = "ENEMY";
    ControlMode[ControlMode["ENEMY2"] = 3] = "ENEMY2";
})(ControlMode || (ControlMode = {}));
// 事件類型列舉
var EventType;
(function (EventType) {
    EventType["UNIT_CREATED"] = "unit_created";
    EventType["UNIT_DESTROYED"] = "unit_destroyed";
    EventType["UNIT_ATTACK"] = "unit_attack";
    EventType["UNIT_DAMAGED"] = "unit_damaged";
    EventType["UNIT_STATE_CHANGED"] = "unit_state_changed";
    EventType["CONTROL_CHANGED"] = "control_changed";
})(EventType || (EventType = {}));


/***/ }),

/***/ "./src/utils/Vector.ts":
/*!*****************************!*\
  !*** ./src/utils/Vector.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vector: () => (/* binding */ Vector)
/* harmony export */ });
// 向量工具類別 - 封裝 p5.Vector 的 TypeScript 實作
/// <reference path="../types/p5.d.ts" />
class Vector {
    constructor(p, x = 0, y = 0, z) {
        this.p = p;
        this.x = x;
        this.y = y;
        if (z !== undefined)
            this.z = z;
    }
    // 基本運算
    add(v) {
        this.x += v.x;
        this.y += v.y;
        if (v.z !== undefined && this.z !== undefined)
            this.z += v.z;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        if (v.z !== undefined && this.z !== undefined)
            this.z -= v.z;
        return this;
    }
    mult(n) {
        this.x *= n;
        this.y *= n;
        if (this.z !== undefined)
            this.z *= n;
        return this;
    }
    div(n) {
        if (n === 0)
            return this;
        this.x /= n;
        this.y /= n;
        if (this.z !== undefined)
            this.z /= n;
        return this;
    }
    // 向量屬性
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + (this.z || 0) * (this.z || 0));
    }
    magSq() {
        return this.x * this.x + this.y * this.y + (this.z || 0) * (this.z || 0);
    }
    normalize() {
        const magnitude = this.mag();
        if (magnitude > 0) {
            this.div(magnitude);
        }
        return this;
    }
    limit(max) {
        const magnitude = this.mag();
        if (magnitude > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }
    // 方向相關
    heading() {
        return Math.atan2(this.y, this.x);
    }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }
    // 工具方法
    copy() {
        return new Vector(this.p, this.x, this.y, this.z);
    }
    dist(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + ((this.z || 0) - (v.z || 0)) ** 2);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + (this.z || 0) * (v.z || 0);
    }
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }
    angleBetween(v) {
        const dot = this.dot(v);
        const mag1 = this.mag();
        const mag2 = v.mag();
        return Math.acos(dot / (mag1 * mag2));
    }
    // 設定方法
    set(x, y, z) {
        this.x = x;
        this.y = y;
        if (z !== undefined)
            this.z = z;
        return this;
    }
    setMag(len) {
        this.normalize();
        this.mult(len);
        return this;
    }
    // 靜態方法
    static add(p, v1, v2) {
        return new Vector(p, v1.x + v2.x, v1.y + v2.y, (v1.z || 0) + (v2.z || 0));
    }
    static sub(p, v1, v2) {
        return new Vector(p, v1.x - v2.x, v1.y - v2.y, (v1.z || 0) - (v2.z || 0));
    }
    static mult(p, v, n) {
        return new Vector(p, v.x * n, v.y * n, (v.z || 0) * n);
    }
    static div(p, v, n) {
        return new Vector(p, v.x / n, v.y / n, (v.z || 0) / n);
    }
    static dist(v1, v2) {
        return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + ((v1.z || 0) - (v2.z || 0)) ** 2);
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0);
    }
    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
    static angleBetween(v1, v2) {
        const dot = Vector.dot(v1, v2);
        const mag1 = v1.mag();
        const mag2 = v2.mag();
        return Math.acos(dot / (mag1 * mag2));
    }
    static fromAngle(p, angle, length = 1) {
        return new Vector(p, Math.cos(angle) * length, Math.sin(angle) * length);
    }
    static random2D(p) {
        const angle = p.random(0, Math.PI * 2);
        return Vector.fromAngle(p, angle);
    }
    static random3D(p) {
        const angle1 = p.random(0, Math.PI * 2);
        const angle2 = p.random(0, Math.PI * 2);
        return new Vector(p, Math.cos(angle1), Math.sin(angle1) * Math.cos(angle2), Math.sin(angle1) * Math.sin(angle2));
    }
    static lerp(p, v1, v2, amt) {
        const x = v1.x + (v2.x - v1.x) * amt;
        const y = v1.y + (v2.y - v1.y) * amt;
        const z = (v1.z || 0) + ((v2.z || 0) - (v1.z || 0)) * amt;
        return new Vector(p, x, y, z);
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Game */ "./src/Game.ts");
// 遊戲應用程式主入口

// 全域遊戲實例
let game;
// 頁面載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    console.log('開始初始化 TypeScript 重構版本...');
    // 創建遊戲實例
    game = new _Game__WEBPACK_IMPORTED_MODULE_0__.Game();
    // 檢查初始化狀態
    const checkInit = () => {
        if (game.isInitialized()) {
            console.log('✅ 遊戲初始化完成');
            console.log('✅ p5.js Instance Mode 運行中');
            console.log('✅ GameSketch 架構已就緒');
        }
        else {
            setTimeout(checkInit, 100);
        }
    };
    checkInit();
});
// 全域遊戲控制函數
window.gameControls = {
    pause: () => game?.pause(),
    resume: () => game?.resume(),
    reset: () => game?.reset(),
    getSketch: () => game?.getGameSketch()
};
// 頁面卸載時清理資源
window.addEventListener('beforeunload', () => {
    game?.destroy();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRU0sSUFBSTtRQUNULElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWQsT0FBTztRQUNQLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxD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QUFLO1lBQ1IsRUFBRSxFQUFFLE9BQU87WUFDWCxFQUFFLEVBQUUsT0FBTztZQUNYLEVBQUUsRUFBRSxNQUFNO1lBQ1YsRUFBRSxFQUFFLEtBQUs7WUFDVCxFQUFFLEVBQUUsUUFBUTtZQUNaLEVBQUUsRUFBRSxPQUFPO1lBQ1gsRUFBRSxFQUFFLE1BQU07WUFDVixFQUFFLEVBQUUsSUFBSTtZQUNSLEVBQUUsRUFBRSxPQUFPO1lBQ1gsRUFBRSxFQUFFLE1BQU07WUFDVixFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHO1lBQ3RFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUc7WUFDdEUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRztZQUN0RSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHO1lBQ2hCLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUc7WUFDdEUsRUFBRSxF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RSxDQUFDLENBQUM7UUFDbEcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVELFNBQVM7SUFDRixNQUFNO1FBQ1gsT0FBTztRQUNQLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUViLFVBQVU7UUFDVixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzthQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV2QyxLQUFLLE1BQU0s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O1FBQ1osSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxTQUFTO1lBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVM7UUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxTQUFTO1lBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTztJQUNQLEdBQUc7UUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsU0FBUztRQUNQLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLFNBQVMsR0FB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QUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QyxPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNuSCxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFhLEVBQUUsRUFBVyxFQUFFLEVBQVcsRUFBRSxHQUFXO1FBQzlELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDckMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNyQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzFELE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGOzs7Ozs7O1VDMUxEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7O0FDTkEsWUFBWTtBQUNrQjtBQUU5QixTQUFTO0FBQ1QsSUFBSSxJQUFVLENBQUM7QUFFZixlQUFlO0FBQ2YsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFFeEMsU0FBUztJQUNULElBQUksR0FBRyxJQUFJLHVDQUFJLEVBQUUsQ0FBQztJQUVsQixVQUFVO0lBQ1YsTUFBTSxTQUFTLEdBQUcsR0FBRyxFQUFFO1FBQ3JCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7YUFBTSxDQUFDO1lBQ04sVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsU0FBUyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUMsQ0FBQztBQUVILFdBQVc7QUFDVixNQUFjLENBQUMsWUFBWSxHQUFHO0lBQzdCLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQzFCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0lBQzVCLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQzFCLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO0NBQ3ZDLENBQUM7QUFFRixZQUFZO0FBQ1osTUFBTSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7SUFDM0MsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby8uL3NyYy9HYW1lLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvY29yZS9HYW1lTWFuYWdlci50cyIsIndlYnBhY2s6Ly92b2xsb2NhcmUuZ2l0aHViLmlvLy4vc3JjL2ludGVyZmFjZXMvSUZsb2NrQmVoYXZpb3IudHMiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby8uL3NyYy9tb2RlbHMvQXR0YWNrVkZYLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvbW9kZWxzL0Zsb2NrLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvbW9kZWxzL0dyb3VwVW5pdC50cyIsIndlYnBhY2s6Ly92b2xsb2NhcmUuZ2l0aHViLmlvLy4vc3JjL21vZGVscy9PYnN0YWNsZS50cyIsIndlYnBhY2s6Ly92b2xsb2NhcmUuZ2l0aHViLmlvLy4vc3JjL21vZGVscy9QYXRyb2wudHMiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby8uL3NyYy9tb2RlbHMvVW5pdC50cyIsIndlYnBhY2s6Ly92b2xsb2NhcmUuZ2l0aHViLmlvLy4vc3JjL3NrZXRjaC9HYW1lU2tldGNoLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvc3lzdGVtcy9DYW1lcmFTeXN0ZW0udHMiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby8uL3NyYy9zeXN0ZW1zL0lucHV0U3lzdGVtLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvc3lzdGVtcy9SZW5kZXJTeXN0ZW0udHMiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby8uL3NyYy9zeXN0ZW1zL1VJU3lzdGVtLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvdHlwZXMvY29tbW9uLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vLi9zcmMvdXRpbHMvVmVjdG9yLnRzIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdm9sbG9jYXJlLmdpdGh1Yi5pby93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3ZvbGxvY2FyZS5naXRodWIuaW8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly92b2xsb2NhcmUuZ2l0aHViLmlvLy4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8g6YGK5oiy5Li75YWl5Y+j6bueXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBlcy9wNS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgR2FtZVNrZXRjaCB9IGZyb20gJy4vc2tldGNoL0dhbWVTa2V0Y2gnO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gIHByaXZhdGUgZ2FtZVNrZXRjaDogR2FtZVNrZXRjaCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHA1SW5zdGFuY2U6IGFueSA9IG51bGw7XG4gIFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuICBcbiAgcHJpdmF0ZSBpbml0KCk6IHZvaWQge1xuICAgIC8vIOWJteW7uiBwNSBza2V0Y2gg5Ye95pW4XG4gICAgY29uc3Qgc2tldGNoID0gKHA6IHA1SW5zdGFuY2UpID0+IHtcbiAgICAgIHRoaXMuZ2FtZVNrZXRjaCA9IG5ldyBHYW1lU2tldGNoKHApO1xuICAgIH07XG4gICAgXG4gICAgLy8g5Ym15bu6IHA1IOWvpuS+i1xuICAgIHRoaXMucDVJbnN0YW5jZSA9IG5ldyBwNShza2V0Y2gpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdHYW1lIGluaXRpYWxpemVkIHdpdGggcDUuanMgSW5zdGFuY2UgTW9kZScpO1xuICB9XG4gIFxuICAvLyDpgYrmiLLmjqfliLbmlrnms5VcbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuZ2FtZVNrZXRjaD8ucGF1c2UoKTtcbiAgfVxuICBcbiAgcHVibGljIHJlc3VtZSgpOiB2b2lkIHtcbiAgICB0aGlzLmdhbWVTa2V0Y2g/LnJlc3VtZSgpO1xuICB9XG4gIFxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5nYW1lU2tldGNoPy5yZXNldCgpO1xuICB9XG4gIFxuICAvLyDnjbLlj5bpgYrmiLLni4DmhYtcbiAgcHVibGljIGdldEdhbWVTa2V0Y2goKTogR2FtZVNrZXRjaCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdhbWVTa2V0Y2g7XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0luaXRpYWxpemVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdhbWVTa2V0Y2ggIT09IG51bGwgJiYgdGhpcy5wNUluc3RhbmNlICE9PSBudWxsO1xuICB9XG4gIFxuICAvLyDmuIXnkIbos4fmupBcbiAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucDVJbnN0YW5jZSkge1xuICAgICAgdGhpcy5wNUluc3RhbmNlLnJlbW92ZSgpO1xuICAgICAgdGhpcy5wNUluc3RhbmNlID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5nYW1lU2tldGNoID0gbnVsbDtcbiAgICBjb25zb2xlLmxvZygnR2FtZSBkZXN0cm95ZWQnKTtcbiAgfVxufSIsIi8vIEdhbWVNYW5hZ2VyIC0g5Li76YGK5oiy566h55CG5Zmo77yM57Wx5LiA566h55CG5omA5pyJ57O757Wx5ZKM6YGK5oiy54uA5oWLXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwZXMvcDUuZC50c1wiIC8+XG5cbmltcG9ydCB7IElHYW1lTWFuYWdlciB9IGZyb20gJy4uL2ludGVyZmFjZXMvSUdhbWVNYW5hZ2VyJztcbmltcG9ydCB7IElHcm91cFVuaXQgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lHcm91cFVuaXQnO1xuaW1wb3J0IHsgSU9ic3RhY2xlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JT2JzdGFjbGUnO1xuaW1wb3J0IHsgSVBhdHJvbCB9IGZyb20gJy4uL2ludGVyZmFjZXMvSVBhdHJvbCc7XG5cbmltcG9ydCB7IEdyb3VwVW5pdCB9IGZyb20gJy4uL21vZGVscy9Hcm91cFVuaXQnO1xuaW1wb3J0IHsgT2JzdGFjbGUgfSBmcm9tICcuLi9tb2RlbHMvT2JzdGFjbGUnO1xuaW1wb3J0IHsgUGF0cm9sIH0gZnJvbSAnLi4vbW9kZWxzL1BhdHJvbCc7XG5pbXBvcnQgeyBGbG9jayB9IGZyb20gJy4uL21vZGVscy9GbG9jayc7XG5cbmltcG9ydCB7IFJlbmRlclN5c3RlbSB9IGZyb20gJy4uL3N5c3RlbXMvUmVuZGVyU3lzdGVtJztcbmltcG9ydCB7IElucHV0U3lzdGVtLCBJbnB1dEV2ZW50VHlwZSB9IGZyb20gJy4uL3N5c3RlbXMvSW5wdXRTeXN0ZW0nO1xuaW1wb3J0IHsgVUlTeXN0ZW0sIFVJRXZlbnRUeXBlIH0gZnJvbSAnLi4vc3lzdGVtcy9VSVN5c3RlbSc7XG5pbXBvcnQgeyBDYW1lcmFTeXN0ZW0gfSBmcm9tICcuLi9zeXN0ZW1zL0NhbWVyYVN5c3RlbSc7XG5cbmltcG9ydCB7IENvbnRyb2xNb2RlIH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuXG5leHBvcnQgY2xhc3MgR2FtZU1hbmFnZXIgaW1wbGVtZW50cyBJR2FtZU1hbmFnZXIge1xuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIHByaXZhdGUgZGlzcGxheVdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgZGlzcGxheUhlaWdodDogbnVtYmVyO1xuICBcbiAgLy8g57O757WxXG4gIHByaXZhdGUgcmVuZGVyU3lzdGVtOiBSZW5kZXJTeXN0ZW07XG4gIHByaXZhdGUgaW5wdXRTeXN0ZW06IElucHV0U3lzdGVtO1xuICBwcml2YXRlIHVpU3lzdGVtOiBVSVN5c3RlbTtcbiAgcHJpdmF0ZSBjYW1lcmFTeXN0ZW06IENhbWVyYVN5c3RlbTtcbiAgcHJpdmF0ZSBmbG9jazogRmxvY2s7XG4gIFxuICAvLyDpgYrmiLLlr6bpq5RcbiAgcHJpdmF0ZSBncm91cFVuaXRzOiBJR3JvdXBVbml0W10gPSBbXTtcbiAgcHJpdmF0ZSBvYnN0YWNsZXM6IElPYnN0YWNsZVtdID0gW107XG4gIHByaXZhdGUgcGF0cm9sOiBJUGF0cm9sO1xuICBcbiAgLy8g6YGK5oiy54uA5oWLXG4gIHByaXZhdGUgcGF1c2VkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgY3VycmVudENvbnRyb2w6IENvbnRyb2xNb2RlID0gQ29udHJvbE1vZGUuUExBWUVSO1xuICBwcml2YXRlIGlzUFZQOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgcHZwVGltZXI6IG51bWJlciA9IDEyMDA7XG4gIHByaXZhdGUgbGFzdEZyYW1lVGltZTogbnVtYmVyID0gMDtcbiAgXG4gIC8vIOmBiuaIsumFjee9rlxuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwVW5pdENvdW50OiBudW1iZXIgPSA5O1xuICBcbiAgY29uc3RydWN0b3IocDogcDVJbnN0YW5jZSwgZGlzcGxheVdpZHRoOiBudW1iZXIsIGRpc3BsYXlIZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5kaXNwbGF5V2lkdGggPSBkaXNwbGF5V2lkdGg7XG4gICAgdGhpcy5kaXNwbGF5SGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbns7vntbFcbiAgICB0aGlzLnJlbmRlclN5c3RlbSA9IG5ldyBSZW5kZXJTeXN0ZW0ocCwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcbiAgICB0aGlzLmlucHV0U3lzdGVtID0gbmV3IElucHV0U3lzdGVtKHApO1xuICAgIHRoaXMudWlTeXN0ZW0gPSBuZXcgVUlTeXN0ZW0ocCwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcbiAgICB0aGlzLmNhbWVyYVN5c3RlbSA9IG5ldyBDYW1lcmFTeXN0ZW0ocCwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcbiAgICB0aGlzLmZsb2NrID0gbmV3IEZsb2NrKHApO1xuICAgIFxuICAgIC8vIOWIneWni+WMlumBiuaIsuWvpumrlFxuICAgIHRoaXMucGF0cm9sID0gbmV3IFBhdHJvbChwKTtcbiAgICBcbiAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfVxuICBcbiAgLy8g5Yid5aeL5YyWXG4gIHB1YmxpYyBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgIC8vIOWIneWni+WMluebuOapn1xuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLmRpc3BsYXlXaWR0aCAvIDI7XG4gICAgY29uc3QgY2VudGVyWSA9IHRoaXMuZGlzcGxheUhlaWdodCAvIDI7XG4gICAgdGhpcy5jYW1lcmFTeXN0ZW0uc2V0UG9zaXRpb24oY2VudGVyWCwgY2VudGVyWSwgNTU0KTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJYgVUlcbiAgICB0aGlzLnVpU3lzdGVtLmluaXRpYWxpemUoKTtcbiAgICBcbiAgICAvLyDlibXlu7rnvqTntYTllq7kvY1cbiAgICB0aGlzLmluaXRpYWxpemVHcm91cFVuaXRzKCk7XG4gICAgXG4gICAgLy8g5Ym15bu66Zqc56SZ54mpXG4gICAgdGhpcy5pbml0aWFsaXplT2JzdGFjbGVzKCk7XG4gICAgXG4gICAgLy8g6Kit5a6a5beh6YKP57O757WxXG4gICAgdGhpcy5pbml0aWFsaXplUGF0cm9sKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coJ0dhbWVNYW5hZ2VyIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xuICB9XG4gIFxuICAvLyDliJ3lp4vljJbnvqTntYTllq7kvY1cbiAgcHJpdmF0ZSBpbml0aWFsaXplR3JvdXBVbml0cygpOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JvdXBVbml0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgeCA9ICh0aGlzLmRpc3BsYXlXaWR0aCAvIHRoaXMuZ3JvdXBVbml0Q291bnQpICogaSArIDIwO1xuICAgICAgY29uc3QgeSA9IHRoaXMuZGlzcGxheUhlaWdodCAtIDUwO1xuICAgICAgY29uc3QgZ3JvdXBJZCA9IGkgKyAxO1xuICAgICAgXG4gICAgICBjb25zdCBncm91cFVuaXQgPSBuZXcgR3JvdXBVbml0KHRoaXMucCwgZ3JvdXBJZCwgeCwgeSk7XG4gICAgICBcbiAgICAgIC8vIOa3u+WKoOWIneWni+WWruS9jVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcbiAgICAgICAgZ3JvdXBVbml0LmFkZFVuaXQoeCArIGogKiAxMCwgeSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuZ3JvdXBVbml0cy5wdXNoKGdyb3VwVW5pdCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDliJ3lp4vljJbpmpznpJnnialcbiAgcHJpdmF0ZSBpbml0aWFsaXplT2JzdGFjbGVzKCk6IHZvaWQge1xuICAgIGNvbnN0IG9ic3RhY2xlQ29uZmlncyA9IFtcbiAgICAgIHsgeDogMjAwLCB5OiAxNTAsIHJhZGl1czogODAgfSxcbiAgICAgIHsgeDogMzUwLCB5OiAyNTAsIHJhZGl1czogNjUgfSxcbiAgICAgIHsgeDogNDUwLCB5OiAzNTAsIHJhZGl1czogNjUgfSxcbiAgICAgIHsgeDogNTIwLCB5OiAxNTAsIHJhZGl1czogNjUgfSxcbiAgICAgIHsgeDogMzIwLCB5OiAxMDAsIHJhZGl1czogMjUgfSxcbiAgICAgIHsgeDogMTAwLCB5OiAzMDAsIHJhZGl1czogNTUgfSxcbiAgICAgIHsgeDogNjAwLCB5OiAzMDAsIHJhZGl1czogMTAwIH0sXG4gICAgICB7IHg6IDcwMCwgeTogMjAwLCByYWRpdXM6IDcwIH0sXG4gICAgICB7IHg6IDU1MCwgeTogNDgwLCByYWRpdXM6IDY1IH0sXG4gICAgICB7IHg6IDI1MCwgeTogNDUwLCByYWRpdXM6IDg1IH0sXG4gICAgICB7IHg6IDg1MCwgeTogNDAwLCByYWRpdXM6IDg1IH1cbiAgICBdO1xuICAgIFxuICAgIGZvciAoY29uc3QgY29uZmlnIG9mIG9ic3RhY2xlQ29uZmlncykge1xuICAgICAgY29uc3Qgb2JzdGFjbGUgPSBuZXcgT2JzdGFjbGUodGhpcy5wLCBjb25maWcueCwgY29uZmlnLnksIGNvbmZpZy5yYWRpdXMpO1xuICAgICAgdGhpcy5vYnN0YWNsZXMucHVzaChvYnN0YWNsZSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDliJ3lp4vljJblt6Hpgo/ns7vntbFcbiAgcHJpdmF0ZSBpbml0aWFsaXplUGF0cm9sKCk6IHZvaWQge1xuICAgIC8vIOa3u+WKoOW3oemCj+m7nlxuICAgIHRoaXMucGF0cm9sLmFkZFBvaW50KDUwLCA1MCwgMzUwKTtcbiAgICB0aGlzLnBhdHJvbC5hZGRQb2ludCh0aGlzLmRpc3BsYXlXaWR0aCAtIDUwLCA1MCwgNDAwKTtcbiAgICB0aGlzLnBhdHJvbC5hZGRQb2ludCh0aGlzLmRpc3BsYXlXaWR0aCAtIDUwLCB0aGlzLmRpc3BsYXlIZWlnaHQgLSA1MCwgMzUwKTtcbiAgICB0aGlzLnBhdHJvbC5hZGRQb2ludCg1MCwgdGhpcy5kaXNwbGF5SGVpZ2h0IC0gNTAsIDMwMCk7XG4gICAgdGhpcy5wYXRyb2wuYWRkUG9pbnQodGhpcy5kaXNwbGF5V2lkdGggLyAyLCB0aGlzLmRpc3BsYXlIZWlnaHQgLSA1MCwgMzAwKTtcbiAgICB0aGlzLnBhdHJvbC5hZGRQb2ludCh0aGlzLmRpc3BsYXlXaWR0aCAvIDIsIDUwLCA0MDApO1xuICAgIFxuICAgIC8vIOWwh+e+pOe1hOWWruS9jeWKoOWFpeW3oemCj+ezu+e1sVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ncm91cFVuaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwYXRyb2xJbmRleCA9IGkgJSB0aGlzLnBhdHJvbC5nZXRQb2ludENvdW50KCk7XG4gICAgICBjb25zdCBjcmVhdGVYID0gdGhpcy5kaXNwbGF5V2lkdGggLyB0aGlzLmdyb3VwVW5pdENvdW50ICsgMjA7XG4gICAgICBjb25zdCBjcmVhdGVZID0gdGhpcy5kaXNwbGF5SGVpZ2h0IC0gNTA7XG4gICAgICBcbiAgICAgIHRoaXMucGF0cm9sLmFkZEdyb3VwVW5pdCh0aGlzLmdyb3VwVW5pdHNbaV0sIHBhdHJvbEluZGV4LCBjcmVhdGVYLCBjcmVhdGVZKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOioreWumuS6i+S7tuebo+iBveWZqFxuICBwcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgLy8g6Ly45YWl5LqL5Lu2XG4gICAgdGhpcy5pbnB1dFN5c3RlbS5hZGRFdmVudExpc3RlbmVyKElucHV0RXZlbnRUeXBlLk1PVVNFX0NMSUNLLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5tb3VzZVBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlTW91c2VDbGljayhldmVudC5tb3VzZVBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLmlucHV0U3lzdGVtLmFkZEV2ZW50TGlzdGVuZXIoSW5wdXRFdmVudFR5cGUuQ0FNRVJBX01PVkUsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50Lm1vdmVtZW50KSB7XG4gICAgICAgIHRoaXMuY2FtZXJhU3lzdGVtLm1vdmUoZXZlbnQubW92ZW1lbnQueCwgZXZlbnQubW92ZW1lbnQueSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy8gVUkg5LqL5Lu2XG4gICAgdGhpcy51aVN5c3RlbS5hZGRFdmVudExpc3RlbmVyKFVJRXZlbnRUeXBlLkNPTlRST0xfQ0hBTkdFRCwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YT8uY29udHJvbCkge1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRDb250cm9sKGV2ZW50LmRhdGEuY29udHJvbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy51aVN5c3RlbS5hZGRFdmVudExpc3RlbmVyKFVJRXZlbnRUeXBlLlBWUF9UT0dHTEVELCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhPy5pc1BWUCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuc2V0UFZQTW9kZShldmVudC5kYXRhLmlzUFZQKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnVpU3lzdGVtLmFkZEV2ZW50TGlzdGVuZXIoVUlFdmVudFR5cGUuTkVXX1VOSVRfUkVRVUVTVEVELCAoKSA9PiB7XG4gICAgICB0aGlzLmFkZFVuaXRzVG9DdXJyZW50R3JvdXAoKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnVpU3lzdGVtLmFkZEV2ZW50TGlzdGVuZXIoVUlFdmVudFR5cGUuQVJST1dfVE9HR0xFRCwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YT8uc2hvd0Fycm93cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVuZGVyU3lzdGVtLnJlbmRlckFycm93cyhldmVudC5kYXRhLnNob3dBcnJvd3MpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHRoaXMudWlTeXN0ZW0uYWRkRXZlbnRMaXN0ZW5lcihVSUV2ZW50VHlwZS5UQVJHRVRfTElORV9UT0dHTEVELCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5kYXRhPy5zaG93VGFyZ2V0TGluZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbmRlclN5c3RlbS5yZW5kZXJUYXJnZXRMaW5lcyhldmVudC5kYXRhLnNob3dUYXJnZXRMaW5lcyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy51aVN5c3RlbS5hZGRFdmVudExpc3RlbmVyKFVJRXZlbnRUeXBlLlVOSVRfU1RBVFNfVE9HR0xFRCwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGF0YT8uc2hvd1VuaXRTdGF0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVuZGVyU3lzdGVtLnJlbmRlclVuaXRTdGF0cyhldmVudC5kYXRhLnNob3dVbml0U3RhdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIFxuICAvLyDomZXnkIbmu5HpvKDpu57mk4pcbiAgcHJpdmF0ZSBoYW5kbGVNb3VzZUNsaWNrKG1vdXNlUG9zaXRpb246IElWZWN0b3IpOiB2b2lkIHtcbiAgICAvLyDovYnmj5vngrrkuJbnlYzluqfmqJlcbiAgICBjb25zdCB3b3JsZFBvcyA9IHRoaXMuY2FtZXJhU3lzdGVtLnNjcmVlblRvV29ybGQobW91c2VQb3NpdGlvbik7XG4gICAgXG4gICAgLy8g6Kit5a6a55W25YmN5o6n5Yi2576k57WE55qE55uu5qiZ5L2N572uXG4gICAgY29uc3QgY3VycmVudEdyb3VwID0gdGhpcy5ncm91cFVuaXRzW3RoaXMuY3VycmVudENvbnRyb2wgLSAxXTtcbiAgICBpZiAoY3VycmVudEdyb3VwKSB7XG4gICAgICBjdXJyZW50R3JvdXAuc2V0RGVzdGluYXRpb24od29ybGRQb3MpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8g5re75Yqg5Zau5L2N5Yiw55W25YmN5o6n5Yi2576k57WEXG4gIHByaXZhdGUgYWRkVW5pdHNUb0N1cnJlbnRHcm91cCgpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50R3JvdXAgPSB0aGlzLmdyb3VwVW5pdHNbdGhpcy5jdXJyZW50Q29udHJvbCAtIDFdO1xuICAgIGlmIChjdXJyZW50R3JvdXApIHtcbiAgICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLmRpc3BsYXlXaWR0aCAvIDI7XG4gICAgICBjb25zdCBjZW50ZXJZID0gdGhpcy5kaXNwbGF5SGVpZ2h0IC0gNTA7XG4gICAgICBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICBjdXJyZW50R3JvdXAuYWRkVW5pdChjZW50ZXJYLCBjZW50ZXJZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIC8vIOabtOaWsOmBiuaIsumCj+i8r1xuICBwdWJsaWMgdXBkYXRlKGRlbHRhVGltZTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSByZXR1cm47XG4gICAgXG4gICAgLy8g6ZmQ5Yi25pu05paw6aC7546HXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGlmIChjdXJyZW50VGltZSAtIHRoaXMubGFzdEZyYW1lVGltZSA8IDQxKSByZXR1cm47IC8vIOe0hCAyNCBGUFNcbiAgICBcbiAgICAvLyDmm7TmlrDns7vntbFcbiAgICB0aGlzLmlucHV0U3lzdGVtLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgIHRoaXMudWlTeXN0ZW0udXBkYXRlKGRlbHRhVGltZSk7XG4gICAgdGhpcy5jYW1lcmFTeXN0ZW0udXBkYXRlKGRlbHRhVGltZSk7XG4gICAgXG4gICAgLy8g5pu05paw55u45qmf6KaW56qXXG4gICAgY29uc3QgY2FtZXJhUG9zID0gdGhpcy5jYW1lcmFTeXN0ZW0uZ2V0UG9zaXRpb24oKTtcbiAgICB0aGlzLnJlbmRlclN5c3RlbS5zZXRWaWV3UG9ydChjYW1lcmFQb3MueCwgY2FtZXJhUG9zLnkpO1xuICAgIFxuICAgIC8vIOabtOaWsOe+pOe1hOihjOeCulxuICAgIHRoaXMudXBkYXRlR3JvdXBCZWhhdmlvcnMoKTtcbiAgICBcbiAgICAvLyDmm7TmlrDnvqTntYTllq7kvY1cbiAgICBmb3IgKGNvbnN0IGdyb3VwVW5pdCBvZiB0aGlzLmdyb3VwVW5pdHMpIHtcbiAgICAgIGdyb3VwVW5pdC51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICB9XG4gICAgXG4gICAgLy8g5pu05paw5beh6YKP57O757WxXG4gICAgdGhpcy5wYXRyb2wudXBkYXRlKCk7XG4gICAgXG4gICAgLy8g5pu05pawIFBWUCDmqKHlvI9cbiAgICBpZiAodGhpcy5pc1BWUCkge1xuICAgICAgdGhpcy51cGRhdGVQVlBNb2RlKCk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMubGFzdEZyYW1lVGltZSA9IGN1cnJlbnRUaW1lO1xuICB9XG4gIFxuICAvLyDmm7TmlrDnvqTntYTooYzngrpcbiAgcHJpdmF0ZSB1cGRhdGVHcm91cEJlaGF2aW9ycygpOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JvdXBVbml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudEdyb3VwID0gdGhpcy5ncm91cFVuaXRzW2ldO1xuICAgICAgY29uc3QgY3VycmVudFVuaXRzID0gY3VycmVudEdyb3VwLmdldFVuaXRzKCk7XG4gICAgICBcbiAgICAgIC8vIOaUtumbhuaJgOacieaVteWwjeWWruS9jVxuICAgICAgY29uc3QgZW5lbXlVbml0cyA9IFtdO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmdyb3VwVW5pdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKGkgIT09IGopIHtcbiAgICAgICAgICBlbmVteVVuaXRzLnB1c2goLi4udGhpcy5ncm91cFVuaXRzW2pdLmdldFVuaXRzKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIOWft+ihjOe+pOmrlOihjOeCulxuICAgICAgY29uc3QgbGVhZGVyID0gY3VycmVudEdyb3VwLmdldExlYWRlcigpO1xuICAgICAgaWYgKGxlYWRlcikge1xuICAgICAgICB0aGlzLmZsb2NrLnJ1bihsZWFkZXIsIGN1cnJlbnRVbml0cywgdGhpcy5vYnN0YWNsZXMsIGVuZW15VW5pdHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgLy8g5pu05pawIFBWUCDmqKHlvI9cbiAgcHJpdmF0ZSB1cGRhdGVQVlBNb2RlKCk6IHZvaWQge1xuICAgIHRoaXMucHZwVGltZXItLTtcbiAgICBcbiAgICBpZiAodGhpcy5wdnBUaW1lciA8PSAwKSB7XG4gICAgICB0aGlzLnB2cFRpbWVyID0gMTIwMDtcbiAgICAgIFxuICAgICAgLy8g6K6T5omA5pyJ576k57WE5pS75pOK546p5a62576k57WE77yI56ys5LiA5YCL576k57WE77yJXG4gICAgICBjb25zdCBwbGF5ZXJHcm91cCA9IHRoaXMuZ3JvdXBVbml0c1swXTtcbiAgICAgIGlmIChwbGF5ZXJHcm91cCkge1xuICAgICAgICBjb25zdCBwbGF5ZXJMZWFkZXIgPSBwbGF5ZXJHcm91cC5nZXRMZWFkZXIoKTtcbiAgICAgICAgaWYgKHBsYXllckxlYWRlcikge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5ncm91cFVuaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwVW5pdHNbaV0uc2V0RGVzdGluYXRpb24ocGxheWVyTGVhZGVyLnBvc2l0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIC8vIOa4suafk1xuICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xuICAgIC8vIOa4heepuueVq+mdolxuICAgIHRoaXMucmVuZGVyU3lzdGVtLmNsZWFyKCk7XG4gICAgXG4gICAgLy8g5riy5p+T6Zqc56SZ54mpXG4gICAgdGhpcy5yZW5kZXJTeXN0ZW0ucmVuZGVyT2JzdGFjbGVzKHRoaXMub2JzdGFjbGVzKTtcbiAgICBcbiAgICAvLyDmuLLmn5PmiYDmnInnvqTntYTnmoTllq7kvY1cbiAgICBjb25zdCBhbGxVbml0cyA9IHRoaXMuZ3JvdXBVbml0cy5mbGF0TWFwKGdyb3VwID0+IGdyb3VwLmdldFVuaXRzKCkpO1xuICAgIHRoaXMucmVuZGVyU3lzdGVtLnJlbmRlclVuaXRzKGFsbFVuaXRzKTtcbiAgICBcbiAgICAvLyDmuLLmn5Plt6Hpgo/ns7vntbFcbiAgICB0aGlzLnBhdHJvbC5yZW5kZXIodGhpcy5wKTtcbiAgICBcbiAgICAvLyDmuLLmn5MgVUkg5paH5a2XXG4gICAgdGhpcy5yZW5kZXJHYW1lVUkoKTtcbiAgICBcbiAgICAvLyDmuLLmn5PpmaTpjK/os4foqIpcbiAgICBjb25zdCBkZWJ1Z0luZm8gPSB7XG4gICAgICBmcmFtZVJhdGU6IHRoaXMucC5mcmFtZVJhdGUoKSxcbiAgICAgIHVuaXRDb3VudDogYWxsVW5pdHMubGVuZ3RoLFxuICAgICAgb2JzdGFjbGVDb3VudDogdGhpcy5vYnN0YWNsZXMubGVuZ3RoLFxuICAgICAgY3VycmVudENvbnRyb2w6IHRoaXMuY3VycmVudENvbnRyb2wsXG4gICAgICBpc1BWUDogdGhpcy5pc1BWUCxcbiAgICAgIHZpZXdYOiB0aGlzLmNhbWVyYVN5c3RlbS5nZXRQb3NpdGlvbigpLngsXG4gICAgICB2aWV3WTogdGhpcy5jYW1lcmFTeXN0ZW0uZ2V0UG9zaXRpb24oKS55XG4gICAgfTtcbiAgICBcbiAgICB0aGlzLnJlbmRlclN5c3RlbS5yZW5kZXJEZWJ1Z0luZm8oZGVidWdJbmZvKTtcbiAgICBcbiAgICAvLyDln7fooYzmnIDntYLmuLLmn5NcbiAgICB0aGlzLnJlbmRlclN5c3RlbS5yZW5kZXIoKTtcbiAgfVxuICBcbiAgLy8g5riy5p+T6YGK5oiyIFVJIOaWh+Wtl1xuICBwcml2YXRlIHJlbmRlckdhbWVVSSgpOiB2b2lkIHtcbiAgICBjb25zdCBjYW1lcmFQb3MgPSB0aGlzLmNhbWVyYVN5c3RlbS5nZXRQb3NpdGlvbigpO1xuICAgIGNvbnN0IHZpZXdYID0gY2FtZXJhUG9zLng7XG4gICAgY29uc3Qgdmlld1kgPSBjYW1lcmFQb3MueTtcbiAgICBcbiAgICAvLyDmuLLmn5PnvqTntYTllq7kvY3ntbHoqIhcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JvdXBVbml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgeFBvcyA9IHZpZXdYIC0gdGhpcy5kaXNwbGF5V2lkdGggLyAyICsgMTAwICsgaSAqIDUwO1xuICAgICAgY29uc3QgeVBvcyA9IHZpZXdZIC0gdGhpcy5kaXNwbGF5SGVpZ2h0IC8gMiArIDIwO1xuICAgICAgY29uc3QgdGV4dCA9IGBQJHtpICsgMX1fJHt0aGlzLmdyb3VwVW5pdHNbaV0uZ2V0VW5pdHMoKS5sZW5ndGh9YDtcbiAgICAgIFxuICAgICAgdGhpcy5yZW5kZXJTeXN0ZW0ucmVuZGVyVGV4dCh0ZXh0LCB4UG9zLCB5UG9zLCB7IHI6IDI0OSwgZzogMjQ5LCBiOiAyNDYgfSk7XG4gICAgfVxuICAgIFxuICAgIC8vIOa4suafkyBQVlAg6KiI5pmC5ZmoXG4gICAgaWYgKHRoaXMuaXNQVlApIHtcbiAgICAgIGNvbnN0IHRpbWVyVGV4dCA9IGBQVCAke3RoaXMucHZwVGltZXJ9YDtcbiAgICAgIGNvbnN0IHRpbWVyWCA9IHZpZXdYICsgODU7XG4gICAgICBjb25zdCB0aW1lclkgPSB2aWV3WSAtIHRoaXMuZGlzcGxheUhlaWdodCAvIDIgKyA1MDtcbiAgICAgIFxuICAgICAgdGhpcy5yZW5kZXJTeXN0ZW0ucmVuZGVyVGV4dCh0aW1lclRleHQsIHRpbWVyWCwgdGltZXJZLCB7IHI6IDI1NSwgZzogMjU1LCBiOiAwIH0pO1xuICAgIH1cbiAgfVxuICBcbiAgLy8g57O757Wx5o6n5Yi25pa55rOVXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMudWlTeXN0ZW0uZGVzdHJveSgpO1xuICAgIHRoaXMuZ3JvdXBVbml0cyA9IFtdO1xuICAgIHRoaXMub2JzdGFjbGVzID0gW107XG4gICAgdGhpcy5wYXRyb2wuY2xlYXIoKTtcbiAgfVxuICBcbiAgcHVibGljIGlzUGF1c2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhdXNlZDtcbiAgfVxuICBcbiAgcHVibGljIHNldFBhdXNlZChwYXVzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnBhdXNlZCA9IHBhdXNlZDtcbiAgfVxuICBcbiAgLy8g576k57WE5Zau5L2N566h55CGXG4gIHB1YmxpYyBnZXRHcm91cFVuaXRzKCk6IElHcm91cFVuaXRbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdyb3VwVW5pdHNdO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0R3JvdXBVbml0KGluZGV4OiBudW1iZXIpOiBJR3JvdXBVbml0IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5ncm91cFVuaXRzW2luZGV4XTtcbiAgfVxuICBcbiAgcHVibGljIGFkZEdyb3VwVW5pdChncm91cFVuaXQ6IElHcm91cFVuaXQpOiB2b2lkIHtcbiAgICB0aGlzLmdyb3VwVW5pdHMucHVzaChncm91cFVuaXQpO1xuICB9XG4gIFxuICBwdWJsaWMgcmVtb3ZlR3JvdXBVbml0KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuZ3JvdXBVbml0cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZ3JvdXBVbml0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8g6Zqc56SZ54mp566h55CGXG4gIHB1YmxpYyBnZXRPYnN0YWNsZXMoKTogSU9ic3RhY2xlW10ge1xuICAgIHJldHVybiBbLi4udGhpcy5vYnN0YWNsZXNdO1xuICB9XG4gIFxuICBwdWJsaWMgYWRkT2JzdGFjbGUob2JzdGFjbGU6IElPYnN0YWNsZSk6IHZvaWQge1xuICAgIHRoaXMub2JzdGFjbGVzLnB1c2gob2JzdGFjbGUpO1xuICB9XG4gIFxuICBwdWJsaWMgcmVtb3ZlT2JzdGFjbGUob2JzdGFjbGU6IElPYnN0YWNsZSk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5vYnN0YWNsZXMuaW5kZXhPZihvYnN0YWNsZSk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5vYnN0YWNsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOW3oemCj+ezu+e1sVxuICBwdWJsaWMgZ2V0UGF0cm9sKCk6IElQYXRyb2wge1xuICAgIHJldHVybiB0aGlzLnBhdHJvbDtcbiAgfVxuICBcbiAgLy8g5o6n5Yi2566h55CGXG4gIHB1YmxpYyBnZXRDdXJyZW50Q29udHJvbCgpOiBDb250cm9sTW9kZSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudENvbnRyb2w7XG4gIH1cbiAgXG4gIHB1YmxpYyBzZXRDdXJyZW50Q29udHJvbChjb250cm9sOiBDb250cm9sTW9kZSk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudENvbnRyb2wgPSBjb250cm9sO1xuICAgIHRoaXMudWlTeXN0ZW0udXBkYXRlQ29udHJvbERpc3BsYXkoY29udHJvbCk7XG4gIH1cbiAgXG4gIC8vIFBWUCDmqKHlvI9cbiAgcHVibGljIGlzUFZQTW9kZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1BWUDtcbiAgfVxuICBcbiAgcHVibGljIHNldFBWUE1vZGUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuaXNQVlAgPSBlbmFibGVkO1xuICAgIHRoaXMucHZwVGltZXIgPSBlbmFibGVkID8gNTAgOiAxMjAwO1xuICAgIHRoaXMudWlTeXN0ZW0udXBkYXRlUFZQRGlzcGxheShlbmFibGVkKTtcbiAgfVxuICBcbiAgLy8g6YGK5oiy6YWN572uXG4gIHB1YmxpYyBnZXREaXNwbGF5U2l6ZSgpOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogdGhpcy5kaXNwbGF5V2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuZGlzcGxheUhlaWdodFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIOe1seioiOizh+ioilxuICBwdWJsaWMgZ2V0R2FtZVN0YXRzKCk6IHtcbiAgICBmcmFtZVJhdGU6IG51bWJlcjtcbiAgICB0b3RhbFVuaXRzOiBudW1iZXI7XG4gICAgdG90YWxPYnN0YWNsZXM6IG51bWJlcjtcbiAgICBjdXJyZW50Q29udHJvbDogQ29udHJvbE1vZGU7XG4gICAgaXNQVlA6IGJvb2xlYW47XG4gICAgaXNBY3RpdmU6IGJvb2xlYW47XG4gIH0ge1xuICAgIGNvbnN0IHRvdGFsVW5pdHMgPSB0aGlzLmdyb3VwVW5pdHMucmVkdWNlKFxuICAgICAgKHN1bSwgZ3JvdXApID0+IHN1bSArIGdyb3VwLmdldFVuaXRzKCkubGVuZ3RoLFxuICAgICAgMFxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGZyYW1lUmF0ZTogdGhpcy5wLmZyYW1lUmF0ZSgpLFxuICAgICAgdG90YWxVbml0cyxcbiAgICAgIHRvdGFsT2JzdGFjbGVzOiB0aGlzLm9ic3RhY2xlcy5sZW5ndGgsXG4gICAgICBjdXJyZW50Q29udHJvbDogdGhpcy5jdXJyZW50Q29udHJvbCxcbiAgICAgIGlzUFZQOiB0aGlzLmlzUFZQLFxuICAgICAgaXNBY3RpdmU6ICF0aGlzLnBhdXNlZFxuICAgIH07XG4gIH1cbiAgXG4gIC8vIOi8uOWFpeiZleeQhuaWueazle+8iOS+myBwNSDkuovku7boqr/nlKjvvIlcbiAgcHVibGljIG9uTW91c2VQcmVzc2VkKG1vdXNlWDogbnVtYmVyLCBtb3VzZVk6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuaW5wdXRTeXN0ZW0ub25Nb3VzZVByZXNzZWQobW91c2VYLCBtb3VzZVkpO1xuICB9XG4gIFxuICBwdWJsaWMgb25LZXlQcmVzc2VkKGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuaW5wdXRTeXN0ZW0ub25LZXlQcmVzc2VkKGtleUNvZGUpO1xuICB9XG4gIFxuICBwdWJsaWMgb25LZXlSZWxlYXNlZChrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmlucHV0U3lzdGVtLm9uS2V5UmVsZWFzZWQoa2V5Q29kZSk7XG4gIH1cbn0iLCIvLyDnvqTpq5TooYzngrrku4vpnaLlrprnvqlcbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuaW1wb3J0IHsgSVVuaXQgfSBmcm9tICcuL0lVbml0JztcbmltcG9ydCB7IElPYnN0YWNsZSB9IGZyb20gJy4vSU9ic3RhY2xlJztcblxuZXhwb3J0IGludGVyZmFjZSBJRmxvY2tCZWhhdmlvciB7XG4gIC8vIOS4ieWkp+aguOW/g+e+pOmrlOihjOeCulxuICBzZXBhcmF0ZShsZWFkZXI6IElVbml0LCB0YXJnZXRVbml0OiBJVW5pdCwgdW5pdHM6IElVbml0W10pOiBJVmVjdG9yO1xuICBhbGlnbihsZWFkZXI6IElVbml0LCB0YXJnZXRVbml0OiBJVW5pdCwgdW5pdHM6IElVbml0W10pOiBJVmVjdG9yO1xuICBjb2hlc2lvbihsZWFkZXI6IElVbml0LCB0YXJnZXRVbml0OiBJVW5pdCwgdW5pdHM6IElVbml0W10pOiBJVmVjdG9yO1xuICBcbiAgLy8g6YG/6Zqc6KGM54K6XG4gIGF2b2lkKHRhcmdldFVuaXQ6IElVbml0LCBvYnN0YWNsZXM6IElPYnN0YWNsZVtdKTogSVZlY3RvcjtcbiAgYXZvaWRFbmVtaWVzKHRhcmdldFVuaXQ6IElVbml0LCBlbmVtaWVzOiBJVW5pdFtdKTogSVZlY3RvcjtcbiAgXG4gIC8vIOS4u+imgemBi+ihjOaWueazlVxuICBydW4obGVhZGVyOiBJVW5pdCwgdW5pdHM6IElVbml0W10sIG9ic3RhY2xlczogSU9ic3RhY2xlW10sIGVuZW1pZXM6IElVbml0W10pOiB2b2lkO1xuICBcbiAgLy8g6KGM54K65qyK6YeN6YWN572uXG4gIHNldFNlcGFyYXRpb25XZWlnaHQod2VpZ2h0OiBudW1iZXIpOiB2b2lkO1xuICBzZXRBbGlnbm1lbnRXZWlnaHQod2VpZ2h0OiBudW1iZXIpOiB2b2lkO1xuICBzZXRDb2hlc2lvbldlaWdodCh3ZWlnaHQ6IG51bWJlcik6IHZvaWQ7XG4gIHNldEF2b2lkYW5jZVdlaWdodCh3ZWlnaHQ6IG51bWJlcik6IHZvaWQ7XG4gIFxuICAvLyDooYzngrrlj4PmlbjphY3nva5cbiAgc2V0RGVzaXJlZFNlcGFyYXRpb24oZGlzdGFuY2U6IG51bWJlcik6IHZvaWQ7XG4gIHNldE5laWdoYm9yRGlzdGFuY2UoZGlzdGFuY2U6IG51bWJlcik6IHZvaWQ7XG4gIHNldENvbGxpc2lvblZpc2liaWxpdHlGYWN0b3IoZmFjdG9yOiBudW1iZXIpOiB2b2lkO1xuICBcbiAgLy8g6Zmk6Yyv6IiH6KaW6Ka65YyWXG4gIGRyYXdBcnJvdyhwOiBwNUluc3RhbmNlLCBiYXNlOiBJVmVjdG9yLCB2ZWM6IElWZWN0b3IsIGNvbG9yOiBzdHJpbmcpOiB2b2lkO1xuICBlbmFibGVBcnJvd3MoZW5hYmxlOiBib29sZWFuKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRmxvY2tDb25maWd1cmF0aW9uIHtcbiAgLy8g6KGM54K65qyK6YeNXG4gIHNlcGFyYXRpb25XZWlnaHQ6IG51bWJlcjtcbiAgYWxpZ25tZW50V2VpZ2h0OiBudW1iZXI7XG4gIGNvaGVzaW9uV2VpZ2h0OiBudW1iZXI7XG4gIGF2b2lkYW5jZVdlaWdodDogbnVtYmVyO1xuICBlbmVteUF2b2lkYW5jZVdlaWdodDogbnVtYmVyO1xuICBcbiAgLy8g6KGM54K65Y+D5pW4XG4gIGRlc2lyZWRTZXBhcmF0aW9uOiBudW1iZXI7XG4gIG5laWdoYm9yRGlzdGFuY2U6IG51bWJlcjtcbiAgY29sbGlzaW9uVmlzaWJpbGl0eUZhY3RvcjogbnVtYmVyO1xuICBcbiAgLy8g6Zmk6Yyv6Kit5a6aXG4gIHNob3dBcnJvd3M6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZMT0NLX0NPTkZJRzogSUZsb2NrQ29uZmlndXJhdGlvbiA9IHtcbiAgc2VwYXJhdGlvbldlaWdodDogMi4yLFxuICBhbGlnbm1lbnRXZWlnaHQ6IDEuMCxcbiAgY29oZXNpb25XZWlnaHQ6IDEuMCxcbiAgYXZvaWRhbmNlV2VpZ2h0OiAyLjAsXG4gIGVuZW15QXZvaWRhbmNlV2VpZ2h0OiAyLjAsXG4gIGRlc2lyZWRTZXBhcmF0aW9uOiAyNS4wLFxuICBuZWlnaGJvckRpc3RhbmNlOiAzMCxcbiAgY29sbGlzaW9uVmlzaWJpbGl0eUZhY3RvcjogNixcbiAgc2hvd0Fycm93czogZmFsc2Vcbn07IiwiLy8g5pS75pOK6KaW6Ka654m55pWI6aGe5YilXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwZXMvcDUuZC50c1wiIC8+XG5cbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi90eXBlcy9jb21tb24nO1xuXG5leHBvcnQgY2xhc3MgQXR0YWNrVkZYIHtcbiAgcHJpdmF0ZSBzaG93dGltZTogbnVtYmVyO1xuICBwcml2YXRlIGJhc2U6IElWZWN0b3I7XG4gIHByaXZhdGUgdmVjOiBJVmVjdG9yO1xuICBwcml2YXRlIGNvbG9yOiBDb2xvciB8IHN0cmluZztcbiAgcHJpdmF0ZSBwOiBwNUluc3RhbmNlO1xuICBcbiAgY29uc3RydWN0b3IocDogcDVJbnN0YW5jZSwgYmFzZTogSVZlY3RvciwgdmVjOiBJVmVjdG9yLCBjb2xvcjogQ29sb3IgfCBzdHJpbmcpIHtcbiAgICB0aGlzLnAgPSBwO1xuICAgIHRoaXMuc2hvd3RpbWUgPSAxMDtcbiAgICB0aGlzLmJhc2UgPSBiYXNlO1xuICAgIHRoaXMudmVjID0gdmVjO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgfVxuICBcbiAgcHVibGljIGRyYXcoKTogdm9pZCB7XG4gICAgdGhpcy5zaG93dGltZS0tO1xuICAgIFxuICAgIHRoaXMucC5wdXNoKCk7XG4gICAgXG4gICAgLy8g6Kit5a6a6aGP6ImyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbG9yID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5wLnN0cm9rZSh0aGlzLmNvbG9yKTtcbiAgICAgIHRoaXMucC5maWxsKHRoaXMuY29sb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAuc3Ryb2tlKHRoaXMuY29sb3IuciwgdGhpcy5jb2xvci5nLCB0aGlzLmNvbG9yLmIsIHRoaXMuY29sb3IuYSB8fCAyNTUpO1xuICAgICAgdGhpcy5wLmZpbGwodGhpcy5jb2xvci5yLCB0aGlzLmNvbG9yLmcsIHRoaXMuY29sb3IuYiwgdGhpcy5jb2xvci5hIHx8IDI1NSk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMucC5zdHJva2VXZWlnaHQoMyk7XG4gICAgdGhpcy5wLnRyYW5zbGF0ZSh0aGlzLmJhc2UueCwgdGhpcy5iYXNlLnkpO1xuICAgIHRoaXMucC5saW5lKDAsIDAsIHRoaXMudmVjLngsIHRoaXMudmVjLnkpO1xuICAgIHRoaXMucC5yb3RhdGUodGhpcy52ZWMuaGVhZGluZygpKTtcbiAgICBcbiAgICB0aGlzLnAucG9wKCk7XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0V4cGlyZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2hvd3RpbWUgPD0gMDtcbiAgfVxuICBcbiAgcHVibGljIGdldFJlbWFpbmluZ1RpbWUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zaG93dGltZTtcbiAgfVxufSIsIi8vIEZsb2NrIOmhnuWIpSAtIOe+pOmrlOihjOeCuuWvpuePvlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGVzL3A1LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJRmxvY2tCZWhhdmlvciwgSUZsb2NrQ29uZmlndXJhdGlvbiwgREVGQVVMVF9GTE9DS19DT05GSUcgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lGbG9ja0JlaGF2aW9yJztcbmltcG9ydCB7IElVbml0IH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JVW5pdCc7XG5pbXBvcnQgeyBJT2JzdGFjbGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lPYnN0YWNsZSc7XG5pbXBvcnQgeyBJVmVjdG9yIH0gZnJvbSAnLi4vdHlwZXMvdmVjdG9yJztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4uL3V0aWxzL1ZlY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBGbG9jayBpbXBsZW1lbnRzIElGbG9ja0JlaGF2aW9yIHtcbiAgcHJpdmF0ZSBwOiBwNUluc3RhbmNlO1xuICBwcml2YXRlIGNvbmZpZzogSUZsb2NrQ29uZmlndXJhdGlvbjtcbiAgXG4gIGNvbnN0cnVjdG9yKHA6IHA1SW5zdGFuY2UsIGNvbmZpZz86IFBhcnRpYWw8SUZsb2NrQ29uZmlndXJhdGlvbj4pIHtcbiAgICB0aGlzLnAgPSBwO1xuICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0ZMT0NLX0NPTkZJRywgLi4uY29uZmlnIH07XG4gIH1cbiAgXG4gIC8vIOS4u+imgemBi+ihjOaWueazlVxuICBwdWJsaWMgcnVuKGxlYWRlcjogSVVuaXQsIHVuaXRzOiBJVW5pdFtdLCBvYnN0YWNsZXM6IElPYnN0YWNsZVtdLCBlbmVtaWVzOiBJVW5pdFtdKTogdm9pZCB7XG4gICAgLy8g6JmV55CG6Lef6Zqo54uA5oWL55qE5Zau5L2NXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdW5pdCA9IHVuaXRzW2ldO1xuICAgICAgXG4gICAgICBpZiAodW5pdC5pc0ZvbGxvdyAmJiB1bml0LmlzRm9sbG93KCkpIHtcbiAgICAgICAgdGhpcy5hcHBseUZvbGxvd0JlaGF2aW9ycyhsZWFkZXIsIHVuaXQsIHVuaXRzLCBvYnN0YWNsZXMsIGVuZW1pZXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAodW5pdC5pc0F0dGFja2luZyAmJiB1bml0LmlzQXR0YWNraW5nKCkpIHtcbiAgICAgICAgdGhpcy5hcHBseUF0dGFja0JlaGF2aW9ycyhsZWFkZXIsIHVuaXQsIHVuaXRzLCBvYnN0YWNsZXMsIGVuZW1pZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyDomZXnkIbpoJjlsI7ogIXnmoTpgb/pmpxcbiAgICBpZiAobGVhZGVyLmlzTW92ZSAmJiBsZWFkZXIuaXNNb3ZlKCkpIHtcbiAgICAgIGNvbnN0IGF2b2lkYW5jZSA9IHRoaXMuYXZvaWQobGVhZGVyLCBvYnN0YWNsZXMpO1xuICAgICAgaWYgKGF2b2lkYW5jZS5tYWcoKSA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnNob3dBcnJvd3MpIHtcbiAgICAgICAgICB0aGlzLmRyYXdBcnJvdyh0aGlzLnAsIGxlYWRlci5wb3NpdGlvbiwgVmVjdG9yLm11bHQodGhpcy5wLCBhdm9pZGFuY2UsIDEwMDApLCAnd2hpdGUnKTtcbiAgICAgICAgfVxuICAgICAgICBsZWFkZXIuYXBwbHlGb3JjZShhdm9pZGFuY2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyDnvqTpq5TlgZzmraLpgo/ovK9cbiAgICB0aGlzLmhhbmRsZUdyb3VwU3RvcHBpbmcobGVhZGVyLCB1bml0cyk7XG4gIH1cbiAgXG4gIHByaXZhdGUgYXBwbHlGb2xsb3dCZWhhdmlvcnMobGVhZGVyOiBJVW5pdCwgdW5pdDogSVVuaXQsIHVuaXRzOiBJVW5pdFtdLCBvYnN0YWNsZXM6IElPYnN0YWNsZVtdLCBlbmVtaWVzOiBJVW5pdFtdKTogdm9pZCB7XG4gICAgY29uc3Qgc2VwID0gdGhpcy5zZXBhcmF0ZShsZWFkZXIsIHVuaXQsIHVuaXRzKTtcbiAgICBjb25zdCBhbGkgPSB0aGlzLmFsaWduKGxlYWRlciwgdW5pdCwgdW5pdHMpO1xuICAgIGNvbnN0IGNvaCA9IHRoaXMuY29oZXNpb24obGVhZGVyLCB1bml0LCB1bml0cyk7XG4gICAgY29uc3QgYXZvID0gdGhpcy5hdm9pZCh1bml0LCBvYnN0YWNsZXMpO1xuICAgIGNvbnN0IGF2b0VuZW15ID0gdGhpcy5hdm9pZEVuZW1pZXModW5pdCwgZW5lbWllcyk7XG4gICAgXG4gICAgLy8g5oeJ55So5qyK6YeNXG4gICAgc2VwLm11bHQodGhpcy5jb25maWcuc2VwYXJhdGlvbldlaWdodCk7XG4gICAgYWxpLm11bHQodGhpcy5jb25maWcuYWxpZ25tZW50V2VpZ2h0KTtcbiAgICBjb2gubXVsdCh0aGlzLmNvbmZpZy5jb2hlc2lvbldlaWdodCk7XG4gICAgXG4gICAgLy8g5oeJ55So5Z+65pys6KGM54K65YqbXG4gICAgdW5pdC5hcHBseUZvcmNlKHNlcCk7XG4gICAgdW5pdC5hcHBseUZvcmNlKGFsaSk7XG4gICAgdW5pdC5hcHBseUZvcmNlKGNvaCk7XG4gICAgXG4gICAgLy8g5oeJ55So6YG/6Zqc5YqbXG4gICAgaWYgKGF2by5tYWcoKSA+IDApIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5zaG93QXJyb3dzKSB7XG4gICAgICAgIHRoaXMuZHJhd0Fycm93KHRoaXMucCwgdW5pdC5wb3NpdGlvbiwgVmVjdG9yLm11bHQodGhpcy5wLCBhdm8sIDEwMDApLCAnd2hpdGUnKTtcbiAgICAgIH1cbiAgICAgIGF2by5tdWx0KHRoaXMuY29uZmlnLmF2b2lkYW5jZVdlaWdodCk7XG4gICAgICB1bml0LmFwcGx5Rm9yY2UoYXZvKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGF2b0VuZW15Lm1hZygpID4gMCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnNob3dBcnJvd3MpIHtcbiAgICAgICAgdGhpcy5kcmF3QXJyb3codGhpcy5wLCB1bml0LnBvc2l0aW9uLCBWZWN0b3IubXVsdCh0aGlzLnAsIGF2b0VuZW15LCAxMDAwKSwgJ3B1cnBsZScpO1xuICAgICAgfVxuICAgICAgYXZvRW5lbXkubXVsdCh0aGlzLmNvbmZpZy5lbmVteUF2b2lkYW5jZVdlaWdodCk7XG4gICAgICB1bml0LmFwcGx5Rm9yY2UoYXZvRW5lbXkpO1xuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSBhcHBseUF0dGFja0JlaGF2aW9ycyhsZWFkZXI6IElVbml0LCB1bml0OiBJVW5pdCwgdW5pdHM6IElVbml0W10sIG9ic3RhY2xlczogSU9ic3RhY2xlW10sIGVuZW1pZXM6IElVbml0W10pOiB2b2lkIHtcbiAgICBjb25zdCBzZXAgPSB0aGlzLnNlcGFyYXRlKGxlYWRlciwgdW5pdCwgdW5pdHMpO1xuICAgIGNvbnN0IGNvaCA9IHRoaXMuY29oZXNpb24obGVhZGVyLCB1bml0LCB1bml0cyk7XG4gICAgY29uc3QgYXZvID0gdGhpcy5hdm9pZCh1bml0LCBvYnN0YWNsZXMpO1xuICAgIGNvbnN0IGF2b0VuZW15ID0gdGhpcy5hdm9pZEVuZW1pZXModW5pdCwgZW5lbWllcyk7XG4gICAgXG4gICAgLy8g5pS75pOK54uA5oWL5LiL55qE5qyK6YeN6Kq/5pW0XG4gICAgc2VwLm11bHQoMS4yKTtcbiAgICBjb2gubXVsdCgxLjApO1xuICAgIFxuICAgIHVuaXQuYXBwbHlGb3JjZShzZXApO1xuICAgIHVuaXQuYXBwbHlGb3JjZShjb2gpO1xuICAgIFxuICAgIGlmIChhdm8ubWFnKCkgPiAwKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcuc2hvd0Fycm93cykge1xuICAgICAgICB0aGlzLmRyYXdBcnJvdyh0aGlzLnAsIHVuaXQucG9zaXRpb24sIFZlY3Rvci5tdWx0KHRoaXMucCwgYXZvLCAxMDAwKSwgJ3doaXRlJyk7XG4gICAgICB9XG4gICAgICBhdm8ubXVsdCh0aGlzLmNvbmZpZy5hdm9pZGFuY2VXZWlnaHQpO1xuICAgICAgdW5pdC5hcHBseUZvcmNlKGF2byk7XG4gICAgfVxuICAgIFxuICAgIGlmIChhdm9FbmVteS5tYWcoKSA+IDApIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5zaG93QXJyb3dzKSB7XG4gICAgICAgIHRoaXMuZHJhd0Fycm93KHRoaXMucCwgdW5pdC5wb3NpdGlvbiwgVmVjdG9yLm11bHQodGhpcy5wLCBhdm9FbmVteSwgMTAwMCksICdwdXJwbGUnKTtcbiAgICAgIH1cbiAgICAgIGF2b0VuZW15Lm11bHQodGhpcy5jb25maWcuZW5lbXlBdm9pZGFuY2VXZWlnaHQpO1xuICAgICAgdW5pdC5hcHBseUZvcmNlKGF2b0VuZW15KTtcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgaGFuZGxlR3JvdXBTdG9wcGluZyhsZWFkZXI6IElVbml0LCB1bml0czogSVVuaXRbXSk6IHZvaWQge1xuICAgIGlmICghbGVhZGVyLmlzTW92ZSB8fCBsZWFkZXIuaXNNb3ZlKCkpIHJldHVybjtcbiAgICBcbiAgICBjb25zdCBzdW0gPSBuZXcgVmVjdG9yKHRoaXMucCwgMCwgMCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bml0cy5sZW5ndGg7IGkrKykge1xuICAgICAgc3VtLmFkZCh1bml0c1tpXS5wb3NpdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGlmICh1bml0cy5sZW5ndGggPiAwKSB7XG4gICAgICBzdW0uZGl2KHVuaXRzLmxlbmd0aCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QobGVhZGVyLnBvc2l0aW9uLCBzdW0pO1xuICAgIGlmIChkaXN0YW5jZSA8IHRoaXMuY29uZmlnLmRlc2lyZWRTZXBhcmF0aW9uKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdW5pdHNbaV0uaXNBdHRhY2tpbmcgfHwgIXVuaXRzW2ldLmlzQXR0YWNraW5nKCkpIHtcbiAgICAgICAgICB1bml0c1tpXS5zZXRTdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIC8vIOWIhumbouihjOeCuiAtIOmBv+WFjemBjuW6puaTgeaToFxuICBwdWJsaWMgc2VwYXJhdGUobGVhZGVyOiBJVW5pdCwgdGFyZ2V0VW5pdDogSVVuaXQsIHVuaXRzOiBJVW5pdFtdKTogSVZlY3RvciB7XG4gICAgY29uc3Qgc3RlZXIgPSBuZXcgVmVjdG9yKHRoaXMucCwgMCwgMCk7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBcbiAgICAvLyDoiIfpoJjlsI7ogIXnmoTliIbpm6JcbiAgICBjb25zdCBkaWZmRnJvbUxlYWRlciA9IFZlY3Rvci5zdWIodGhpcy5wLCB0YXJnZXRVbml0LnBvc2l0aW9uLCBsZWFkZXIucG9zaXRpb24pO1xuICAgIGNvbnN0IGRpc3RGcm9tTGVhZGVyID0gVmVjdG9yLmRpc3QodGFyZ2V0VW5pdC5wb3NpdGlvbiwgbGVhZGVyLnBvc2l0aW9uKTtcbiAgICBpZiAoZGlzdEZyb21MZWFkZXIgPCB0aGlzLmNvbmZpZy5kZXNpcmVkU2VwYXJhdGlvbikge1xuICAgICAgZGlmZkZyb21MZWFkZXIubm9ybWFsaXplKCk7XG4gICAgICBpZiAoZGlzdEZyb21MZWFkZXIgIT09IDApIHtcbiAgICAgICAgZGlmZkZyb21MZWFkZXIuZGl2KGRpc3RGcm9tTGVhZGVyKTtcbiAgICAgIH1cbiAgICAgIHN0ZWVyLmFkZChkaWZmRnJvbUxlYWRlcik7XG4gICAgICBjb3VudCA9IDE7XG4gICAgfVxuICAgIFxuICAgIC8vIOiIh+WFtuS7luWWruS9jeeahOWIhumbolxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QodGFyZ2V0VW5pdC5wb3NpdGlvbiwgdW5pdHNbaV0ucG9zaXRpb24pO1xuICAgICAgaWYgKGRpc3RhbmNlID4gMCAmJiBkaXN0YW5jZSA8IHRoaXMuY29uZmlnLmRlc2lyZWRTZXBhcmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBWZWN0b3Iuc3ViKHRoaXMucCwgdGFyZ2V0VW5pdC5wb3NpdGlvbiwgdW5pdHNbaV0ucG9zaXRpb24pO1xuICAgICAgICBkaWZmLm5vcm1hbGl6ZSgpO1xuICAgICAgICBpZiAoZGlzdGFuY2UgIT09IDApIHtcbiAgICAgICAgICBkaWZmLmRpdihkaXN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RlZXIuYWRkKGRpZmYpO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyDlubPlnYfljJZcbiAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICBzdGVlci5kaXYoY291bnQpO1xuICAgIH1cbiAgICBcbiAgICAvLyDmh4nnlKggUmV5bm9sZHMg5bCO5ZCR5YWs5byPXG4gICAgaWYgKHN0ZWVyLm1hZygpID4gMCkge1xuICAgICAgc3RlZXIubm9ybWFsaXplKCk7XG4gICAgICBzdGVlci5tdWx0KHRhcmdldFVuaXQubWF4U3BlZWQpO1xuICAgICAgc3RlZXIuc3ViKHRhcmdldFVuaXQudmVsb2NpdHkpO1xuICAgICAgc3RlZXIubGltaXQodGFyZ2V0VW5pdC5tYXhGb3JjZSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBzdGVlcjtcbiAgfVxuICBcbiAgLy8g5bCN6b2K6KGM54K6IC0g5pyd5ZCR5bmz5Z2H5pa55ZCRXG4gIHB1YmxpYyBhbGlnbihsZWFkZXI6IElVbml0LCB0YXJnZXRVbml0OiBJVW5pdCwgdW5pdHM6IElVbml0W10pOiBJVmVjdG9yIHtcbiAgICBjb25zdCBzdW0gPSBuZXcgVmVjdG9yKHRoaXMucCwgMCwgMCk7XG4gICAgbGV0IGNvdW50ID0gMTtcbiAgICBcbiAgICAvLyDlpKrpgaDlsLHkuI3lsI3pvYpcbiAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KHRhcmdldFVuaXQucG9zaXRpb24sIGxlYWRlci5wb3NpdGlvbik7XG4gICAgaWYgKGRpc3RhbmNlID4gdGhpcy5jb25maWcubmVpZ2hib3JEaXN0YW5jZSkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCAwLCAwKTtcbiAgICB9XG4gICAgXG4gICAgLy8g5Yqg5YWl6aCY5bCO6ICF55qE5pa55ZCRXG4gICAgaWYgKGxlYWRlci5kaXJlY3Rpb24pIHtcbiAgICAgIHN1bS5hZGQobGVhZGVyLmRpcmVjdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8vIOWKoOWFpemEsOi/keWWruS9jeeahOmAn+W6plxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGQgPSBWZWN0b3IuZGlzdCh0YXJnZXRVbml0LnBvc2l0aW9uLCB1bml0c1tpXS5wb3NpdGlvbik7XG4gICAgICBpZiAoZCA+IDApIHtcbiAgICAgICAgc3VtLmFkZCh1bml0c1tpXS52ZWxvY2l0eSk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN1bS5kaXYoY291bnQpO1xuICAgIHN1bS5ub3JtYWxpemUoKTtcbiAgICBzdW0ubXVsdCh0YXJnZXRVbml0Lm1heFNwZWVkKTtcbiAgICBcbiAgICBjb25zdCBzdGVlciA9IFZlY3Rvci5zdWIodGhpcy5wLCBzdW0sIHRhcmdldFVuaXQudmVsb2NpdHkpO1xuICAgIHN0ZWVyLmxpbWl0KHRhcmdldFVuaXQubWF4Rm9yY2UpO1xuICAgIFxuICAgIHJldHVybiBzdGVlcjtcbiAgfVxuICBcbiAgLy8g5Yed6IGa6KGM54K6IC0g5pyd5ZCR576k6auU5Lit5b+DXG4gIHB1YmxpYyBjb2hlc2lvbihsZWFkZXI6IElVbml0LCB0YXJnZXRVbml0OiBJVW5pdCwgX3VuaXRzOiBJVW5pdFtdKTogSVZlY3RvciB7XG4gICAgY29uc3Qgc3VtID0gbmV3IFZlY3Rvcih0aGlzLnAsIDAsIDApO1xuICAgIFxuICAgIHN1bS5hZGQobGVhZGVyLnBvc2l0aW9uKTtcbiAgICBcbiAgICAvLyDoqLvop6PmjonnmoTpg6jliIbkv53mjIHljp/mqKPvvIzlj6/og73mnInnibnmrornlKjpgJRcbiAgICAvKlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGQgPSBWZWN0b3IuZGlzdCh0YXJnZXRVbml0LnBvc2l0aW9uLCB1bml0c1tpXS5wb3NpdGlvbik7XG4gICAgICBpZiAoZCA+IDApIHtcbiAgICAgICAgc3VtLmFkZCh1bml0c1tpXS5wb3NpdGlvbik7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIHN1bS5kaXYoY291bnQpO1xuICAgICovXG4gICAgXG4gICAgcmV0dXJuIHRhcmdldFVuaXQuc2VlayhzdW0pO1xuICB9XG4gIFxuICAvLyDpgb/pmpzooYzngrogLSDpgb/plovpmpznpJnnialcbiAgcHVibGljIGF2b2lkKHRhcmdldFVuaXQ6IElVbml0LCBvYnN0YWNsZXM6IElPYnN0YWNsZVtdKTogSVZlY3RvciB7XG4gICAgY29uc3Qgc3VtID0gbmV3IFZlY3Rvcih0aGlzLnAsIDAsIDApO1xuICAgIFxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb2JzdGFjbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvYnN0YWNsZSA9IG9ic3RhY2xlc1tqXTtcbiAgICAgIGNvbnN0IGRpc3QgPSBWZWN0b3IuZGlzdChvYnN0YWNsZS5wb3NpdGlvbiwgdGFyZ2V0VW5pdC5wb3NpdGlvbik7XG4gICAgICBjb25zdCB2TGVuZ3RoID0gdGFyZ2V0VW5pdC52ZWxvY2l0eS5tYWcoKSAqIHRoaXMuY29uZmlnLmNvbGxpc2lvblZpc2liaWxpdHlGYWN0b3I7XG4gICAgICBcbiAgICAgIC8vIOmAsuWFpeeisOaSnuWIpOaWt1xuICAgICAgaWYgKCh2TGVuZ3RoICsgb2JzdGFjbGUucmFkaXVzICsgdGFyZ2V0VW5pdC5yKSA+PSBkaXN0KSB7XG4gICAgICAgIGNvbnN0IGEgPSBWZWN0b3Iuc3ViKHRoaXMucCwgb2JzdGFjbGUucG9zaXRpb24sIHRhcmdldFVuaXQucG9zaXRpb24pO1xuICAgICAgICBjb25zdCB2ID0gVmVjdG9yLm11bHQodGhpcy5wLCB0YXJnZXRVbml0LnZlbG9jaXR5LCB0aGlzLmNvbmZpZy5jb2xsaXNpb25WaXNpYmlsaXR5RmFjdG9yKTtcbiAgICAgICAgXG4gICAgICAgIHYubm9ybWFsaXplKCk7XG4gICAgICAgIHYubXVsdChhLm1hZygpKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGIgPSBWZWN0b3Iuc3ViKHRoaXMucCwgdiwgYSk7XG4gICAgICAgIGNvbnN0IHR3b09ialJhZGl1c0FkZGl0aW9uID0gb2JzdGFjbGUucmFkaXVzICsgdGFyZ2V0VW5pdC5yO1xuICAgICAgICBcbiAgICAgICAgLy8g56Kw5pKe6JmV55CGXG4gICAgICAgIGlmIChiLm1hZygpIDw9IHR3b09ialJhZGl1c0FkZGl0aW9uKSB7XG4gICAgICAgICAgaWYgKGIubWFnKCkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIOWmguaenOmHjeeWiu+8jOe1puS4gOWAi+maqOapn+aWueWQkVxuICAgICAgICAgICAgY29uc3QgcmFuZG9tQW5nbGUgPSB0aGlzLnAucmFkaWFucygxMCk7XG4gICAgICAgICAgICBiLnNldChcbiAgICAgICAgICAgICAgdGFyZ2V0VW5pdC52ZWxvY2l0eS54ICogTWF0aC5jb3MocmFuZG9tQW5nbGUpIC0gdGFyZ2V0VW5pdC52ZWxvY2l0eS55ICogTWF0aC5zaW4ocmFuZG9tQW5nbGUpLFxuICAgICAgICAgICAgICB0YXJnZXRVbml0LnZlbG9jaXR5LnggKiBNYXRoLnNpbihyYW5kb21BbmdsZSkgKyB0YXJnZXRVbml0LnZlbG9jaXR5LnkgKiBNYXRoLmNvcyhyYW5kb21BbmdsZSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIChiLm1hZygpIDwgdHdvT2JqUmFkaXVzQWRkaXRpb24pIHtcbiAgICAgICAgICAgIGIubm9ybWFsaXplKCk7XG4gICAgICAgICAgICBiLm11bHQodHdvT2JqUmFkaXVzQWRkaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBzdW0uYWRkKGIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN1bS5saW1pdCh0YXJnZXRVbml0Lm1heEZvcmNlKTtcbiAgICByZXR1cm4gc3VtO1xuICB9XG4gIFxuICAvLyDpgb/plovmlbXkurpcbiAgcHVibGljIGF2b2lkRW5lbWllcyh0YXJnZXRVbml0OiBJVW5pdCwgZW5lbWllczogSVVuaXRbXSk6IElWZWN0b3Ige1xuICAgIC8vIOWwh+aVteS6uuimlueCuuWLleaFi+manOekmeeJqemAsuihjOmBv+manFxuICAgIGNvbnN0IGVuZW15T2JzdGFjbGVzOiBJT2JzdGFjbGVbXSA9IGVuZW1pZXMubWFwKGVuZW15ID0+ICh7XG4gICAgICBpZDogZW5lbXkuaWQsXG4gICAgICBwb3NpdGlvbjogZW5lbXkucG9zaXRpb24sXG4gICAgICByYWRpdXM6IGVuZW15LnIgKiAyLCAvLyDmlbXkurrnmoTpgb/pmpzljYrlvpFcbiAgICAgIGNvbG9yOiB7IHI6IDI1NSwgZzogMCwgYjogMCB9LFxuICAgICAgc3Ryb2tlV2VpZ2h0OiB1bmRlZmluZWQsXG4gICAgICBcbiAgICAgIC8vIOewoeWMlueahOmanOekmeeJqeaWueazleWvpuS9nFxuICAgICAgY2hlY2tDb2xsaXNpb246ICh1bml0OiBJVW5pdCkgPT4gVmVjdG9yLmRpc3QoZW5lbXkucG9zaXRpb24sIHVuaXQucG9zaXRpb24pIDwgKGVuZW15LnIgKyB1bml0LnIpLFxuICAgICAgY2hlY2tDb2xsaXNpb25XaXRoUG9pbnQ6IChwb2ludDogSVZlY3RvcikgPT4gVmVjdG9yLmRpc3QoZW5lbXkucG9zaXRpb24sIHBvaW50KSA8IGVuZW15LnIsXG4gICAgICBjaGVja0NvbGxpc2lvbldpdGhDaXJjbGU6IChjZW50ZXI6IElWZWN0b3IsIHJhZGl1czogbnVtYmVyKSA9PiBWZWN0b3IuZGlzdChlbmVteS5wb3NpdGlvbiwgY2VudGVyKSA8IChlbmVteS5yICsgcmFkaXVzKSxcbiAgICAgIGRpc3RhbmNlVG9Qb2ludDogKHBvaW50OiBJVmVjdG9yKSA9PiBNYXRoLm1heCgwLCBWZWN0b3IuZGlzdChlbmVteS5wb3NpdGlvbiwgcG9pbnQpIC0gZW5lbXkuciksXG4gICAgICBkaXN0YW5jZVRvVW5pdDogKHVuaXQ6IElVbml0KSA9PiBNYXRoLm1heCgwLCBWZWN0b3IuZGlzdChlbmVteS5wb3NpdGlvbiwgdW5pdC5wb3NpdGlvbikgLSBlbmVteS5yIC0gdW5pdC5yKSxcbiAgICAgIGdldEF2b2lkYW5jZUZvcmNlOiAodW5pdDogSVVuaXQpID0+IHtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gVmVjdG9yLnN1Yih0aGlzLnAsIHVuaXQucG9zaXRpb24sIGVuZW15LnBvc2l0aW9uKTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBkaXJlY3Rpb24ubWFnKCk7XG4gICAgICAgIGlmIChkaXN0YW5jZSA9PT0gMCkgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCB0aGlzLnAucmFuZG9tKC0xLCAxKSwgdGhpcy5wLnJhbmRvbSgtMSwgMSkpO1xuICAgICAgICBkaXJlY3Rpb24ubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IGF2b2lkYW5jZVJhZGl1cyA9IGVuZW15LnIgKyB1bml0LnIgKyAyMDtcbiAgICAgICAgaWYgKGRpc3RhbmNlIDwgYXZvaWRhbmNlUmFkaXVzKSB7XG4gICAgICAgICAgY29uc3Qgc3RyZW5ndGggPSAoYXZvaWRhbmNlUmFkaXVzIC0gZGlzdGFuY2UpIC8gYXZvaWRhbmNlUmFkaXVzO1xuICAgICAgICAgIGRpcmVjdGlvbi5tdWx0KHN0cmVuZ3RoICogdW5pdC5tYXhGb3JjZSAqIDIpO1xuICAgICAgICAgIHJldHVybiBkaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCAwLCAwKTtcbiAgICAgIH0sXG4gICAgICBnZXRDbG9zZXN0UG9pbnQ6IChfcG9pbnQ6IElWZWN0b3IpID0+IGVuZW15LnBvc2l0aW9uLmNvcHkoKSxcbiAgICAgIGdldEJvdW5kaW5nQm94OiAoKSA9PiAoe1xuICAgICAgICBsZWZ0OiBlbmVteS5wb3NpdGlvbi54IC0gZW5lbXkucixcbiAgICAgICAgcmlnaHQ6IGVuZW15LnBvc2l0aW9uLnggKyBlbmVteS5yLFxuICAgICAgICB0b3A6IGVuZW15LnBvc2l0aW9uLnkgLSBlbmVteS5yLFxuICAgICAgICBib3R0b206IGVuZW15LnBvc2l0aW9uLnkgKyBlbmVteS5yXG4gICAgICB9KSxcbiAgICAgIHJlbmRlcjogKCkgPT4ge30sXG4gICAgICBpc1BvaW50SW5zaWRlOiAocG9pbnQ6IElWZWN0b3IpID0+IFZlY3Rvci5kaXN0KGVuZW15LnBvc2l0aW9uLCBwb2ludCkgPCBlbmVteS5yLFxuICAgICAgY29weTogKCkgPT4gZW5lbWllc1swXSBhcyBhbnkgLy8g57Ch5YyW5a+m5L2cXG4gICAgfSkpO1xuICAgIFxuICAgIHJldHVybiB0aGlzLmF2b2lkKHRhcmdldFVuaXQsIGVuZW15T2JzdGFjbGVzKTtcbiAgfVxuICBcbiAgLy8g57mq6KO9566t6aCt77yI6Zmk6Yyv55So77yJXG4gIHB1YmxpYyBkcmF3QXJyb3cocDogcDVJbnN0YW5jZSwgYmFzZTogSVZlY3RvciwgdmVjOiBJVmVjdG9yLCBjb2xvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgcC5wdXNoKCk7XG4gICAgcC5zdHJva2UoY29sb3IpO1xuICAgIHAuc3Ryb2tlV2VpZ2h0KDMpO1xuICAgIHAuZmlsbChjb2xvcik7XG4gICAgcC50cmFuc2xhdGUoYmFzZS54LCBiYXNlLnkpO1xuICAgIHAubGluZSgwLCAwLCB2ZWMueCwgdmVjLnkpO1xuICAgIFxuICAgIC8vIOioiOeul+euremgreaWueWQkVxuICAgIGNvbnN0IGhlYWRpbmcgPSBNYXRoLmF0YW4yKHZlYy55LCB2ZWMueCk7XG4gICAgcC5yb3RhdGUoaGVhZGluZyk7XG4gICAgXG4gICAgY29uc3QgYXJyb3dTaXplID0gNztcbiAgICBwLnRyYW5zbGF0ZSh2ZWMubWFnKCkgLSBhcnJvd1NpemUsIDApO1xuICAgIFxuICAgIC8vIOe5quijveeuremgrVxuICAgIHAuYmVnaW5TaGFwZSgpO1xuICAgIHAudmVydGV4KDAsIGFycm93U2l6ZSAvIDIpO1xuICAgIHAudmVydGV4KDAsIC1hcnJvd1NpemUgLyAyKTtcbiAgICBwLnZlcnRleChhcnJvd1NpemUsIDApO1xuICAgIHAuZW5kU2hhcGUoKTtcbiAgICBcbiAgICBwLnBvcCgpO1xuICB9XG4gIFxuICAvLyDphY3nva7mlrnms5VcbiAgcHVibGljIHNldFNlcGFyYXRpb25XZWlnaHQod2VpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5zZXBhcmF0aW9uV2VpZ2h0ID0gd2VpZ2h0O1xuICB9XG4gIFxuICBwdWJsaWMgc2V0QWxpZ25tZW50V2VpZ2h0KHdlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuYWxpZ25tZW50V2VpZ2h0ID0gd2VpZ2h0O1xuICB9XG4gIFxuICBwdWJsaWMgc2V0Q29oZXNpb25XZWlnaHQod2VpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5jb2hlc2lvbldlaWdodCA9IHdlaWdodDtcbiAgfVxuICBcbiAgcHVibGljIHNldEF2b2lkYW5jZVdlaWdodCh3ZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLmF2b2lkYW5jZVdlaWdodCA9IHdlaWdodDtcbiAgfVxuICBcbiAgcHVibGljIHNldERlc2lyZWRTZXBhcmF0aW9uKGRpc3RhbmNlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZy5kZXNpcmVkU2VwYXJhdGlvbiA9IGRpc3RhbmNlO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0TmVpZ2hib3JEaXN0YW5jZShkaXN0YW5jZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcubmVpZ2hib3JEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0Q29sbGlzaW9uVmlzaWJpbGl0eUZhY3RvcihmYWN0b3I6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLmNvbGxpc2lvblZpc2liaWxpdHlGYWN0b3IgPSBmYWN0b3I7XG4gIH1cbiAgXG4gIHB1YmxpYyBlbmFibGVBcnJvd3MoZW5hYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5jb25maWcuc2hvd0Fycm93cyA9IGVuYWJsZTtcbiAgfVxuICBcbiAgLy8g5Y+W5b6X55W25YmN6YWN572uXG4gIHB1YmxpYyBnZXRDb25maWd1cmF0aW9uKCk6IElGbG9ja0NvbmZpZ3VyYXRpb24ge1xuICAgIHJldHVybiB7IC4uLnRoaXMuY29uZmlnIH07XG4gIH1cbiAgXG4gIC8vIOabtOaWsOmFjee9rlxuICBwdWJsaWMgdXBkYXRlQ29uZmlndXJhdGlvbihjb25maWc6IFBhcnRpYWw8SUZsb2NrQ29uZmlndXJhdGlvbj4pOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xuICB9XG59IiwiLy8gR3JvdXBVbml0IOmhnuWIpSAtIOWWruS9jee+pOe1hOeuoeeQhlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGVzL3A1LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJVW5pdCB9IGZyb20gJy4uL2ludGVyZmFjZXMvSVVuaXQnO1xuaW1wb3J0IHsgSUdyb3VwVW5pdCB9IGZyb20gJy4uL2ludGVyZmFjZXMvSUdyb3VwVW5pdCc7XG5pbXBvcnQgeyBJVmVjdG9yIH0gZnJvbSAnLi4vdHlwZXMvdmVjdG9yJztcbmltcG9ydCB7IFVuaXQgfSBmcm9tICcuL1VuaXQnO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi4vdXRpbHMvVmVjdG9yJztcblxuZXhwb3J0IGludGVyZmFjZSBJVGV4dFJlbmRlcmVyIHtcbiAgdGV4dChzdHI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgR3JvdXBVbml0IGltcGxlbWVudHMgSUdyb3VwVW5pdCB7XG4gIHB1YmxpYyByZWFkb25seSBpZDogbnVtYmVyO1xuICBwdWJsaWMgcmVhZG9ubHkgZ3JvdXBJZDogbnVtYmVyO1xuICBcbiAgcHJpdmF0ZSBwOiBwNUluc3RhbmNlO1xuICBwcml2YXRlIHVuaXRPYmpzOiBJVW5pdFtdO1xuICBwcml2YXRlIGxlYWRlcjogSVVuaXQ7XG4gIHByaXZhdGUgZGVzdGluYXRpb246IElWZWN0b3IgfCBudWxsID0gbnVsbDtcbiAgXG4gIGNvbnN0cnVjdG9yKHA6IHA1SW5zdGFuY2UsIGdyb3VwSWQ6IG51bWJlciwgeDogbnVtYmVyID0gMCwgeTogbnVtYmVyID0gMCkge1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5pZCA9IERhdGUubm93KCkgKyBNYXRoLnJhbmRvbSgpOyAvLyDllK/kuIAgSURcbiAgICB0aGlzLmdyb3VwSWQgPSBncm91cElkO1xuICAgIHRoaXMudW5pdE9ianMgPSBbXTtcbiAgICBcbiAgICAvLyDlibXlu7rpoJjlsI7llq7kvY1cbiAgICB0aGlzLmxlYWRlciA9IG5ldyBVbml0KHAsIHgsIHksIGdyb3VwSWQpO1xuICAgIHRoaXMubGVhZGVyLnNldEFzTGVhZGVyKCk7XG4gIH1cbiAgXG4gIC8vIOWOn+acieeahOabtOaWsOaWueazle+8iOS/neeVmeS+m+WQkeW+jOebuOWuue+8iVxuICBwdWJsaWMgdXBkYXRlV2l0aEVuZW1pZXMoZW5lbXlVbml0czogSVVuaXRbXSwgZGVsdGFUaW1lOiBudW1iZXIgPSAxLCBpc1BWUDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgLy8g5pu05paw6aCY5bCO5Zau5L2NXG4gICAgdGhpcy5sZWFkZXIudXBkYXRlKGRlbHRhVGltZSk7XG4gICAgXG4gICAgLy8g5pu05paw5omA5pyJ5Zau5L2NXG4gICAgZm9yIChsZXQgaSA9IHRoaXMudW5pdE9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHVuaXQgPSB0aGlzLnVuaXRPYmpzW2ldO1xuICAgICAgXG4gICAgICAvLyDnp7vpmaTmrbvkuqHllq7kvY1cbiAgICAgIGlmICghdW5pdC5pc0FsaXZlIHx8IHVuaXQuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgdGhpcy51bml0T2Jqcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyDmlLvmk4rnm67mqJnnrqHnkIZcbiAgICAgIHRoaXMubWFuYWdlQXR0YWNrVGFyZ2V0KHVuaXQsIGVuZW15VW5pdHMsIGlzUFZQKTtcbiAgICAgIFxuICAgICAgLy8g5pu05paw5Zau5L2NXG4gICAgICB1bml0LnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSBtYW5hZ2VBdHRhY2tUYXJnZXQodW5pdDogSVVuaXQsIGVuZW15VW5pdHM6IElVbml0W10sIGlzUFZQOiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8g5qqi5p+l54++5pyJ5pS75pOK55uu5qiZ5piv5ZCm5pyJ5pWIXG4gICAgY29uc3QgY3VycmVudFRhcmdldCA9ICh1bml0IGFzIGFueSkuYXR0YWNrVW5pdDtcbiAgICBcbiAgICAvLyDmuIXnkIbnhKHmlYjnm67mqJlcbiAgICBpZiAoY3VycmVudFRhcmdldCkge1xuICAgICAgaWYgKCFjdXJyZW50VGFyZ2V0LmlzQWxpdmUgfHwgY3VycmVudFRhcmdldC5oZWFsdGggPD0gMCkge1xuICAgICAgICAodW5pdCBhcyBhbnkpLmF0dGFja1VuaXQgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5qqi5p+l6Led6Zui5piv5ZCm6YGO6YGgXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QoY3VycmVudFRhcmdldC5wb3NpdGlvbiwgdW5pdC5wb3NpdGlvbik7XG4gICAgICAgIGNvbnN0IHZpc2libGVEaXN0YW5jZSA9ICh1bml0IGFzIGFueSkuYXR0YWNrVmlzaWJsZURpc3RhbmNlIHx8IDEyMDtcbiAgICAgICAgaWYgKGRpc3RhbmNlID4gdmlzaWJsZURpc3RhbmNlIC8gMikge1xuICAgICAgICAgICh1bml0IGFzIGFueSkuYXR0YWNrVW5pdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gUFZQIOaooeW8j+S4i+eahOebruaomeeuoeeQhlxuICAgIGlmICghaXNQVlAgJiYgKHVuaXQgYXMgYW55KS5hdHRhY2tVbml0KSB7XG4gICAgICAodW5pdCBhcyBhbnkpLmF0dGFja1VuaXQgPSBudWxsO1xuICAgICAgdW5pdC5zZXRGb2xsb3coKTtcbiAgICB9XG4gICAgXG4gICAgLy8g5ZyoIFBWUCDmqKHlvI/kuIvlsIvmib7mlrDnm67mqJlcbiAgICBpZiAoISh1bml0IGFzIGFueSkuYXR0YWNrVW5pdCAmJiBpc1BWUCkge1xuICAgICAgdGhpcy5maW5kTmV3VGFyZ2V0KHVuaXQsIGVuZW15VW5pdHMpO1xuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSBmaW5kTmV3VGFyZ2V0KHVuaXQ6IElVbml0LCBlbmVteVVuaXRzOiBJVW5pdFtdKTogdm9pZCB7XG4gICAgbGV0IG1pbkRpc3RhbmNlID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICBsZXQgY2xvc2VzdEVuZW15OiBJVW5pdCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHZpc2libGVEaXN0YW5jZSA9ICh1bml0IGFzIGFueSkuYXR0YWNrVmlzaWJsZURpc3RhbmNlIHx8IDEyMDtcbiAgICBcbiAgICBmb3IgKGNvbnN0IGVuZW15IG9mIGVuZW15VW5pdHMpIHtcbiAgICAgIGlmIChlbmVteS5pc0FsaXZlICYmIGVuZW15LmhlYWx0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBWZWN0b3IuZGlzdChlbmVteS5wb3NpdGlvbiwgdW5pdC5wb3NpdGlvbik7XG4gICAgICAgIFxuICAgICAgICBpZiAoZGlzdGFuY2UgPCB2aXNpYmxlRGlzdGFuY2UgJiYgZGlzdGFuY2UgPCBtaW5EaXN0YW5jZSkge1xuICAgICAgICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgY2xvc2VzdEVuZW15ID0gZW5lbXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKGNsb3Nlc3RFbmVteSkge1xuICAgICAgdW5pdC5zZXRBdHRhY2soY2xvc2VzdEVuZW15KTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOiIiueJiOacrOeahCByZW5kZXIg5pa55rOV77yI5ZCR5b6M55u45a6577yJXG4gIHB1YmxpYyByZW5kZXJXaXRoVGV4dChwOiBwNUluc3RhbmNlLCB0ZXh0UmVuZGVyZXI/OiBJVGV4dFJlbmRlcmVyKTogdm9pZCB7XG4gICAgLy8g5L2/55So5paw55qEIHJlbmRlciDmlrnms5VcbiAgICB0aGlzLnJlbmRlcihwKTtcbiAgICBcbiAgICAvLyDlpoLmnpzpnIDopoHmloflrZfmuLLmn5NcbiAgICBpZiAodGV4dFJlbmRlcmVyKSB7XG4gICAgICB0ZXh0UmVuZGVyZXIudGV4dCh0aGlzLmdyb3VwSWQudG9TdHJpbmcoKSwgdGhpcy5sZWFkZXIucG9zaXRpb24ueCArIDEwLCB0aGlzLmxlYWRlci5wb3NpdGlvbi55KTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBzZXREZXN0aW5hdGlvbih0YXJnZXQ6IElWZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gdGFyZ2V0O1xuICAgIFxuICAgIC8vIOioreWumumgmOWwjuWWruS9jeebruaomVxuICAgIHRoaXMubGVhZGVyLnNldERlc3RpbmF0aW9uKHRhcmdldCk7XG4gICAgXG4gICAgLy8g6Kit5a6a5omA5pyJ6Z2e5pS75pOK54uA5oWL55qE5Zau5L2N54K66Lef6Zqo5qih5byPXG4gICAgZm9yIChjb25zdCB1bml0IG9mIHRoaXMudW5pdE9ianMpIHtcbiAgICAgIGlmICghdW5pdC5pc0F0dGFja2luZygpKSB7XG4gICAgICAgIHVuaXQuc2V0Rm9sbG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VW5pdCA9IG5ldyBVbml0KHRoaXMucCwgeCwgeSwgdGhpcy5ncm91cElkKTtcbiAgICBuZXdVbml0LnNldEZvbGxvdygpO1xuICAgIHRoaXMudW5pdE9ianMucHVzaChuZXdVbml0KTtcbiAgfVxuICBcbiAgLy8gSUdyb3VwVW5pdCDku4vpnaLlr6bkvZxcbiAgcHVibGljIGFkZFVuaXQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBJVW5pdCB7XG4gICAgY29uc3QgbmV3VW5pdCA9IG5ldyBVbml0KHRoaXMucCwgeCwgeSwgdGhpcy5ncm91cElkKTtcbiAgICBuZXdVbml0LnNldEZvbGxvdygpO1xuICAgIHRoaXMudW5pdE9ianMucHVzaChuZXdVbml0KTtcbiAgICByZXR1cm4gbmV3VW5pdDtcbiAgfVxuICBcbiAgcHVibGljIGdldERlc3RpbmF0aW9uKCk6IElWZWN0b3IgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbjtcbiAgfVxuICBcbiAgcHVibGljIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIOabtOaWsOmgmOWwjuWWruS9jVxuICAgIHRoaXMubGVhZGVyLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgIFxuICAgIC8vIOabtOaWsOaJgOacieWWruS9jVxuICAgIGZvciAobGV0IGkgPSB0aGlzLnVuaXRPYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCB1bml0ID0gdGhpcy51bml0T2Jqc1tpXTtcbiAgICAgIFxuICAgICAgLy8g56e76Zmk5q275Lqh5Zau5L2NXG4gICAgICBpZiAoIXVuaXQuaXNBbGl2ZSB8fCB1bml0LmhlYWx0aCA8PSAwKSB7XG4gICAgICAgIHRoaXMudW5pdE9ianMuc3BsaWNlKGksIDEpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8g5pu05paw5Zau5L2NXG4gICAgICB1bml0LnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHJlbmRlcihwOiBwNUluc3RhbmNlKTogdm9pZCB7XG4gICAgLy8g5riy5p+T6aCY5bCO5Zau5L2NXG4gICAgdGhpcy5sZWFkZXIucmVuZGVyKHApO1xuICAgIFxuICAgIC8vIOa4suafk+aJgOacieWWruS9jVxuICAgIGZvciAoY29uc3QgdW5pdCBvZiB0aGlzLnVuaXRPYmpzKSB7XG4gICAgICB1bml0LnJlbmRlcihwKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0FjdGl2ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sZWFkZXIuaXNBbGl2ZTtcbiAgfVxuICBcbiAgcHVibGljIGdldEF2ZXJhZ2VQb3NpdGlvbigpOiBJVmVjdG9yIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHcm91cENlbnRlcigpO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IHsgbWluOiBJVmVjdG9yOyBtYXg6IElWZWN0b3IgfSB7XG4gICAgaWYgKHRoaXMudW5pdE9ianMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLmxlYWRlci5wb3NpdGlvbjtcbiAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMubGVhZGVyLnI7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtaW46IG5ldyBWZWN0b3IodGhpcy5wLCBwb3MueCAtIHJhZGl1cywgcG9zLnkgLSByYWRpdXMpLFxuICAgICAgICBtYXg6IG5ldyBWZWN0b3IodGhpcy5wLCBwb3MueCArIHJhZGl1cywgcG9zLnkgKyByYWRpdXMpXG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBhbGxVbml0cyA9IFt0aGlzLmxlYWRlciwgLi4udGhpcy51bml0T2Jqc107XG4gICAgbGV0IG1pblggPSBJbmZpbml0eSwgbWluWSA9IEluZmluaXR5O1xuICAgIGxldCBtYXhYID0gLUluZmluaXR5LCBtYXhZID0gLUluZmluaXR5O1xuICAgIFxuICAgIGZvciAoY29uc3QgdW5pdCBvZiBhbGxVbml0cykge1xuICAgICAgY29uc3QgcmFkaXVzID0gdW5pdC5yO1xuICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIHVuaXQucG9zaXRpb24ueCAtIHJhZGl1cyk7XG4gICAgICBtaW5ZID0gTWF0aC5taW4obWluWSwgdW5pdC5wb3NpdGlvbi55IC0gcmFkaXVzKTtcbiAgICAgIG1heFggPSBNYXRoLm1heChtYXhYLCB1bml0LnBvc2l0aW9uLnggKyByYWRpdXMpO1xuICAgICAgbWF4WSA9IE1hdGgubWF4KG1heFksIHVuaXQucG9zaXRpb24ueSArIHJhZGl1cyk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBtaW46IG5ldyBWZWN0b3IodGhpcy5wLCBtaW5YLCBtaW5ZKSxcbiAgICAgIG1heDogbmV3IFZlY3Rvcih0aGlzLnAsIG1heFgsIG1heFkpXG4gICAgfTtcbiAgfVxuICBcbiAgcHVibGljIGdldFRvdGFsSGVhbHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudW5pdE9ianMucmVkdWNlKChzdW0sIHVuaXQpID0+IHN1bSArIHVuaXQuaGVhbHRoLCB0aGlzLmxlYWRlci5oZWFsdGgpO1xuICB9XG4gIFxuICAvLyDnjbLlj5bmlrnms5VcbiAgcHVibGljIGdldExlYWRlcigpOiBJVW5pdCB7XG4gICAgcmV0dXJuIHRoaXMubGVhZGVyO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0VW5pdHMoKTogSVVuaXRbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLnVuaXRPYmpzXTsgLy8g5Zue5YKz5Ymv5pys6YG/5YWN5aSW6YOo5L+u5pS5XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRBbGxVbml0cygpOiBJVW5pdFtdIHtcbiAgICByZXR1cm4gW3RoaXMubGVhZGVyLCAuLi50aGlzLnVuaXRPYmpzXTtcbiAgfVxuICBcbiAgcHVibGljIGdldFVuaXRDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaXRPYmpzLmxlbmd0aDtcbiAgfVxuICBcbiAgcHVibGljIGdldFRvdGFsVW5pdENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudW5pdE9ianMubGVuZ3RoICsgMTsgLy8g5YyF5ZCrIGxlYWRlclxuICB9XG4gIFxuICBwdWJsaWMgZ2V0R3JvdXBJZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdyb3VwSWQ7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRBbGl2ZVVuaXRzKCk6IElVbml0W10ge1xuICAgIHJldHVybiB0aGlzLnVuaXRPYmpzLmZpbHRlcih1bml0ID0+IHVuaXQuaXNBbGl2ZSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXREZWFkVW5pdHMoKTogSVVuaXRbXSB7XG4gICAgcmV0dXJuIHRoaXMudW5pdE9ianMuZmlsdGVyKHVuaXQgPT4gIXVuaXQuaXNBbGl2ZSk7XG4gIH1cbiAgXG4gIC8vIOe+pOe1hOeLgOaFi+euoeeQhlxuICBwdWJsaWMgc2V0R3JvdXBGb2xsb3coKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB1bml0IG9mIHRoaXMudW5pdE9ianMpIHtcbiAgICAgIGlmICghdW5pdC5pc0F0dGFja2luZygpKSB7XG4gICAgICAgIHVuaXQuc2V0Rm9sbG93KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgc2V0R3JvdXBTdG9wKCk6IHZvaWQge1xuICAgIHRoaXMubGVhZGVyLnNldFN0b3AoKTtcbiAgICBmb3IgKGNvbnN0IHVuaXQgb2YgdGhpcy51bml0T2Jqcykge1xuICAgICAgdW5pdC5zZXRTdG9wKCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDnp7vpmaTllq7kvY1cbiAgcHVibGljIHJlbW92ZVVuaXQodW5pdDogSVVuaXQpOiBib29sZWFuIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMudW5pdE9ianMuaW5kZXhPZih1bml0KTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLnVuaXRPYmpzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFxuICBwdWJsaWMgcmVtb3ZlVW5pdEJ5SWQoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy51bml0T2Jqcy5maW5kSW5kZXgodW5pdCA9PiB1bml0LmlkID09PSBpZCk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy51bml0T2Jqcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBcbiAgcHVibGljIHJlbW92ZURlYWRVbml0cygpOiBudW1iZXIge1xuICAgIGNvbnN0IGluaXRpYWxDb3VudCA9IHRoaXMudW5pdE9ianMubGVuZ3RoO1xuICAgIHRoaXMudW5pdE9ianMgPSB0aGlzLnVuaXRPYmpzLmZpbHRlcih1bml0ID0+IHVuaXQuaXNBbGl2ZSk7XG4gICAgcmV0dXJuIGluaXRpYWxDb3VudCAtIHRoaXMudW5pdE9ianMubGVuZ3RoO1xuICB9XG4gIFxuICAvLyDnvqTntYTntbHoqIhcbiAgcHVibGljIGdldEF2ZXJhZ2VIZWFsdGgoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy51bml0T2Jqcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLmxlYWRlci5oZWFsdGg7XG4gICAgXG4gICAgY29uc3QgdG90YWxIZWFsdGggPSB0aGlzLnVuaXRPYmpzLnJlZHVjZSgoc3VtLCB1bml0KSA9PiBzdW0gKyB1bml0LmhlYWx0aCwgdGhpcy5sZWFkZXIuaGVhbHRoKTtcbiAgICByZXR1cm4gdG90YWxIZWFsdGggLyAodGhpcy51bml0T2Jqcy5sZW5ndGggKyAxKTtcbiAgfVxuICBcbiAgcHVibGljIGdldEdyb3VwQ2VudGVyKCk6IElWZWN0b3Ige1xuICAgIGlmICh0aGlzLnVuaXRPYmpzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMubGVhZGVyLnBvc2l0aW9uLmNvcHkoKTtcbiAgICB9XG4gICAgXG4gICAgbGV0IHRvdGFsWCA9IHRoaXMubGVhZGVyLnBvc2l0aW9uLng7XG4gICAgbGV0IHRvdGFsWSA9IHRoaXMubGVhZGVyLnBvc2l0aW9uLnk7XG4gICAgXG4gICAgZm9yIChjb25zdCB1bml0IG9mIHRoaXMudW5pdE9ianMpIHtcbiAgICAgIHRvdGFsWCArPSB1bml0LnBvc2l0aW9uLng7XG4gICAgICB0b3RhbFkgKz0gdW5pdC5wb3NpdGlvbi55O1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBjb3VudCA9IHRoaXMudW5pdE9ianMubGVuZ3RoICsgMTtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnAsIHRvdGFsWCAvIGNvdW50LCB0b3RhbFkgLyBjb3VudCk7XG4gIH1cbiAgXG4gIC8vIOe+pOe1hOihjOeCuuaOp+WItlxuICBwdWJsaWMgaXNHcm91cElkbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGVhZGVyLnN0YXRlID09PSAnc3RvcCcgJiYgdGhpcy51bml0T2Jqcy5ldmVyeSh1bml0ID0+IFxuICAgICAgdW5pdC5zdGF0ZSA9PT0gJ3N0b3AnIHx8IHVuaXQuc3RhdGUgPT09ICdmb2xsb3cnXG4gICAgKTtcbiAgfVxuICBcbiAgcHVibGljIGhhc0F0dGFja2luZ1VuaXRzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnVuaXRPYmpzLnNvbWUodW5pdCA9PiB1bml0LmlzQXR0YWNraW5nKCkpO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0QXR0YWNraW5nVW5pdHMoKTogSVVuaXRbXSB7XG4gICAgcmV0dXJuIHRoaXMudW5pdE9ianMuZmlsdGVyKHVuaXQgPT4gdW5pdC5pc0F0dGFja2luZygpKTtcbiAgfVxuICBcbiAgcHVibGljIGdldEZvbGxvd2luZ1VuaXRzKCk6IElVbml0W10ge1xuICAgIHJldHVybiB0aGlzLnVuaXRPYmpzLmZpbHRlcih1bml0ID0+IHVuaXQuaXNGb2xsb3coKSk7XG4gIH1cbn0iLCIvLyBPYnN0YWNsZSDpoZ7liKUgLSDpmpznpJnnianlr6bpq5Rcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBlcy9wNS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgSU9ic3RhY2xlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JT2JzdGFjbGUnO1xuaW1wb3J0IHsgSVVuaXQgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lVbml0JztcbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuaW1wb3J0IHsgQ29sb3IsIEJvdW5kaW5nQm94IH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4uL3V0aWxzL1ZlY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBPYnN0YWNsZSBpbXBsZW1lbnRzIElPYnN0YWNsZSB7XG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xuICBwdWJsaWMgcG9zaXRpb246IElWZWN0b3I7XG4gIHB1YmxpYyByYWRpdXM6IG51bWJlcjtcbiAgcHVibGljIGNvbG9yOiBDb2xvcjtcbiAgcHVibGljIHN0cm9rZUNvbG9yPzogQ29sb3I7XG4gIHB1YmxpYyBzdHJva2VXZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgXG4gIHByaXZhdGUgcDogcDVJbnN0YW5jZTtcbiAgXG4gIGNvbnN0cnVjdG9yKHA6IHA1SW5zdGFuY2UsIHg6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcikge1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5pZCA9IGBvYnN0YWNsZV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocCwgeCwgeSk7XG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgXG4gICAgLy8g6aCQ6Kit6aGP6ImyXG4gICAgdGhpcy5jb2xvciA9IHsgcjogMTI3LCBnOiAxMjcsIGI6IDEyNyB9O1xuICAgIHRoaXMuc3Ryb2tlQ29sb3IgPSB7IHI6IDI1NSwgZzogMCwgYjogMCB9OyAvLyDntIXoibLpgormoYZcbiAgICB0aGlzLnN0cm9rZVdlaWdodCA9IDE7XG4gIH1cbiAgXG4gIC8vIOeisOaSnuaqoua4rFxuICBwdWJsaWMgY2hlY2tDb2xsaXNpb24odW5pdDogSVVuaXQpOiBib29sZWFuIHtcbiAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KHVuaXQucG9zaXRpb24sIHRoaXMucG9zaXRpb24pO1xuICAgIHJldHVybiBkaXN0YW5jZSA8ICh0aGlzLnJhZGl1cyAvIDIgKyB1bml0LnIpOyAvLyByYWRpdXMg5piv55u05b6R77yM5omA5Lul6Zmk5LulIDJcbiAgfVxuICBcbiAgcHVibGljIGNoZWNrQ29sbGlzaW9uV2l0aFBvaW50KHBvaW50OiBJVmVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGlzdGFuY2UgPSBWZWN0b3IuZGlzdChwb2ludCwgdGhpcy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDwgdGhpcy5yYWRpdXMgLyAyO1xuICB9XG4gIFxuICBwdWJsaWMgY2hlY2tDb2xsaXNpb25XaXRoQ2lyY2xlKGNlbnRlcjogSVZlY3RvciwgcmFkaXVzOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KGNlbnRlciwgdGhpcy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDwgKHRoaXMucmFkaXVzIC8gMiArIHJhZGl1cyk7XG4gIH1cbiAgXG4gIC8vIOi3nembouioiOeul1xuICBwdWJsaWMgZGlzdGFuY2VUb1BvaW50KHBvaW50OiBJVmVjdG9yKTogbnVtYmVyIHtcbiAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KHBvaW50LCB0aGlzLnBvc2l0aW9uKTtcbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgZGlzdGFuY2UgLSB0aGlzLnJhZGl1cyAvIDIpO1xuICB9XG4gIFxuICBwdWJsaWMgZGlzdGFuY2VUb1VuaXQodW5pdDogSVVuaXQpOiBudW1iZXIge1xuICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QodW5pdC5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIGRpc3RhbmNlIC0gdGhpcy5yYWRpdXMgLyAyIC0gdW5pdC5yKTtcbiAgfVxuICBcbiAgLy8g6YG/6Zqc6KiI566XXG4gIHB1YmxpYyBnZXRBdm9pZGFuY2VGb3JjZSh1bml0OiBJVW5pdCk6IElWZWN0b3Ige1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IFZlY3Rvci5zdWIodGhpcy5wLCB1bml0LnBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IGRpcmVjdGlvbi5tYWcoKTtcbiAgICBcbiAgICBpZiAoZGlzdGFuY2UgPT09IDApIHtcbiAgICAgIC8vIOWmguaenOS9jee9rumHjeeWiu+8jOe1puS4gOWAi+maqOapn+aWueWQkVxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCB0aGlzLnAucmFuZG9tKC0xLCAxKSwgdGhpcy5wLnJhbmRvbSgtMSwgMSkpO1xuICAgIH1cbiAgICBcbiAgICBkaXJlY3Rpb24ubm9ybWFsaXplKCk7XG4gICAgXG4gICAgLy8g6YG/6Zqc5Yqb5bqm6IiH6Led6Zui5oiQ5Y+N5q+UXG4gICAgY29uc3QgYXZvaWRhbmNlUmFkaXVzID0gdGhpcy5yYWRpdXMgLyAyICsgdW5pdC5yICsgMjA7IC8vIOmhjeWklueahOWuieWFqOi3nembolxuICAgIGlmIChkaXN0YW5jZSA8IGF2b2lkYW5jZVJhZGl1cykge1xuICAgICAgY29uc3Qgc3RyZW5ndGggPSAoYXZvaWRhbmNlUmFkaXVzIC0gZGlzdGFuY2UpIC8gYXZvaWRhbmNlUmFkaXVzO1xuICAgICAgZGlyZWN0aW9uLm11bHQoc3RyZW5ndGggKiB1bml0Lm1heEZvcmNlICogMik7IC8vIOS5mOS7pSAyIOWinuW8t+mBv+manOWKm+W6plxuICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCAwLCAwKTtcbiAgfVxuICBcbiAgcHVibGljIGdldENsb3Nlc3RQb2ludChwb2ludDogSVZlY3Rvcik6IElWZWN0b3Ige1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IFZlY3Rvci5zdWIodGhpcy5wLCBwb2ludCwgdGhpcy5wb3NpdGlvbik7XG4gICAgY29uc3QgZGlzdGFuY2UgPSBkaXJlY3Rpb24ubWFnKCk7XG4gICAgXG4gICAgaWYgKGRpc3RhbmNlIDw9IHRoaXMucmFkaXVzIC8gMikge1xuICAgICAgLy8g6bue5Zyo5ZyT5YWn77yM5Zue5YKz5ZyT5b+DXG4gICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XG4gICAgfVxuICAgIFxuICAgIC8vIOm7nuWcqOWck+Wklu+8jOWbnuWCs+Wck+WRqOS4iuacgOi/keeahOm7nlxuICAgIGRpcmVjdGlvbi5ub3JtYWxpemUoKTtcbiAgICBkaXJlY3Rpb24ubXVsdCh0aGlzLnJhZGl1cyAvIDIpO1xuICAgIHJldHVybiBWZWN0b3IuYWRkKHRoaXMucCwgdGhpcy5wb3NpdGlvbiwgZGlyZWN0aW9uKTtcbiAgfVxuICBcbiAgLy8g6YKK55WM5qGGXG4gIHB1YmxpYyBnZXRCb3VuZGluZ0JveCgpOiBCb3VuZGluZ0JveCB7XG4gICAgY29uc3QgaGFsZlJhZGl1cyA9IHRoaXMucmFkaXVzIC8gMjtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogdGhpcy5wb3NpdGlvbi54IC0gaGFsZlJhZGl1cyxcbiAgICAgIHJpZ2h0OiB0aGlzLnBvc2l0aW9uLnggKyBoYWxmUmFkaXVzLFxuICAgICAgdG9wOiB0aGlzLnBvc2l0aW9uLnkgLSBoYWxmUmFkaXVzLFxuICAgICAgYm90dG9tOiB0aGlzLnBvc2l0aW9uLnkgKyBoYWxmUmFkaXVzXG4gICAgfTtcbiAgfVxuICBcbiAgLy8g5riy5p+TXG4gIHB1YmxpYyByZW5kZXIocDogcDVJbnN0YW5jZSk6IHZvaWQge1xuICAgIHAucHVzaCgpO1xuICAgIFxuICAgIC8vIOioreWumuWhq+WFhemhj+iJslxuICAgIHAuZmlsbCh0aGlzLmNvbG9yLnIsIHRoaXMuY29sb3IuZywgdGhpcy5jb2xvci5iLCB0aGlzLmNvbG9yLmEgfHwgMjU1KTtcbiAgICBcbiAgICAvLyDoqK3lrprpgormoYZcbiAgICBpZiAodGhpcy5zdHJva2VDb2xvcikge1xuICAgICAgcC5zdHJva2UodGhpcy5zdHJva2VDb2xvci5yLCB0aGlzLnN0cm9rZUNvbG9yLmcsIHRoaXMuc3Ryb2tlQ29sb3IuYiwgdGhpcy5zdHJva2VDb2xvci5hIHx8IDI1NSk7XG4gICAgICBpZiAodGhpcy5zdHJva2VXZWlnaHQpIHtcbiAgICAgICAgcC5zdHJva2VXZWlnaHQodGhpcy5zdHJva2VXZWlnaHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwLm5vU3Ryb2tlKCk7XG4gICAgfVxuICAgIFxuICAgIC8vIOe5quijveWck+W9oumanOekmeeJqVxuICAgIHAuY2lyY2xlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55LCB0aGlzLnJhZGl1cyk7XG4gICAgXG4gICAgcC5wb3AoKTtcbiAgfVxuICBcbiAgLy8g5bel5YW35pa55rOVXG4gIHB1YmxpYyBpc1BvaW50SW5zaWRlKHBvaW50OiBJVmVjdG9yKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2tDb2xsaXNpb25XaXRoUG9pbnQocG9pbnQpO1xuICB9XG4gIFxuICBwdWJsaWMgY29weSgpOiBJT2JzdGFjbGUge1xuICAgIGNvbnN0IG5ld09ic3RhY2xlID0gbmV3IE9ic3RhY2xlKHRoaXMucCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMucmFkaXVzKTtcbiAgICBuZXdPYnN0YWNsZS5jb2xvciA9IHsgLi4udGhpcy5jb2xvciB9O1xuICAgIGlmICh0aGlzLnN0cm9rZUNvbG9yKSB7XG4gICAgICBuZXdPYnN0YWNsZS5zdHJva2VDb2xvciA9IHsgLi4udGhpcy5zdHJva2VDb2xvciB9O1xuICAgIH1cbiAgICBuZXdPYnN0YWNsZS5zdHJva2VXZWlnaHQgPSB0aGlzLnN0cm9rZVdlaWdodDtcbiAgICByZXR1cm4gbmV3T2JzdGFjbGU7XG4gIH1cbiAgXG4gIC8vIOioreWumuaWueazlVxuICBwdWJsaWMgc2V0Q29sb3IoY29sb3I6IENvbG9yKTogdm9pZCB7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0U3Ryb2tlKGNvbG9yOiBDb2xvciwgd2VpZ2h0PzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zdHJva2VDb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuc3Ryb2tlV2VpZ2h0ID0gd2VpZ2h0O1xuICB9XG4gIFxuICBwdWJsaWMgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnBvc2l0aW9uLnNldCh4LCB5KTtcbiAgfVxuICBcbiAgcHVibGljIHNldFJhZGl1cyhyYWRpdXM6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucmFkaXVzID0gTWF0aC5tYXgoMCwgcmFkaXVzKTtcbiAgfVxufSIsIi8vIFBhdHJvbCAtIOW3oemCj+ezu+e1se+8jOeuoeeQhue+pOe1hOWWruS9jeeahOi3r+W+keW3oemCj+ihjOeCulxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGVzL3A1LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJUGF0cm9sLCBJUGF0cm9sUG9pbnQsIElQYXRyb2xHcm91cFVuaXQgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lQYXRyb2wnO1xuaW1wb3J0IHsgSUdyb3VwVW5pdCB9IGZyb20gJy4uL2ludGVyZmFjZXMvSUdyb3VwVW5pdCc7XG5pbXBvcnQgeyBJVmVjdG9yIH0gZnJvbSAnLi4vdHlwZXMvdmVjdG9yJztcbmltcG9ydCB7IFZlY3RvciB9IGZyb20gJy4uL3V0aWxzL1ZlY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBQYXRyb2xQb2ludCBpbXBsZW1lbnRzIElQYXRyb2xQb2ludCB7XG4gIHB1YmxpYyBwb3NpdGlvbjogSVZlY3RvcjtcbiAgcHVibGljIHRpbWU6IG51bWJlcjtcbiAgXG4gIGNvbnN0cnVjdG9yKHA6IHA1SW5zdGFuY2UsIHg6IG51bWJlciwgeTogbnVtYmVyLCB0aW1lOiBudW1iZXIpIHtcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcihwLCB4LCB5KTtcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXRyb2xHcm91cFVuaXQgaW1wbGVtZW50cyBJUGF0cm9sR3JvdXBVbml0IHtcbiAgcHVibGljIGdyb3VwVW5pdDogSUdyb3VwVW5pdDtcbiAgcHVibGljIGxhc3RUaW1lOiBudW1iZXI7XG4gIHB1YmxpYyBub3dJbmRleDogbnVtYmVyO1xuICBwdWJsaWMgY3JlYXRlWDogbnVtYmVyO1xuICBwdWJsaWMgY3JlYXRlWTogbnVtYmVyO1xuICBcbiAgY29uc3RydWN0b3IoZ3JvdXBVbml0OiBJR3JvdXBVbml0LCBpbmRleDogbnVtYmVyLCBjcmVhdGVYOiBudW1iZXIsIGNyZWF0ZVk6IG51bWJlcikge1xuICAgIHRoaXMuZ3JvdXBVbml0ID0gZ3JvdXBVbml0O1xuICAgIHRoaXMubGFzdFRpbWUgPSAwO1xuICAgIHRoaXMubm93SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLmNyZWF0ZVggPSBjcmVhdGVYO1xuICAgIHRoaXMuY3JlYXRlWSA9IGNyZWF0ZVk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhdHJvbCBpbXBsZW1lbnRzIElQYXRyb2wge1xuICBwdWJsaWMgcGF0cm9sUG9pbnRzOiBJUGF0cm9sUG9pbnRbXSA9IFtdO1xuICBwdWJsaWMgcGF0cm9sR3JvdXBVbml0czogSVBhdHJvbEdyb3VwVW5pdFtdID0gW107XG4gIFxuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIHByaXZhdGUgYWN0aXZlOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBtYXhVbml0c1Blckdyb3VwOiBudW1iZXIgPSAxMDA7XG4gIHByaXZhdGUgdW5pdHNBZGRlZFBlckN5Y2xlOiBudW1iZXIgPSAyMDtcbiAgXG4gIGNvbnN0cnVjdG9yKHA6IHA1SW5zdGFuY2UpIHtcbiAgICB0aGlzLnAgPSBwO1xuICB9XG4gIFxuICAvLyDmt7vliqDlt6Hpgo/pu55cbiAgcHVibGljIGFkZFBvaW50KHg6IG51bWJlciwgeTogbnVtYmVyLCB0aW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBwb2ludCA9IG5ldyBQYXRyb2xQb2ludCh0aGlzLnAsIHgsIHksIHRpbWUpO1xuICAgIHRoaXMucGF0cm9sUG9pbnRzLnB1c2gocG9pbnQpO1xuICB9XG4gIFxuICAvLyDmt7vliqDnvqTntYTllq7kvY3liLDlt6Hpgo/ns7vntbFcbiAgcHVibGljIGFkZEdyb3VwVW5pdChncm91cFVuaXQ6IElHcm91cFVuaXQsIGluZGV4OiBudW1iZXIsIGNyZWF0ZVg6IG51bWJlciwgY3JlYXRlWTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgcGF0cm9sR3JvdXBVbml0ID0gbmV3IFBhdHJvbEdyb3VwVW5pdChncm91cFVuaXQsIGluZGV4LCBjcmVhdGVYLCBjcmVhdGVZKTtcbiAgICB0aGlzLnBhdHJvbEdyb3VwVW5pdHMucHVzaChwYXRyb2xHcm91cFVuaXQpO1xuICB9XG4gIFxuICAvLyDmm7TmlrDlt6Hpgo/pgo/ovK9cbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlIHx8IHRoaXMucGF0cm9sUG9pbnRzLmxlbmd0aCA9PT0gMCB8fCB0aGlzLnBhdHJvbEdyb3VwVW5pdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIGZvciAoY29uc3QgcEdyb3VwVW5pdCBvZiB0aGlzLnBhdHJvbEdyb3VwVW5pdHMpIHtcbiAgICAgIHBHcm91cFVuaXQubGFzdFRpbWUtLTtcbiAgICAgIFxuICAgICAgaWYgKHBHcm91cFVuaXQubGFzdFRpbWUgPD0gMCkge1xuICAgICAgICAvLyDnp7vli5XliLDkuIvkuIDlgIvlt6Hpgo/pu55cbiAgICAgICAgcEdyb3VwVW5pdC5ub3dJbmRleCsrO1xuICAgICAgICBpZiAocEdyb3VwVW5pdC5ub3dJbmRleCA+PSB0aGlzLnBhdHJvbFBvaW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBwR3JvdXBVbml0Lm5vd0luZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6Kit5a6a5paw55qE55uu5qiZ6bue5ZKM5pmC6ZaTXG4gICAgICAgIGNvbnN0IHRhcmdldFBvaW50ID0gdGhpcy5wYXRyb2xQb2ludHNbcEdyb3VwVW5pdC5ub3dJbmRleF07XG4gICAgICAgIHBHcm91cFVuaXQubGFzdFRpbWUgPSB0YXJnZXRQb2ludC50aW1lO1xuICAgICAgICBwR3JvdXBVbml0Lmdyb3VwVW5pdC5zZXREZXN0aW5hdGlvbih0YXJnZXRQb2ludC5wb3NpdGlvbik7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDmlbXkurrllq7kvY1cbiAgICAgICAgdGhpcy5zcGF3bkVuZW15VW5pdHMocEdyb3VwVW5pdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICAvLyDnlJ/miJDmlbXkurrllq7kvY1cbiAgcHJpdmF0ZSBzcGF3bkVuZW15VW5pdHMocEdyb3VwVW5pdDogSVBhdHJvbEdyb3VwVW5pdCk6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRVbml0Q291bnQgPSBwR3JvdXBVbml0Lmdyb3VwVW5pdC5nZXRVbml0cygpLmxlbmd0aDtcbiAgICBsZXQgdW5pdHNUb0FkZCA9IHRoaXMubWF4VW5pdHNQZXJHcm91cCAtIGN1cnJlbnRVbml0Q291bnQ7XG4gICAgXG4gICAgaWYgKHVuaXRzVG9BZGQgPiB0aGlzLnVuaXRzQWRkZWRQZXJDeWNsZSkge1xuICAgICAgdW5pdHNUb0FkZCA9IHRoaXMudW5pdHNBZGRlZFBlckN5Y2xlO1xuICAgIH1cbiAgICBcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHVuaXRzVG9BZGQ7IGorKykge1xuICAgICAgLy8g6Zqo5qmf6YG45pOH5beh6YKP6bue5L2N572u55Sf5oiQ5Zau5L2NXG4gICAgICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMucGF0cm9sUG9pbnRzLmxlbmd0aCk7XG4gICAgICBjb25zdCBzcGF3blBvaW50ID0gdGhpcy5wYXRyb2xQb2ludHNbcmFuZG9tSW5kZXhdLnBvc2l0aW9uO1xuICAgICAgXG4gICAgICBwR3JvdXBVbml0Lmdyb3VwVW5pdC5hZGRVbml0KFxuICAgICAgICBzcGF3blBvaW50LngsXG4gICAgICAgIHNwYXduUG9pbnQueSArIGogKiA1IC8vIOeojeW+ruWBj+enu+mBv+WFjemHjeeWilxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOa4suafk+W3oemCj+m7nlxuICBwdWJsaWMgcmVuZGVyKHA6IHA1SW5zdGFuY2UpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSByZXR1cm47XG4gICAgXG4gICAgcC5wdXNoKCk7XG4gICAgXG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLnBhdHJvbFBvaW50cykge1xuICAgICAgcC5maWxsKDI1NSk7XG4gICAgICBwLnN0cm9rZSgyNTUsIDI1NSwgMjU1KTtcbiAgICAgIHAuc3Ryb2tlV2VpZ2h0KDEpO1xuICAgICAgcC5jaXJjbGUocG9pbnQucG9zaXRpb24ueCwgcG9pbnQucG9zaXRpb24ueSwgNik7XG4gICAgICBcbiAgICAgIC8vIOmhr+ekuuW3oemCj+m7nue3qOiZn1xuICAgICAgcC5maWxsKDI1NSwgMjU1LCAwKTtcbiAgICAgIHAubm9TdHJva2UoKTtcbiAgICAgIHAudGV4dEFsaWduKHAuQ0VOVEVSIGFzIGFueSwgcC5DRU5URVIgYXMgYW55KTtcbiAgICAgIHAudGV4dFNpemUoMTApO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBhdHJvbFBvaW50cy5pbmRleE9mKHBvaW50KTtcbiAgICAgIHAudGV4dChpbmRleC50b1N0cmluZygpLCBwb2ludC5wb3NpdGlvbi54LCBwb2ludC5wb3NpdGlvbi55IC0gMTUpO1xuICAgIH1cbiAgICBcbiAgICAvLyDnuaroo73lt6Hpgo/ot6/lvpHpgKPnt5pcbiAgICBpZiAodGhpcy5wYXRyb2xQb2ludHMubGVuZ3RoID4gMSkge1xuICAgICAgcC5zdHJva2UoMTAwLCAxMDAsIDEwMCwgMTUwKTtcbiAgICAgIHAuc3Ryb2tlV2VpZ2h0KDEpO1xuICAgICAgcC5ub0ZpbGwoKTtcbiAgICAgIFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhdHJvbFBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5wYXRyb2xQb2ludHNbaV07XG4gICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnBhdHJvbFBvaW50c1soaSArIDEpICUgdGhpcy5wYXRyb2xQb2ludHMubGVuZ3RoXTtcbiAgICAgICAgXG4gICAgICAgIHAubGluZShcbiAgICAgICAgICBjdXJyZW50LnBvc2l0aW9uLngsIGN1cnJlbnQucG9zaXRpb24ueSxcbiAgICAgICAgICBuZXh0LnBvc2l0aW9uLngsIG5leHQucG9zaXRpb24ueVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwLnBvcCgpO1xuICB9XG4gIFxuICAvLyDnp7vpmaTlt6Hpgo/pu55cbiAgcHVibGljIHJlbW92ZVBvaW50KGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucGF0cm9sUG9pbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5wYXRyb2xQb2ludHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOenu+mZpOe+pOe1hOWWruS9jVxuICBwdWJsaWMgcmVtb3ZlR3JvdXBVbml0KGdyb3VwVW5pdDogSUdyb3VwVW5pdCk6IHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5wYXRyb2xHcm91cFVuaXRzLmZpbmRJbmRleChwZ3UgPT4gcGd1Lmdyb3VwVW5pdCA9PT0gZ3JvdXBVbml0KTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLnBhdHJvbEdyb3VwVW5pdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOa4heepuuaJgOacieW3oemCj+izh+aWmVxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5wYXRyb2xQb2ludHMgPSBbXTtcbiAgICB0aGlzLnBhdHJvbEdyb3VwVW5pdHMgPSBbXTtcbiAgfVxuICBcbiAgLy8g54uA5oWL5p+l6KmiXG4gIHB1YmxpYyBnZXRQb2ludENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGF0cm9sUG9pbnRzLmxlbmd0aDtcbiAgfVxuICBcbiAgcHVibGljIGdldEdyb3VwVW5pdENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGF0cm9sR3JvdXBVbml0cy5sZW5ndGg7XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0FjdGl2ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gIH1cbiAgXG4gIC8vIOaOp+WItuaWueazlVxuICBwdWJsaWMgc2V0QWN0aXZlKGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZlID0gYWN0aXZlO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0TWF4VW5pdHNQZXJHcm91cChtYXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubWF4VW5pdHNQZXJHcm91cCA9IE1hdGgubWF4KDEsIG1heCk7XG4gIH1cbiAgXG4gIHB1YmxpYyBzZXRVbml0c0FkZGVkUGVyQ3ljbGUoY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudW5pdHNBZGRlZFBlckN5Y2xlID0gTWF0aC5tYXgoMSwgY291bnQpO1xuICB9XG4gIFxuICAvLyDnjbLlj5bntbHoqIjos4foqIpcbiAgcHVibGljIGdldFN0YXRzKCk6IHtcbiAgICBwb2ludENvdW50OiBudW1iZXI7XG4gICAgZ3JvdXBVbml0Q291bnQ6IG51bWJlcjtcbiAgICB0b3RhbFVuaXRzOiBudW1iZXI7XG4gICAgYWN0aXZlOiBib29sZWFuO1xuICB9IHtcbiAgICBjb25zdCB0b3RhbFVuaXRzID0gdGhpcy5wYXRyb2xHcm91cFVuaXRzLnJlZHVjZShcbiAgICAgIChzdW0sIHBndSkgPT4gc3VtICsgcGd1Lmdyb3VwVW5pdC5nZXRVbml0cygpLmxlbmd0aCxcbiAgICAgIDBcbiAgICApO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBwb2ludENvdW50OiB0aGlzLmdldFBvaW50Q291bnQoKSxcbiAgICAgIGdyb3VwVW5pdENvdW50OiB0aGlzLmdldEdyb3VwVW5pdENvdW50KCksXG4gICAgICB0b3RhbFVuaXRzLFxuICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZVxuICAgIH07XG4gIH1cbn0iLCIvLyBVbml0IOmhnuWIpSAtIOWWruS9jeWvpumrlOWvpuS9nFxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGVzL3A1LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBJVW5pdCB9IGZyb20gJy4uL2ludGVyZmFjZXMvSVVuaXQnO1xuaW1wb3J0IHsgVW5pdFN0YXRlLCBBdHRhY2tDb25maWcsIENvbG9yIH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi4vdXRpbHMvVmVjdG9yJztcbmltcG9ydCB7IEF0dGFja1ZGWCB9IGZyb20gJy4vQXR0YWNrVkZYJztcblxuZXhwb3J0IGNsYXNzIFVuaXQgaW1wbGVtZW50cyBJVW5pdCB7XG4gIC8vIOWfuuacrOWxrOaAp1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgcHVibGljIHBvc2l0aW9uOiBJVmVjdG9yO1xuICBwdWJsaWMgdmVsb2NpdHk6IElWZWN0b3I7XG4gIHB1YmxpYyBhY2NlbGVyYXRpb246IElWZWN0b3I7XG4gIFxuICAvLyDniannkIblsazmgKdcbiAgcHVibGljIHJlYWRvbmx5IHI6IG51bWJlcjtcbiAgcHVibGljIG1heFNwZWVkOiBudW1iZXI7XG4gIHB1YmxpYyBtYXhGb3JjZTogbnVtYmVyO1xuICBcbiAgLy8g55Sf5ZG957O757WxXG4gIHB1YmxpYyBoZWFsdGg6IG51bWJlcjtcbiAgcHVibGljIG1heEhlYWx0aDogbnVtYmVyO1xuICBwdWJsaWMgaXNBbGl2ZTogYm9vbGVhbjtcbiAgXG4gIC8vIOeLgOaFi+euoeeQhlxuICBwdWJsaWMgc3RhdGU6IFVuaXRTdGF0ZTtcbiAgcHVibGljIHByZXZpb3VzU3RhdGU6IFVuaXRTdGF0ZTtcbiAgcHVibGljIHN0YXRlQ2hhbmdlVGltZTogbnVtYmVyO1xuICBcbiAgLy8g5pS75pOK57O757WxXG4gIHB1YmxpYyBhdHRhY2tDb25maWc6IEF0dGFja0NvbmZpZztcbiAgcHVibGljIGxhc3RBdHRhY2tUaW1lOiBudW1iZXI7XG4gIHB1YmxpYyBjYW5BdHRhY2s6IGJvb2xlYW47XG4gIFxuICAvLyDoppboprrlsazmgKdcbiAgcHVibGljIGNvbG9yOiBDb2xvcjtcbiAgXG4gIC8vIOebruaomeezu+e1sVxuICBwdWJsaWMgdGFyZ2V0PzogSVZlY3RvcjtcbiAgcHVibGljIGRlc3RpbmF0aW9uPzogSVZlY3RvcjtcbiAgXG4gIC8vIOe+pOe1hOebuOmXnFxuICBwdWJsaWMgZ3JvdXBJZD86IG51bWJlcjtcbiAgcHVibGljIGlzTGVhZGVyOiBib29sZWFuO1xuICBcbiAgLy8gVW5pdCDnibnmnInlsazmgKdcbiAgcHJpdmF0ZSBwOiBwNUluc3RhbmNlO1xuICBwcml2YXRlIHVuaXRUeXBlOiBudW1iZXI7IC8vIDA95LiA6IisLCAxPemgmOWwjlxuICBwcml2YXRlIHAxcDI6IG51bWJlcjsgLy8g576k57WE5qiZ6K2YXG4gIHB1YmxpYyBkaXJlY3Rpb246IElWZWN0b3I7XG4gIHByaXZhdGUgYmFzZVJhZGl1czogbnVtYmVyO1xuICBwcml2YXRlIGxpZmU6IG51bWJlcjsgLy8g5aO95ZG9XG4gIHByaXZhdGUgYXBwcm9hY2hSYW5nZTogbnVtYmVyO1xuICBwcml2YXRlIGF0dGFja1VuaXQ6IElVbml0IHwgbnVsbDtcbiAgcHJpdmF0ZSBhdHRhY2tWaXNpYmxlRGlzdGFuY2U6IG51bWJlcjtcbiAgcHJpdmF0ZSBhdHRhY2tSYW5nZTogbnVtYmVyO1xuICBwcml2YXRlIGF0dGFja1ZGWDogQXR0YWNrVkZYIHwgbnVsbDtcbiAgcHJpdmF0ZSBoZWFsdGhSZWNvdmVyeUNvb2xkb3duOiBudW1iZXI7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCB4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXBJZDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5pZCA9IGB1bml0XyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbln7rmnKzlsazmgKdcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlY3RvcihwLCB4LCB5KTtcbiAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlY3RvcihwLCBwLnJhbmRvbSgtMSwgMSksIHAucmFuZG9tKC0xLCAxKSk7XG4gICAgdGhpcy5hY2NlbGVyYXRpb24gPSBuZXcgVmVjdG9yKHAsIDAsIDApO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gdGhpcy52ZWxvY2l0eS5jb3B5KCk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbiA9IG5ldyBWZWN0b3IocCwgeCwgeSk7XG4gICAgXG4gICAgLy8g54mp55CG5bGs5oCnXG4gICAgdGhpcy5iYXNlUmFkaXVzID0gMi4wO1xuICAgIHRoaXMuciA9IDYuMDtcbiAgICB0aGlzLm1heFNwZWVkID0gMTtcbiAgICB0aGlzLm1heEZvcmNlID0gMC4wNTtcbiAgICB0aGlzLmFwcHJvYWNoUmFuZ2UgPSB0aGlzLm1heFNwZWVkICsgMC41O1xuICAgIFxuICAgIC8vIOeUn+WRveezu+e1sVxuICAgIHRoaXMuaGVhbHRoID0gMTI7XG4gICAgdGhpcy5tYXhIZWFsdGggPSAxMjtcbiAgICB0aGlzLmxpZmUgPSAyODgwOyAvLyDlhanliIbpkJhcbiAgICB0aGlzLmlzQWxpdmUgPSB0cnVlO1xuICAgIHRoaXMuaGVhbHRoUmVjb3ZlcnlDb29sZG93biA9IDA7XG4gICAgXG4gICAgLy8g54uA5oWL566h55CGXG4gICAgdGhpcy5zdGF0ZSA9IFVuaXRTdGF0ZS5NT1ZFO1xuICAgIHRoaXMucHJldmlvdXNTdGF0ZSA9IFVuaXRTdGF0ZS5TVE9QO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICAvLyDmlLvmk4rns7vntbFcbiAgICB0aGlzLmF0dGFja0NvbmZpZyA9IHtcbiAgICAgIGRhbWFnZTogMSxcbiAgICAgIHJhbmdlOiA2MCxcbiAgICAgIGNvb2xkb3duOiAzMCxcbiAgICAgIGR1cmF0aW9uOiAxMFxuICAgIH07XG4gICAgdGhpcy5sYXN0QXR0YWNrVGltZSA9IDA7XG4gICAgdGhpcy5jYW5BdHRhY2sgPSB0cnVlO1xuICAgIHRoaXMuYXR0YWNrVW5pdCA9IG51bGw7XG4gICAgdGhpcy5hdHRhY2tWaXNpYmxlRGlzdGFuY2UgPSAxMjA7XG4gICAgdGhpcy5hdHRhY2tSYW5nZSA9IHRoaXMuYXR0YWNrQ29uZmlnLnJhbmdlO1xuICAgIHRoaXMuYXR0YWNrVkZYID0gbnVsbDtcbiAgICBcbiAgICAvLyDoppboprrlsazmgKdcbiAgICB0aGlzLmNvbG9yID0geyByOiAxMjcsIGc6IDEyNywgYjogMTI3IH07XG4gICAgXG4gICAgLy8g576k57WE55u46ZecXG4gICAgdGhpcy5ncm91cElkID0gZ3JvdXBJZDtcbiAgICB0aGlzLmlzTGVhZGVyID0gZmFsc2U7XG4gICAgdGhpcy51bml0VHlwZSA9IDA7XG4gICAgdGhpcy5wMXAyID0gZ3JvdXBJZDtcbiAgfVxuICBcbiAgLy8g55Sf5ZG96YCx5pyf5pa55rOVXG4gIHB1YmxpYyB1cGRhdGUoZGVsdGFUaW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyDnlJ/lkb3muJvlsJEgKGxlYWRlciDkuI3mnIPmrbvkuqEpXG4gICAgaWYgKHRoaXMudW5pdFR5cGUgIT09IDEpIHtcbiAgICAgIHRoaXMubGlmZSAtPSAxO1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgIHRoaXMuaGVhbHRoID0gMDtcbiAgICAgIHRoaXMuaXNBbGl2ZSA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IFVuaXRTdGF0ZS5ESUUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShVbml0U3RhdGUuRElFKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgLy8g6KiI566X5pyA6auY6KGA6YePXG4gICAgdGhpcy5tYXhIZWFsdGggPSBNYXRoLmZsb29yKHRoaXMubGlmZSAvIDI4OCkgKyAyO1xuICAgIFxuICAgIC8vIOWbnuW+qeihgOmHj1xuICAgIGlmICh0aGlzLmhlYWx0aCA8IHRoaXMubWF4SGVhbHRoKSB7XG4gICAgICB0aGlzLmhlYWx0aFJlY292ZXJ5Q29vbGRvd24tLTtcbiAgICAgIGlmICh0aGlzLmhlYWx0aFJlY292ZXJ5Q29vbGRvd24gPD0gMCkge1xuICAgICAgICB0aGlzLmhlYWx0aFJlY292ZXJ5Q29vbGRvd24gPSAxNTA7XG4gICAgICAgIHRoaXMuaGVhbHRoKys7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIOihgOmHj+S4iumZkOaqouafpVxuICAgIGlmICh0aGlzLmhlYWx0aCA+IHRoaXMubWF4SGVhbHRoKSB7XG4gICAgICB0aGlzLmhlYWx0aCA9IHRoaXMubWF4SGVhbHRoO1xuICAgIH1cbiAgICBcbiAgICAvLyDoqIjnrpfnlbbliY3ljYrlvpFcbiAgICBpZiAodGhpcy51bml0VHlwZSA9PT0gMSkge1xuICAgICAgKHRoaXMgYXMgYW55KS5yID0gdGhpcy5iYXNlUmFkaXVzICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMgYXMgYW55KS5yID0gdGhpcy5oZWFsdGggLyAzICsgdGhpcy5iYXNlUmFkaXVzO1xuICAgIH1cbiAgICBcbiAgICAvLyDmoLnmk5rni4DmhYvmm7TmlrBcbiAgICB0aGlzLnVwZGF0ZUJ5U3RhdGUoZGVsdGFUaW1lKTtcbiAgICBcbiAgICAvLyDmm7TmlrDmlLvmk4rnibnmlYhcbiAgICBpZiAodGhpcy5hdHRhY2tWRlggJiYgdGhpcy5hdHRhY2tWRlguaXNFeHBpcmVkKCkpIHtcbiAgICAgIHRoaXMuYXR0YWNrVkZYID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgdXBkYXRlQnlTdGF0ZShkZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgY2FzZSBVbml0U3RhdGUuTU9WRTpcbiAgICAgICAgdGhpcy51cGRhdGVNb3ZlU3RhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVuaXRTdGF0ZS5GT0xMT1c6XG4gICAgICAgIHRoaXMudXBkYXRlRm9sbG93U3RhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVuaXRTdGF0ZS5BVFRBQ0s6XG4gICAgICAgIHRoaXMudXBkYXRlQXR0YWNrU3RhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVuaXRTdGF0ZS5TVE9QOlxuICAgICAgICAvLyDlgZzmraLni4DmhYvkuI3pnIDopoHmm7TmlrDkvY3nva5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVuaXRTdGF0ZS5ESUU6XG4gICAgICAgIC8vIOatu+S6oeeLgOaFi1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgdXBkYXRlTW92ZVN0YXRlKF9kZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjY2VsZXJhdGlvbi5tYWcoKSA9PT0gMCAmJiB0aGlzLmRlc3RpbmF0aW9uKSB7XG4gICAgICB0aGlzLmFwcGx5Rm9yY2UodGhpcy5zZWVrKHRoaXMuZGVzdGluYXRpb24pKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgIHRoaXMudmVsb2NpdHkubGltaXQodGhpcy5tYXhTcGVlZCk7XG4gICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcbiAgICBcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMudmVsb2NpdHkuY29weSgpO1xuICAgIFxuICAgIC8vIOaqouafpeaYr+WQpuWIsOmBlOebruaomVxuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uKSB7XG4gICAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KHRoaXMucG9zaXRpb24sIHRoaXMuZGVzdGluYXRpb24pO1xuICAgICAgaWYgKGRpc3RhbmNlIDw9IHRoaXMuYXBwcm9hY2hSYW5nZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKFVuaXRTdGF0ZS5TVE9QKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgdXBkYXRlRm9sbG93U3RhdGUoX2RlbHRhVGltZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xuICAgIHRoaXMudmVsb2NpdHkubGltaXQodGhpcy5tYXhTcGVlZCk7XG4gICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XG4gICAgdGhpcy5hY2NlbGVyYXRpb24ubXVsdCgwKTtcbiAgICBcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMudmVsb2NpdHkuY29weSgpO1xuICB9XG4gIFxuICBwcml2YXRlIHVwZGF0ZUF0dGFja1N0YXRlKF9kZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIFBWUCDmqKHlvI/mqqLmn6VcbiAgICAvLyBUT0RPOiDlvp7pgYrmiLLni4DmhYvnjbLlj5YgaXNQVlAg54uA5oWLXG4gICAgY29uc3QgaXNQVlAgPSB0cnVlOyAvLyDmmqvmmYLoqK3ngrogdHJ1ZVxuICAgIFxuICAgIGlmICghaXNQVlApIHtcbiAgICAgIHRoaXMuYXR0YWNrVW5pdCA9IG51bGw7XG4gICAgICB0aGlzLnNldFN0YXRlKFVuaXRTdGF0ZS5GT0xMT1cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXRoaXMuYXR0YWNrVW5pdCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShVbml0U3RhdGUuRk9MTE9XKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgLy8g5pS75pOK5Ya35Y27XG4gICAgaWYgKHRoaXMubGFzdEF0dGFja1RpbWUgPiAwKSB7XG4gICAgICB0aGlzLmxhc3RBdHRhY2tUaW1lLS07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QodGhpcy5hdHRhY2tVbml0LnBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgIFxuICAgICAgaWYgKGRpc3RhbmNlIDw9IHRoaXMuYXR0YWNrUmFuZ2UgJiYgdGhpcy5sYXN0QXR0YWNrVGltZSA8PSAwICYmIGlzUFZQKSB7XG4gICAgICAgIHRoaXMucGVyZm9ybUF0dGFjayh0aGlzLmF0dGFja1VuaXQpO1xuICAgICAgfSBlbHNlIGlmIChkaXN0YW5jZSA+IHRoaXMuYXR0YWNrVmlzaWJsZURpc3RhbmNlKSB7XG4gICAgICAgIHRoaXMuYXR0YWNrVW5pdCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIOaqouafpeebruaomeaYr+WQpuatu+S6oVxuICAgIGlmICh0aGlzLmF0dGFja1VuaXQgJiYgIXRoaXMuYXR0YWNrVW5pdC5pc0FsaXZlKSB7XG4gICAgICB0aGlzLmF0dGFja1VuaXQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXRoaXMuYXR0YWNrVW5pdCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShVbml0U3RhdGUuRk9MTE9XKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgLy8g6KiI566X5pS75pOK562W55Wl5L2N572uXG4gICAgbGV0IHRhcmdldFBvc2l0aW9uID0gdGhpcy5hdHRhY2tVbml0LnBvc2l0aW9uO1xuICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QodGhpcy5hdHRhY2tVbml0LnBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uKTtcbiAgICBjb25zdCBkaXJlY3Rpb25Ub1RhcmdldCA9IFZlY3Rvci5zdWIodGhpcy5wLCB0aGlzLmF0dGFja1VuaXQucG9zaXRpb24sIHRoaXMucG9zaXRpb24pO1xuICAgIFxuICAgIGlmICh0aGlzLmhlYWx0aCA8PSA2KSB7XG4gICAgICAvLyDooYDph4/kvY7mmYLpgIPot5FcbiAgICAgIGNvbnN0IGVzY2FwZURpcmVjdGlvbiA9IGRpcmVjdGlvblRvVGFyZ2V0LmNvcHkoKS5yb3RhdGUoTWF0aC5QSSk7XG4gICAgICB0YXJnZXRQb3NpdGlvbiA9IFZlY3Rvci5hZGQodGhpcy5wLCB0aGlzLnBvc2l0aW9uLCBlc2NhcGVEaXJlY3Rpb24pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5sYXN0QXR0YWNrVGltZSA+IDAgJiYgZGlzdGFuY2UgPCB0aGlzLmF0dGFja1JhbmdlICogMS41KSB7XG4gICAgICAvLyDmlLvmk4rlhrfljbvmmYLkv53mjIHot53pm6JcbiAgICAgIGNvbnN0IHNpZGVEaXJlY3Rpb24gPSBkaXJlY3Rpb25Ub1RhcmdldC5jb3B5KCkucm90YXRlKDAuNDQpOyAvLyDntIQgMjUg5bqmXG4gICAgICB0YXJnZXRQb3NpdGlvbiA9IFZlY3Rvci5hZGQodGhpcy5wLCB0aGlzLnBvc2l0aW9uLCBzaWRlRGlyZWN0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5hcHBseUZvcmNlKHRoaXMuc2Vlayh0YXJnZXRQb3NpdGlvbikpO1xuICAgIFxuICAgIC8vIOabtOaWsOeJqeeQhlxuICAgIHRoaXMudmVsb2NpdHkuYWRkKHRoaXMuYWNjZWxlcmF0aW9uKTtcbiAgICB0aGlzLnZlbG9jaXR5LmxpbWl0KHRoaXMubWF4U3BlZWQpO1xuICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uLm11bHQoMCk7XG4gICAgXG4gICAgdGhpcy5kaXJlY3Rpb24gPSB0aGlzLnZlbG9jaXR5LmNvcHkoKTtcbiAgfVxuICBcbiAgcHJpdmF0ZSBwZXJmb3JtQXR0YWNrKHRhcmdldDogSVVuaXQpOiB2b2lkIHtcbiAgICB0aGlzLmxhc3RBdHRhY2tUaW1lID0gdGhpcy5hdHRhY2tDb25maWcuY29vbGRvd247XG4gICAgY29uc3QgYXR0YWNrRGlyZWN0aW9uID0gVmVjdG9yLnN1Yih0aGlzLnAsIHRhcmdldC5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbik7XG4gICAgdGhpcy5hdHRhY2tWRlggPSBuZXcgQXR0YWNrVkZYKHRoaXMucCwgdGhpcy5wb3NpdGlvbiwgYXR0YWNrRGlyZWN0aW9uLCAncmVkJyk7XG4gICAgdGFyZ2V0LnRha2VEYW1hZ2UodGhpcy5hdHRhY2tDb25maWcuZGFtYWdlLCB0aGlzKTtcbiAgfVxuICBcbiAgcHVibGljIHJlbmRlcihwOiBwNUluc3RhbmNlKTogdm9pZCB7XG4gICAgY29uc3QgdGhldGEgPSB0aGlzLmRpcmVjdGlvbi5oZWFkaW5nKCkgKyBwLnJhZGlhbnMoOTApO1xuICAgIFxuICAgIC8vIOioreWumumhj+iJslxuICAgIHAuZmlsbCgxMjcpO1xuICAgIHAuc3Ryb2tlKDIwMCk7XG4gICAgXG4gICAgY29uc3QgY29sb3JzID0gW1xuICAgICAgeyByOiAxNTQsIGc6IDIwNiwgYjogMTY3IH0sXG4gICAgICB7IHI6IDU4LCBnOiAxMjYsIGI6IDc2IH0sXG4gICAgICAnb3JhbmdlJyxcbiAgICAgICd5ZWxsb3cnLFxuICAgICAgJ2dyZWVuJyxcbiAgICAgICdibHVlJyxcbiAgICAgICdpbmRpZ28nLFxuICAgICAgJ3Zpb2xldCdcbiAgICBdO1xuICAgIFxuICAgIGlmICh0aGlzLnAxcDIgIT09IDEpIHtcbiAgICAgIGNvbnN0IGNvbG9ySW5kZXggPSAodGhpcy5wMXAyIC0gMikgJSBjb2xvcnMubGVuZ3RoO1xuICAgICAgY29uc3Qgc2VsZWN0ZWRDb2xvciA9IGNvbG9yc1tjb2xvckluZGV4XTtcbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0ZWRDb2xvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcC5maWxsKHNlbGVjdGVkQ29sb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcC5maWxsKHNlbGVjdGVkQ29sb3Iuciwgc2VsZWN0ZWRDb2xvci5nLCBzZWxlY3RlZENvbG9yLmIpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy51bml0VHlwZSA9PT0gMSkge1xuICAgICAgcC5zdHJva2UoJ3JlZCcpO1xuICAgIH1cbiAgICBcbiAgICAvLyDnuaroo73kuInop5LlvaJcbiAgICBwLnB1c2goKTtcbiAgICBwLnRyYW5zbGF0ZSh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgcC5yb3RhdGUodGhldGEpO1xuICAgIHAuYmVnaW5TaGFwZSgpO1xuICAgIHAudmVydGV4KDAsIC10aGlzLnIgKiAyKTtcbiAgICBwLnZlcnRleCgtdGhpcy5yLCB0aGlzLnIgKiAyKTtcbiAgICBwLnZlcnRleCh0aGlzLnIsIHRoaXMuciAqIDIpO1xuICAgIHAuZW5kU2hhcGUocC5DTE9TRSk7XG4gICAgcC5wb3AoKTtcbiAgICBcbiAgICAvLyDnuaroo73mlLvmk4rnibnmlYhcbiAgICBpZiAodGhpcy5hdHRhY2tWRlgpIHtcbiAgICAgIHRoaXMuYXR0YWNrVkZYLmRyYXcoKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOeLgOaFi+euoeeQhuaWueazlVxuICBwdWJsaWMgc2V0U3RhdGUobmV3U3RhdGU6IFVuaXRTdGF0ZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgdGhpcy5wcmV2aW91c1N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgIHRoaXMuc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMub25TdGF0ZUNoYW5nZWQ/Lih0aGlzLnByZXZpb3VzU3RhdGUsIG5ld1N0YXRlKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBjYW5UcmFuc2l0aW9uVG8oX3RhcmdldFN0YXRlOiBVbml0U3RhdGUpOiBib29sZWFuIHtcbiAgICAvLyDmrbvkuqHni4DmhYvkuI3og73ovYnmj5vliLDlhbbku5bni4DmhYtcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gVW5pdFN0YXRlLkRJRSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICAvLyDlhbbku5bni4DmhYvovYnmj5vpgo/ovK9cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBcbiAgLy8g56e75YuV5pa55rOVXG4gIHB1YmxpYyBzZWVrKHRhcmdldDogSVZlY3Rvcik6IElWZWN0b3Ige1xuICAgIGNvbnN0IGRlc2lyZWQgPSBWZWN0b3Iuc3ViKHRoaXMucCwgdGFyZ2V0LCB0aGlzLnBvc2l0aW9uKTtcbiAgICBkZXNpcmVkLm5vcm1hbGl6ZSgpO1xuICAgIGRlc2lyZWQubXVsdCh0aGlzLm1heFNwZWVkKTtcbiAgICBcbiAgICBjb25zdCBzdGVlciA9IFZlY3Rvci5zdWIodGhpcy5wLCBkZXNpcmVkLCB0aGlzLnZlbG9jaXR5KTtcbiAgICBzdGVlci5saW1pdCh0aGlzLm1heEZvcmNlKTtcbiAgICByZXR1cm4gc3RlZXI7XG4gIH1cbiAgXG4gIHB1YmxpYyBmbGVlKHRhcmdldDogSVZlY3Rvcik6IElWZWN0b3Ige1xuICAgIGNvbnN0IGRlc2lyZWQgPSBWZWN0b3Iuc3ViKHRoaXMucCwgdGhpcy5wb3NpdGlvbiwgdGFyZ2V0KTtcbiAgICBkZXNpcmVkLm5vcm1hbGl6ZSgpO1xuICAgIGRlc2lyZWQubXVsdCh0aGlzLm1heFNwZWVkKTtcbiAgICBcbiAgICBjb25zdCBzdGVlciA9IFZlY3Rvci5zdWIodGhpcy5wLCBkZXNpcmVkLCB0aGlzLnZlbG9jaXR5KTtcbiAgICBzdGVlci5saW1pdCh0aGlzLm1heEZvcmNlKTtcbiAgICByZXR1cm4gc3RlZXI7XG4gIH1cbiAgXG4gIHB1YmxpYyBhcnJpdmUodGFyZ2V0OiBJVmVjdG9yLCBzbG93aW5nUmFkaXVzOiBudW1iZXIgPSA1MCk6IElWZWN0b3Ige1xuICAgIGNvbnN0IGRlc2lyZWQgPSBWZWN0b3Iuc3ViKHRoaXMucCwgdGFyZ2V0LCB0aGlzLnBvc2l0aW9uKTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IGRlc2lyZWQubWFnKCk7XG4gICAgXG4gICAgZGVzaXJlZC5ub3JtYWxpemUoKTtcbiAgICBcbiAgICBpZiAoZGlzdGFuY2UgPCBzbG93aW5nUmFkaXVzKSB7XG4gICAgICBjb25zdCBzcGVlZCA9IHRoaXMubWF4U3BlZWQgKiAoZGlzdGFuY2UgLyBzbG93aW5nUmFkaXVzKTtcbiAgICAgIGRlc2lyZWQubXVsdChzcGVlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlc2lyZWQubXVsdCh0aGlzLm1heFNwZWVkKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgc3RlZXIgPSBWZWN0b3Iuc3ViKHRoaXMucCwgZGVzaXJlZCwgdGhpcy52ZWxvY2l0eSk7XG4gICAgc3RlZXIubGltaXQodGhpcy5tYXhGb3JjZSk7XG4gICAgcmV0dXJuIHN0ZWVyO1xuICB9XG4gIFxuICAvLyDmlLvmk4rmlrnms5VcbiAgcHVibGljIGF0dGFjayh0YXJnZXQ6IElVbml0KTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmNhbkF0dGFjayB8fCB0aGlzLmxhc3RBdHRhY2tUaW1lID4gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy5pc0luQXR0YWNrUmFuZ2UodGFyZ2V0KSkge1xuICAgICAgdGhpcy5zZXRBdHRhY2sodGFyZ2V0KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIHB1YmxpYyB0YWtlRGFtYWdlKGRhbWFnZTogbnVtYmVyLCBfc291cmNlPzogSVVuaXQpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRIZWFsdGggPSB0aGlzLmhlYWx0aDtcbiAgICB0aGlzLmhlYWx0aCA9IE1hdGgubWF4KDAsIHRoaXMuaGVhbHRoIC0gZGFtYWdlKTtcbiAgICB0aGlzLm9uSGVhbHRoQ2hhbmdlZD8uKG9sZEhlYWx0aCwgdGhpcy5oZWFsdGgpO1xuICAgIFxuICAgIGlmICh0aGlzLmhlYWx0aCA8PSAwICYmIHRoaXMuaXNBbGl2ZSkge1xuICAgICAgdGhpcy5pc0FsaXZlID0gZmFsc2U7XG4gICAgICB0aGlzLnNldFN0YXRlKFVuaXRTdGF0ZS5ESUUpO1xuICAgICAgdGhpcy5vbkRlYXRoPy4oKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0luQXR0YWNrUmFuZ2UodGFyZ2V0OiBJVW5pdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRpc3RhbmNlID0gVmVjdG9yLmRpc3QodGhpcy5wb3NpdGlvbiwgdGFyZ2V0LnBvc2l0aW9uKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gdGhpcy5hdHRhY2tSYW5nZTtcbiAgfVxuICBcbiAgLy8g5bel5YW35pa55rOVXG4gIHB1YmxpYyBkaXN0YW5jZVRvKHRhcmdldDogSVZlY3RvciB8IElVbml0KTogbnVtYmVyIHtcbiAgICBjb25zdCB0YXJnZXRQb3MgPSAncG9zaXRpb24nIGluIHRhcmdldCA/IHRhcmdldC5wb3NpdGlvbiA6IHRhcmdldDtcbiAgICByZXR1cm4gVmVjdG9yLmRpc3QodGhpcy5wb3NpdGlvbiwgdGFyZ2V0UG9zKTtcbiAgfVxuICBcbiAgcHVibGljIGFuZ2xlVG8odGFyZ2V0OiBJVmVjdG9yIHwgSVVuaXQpOiBudW1iZXIge1xuICAgIGNvbnN0IHRhcmdldFBvcyA9ICdwb3NpdGlvbicgaW4gdGFyZ2V0ID8gdGFyZ2V0LnBvc2l0aW9uIDogdGFyZ2V0O1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IFZlY3Rvci5zdWIodGhpcy5wLCB0YXJnZXRQb3MsIHRoaXMucG9zaXRpb24pO1xuICAgIHJldHVybiBkaXJlY3Rpb24uaGVhZGluZygpO1xuICB9XG4gIFxuICBwdWJsaWMgY29weSgpOiBJVW5pdCB7XG4gICAgY29uc3QgbmV3VW5pdCA9IG5ldyBVbml0KHRoaXMucCwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuZ3JvdXBJZCk7XG4gICAgLy8g6KSH6KO95YW25LuW5bGs5oCnLi4uXG4gICAgcmV0dXJuIG5ld1VuaXQ7XG4gIH1cbiAgXG4gIC8vIOWinuWKoOWKm1xuICBwdWJsaWMgYXBwbHlGb3JjZShmb3JjZTogSVZlY3Rvcik6IHZvaWQge1xuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZChmb3JjZSk7XG4gIH1cbiAgXG4gIC8vIOioreWumuWKm1xuICBwdWJsaWMgc2V0Rm9yY2UoZm9yY2U6IElWZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IGZvcmNlO1xuICB9XG4gIFxuICAvLyDoqK3lrprnm67mqJlcbiAgcHVibGljIHNldERlc3RpbmF0aW9uKHRhcmdldDogSVZlY3Rvcik6IHZvaWQge1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSB0YXJnZXQ7XG4gICAgdGhpcy52ZWxvY2l0eSA9IHRoaXMuZGlyZWN0aW9uLmNvcHkoKTtcbiAgICB0aGlzLnNldFN0YXRlKFVuaXRTdGF0ZS5NT1ZFKTtcbiAgfVxuICBcbiAgLy8g6Kit5a6a6Lef6ZqoXG4gIHB1YmxpYyBzZXRGb2xsb3coKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZShVbml0U3RhdGUuRk9MTE9XKTtcbiAgfVxuICBcbiAgLy8g6Kit5a6a5YGc5q2iXG4gIHB1YmxpYyBzZXRTdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXRlID09PSBVbml0U3RhdGUuRk9MTE9XIHx8IHRoaXMuc3RhdGUgPT09IFVuaXRTdGF0ZS5NT1ZFKSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMudmVsb2NpdHkuY29weSgpO1xuICAgICAgdGhpcy52ZWxvY2l0eS5tdWx0KDApO1xuICAgICAgdGhpcy5zZXRTdGF0ZShVbml0U3RhdGUuU1RPUCk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDoqK3lrprmlLvmk4pcbiAgcHVibGljIHNldEF0dGFjayhlbmVteVVuaXQ6IElVbml0KTogdm9pZCB7XG4gICAgdGhpcy5hdHRhY2tVbml0ID0gZW5lbXlVbml0O1xuICAgIHRoaXMuc2V0U3RhdGUoVW5pdFN0YXRlLkFUVEFDSyk7XG4gIH1cbiAgXG4gIC8vIOeLgOaFi+aqouafpeaWueazlVxuICBwdWJsaWMgaXNNb3ZlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBVbml0U3RhdGUuTU9WRTtcbiAgfVxuICBcbiAgcHVibGljIGlzRm9sbG93KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBVbml0U3RhdGUuRk9MTE9XO1xuICB9XG4gIFxuICBwdWJsaWMgaXNBdHRhY2tpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFVuaXRTdGF0ZS5BVFRBQ0s7XG4gIH1cbiAgXG4gIC8vIOioreWumiBsZWFkZXJcbiAgcHVibGljIHNldEFzTGVhZGVyKCk6IHZvaWQge1xuICAgIHRoaXMuaXNMZWFkZXIgPSB0cnVlO1xuICAgIHRoaXMudW5pdFR5cGUgPSAxO1xuICB9XG4gIFxuICAvLyDkuovku7bomZXnkIYgKOWPr+mBuOWvpuS9nClcbiAgcHVibGljIG9uU3RhdGVDaGFuZ2VkPyhvbGRTdGF0ZTogVW5pdFN0YXRlLCBuZXdTdGF0ZTogVW5pdFN0YXRlKTogdm9pZDtcbiAgcHVibGljIG9uSGVhbHRoQ2hhbmdlZD8ob2xkSGVhbHRoOiBudW1iZXIsIG5ld0hlYWx0aDogbnVtYmVyKTogdm9pZDtcbiAgcHVibGljIG9uRGVhdGg/KCk6IHZvaWQ7XG59IiwiLy8gR2FtZVNrZXRjaCDpoZ7liKUgLSDpgYrmiLLkuLvopoHpgo/ovK/lsIHoo53vvIzmlbTlkIjmiYDmnInns7vntbFcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBlcy9wNS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgR2FtZUNvbmZpZywgQ29udHJvbE1vZGUgfSBmcm9tICcuLi90eXBlcy9jb21tb24nO1xuaW1wb3J0IHsgSVZlY3RvciB9IGZyb20gJy4uL3R5cGVzL3ZlY3Rvcic7XG5pbXBvcnQgeyBHYW1lTWFuYWdlciB9IGZyb20gJy4uL2NvcmUvR2FtZU1hbmFnZXInO1xuXG5leHBvcnQgY2xhc3MgR2FtZVNrZXRjaCB7XG4gIHB1YmxpYyByZWFkb25seSBwOiBwNUluc3RhbmNlO1xuICBcbiAgLy8g6YGK5oiy6Kit5a6aXG4gIHB1YmxpYyBjb25maWc6IEdhbWVDb25maWc7XG4gIFxuICAvLyDmoLjlv4PpgYrmiLLnrqHnkIblmahcbiAgcHJpdmF0ZSBnYW1lTWFuYWdlcjogR2FtZU1hbmFnZXI7XG4gIFxuICAvLyDoppbnqpflkoznm7jmqZ/vvIjlp5ToqJfntaYgR2FtZU1hbmFnZXLvvIlcbiAgcHVibGljIHZpZXdYOiBudW1iZXIgPSAwO1xuICBwdWJsaWMgdmlld1k6IG51bWJlciA9IDA7XG4gIFxuICAvLyDmjqfliLbns7vntbHvvIjlp5ToqJfntaYgR2FtZU1hbmFnZXLvvIlcbiAgcHVibGljIGN1cnJlbnRDb250cm9sOiBDb250cm9sTW9kZSA9IENvbnRyb2xNb2RlLlBMQVlFUjtcbiAgcHVibGljIGlzUFZQOiBib29sZWFuID0gZmFsc2U7XG4gIFxuICAvLyDntbHoqIjlkozoqr/oqaZcbiAgcHVibGljIHNob3dTdGF0czogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgc2hvd0RlYnVnOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyBmcmFtZUNvdW50OiBudW1iZXIgPSAwO1xuICBcbiAgLy8g5YWn6YOo54uA5oWLXG4gIHByaXZhdGUgbGFzdFVwZGF0ZVRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgaXNQYXVzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBpc0luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlKSB7XG4gICAgdGhpcy5wID0gcDtcbiAgICBcbiAgICAvLyDpoJDoqK3pgYrmiLLoqK3lrppcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGRpc3BsYXlXaWR0aDogMTAyNCxcbiAgICAgIGRpc3BsYXlIZWlnaHQ6IDY0MCxcbiAgICAgIG1heFVuaXRzOiAyMDAsXG4gICAgICBpc1BWUDogZmFsc2UsXG4gICAgICBzaG93U3RhdHM6IGZhbHNlLFxuICAgICAgc2hvd0RlYnVnOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgLy8g5Yid5aeL5YyW6YGK5oiy566h55CG5ZmoXG4gICAgdGhpcy5nYW1lTWFuYWdlciA9IG5ldyBHYW1lTWFuYWdlcihwLCB0aGlzLmNvbmZpZy5kaXNwbGF5V2lkdGgsIHRoaXMuY29uZmlnLmRpc3BsYXlIZWlnaHQpO1xuICAgIFxuICAgIC8vIOe2geWumuS6i+S7tuiZleeQhuaWueazlVxuICAgIHRoaXMucC5zZXR1cCA9ICgpID0+IHRoaXMuc2V0dXAoKTtcbiAgICB0aGlzLnAuZHJhdyA9ICgpID0+IHRoaXMuZHJhdygpO1xuICAgIHRoaXMucC5tb3VzZVByZXNzZWQgPSAoKSA9PiB0aGlzLm1vdXNlUHJlc3NlZCgpO1xuICAgIHRoaXMucC5rZXlQcmVzc2VkID0gKCkgPT4gdGhpcy5rZXlQcmVzc2VkKCk7XG4gICAgdGhpcy5wLmtleVJlbGVhc2VkID0gKCkgPT4gdGhpcy5rZXlSZWxlYXNlZCgpO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0dXAoKTogdm9pZCB7XG4gICAgLy8g5bu656uLIENhbnZhcyAoV0VCR0wg5qih5byP55So5pa8IDNEIOebuOapn+WKn+iDvSlcbiAgICB0aGlzLnAuY3JlYXRlQ2FudmFzKHRoaXMuY29uZmlnLmRpc3BsYXlXaWR0aCwgdGhpcy5jb25maWcuZGlzcGxheUhlaWdodCwgdGhpcy5wLldFQkdMKTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbpgYrmiLLnrqHnkIblmahcbiAgICB0cnkge1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBHYW1lU2tldGNoIOWSjCBHYW1lTWFuYWdlciDliJ3lp4vljJblrozmiJAnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign4p2MIEdhbWVTa2V0Y2gg5Yid5aeL5YyW5aSx5pWXOicsIGVycm9yKTtcbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gRGF0ZS5ub3coKTtcbiAgfVxuICBcbiAgcHVibGljIGRyYXcoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIC8vIOmhr+ekuui8ieWFpeeVq+mdolxuICAgICAgdGhpcy5wLmJhY2tncm91bmQoNTEpO1xuICAgICAgdGhpcy5wLmZpbGwoMjU1KTtcbiAgICAgIHRoaXMucC50ZXh0QWxpZ24odGhpcy5wLkNFTlRFUiBhcyBhbnksIHRoaXMucC5DRU5URVIgYXMgYW55KTtcbiAgICAgIHRoaXMucC50ZXh0KCfmraPlnKjliJ3lp4vljJbpgYrmiLLns7vntbEuLi4nLCAwLCAwLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGRlbHRhVGltZSA9IChjdXJyZW50VGltZSAtIHRoaXMubGFzdFVwZGF0ZVRpbWUpIC8gMTAwMDsgLy8g6L2J5o+b54K656eSXG4gICAgdGhpcy5sYXN0VXBkYXRlVGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIFxuICAgIGlmICghdGhpcy5pc1BhdXNlZCkge1xuICAgICAgdGhpcy51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLmZyYW1lQ291bnQrKztcbiAgfVxuICBcbiAgcHVibGljIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSByZXR1cm47XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIOWnlOiol+e1piBHYW1lTWFuYWdlciDomZXnkIbmiYDmnInmm7TmlrDpgo/ovK9cbiAgICAgIHRoaXMuZ2FtZU1hbmFnZXIudXBkYXRlKGRlbHRhVGltZSk7XG4gICAgICBcbiAgICAgIC8vIOWQjOatpeebuOapn+S9jee9ru+8iOW+niBHYW1lTWFuYWdlciDnjbLlj5bvvIlcbiAgICAgIGNvbnN0IGNhbWVyYVBvcyA9IHRoaXMuZ2FtZU1hbmFnZXIuZ2V0R2FtZVN0YXRzKCk7XG4gICAgICB0aGlzLnZpZXdYID0gY2FtZXJhUG9zLmN1cnJlbnRDb250cm9sID09PSBDb250cm9sTW9kZS5QTEFZRVIgPyB0aGlzLnZpZXdYIDogdGhpcy52aWV3WDtcbiAgICAgIHRoaXMudmlld1kgPSBjYW1lcmFQb3MuY3VycmVudENvbnRyb2wgPT09IENvbnRyb2xNb2RlLlBMQVlFUiA/IHRoaXMudmlld1kgOiB0aGlzLnZpZXdZO1xuICAgICAgXG4gICAgICAvLyDlkIzmraXpgYrmiLLni4DmhYtcbiAgICAgIHRoaXMuY3VycmVudENvbnRyb2wgPSBjYW1lcmFQb3MuY3VycmVudENvbnRyb2w7XG4gICAgICB0aGlzLmlzUFZQID0gY2FtZXJhUG9zLmlzUFZQO1xuICAgICAgXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+mBiuaIsuabtOaWsOmMr+iqpDonLCBlcnJvcik7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgcmVuZGVyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSByZXR1cm47XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIOWnlOiol+e1piBHYW1lTWFuYWdlciDomZXnkIbmiYDmnInmuLLmn5NcbiAgICAgIHRoaXMuZ2FtZU1hbmFnZXIucmVuZGVyKCk7XG4gICAgICBcbiAgICAgIC8vIOa4suafkyBHYW1lU2tldGNoIOWxpOe0mueahCBVSe+8iOe1seioiOWSjOmZpOmMr+izh+ioiu+8iVxuICAgICAgaWYgKHRoaXMuc2hvd1N0YXRzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyU3RhdHMoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHRoaXMuc2hvd0RlYnVnKSB7XG4gICAgICAgIHRoaXMucmVuZGVyRGVidWcoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmuLLmn5PpjK/oqqQ6JywgZXJyb3IpO1xuICAgICAgXG4gICAgICAvLyDpoa/npLrpjK/oqqToqIrmga9cbiAgICAgIHRoaXMucC5iYWNrZ3JvdW5kKDUxKTtcbiAgICAgIHRoaXMucC5maWxsKDI1NSwgMCwgMCk7XG4gICAgICB0aGlzLnAudGV4dEFsaWduKHRoaXMucC5DRU5URVIgYXMgYW55LCB0aGlzLnAuQ0VOVEVSIGFzIGFueSk7XG4gICAgICB0aGlzLnAudGV4dCgn5riy5p+T6Yyv6KqkOiAnICsgZXJyb3IsIDAsIDAsIDApO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIG1vdXNlUHJlc3NlZCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNJbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAvLyDlp5ToqJfntaYgR2FtZU1hbmFnZXIg6JmV55CG5ruR6byg5LqL5Lu2XG4gICAgICB0aGlzLmdhbWVNYW5hZ2VyLm9uTW91c2VQcmVzc2VkKHRoaXMucC5tb3VzZVgsIHRoaXMucC5tb3VzZVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmu5HpvKDkuovku7bomZXnkIbpjK/oqqQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIGtleVByZXNzZWQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8g5aeU6KiX57WmIEdhbWVNYW5hZ2VyIOiZleeQhuaMiemNteS6i+S7tlxuICAgICAgdGhpcy5nYW1lTWFuYWdlci5vbktleVByZXNzZWQodGhpcy5wLmtleUNvZGUpO1xuICAgICAgXG4gICAgICAvLyBHYW1lU2tldGNoIOWxpOe0mueahOeJueauiuaMiemNtVxuICAgICAgY29uc3Qga2V5ID0gdGhpcy5wLmtleUNvZGU7XG4gICAgICBpZiAoa2V5ID09PSA3MykgdGhpcy50b2dnbGVTdGF0cygpOyAvLyBJIC0g57Wx6KiI6LOH6KiKXG4gICAgICBpZiAoa2V5ID09PSA3OSkgdGhpcy50b2dnbGVEZWJ1ZygpOyAvLyBPIC0g6Zmk6Yyv6LOH6KiKXG4gICAgICBcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcign5oyJ6Y215LqL5Lu26JmV55CG6Yyv6KqkOicsIGVycm9yKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBrZXlSZWxlYXNlZCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNJbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAvLyDlp5ToqJfntaYgR2FtZU1hbmFnZXIg6JmV55CG5oyJ6Y216YeL5pS+5LqL5Lu2XG4gICAgICB0aGlzLmdhbWVNYW5hZ2VyLm9uS2V5UmVsZWFzZWQodGhpcy5wLmtleUNvZGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfmjInpjbXph4vmlL7kuovku7bomZXnkIbpjK/oqqQ6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHN3aXRjaENvbnRyb2wobW9kZTogQ29udHJvbE1vZGUpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRDb250cm9sID0gbW9kZTtcbiAgICBpZiAodGhpcy5nYW1lTWFuYWdlcikge1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5zZXRDdXJyZW50Q29udHJvbChtb2RlKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ0NvbnRyb2wgc3dpdGNoZWQgdG86JywgbW9kZSk7XG4gIH1cbiAgXG4gIHB1YmxpYyB0b2dnbGVQVlAoKTogdm9pZCB7XG4gICAgdGhpcy5pc1BWUCA9ICF0aGlzLmlzUFZQO1xuICAgIHRoaXMuY29uZmlnLmlzUFZQID0gdGhpcy5pc1BWUDtcbiAgICBpZiAodGhpcy5nYW1lTWFuYWdlcikge1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5zZXRQVlBNb2RlKHRoaXMuaXNQVlApO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnUFZQIG1vZGU6JywgdGhpcy5pc1BWUCA/ICdPTicgOiAnT0ZGJyk7XG4gIH1cbiAgXG4gIHB1YmxpYyB0b2dnbGVTdGF0cygpOiB2b2lkIHtcbiAgICB0aGlzLnNob3dTdGF0cyA9ICF0aGlzLnNob3dTdGF0cztcbiAgICB0aGlzLmNvbmZpZy5zaG93U3RhdHMgPSB0aGlzLnNob3dTdGF0cztcbiAgfVxuICBcbiAgcHVibGljIHRvZ2dsZURlYnVnKCk6IHZvaWQge1xuICAgIHRoaXMuc2hvd0RlYnVnID0gIXRoaXMuc2hvd0RlYnVnO1xuICAgIHRoaXMuY29uZmlnLnNob3dEZWJ1ZyA9IHRoaXMuc2hvd0RlYnVnO1xuICB9XG4gIFxuICBwdWJsaWMgdXBkYXRlQ2FtZXJhKCk6IHZvaWQge1xuICAgIC8vIOebuOapn+aOp+WItuePvuWcqOeUsSBDYW1lcmFTeXN0ZW0g6JmV55CGXG4gICAgLy8g6YCZ5YCL5pa55rOV5L+d55WZ5Lul57at5oyB5LuL6Z2i5LiA6Ie05oCnXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRXb3JsZE1vdXNlUG9zaXRpb24oKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMucC5tb3VzZVggLSAodGhpcy5jb25maWcuZGlzcGxheVdpZHRoIC8gMiAtIHRoaXMudmlld1gpLFxuICAgICAgeTogdGhpcy5wLm1vdXNlWSAtICh0aGlzLmNvbmZpZy5kaXNwbGF5SGVpZ2h0IC8gMiAtIHRoaXMudmlld1kpXG4gICAgfSBhcyBJVmVjdG9yO1xuICB9XG4gIFxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZ2FtZU1hbmFnZXIpIHtcbiAgICAgIHRoaXMuZ2FtZU1hbmFnZXIuZGVzdHJveSgpO1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMudmlld1ggPSAwO1xuICAgIHRoaXMudmlld1kgPSAwO1xuICAgIHRoaXMuY3VycmVudENvbnRyb2wgPSBDb250cm9sTW9kZS5QTEFZRVI7XG4gICAgdGhpcy5pc1BWUCA9IGZhbHNlO1xuICAgIHRoaXMuZnJhbWVDb3VudCA9IDA7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdHYW1lIHJlc2V0Jyk7XG4gIH1cbiAgXG4gIHB1YmxpYyBwYXVzZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5nYW1lTWFuYWdlcikge1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5zZXRQYXVzZWQodHJ1ZSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdHYW1lIHBhdXNlZCcpO1xuICB9XG4gIFxuICBwdWJsaWMgcmVzdW1lKCk6IHZvaWQge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RVcGRhdGVUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5nYW1lTWFuYWdlcikge1xuICAgICAgdGhpcy5nYW1lTWFuYWdlci5zZXRQYXVzZWQoZmFsc2UpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnR2FtZSByZXN1bWVkJyk7XG4gIH1cbiAgXG4gIC8vIFVJIOa4suafk+ePvuWcqOeUsSBVSVN5c3RlbSDomZXnkIbvvIzpgJnlgIvmlrnms5Xlt7LkuI3kvb/nlKhcbiAgXG4gIHByaXZhdGUgcmVuZGVyU3RhdHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmdhbWVNYW5hZ2VyKSByZXR1cm47XG4gICAgXG4gICAgdGhpcy5wLmZpbGwoMCwgMjU1LCAwKTtcbiAgICB0aGlzLnAudGV4dEFsaWduKHRoaXMucC5MRUZUIGFzIGFueSwgdGhpcy5wLlRPUCBhcyBhbnkpO1xuICAgIFxuICAgIGNvbnN0IHN0YXRzID0gdGhpcy5nYW1lTWFuYWdlci5nZXRHYW1lU3RhdHMoKTtcbiAgICBjb25zdCBzdGF0c0xpbmVzID0gW1xuICAgICAgYEZQUzogJHtNYXRoLnJvdW5kKHN0YXRzLmZyYW1lUmF0ZSl9YCxcbiAgICAgIGBUb3RhbCBVbml0czogJHtzdGF0cy50b3RhbFVuaXRzfWAsXG4gICAgICBgT2JzdGFjbGVzOiAke3N0YXRzLnRvdGFsT2JzdGFjbGVzfWAsXG4gICAgICBgQ29udHJvbDogUCR7c3RhdHMuY3VycmVudENvbnRyb2x9YCxcbiAgICAgIGBQVlA6ICR7c3RhdHMuaXNQVlAgPyAnT04nIDogJ09GRid9YCxcbiAgICAgIGBBY3RpdmU6ICR7c3RhdHMuaXNBY3RpdmUgPyAnWUVTJyA6ICdOTyd9YCxcbiAgICAgIGBGcmFtZTogJHt0aGlzLmZyYW1lQ291bnR9YFxuICAgIF07XG4gICAgXG4gICAgbGV0IHlPZmZzZXQgPSAtdGhpcy5jb25maWcuZGlzcGxheUhlaWdodCAvIDIgKyA5MDtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2Ygc3RhdHNMaW5lcykge1xuICAgICAgdGhpcy5wLnRleHQobGluZSwgLXRoaXMuY29uZmlnLmRpc3BsYXlXaWR0aCAvIDIgKyAyMCwgeU9mZnNldCwgMCk7XG4gICAgICB5T2Zmc2V0ICs9IDE4O1xuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSByZW5kZXJEZWJ1ZygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZ2FtZU1hbmFnZXIpIHJldHVybjtcbiAgICBcbiAgICB0aGlzLnAuZmlsbCgyNTUsIDI1NSwgMCk7XG4gICAgdGhpcy5wLnRleHRBbGlnbih0aGlzLnAuTEVGVCBhcyBhbnksIHRoaXMucC5UT1AgYXMgYW55KTtcbiAgICBcbiAgICBjb25zdCBtb3VzZVBvcyA9IHRoaXMuZ2V0V29ybGRNb3VzZVBvc2l0aW9uKCk7XG4gICAgXG4gICAgY29uc3QgZGVidWdMaW5lcyA9IFtcbiAgICAgIGBNb3VzZTogKCR7TWF0aC5yb3VuZChtb3VzZVBvcy54KX0sICR7TWF0aC5yb3VuZChtb3VzZVBvcy55KX0pYCxcbiAgICAgIGBQYXVzZWQ6ICR7dGhpcy5pc1BhdXNlZH1gLFxuICAgICAgYEluaXRpYWxpemVkOiAke3RoaXMuaXNJbml0aWFsaXplZH1gLFxuICAgICAgYEdyb3VwVW5pdHM6ICR7dGhpcy5nYW1lTWFuYWdlci5nZXRHcm91cFVuaXRzKCkubGVuZ3RofWAsXG4gICAgICBgRGlzcGxheTogJHt0aGlzLmNvbmZpZy5kaXNwbGF5V2lkdGh9eCR7dGhpcy5jb25maWcuZGlzcGxheUhlaWdodH1gXG4gICAgXTtcbiAgICBcbiAgICBsZXQgeU9mZnNldCA9IC10aGlzLmNvbmZpZy5kaXNwbGF5SGVpZ2h0IC8gMiArIDIwMDtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGVidWdMaW5lcykge1xuICAgICAgdGhpcy5wLnRleHQobGluZSwgLXRoaXMuY29uZmlnLmRpc3BsYXlXaWR0aCAvIDIgKyAyMCwgeU9mZnNldCwgMCk7XG4gICAgICB5T2Zmc2V0ICs9IDE4O1xuICAgIH1cbiAgfVxuICBcbiAgLy8g5re75Yqg5YWs5YWx5pa55rOV5L6b5aSW6YOo542y5Y+W6YGK5oiy566h55CG5ZmoXG4gIHB1YmxpYyBnZXRHYW1lTWFuYWdlcigpOiBHYW1lTWFuYWdlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZU1hbmFnZXI7XG4gIH1cbiAgXG4gIHB1YmxpYyBpc0dhbWVJbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0luaXRpYWxpemVkO1xuICB9XG59IiwiLy8gQ2FtZXJhU3lzdGVtIC0g55u45qmf57O757Wx77yM6JmV55CG6KaW56qX5bqn5qiZ6L2J5o+b5ZKM55u45qmf5o6n5Yi2XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwZXMvcDUuZC50c1wiIC8+XG5cbmltcG9ydCB7IElWZWN0b3IgfSBmcm9tICcuLi90eXBlcy92ZWN0b3InO1xuaW1wb3J0IHsgVmVjdG9yIH0gZnJvbSAnLi4vdXRpbHMvVmVjdG9yJztcbmltcG9ydCB7IEJvdW5kaW5nQm94IH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcblxuZXhwb3J0IGVudW0gQ2FtZXJhTW9kZSB7XG4gIEZSRUUgPSAnZnJlZScsXG4gIEZPTExPVyA9ICdmb2xsb3cnLFxuICBGSVhFRCA9ICdmaXhlZCdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ2FtZXJhU3lzdGVtIHtcbiAgLy8g55u45qmf5L2N572u5o6n5Yi2XG4gIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyLCB6PzogbnVtYmVyKTogdm9pZDtcbiAgZ2V0UG9zaXRpb24oKTogSVZlY3RvcjtcbiAgbW92ZShkZWx0YVg6IG51bWJlciwgZGVsdGFZOiBudW1iZXIsIGRlbHRhWj86IG51bWJlcik6IHZvaWQ7XG4gIFxuICAvLyDluqfmqJnovYnmj5tcbiAgd29ybGRUb1NjcmVlbih3b3JsZFBvczogSVZlY3Rvcik6IElWZWN0b3I7XG4gIHNjcmVlblRvV29ybGQoc2NyZWVuUG9zOiBJVmVjdG9yKTogSVZlY3RvcjtcbiAgXG4gIC8vIOebuOapn+i3n+maqFxuICBmb2xsb3dUYXJnZXRQb3NpdGlvbih0YXJnZXQ6IElWZWN0b3IsIHNtb290aGluZz86IG51bWJlcik6IHZvaWQ7XG4gIHNldEZvbGxvd1RhcmdldCh0YXJnZXQ6IElWZWN0b3IgfCBudWxsKTogdm9pZDtcbiAgXG4gIC8vIOimlueql+mCiueVjFxuICBzZXRCb3VuZHMoYm91bmRzOiBCb3VuZGluZ0JveCk6IHZvaWQ7XG4gIGdldEJvdW5kcygpOiBCb3VuZGluZ0JveCB8IG51bGw7XG4gIGNvbnN0cmFpblRvQm91bmRzKCk6IHZvaWQ7XG4gIFxuICAvLyDnuK7mlL7mjqfliLZcbiAgc2V0Wm9vbSh6b29tOiBudW1iZXIpOiB2b2lkO1xuICBnZXRab29tKCk6IG51bWJlcjtcbiAgem9vbShmYWN0b3I6IG51bWJlcik6IHZvaWQ7XG4gIFxuICAvLyDmm7TmlrBcbiAgdXBkYXRlKGRlbHRhVGltZTogbnVtYmVyKTogdm9pZDtcbiAgXG4gIC8vIOeLgOaFi+afpeipolxuICBpc0luVmlldyh3b3JsZFBvczogSVZlY3RvciwgbWFyZ2luPzogbnVtYmVyKTogYm9vbGVhbjtcbiAgZ2V0Vmlld0JvdW5kcygpOiBCb3VuZGluZ0JveDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYW1lcmFDb25maWcge1xuICAvLyDln7rmnKzoqK3lrppcbiAgcG9zaXRpb246IElWZWN0b3I7XG4gIHpvb206IG51bWJlcjtcbiAgXG4gIC8vIOi3n+maqOioreWumlxuICBmb2xsb3dTbW9vdGhpbmc6IG51bWJlcjtcbiAgZm9sbG93RGVhZFpvbmU6IG51bWJlcjtcbiAgXG4gIC8vIOenu+WLlemZkOWItlxuICBib3VuZHM/OiBCb3VuZGluZ0JveDtcbiAgbWluWm9vbTogbnVtYmVyO1xuICBtYXhab29tOiBudW1iZXI7XG4gIFxuICAvLyDnp7vli5XpgJ/luqZcbiAgbW92ZVNwZWVkOiBudW1iZXI7XG4gIHpvb21TcGVlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DQU1FUkFfQ09ORklHOiBDYW1lcmFDb25maWcgPSB7XG4gIHBvc2l0aW9uOiB7IHg6IDUxMiwgeTogMzIwLCB6OiA1NTQgfSBhcyBJVmVjdG9yLFxuICB6b29tOiAxLjAsXG4gIGZvbGxvd1Ntb290aGluZzogMC4xLFxuICBmb2xsb3dEZWFkWm9uZTogNTAsXG4gIG1pblpvb206IDAuNSxcbiAgbWF4Wm9vbTogMy4wLFxuICBtb3ZlU3BlZWQ6IDEwLFxuICB6b29tU3BlZWQ6IDAuMVxufTtcblxuZXhwb3J0IGNsYXNzIENhbWVyYVN5c3RlbSBpbXBsZW1lbnRzIElDYW1lcmFTeXN0ZW0ge1xuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIHByaXZhdGUgY2FtZXJhOiBhbnk7IC8vIHA1IENhbWVyYSBvYmplY3RcbiAgcHJpdmF0ZSBjb25maWc6IENhbWVyYUNvbmZpZztcbiAgXG4gIC8vIOebuOapn+eLgOaFi1xuICBwcml2YXRlIHBvc2l0aW9uOiBJVmVjdG9yO1xuICBwcml2YXRlIHRhcmdldFBvc2l0aW9uOiBJVmVjdG9yO1xuICBwcml2YXRlIGN1cnJlbnRab29tOiBudW1iZXI7XG4gIFxuICAvLyDot5/pmqjnm67mqJlcbiAgcHJpdmF0ZSBmb2xsb3dUYXJnZXRPYmo6IElWZWN0b3IgfCBudWxsID0gbnVsbDtcbiAgLy8gcHJpdmF0ZSBfbGFzdEZvbGxvd1Bvc2l0aW9uOiBJVmVjdG9yOyAvLyDmmqvmmYLmnKrkvb/nlKhcbiAgXG4gIC8vIOimlueql+ioreWumlxuICBwcml2YXRlIGRpc3BsYXlXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGRpc3BsYXlIZWlnaHQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBib3VuZHM6IEJvdW5kaW5nQm94IHwgbnVsbCA9IG51bGw7XG4gIFxuICAvLyDlubPmu5Hnp7vli5VcbiAgcHJpdmF0ZSBzbW9vdGhQb3NpdGlvbjogSVZlY3RvcjtcbiAgcHJpdmF0ZSBzbW9vdGhab29tOiBudW1iZXI7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCBkaXNwbGF5V2lkdGg6IG51bWJlciwgZGlzcGxheUhlaWdodDogbnVtYmVyLCBjb25maWc/OiBQYXJ0aWFsPENhbWVyYUNvbmZpZz4pIHtcbiAgICB0aGlzLnAgPSBwO1xuICAgIHRoaXMuZGlzcGxheVdpZHRoID0gZGlzcGxheVdpZHRoO1xuICAgIHRoaXMuZGlzcGxheUhlaWdodCA9IGRpc3BsYXlIZWlnaHQ7XG4gICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfQ0FNRVJBX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgXG4gICAgLy8g5Yid5aeL5YyW5L2N572uXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWN0b3IocCwgdGhpcy5jb25maWcucG9zaXRpb24ueCwgdGhpcy5jb25maWcucG9zaXRpb24ueSwgdGhpcy5jb25maWcucG9zaXRpb24ueiB8fCA1NTQpO1xuICAgIHRoaXMudGFyZ2V0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmNvcHkoKTtcbiAgICB0aGlzLnNtb290aFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XG4gICAgXG4gICAgLy8g5Yid5aeL5YyW57iu5pS+XG4gICAgdGhpcy5jdXJyZW50Wm9vbSA9IHRoaXMuY29uZmlnLnpvb207XG4gICAgdGhpcy5zbW9vdGhab29tID0gdGhpcy5jdXJyZW50Wm9vbTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbot5/pmqjns7vntbFcbiAgICAvLyB0aGlzLl9sYXN0Rm9sbG93UG9zaXRpb24gPSBuZXcgVmVjdG9yKHAsIDAsIDApO1xuICAgIFxuICAgIC8vIOWJteW7uiBwNSDnm7jmqZ9cbiAgICB0aGlzLmluaXRpYWxpemVDYW1lcmEoKTtcbiAgfVxuICBcbiAgcHJpdmF0ZSBpbml0aWFsaXplQ2FtZXJhKCk6IHZvaWQge1xuICAgIC8vIOWcqCBXRUJHTCDmqKHlvI/kuIvlibXlu7rnm7jmqZ9cbiAgICBpZiAoKHRoaXMucCBhcyBhbnkpLmNyZWF0ZUNhbWVyYSkge1xuICAgICAgdGhpcy5jYW1lcmEgPSAodGhpcy5wIGFzIGFueSkuY3JlYXRlQ2FtZXJhKCk7XG4gICAgICB0aGlzLnVwZGF0ZUNhbWVyYVBvc2l0aW9uKCk7XG4gICAgfVxuICB9XG4gIFxuICBwcml2YXRlIHVwZGF0ZUNhbWVyYVBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNhbWVyYSAmJiB0aGlzLmNhbWVyYS5zZXRQb3NpdGlvbikge1xuICAgICAgdGhpcy5jYW1lcmEuc2V0UG9zaXRpb24oXG4gICAgICAgIHRoaXMuc21vb3RoUG9zaXRpb24ueCxcbiAgICAgICAgdGhpcy5zbW9vdGhQb3NpdGlvbi55LFxuICAgICAgICB0aGlzLnNtb290aFBvc2l0aW9uLnogfHwgNTU0XG4gICAgICApO1xuICAgIH1cbiAgfVxuICBcbiAgLy8g55u45qmf5L2N572u5o6n5Yi2XG4gIHB1YmxpYyBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgej86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucG9zaXRpb24uc2V0KHgsIHksIHopO1xuICAgIHRoaXMudGFyZ2V0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmNvcHkoKTtcbiAgICB0aGlzLnNtb290aFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5jb3B5KCk7XG4gICAgdGhpcy51cGRhdGVDYW1lcmFQb3NpdGlvbigpO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0UG9zaXRpb24oKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24uY29weSgpO1xuICB9XG4gIFxuICBwdWJsaWMgbW92ZShkZWx0YVg6IG51bWJlciwgZGVsdGFZOiBudW1iZXIsIGRlbHRhWj86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueCArPSBkZWx0YVg7XG4gICAgdGhpcy50YXJnZXRQb3NpdGlvbi55ICs9IGRlbHRhWTtcbiAgICBpZiAoZGVsdGFaICE9PSB1bmRlZmluZWQgJiYgdGhpcy50YXJnZXRQb3NpdGlvbi56ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueiArPSBkZWx0YVo7XG4gICAgfVxuICAgIFxuICAgIC8vIOe0hOadn+WIsOmCiueVjFxuICAgIHRoaXMuY29uc3RyYWluVG9Cb3VuZHMoKTtcbiAgfVxuICBcbiAgLy8g5bqn5qiZ6L2J5o+bXG4gIHB1YmxpYyB3b3JsZFRvU2NyZWVuKHdvcmxkUG9zOiBJVmVjdG9yKTogSVZlY3RvciB7XG4gICAgLy8g5bCH5LiW55WM5bqn5qiZ6L2J5o+b54K66J6i5bmV5bqn5qiZXG4gICAgY29uc3Qgc2NyZWVuWCA9IHdvcmxkUG9zLnggLSB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLmRpc3BsYXlXaWR0aCAvIDI7XG4gICAgY29uc3Qgc2NyZWVuWSA9IHdvcmxkUG9zLnkgLSB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLmRpc3BsYXlIZWlnaHQgLyAyO1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMucCwgc2NyZWVuWCwgc2NyZWVuWSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBzY3JlZW5Ub1dvcmxkKHNjcmVlblBvczogSVZlY3Rvcik6IElWZWN0b3Ige1xuICAgIC8vIOWwh+ieouW5leW6p+aomei9ieaPm+eCuuS4lueVjOW6p+aomVxuICAgIGNvbnN0IHdvcmxkWCA9IHNjcmVlblBvcy54ICsgdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5kaXNwbGF5V2lkdGggLyAyO1xuICAgIGNvbnN0IHdvcmxkWSA9IHNjcmVlblBvcy55ICsgdGhpcy5wb3NpdGlvbi55IC0gdGhpcy5kaXNwbGF5SGVpZ2h0IC8gMjtcbiAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnAsIHdvcmxkWCwgd29ybGRZKTtcbiAgfVxuICBcbiAgLy8g55u45qmf6Lef6ZqoXG4gIHB1YmxpYyBmb2xsb3dUYXJnZXRQb3NpdGlvbih0YXJnZXQ6IElWZWN0b3IsIHNtb290aGluZz86IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG4gICAgXG4gICAgY29uc3Qgc21vb3RoID0gc21vb3RoaW5nICE9PSB1bmRlZmluZWQgPyBzbW9vdGhpbmcgOiB0aGlzLmNvbmZpZy5mb2xsb3dTbW9vdGhpbmc7XG4gICAgY29uc3QgZGVhZFpvbmUgPSB0aGlzLmNvbmZpZy5mb2xsb3dEZWFkWm9uZTtcbiAgICBcbiAgICAvLyDoqIjnrpfnm67mqJnoiIfnm7jmqZ/nmoTot53pm6JcbiAgICBjb25zdCBkaXN0YW5jZSA9IFZlY3Rvci5kaXN0KHRoaXMucG9zaXRpb24sIHRhcmdldCk7XG4gICAgXG4gICAgLy8g5Y+q5pyJ5Zyo6LaF5Ye65q275Y2A5pmC5omN56e75YuV55u45qmfXG4gICAgaWYgKGRpc3RhbmNlID4gZGVhZFpvbmUpIHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IFZlY3Rvci5zdWIodGhpcy5wLCB0YXJnZXQsIHRoaXMucG9zaXRpb24pO1xuICAgICAgZGlyZWN0aW9uLm5vcm1hbGl6ZSgpO1xuICAgICAgZGlyZWN0aW9uLm11bHQoZGlzdGFuY2UgLSBkZWFkWm9uZSk7XG4gICAgICBcbiAgICAgIC8vIOW5s+a7kei3n+maqFxuICAgICAgZGlyZWN0aW9uLm11bHQoc21vb3RoKTtcbiAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb24uYWRkKGRpcmVjdGlvbik7XG4gICAgICBcbiAgICAgIHRoaXMuY29uc3RyYWluVG9Cb3VuZHMoKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyBzZXRGb2xsb3dUYXJnZXQodGFyZ2V0OiBJVmVjdG9yIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuZm9sbG93VGFyZ2V0T2JqID0gdGFyZ2V0O1xuICAgIC8vIGlmICh0YXJnZXQpIHtcbiAgICAvLyAgIHRoaXMuX2xhc3RGb2xsb3dQb3NpdGlvbiA9IHRhcmdldC5jb3B5KCk7XG4gICAgLy8gfVxuICB9XG4gIFxuICAvLyDoppbnqpfpgornlYxcbiAgcHVibGljIHNldEJvdW5kcyhib3VuZHM6IEJvdW5kaW5nQm94KTogdm9pZCB7XG4gICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRCb3VuZHMoKTogQm91bmRpbmdCb3ggfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5ib3VuZHM7XG4gIH1cbiAgXG4gIHB1YmxpYyBjb25zdHJhaW5Ub0JvdW5kcygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuYm91bmRzKSByZXR1cm47XG4gICAgXG4gICAgY29uc3QgaGFsZldpZHRoID0gdGhpcy5kaXNwbGF5V2lkdGggLyAyO1xuICAgIGNvbnN0IGhhbGZIZWlnaHQgPSB0aGlzLmRpc3BsYXlIZWlnaHQgLyAyO1xuICAgIFxuICAgIC8vIOe0hOadnyBYIOi7uFxuICAgIHRoaXMudGFyZ2V0UG9zaXRpb24ueCA9IE1hdGgubWF4KFxuICAgICAgdGhpcy5ib3VuZHMubGVmdCArIGhhbGZXaWR0aCxcbiAgICAgIE1hdGgubWluKHRoaXMuYm91bmRzLnJpZ2h0IC0gaGFsZldpZHRoLCB0aGlzLnRhcmdldFBvc2l0aW9uLngpXG4gICAgKTtcbiAgICBcbiAgICAvLyDntITmnZ8gWSDou7hcbiAgICB0aGlzLnRhcmdldFBvc2l0aW9uLnkgPSBNYXRoLm1heChcbiAgICAgIHRoaXMuYm91bmRzLnRvcCArIGhhbGZIZWlnaHQsXG4gICAgICBNYXRoLm1pbih0aGlzLmJvdW5kcy5ib3R0b20gLSBoYWxmSGVpZ2h0LCB0aGlzLnRhcmdldFBvc2l0aW9uLnkpXG4gICAgKTtcbiAgfVxuICBcbiAgLy8g57iu5pS+5o6n5Yi2XG4gIHB1YmxpYyBzZXRab29tKHpvb206IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFpvb20gPSBNYXRoLm1heChcbiAgICAgIHRoaXMuY29uZmlnLm1pblpvb20sXG4gICAgICBNYXRoLm1pbih0aGlzLmNvbmZpZy5tYXhab29tLCB6b29tKVxuICAgICk7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRab29tKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFpvb207XG4gIH1cbiAgXG4gIHB1YmxpYyB6b29tKGZhY3RvcjogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRab29tKHRoaXMuY3VycmVudFpvb20gKiBmYWN0b3IpO1xuICB9XG4gIFxuICAvLyDmm7TmlrBcbiAgcHVibGljIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIOiZleeQhui3n+maqOebruaomVxuICAgIGlmICh0aGlzLmZvbGxvd1RhcmdldE9iaikge1xuICAgICAgdGhpcy5mb2xsb3dUYXJnZXRQb3NpdGlvbih0aGlzLmZvbGxvd1RhcmdldE9iaik7XG4gICAgfVxuICAgIFxuICAgIC8vIOW5s+a7keenu+WLleWIsOebruaomeS9jee9rlxuICAgIGNvbnN0IGxlcnBGYWN0b3IgPSBNYXRoLm1pbigxLjAsIGRlbHRhVGltZSAqIDUpOyAvLyDoqr/mlbTlubPmu5HluqZcbiAgICBcbiAgICB0aGlzLnNtb290aFBvc2l0aW9uLnggPSB0aGlzLmxlcnAodGhpcy5zbW9vdGhQb3NpdGlvbi54LCB0aGlzLnRhcmdldFBvc2l0aW9uLngsIGxlcnBGYWN0b3IpO1xuICAgIHRoaXMuc21vb3RoUG9zaXRpb24ueSA9IHRoaXMubGVycCh0aGlzLnNtb290aFBvc2l0aW9uLnksIHRoaXMudGFyZ2V0UG9zaXRpb24ueSwgbGVycEZhY3Rvcik7XG4gICAgaWYgKHRoaXMuc21vb3RoUG9zaXRpb24ueiAhPT0gdW5kZWZpbmVkICYmIHRoaXMudGFyZ2V0UG9zaXRpb24ueiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNtb290aFBvc2l0aW9uLnogPSB0aGlzLmxlcnAodGhpcy5zbW9vdGhQb3NpdGlvbi56LCB0aGlzLnRhcmdldFBvc2l0aW9uLnosIGxlcnBGYWN0b3IpO1xuICAgIH1cbiAgICBcbiAgICAvLyDlubPmu5HnuK7mlL5cbiAgICB0aGlzLnNtb290aFpvb20gPSB0aGlzLmxlcnAodGhpcy5zbW9vdGhab29tLCB0aGlzLmN1cnJlbnRab29tLCBsZXJwRmFjdG9yKTtcbiAgICBcbiAgICAvLyDmm7TmlrDlr6bpmpvnm7jmqZ/kvY3nva5cbiAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5zbW9vdGhQb3NpdGlvbi5jb3B5KCk7XG4gICAgdGhpcy51cGRhdGVDYW1lcmFQb3NpdGlvbigpO1xuICB9XG4gIFxuICBwcml2YXRlIGxlcnAoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHN0YXJ0ICsgKGVuZCAtIHN0YXJ0KSAqIHQ7XG4gIH1cbiAgXG4gIC8vIOeLgOaFi+afpeipolxuICBwdWJsaWMgaXNJblZpZXcod29ybGRQb3M6IElWZWN0b3IsIG1hcmdpbjogbnVtYmVyID0gMCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNjcmVlblBvcyA9IHRoaXMud29ybGRUb1NjcmVlbih3b3JsZFBvcyk7XG4gICAgXG4gICAgcmV0dXJuIHNjcmVlblBvcy54ID49IC1tYXJnaW4gJiZcbiAgICAgICAgICAgc2NyZWVuUG9zLnggPD0gdGhpcy5kaXNwbGF5V2lkdGggKyBtYXJnaW4gJiZcbiAgICAgICAgICAgc2NyZWVuUG9zLnkgPj0gLW1hcmdpbiAmJlxuICAgICAgICAgICBzY3JlZW5Qb3MueSA8PSB0aGlzLmRpc3BsYXlIZWlnaHQgKyBtYXJnaW47XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRWaWV3Qm91bmRzKCk6IEJvdW5kaW5nQm94IHtcbiAgICBjb25zdCBoYWxmV2lkdGggPSB0aGlzLmRpc3BsYXlXaWR0aCAvIDI7XG4gICAgY29uc3QgaGFsZkhlaWdodCA9IHRoaXMuZGlzcGxheUhlaWdodCAvIDI7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IHRoaXMucG9zaXRpb24ueCAtIGhhbGZXaWR0aCxcbiAgICAgIHJpZ2h0OiB0aGlzLnBvc2l0aW9uLnggKyBoYWxmV2lkdGgsXG4gICAgICB0b3A6IHRoaXMucG9zaXRpb24ueSAtIGhhbGZIZWlnaHQsXG4gICAgICBib3R0b206IHRoaXMucG9zaXRpb24ueSArIGhhbGZIZWlnaHRcbiAgICB9O1xuICB9XG4gIFxuICAvLyDnm7jmqZ/pnIfli5XmlYjmnpzvvIjmmqvmmYLnp7vpmaTvvIlcbiAgXG4gIHB1YmxpYyBzaGFrZShfaW50ZW5zaXR5OiBudW1iZXIsIF9kdXJhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8g5pqr5pmC5pyq5a+m5L2cXG4gIH1cbiAgXG4gIC8vIOaaq+aZguenu+mZpCBfdXBkYXRlU2hha2Ug5pa55rOV77yM5pyq5L2/55SoXG4gIFxuICAvLyDnm7jmqZ/np7vli5XmqKHlvI9cbiAgcHJpdmF0ZSBjYW1lcmFNb2RlOiBDYW1lcmFNb2RlID0gQ2FtZXJhTW9kZS5GUkVFO1xuICBcbiAgcHVibGljIHNldENhbWVyYU1vZGUobW9kZTogQ2FtZXJhTW9kZSk6IHZvaWQge1xuICAgIHRoaXMuY2FtZXJhTW9kZSA9IG1vZGU7XG4gICAgXG4gICAgaWYgKG1vZGUgIT09IENhbWVyYU1vZGUuRk9MTE9XKSB7XG4gICAgICB0aGlzLmZvbGxvd1RhcmdldE9iaiA9IG51bGw7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0Q2FtZXJhTW9kZSgpOiBDYW1lcmFNb2RlIHtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmFNb2RlIGFzIENhbWVyYU1vZGU7XG4gIH1cbiAgXG4gIC8vIOW5s+a7kee4ruaUvuWIsOebruaomVxuICBwdWJsaWMgem9vbVRvVGFyZ2V0KHRhcmdldDogSVZlY3RvciwgdGFyZ2V0Wm9vbTogbnVtYmVyLCBfZHVyYXRpb246IG51bWJlciA9IDEwMDApOiB2b2lkIHtcbiAgICAvLyDlr6bkvZzlubPmu5HnuK7mlL7lkoznp7vli5XliLDnm67mqJlcbiAgICB0aGlzLnNldEZvbGxvd1RhcmdldCh0YXJnZXQpO1xuICAgIHRoaXMuc2V0Wm9vbSh0YXJnZXRab29tKTtcbiAgfVxuICBcbiAgLy8g6YeN572u55u45qmfXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFBvc2l0aW9uKFxuICAgICAgdGhpcy5jb25maWcucG9zaXRpb24ueCxcbiAgICAgIHRoaXMuY29uZmlnLnBvc2l0aW9uLnksXG4gICAgICB0aGlzLmNvbmZpZy5wb3NpdGlvbi56XG4gICAgKTtcbiAgICB0aGlzLnNldFpvb20odGhpcy5jb25maWcuem9vbSk7XG4gICAgdGhpcy5zZXRGb2xsb3dUYXJnZXQobnVsbCk7XG4gICAgLy8gdGhpcy5zaGFrZUludGVuc2l0eSA9IDA7XG4gICAgLy8gdGhpcy5zaGFrZVRpbWVyID0gMDtcbiAgfVxuICBcbiAgLy8g55u45qmf6YWN572u5pu05pawXG4gIHB1YmxpYyB1cGRhdGVDb25maWcoY29uZmlnOiBQYXJ0aWFsPENhbWVyYUNvbmZpZz4pOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0Q29uZmlnKCk6IENhbWVyYUNvbmZpZyB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcbiAgfVxuICBcbiAgLy8g6KaW6YeO6KiI566XXG4gIHB1YmxpYyBnZXRGT1YoKTogbnVtYmVyIHtcbiAgICAvLyDln7rmlrwgeiDkvY3nva7oqIjnrpfoppbph47op5LluqZcbiAgICBjb25zdCB6ID0gdGhpcy5wb3NpdGlvbi56IHx8IDU1NDtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLmRpc3BsYXlIZWlnaHQgLyAyLCB6KSAqIDI7XG4gIH1cbiAgXG4gIC8vIOWPr+imluevhOWcjeWFp+eahOeJqeS7tuevqemBuFxuICBwdWJsaWMgZmlsdGVyVmlzaWJsZU9iamVjdHM8VCBleHRlbmRzIHsgcG9zaXRpb246IElWZWN0b3IgfT4ob2JqZWN0czogVFtdLCBtYXJnaW46IG51bWJlciA9IDEwMCk6IFRbXSB7XG4gICAgcmV0dXJuIG9iamVjdHMuZmlsdGVyKG9iaiA9PiB0aGlzLmlzSW5WaWV3KG9iai5wb3NpdGlvbiwgbWFyZ2luKSk7XG4gIH1cbiAgXG4gIC8vIOebuOapn+e1seioiOizh+ioilxuICBwdWJsaWMgZ2V0U3RhdHMoKToge1xuICAgIHBvc2l0aW9uOiBJVmVjdG9yO1xuICAgIHpvb206IG51bWJlcjtcbiAgICB2aWV3Qm91bmRzOiBCb3VuZGluZ0JveDtcbiAgICBmb2xsb3dUYXJnZXQ6IElWZWN0b3IgfCBudWxsO1xuICAgIG1vZGU6IENhbWVyYU1vZGU7XG4gIH0ge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5nZXRQb3NpdGlvbigpLFxuICAgICAgem9vbTogdGhpcy5nZXRab29tKCksXG4gICAgICB2aWV3Qm91bmRzOiB0aGlzLmdldFZpZXdCb3VuZHMoKSxcbiAgICAgIGZvbGxvd1RhcmdldDogdGhpcy5mb2xsb3dUYXJnZXRPYmosXG4gICAgICBtb2RlOiB0aGlzLmNhbWVyYU1vZGVcbiAgICB9O1xuICB9XG59IiwiLy8gSW5wdXRTeXN0ZW0gLSDovLjlhaXns7vntbHvvIzntbHkuIDomZXnkIbpjbXnm6Tlkozmu5HpvKDovLjlhaVcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBlcy9wNS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgSVZlY3RvciB9IGZyb20gJy4uL3R5cGVzL3ZlY3Rvcic7XG5pbXBvcnQgeyBWZWN0b3IgfSBmcm9tICcuLi91dGlscy9WZWN0b3InO1xuXG5leHBvcnQgaW50ZXJmYWNlIElJbnB1dFN5c3RlbSB7XG4gIC8vIOabtOaWsOaWueazlVxuICB1cGRhdGUoZGVsdGFUaW1lOiBudW1iZXIpOiB2b2lkO1xuICBcbiAgLy8g5ruR6byg6Ly45YWlXG4gIG9uTW91c2VQcmVzc2VkKG1vdXNlWDogbnVtYmVyLCBtb3VzZVk6IG51bWJlcik6IHZvaWQ7XG4gIGdldE1vdXNlUG9zaXRpb24oKTogSVZlY3RvcjtcbiAgZ2V0V29ybGRNb3VzZVBvc2l0aW9uKHZpZXdYOiBudW1iZXIsIHZpZXdZOiBudW1iZXIsIGRpc3BsYXlXaWR0aDogbnVtYmVyLCBkaXNwbGF5SGVpZ2h0OiBudW1iZXIpOiBJVmVjdG9yO1xuICBcbiAgLy8g6Y2155uk6Ly45YWlXG4gIG9uS2V5UHJlc3NlZChrZXlDb2RlOiBudW1iZXIpOiB2b2lkO1xuICBvbktleVJlbGVhc2VkKGtleUNvZGU6IG51bWJlcik6IHZvaWQ7XG4gIGlzS2V5UHJlc3NlZChrZXlDb2RlOiBudW1iZXIpOiBib29sZWFuO1xuICBcbiAgLy8g55u45qmf5o6n5Yi2XG4gIGdldENhbWVyYU1vdmVtZW50KCk6IElWZWN0b3I7XG4gIFxuICAvLyDovLjlhaXmmKDlsITphY3nva5cbiAgc2V0S2V5TWFwcGluZyhhY3Rpb246IHN0cmluZywga2V5Q29kZTogbnVtYmVyKTogdm9pZDtcbiAgZ2V0S2V5TWFwcGluZyhhY3Rpb246IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgXG4gIC8vIOi8uOWFpeW7tumBsuiZleeQhlxuICBzZXRJbnB1dERlbGF5KGRlbGF5OiBudW1iZXIpOiB2b2lkO1xuICBcbiAgLy8g5LqL5Lu255uj6IG9XG4gIGFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBJbnB1dEV2ZW50VHlwZSwgY2FsbGJhY2s6IElucHV0RXZlbnRDYWxsYmFjayk6IHZvaWQ7XG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBJbnB1dEV2ZW50VHlwZSwgY2FsbGJhY2s6IElucHV0RXZlbnRDYWxsYmFjayk6IHZvaWQ7XG59XG5cbmV4cG9ydCBlbnVtIElucHV0RXZlbnRUeXBlIHtcbiAgTU9VU0VfQ0xJQ0sgPSAnbW91c2VfY2xpY2snLFxuICBNT1VTRV9NT1ZFID0gJ21vdXNlX21vdmUnLFxuICBLRVlfRE9XTiA9ICdrZXlfZG93bicsXG4gIEtFWV9VUCA9ICdrZXlfdXAnLFxuICBDQU1FUkFfTU9WRSA9ICdjYW1lcmFfbW92ZSdcbn1cblxuZXhwb3J0IHR5cGUgSW5wdXRFdmVudENhbGxiYWNrID0gKGV2ZW50OiBJbnB1dEV2ZW50KSA9PiB2b2lkO1xuXG5leHBvcnQgaW50ZXJmYWNlIElucHV0RXZlbnQge1xuICB0eXBlOiBJbnB1dEV2ZW50VHlwZTtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIG1vdXNlUG9zaXRpb24/OiBJVmVjdG9yO1xuICB3b3JsZFBvc2l0aW9uPzogSVZlY3RvcjtcbiAga2V5Q29kZT86IG51bWJlcjtcbiAgbW92ZW1lbnQ/OiBJVmVjdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleU1hcHBpbmcge1xuICAvLyDnm7jmqZ/mjqfliLZcbiAgQ0FNRVJBX1VQOiBudW1iZXI7XG4gIENBTUVSQV9ET1dOOiBudW1iZXI7XG4gIENBTUVSQV9MRUZUOiBudW1iZXI7XG4gIENBTUVSQV9SSUdIVDogbnVtYmVyO1xuICBcbiAgLy8g6YGK5oiy5o6n5Yi2XG4gIFRPR0dMRV9QVlA6IG51bWJlcjtcbiAgQ0hBTkdFX0NPTlRST0w6IG51bWJlcjtcbiAgQUREX1VOSVRTOiBudW1iZXI7XG4gIFxuICAvLyDpoa/npLrpgbjpoIVcbiAgVE9HR0xFX0FSUk9XUzogbnVtYmVyO1xuICBUT0dHTEVfVEFSR0VUX0xJTkVTOiBudW1iZXI7XG4gIFRPR0dMRV9VTklUX1NUQVRTOiBudW1iZXI7XG4gIFRPR0dMRV9ERUJVRzogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9LRVlfTUFQUElORzogS2V5TWFwcGluZyA9IHtcbiAgQ0FNRVJBX1VQOiA4NywgICAgLy8gV1xuICBDQU1FUkFfRE9XTjogODMsICAvLyBTXG4gIENBTUVSQV9MRUZUOiA2NSwgIC8vIEFcbiAgQ0FNRVJBX1JJR0hUOiA2OCwgLy8gRFxuICBUT0dHTEVfUFZQOiA4MCwgICAvLyBQXG4gIENIQU5HRV9DT05UUk9MOiA2NywgLy8gQ1xuICBBRERfVU5JVFM6IDg1LCAgICAvLyBVXG4gIFRPR0dMRV9BUlJPV1M6IDQ5LCAgICAgIC8vIDFcbiAgVE9HR0xFX1RBUkdFVF9MSU5FUzogNTAsIC8vIDJcbiAgVE9HR0xFX1VOSVRfU1RBVFM6IDUxLCAgIC8vIDNcbiAgVE9HR0xFX0RFQlVHOiA1MiAgICAgICAgIC8vIDRcbn07XG5cbmV4cG9ydCBjbGFzcyBJbnB1dFN5c3RlbSBpbXBsZW1lbnRzIElJbnB1dFN5c3RlbSB7XG4gIHByaXZhdGUgcDogcDVJbnN0YW5jZTtcbiAgcHJpdmF0ZSBrZXlNYXBwaW5nOiBLZXlNYXBwaW5nO1xuICBwcml2YXRlIHByZXNzZWRLZXlzOiBTZXQ8bnVtYmVyPjtcbiAgcHJpdmF0ZSBsYXN0SW5wdXRUaW1lOiBudW1iZXI7XG4gIHByaXZhdGUgaW5wdXREZWxheTogbnVtYmVyO1xuICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzOiBNYXA8SW5wdXRFdmVudFR5cGUsIElucHV0RXZlbnRDYWxsYmFja1tdPjtcbiAgXG4gIC8vIOa7kem8oOeLgOaFi1xuICBwcml2YXRlIG1vdXNlUG9zaXRpb246IElWZWN0b3I7XG4gIHByaXZhdGUgbGFzdE1vdXNlUG9zaXRpb246IElWZWN0b3I7XG4gIHByaXZhdGUgbW91c2VQcmVzc2VkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgbGFzdE1vdXNlUHJlc3NUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIG1vdXNlQ2xpY2tEZWxheTogbnVtYmVyID0gMjAwOyAvLyDpmLLmraLph43opIfpu57mk4pcbiAgXG4gIC8vIOebuOapn+enu+WLlVxuICBwcml2YXRlIGNhbWVyYU1vdmVtZW50OiBJVmVjdG9yO1xuICBwcml2YXRlIGNhbWVyYU1vdmVTcGVlZDogbnVtYmVyID0gMTA7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCBrZXlNYXBwaW5nPzogUGFydGlhbDxLZXlNYXBwaW5nPikge1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5rZXlNYXBwaW5nID0geyAuLi5ERUZBVUxUX0tFWV9NQVBQSU5HLCAuLi5rZXlNYXBwaW5nIH07XG4gICAgdGhpcy5wcmVzc2VkS2V5cyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmxhc3RJbnB1dFRpbWUgPSAwO1xuICAgIHRoaXMuaW5wdXREZWxheSA9IDQxOyAvLyDlpKfntIQgMjQgRlBTIOeahOmWk+malFxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG4gICAgXG4gICAgdGhpcy5tb3VzZVBvc2l0aW9uID0gbmV3IFZlY3RvcihwLCAwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uID0gbmV3IFZlY3RvcihwLCAwLCAwKTtcbiAgICB0aGlzLmNhbWVyYU1vdmVtZW50ID0gbmV3IFZlY3RvcihwLCAwLCAwKTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbkuovku7bnm6Pogb3lmajmmKDlsIRcbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuICB9XG4gIFxuICBwcml2YXRlIGluaXRpYWxpemVFdmVudExpc3RlbmVycygpOiB2b2lkIHtcbiAgICBPYmplY3QudmFsdWVzKElucHV0RXZlbnRUeXBlKS5mb3JFYWNoKGV2ZW50VHlwZSA9PiB7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXJzLnNldChldmVudFR5cGUsIFtdKTtcbiAgICB9KTtcbiAgfVxuICBcbiAgLy8g5pu05paw5pa55rOVXG4gIHB1YmxpYyB1cGRhdGUoX2RlbHRhVGltZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIFxuICAgIC8vIOaqouafpei8uOWFpeW7tumBslxuICAgIGlmIChjdXJyZW50VGltZSAtIHRoaXMubGFzdElucHV0VGltZSA8IHRoaXMuaW5wdXREZWxheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICAvLyDmm7TmlrDnm7jmqZ/np7vli5VcbiAgICB0aGlzLnVwZGF0ZUNhbWVyYU1vdmVtZW50KCk7XG4gICAgXG4gICAgLy8g5pu05paw5ruR6byg5L2N572u77yI5aaC5p6c5pyJ56e75YuV77yJXG4gICAgaWYgKHRoaXMubW91c2VQb3NpdGlvbi54ICE9PSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnggfHwgXG4gICAgICAgIHRoaXMubW91c2VQb3NpdGlvbi55ICE9PSB0aGlzLmxhc3RNb3VzZVBvc2l0aW9uLnkpIHtcbiAgICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgICAgdHlwZTogSW5wdXRFdmVudFR5cGUuTU9VU0VfTU9WRSxcbiAgICAgICAgdGltZXN0YW1wOiBjdXJyZW50VGltZSxcbiAgICAgICAgbW91c2VQb3NpdGlvbjogdGhpcy5tb3VzZVBvc2l0aW9uLmNvcHkoKVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHRoaXMubGFzdE1vdXNlUG9zaXRpb24gPSB0aGlzLm1vdXNlUG9zaXRpb24uY29weSgpO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmxhc3RJbnB1dFRpbWUgPSBjdXJyZW50VGltZTtcbiAgfVxuICBcbiAgLy8g5ruR6byg6Ly45YWl6JmV55CGXG4gIHB1YmxpYyBvbk1vdXNlUHJlc3NlZChtb3VzZVg6IG51bWJlciwgbW91c2VZOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XG4gICAgXG4gICAgLy8g6Ziy5q2i6YeN6KSH6bue5pOKXG4gICAgaWYgKGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0TW91c2VQcmVzc1RpbWUgPCB0aGlzLm1vdXNlQ2xpY2tEZWxheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLm1vdXNlUG9zaXRpb24uc2V0KG1vdXNlWCwgbW91c2VZKTtcbiAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IHRydWU7XG4gICAgdGhpcy5sYXN0TW91c2VQcmVzc1RpbWUgPSBjdXJyZW50VGltZTtcbiAgICBcbiAgICAvLyDop7jnmbzmu5HpvKDpu57mk4rkuovku7ZcbiAgICB0aGlzLnRyaWdnZXJFdmVudCh7XG4gICAgICB0eXBlOiBJbnB1dEV2ZW50VHlwZS5NT1VTRV9DTElDSyxcbiAgICAgIHRpbWVzdGFtcDogY3VycmVudFRpbWUsXG4gICAgICBtb3VzZVBvc2l0aW9uOiB0aGlzLm1vdXNlUG9zaXRpb24uY29weSgpXG4gICAgfSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRNb3VzZVBvc2l0aW9uKCk6IElWZWN0b3Ige1xuICAgIHJldHVybiB0aGlzLm1vdXNlUG9zaXRpb24uY29weSgpO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0V29ybGRNb3VzZVBvc2l0aW9uKHZpZXdYOiBudW1iZXIsIHZpZXdZOiBudW1iZXIsIGRpc3BsYXlXaWR0aDogbnVtYmVyLCBkaXNwbGF5SGVpZ2h0OiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICBjb25zdCB3b3JsZFggPSB0aGlzLm1vdXNlUG9zaXRpb24ueCAtIChkaXNwbGF5V2lkdGggLyAyIC0gdmlld1gpO1xuICAgIGNvbnN0IHdvcmxkWSA9IHRoaXMubW91c2VQb3NpdGlvbi55IC0gKGRpc3BsYXlIZWlnaHQgLyAyIC0gdmlld1kpO1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXMucCwgd29ybGRYLCB3b3JsZFkpO1xuICB9XG4gIFxuICAvLyDpjbXnm6TovLjlhaXomZXnkIZcbiAgcHVibGljIG9uS2V5UHJlc3NlZChrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5oYXMoa2V5Q29kZSkpIHtcbiAgICAgIHJldHVybjsgLy8g5bey57aT5oyJ5LiL77yM6YG/5YWN6YeN6KSH6Ke455m8XG4gICAgfVxuICAgIFxuICAgIHRoaXMucHJlc3NlZEtleXMuYWRkKGtleUNvZGUpO1xuICAgIFxuICAgIC8vIOinuOeZvOaMiemNteS6i+S7tlxuICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgIHR5cGU6IElucHV0RXZlbnRUeXBlLktFWV9ET1dOLFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAga2V5Q29kZVxuICAgIH0pO1xuICAgIFxuICAgIC8vIOiZleeQhueJueauiuaMiemNtVxuICAgIHRoaXMuaGFuZGxlU3BlY2lhbEtleXMoa2V5Q29kZSk7XG4gIH1cbiAgXG4gIHB1YmxpYyBvbktleVJlbGVhc2VkKGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucHJlc3NlZEtleXMuZGVsZXRlKGtleUNvZGUpO1xuICAgIFxuICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgIHR5cGU6IElucHV0RXZlbnRUeXBlLktFWV9VUCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGtleUNvZGVcbiAgICB9KTtcbiAgfVxuICBcbiAgcHVibGljIGlzS2V5UHJlc3NlZChrZXlDb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcmVzc2VkS2V5cy5oYXMoa2V5Q29kZSk7XG4gIH1cbiAgXG4gIC8vIOebuOapn+aOp+WItlxuICBwdWJsaWMgZ2V0Q2FtZXJhTW92ZW1lbnQoKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIHRoaXMuY2FtZXJhTW92ZW1lbnQuY29weSgpO1xuICB9XG4gIFxuICBwcml2YXRlIHVwZGF0ZUNhbWVyYU1vdmVtZW50KCk6IHZvaWQge1xuICAgIHRoaXMuY2FtZXJhTW92ZW1lbnQuc2V0KDAsIDApO1xuICAgIFxuICAgIC8vIOaqouafpeebuOapn+enu+WLleaMiemNtVxuICAgIGlmICh0aGlzLmlzS2V5UHJlc3NlZCh0aGlzLmtleU1hcHBpbmcuQ0FNRVJBX1VQKSkge1xuICAgICAgdGhpcy5jYW1lcmFNb3ZlbWVudC55IC09IHRoaXMuY2FtZXJhTW92ZVNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleVByZXNzZWQodGhpcy5rZXlNYXBwaW5nLkNBTUVSQV9ET1dOKSkge1xuICAgICAgdGhpcy5jYW1lcmFNb3ZlbWVudC55ICs9IHRoaXMuY2FtZXJhTW92ZVNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleVByZXNzZWQodGhpcy5rZXlNYXBwaW5nLkNBTUVSQV9MRUZUKSkge1xuICAgICAgdGhpcy5jYW1lcmFNb3ZlbWVudC54IC09IHRoaXMuY2FtZXJhTW92ZVNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0tleVByZXNzZWQodGhpcy5rZXlNYXBwaW5nLkNBTUVSQV9SSUdIVCkpIHtcbiAgICAgIHRoaXMuY2FtZXJhTW92ZW1lbnQueCArPSB0aGlzLmNhbWVyYU1vdmVTcGVlZDtcbiAgICB9XG4gICAgXG4gICAgLy8g5aaC5p6c5pyJ55u45qmf56e75YuV77yM6Ke455m85LqL5Lu2XG4gICAgaWYgKHRoaXMuY2FtZXJhTW92ZW1lbnQubWFnKCkgPiAwKSB7XG4gICAgICB0aGlzLnRyaWdnZXJFdmVudCh7XG4gICAgICAgIHR5cGU6IElucHV0RXZlbnRUeXBlLkNBTUVSQV9NT1ZFLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIG1vdmVtZW50OiB0aGlzLmNhbWVyYU1vdmVtZW50LmNvcHkoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDomZXnkIbnibnmrormjInpjbVcbiAgcHJpdmF0ZSBoYW5kbGVTcGVjaWFsS2V5cyhrZXlDb2RlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyDpgJnoo6Hlj6/ku6XomZXnkIbkuIDkupvnq4vljbPpn7/mh4nnmoTmjInpjbVcbiAgICAvLyDlpKfpg6jliIbpgo/ovK/mnIPpgJrpgY7kuovku7bns7vntbHomZXnkIZcbiAgICBcbiAgICAvLyDkvovlpoLvvJpFU0Mg6Y215pqr5YGc6YGK5oiyXG4gICAgaWYgKGtleUNvZGUgPT09IDI3KSB7IC8vIEVTQ1xuICAgICAgLy8g5Y+v5Lul6Ke455m85pqr5YGc5LqL5Lu2XG4gICAgfVxuICB9XG4gIFxuICAvLyDovLjlhaXmmKDlsITphY3nva5cbiAgcHVibGljIHNldEtleU1hcHBpbmcoYWN0aW9uOiBzdHJpbmcsIGtleUNvZGU6IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChhY3Rpb24gaW4gdGhpcy5rZXlNYXBwaW5nKSB7XG4gICAgICAodGhpcy5rZXlNYXBwaW5nIGFzIGFueSlbYWN0aW9uXSA9IGtleUNvZGU7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0S2V5TWFwcGluZyhhY3Rpb246IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuICh0aGlzLmtleU1hcHBpbmcgYXMgYW55KVthY3Rpb25dO1xuICB9XG4gIFxuICAvLyDovLjlhaXlu7bpgbLomZXnkIZcbiAgcHVibGljIHNldElucHV0RGVsYXkoZGVsYXk6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuaW5wdXREZWxheSA9IE1hdGgubWF4KDAsIGRlbGF5KTtcbiAgfVxuICBcbiAgcHVibGljIHNldENhbWVyYU1vdmVTcGVlZChzcGVlZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jYW1lcmFNb3ZlU3BlZWQgPSBNYXRoLm1heCgxLCBzcGVlZCk7XG4gIH1cbiAgXG4gIHB1YmxpYyBzZXRNb3VzZUNsaWNrRGVsYXkoZGVsYXk6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubW91c2VDbGlja0RlbGF5ID0gTWF0aC5tYXgoMCwgZGVsYXkpO1xuICB9XG4gIFxuICAvLyDkuovku7bnm6Pogb1cbiAgcHVibGljIGFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBJbnB1dEV2ZW50VHlwZSwgY2FsbGJhY2s6IElucHV0RXZlbnRDYWxsYmFjayk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50VHlwZSk7XG4gICAgaWYgKGxpc3RlbmVycyAmJiAhbGlzdGVuZXJzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBJbnB1dEV2ZW50VHlwZSwgY2FsbGJhY2s6IElucHV0RXZlbnRDYWxsYmFjayk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50VHlwZSk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSB0cmlnZ2VyRXZlbnQoZXZlbnQ6IElucHV0RXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY2FsbGJhY2soZXZlbnQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIGlucHV0IGV2ZW50IGNhbGxiYWNrIGZvciAke2V2ZW50LnR5cGV9OmAsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIFxuICAvLyDovLjlhaXni4DmhYvmn6XoqaJcbiAgcHVibGljIGdldElucHV0U3RhdGUoKToge1xuICAgIHByZXNzZWRLZXlzOiBudW1iZXJbXTtcbiAgICBtb3VzZVBvc2l0aW9uOiBJVmVjdG9yO1xuICAgIG1vdXNlUHJlc3NlZDogYm9vbGVhbjtcbiAgICBjYW1lcmFNb3ZlbWVudDogSVZlY3RvcjtcbiAgfSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXNzZWRLZXlzOiBBcnJheS5mcm9tKHRoaXMucHJlc3NlZEtleXMpLFxuICAgICAgbW91c2VQb3NpdGlvbjogdGhpcy5tb3VzZVBvc2l0aW9uLmNvcHkoKSxcbiAgICAgIG1vdXNlUHJlc3NlZDogdGhpcy5tb3VzZVByZXNzZWQsXG4gICAgICBjYW1lcmFNb3ZlbWVudDogdGhpcy5jYW1lcmFNb3ZlbWVudC5jb3B5KClcbiAgICB9O1xuICB9XG4gIFxuICAvLyDovJTliqnmlrnms5VcbiAgcHVibGljIGlzTW92ZW1lbnRLZXkoa2V5Q29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleUNvZGUgPT09IHRoaXMua2V5TWFwcGluZy5DQU1FUkFfVVAgfHxcbiAgICAgICAgICAga2V5Q29kZSA9PT0gdGhpcy5rZXlNYXBwaW5nLkNBTUVSQV9ET1dOIHx8XG4gICAgICAgICAgIGtleUNvZGUgPT09IHRoaXMua2V5TWFwcGluZy5DQU1FUkFfTEVGVCB8fFxuICAgICAgICAgICBrZXlDb2RlID09PSB0aGlzLmtleU1hcHBpbmcuQ0FNRVJBX1JJR0hUO1xuICB9XG4gIFxuICBwdWJsaWMgaXNBbnlNb3ZlbWVudEtleVByZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNLZXlQcmVzc2VkKHRoaXMua2V5TWFwcGluZy5DQU1FUkFfVVApIHx8XG4gICAgICAgICAgIHRoaXMuaXNLZXlQcmVzc2VkKHRoaXMua2V5TWFwcGluZy5DQU1FUkFfRE9XTikgfHxcbiAgICAgICAgICAgdGhpcy5pc0tleVByZXNzZWQodGhpcy5rZXlNYXBwaW5nLkNBTUVSQV9MRUZUKSB8fFxuICAgICAgICAgICB0aGlzLmlzS2V5UHJlc3NlZCh0aGlzLmtleU1hcHBpbmcuQ0FNRVJBX1JJR0hUKTtcbiAgfVxuICBcbiAgLy8g6Ly45YWl5q235Y+y6KiY6YyE77yI55So5pa86Zmk6Yyv77yJXG4gIHByaXZhdGUgaW5wdXRIaXN0b3J5OiBJbnB1dEV2ZW50W10gPSBbXTtcbiAgLy8gcHJpdmF0ZSBfbWF4SGlzdG9yeVNpemU6IG51bWJlciA9IDEwMDsgLy8g5pqr5pmC5pyq5L2/55SoXG4gIFxuICBwdWJsaWMgZ2V0SW5wdXRIaXN0b3J5KCk6IElucHV0RXZlbnRbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmlucHV0SGlzdG9yeV07XG4gIH1cbiAgXG4gIHB1YmxpYyBjbGVhcklucHV0SGlzdG9yeSgpOiB2b2lkIHtcbiAgICB0aGlzLmlucHV0SGlzdG9yeSA9IFtdO1xuICB9XG4gIFxuICAvLyDmmqvmmYLnp7vpmaQgX2FkZFRvSGlzdG9yeSDmlrnms5XvvIzmnKrkvb/nlKhcbn1cblxuLy8g6Ly45YWl6JmV55CG5bel5YW35Ye95pW4XG5leHBvcnQgY2xhc3MgSW5wdXRVdGlscyB7XG4gIC8vIOaMiemNteeivOi9ieaPm1xuICBwdWJsaWMgc3RhdGljIGtleUNvZGVUb1N0cmluZyhrZXlDb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGtleU1hcDogeyBba2V5OiBudW1iZXJdOiBzdHJpbmcgfSA9IHtcbiAgICAgIDg6ICdCYWNrc3BhY2UnLFxuICAgICAgOTogJ1RhYicsXG4gICAgICAxMzogJ0VudGVyJyxcbiAgICAgIDE2OiAnU2hpZnQnLFxuICAgICAgMTc6ICdDdHJsJyxcbiAgICAgIDE4OiAnQWx0JyxcbiAgICAgIDI3OiAnRXNjYXBlJyxcbiAgICAgIDMyOiAnU3BhY2UnLFxuICAgICAgMzc6ICdMZWZ0JyxcbiAgICAgIDM4OiAnVXAnLFxuICAgICAgMzk6ICdSaWdodCcsXG4gICAgICA0MDogJ0Rvd24nLFxuICAgICAgNjU6ICdBJywgNjY6ICdCJywgNjc6ICdDJywgNjg6ICdEJywgNjk6ICdFJywgNzA6ICdGJywgNzE6ICdHJywgNzI6ICdIJyxcbiAgICAgIDczOiAnSScsIDc0OiAnSicsIDc1OiAnSycsIDc2OiAnTCcsIDc3OiAnTScsIDc4OiAnTicsIDc5OiAnTycsIDgwOiAnUCcsXG4gICAgICA4MTogJ1EnLCA4MjogJ1InLCA4MzogJ1MnLCA4NDogJ1QnLCA4NTogJ1UnLCA4NjogJ1YnLCA4NzogJ1cnLCA4ODogJ1gnLFxuICAgICAgODk6ICdZJywgOTA6ICdaJyxcbiAgICAgIDQ4OiAnMCcsIDQ5OiAnMScsIDUwOiAnMicsIDUxOiAnMycsIDUyOiAnNCcsIDUzOiAnNScsIDU0OiAnNicsIDU1OiAnNycsXG4gICAgICA1NjogJzgnLCA1NzogJzknXG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4ga2V5TWFwW2tleUNvZGVdIHx8IGBLZXkke2tleUNvZGV9YDtcbiAgfVxuICBcbiAgLy8g5qqi5p+l5piv5ZCm54K65pW45a2X6Y21XG4gIHB1YmxpYyBzdGF0aWMgaXNOdW1iZXJLZXkoa2V5Q29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleUNvZGUgPj0gNDggJiYga2V5Q29kZSA8PSA1NztcbiAgfVxuICBcbiAgLy8g5qqi5p+l5piv5ZCm54K65a2X5q+N6Y21XG4gIHB1YmxpYyBzdGF0aWMgaXNMZXR0ZXJLZXkoa2V5Q29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGtleUNvZGUgPj0gNjUgJiYga2V5Q29kZSA8PSA5MDtcbiAgfVxuICBcbiAgLy8g5qqi5p+l5piv5ZCm54K65Yqf6IO96Y21XG4gIHB1YmxpYyBzdGF0aWMgaXNGdW5jdGlvbktleShrZXlDb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4ga2V5Q29kZSA+PSAxMTIgJiYga2V5Q29kZSA8PSAxMjM7IC8vIEYxLUYxMlxuICB9XG59IiwiLy8gUmVuZGVyU3lzdGVtIC0g5riy5p+T57O757Wx77yM5pW05ZCIIFRleHRXaXRoVmlld1BvcnQg5Yqf6IO9XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwZXMvcDUuZC50c1wiIC8+XG5cbmltcG9ydCB7IElVbml0IH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JVW5pdCc7XG5pbXBvcnQgeyBJT2JzdGFjbGUgfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lPYnN0YWNsZSc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL3R5cGVzL2NvbW1vbic7XG5pbXBvcnQgeyBJVmVjdG9yIH0gZnJvbSAnLi4vdHlwZXMvdmVjdG9yJztcblxuZXhwb3J0IGludGVyZmFjZSBJUmVuZGVyU3lzdGVtIHtcbiAgLy8g5Z+65pys5riy5p+T5pa55rOVXG4gIHJlbmRlcigpOiB2b2lkO1xuICBjbGVhcigpOiB2b2lkO1xuICBcbiAgLy8g6KaW56qX5o6n5Yi2XG4gIHNldFZpZXdQb3J0KHZpZXdYOiBudW1iZXIsIHZpZXdZOiBudW1iZXIpOiB2b2lkO1xuICBnZXRWaWV3UG9ydCgpOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH07XG4gIFxuICAvLyDmloflrZfmuLLmn5PvvIjot5/pmqjnm7jmqZ/vvIlcbiAgcmVuZGVyVGV4dCh0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCBjb2xvcj86IENvbG9yKTogdm9pZDtcbiAgXG4gIC8vIOWvpumrlOa4suafk1xuICByZW5kZXJVbml0cyh1bml0czogSVVuaXRbXSk6IHZvaWQ7XG4gIHJlbmRlck9ic3RhY2xlcyhvYnN0YWNsZXM6IElPYnN0YWNsZVtdKTogdm9pZDtcbiAgXG4gIC8vIOmZpOmMr+a4suafk1xuICByZW5kZXJEZWJ1Z0luZm8oaW5mbzogRGVidWdJbmZvKTogdm9pZDtcbiAgcmVuZGVyQXJyb3dzKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkO1xuICByZW5kZXJUYXJnZXRMaW5lcyhlbmFibGVkOiBib29sZWFuKTogdm9pZDtcbiAgcmVuZGVyVW5pdFN0YXRzKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkO1xuICBcbiAgLy8g5pWI5p6c5riy5p+TXG4gIHJlbmRlckF0dGFja0VmZmVjdHMoZWZmZWN0czogQXR0YWNrRWZmZWN0W10pOiB2b2lkO1xuICByZW5kZXJIZWFsdGhCYXJzKHVuaXRzOiBJVW5pdFtdKTogdm9pZDtcbiAgXG4gIC8vIOezu+e1seaOp+WItlxuICBzZXRCYWNrZ3JvdW5kQ29sb3IoY29sb3I6IENvbG9yKTogdm9pZDtcbiAgcmVzaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWJ1Z0luZm8ge1xuICBmcmFtZVJhdGU6IG51bWJlcjtcbiAgdW5pdENvdW50OiBudW1iZXI7XG4gIG9ic3RhY2xlQ291bnQ6IG51bWJlcjtcbiAgY3VycmVudENvbnRyb2w6IG51bWJlcjtcbiAgaXNQVlA6IGJvb2xlYW47XG4gIHZpZXdYOiBudW1iZXI7XG4gIHZpZXdZOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0YWNrRWZmZWN0IHtcbiAgaWQ6IHN0cmluZztcbiAgcG9zaXRpb246IElWZWN0b3I7XG4gIHRhcmdldFBvc2l0aW9uOiBJVmVjdG9yO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICByZW1haW5pbmdUaW1lOiBudW1iZXI7XG4gIGNvbG9yOiBDb2xvcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJMYXllciB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmlzaWJsZTogYm9vbGVhbjtcbiAgb3BhY2l0eTogbnVtYmVyO1xuICB6SW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHRXaXRoVmlld1BvcnQge1xuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIHByaXZhdGUgZGlzcGxheVdpZHRoOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGRpc3BsYXlIZWlnaHQ6IG51bWJlcjtcbiAgcHJpdmF0ZSB2aWV3WDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSB2aWV3WTogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSB0ZXh0U2NyZWVuOiBhbnk7IC8vIHA1LkdyYXBoaWNzXG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCBkaXNwbGF5V2lkdGg6IG51bWJlciwgZGlzcGxheUhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5wID0gcDtcbiAgICAvLyB0aGlzLl9kaXNwbGF5V2lkdGggPSBkaXNwbGF5V2lkdGg7XG4gICAgdGhpcy5kaXNwbGF5SGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgICB0aGlzLnRleHRTY3JlZW4gPSAocCBhcyBhbnkpLmNyZWF0ZUdyYXBoaWNzID8gKHAgYXMgYW55KS5jcmVhdGVHcmFwaGljcyhkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpIDogbnVsbDtcbiAgfVxuICBcbiAgcHVibGljIHNldFZpZXdQb3J0KHZpZXdYOiBudW1iZXIsIHZpZXdZOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdYID0gdmlld1g7XG4gICAgdGhpcy52aWV3WSA9IHZpZXdZO1xuICB9XG4gIFxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGV4dFNjcmVlbikge1xuICAgICAgdGhpcy50ZXh0U2NyZWVuLmNsZWFyKCk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgZmlsbChjb2xvcjogQ29sb3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50ZXh0U2NyZWVuKSB7XG4gICAgICB0aGlzLnRleHRTY3JlZW4uZmlsbChjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hIHx8IDI1NSk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgdGV4dCh0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGV4dFNjcmVlbikge1xuICAgICAgY29uc3QgbmV3WCA9IHggKyB0aGlzLmRpc3BsYXlXaWR0aCAvIDIgLSB0aGlzLnZpZXdYO1xuICAgICAgY29uc3QgbmV3WSA9IHkgKyB0aGlzLmRpc3BsYXlIZWlnaHQgLyAyIC0gdGhpcy52aWV3WTtcbiAgICAgIHRoaXMudGV4dFNjcmVlbi50ZXh0KHRleHQsIG5ld1gsIG5ld1kpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHJlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy50ZXh0U2NyZWVuKSB7XG4gICAgICAodGhpcy5wIGFzIGFueSkuaW1hZ2UoXG4gICAgICAgIHRoaXMudGV4dFNjcmVlbixcbiAgICAgICAgdGhpcy52aWV3WCAtIHRoaXMuZGlzcGxheVdpZHRoIC8gMixcbiAgICAgICAgdGhpcy52aWV3WSAtIHRoaXMuZGlzcGxheUhlaWdodCAvIDJcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJTeXN0ZW0gaW1wbGVtZW50cyBJUmVuZGVyU3lzdGVtIHtcbiAgcHJpdmF0ZSBwOiBwNUluc3RhbmNlO1xuICAvLyBwcml2YXRlIF9kaXNwbGF5V2lkdGg6IG51bWJlcjsgLy8g5pqr5pmC5pyq5L2/55SoXG4gIHByaXZhdGUgZGlzcGxheUhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIHRleHRXaXRoVmlld1BvcnQ6IFRleHRXaXRoVmlld1BvcnQ7XG4gIHByaXZhdGUgYmFja2dyb3VuZENvbG9yOiBDb2xvcjtcbiAgXG4gIC8vIOa4suafk+mBuOmghVxuICBwcml2YXRlIHNob3dBcnJvd3M6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIHNob3dUYXJnZXRMaW5lczogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgc2hvd1VuaXRTdGF0czogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgc2hvd0hlYWx0aEJhcnM6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIHNob3dEZWJ1Z0luZm86IGJvb2xlYW4gPSB0cnVlO1xuICBcbiAgLy8g5riy5p+T5bGk57SaXG4gIHByaXZhdGUgcmVuZGVyTGF5ZXJzOiBNYXA8c3RyaW5nLCBSZW5kZXJMYXllcj47XG4gIFxuICAvLyDmlLvmk4rnibnmlYhcbiAgcHJpdmF0ZSBhdHRhY2tFZmZlY3RzOiBBdHRhY2tFZmZlY3RbXSA9IFtdO1xuICBcbiAgY29uc3RydWN0b3IocDogcDVJbnN0YW5jZSwgZGlzcGxheVdpZHRoOiBudW1iZXIsIGRpc3BsYXlIZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMucCA9IHA7XG4gICAgLy8gdGhpcy5fZGlzcGxheVdpZHRoID0gZGlzcGxheVdpZHRoO1xuICAgIHRoaXMuZGlzcGxheUhlaWdodCA9IGRpc3BsYXlIZWlnaHQ7XG4gICAgdGhpcy50ZXh0V2l0aFZpZXdQb3J0ID0gbmV3IFRleHRXaXRoVmlld1BvcnQocCwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcbiAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IHsgcjogNTEsIGc6IDUxLCBiOiA1MSB9OyAvLyDpoJDoqK3mt7HngbDog4zmma9cbiAgICBcbiAgICAvLyDliJ3lp4vljJbmuLLmn5PlsaTntJpcbiAgICB0aGlzLnJlbmRlckxheWVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmluaXRpYWxpemVSZW5kZXJMYXllcnMoKTtcbiAgfVxuICBcbiAgcHJpdmF0ZSBpbml0aWFsaXplUmVuZGVyTGF5ZXJzKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyTGF5ZXJzLnNldCgnYmFja2dyb3VuZCcsIHsgbmFtZTogJ2JhY2tncm91bmQnLCB2aXNpYmxlOiB0cnVlLCBvcGFjaXR5OiAxLjAsIHpJbmRleDogMCB9KTtcbiAgICB0aGlzLnJlbmRlckxheWVycy5zZXQoJ29ic3RhY2xlcycsIHsgbmFtZTogJ29ic3RhY2xlcycsIHZpc2libGU6IHRydWUsIG9wYWNpdHk6IDEuMCwgekluZGV4OiAxIH0pO1xuICAgIHRoaXMucmVuZGVyTGF5ZXJzLnNldCgndW5pdHMnLCB7IG5hbWU6ICd1bml0cycsIHZpc2libGU6IHRydWUsIG9wYWNpdHk6IDEuMCwgekluZGV4OiAyIH0pO1xuICAgIHRoaXMucmVuZGVyTGF5ZXJzLnNldCgnZWZmZWN0cycsIHsgbmFtZTogJ2VmZmVjdHMnLCB2aXNpYmxlOiB0cnVlLCBvcGFjaXR5OiAxLjAsIHpJbmRleDogMyB9KTtcbiAgICB0aGlzLnJlbmRlckxheWVycy5zZXQoJ3VpJywgeyBuYW1lOiAndWknLCB2aXNpYmxlOiB0cnVlLCBvcGFjaXR5OiAxLjAsIHpJbmRleDogNCB9KTtcbiAgICB0aGlzLnJlbmRlckxheWVycy5zZXQoJ2RlYnVnJywgeyBuYW1lOiAnZGVidWcnLCB2aXNpYmxlOiB0cnVlLCBvcGFjaXR5OiAxLjAsIHpJbmRleDogNSB9KTtcbiAgfVxuICBcbiAgLy8g5Li76KaB5riy5p+T5pa55rOVXG4gIHB1YmxpYyByZW5kZXIoKTogdm9pZCB7XG4gICAgLy8g5riF56m655Wr6Z2iXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIFxuICAgIC8vIOaMieWxpOe0mumghuW6j+a4suafk1xuICAgIGNvbnN0IHNvcnRlZExheWVycyA9IEFycmF5LmZyb20odGhpcy5yZW5kZXJMYXllcnMudmFsdWVzKCkpXG4gICAgICAuZmlsdGVyKGxheWVyID0+IGxheWVyLnZpc2libGUpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYS56SW5kZXggLSBiLnpJbmRleCk7XG4gICAgXG4gICAgZm9yIChjb25zdCBsYXllciBvZiBzb3J0ZWRMYXllcnMpIHtcbiAgICAgIHRoaXMucC5wdXNoKCk7XG4gICAgICBcbiAgICAgIC8vIOioreWumuWxpOe0mumAj+aYjuW6plxuICAgICAgaWYgKGxheWVyLm9wYWNpdHkgPCAxLjApIHtcbiAgICAgICAgdGhpcy5wLmZpbGwoMjU1LCAyNTUsIDI1NSwgbGF5ZXIub3BhY2l0eSAqIDI1NSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIOmAmeijoeacg+WcqOWFt+mrlOa4suafk+aZguWhq+WFhVxuICAgICAgXG4gICAgICB0aGlzLnAucG9wKCk7XG4gICAgfVxuICAgIFxuICAgIC8vIOa4suafk+aWh+Wtl+WxpFxuICAgIHRoaXMudGV4dFdpdGhWaWV3UG9ydC5yZW5kZXIoKTtcbiAgfVxuICBcbiAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMucC5iYWNrZ3JvdW5kKHRoaXMuYmFja2dyb3VuZENvbG9yLnIsIHRoaXMuYmFja2dyb3VuZENvbG9yLmcsIHRoaXMuYmFja2dyb3VuZENvbG9yLmIpO1xuICAgIHRoaXMudGV4dFdpdGhWaWV3UG9ydC5jbGVhcigpO1xuICB9XG4gIFxuICAvLyDoppbnqpfmjqfliLZcbiAgcHVibGljIHNldFZpZXdQb3J0KHZpZXdYOiBudW1iZXIsIHZpZXdZOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRleHRXaXRoVmlld1BvcnQuc2V0Vmlld1BvcnQodmlld1gsIHZpZXdZKTtcbiAgfVxuICBcbiAgcHVibGljIGdldFZpZXdQb3J0KCk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgeDogMCwgeTogMCB9OyAvLyDnsKHljJblr6bkvZzvvIzlr6bpmpvmh4noqbLlvp4gdGV4dFdpdGhWaWV3UG9ydCDlj5blvpdcbiAgfVxuICBcbiAgLy8g5paH5a2X5riy5p+TXG4gIHB1YmxpYyByZW5kZXJUZXh0KHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbG9yPzogQ29sb3IpOiB2b2lkIHtcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgIHRoaXMudGV4dFdpdGhWaWV3UG9ydC5maWxsKGNvbG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0V2l0aFZpZXdQb3J0LmZpbGwoeyByOiAyNTUsIGc6IDI1NSwgYjogMjU1IH0pOyAvLyDpoJDoqK3nmb3oibJcbiAgICB9XG4gICAgdGhpcy50ZXh0V2l0aFZpZXdQb3J0LnRleHQodGV4dCwgeCwgeSk7XG4gIH1cbiAgXG4gIC8vIOWvpumrlOa4suafk1xuICBwdWJsaWMgcmVuZGVyVW5pdHModW5pdHM6IElVbml0W10pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNMYXllclZpc2libGUoJ3VuaXRzJykpIHJldHVybjtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHVuaXQgb2YgdW5pdHMpIHtcbiAgICAgIGlmICghdW5pdC5pc0FsaXZlKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgdGhpcy5wLnB1c2goKTtcbiAgICAgIFxuICAgICAgLy8g5riy5p+T5Zau5L2N5pys6auUXG4gICAgICB1bml0LnJlbmRlcih0aGlzLnApO1xuICAgICAgXG4gICAgICAvLyDmuLLmn5PnlJ/lkb3mop1cbiAgICAgIGlmICh0aGlzLnNob3dIZWFsdGhCYXJzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyVW5pdEhlYWx0aEJhcih1bml0KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8g5riy5p+T5Zau5L2N57Wx6KiI6LOH6KiKXG4gICAgICBpZiAodGhpcy5zaG93VW5pdFN0YXRzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyVW5pdFN0YXRpc3RpY3ModW5pdCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIOa4suafk+ebruaomee3mlxuICAgICAgaWYgKHRoaXMuc2hvd1RhcmdldExpbmVzICYmIHVuaXQuZGVzdGluYXRpb24pIHtcbiAgICAgICAgdGhpcy5yZW5kZXJUYXJnZXRMaW5lKHVuaXQpO1xuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLnAucG9wKCk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgcmVuZGVyT2JzdGFjbGVzKG9ic3RhY2xlczogSU9ic3RhY2xlW10pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNMYXllclZpc2libGUoJ29ic3RhY2xlcycpKSByZXR1cm47XG4gICAgXG4gICAgZm9yIChjb25zdCBvYnN0YWNsZSBvZiBvYnN0YWNsZXMpIHtcbiAgICAgIG9ic3RhY2xlLnJlbmRlcih0aGlzLnApO1xuICAgIH1cbiAgfVxuICBcbiAgLy8g5Zau5L2N55Sf5ZG95qKd5riy5p+TXG4gIHByaXZhdGUgcmVuZGVyVW5pdEhlYWx0aEJhcih1bml0OiBJVW5pdCk6IHZvaWQge1xuICAgIGNvbnN0IGJhcldpZHRoID0gMzA7XG4gICAgY29uc3QgYmFySGVpZ2h0ID0gNDtcbiAgICBjb25zdCBvZmZzZXRZID0gLXVuaXQuciAtIDEwO1xuICAgIFxuICAgIHRoaXMucC5wdXNoKCk7XG4gICAgXG4gICAgLy8g6IOM5pmv5qKd77yI57SF6Imy77yJXG4gICAgdGhpcy5wLmZpbGwoMjU1LCAwLCAwKTtcbiAgICB0aGlzLnAubm9TdHJva2UoKTtcbiAgICAodGhpcy5wIGFzIGFueSkucmVjdCh1bml0LnBvc2l0aW9uLnggLSBiYXJXaWR0aCAvIDIsIHVuaXQucG9zaXRpb24ueSArIG9mZnNldFksIGJhcldpZHRoLCBiYXJIZWlnaHQpO1xuICAgIFxuICAgIC8vIOeUn+WRveaine+8iOe2oOiJsu+8iVxuICAgIGNvbnN0IGhlYWx0aFJhdGlvID0gdW5pdC5oZWFsdGggLyB1bml0Lm1heEhlYWx0aDtcbiAgICBjb25zdCBoZWFsdGhXaWR0aCA9IGJhcldpZHRoICogaGVhbHRoUmF0aW87XG4gICAgdGhpcy5wLmZpbGwoMCwgMjU1LCAwKTtcbiAgICAodGhpcy5wIGFzIGFueSkucmVjdCh1bml0LnBvc2l0aW9uLnggLSBiYXJXaWR0aCAvIDIsIHVuaXQucG9zaXRpb24ueSArIG9mZnNldFksIGhlYWx0aFdpZHRoLCBiYXJIZWlnaHQpO1xuICAgIFxuICAgIHRoaXMucC5wb3AoKTtcbiAgfVxuICBcbiAgLy8g5Zau5L2N57Wx6KiI6LOH6KiK5riy5p+TXG4gIHByaXZhdGUgcmVuZGVyVW5pdFN0YXRpc3RpY3ModW5pdDogSVVuaXQpOiB2b2lkIHtcbiAgICBjb25zdCBvZmZzZXRZID0gdW5pdC5yICsgMTU7XG4gICAgY29uc3Qgc3RhdHMgPSBgSFA6JHtNYXRoLnJvdW5kKHVuaXQuaGVhbHRoKX0gUzoke3VuaXQuc3RhdGV9YDtcbiAgICBcbiAgICB0aGlzLnJlbmRlclRleHQoc3RhdHMsIHVuaXQucG9zaXRpb24ueCwgdW5pdC5wb3NpdGlvbi55ICsgb2Zmc2V0WSwgeyByOiAyMDAsIGc6IDIwMCwgYjogMjAwIH0pO1xuICB9XG4gIFxuICAvLyDnm67mqJnnt5rmuLLmn5NcbiAgcHJpdmF0ZSByZW5kZXJUYXJnZXRMaW5lKHVuaXQ6IElVbml0KTogdm9pZCB7XG4gICAgaWYgKCF1bml0LmRlc3RpbmF0aW9uKSByZXR1cm47XG4gICAgXG4gICAgdGhpcy5wLnB1c2goKTtcbiAgICB0aGlzLnAuc3Ryb2tlKDEwMCwgMTAwLCAyNTUsIDE1MCk7IC8vIOWNiumAj+aYjuiXjeiJslxuICAgIHRoaXMucC5zdHJva2VXZWlnaHQoMSk7XG4gICAgdGhpcy5wLmxpbmUodW5pdC5wb3NpdGlvbi54LCB1bml0LnBvc2l0aW9uLnksIHVuaXQuZGVzdGluYXRpb24ueCwgdW5pdC5kZXN0aW5hdGlvbi55KTtcbiAgICBcbiAgICAvLyDnm67mqJnpu57mqJnoqJhcbiAgICB0aGlzLnAuZmlsbCgxMDAsIDEwMCwgMjU1KTtcbiAgICB0aGlzLnAubm9TdHJva2UoKTtcbiAgICB0aGlzLnAuY2lyY2xlKHVuaXQuZGVzdGluYXRpb24ueCwgdW5pdC5kZXN0aW5hdGlvbi55LCA2KTtcbiAgICBcbiAgICB0aGlzLnAucG9wKCk7XG4gIH1cbiAgXG4gIC8vIOmZpOmMr+izh+ioiua4suafk1xuICBwdWJsaWMgcmVuZGVyRGVidWdJbmZvKGluZm86IERlYnVnSW5mbyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zaG93RGVidWdJbmZvIHx8ICF0aGlzLmlzTGF5ZXJWaXNpYmxlKCdkZWJ1ZycpKSByZXR1cm47XG4gICAgXG4gICAgY29uc3QgZGVidWdUZXh0ID0gW1xuICAgICAgYEZQUzogJHtNYXRoLnJvdW5kKGluZm8uZnJhbWVSYXRlKX1gLFxuICAgICAgYFVuaXRzOiAke2luZm8udW5pdENvdW50fWAsXG4gICAgICBgT2JzdGFjbGVzOiAke2luZm8ub2JzdGFjbGVDb3VudH1gLFxuICAgICAgYENvbnRyb2w6IFAke2luZm8uY3VycmVudENvbnRyb2x9YCxcbiAgICAgIGBQVlA6ICR7aW5mby5pc1BWUCA/ICdPTicgOiAnT0ZGJ31gLFxuICAgICAgYFZpZXc6ICgke01hdGgucm91bmQoaW5mby52aWV3WCl9LCAke01hdGgucm91bmQoaW5mby52aWV3WSl9KWBcbiAgICBdO1xuICAgIFxuICAgIGNvbnN0IHN0YXJ0WCA9IDEwO1xuICAgIGxldCBzdGFydFkgPSB0aGlzLmRpc3BsYXlIZWlnaHQgLSAxNTA7XG4gICAgXG4gICAgZm9yIChjb25zdCB0ZXh0IG9mIGRlYnVnVGV4dCkge1xuICAgICAgdGhpcy5yZW5kZXJUZXh0KHRleHQsIHN0YXJ0WCwgc3RhcnRZLCB7IHI6IDI1NSwgZzogMjU1LCBiOiAwIH0pOyAvLyDpu4PoibJcbiAgICAgIHN0YXJ0WSArPSAyMDtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOeuremgrea4suafk++8iOe+pOmrlOihjOeCuuWPr+imluWMlu+8iVxuICBwdWJsaWMgcmVuZGVyQXJyb3dzKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dBcnJvd3MgPSBlbmFibGVkO1xuICAgIC8vIOWvpumam+eahOeuremgrea4suafk+acg+WcqCBGbG9jayDns7vntbHkuK3lkbzlj6sgZHJhd0Fycm93IOaWueazlVxuICB9XG4gIFxuICAvLyDnm67mqJnnt5rmuLLmn5PmjqfliLZcbiAgcHVibGljIHJlbmRlclRhcmdldExpbmVzKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dUYXJnZXRMaW5lcyA9IGVuYWJsZWQ7XG4gIH1cbiAgXG4gIC8vIOWWruS9jee1seioiOa4suafk+aOp+WItlxuICBwdWJsaWMgcmVuZGVyVW5pdFN0YXRzKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dVbml0U3RhdHMgPSBlbmFibGVkO1xuICB9XG4gIFxuICAvLyDmlLvmk4rnibnmlYjmuLLmn5NcbiAgcHVibGljIHJlbmRlckF0dGFja0VmZmVjdHMoZWZmZWN0czogQXR0YWNrRWZmZWN0W10pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNMYXllclZpc2libGUoJ2VmZmVjdHMnKSkgcmV0dXJuO1xuICAgIFxuICAgIHRoaXMuYXR0YWNrRWZmZWN0cyA9IGVmZmVjdHMuZmlsdGVyKGVmZmVjdCA9PiBlZmZlY3QucmVtYWluaW5nVGltZSA+IDApO1xuICAgIFxuICAgIGZvciAoY29uc3QgZWZmZWN0IG9mIHRoaXMuYXR0YWNrRWZmZWN0cykge1xuICAgICAgdGhpcy5yZW5kZXJBdHRhY2tFZmZlY3QoZWZmZWN0KTtcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgcmVuZGVyQXR0YWNrRWZmZWN0KGVmZmVjdDogQXR0YWNrRWZmZWN0KTogdm9pZCB7XG4gICAgY29uc3QgYWxwaGEgPSAoZWZmZWN0LnJlbWFpbmluZ1RpbWUgLyBlZmZlY3QuZHVyYXRpb24pICogMjU1O1xuICAgIFxuICAgIHRoaXMucC5wdXNoKCk7XG4gICAgdGhpcy5wLnN0cm9rZShlZmZlY3QuY29sb3IuciwgZWZmZWN0LmNvbG9yLmcsIGVmZmVjdC5jb2xvci5iLCBhbHBoYSk7XG4gICAgdGhpcy5wLnN0cm9rZVdlaWdodCgzKTtcbiAgICBcbiAgICAvLyDnuaroo73mlLvmk4rnt5pcbiAgICB0aGlzLnAubGluZShcbiAgICAgIGVmZmVjdC5wb3NpdGlvbi54LCBlZmZlY3QucG9zaXRpb24ueSxcbiAgICAgIGVmZmVjdC50YXJnZXRQb3NpdGlvbi54LCBlZmZlY3QudGFyZ2V0UG9zaXRpb24ueVxuICAgICk7XG4gICAgXG4gICAgLy8g5pS75pOK6bue54m55pWIXG4gICAgdGhpcy5wLmZpbGwoZWZmZWN0LmNvbG9yLnIsIGVmZmVjdC5jb2xvci5nLCBlZmZlY3QuY29sb3IuYiwgYWxwaGEpO1xuICAgIHRoaXMucC5ub1N0cm9rZSgpO1xuICAgIHRoaXMucC5jaXJjbGUoZWZmZWN0LnRhcmdldFBvc2l0aW9uLngsIGVmZmVjdC50YXJnZXRQb3NpdGlvbi55LCA4KTtcbiAgICBcbiAgICB0aGlzLnAucG9wKCk7XG4gIH1cbiAgXG4gIC8vIOeUn+WRveainea4suafk1xuICBwdWJsaWMgcmVuZGVySGVhbHRoQmFycyhfdW5pdHM6IElVbml0W10pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dIZWFsdGhCYXJzID0gdHJ1ZTtcbiAgICAvLyDlr6bpmpvmuLLmn5PlnKggcmVuZGVyVW5pdHMg5Lit6JmV55CGXG4gIH1cbiAgXG4gIC8vIOezu+e1seaOp+WItlxuICBwdWJsaWMgc2V0QmFja2dyb3VuZENvbG9yKGNvbG9yOiBDb2xvcik6IHZvaWQge1xuICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG4gIH1cbiAgXG4gIHB1YmxpYyByZXNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyB0aGlzLl9kaXNwbGF5V2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmRpc3BsYXlIZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy50ZXh0V2l0aFZpZXdQb3J0ID0gbmV3IFRleHRXaXRoVmlld1BvcnQodGhpcy5wLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuICBcbiAgLy8g5riy5p+T5bGk57Sa5o6n5Yi2XG4gIHB1YmxpYyBzZXRMYXllclZpc2libGUobGF5ZXJOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMucmVuZGVyTGF5ZXJzLmdldChsYXllck5hbWUpO1xuICAgIGlmIChsYXllcikge1xuICAgICAgbGF5ZXIudmlzaWJsZSA9IHZpc2libGU7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgc2V0TGF5ZXJPcGFjaXR5KGxheWVyTmFtZTogc3RyaW5nLCBvcGFjaXR5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMucmVuZGVyTGF5ZXJzLmdldChsYXllck5hbWUpO1xuICAgIGlmIChsYXllcikge1xuICAgICAgbGF5ZXIub3BhY2l0eSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG9wYWNpdHkpKTtcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgaXNMYXllclZpc2libGUobGF5ZXJOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBsYXllciA9IHRoaXMucmVuZGVyTGF5ZXJzLmdldChsYXllck5hbWUpO1xuICAgIHJldHVybiBsYXllciA/IGxheWVyLnZpc2libGUgOiB0cnVlO1xuICB9XG4gIFxuICAvLyDmuLLmn5PoqK3lrppcbiAgcHVibGljIGdldFJlbmRlclNldHRpbmdzKCk6IHtcbiAgICBzaG93QXJyb3dzOiBib29sZWFuO1xuICAgIHNob3dUYXJnZXRMaW5lczogYm9vbGVhbjtcbiAgICBzaG93VW5pdFN0YXRzOiBib29sZWFuO1xuICAgIHNob3dIZWFsdGhCYXJzOiBib29sZWFuO1xuICAgIHNob3dEZWJ1Z0luZm86IGJvb2xlYW47XG4gIH0ge1xuICAgIHJldHVybiB7XG4gICAgICBzaG93QXJyb3dzOiB0aGlzLnNob3dBcnJvd3MsXG4gICAgICBzaG93VGFyZ2V0TGluZXM6IHRoaXMuc2hvd1RhcmdldExpbmVzLFxuICAgICAgc2hvd1VuaXRTdGF0czogdGhpcy5zaG93VW5pdFN0YXRzLFxuICAgICAgc2hvd0hlYWx0aEJhcnM6IHRoaXMuc2hvd0hlYWx0aEJhcnMsXG4gICAgICBzaG93RGVidWdJbmZvOiB0aGlzLnNob3dEZWJ1Z0luZm9cbiAgICB9O1xuICB9XG4gIFxuICBwdWJsaWMgdXBkYXRlUmVuZGVyU2V0dGluZ3Moc2V0dGluZ3M6IFBhcnRpYWw8e1xuICAgIHNob3dBcnJvd3M6IGJvb2xlYW47XG4gICAgc2hvd1RhcmdldExpbmVzOiBib29sZWFuO1xuICAgIHNob3dVbml0U3RhdHM6IGJvb2xlYW47XG4gICAgc2hvd0hlYWx0aEJhcnM6IGJvb2xlYW47XG4gICAgc2hvd0RlYnVnSW5mbzogYm9vbGVhbjtcbiAgfT4pOiB2b2lkIHtcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0Fycm93cyAhPT0gdW5kZWZpbmVkKSB0aGlzLnNob3dBcnJvd3MgPSBzZXR0aW5ncy5zaG93QXJyb3dzO1xuICAgIGlmIChzZXR0aW5ncy5zaG93VGFyZ2V0TGluZXMgIT09IHVuZGVmaW5lZCkgdGhpcy5zaG93VGFyZ2V0TGluZXMgPSBzZXR0aW5ncy5zaG93VGFyZ2V0TGluZXM7XG4gICAgaWYgKHNldHRpbmdzLnNob3dVbml0U3RhdHMgIT09IHVuZGVmaW5lZCkgdGhpcy5zaG93VW5pdFN0YXRzID0gc2V0dGluZ3Muc2hvd1VuaXRTdGF0cztcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0hlYWx0aEJhcnMgIT09IHVuZGVmaW5lZCkgdGhpcy5zaG93SGVhbHRoQmFycyA9IHNldHRpbmdzLnNob3dIZWFsdGhCYXJzO1xuICAgIGlmIChzZXR0aW5ncy5zaG93RGVidWdJbmZvICE9PSB1bmRlZmluZWQpIHRoaXMuc2hvd0RlYnVnSW5mbyA9IHNldHRpbmdzLnNob3dEZWJ1Z0luZm87XG4gIH1cbn0iLCIvLyBVSVN5c3RlbSAtIFVJIOezu+e1se+8jOeuoeeQhuaMiemIleaOp+WItumCj+i8r+WSjOeVjOmdouWFg+e0oFxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGVzL3A1LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBDb250cm9sTW9kZSB9IGZyb20gJy4uL3R5cGVzL2NvbW1vbic7XG5pbXBvcnQgeyBJVmVjdG9yIH0gZnJvbSAnLi4vdHlwZXMvdmVjdG9yJztcblxuZXhwb3J0IGludGVyZmFjZSBJVUlTeXN0ZW0ge1xuICAvLyDns7vntbHnrqHnkIZcbiAgaW5pdGlhbGl6ZSgpOiB2b2lkO1xuICB1cGRhdGUoZGVsdGFUaW1lOiBudW1iZXIpOiB2b2lkO1xuICBkZXN0cm95KCk6IHZvaWQ7XG4gIFxuICAvLyDmjInpiJXnrqHnkIZcbiAgY3JlYXRlQnV0dG9uKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogVUlCdXR0b247XG4gIGdldEJ1dHRvbihpZDogc3RyaW5nKTogVUlCdXR0b24gfCB1bmRlZmluZWQ7XG4gIHJlbW92ZUJ1dHRvbihpZDogc3RyaW5nKTogdm9pZDtcbiAgXG4gIC8vIFVJIOeLgOaFi1xuICB1cGRhdGVDb250cm9sRGlzcGxheShjb250cm9sOiBDb250cm9sTW9kZSk6IHZvaWQ7XG4gIHVwZGF0ZVBWUERpc3BsYXkoaXNQVlA6IGJvb2xlYW4pOiB2b2lkO1xuICB1cGRhdGVBcnJvd0Rpc3BsYXkoc2hvd0Fycm93czogYm9vbGVhbik6IHZvaWQ7XG4gIHVwZGF0ZVRhcmdldExpbmVEaXNwbGF5KHNob3dUYXJnZXRMaW5lczogYm9vbGVhbik6IHZvaWQ7XG4gIHVwZGF0ZVVuaXRTdGF0c0Rpc3BsYXkoc2hvd1VuaXRTdGF0czogYm9vbGVhbik6IHZvaWQ7XG4gIFxuICAvLyDntbHoqIjos4foqIrpoa/npLpcbiAgdXBkYXRlVW5pdENvdW50cyh1bml0Q291bnRzOiBudW1iZXJbXSk6IHZvaWQ7XG4gIFxuICAvLyDkuovku7bomZXnkIZcbiAgYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IFVJRXZlbnRUeXBlLCBjYWxsYmFjazogVUlFdmVudENhbGxiYWNrKTogdm9pZDtcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IFVJRXZlbnRUeXBlLCBjYWxsYmFjazogVUlFdmVudENhbGxiYWNrKTogdm9pZDtcbn1cblxuZXhwb3J0IGVudW0gVUlFdmVudFR5cGUge1xuICBDT05UUk9MX0NIQU5HRUQgPSAnY29udHJvbF9jaGFuZ2VkJyxcbiAgUFZQX1RPR0dMRUQgPSAncHZwX3RvZ2dsZWQnLFxuICBORVdfVU5JVF9SRVFVRVNURUQgPSAnbmV3X3VuaXRfcmVxdWVzdGVkJyxcbiAgQVJST1dfVE9HR0xFRCA9ICdhcnJvd190b2dnbGVkJyxcbiAgVEFSR0VUX0xJTkVfVE9HR0xFRCA9ICd0YXJnZXRfbGluZV90b2dnbGVkJyxcbiAgVU5JVF9TVEFUU19UT0dHTEVEID0gJ3VuaXRfc3RhdHNfdG9nZ2xlZCcsXG4gIEJVVFRPTl9DTElDS0VEID0gJ2J1dHRvbl9jbGlja2VkJ1xufVxuXG5leHBvcnQgdHlwZSBVSUV2ZW50Q2FsbGJhY2sgPSAoZXZlbnQ6IFVJRXZlbnQpID0+IHZvaWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVUlFdmVudCB7XG4gIHR5cGU6IFVJRXZlbnRUeXBlO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgYnV0dG9uSWQ/OiBzdHJpbmc7XG4gIGRhdGE/OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVUlCdXR0b24ge1xuICBpZDogc3RyaW5nO1xuICBlbGVtZW50OiBhbnk7IC8vIHA1IGJ1dHRvbiBlbGVtZW50XG4gIHRleHQ6IHN0cmluZztcbiAgcG9zaXRpb246IElWZWN0b3I7XG4gIHZpc2libGU6IGJvb2xlYW47XG4gIGVuYWJsZWQ6IGJvb2xlYW47XG4gIGNhbGxiYWNrOiAoKSA9PiB2b2lkO1xuICBcbiAgLy8g5pu05paw5pa55rOVXG4gIHNldFRleHQodGV4dDogc3RyaW5nKTogdm9pZDtcbiAgc2V0VmlzaWJsZSh2aXNpYmxlOiBib29sZWFuKTogdm9pZDtcbiAgc2V0RW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZDtcbiAgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkO1xuICBkZXN0cm95KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVUlQYW5lbCB7XG4gIGlkOiBzdHJpbmc7XG4gIHBvc2l0aW9uOiBJVmVjdG9yO1xuICBzaXplOiBJVmVjdG9yO1xuICB2aXNpYmxlOiBib29sZWFuO1xuICBidXR0b25zOiBVSUJ1dHRvbltdO1xuICBcbiAgLy8g566h55CG5pa55rOVXG4gIGFkZEJ1dHRvbihidXR0b246IFVJQnV0dG9uKTogdm9pZDtcbiAgcmVtb3ZlQnV0dG9uKGJ1dHRvbklkOiBzdHJpbmcpOiB2b2lkO1xuICBzZXRWaXNpYmxlKHZpc2libGU6IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5jbGFzcyBCdXR0b24gaW1wbGVtZW50cyBVSUJ1dHRvbiB7XG4gIHB1YmxpYyBpZDogc3RyaW5nO1xuICBwdWJsaWMgZWxlbWVudDogYW55O1xuICBwdWJsaWMgdGV4dDogc3RyaW5nO1xuICBwdWJsaWMgcG9zaXRpb246IElWZWN0b3I7XG4gIHB1YmxpYyB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgcHVibGljIGVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICBwdWJsaWMgY2FsbGJhY2s6ICgpID0+IHZvaWQ7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCBpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCBjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIHRoaXMucG9zaXRpb24gPSB7IHgsIHkgfSBhcyBJVmVjdG9yO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBcbiAgICAvLyDlibXlu7ogcDUg5oyJ6YiV5YWD57SgXG4gICAgdGhpcy5lbGVtZW50ID0gKHAgYXMgYW55KS5jcmVhdGVCdXR0b24odGV4dCk7XG4gICAgdGhpcy5lbGVtZW50LnBvc2l0aW9uKHgsIHkpO1xuICAgIHRoaXMuZWxlbWVudC5tb3VzZVByZXNzZWQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmlzaWJsZSAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIFxuICBwdWJsaWMgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50Lmh0bWwpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5odG1sKHRleHQpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHNldFZpc2libGUodmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG4gICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LnN0eWxlKCdkaXNwbGF5JywgdmlzaWJsZSA/ICdibG9jaycgOiAnbm9uZScpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHNldEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgaWYgKHRoaXMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LmF0dHJpYnV0ZSgnZGlzYWJsZWQnLCBlbmFibGVkID8gbnVsbCA6ICdkaXNhYmxlZCcpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5wb3NpdGlvbi54ID0geDtcbiAgICB0aGlzLnBvc2l0aW9uLnkgPSB5O1xuICAgIGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LnBvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucG9zaXRpb24oeCwgeSk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5yZW1vdmUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVUlTeXN0ZW0gaW1wbGVtZW50cyBJVUlTeXN0ZW0ge1xuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIHByaXZhdGUgYnV0dG9uczogTWFwPHN0cmluZywgVUlCdXR0b24+O1xuICBwcml2YXRlIHBhbmVsczogTWFwPHN0cmluZywgVUlQYW5lbD47XG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lcnM6IE1hcDxVSUV2ZW50VHlwZSwgVUlFdmVudENhbGxiYWNrW10+O1xuICBcbiAgLy8gVUkg54uA5oWLXG4gIHByaXZhdGUgY3VycmVudENvbnRyb2w6IENvbnRyb2xNb2RlID0gQ29udHJvbE1vZGUuUExBWUVSO1xuICBwcml2YXRlIGlzUFZQOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgc2hvd0Fycm93czogYm9vbGVhbiA9IHRydWU7XG4gIHByaXZhdGUgc2hvd1RhcmdldExpbmVzOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBzaG93VW5pdFN0YXRzOiBib29sZWFuID0gdHJ1ZTtcbiAgXG4gIC8vIOmhr+ekuumFjee9rlxuICBwcml2YXRlIGRpc3BsYXlXaWR0aDogbnVtYmVyO1xuICAvLyBwcml2YXRlIF9kaXNwbGF5SGVpZ2h0OiBudW1iZXI7IC8vIOaaq+aZguacquS9v+eUqFxuICBcbiAgY29uc3RydWN0b3IocDogcDVJbnN0YW5jZSwgZGlzcGxheVdpZHRoOiBudW1iZXIsIF9kaXNwbGF5SGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLnAgPSBwO1xuICAgIHRoaXMuZGlzcGxheVdpZHRoID0gZGlzcGxheVdpZHRoO1xuICAgIC8vIHRoaXMuX2Rpc3BsYXlIZWlnaHQgPSBkaXNwbGF5SGVpZ2h0O1xuICAgIHRoaXMuYnV0dG9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnBhbmVscyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuICAgIFxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzKCk7XG4gIH1cbiAgXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIE9iamVjdC52YWx1ZXMoVUlFdmVudFR5cGUpLmZvckVhY2goZXZlbnRUeXBlID0+IHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50VHlwZSwgW10pO1xuICAgIH0pO1xuICB9XG4gIFxuICAvLyDns7vntbHnrqHnkIZcbiAgcHVibGljIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgdGhpcy5jcmVhdGVEZWZhdWx0QnV0dG9ucygpO1xuICB9XG4gIFxuICBwcml2YXRlIGNyZWF0ZURlZmF1bHRCdXR0b25zKCk6IHZvaWQge1xuICAgIC8vIOaOp+WItuWIh+aPm+aMiemIlVxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCdjb250cm9sX2NoYW5nZScsICfmjqfliLZfUDEnLCAyMCwgMjAsICgpID0+IHtcbiAgICAgIHRoaXMuY2hhbmdlQ29udHJvbCgpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIOaWsOWinuWWruS9jeaMiemIlVxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCduZXdfdW5pdCcsICfmlrDllq7kvY0nLCAyMCwgNTAsICgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdE5ld1VuaXRzKCk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gUFZQIOaooeW8j+WIh+aPm1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCdwdnBfdG9nZ2xlJywgJ1BWUCBGJywgMjAsIDgwLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZVBWUCgpO1xuICAgIH0pO1xuICAgIFxuICAgIC8vIOWPs+WBtOmhr+ekuumBuOmgheaMiemIlVxuICAgIGNvbnN0IHJpZ2h0WCA9IHRoaXMuZGlzcGxheVdpZHRoIC0gMTIwO1xuICAgIFxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCdhcnJvd190b2dnbGUnLCAnQXJyb3cgT04nLCByaWdodFgsIDIwLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZUFycm93cygpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCd0YXJnZXRfbGluZV90b2dnbGUnLCAnVGFyZ2V0IE9OJywgcmlnaHRYLCA1MCwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVUYXJnZXRMaW5lcygpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKCd1bml0X3N0YXRzX3RvZ2dsZScsICdTdGF0cyBPTicsIHJpZ2h0WCwgODAsICgpID0+IHtcbiAgICAgIHRoaXMudG9nZ2xlVW5pdFN0YXRzKCk7XG4gICAgfSk7XG4gIH1cbiAgXG4gIHB1YmxpYyB1cGRhdGUoX2RlbHRhVGltZTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gVUkg57O757Wx55qE5pu05paw6YKP6Lyv77yI5aaC5p6c6ZyA6KaB77yJXG4gICAgLy8g5L6L5aaC77ya5YuV55Wr44CB54uA5oWL5qqi5p+l562JXG4gIH1cbiAgXG4gIHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIOa4heeQhuaJgOacieaMiemIlVxuICAgIHRoaXMuYnV0dG9ucy5mb3JFYWNoKGJ1dHRvbiA9PiB7XG4gICAgICBidXR0b24uZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIHRoaXMuYnV0dG9ucy5jbGVhcigpO1xuICAgIFxuICAgIC8vIOa4heeQhuS6i+S7tuebo+iBveWZqFxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgfVxuICBcbiAgLy8g5oyJ6YiV566h55CGXG4gIHB1YmxpYyBjcmVhdGVCdXR0b24oaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBVSUJ1dHRvbiB7XG4gICAgLy8g5aaC5p6c5oyJ6YiV5bey5a2Y5Zyo77yM5YWI56e76ZmkXG4gICAgaWYgKHRoaXMuYnV0dG9ucy5oYXMoaWQpKSB7XG4gICAgICB0aGlzLnJlbW92ZUJ1dHRvbihpZCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcy5wLCBpZCwgdGV4dCwgeCwgeSwgY2FsbGJhY2spO1xuICAgIHRoaXMuYnV0dG9ucy5zZXQoaWQsIGJ1dHRvbik7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbiAgfVxuICBcbiAgcHVibGljIGdldEJ1dHRvbihpZDogc3RyaW5nKTogVUlCdXR0b24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmJ1dHRvbnMuZ2V0KGlkKTtcbiAgfVxuICBcbiAgcHVibGljIHJlbW92ZUJ1dHRvbihpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5idXR0b25zLmdldChpZCk7XG4gICAgaWYgKGJ1dHRvbikge1xuICAgICAgYnV0dG9uLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuYnV0dG9ucy5kZWxldGUoaWQpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gVUkg5LqL5Lu26JmV55CG5pa55rOVXG4gIHByaXZhdGUgY2hhbmdlQ29udHJvbCgpOiB2b2lkIHtcbiAgICAvLyDlvqrnkrDliIfmj5vmjqfliLbmqKHlvI9cbiAgICBzd2l0Y2ggKHRoaXMuY3VycmVudENvbnRyb2wpIHtcbiAgICAgIGNhc2UgQ29udHJvbE1vZGUuUExBWUVSOlxuICAgICAgICB0aGlzLmN1cnJlbnRDb250cm9sID0gQ29udHJvbE1vZGUuRU5FTVk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDb250cm9sTW9kZS5FTkVNWTpcbiAgICAgICAgdGhpcy5jdXJyZW50Q29udHJvbCA9IENvbnRyb2xNb2RlLkVORU1ZMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENvbnRyb2xNb2RlLkVORU1ZMjpcbiAgICAgICAgdGhpcy5jdXJyZW50Q29udHJvbCA9IENvbnRyb2xNb2RlLlBMQVlFUjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLmN1cnJlbnRDb250cm9sID0gQ29udHJvbE1vZGUuUExBWUVSO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnVwZGF0ZUNvbnRyb2xEaXNwbGF5KHRoaXMuY3VycmVudENvbnRyb2wpO1xuICAgIFxuICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgIHR5cGU6IFVJRXZlbnRUeXBlLkNPTlRST0xfQ0hBTkdFRCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGRhdGE6IHsgY29udHJvbDogdGhpcy5jdXJyZW50Q29udHJvbCB9XG4gICAgfSk7XG4gIH1cbiAgXG4gIHByaXZhdGUgcmVxdWVzdE5ld1VuaXRzKCk6IHZvaWQge1xuICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgIHR5cGU6IFVJRXZlbnRUeXBlLk5FV19VTklUX1JFUVVFU1RFRCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGRhdGE6IHsgY29udHJvbDogdGhpcy5jdXJyZW50Q29udHJvbCB9XG4gICAgfSk7XG4gIH1cbiAgXG4gIHByaXZhdGUgdG9nZ2xlUFZQKCk6IHZvaWQge1xuICAgIHRoaXMuaXNQVlAgPSAhdGhpcy5pc1BWUDtcbiAgICB0aGlzLnVwZGF0ZVBWUERpc3BsYXkodGhpcy5pc1BWUCk7XG4gICAgXG4gICAgdGhpcy50cmlnZ2VyRXZlbnQoe1xuICAgICAgdHlwZTogVUlFdmVudFR5cGUuUFZQX1RPR0dMRUQsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICBkYXRhOiB7IGlzUFZQOiB0aGlzLmlzUFZQIH1cbiAgICB9KTtcbiAgfVxuICBcbiAgcHJpdmF0ZSB0b2dnbGVBcnJvd3MoKTogdm9pZCB7XG4gICAgdGhpcy5zaG93QXJyb3dzID0gIXRoaXMuc2hvd0Fycm93cztcbiAgICB0aGlzLnVwZGF0ZUFycm93RGlzcGxheSh0aGlzLnNob3dBcnJvd3MpO1xuICAgIFxuICAgIHRoaXMudHJpZ2dlckV2ZW50KHtcbiAgICAgIHR5cGU6IFVJRXZlbnRUeXBlLkFSUk9XX1RPR0dMRUQsXG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICBkYXRhOiB7IHNob3dBcnJvd3M6IHRoaXMuc2hvd0Fycm93cyB9XG4gICAgfSk7XG4gIH1cbiAgXG4gIHByaXZhdGUgdG9nZ2xlVGFyZ2V0TGluZXMoKTogdm9pZCB7XG4gICAgdGhpcy5zaG93VGFyZ2V0TGluZXMgPSAhdGhpcy5zaG93VGFyZ2V0TGluZXM7XG4gICAgdGhpcy51cGRhdGVUYXJnZXRMaW5lRGlzcGxheSh0aGlzLnNob3dUYXJnZXRMaW5lcyk7XG4gICAgXG4gICAgdGhpcy50cmlnZ2VyRXZlbnQoe1xuICAgICAgdHlwZTogVUlFdmVudFR5cGUuVEFSR0VUX0xJTkVfVE9HR0xFRCxcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIGRhdGE6IHsgc2hvd1RhcmdldExpbmVzOiB0aGlzLnNob3dUYXJnZXRMaW5lcyB9XG4gICAgfSk7XG4gIH1cbiAgXG4gIHByaXZhdGUgdG9nZ2xlVW5pdFN0YXRzKCk6IHZvaWQge1xuICAgIHRoaXMuc2hvd1VuaXRTdGF0cyA9ICF0aGlzLnNob3dVbml0U3RhdHM7XG4gICAgdGhpcy51cGRhdGVVbml0U3RhdHNEaXNwbGF5KHRoaXMuc2hvd1VuaXRTdGF0cyk7XG4gICAgXG4gICAgdGhpcy50cmlnZ2VyRXZlbnQoe1xuICAgICAgdHlwZTogVUlFdmVudFR5cGUuVU5JVF9TVEFUU19UT0dHTEVELFxuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgZGF0YTogeyBzaG93VW5pdFN0YXRzOiB0aGlzLnNob3dVbml0U3RhdHMgfVxuICAgIH0pO1xuICB9XG4gIFxuICAvLyBVSSDni4DmhYvmm7TmlrBcbiAgcHVibGljIHVwZGF0ZUNvbnRyb2xEaXNwbGF5KGNvbnRyb2w6IENvbnRyb2xNb2RlKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50Q29udHJvbCA9IGNvbnRyb2w7XG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5nZXRCdXR0b24oJ2NvbnRyb2xfY2hhbmdlJyk7XG4gICAgaWYgKGJ1dHRvbikge1xuICAgICAgYnV0dG9uLnNldFRleHQoYOaOp+WItl9QJHtjb250cm9sfWApO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHVwZGF0ZVBWUERpc3BsYXkoaXNQVlA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmlzUFZQID0gaXNQVlA7XG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5nZXRCdXR0b24oJ3B2cF90b2dnbGUnKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBidXR0b24uc2V0VGV4dChpc1BWUCA/ICdQVlAgVCcgOiAnUFZQIEYnKTtcbiAgICB9XG4gIH1cbiAgXG4gIHB1YmxpYyB1cGRhdGVBcnJvd0Rpc3BsYXkoc2hvd0Fycm93czogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc2hvd0Fycm93cyA9IHNob3dBcnJvd3M7XG4gICAgY29uc3QgYnV0dG9uID0gdGhpcy5nZXRCdXR0b24oJ2Fycm93X3RvZ2dsZScpO1xuICAgIGlmIChidXR0b24pIHtcbiAgICAgIGJ1dHRvbi5zZXRUZXh0KHNob3dBcnJvd3MgPyAnQXJyb3cgT04nIDogJ0Fycm93IE9GRicpO1xuICAgIH1cbiAgfVxuICBcbiAgcHVibGljIHVwZGF0ZVRhcmdldExpbmVEaXNwbGF5KHNob3dUYXJnZXRMaW5lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc2hvd1RhcmdldExpbmVzID0gc2hvd1RhcmdldExpbmVzO1xuICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMuZ2V0QnV0dG9uKCd0YXJnZXRfbGluZV90b2dnbGUnKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBidXR0b24uc2V0VGV4dChzaG93VGFyZ2V0TGluZXMgPyAnVGFyZ2V0IE9OJyA6ICdUYXJnZXQgT0ZGJyk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgdXBkYXRlVW5pdFN0YXRzRGlzcGxheShzaG93VW5pdFN0YXRzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zaG93VW5pdFN0YXRzID0gc2hvd1VuaXRTdGF0cztcbiAgICBjb25zdCBidXR0b24gPSB0aGlzLmdldEJ1dHRvbigndW5pdF9zdGF0c190b2dnbGUnKTtcbiAgICBpZiAoYnV0dG9uKSB7XG4gICAgICBidXR0b24uc2V0VGV4dChzaG93VW5pdFN0YXRzID8gJ1N0YXRzIE9OJyA6ICdTdGF0cyBPRkYnKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOe1seioiOizh+ioiumhr+ekuu+8iOWcqOmBiuaIsuS4remhr+ekuu+8jOS4jeaYryBET00g5oyJ6YiV77yJXG4gIHB1YmxpYyB1cGRhdGVVbml0Q291bnRzKF91bml0Q291bnRzOiBudW1iZXJbXSk6IHZvaWQge1xuICAgIC8vIOmAmeWAi+aWueazleacg+iiq+a4suafk+ezu+e1seiqv+eUqOS+humhr+ekuuWWruS9jee1seioiFxuICAgIC8vIOWvpumam+eahOaWh+Wtl+a4suafk+acg+WcqCBSZW5kZXJTeXN0ZW0g5Lit6JmV55CGXG4gIH1cbiAgXG4gIC8vIOS6i+S7tuezu+e1sVxuICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IFVJRXZlbnRUeXBlLCBjYWxsYmFjazogVUlFdmVudENhbGxiYWNrKTogdm9pZCB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICBpZiAobGlzdGVuZXJzICYmICFsaXN0ZW5lcnMuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICBsaXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG4gIFxuICBwdWJsaWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IFVJRXZlbnRUeXBlLCBjYWxsYmFjazogVUlFdmVudENhbGxiYWNrKTogdm9pZCB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5ldmVudExpc3RlbmVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFxuICBwcml2YXRlIHRyaWdnZXJFdmVudChldmVudDogVUlFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjYWxsYmFjayhldmVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gVUkgZXZlbnQgY2FsbGJhY2sgZm9yICR7ZXZlbnQudHlwZX06YCwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOeLgOaFi+afpeipolxuICBwdWJsaWMgZ2V0Q3VycmVudENvbnRyb2woKTogQ29udHJvbE1vZGUge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRDb250cm9sO1xuICB9XG4gIFxuICBwdWJsaWMgZ2V0SXNQVlAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNQVlA7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXREaXNwbGF5U2V0dGluZ3MoKToge1xuICAgIHNob3dBcnJvd3M6IGJvb2xlYW47XG4gICAgc2hvd1RhcmdldExpbmVzOiBib29sZWFuO1xuICAgIHNob3dVbml0U3RhdHM6IGJvb2xlYW47XG4gIH0ge1xuICAgIHJldHVybiB7XG4gICAgICBzaG93QXJyb3dzOiB0aGlzLnNob3dBcnJvd3MsXG4gICAgICBzaG93VGFyZ2V0TGluZXM6IHRoaXMuc2hvd1RhcmdldExpbmVzLFxuICAgICAgc2hvd1VuaXRTdGF0czogdGhpcy5zaG93VW5pdFN0YXRzXG4gICAgfTtcbiAgfVxuICBcbiAgLy8g5om56YeP54uA5oWL6Kit5a6aXG4gIHB1YmxpYyB1cGRhdGVBbGxEaXNwbGF5U2V0dGluZ3Moc2V0dGluZ3M6IHtcbiAgICBpc1BWUD86IGJvb2xlYW47XG4gICAgc2hvd0Fycm93cz86IGJvb2xlYW47XG4gICAgc2hvd1RhcmdldExpbmVzPzogYm9vbGVhbjtcbiAgICBzaG93VW5pdFN0YXRzPzogYm9vbGVhbjtcbiAgfSk6IHZvaWQge1xuICAgIGlmIChzZXR0aW5ncy5pc1BWUCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmlzUFZQID0gc2V0dGluZ3MuaXNQVlA7XG4gICAgICB0aGlzLnVwZGF0ZVBWUERpc3BsYXkodGhpcy5pc1BWUCk7XG4gICAgfVxuICAgIFxuICAgIGlmIChzZXR0aW5ncy5zaG93QXJyb3dzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2hvd0Fycm93cyA9IHNldHRpbmdzLnNob3dBcnJvd3M7XG4gICAgICB0aGlzLnVwZGF0ZUFycm93RGlzcGxheSh0aGlzLnNob3dBcnJvd3MpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoc2V0dGluZ3Muc2hvd1RhcmdldExpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2hvd1RhcmdldExpbmVzID0gc2V0dGluZ3Muc2hvd1RhcmdldExpbmVzO1xuICAgICAgdGhpcy51cGRhdGVUYXJnZXRMaW5lRGlzcGxheSh0aGlzLnNob3dUYXJnZXRMaW5lcyk7XG4gICAgfVxuICAgIFxuICAgIGlmIChzZXR0aW5ncy5zaG93VW5pdFN0YXRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2hvd1VuaXRTdGF0cyA9IHNldHRpbmdzLnNob3dVbml0U3RhdHM7XG4gICAgICB0aGlzLnVwZGF0ZVVuaXRTdGF0c0Rpc3BsYXkodGhpcy5zaG93VW5pdFN0YXRzKTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIOmdouadv+euoeeQhu+8iOmrmOe0muWKn+iDve+8iVxuICBwdWJsaWMgY3JlYXRlUGFuZWwoaWQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogVUlQYW5lbCB7XG4gICAgY29uc3QgcGFuZWw6IFVJUGFuZWwgPSB7XG4gICAgICBpZCxcbiAgICAgIHBvc2l0aW9uOiB7IHgsIHkgfSBhcyBJVmVjdG9yLFxuICAgICAgc2l6ZTogeyB4OiB3aWR0aCwgeTogaGVpZ2h0IH0gYXMgSVZlY3RvcixcbiAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICBidXR0b25zOiBbXSxcbiAgICAgIFxuICAgICAgYWRkQnV0dG9uOiAoYnV0dG9uOiBVSUJ1dHRvbikgPT4ge1xuICAgICAgICBwYW5lbC5idXR0b25zLnB1c2goYnV0dG9uKTtcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIHJlbW92ZUJ1dHRvbjogKGJ1dHRvbklkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBwYW5lbC5idXR0b25zLmZpbmRJbmRleChiID0+IGIuaWQgPT09IGJ1dHRvbklkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHBhbmVsLmJ1dHRvbnNbaW5kZXhdLmRlc3Ryb3koKTtcbiAgICAgICAgICBwYW5lbC5idXR0b25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcbiAgICAgIHNldFZpc2libGU6ICh2aXNpYmxlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIHBhbmVsLnZpc2libGUgPSB2aXNpYmxlO1xuICAgICAgICBwYW5lbC5idXR0b25zLmZvckVhY2goYnV0dG9uID0+IHtcbiAgICAgICAgICBidXR0b24uc2V0VmlzaWJsZSh2aXNpYmxlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICB0aGlzLnBhbmVscy5zZXQoaWQsIHBhbmVsKTtcbiAgICByZXR1cm4gcGFuZWw7XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRQYW5lbChpZDogc3RyaW5nKTogVUlQYW5lbCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucGFuZWxzLmdldChpZCk7XG4gIH1cbiAgXG4gIHB1YmxpYyByZW1vdmVQYW5lbChpZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVscy5nZXQoaWQpO1xuICAgIGlmIChwYW5lbCkge1xuICAgICAgcGFuZWwuYnV0dG9ucy5mb3JFYWNoKGJ1dHRvbiA9PiB7XG4gICAgICAgIGJ1dHRvbi5kZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucGFuZWxzLmRlbGV0ZShpZCk7XG4gICAgfVxuICB9XG59IiwiLy8g5YWx55So5Z6L5Yil5a6a576pXG5cbi8vIOWWruS9jeeLgOaFi+WIl+iIiVxuZXhwb3J0IGVudW0gVW5pdFN0YXRlIHtcbiAgTU9WRSA9ICdtb3ZlJyxcbiAgU1RPUCA9ICdzdG9wJyxcbiAgRk9MTE9XID0gJ2ZvbGxvdycsXG4gIEFUVEFDSyA9ICdhdHRhY2snLFxuICBFU0NBUEUgPSAnZXNjYXBlJyxcbiAgRElFID0gJ2RpZSdcbn1cblxuLy8g5o6n5Yi25qih5byP5YiX6IiJXG5leHBvcnQgZW51bSBDb250cm9sTW9kZSB7XG4gIFBMQVlFUiA9IDEsXG4gIEVORU1ZID0gMixcbiAgRU5FTVkyID0gM1xufVxuXG4vLyDpgYrmiLLoqK3lrprku4vpnaJcbmV4cG9ydCBpbnRlcmZhY2UgR2FtZUNvbmZpZyB7XG4gIGRpc3BsYXlXaWR0aDogbnVtYmVyO1xuICBkaXNwbGF5SGVpZ2h0OiBudW1iZXI7XG4gIG1heFVuaXRzOiBudW1iZXI7XG4gIGlzUFZQOiBib29sZWFuO1xuICBzaG93U3RhdHM6IGJvb2xlYW47XG4gIHNob3dEZWJ1ZzogYm9vbGVhbjtcbn1cblxuLy8g5L2N572u5LuL6Z2iXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbi8vIOWwuuWvuOS7i+mdolxuZXhwb3J0IGludGVyZmFjZSBTaXplIHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbi8vIOmhj+iJsuS7i+mdolxuZXhwb3J0IGludGVyZmFjZSBDb2xvciB7XG4gIHI6IG51bWJlcjtcbiAgZzogbnVtYmVyO1xuICBiOiBudW1iZXI7XG4gIGE/OiBudW1iZXI7XG59XG5cbi8vIOaUu+aTiuioreWumuS7i+mdolxuZXhwb3J0IGludGVyZmFjZSBBdHRhY2tDb25maWcge1xuICBkYW1hZ2U6IG51bWJlcjtcbiAgcmFuZ2U6IG51bWJlcjtcbiAgY29vbGRvd246IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbn1cblxuLy8g56e75YuV6Kit5a6a5LuL6Z2iXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVtZW50Q29uZmlnIHtcbiAgbWF4U3BlZWQ6IG51bWJlcjtcbiAgbWF4Rm9yY2U6IG51bWJlcjtcbiAgc2VwYXJhdGlvbkRpc3RhbmNlOiBudW1iZXI7XG4gIG5laWdoYm9yRGlzdGFuY2U6IG51bWJlcjtcbiAgZGVzaXJlZFNlcGFyYXRpb246IG51bWJlcjtcbn1cblxuLy8g576k6auU6KGM54K65qyK6YeN5LuL6Z2iXG5leHBvcnQgaW50ZXJmYWNlIEZsb2NrV2VpZ2h0cyB7XG4gIHNlcGFyYXRpb246IG51bWJlcjtcbiAgYWxpZ25tZW50OiBudW1iZXI7XG4gIGNvaGVzaW9uOiBudW1iZXI7XG4gIGF2b2lkYW5jZTogbnVtYmVyO1xuICBzZWVrOiBudW1iZXI7XG59XG5cbi8vIOS6i+S7tumhnuWei+WIl+iIiVxuZXhwb3J0IGVudW0gRXZlbnRUeXBlIHtcbiAgVU5JVF9DUkVBVEVEID0gJ3VuaXRfY3JlYXRlZCcsXG4gIFVOSVRfREVTVFJPWUVEID0gJ3VuaXRfZGVzdHJveWVkJyxcbiAgVU5JVF9BVFRBQ0sgPSAndW5pdF9hdHRhY2snLFxuICBVTklUX0RBTUFHRUQgPSAndW5pdF9kYW1hZ2VkJyxcbiAgVU5JVF9TVEFURV9DSEFOR0VEID0gJ3VuaXRfc3RhdGVfY2hhbmdlZCcsXG4gIENPTlRST0xfQ0hBTkdFRCA9ICdjb250cm9sX2NoYW5nZWQnXG59XG5cbi8vIOmBiuaIsuS6i+S7tuS7i+mdolxuZXhwb3J0IGludGVyZmFjZSBHYW1lRXZlbnQge1xuICB0eXBlOiBFdmVudFR5cGU7XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xuICBzb3VyY2U/OiBhbnk7XG4gIHRhcmdldD86IGFueTtcbiAgZGF0YT86IGFueTtcbn1cblxuLy8g5pW45a245bel5YW36aGe5Z6LXG5leHBvcnQgdHlwZSBWZWN0b3IyRCA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBWZWN0b3IzRCA9IFZlY3RvcjJEICYge1xuICB6OiBudW1iZXI7XG59O1xuXG4vLyDnr4TlnI3poZ7lnotcbmV4cG9ydCB0eXBlIFJhbmdlID0ge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG59O1xuXG4vLyDpgornlYzmoYbpoZ7lnotcbmV4cG9ydCB0eXBlIEJvdW5kaW5nQm94ID0ge1xuICBsZWZ0OiBudW1iZXI7XG4gIHJpZ2h0OiBudW1iZXI7XG4gIHRvcDogbnVtYmVyO1xuICBib3R0b206IG51bWJlcjtcbn07IiwiLy8g5ZCR6YeP5bel5YW36aGe5YilIC0g5bCB6KOdIHA1LlZlY3RvciDnmoQgVHlwZVNjcmlwdCDlr6bkvZxcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBlcy9wNS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgSVZlY3RvciB9IGZyb20gJy4uL3R5cGVzL3ZlY3Rvcic7XG5cbmV4cG9ydCBjbGFzcyBWZWN0b3IgaW1wbGVtZW50cyBJVmVjdG9yIHtcbiAgcHVibGljIHg6IG51bWJlcjtcbiAgcHVibGljIHk6IG51bWJlcjtcbiAgcHVibGljIHo/OiBudW1iZXI7XG4gIFxuICBwcml2YXRlIHA6IHA1SW5zdGFuY2U7XG4gIFxuICBjb25zdHJ1Y3RvcihwOiBwNUluc3RhbmNlLCB4OiBudW1iZXIgPSAwLCB5OiBudW1iZXIgPSAwLCB6PzogbnVtYmVyKSB7XG4gICAgdGhpcy5wID0gcDtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgaWYgKHogIT09IHVuZGVmaW5lZCkgdGhpcy56ID0gejtcbiAgfVxuICBcbiAgXG4gIC8vIOWfuuacrOmBi+eul1xuICBhZGQodjogSVZlY3Rvcik6IElWZWN0b3Ige1xuICAgIHRoaXMueCArPSB2Lng7XG4gICAgdGhpcy55ICs9IHYueTtcbiAgICBpZiAodi56ICE9PSB1bmRlZmluZWQgJiYgdGhpcy56ICE9PSB1bmRlZmluZWQpIHRoaXMueiArPSB2Lno7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIHN1Yih2OiBJVmVjdG9yKTogSVZlY3RvciB7XG4gICAgdGhpcy54IC09IHYueDtcbiAgICB0aGlzLnkgLT0gdi55O1xuICAgIGlmICh2LnogIT09IHVuZGVmaW5lZCAmJiB0aGlzLnogIT09IHVuZGVmaW5lZCkgdGhpcy56IC09IHYuejtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgbXVsdChuOiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICB0aGlzLnggKj0gbjtcbiAgICB0aGlzLnkgKj0gbjtcbiAgICBpZiAodGhpcy56ICE9PSB1bmRlZmluZWQpIHRoaXMueiAqPSBuO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIFxuICBkaXYobjogbnVtYmVyKTogSVZlY3RvciB7XG4gICAgaWYgKG4gPT09IDApIHJldHVybiB0aGlzO1xuICAgIHRoaXMueCAvPSBuO1xuICAgIHRoaXMueSAvPSBuO1xuICAgIGlmICh0aGlzLnogIT09IHVuZGVmaW5lZCkgdGhpcy56IC89IG47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8vIOWQkemHj+WxrOaAp1xuICBtYWcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArICh0aGlzLnogfHwgMCkgKiAodGhpcy56IHx8IDApKTtcbiAgfVxuICBcbiAgbWFnU3EoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgKHRoaXMueiB8fCAwKSAqICh0aGlzLnogfHwgMCk7XG4gIH1cbiAgXG4gIG5vcm1hbGl6ZSgpOiBJVmVjdG9yIHtcbiAgICBjb25zdCBtYWduaXR1ZGUgPSB0aGlzLm1hZygpO1xuICAgIGlmIChtYWduaXR1ZGUgPiAwKSB7XG4gICAgICB0aGlzLmRpdihtYWduaXR1ZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgbGltaXQobWF4OiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICBjb25zdCBtYWduaXR1ZGUgPSB0aGlzLm1hZygpO1xuICAgIGlmIChtYWduaXR1ZGUgPiBtYXgpIHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgICB0aGlzLm11bHQobWF4KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgXG4gIC8vIOaWueWQkeebuOmXnFxuICBoZWFkaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xuICB9XG4gIFxuICByb3RhdGUoYW5nbGU6IG51bWJlcik6IElWZWN0b3Ige1xuICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKGFuZ2xlKTtcbiAgICBjb25zdCBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgY29uc3QgbmV3WCA9IHRoaXMueCAqIGNvcyAtIHRoaXMueSAqIHNpbjtcbiAgICBjb25zdCBuZXdZID0gdGhpcy54ICogc2luICsgdGhpcy55ICogY29zO1xuICAgIHRoaXMueCA9IG5ld1g7XG4gICAgdGhpcy55ID0gbmV3WTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLy8g5bel5YW35pa55rOVXG4gIGNvcHkoKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy5wLCB0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcbiAgfVxuICBcbiAgZGlzdCh2OiBJVmVjdG9yKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCh0aGlzLnggLSB2LngpICoqIDIgKyAodGhpcy55IC0gdi55KSAqKiAyICsgKCh0aGlzLnogfHwgMCkgLSAodi56IHx8IDApKSAqKiAyKTtcbiAgfVxuICBcbiAgZG90KHY6IElWZWN0b3IpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyAodGhpcy56IHx8IDApICogKHYueiB8fCAwKTtcbiAgfVxuICBcbiAgY3Jvc3ModjogSVZlY3Rvcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueDtcbiAgfVxuICBcbiAgYW5nbGVCZXR3ZWVuKHY6IElWZWN0b3IpOiBudW1iZXIge1xuICAgIGNvbnN0IGRvdCA9IHRoaXMuZG90KHYpO1xuICAgIGNvbnN0IG1hZzEgPSB0aGlzLm1hZygpO1xuICAgIGNvbnN0IG1hZzIgPSB2Lm1hZygpO1xuICAgIHJldHVybiBNYXRoLmFjb3MoZG90IC8gKG1hZzEgKiBtYWcyKSk7XG4gIH1cbiAgXG4gIC8vIOioreWumuaWueazlVxuICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo/OiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgaWYgKHogIT09IHVuZGVmaW5lZCkgdGhpcy56ID0gejtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgc2V0TWFnKGxlbjogbnVtYmVyKTogSVZlY3RvciB7XG4gICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICB0aGlzLm11bHQobGVuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBcbiAgLy8g6Z2c5oWL5pa55rOVXG4gIHN0YXRpYyBhZGQocDogcDVJbnN0YW5jZSwgdjE6IElWZWN0b3IsIHYyOiBJVmVjdG9yKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocCwgdjEueCArIHYyLngsIHYxLnkgKyB2Mi55LCAodjEueiB8fCAwKSArICh2Mi56IHx8IDApKTtcbiAgfVxuICBcbiAgc3RhdGljIHN1YihwOiBwNUluc3RhbmNlLCB2MTogSVZlY3RvciwgdjI6IElWZWN0b3IpOiBJVmVjdG9yIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLCB2MS54IC0gdjIueCwgdjEueSAtIHYyLnksICh2MS56IHx8IDApIC0gKHYyLnogfHwgMCkpO1xuICB9XG4gIFxuICBzdGF0aWMgbXVsdChwOiBwNUluc3RhbmNlLCB2OiBJVmVjdG9yLCBuOiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLCB2LnggKiBuLCB2LnkgKiBuLCAodi56IHx8IDApICogbik7XG4gIH1cbiAgXG4gIHN0YXRpYyBkaXYocDogcDVJbnN0YW5jZSwgdjogSVZlY3RvciwgbjogbnVtYmVyKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocCwgdi54IC8gbiwgdi55IC8gbiwgKHYueiB8fCAwKSAvIG4pO1xuICB9XG4gIFxuICBzdGF0aWMgZGlzdCh2MTogSVZlY3RvciwgdjI6IElWZWN0b3IpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoKHYxLnggLSB2Mi54KSAqKiAyICsgKHYxLnkgLSB2Mi55KSAqKiAyICsgKCh2MS56IHx8IDApIC0gKHYyLnogfHwgMCkpICoqIDIpO1xuICB9XG4gIFxuICBzdGF0aWMgZG90KHYxOiBJVmVjdG9yLCB2MjogSVZlY3Rvcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHYxLnggKiB2Mi54ICsgdjEueSAqIHYyLnkgKyAodjEueiB8fCAwKSAqICh2Mi56IHx8IDApO1xuICB9XG4gIFxuICBzdGF0aWMgY3Jvc3ModjE6IElWZWN0b3IsIHYyOiBJVmVjdG9yKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdjEueCAqIHYyLnkgLSB2MS55ICogdjIueDtcbiAgfVxuICBcbiAgc3RhdGljIGFuZ2xlQmV0d2Vlbih2MTogSVZlY3RvciwgdjI6IElWZWN0b3IpOiBudW1iZXIge1xuICAgIGNvbnN0IGRvdCA9IFZlY3Rvci5kb3QodjEsIHYyKTtcbiAgICBjb25zdCBtYWcxID0gdjEubWFnKCk7XG4gICAgY29uc3QgbWFnMiA9IHYyLm1hZygpO1xuICAgIHJldHVybiBNYXRoLmFjb3MoZG90IC8gKG1hZzEgKiBtYWcyKSk7XG4gIH1cbiAgXG4gIHN0YXRpYyBmcm9tQW5nbGUocDogcDVJbnN0YW5jZSwgYW5nbGU6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIgPSAxKTogSVZlY3RvciB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IocCwgTWF0aC5jb3MoYW5nbGUpICogbGVuZ3RoLCBNYXRoLnNpbihhbmdsZSkgKiBsZW5ndGgpO1xuICB9XG4gIFxuICBzdGF0aWMgcmFuZG9tMkQocDogcDVJbnN0YW5jZSk6IElWZWN0b3Ige1xuICAgIGNvbnN0IGFuZ2xlID0gcC5yYW5kb20oMCwgTWF0aC5QSSAqIDIpO1xuICAgIHJldHVybiBWZWN0b3IuZnJvbUFuZ2xlKHAsIGFuZ2xlKTtcbiAgfVxuICBcbiAgc3RhdGljIHJhbmRvbTNEKHA6IHA1SW5zdGFuY2UpOiBJVmVjdG9yIHtcbiAgICBjb25zdCBhbmdsZTEgPSBwLnJhbmRvbSgwLCBNYXRoLlBJICogMik7XG4gICAgY29uc3QgYW5nbGUyID0gcC5yYW5kb20oMCwgTWF0aC5QSSAqIDIpO1xuICAgIHJldHVybiBuZXcgVmVjdG9yKHAsIE1hdGguY29zKGFuZ2xlMSksIE1hdGguc2luKGFuZ2xlMSkgKiBNYXRoLmNvcyhhbmdsZTIpLCBNYXRoLnNpbihhbmdsZTEpICogTWF0aC5zaW4oYW5nbGUyKSk7XG4gIH1cbiAgXG4gIHN0YXRpYyBsZXJwKHA6IHA1SW5zdGFuY2UsIHYxOiBJVmVjdG9yLCB2MjogSVZlY3RvciwgYW10OiBudW1iZXIpOiBJVmVjdG9yIHtcbiAgICBjb25zdCB4ID0gdjEueCArICh2Mi54IC0gdjEueCkgKiBhbXQ7XG4gICAgY29uc3QgeSA9IHYxLnkgKyAodjIueSAtIHYxLnkpICogYW10O1xuICAgIGNvbnN0IHogPSAodjEueiB8fCAwKSArICgodjIueiB8fCAwKSAtICh2MS56IHx8IDApKSAqIGFtdDtcbiAgICByZXR1cm4gbmV3IFZlY3RvcihwLCB4LCB5LCB6KTtcbiAgfVxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8g6YGK5oiy5oeJ55So56iL5byP5Li75YWl5Y+jXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSAnLi9HYW1lJztcblxuLy8g5YWo5Z+f6YGK5oiy5a+m5L6LXG5sZXQgZ2FtZTogR2FtZTtcblxuLy8g6aCB6Z2i6LyJ5YWl5a6M5oiQ5b6M5Yid5aeL5YyW6YGK5oiyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zb2xlLmxvZygn6ZaL5aeL5Yid5aeL5YyWIFR5cGVTY3JpcHQg6YeN5qeL54mI5pysLi4uJyk7XG4gIFxuICAvLyDlibXlu7rpgYrmiLLlr6bkvotcbiAgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gIFxuICAvLyDmqqLmn6XliJ3lp4vljJbni4DmhYtcbiAgY29uc3QgY2hlY2tJbml0ID0gKCkgPT4ge1xuICAgIGlmIChnYW1lLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgY29uc29sZS5sb2coJ+KchSDpgYrmiLLliJ3lp4vljJblrozmiJAnKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgcDUuanMgSW5zdGFuY2UgTW9kZSDpgYvooYzkuK0nKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgR2FtZVNrZXRjaCDmnrbmp4vlt7LlsLHnt5InKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChjaGVja0luaXQsIDEwMCk7XG4gICAgfVxuICB9O1xuICBcbiAgY2hlY2tJbml0KCk7XG59KTtcblxuLy8g5YWo5Z+f6YGK5oiy5o6n5Yi25Ye95pW4XG4od2luZG93IGFzIGFueSkuZ2FtZUNvbnRyb2xzID0ge1xuICBwYXVzZTogKCkgPT4gZ2FtZT8ucGF1c2UoKSxcbiAgcmVzdW1lOiAoKSA9PiBnYW1lPy5yZXN1bWUoKSxcbiAgcmVzZXQ6ICgpID0+IGdhbWU/LnJlc2V0KCksXG4gIGdldFNrZXRjaDogKCkgPT4gZ2FtZT8uZ2V0R2FtZVNrZXRjaCgpXG59O1xuXG4vLyDpoIHpnaLljbjovInmmYLmuIXnkIbos4fmupBcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB7XG4gIGdhbWU/LmRlc3Ryb3koKTtcbn0pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==