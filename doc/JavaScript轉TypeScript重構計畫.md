# JavaScript 轉 TypeScript 重構計畫

## 專案概述

本專案是一個基於 p5.js 的群體行為模擬系統，實現了單位群體的移動、攻擊、避障等 AI 行為。目前使用純 JavaScript 實作，需要重構為 TypeScript 以提升程式碼品質、型別安全性和可維護性。

## 現有功能分析

### 核心系統模組

1. **主程式控制 (sketch.js)**
   - p5.js 主程式入口
   - 遊戲循環控制 (setup/draw)
   - 視窗與相機管理
   - 使用者輸入處理（鍵盤 WASD、滑鼠點擊）
   - UI 按鈕控制（控制權切換、PVP 模式、顯示選項）
   - 巡邏系統管理

2. **單位系統 (unit_obj.js)**
   - UnitObj 類別：個體單位實作
   - 單位屬性：位置、速度、加速度、生命值、攻擊力
   - 狀態機：move、stop、follow、attack、escape、die
   - 攻擊系統：冷卻時間、攻擊範圍、攻擊特效
   - 生命與回復系統
   - 視覺化渲染（三角形單位、方向箭頭、狀態顯示）

3. **群組單位系統 (gup_unit_obj.js)**
   - GupUnitObj 類別：管理單位群組
   - Leader 機制：每組有一個領導單位
   - 群組行為：統一移動目標、攻擊目標選擇
   - 單位生成與管理

4. **群體行為演算法 (flock.js)**
   - Flock 類別：實作 Boids 演算法
   - 三大核心行為：
     - Separation（分離）：避免過度擁擠
     - Alignment（對齊）：朝向平均方向
     - Cohesion（凝聚）：朝向群體中心
   - 避障系統：動態避開障礙物和敵方單位
   - 不同狀態下的行為權重調整

5. **障礙物系統 (obstacles.js)**
   - Obstacle 類別：障礙物實體
   - Obstacles 管理器：障礙物集合管理
   - 碰撞檢測與渲染

### 輔助系統

1. **視窗系統 (TextWithViewPort)**
   - 文字渲染與視窗座標轉換
   - 配合相機移動的文字顯示

2. **巡邏系統 (Patrol)**
   - 巡邏點管理
   - 自動路徑循環
   - 單位自動生成

3. **攻擊特效系統 (Attack_VFX)**
   - 攻擊視覺效果
   - 時間控制顯示

## TypeScript 重構架構設計

### p5.js Instance Mode 重要說明

根據 p5.js 官方 Wiki 的建議：

> 雖然全域模式很方便且對初學者友善，但當混合使用其他 JavaScript 函式庫或在同一頁面嵌入多個 p5 sketch 時，可能會導致問題和混淆。更安全、更進階的方法是將 p5 sketch 建立為物件「實例」(instance)。

**為什麼使用 Instance Mode？**
1. **避免全域命名空間污染**：所有 p5 函數都封裝在實例內
2. **支援多個 sketch 並存**：可在同一頁面運行多個獨立的 p5 應用
3. **更好的 TypeScript 整合**：型別定義更清晰，避免全域變數衝突
4. **模組化架構**：更容易與現代前端框架和打包工具整合

### Instance Mode 實作範例

```typescript
// main.ts - Instance Mode 基本架構
const sketch = (p: p5) => {
  // 實例變數
  let displayWidth = 1024;
  let displayHeight = 640;
  let viewX = 0;
  let viewY = 0;
  let gupUnitObjs: GroupUnit[] = [];
  let flock: Flock;
  let obstacles: ObstacleManager;
  
  // setup 函數
  p.setup = () => {
    p.createCanvas(displayWidth, displayHeight, p.WEBGL);
    
    // 初始化系統
    flock = new Flock(p);
    obstacles = new ObstacleManager(p);
    
    // 初始化單位群組
    for (let i = 0; i < 9; i++) {
      const x = (displayWidth / 9) * i + 20;
      const gupUnit = new GroupUnit(p, x, displayHeight - 50, i + 1);
      gupUnitObjs.push(gupUnit);
    }
  };
  
  // draw 函數
  p.draw = () => {
    p.background(51);
    
    // 更新邏輯
    for (const gupUnit of gupUnitObjs) {
      gupUnit.update();
    }
    
    // 渲染
    obstacles.render();
    for (const gupUnit of gupUnitObjs) {
      gupUnit.render();
    }
  };
  
  // 滑鼠事件
  p.mousePressed = () => {
    const newMouseX = p.mouseX - (displayWidth / 2 - viewX);
    const newMouseY = p.mouseY - (displayHeight / 2 - viewY);
    // 處理滑鼠點擊
  };
  
  // 鍵盤事件
  p.keyPressed = () => {
    if (p.keyCode === 87) viewY -= 10; // W
    if (p.keyCode === 83) viewY += 10; // S
    if (p.keyCode === 65) viewX -= 10; // A
    if (p.keyCode === 68) viewX += 10; // D
  };
};

// 建立 p5 實例
new p5(sketch);
```

