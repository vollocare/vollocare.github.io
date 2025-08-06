# 遊戲 API 文檔

## 概述

這是一個基於 p5.js 和 TypeScript 開發的群體行為模擬遊戲的 API 文檔。

## 系統架構

### 核心系統
- **GameManager**: 遊戲主管理器，統一管理所有系統
- **RenderSystem**: 渲染系統，負責遊戲畫面渲染
- **InputSystem**: 輸入系統，處理鍵盤和滑鼠事件
- **UISystem**: UI 系統，管理用戶界面元素
- **CameraSystem**: 相機系統，處理視窗控制
- **CollisionSystem**: 碰撞檢測系統

### 遊戲實體
- **Unit**: 遊戲單位
- **GroupUnit**: 群組單位管理
- **Obstacle**: 障礙物
- **Flock**: 群體行為系統
- **Patrol**: 巡邏系統

### 效能優化
- **ObjectPool**: 物件池系統
- **QuadTree**: 空間分割系統
- **PerformanceMonitor**: 效能監控系統

## 文檔索引

- [介面定義](./interfaces.md) - 所有介面的詳細說明
- [類別文檔](./classes.md) - 所有類別的 API 參考
- [類型定義](./types.md) - 自定義類型說明
- [枚舉值](./enums.md) - 枚舉類型說明
- [使用指南](./usage.md) - 如何使用這些 API

## 統計資訊

- 介面數量: 67
- 類別數量: 28
- 函數數量: 2
- 類型數量: 7
- 枚舉數量: 8

## 版本資訊

- 版本: 1.0.0
- 最後更新: 8/6/2025
- TypeScript 版本: 5.x
- p5.js 版本: 1.x
