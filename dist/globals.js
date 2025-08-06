"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 運行時設置全域 Vector
if (typeof window !== 'undefined') {
    // 確保 p5.js 載入後設置 Vector
    window.setupGlobalVector = function () {
        if (window.p5 && window.p5.Vector) {
            window.Vector = window.p5.Vector;
        }
    };
}