### 類別設計模式調整

所有使用 p5 功能的類別都需要保存 p5 實例參考：

```typescript
// Unit.ts - 使用 p5 實例
export class Unit implements IUnit {
  private p: p5;  // p5 實例參考
  public position: p5.Vector;
  public velocity: p5.Vector;
  
  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.position = p.createVector(x, y);
    this.velocity = p.createVector(p.random(-1, 1), p.random(-1, 1));
  }
  
  render(): void {
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(this.velocity.heading() + this.p.radians(90));
    this.p.fill(127);
    this.p.stroke(200);
    this.p.beginShape();
    this.p.vertex(0, -this.r * 2);
    this.p.vertex(-this.r, this.r * 2);
    this.p.vertex(this.r, this.r * 2);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
}
```

### 目錄結構規劃

```
src/
├── types/           # 型別定義
│   ├── p5.d.ts     # p5.js 型別定義
│   ├── vector.ts    # 向量相關型別
│   └── common.ts    # 共用型別
├── interfaces/      # 介面定義
│   ├── IUnit.ts     # 單位介面
│   ├── IObstacle.ts # 障礙物介面
│   ├── IFlock.ts    # 群體行為介面
│   └── ISketch.ts   # Sketch 介面
├── models/          # 資料模型
│   ├── Unit.ts      # 單位類別
│   ├── GroupUnit.ts # 群組單位類別
│   ├── Obstacle.ts  # 障礙物類別
│   └── Patrol.ts    # 巡邏系統類別
├── behaviors/       # 行為系統
│   ├── Flock.ts     # 群體行為
│   ├── Movement.ts  # 移動行為
│   └── Combat.ts    # 戰鬥行為
├── systems/         # 系統模組
│   ├── RenderSystem.ts    # 渲染系統
│   ├── InputSystem.ts     # 輸入系統
│   ├── CameraSystem.ts    # 相機系統
│   └── UISystem.ts        # UI 系統
├── utils/           # 工具函數
│   ├── MathUtils.ts # 數學工具
│   └── DrawUtils.ts # 繪圖工具
├── sketch/          # Sketch 實例
│   └── GameSketch.ts # 遊戲 Sketch 類別
└── main.ts          # 主程式入口
```

### 核心介面設計

```typescript
// IUnit.ts
interface IUnit {
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  health: number;
  maxHealth: number;
  state: UnitState;
  update(deltaTime: number): void;
  render(renderer: IRenderSystem): void;
}

// IFlock.ts
interface IFlockBehavior {
  separate(unit: IUnit, neighbors: IUnit[]): p5.Vector;
  align(unit: IUnit, neighbors: IUnit[]): p5.Vector;
  cohesion(unit: IUnit, neighbors: IUnit[]): p5.Vector;
  avoid(unit: IUnit, obstacles: IObstacle[]): p5.Vector;
}

// IObstacle.ts
interface IObstacle {
  position: p5.Vector;
  radius: number;
  checkCollision(unit: IUnit): boolean;
}
```

## 重構任務拆分

### 階段一：環境建置與基礎準備
**預計時間：2 小時**

#### 任務 1.1：TypeScript 環境設定
- **內容**：
  - 安裝 TypeScript 相關依賴
  - 設定 tsconfig.json（確保 `esModuleInterop` 和 `allowSyntheticDefaultImports` 啟用）
  - 配置 webpack 以支援 TypeScript
  - 安裝 @types/p5
- **驗收指標**：
  - ✅ 能成功編譯簡單的 TypeScript 檔案
  - ✅ webpack 能正確打包 TypeScript
  - ✅ p5.js 型別定義正常運作
  - ✅ Instance Mode sketch 能正常執行

#### 任務 1.2：建立基礎型別系統
- **內容**：
  - 建立共用型別定義檔
  - 定義單位狀態列舉
  - 定義遊戲設定介面
  - 建立向量輔助型別
  - 建立 p5 實例傳遞介面
- **驗收指標**：
  - ✅ 所有基礎型別定義完成
  - ✅ 型別檔案無編譯錯誤
  - ✅ 可被其他模組正確引用
  - ✅ p5 實例能正確傳遞到各類別

