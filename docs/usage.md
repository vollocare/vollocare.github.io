# 使用指南

## 快速開始

### 初始化遊戲

```typescript
import { GameManager } from './core/GameManager';
import { GameSketch } from './sketch/GameSketch';

// 在 p5.js Instance Mode 中使用
const sketch = (p: p5Instance) => {
  const gameSketch = new GameSketch(p);
};

new p5(sketch);
```

### 基本遊戲循環

```typescript
// 在 GameSketch 中
public update(deltaTime: number): void {
  this.gameManager.update(deltaTime);
}

public render(): void {
  this.gameManager.render();
}
```

## 常用操作

### 創建單位

```typescript
const gameManager = new GameManager(p, 1024, 640);
const groupUnits = gameManager.getGroupUnits();
const firstGroup = groupUnits[0];

// 添加新單位
const newUnit = firstGroup.addUnit(100, 100);
```

### 設定目標

```typescript
import { Vector } from './utils/Vector';

const target = new Vector(p, 200, 200);
firstGroup.setDestination(target);
```

### 切換控制模式

```typescript
import { ControlMode } from './types/common';

gameManager.setCurrentControl(ControlMode.ENEMY);
```

### 啟用 PVP 模式

```typescript
gameManager.setPVPMode(true);
```

## 效能優化

### 使用物件池

```typescript
import { ObjectPool, globalPoolManager } from './utils/ObjectPool';
import { PooledAttackVFX } from './models/PooledAttackVFX';

// 創建攻擊特效池
const vfxPool = new ObjectPool(() => new PooledAttackVFX(p), 20, 100);
globalPoolManager.registerPool('attackVFX', vfxPool);

// 使用物件
const vfx = vfxPool.acquire();
vfx.initialize(startPos, endPos, color, duration);

// 釋放物件
vfxPool.release(vfx);
```

### 使用空間分割

```typescript
import { QuadTree } from './utils/SpatialPartitioning';

const quadTree = new QuadTree(worldBounds, 10, 5);

// 插入物件
quadTree.insert(unit);

// 查詢範圍
const nearbyUnits = quadTree.queryRange(searchBounds);
```

## 測試

### 功能測試

```typescript
import { GameFunctionalTests } from './tests/GameFunctionalTests';

const tests = new GameFunctionalTests(gameManager, p);
const results = await tests.runAllTests();
```

### 效能監控

```typescript
import { PerformanceMonitor } from './utils/PerformanceMonitor';

const monitor = new PerformanceMonitor();

// 在遊戲循環中
monitor.startTimer('update');
gameManager.update(deltaTime);
monitor.endTimer('update');

monitor.update();
const metrics = monitor.getMetrics();
```

## 事件處理

### 輸入事件

```typescript
import { InputEventType } from './systems/InputSystem';

inputSystem.addEventListener(InputEventType.MOUSE_CLICK, (event) => {
  console.log('滑鼠點擊:', event.mousePosition);
});
```

### UI 事件

```typescript
import { UIEventType } from './systems/UISystem';

uiSystem.addEventListener(UIEventType.CONTROL_CHANGED, (event) => {
  console.log('控制模式變更:', event.data.control);
});
```

## 最佳實踐

1. **使用 TypeScript 嚴格模式** - 確保類型安全
2. **實作介面** - 遵循 SOLID 原則
3. **使用物件池** - 避免頻繁創建銷毀物件
4. **空間分割** - 優化碰撞檢測和範圍查詢
5. **效能監控** - 定期檢查效能指標
6. **測試驅動** - 編寫並執行功能測試

## 故障排除

### 常見問題

**Q: 遊戲效能不佳怎麼辦？**
A: 使用 PerformanceMonitor 檢查效能瓶頸，考慮啟用物件池和空間分割優化。

**Q: 單位不移動？**
A: 檢查 GameManager 是否正常更新，以及目標位置是否正確設定。

**Q: TypeScript 編譯錯誤？**
A: 確保所有介面都正確實作，使用 `npx tsc --noEmit` 檢查。
