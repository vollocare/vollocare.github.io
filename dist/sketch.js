"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowResized = exports.mousePressed = exports.draw = exports.setup = void 0;
const obstacles_1 = require("./obstacles");
const gup_unit_obj_1 = require("./gup_unit_obj");
const flock_1 = require("./flock");
require("./globals");
// 系統常數定義
const DEFAULT_CAMERA_Z = 554;
const ASPECT_RATIO_THRESHOLD = 1.25;
const FRAME_RATE_THRESHOLD = 41;
const MIGRATION_LENGTH = 10;
const NEW_UNIT_COOLDOWN = 200;
const UNIT_SPAWN_OFFSET = 50;
// 視角邊界常數
const VIEW_BOUNDARIES = {
    minX: -500,
    maxX: 1524,
    minY: -500,
    maxY: 1140
};
// 遊戲狀態變數
let displayWidth = 1024;
let displayHeight = 640;
let viewX = 0;
let viewY = 0;
let gupUnitObj_size = 9;
let gupUnitObjs = [];
let control = 1;
let flock = null;
let obstacles = null;
let lastTime = 0;
let mouselastTime = 0;
let isPVP = false;
let isPVP_time = 1200;
let currCamera = null;
let textWithViewPort = null;
let showArrows = true;
let showTargetLines = true;
let showUnitStats = true;
// 設定全域變數
window.displayWidth = displayWidth;
window.displayHeight = displayHeight;
window.viewX = viewX;
window.viewY = viewY;
window.control = control;
window.isPVP = isPVP;
window.showArrows = showArrows;
window.showTargetLines = showTargetLines;
window.showUnitStats = showUnitStats;
// p5.js 主要函數
function setup() {
    console.log('TypeScript setup function called');
    // 設置全域 Vector
    if (window.setupGlobalVector) {
        window.setupGlobalVector();
    }
    // 簡化縮放計算 - 使用更保守的方式
    const windowWidth = window.windowWidth;
    const windowHeight = window.windowHeight;
    // 使用較小的尺寸以確保完整顯示
    displayWidth = Math.min(windowWidth, 1200);
    displayHeight = Math.min(windowHeight, 800);
    // 保持最小尺寸
    displayWidth = Math.max(displayWidth, 800);
    displayHeight = Math.max(displayHeight, 500);
    console.log(`Scaling: ${displayWidth}x${displayHeight} (window: ${windowWidth}x${windowHeight})`);
    window.createCanvas(displayWidth, displayHeight, window.WEBGL);
    currCamera = window.createCamera();
    viewX = displayWidth / 2;
    viewY = displayHeight / 2;
    // 更新全域變數
    window.displayWidth = displayWidth;
    window.displayHeight = displayHeight;
    // 建立文字顯示系統
    textWithViewPort = {
        currentFill: window.color(255, 255, 255),
        text: function (str, x, y) {
            window.push();
            window.fill(this.currentFill);
            window.textAlign(window.LEFT, window.TOP);
            window.textSize(12);
            window.text(str, x, y);
            window.pop();
        },
        clear: function () {
            // 清除操作（如果需要）
        },
        fill: function (color) {
            this.currentFill = color;
        },
        render: function () {
            // 渲染操作（如果需要）
        },
        setViewPort: function (x, y) {
            // 設置視口（如果需要相對定位）
        }
    };
    // 初始化遊戲物件
    flock = new flock_1.Flock();
    obstacles = new obstacles_1.Obstacles();
    // 建立群組單位
    for (let i = 0; i < gupUnitObj_size; i++) {
        const w_length = (displayWidth / gupUnitObj_size) * i + 20;
        const gupUnitObjTmp = new gup_unit_obj_1.GupUnitObj(w_length, displayHeight - UNIT_SPAWN_OFFSET, i + 1);
        gupUnitObjs.push(gupUnitObjTmp);
    }
    // 初始化障礙物
    if (obstacles) {
        obstacles.addObstacle(300, 200, 40);
        obstacles.addObstacle(600, 400, 60);
    }
    // 建立控制按鈕
    createButtons();
    console.log('Setup completed');
}
exports.setup = setup;
function draw() {
    const _lastTime = Date.now() - lastTime;
    if (_lastTime >= FRAME_RATE_THRESHOLD && gupUnitObjs.length > 0) {
        // 鍵盤控制
        if (window.keyIsPressed === true) {
            let newViewX = viewX;
            let newViewY = viewY;
            const keyCode = window.keyCode;
            if (keyCode === 87)
                newViewY -= MIGRATION_LENGTH; // W - 向上
            if (keyCode === 83)
                newViewY += MIGRATION_LENGTH; // S - 向下
            if (keyCode === 65)
                newViewX -= MIGRATION_LENGTH; // A - 向左
            if (keyCode === 68)
                newViewX += MIGRATION_LENGTH; // D - 向右
            updateViewPosition(newViewX, newViewY);
        }
        // 清除並設定背景
        if (textWithViewPort) {
            textWithViewPort.clear();
        }
        window.background(51);
        // 更新遊戲邏輯
        for (let i = 0; i < gupUnitObj_size; i++) {
            let g_enemy = [];
            for (let j = 0; j < gupUnitObj_size; j++) {
                if (i !== j) {
                    g_enemy = g_enemy.concat(gupUnitObjs[j].unitObjs);
                }
            }
            if (flock && obstacles) {
                flock.run(gupUnitObjs[i].Leader, gupUnitObjs[i].unitObjs, obstacles.obstacles, g_enemy);
            }
            gupUnitObjs[i].update(g_enemy);
        }
        // 渲染
        if (obstacles) {
            obstacles.render();
        }
        for (let i = 0; i < gupUnitObj_size; i++) {
            gupUnitObjs[i].render(textWithViewPort);
        }
        // 顯示統計資訊 - 修復顯示位置和顏色
        if (textWithViewPort) {
            textWithViewPort.fill(window.color(255, 255, 255)); // 使用白色確保可見
            for (let i = 0; i < gupUnitObj_size; i++) {
                // 使用固定位置而非相對視角位置
                const xPos = 100 + i * 50;
                textWithViewPort.text('P' + (i + 1) + '_' + gupUnitObjs[i].unitObjs.length, xPos, 20);
            }
        }
        // PVP 模式處理
        if (isPVP) {
            isPVP_time--;
            if (textWithViewPort) {
                textWithViewPort.text('PT ' + isPVP_time, window.width / 2 + 85, 50);
            }
            if (isPVP_time <= 0) {
                isPVP_time = 1200;
                for (let i = 1; i < gupUnitObj_size; i++) {
                    gupUnitObjs[i].setDestination(gupUnitObjs[0].Leader.position);
                }
            }
        }
        if (textWithViewPort) {
            textWithViewPort.render();
        }
        lastTime = Date.now();
    }
}
exports.draw = draw;
function mousePressed() {
    const currentTime = Date.now();
    if (currentTime - mouselastTime > NEW_UNIT_COOLDOWN) {
        const gupUnitObj = getGupUnitObjSafely(control - 1);
        if (gupUnitObj) {
            const mouseWorldX = window.mouseX + viewX - displayWidth / 2;
            const mouseWorldY = window.mouseY + viewY - displayHeight / 2;
            gupUnitObj.setDestination(window.createVector(mouseWorldX, mouseWorldY));
        }
        mouselastTime = currentTime;
    }
}
exports.mousePressed = mousePressed;
function createButtons() {
    // 按鈕配置
    const leftButtonWidth = 80;
    const rightButtonWidth = 90; // 右側按鈕需要更寬
    const buttonHeight = 30;
    const buttonSpacing = 10;
    // 左側控制按鈕
    const button_control = window.createButton('控制_P1');
    if (button_control && button_control.position) {
        button_control.position(20, 20);
        button_control.size(leftButtonWidth, buttonHeight);
        button_control.mousePressed(() => {
            control = (control % 3) + 1;
            window.control = control;
            console.log('Control changed to:', control);
        });
    }
    const button_new_unit = window.createButton('新單位');
    if (button_new_unit && button_new_unit.position) {
        button_new_unit.position(20, 20 + buttonHeight + buttonSpacing);
        button_new_unit.size(leftButtonWidth, buttonHeight);
        button_new_unit.mousePressed(() => {
            const gupUnitObj = getGupUnitObjSafely(control - 1);
            if (gupUnitObj) {
                for (let i = 0; i < 20; i++) {
                    gupUnitObj.add(gupUnitObj.Leader.position.x + window.random(-50, 50), gupUnitObj.Leader.position.y + window.random(-50, 50));
                }
            }
        });
    }
    const button_pvp = window.createButton('PVP F');
    if (button_pvp && button_pvp.position) {
        button_pvp.position(20, 20 + (buttonHeight + buttonSpacing) * 2);
        button_pvp.size(leftButtonWidth, buttonHeight);
        button_pvp.mousePressed(() => {
            isPVP = !isPVP;
            window.isPVP = isPVP;
            console.log('PVP mode:', isPVP);
        });
    }
    // 右側控制面板 - 使用視窗寬度並確保足夠空間
    const rightPanelX = window.windowWidth - rightButtonWidth - 20;
    // 箭頭顯示開關
    const button_arrows = window.createButton(showArrows ? '箭頭ON' : '箭頭OFF');
    if (button_arrows && button_arrows.position) {
        button_arrows.position(rightPanelX, 20);
        button_arrows.size(rightButtonWidth, buttonHeight);
        button_arrows.mousePressed(() => {
            showArrows = !showArrows;
            window.showArrows = showArrows;
            button_arrows.html(showArrows ? '箭頭ON' : '箭頭OFF');
        });
    }
    // 目標線顯示開關
    const button_target_lines = window.createButton(showTargetLines ? '目標ON' : '目標OFF');
    if (button_target_lines && button_target_lines.position) {
        button_target_lines.position(rightPanelX, 20 + buttonHeight + buttonSpacing);
        button_target_lines.size(rightButtonWidth, buttonHeight);
        button_target_lines.mousePressed(() => {
            showTargetLines = !showTargetLines;
            window.showTargetLines = showTargetLines;
            button_target_lines.html(showTargetLines ? '目標ON' : '目標OFF');
        });
    }
    // 單位統計顯示開關
    const button_unit_stats = window.createButton(showUnitStats ? '統計ON' : '統計OFF');
    if (button_unit_stats && button_unit_stats.position) {
        button_unit_stats.position(rightPanelX, 20 + (buttonHeight + buttonSpacing) * 2);
        button_unit_stats.size(rightButtonWidth, buttonHeight);
        button_unit_stats.mousePressed(() => {
            showUnitStats = !showUnitStats;
            window.showUnitStats = showUnitStats;
            button_unit_stats.html(showUnitStats ? '統計ON' : '統計OFF');
        });
    }
}
function updateViewPosition(newX, newY) {
    const constrained = constrainView(newX, newY);
    viewX = constrained.x;
    viewY = constrained.y;
    window.viewX = viewX;
    window.viewY = viewY;
    if (textWithViewPort) {
        textWithViewPort.setViewPort(viewX, viewY);
    }
    if (currCamera) {
        currCamera.setPosition(viewX, viewY, DEFAULT_CAMERA_Z);
    }
}
function constrainView(x, y) {
    return {
        x: Math.max(VIEW_BOUNDARIES.minX, Math.min(VIEW_BOUNDARIES.maxX, x)),
        y: Math.max(VIEW_BOUNDARIES.minY, Math.min(VIEW_BOUNDARIES.maxY, y))
    };
}
function getGupUnitObjSafely(controlIndex) {
    if (controlIndex >= 0 && controlIndex < gupUnitObjs.length) {
        return gupUnitObjs[controlIndex];
    }
    return null;
}
// 視窗大小變化處理
function windowResized() {
    const windowWidth = window.windowWidth;
    const windowHeight = window.windowHeight;
    // 使用相同的縮放邏輯
    displayWidth = Math.min(windowWidth, 1200);
    displayHeight = Math.min(windowHeight, 800);
    // 保持最小尺寸
    displayWidth = Math.max(displayWidth, 800);
    displayHeight = Math.max(displayHeight, 500);
    // 更新 canvas 尺寸
    window.resizeCanvas(displayWidth, displayHeight);
    // 更新視角
    viewX = displayWidth / 2;
    viewY = displayHeight / 2;
    // 更新全域變數
    window.displayWidth = displayWidth;
    window.displayHeight = displayHeight;
    window.viewX = viewX;
    window.viewY = viewY;
    console.log(`Window resized: ${displayWidth}x${displayHeight}`);
}
exports.windowResized = windowResized;
// 將主要函數設為全域
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;