#### 任務 1.3：建立 Instance Mode 基礎架構
- **內容**：
  - 建立 GameSketch 類別封裝所有遊戲邏輯
  - 實作 p5 實例管理機制
  - 設定事件處理架構
- **驗收指標**：
  - ✅ GameSketch 類別能正確初始化
  - ✅ setup/draw 生命週期正常運作
  - ✅ 滑鼠和鍵盤事件正確綁定

### 階段二：核心類別重構
**預計時間：4 小時**

#### 任務 2.1：重構 Unit 系統
- **內容**：
  - 將 unit_obj.js 轉換為 Unit.ts
  - 實作 IUnit 介面
  - 加入型別註解和存取修飾詞
  - 重構 Attack_VFX 為獨立類別
  - 確保所有 p5 函數呼叫都使用實例方法
- **驗收指標**：
  - ✅ Unit 類別編譯無誤
  - ✅ 所有方法都有正確的型別簽名
  - ✅ 單位基本移動功能正常
  - ✅ 攻擊系統運作正常
  - ✅ p5 實例正確使用，無全域呼叫

#### 任務 2.2：重構 GroupUnit 系統
- **內容**：
  - 將 gup_unit_obj.js 轉換為 GroupUnit.ts
  - 使用泛型處理單位集合
  - 實作單位管理介面
- **驗收指標**：
  - ✅ GroupUnit 類別編譯無誤
  - ✅ Leader 機制正常運作
  - ✅ 單位新增/移除功能正常

#### 任務 2.3：重構 Obstacle 系統
- **內容**：
  - 將 obstacles.js 轉換為 Obstacle.ts
  - 實作 IObstacle 介面
  - 加強碰撞檢測型別安全
- **驗收指標**：
  - ✅ Obstacle 類別編譯無誤
  - ✅ 障礙物渲染正常
  - ✅ 碰撞檢測功能正常

### 階段三：行為系統重構
**預計時間：3 小時**

#### 任務 3.1：重構 Flock 群體行為
- **內容**：
  - 將 flock.js 轉換為 Flock.ts
  - 實作 IFlockBehavior 介面
  - 優化演算法效能
  - 加入行為權重配置
- **驗收指標**：
  - ✅ Flock 類別編譯無誤
  - ✅ 三大群體行為正常運作
  - ✅ 避障系統功能正常
  - ✅ 行為權重可動態調整

#### 任務 3.2：建立行為管理系統
- **內容**：
  - 建立 BehaviorManager 統一管理行為
  - 實作狀態機模式
  - 整合移動、攻擊、逃跑行為
- **驗收指標**：
  - ✅ 狀態轉換邏輯正確
  - ✅ 各種行為可正常切換
  - ✅ 行為優先級處理正確

### 階段四：系統模組重構
**預計時間：4 小時**

#### 任務 4.1：建立渲染系統
- **內容**：
  - 建立 RenderSystem.ts
  - 整合 TextWithViewPort 功能
  - 實作分層渲染
  - 優化繪圖效能
- **驗收指標**：
  - ✅ 所有視覺元素正常顯示
  - ✅ 文字顯示跟隨相機移動
  - ✅ 渲染效能無明顯下降

#### 任務 4.2：建立輸入系統
- **內容**：
  - 建立 InputSystem.ts
  - 統一處理鍵盤和滑鼠輸入
  - 實作輸入映射配置
- **驗收指標**：
  - ✅ WASD 相機控制正常
  - ✅ 滑鼠點擊控制正常
  - ✅ 輸入延遲處理正確

#### 任務 4.3：建立 UI 系統
- **內容**：
  - 建立 UISystem.ts
  - 重構按鈕控制邏輯
  - 實作 UI 事件系統
- **驗收指標**：
  - ✅ 所有按鈕功能正常
  - ✅ UI 狀態更新正確
  - ✅ PVP 模式切換正常

#### 任務 4.4：建立相機系統
- **內容**：
  - 建立 CameraSystem.ts
  - 整合視窗座標轉換
  - 實作相機跟隨功能
- **驗收指標**：
  - ✅ 相機移動平滑
  - ✅ 座標轉換正確
  - ✅ 視窗邊界處理正常

### 階段五：主程式整合
**預計時間：3 小時**

#### 任務 5.1：重構主程式
- **內容**：
  - 將 sketch.js 轉換為 main.ts
  - 整合所有系統模組
  - 實作遊戲狀態管理
  - 優化更新循環
- **驗收指標**：
  - ✅ 遊戲正常啟動
  - ✅ 所有系統協同運作
  - ✅ FPS 穩定在 60

