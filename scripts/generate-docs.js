#!/usr/bin/env node

/**
 * API 文檔生成工具
 * 自動生成 TypeScript 項目的 API 文檔
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor() {
    this.docs = {
      interfaces: [],
      classes: [],
      functions: [],
      types: [],
      enums: []
    };
  }

  // 生成文檔
  generateDocs(srcDir, outputDir) {
    console.log('📚 開始生成 API 文檔...');
    
    // 掃描源碼目錄
    this.scanDirectory(srcDir);
    
    // 生成 Markdown 文檔
    this.generateMarkdown(outputDir);
    
    console.log('✅ API 文檔生成完成！');
  }

  // 掃描目錄
  scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !['node_modules', 'dist'].includes(entry.name)) {
        this.scanDirectory(fullPath);
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        this.parseFile(fullPath);
      }
    }
  }

  // 解析檔案
  parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let currentComment = [];
    let inComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 收集註釋
      if (line.startsWith('/**')) {
        inComment = true;
        currentComment = [line];
        continue;
      }
      
      if (inComment) {
        currentComment.push(line);
        if (line.endsWith('*/')) {
          inComment = false;
        }
        continue;
      }
      
      // 解析程式碼元素
      if (line.startsWith('export interface ')) {
        this.parseInterface(line, currentComment, filePath);
      } else if (line.startsWith('export class ') || line.includes(' class ')) {
        this.parseClass(line, currentComment, filePath);
      } else if (line.startsWith('export function ') || line.includes(' function ')) {
        this.parseFunction(line, currentComment, filePath);
      } else if (line.startsWith('export type ')) {
        this.parseType(line, currentComment, filePath);
      } else if (line.startsWith('export enum ')) {
        this.parseEnum(line, currentComment, filePath, content, i);
      }
      
      currentComment = [];
    }
  }

  // 解析介面
  parseInterface(line, comments, filePath) {
    const match = line.match(/export interface (\w+)/);
    if (match) {
      this.docs.interfaces.push({
        name: match[1],
        description: this.extractDescription(comments),
        file: filePath,
        comments: comments
      });
    }
  }

  // 解析類別
  parseClass(line, comments, filePath) {
    const match = line.match(/(?:export )?class (\w+)/);
    if (match) {
      this.docs.classes.push({
        name: match[1],
        description: this.extractDescription(comments),
        file: filePath,
        comments: comments
      });
    }
  }

  // 解析函數
  parseFunction(line, comments, filePath) {
    const match = line.match(/(?:export )?function (\w+)/);
    if (match) {
      this.docs.functions.push({
        name: match[1],
        description: this.extractDescription(comments),
        signature: line,
        file: filePath,
        comments: comments
      });
    }
  }

  // 解析類型
  parseType(line, comments, filePath) {
    const match = line.match(/export type (\w+)/);
    if (match) {
      this.docs.types.push({
        name: match[1],
        description: this.extractDescription(comments),
        definition: line,
        file: filePath,
        comments: comments
      });
    }
  }

  // 解析枚舉
  parseEnum(line, comments, filePath, content, startIndex) {
    const match = line.match(/export enum (\w+)/);
    if (match) {
      const enumValues = this.extractEnumValues(content, startIndex);
      
      this.docs.enums.push({
        name: match[1],
        description: this.extractDescription(comments),
        values: enumValues,
        file: filePath,
        comments: comments
      });
    }
  }

  // 提取註釋描述
  extractDescription(comments) {
    if (comments.length === 0) return '無描述';
    
    return comments
      .map(line => line.replace(/^\s*\*\*?/, '').trim())
      .filter(line => line && !line.startsWith('/'))
      .join(' ')
      .replace(/\*\/$/, '')
      .trim() || '無描述';
  }

  // 提取枚舉值
  extractEnumValues(content, startIndex) {
    const lines = content.split('\n');
    const values = [];
    let braceCount = 0;
    let foundStart = false;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('{')) {
        braceCount += (line.match(/{/g) || []).length;
        foundStart = true;
      }
      
      if (foundStart && line.includes('}')) {
        braceCount -= (line.match(/}/g) || []).length;
      }
      
      if (foundStart && braceCount > 0) {
        // 解析枚舉值
        const valueMatch = line.match(/(\w+)\s*[=]?\s*[^,}]*/);
        if (valueMatch && !line.startsWith('//') && !line.startsWith('*')) {
          values.push(valueMatch[1]);
        }
      }
      
      if (foundStart && braceCount === 0) {
        break;
      }
    }
    
    return values;
  }

  // 生成 Markdown 文檔
  generateMarkdown(outputDir) {
    // 確保輸出目錄存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成主文檔
    this.generateMainDoc(outputDir);
    
    // 生成分類文檔
    this.generateInterfacesDoc(outputDir);
    this.generateClassesDoc(outputDir);
    this.generateTypesDoc(outputDir);
    this.generateEnumsDoc(outputDir);
    
    // 生成使用指南
    this.generateUsageGuide(outputDir);
  }

  // 生成主文檔
  generateMainDoc(outputDir) {
    const content = `# 遊戲 API 文檔

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

- 介面數量: ${this.docs.interfaces.length}
- 類別數量: ${this.docs.classes.length}
- 函數數量: ${this.docs.functions.length}
- 類型數量: ${this.docs.types.length}
- 枚舉數量: ${this.docs.enums.length}

## 版本資訊

- 版本: 1.0.0
- 最後更新: ${new Date().toLocaleDateString()}
- TypeScript 版本: 5.x
- p5.js 版本: 1.x
`;

    fs.writeFileSync(path.join(outputDir, 'README.md'), content);
  }

  // 生成介面文檔
  generateInterfacesDoc(outputDir) {
    let content = `# 介面定義

## 概述

本頁面列出了遊戲中所有的 TypeScript 介面定義。

`;

    // 按類別分組
    const categories = {
      '核心介面': this.docs.interfaces.filter(i => 
        i.file.includes('/interfaces/') && 
        ['IGameManager', 'IUnit', 'IGroupUnit', 'IObstacle'].includes(i.name)
      ),
      '系統介面': this.docs.interfaces.filter(i => 
        ['IRenderSystem', 'IInputSystem', 'IUISystem', 'ICameraSystem'].includes(i.name)
      ),
      '行為介面': this.docs.interfaces.filter(i => 
        ['IFlock', 'IFlockBehavior', 'IPatrol'].includes(i.name)
      ),
      '工具介面': this.docs.interfaces.filter(i => 
        ['IObjectPool', 'IPoolable'].includes(i.name)
      ),
      '其他介面': this.docs.interfaces.filter(i => 
        !['IGameManager', 'IUnit', 'IGroupUnit', 'IObstacle',
          'IRenderSystem', 'IInputSystem', 'IUISystem', 'ICameraSystem',
          'IFlock', 'IFlockBehavior', 'IPatrol',
          'IObjectPool', 'IPoolable'].includes(i.name)
      )
    };

    for (const [category, interfaces] of Object.entries(categories)) {
      if (interfaces.length === 0) continue;
      
      content += `## ${category}\n\n`;
      
      for (const iface of interfaces) {
        content += `### ${iface.name}\n\n`;
        content += `**描述**: ${iface.description}\n\n`;
        content += `**檔案**: \`${iface.file}\`\n\n`;
        content += `---\n\n`;
      }
    }

    fs.writeFileSync(path.join(outputDir, 'interfaces.md'), content);
  }

  // 生成類別文檔
  generateClassesDoc(outputDir) {
    let content = `# 類別文檔

## 概述

本頁面列出了遊戲中所有的類別及其說明。

`;

    for (const cls of this.docs.classes) {
      content += `## ${cls.name}\n\n`;
      content += `**描述**: ${cls.description}\n\n`;
      content += `**檔案**: \`${cls.file}\`\n\n`;
      content += `---\n\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'classes.md'), content);
  }

  // 生成類型文檔
  generateTypesDoc(outputDir) {
    let content = `# 類型定義

## 概述

本頁面列出了遊戲中所有的自定義類型。

`;

    for (const type of this.docs.types) {
      content += `## ${type.name}\n\n`;
      content += `**描述**: ${type.description}\n\n`;
      content += `**定義**: \`${type.definition}\`\n\n`;
      content += `**檔案**: \`${type.file}\`\n\n`;
      content += `---\n\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'types.md'), content);
  }

  // 生成枚舉文檔
  generateEnumsDoc(outputDir) {
    let content = `# 枚舉定義

## 概述

本頁面列出了遊戲中所有的枚舉類型。

`;

    for (const enumItem of this.docs.enums) {
      content += `## ${enumItem.name}\n\n`;
      content += `**描述**: ${enumItem.description}\n\n`;
      content += `**值**:\n`;
      for (const value of enumItem.values) {
        content += `- \`${value}\`\n`;
      }
      content += `\n**檔案**: \`${enumItem.file}\`\n\n`;
      content += `---\n\n`;
    }

    fs.writeFileSync(path.join(outputDir, 'enums.md'), content);
  }

  // 生成使用指南
  generateUsageGuide(outputDir) {
    const content = `# 使用指南

## 快速開始

### 初始化遊戲

\`\`\`typescript
import { GameManager } from './core/GameManager';
import { GameSketch } from './sketch/GameSketch';

// 在 p5.js Instance Mode 中使用
const sketch = (p: p5Instance) => {
  const gameSketch = new GameSketch(p);
};

new p5(sketch);
\`\`\`

### 基本遊戲循環

\`\`\`typescript
// 在 GameSketch 中
public update(deltaTime: number): void {
  this.gameManager.update(deltaTime);
}

public render(): void {
  this.gameManager.render();
}
\`\`\`

## 常用操作

### 創建單位

\`\`\`typescript
const gameManager = new GameManager(p, 1024, 640);
const groupUnits = gameManager.getGroupUnits();
const firstGroup = groupUnits[0];

// 添加新單位
const newUnit = firstGroup.addUnit(100, 100);
\`\`\`

### 設定目標

\`\`\`typescript
import { Vector } from './utils/Vector';

const target = new Vector(p, 200, 200);
firstGroup.setDestination(target);
\`\`\`

### 切換控制模式

\`\`\`typescript
import { ControlMode } from './types/common';

gameManager.setCurrentControl(ControlMode.ENEMY);
\`\`\`

### 啟用 PVP 模式

\`\`\`typescript
gameManager.setPVPMode(true);
\`\`\`

## 效能優化

### 使用物件池

\`\`\`typescript
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
\`\`\`

### 使用空間分割

\`\`\`typescript
import { QuadTree } from './utils/SpatialPartitioning';

const quadTree = new QuadTree(worldBounds, 10, 5);

// 插入物件
quadTree.insert(unit);

// 查詢範圍
const nearbyUnits = quadTree.queryRange(searchBounds);
\`\`\`

## 測試

### 功能測試

\`\`\`typescript
import { GameFunctionalTests } from './tests/GameFunctionalTests';

const tests = new GameFunctionalTests(gameManager, p);
const results = await tests.runAllTests();
\`\`\`

### 效能監控

\`\`\`typescript
import { PerformanceMonitor } from './utils/PerformanceMonitor';

const monitor = new PerformanceMonitor();

// 在遊戲循環中
monitor.startTimer('update');
gameManager.update(deltaTime);
monitor.endTimer('update');

monitor.update();
const metrics = monitor.getMetrics();
\`\`\`

## 事件處理

### 輸入事件

\`\`\`typescript
import { InputEventType } from './systems/InputSystem';

inputSystem.addEventListener(InputEventType.MOUSE_CLICK, (event) => {
  console.log('滑鼠點擊:', event.mousePosition);
});
\`\`\`

### UI 事件

\`\`\`typescript
import { UIEventType } from './systems/UISystem';

uiSystem.addEventListener(UIEventType.CONTROL_CHANGED, (event) => {
  console.log('控制模式變更:', event.data.control);
});
\`\`\`

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
A: 確保所有介面都正確實作，使用 \`npx tsc --noEmit\` 檢查。
`;

    fs.writeFileSync(path.join(outputDir, 'usage.md'), content);
  }
}

// 執行文檔生成
const generator = new DocumentationGenerator();
generator.generateDocs('./src', './docs');