#### 任務 5.2：重構巡邏系統
- **內容**：
  - 將 Patrol 類別轉換為 TypeScript
  - 加入路徑管理介面
  - 優化巡邏點切換邏輯
- **驗收指標**：
  - ✅ 巡邏路徑正常運作
  - ✅ 自動生成單位功能正常
  - ✅ 巡邏點顯示正確

### 階段六：優化與測試
**預計時間：2 小時**

#### 任務 6.1：效能優化
- **內容**：
  - 實作物件池模式減少 GC
  - 優化碰撞檢測演算法
  - 加入空間分割優化
- **驗收指標**：
  - ✅ 支援 200+ 單位流暢運行
  - ✅ 記憶體使用穩定
  - ✅ 無明顯卡頓

#### 任務 6.2：功能測試
- **內容**：
  - 測試所有原有功能
  - 驗證遊戲邏輯正確性
  - 確認視覺效果一致
- **驗收指標**：
  - ✅ 單位移動正常
  - ✅ 群體行為正常
  - ✅ 攻擊系統正常
  - ✅ PVP 模式正常
  - ✅ UI 互動正常

#### 任務 6.3：程式碼品質
- **內容**：
  - 加入 ESLint 和 Prettier
  - 統一程式碼風格
  - 加入基礎文件註解
- **驗收指標**：
  - ✅ 無 TypeScript 編譯錯誤
  - ✅ 無 ESLint 錯誤
  - ✅ 程式碼格式統一

## 技術要點

### 型別安全考量
1. 使用嚴格模式 (strict: true)
2. 避免使用 any 型別
3. 善用聯合型別和型別守衛
4. 使用介面定義物件結構

### p5.js Instance Mode 整合要點

1. **嚴格使用 Instance Mode**
   - 所有 p5 函數必須透過實例呼叫（如 `p.fill()` 而非 `fill()`）
   - 避免任何全域 p5 函數呼叫
   - 每個類別建構函數都需要接收 p5 實例參數

2. **p5.Vector 處理**
   - 使用 `p.createVector()` 而非 `createVector()`
   - Vector 靜態方法呼叫：`p5.Vector.sub()` 保持不變
   - 注意 Vector 方法鏈的型別推斷

3. **生命週期管理**
   - setup/draw 必須在 sketch 函數內定義
   - 使用箭頭函數確保 `this` 綁定正確
   - 事件處理函數（mousePressed、keyPressed）同樣需要在 sketch 內定義

4. **常數和枚舉**
   - 使用 `p.WEBGL`、`p.CLOSE` 等常數
   - 顏色函數：`p.color()`、`p.fill()`、`p.stroke()`
   - 數學函數：`p.random()`、`p.radians()`、`p.degrees()`

### 效能考量
1. 避免在 draw 循環中創建新物件
2. 使用物件池管理頻繁創建的物件
3. 實作髒標記減少不必要的計算

### 相容性維護
1. 保持原有功能完全相容
2. 漸進式重構，確保每步都可運行
3. 保留原始 JavaScript 檔案作為參考

## 預估時程

- **總時程**：19 小時
- **階段一**：3 小時（增加 Instance Mode 架構建置時間）
- **階段二**：4 小時
- **階段三**：3 小時
- **階段四**：4 小時
- **階段五**：3 小時
- **階段六**：2 小時

## 風險評估

1. **p5.js 型別定義不完整**
   - 解決方案：自行補充缺失的型別定義
   - 建立自訂的 p5 擴充型別檔案

2. **效能下降**
   - 解決方案：使用效能分析工具找出瓶頸
   - 注意 Instance Mode 可能的效能影響

3. **功能遺漏**
   - 解決方案：建立功能檢查清單，逐項驗證
   - 保留原始 JS 檔案直到完全驗證

4. **全域變數衝突**
   - 風險：從全域模式轉換到 Instance Mode 可能遺漏某些全域參考
   - 解決方案：使用 ESLint no-undef 規則檢查
   - 徹底測試所有功能確保無全域依賴

5. **第三方函式庫整合**
   - 風險：其他依賴 p5 全域變數的函式庫可能無法運作
   - 解決方案：評估並更新相關函式庫
   - 必要時維護兼容層

## 成功指標

1. ✅ 所有原有功能正常運作
2. ✅ TypeScript 編譯無錯誤
3. ✅ 程式碼可讀性提升
4. ✅ 型別安全保障
5. ✅ 效能維持或提升
6. ✅ 開發體驗改善（IDE 智能提示）

## 後續改進建議

1. 加入單元測試
2. 實作更多 AI 行為模式
3. 加入音效系統
4. 優化手機觸控支援
5. 加入多人連線功能