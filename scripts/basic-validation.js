#!/usr/bin/env node

/**
 * 基本遊戲邏輯驗證腳本
 * 檢查關鍵檔案是否存在和基本結構是否正確
 */

const fs = require('fs');
const path = require('path');

class BasicGameValidation {
  constructor() {
    this.issues = [];
    this.passed = [];
  }

  validate() {
    console.log('🔍 開始基本遊戲邏輯驗證...');
    
    this.checkFileStructure();
    this.checkTypeScriptFiles();
    this.checkInterfaces();
    this.checkMainComponents();
    this.generateReport();
    
    return this.issues.length === 0;
  }

  checkFileStructure() {
    const requiredDirs = [
      'src',
      'src/core',
      'src/models', 
      'src/systems',
      'src/interfaces',
      'src/types',
      'src/utils'
    ];
    
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir)) {
        this.passed.push(`目錄存在: ${dir}`);
      } else {
        this.issues.push(`缺少目錄: ${dir}`);
      }
    }
  }

  checkTypeScriptFiles() {
    const requiredFiles = [
      'src/main.ts',
      'src/core/GameManager.ts',
      'src/models/Unit.ts',
      'src/models/GroupUnit.ts', 
      'src/models/Obstacle.ts',
      'src/models/Flock.ts',
      'src/systems/RenderSystem.ts',
      'src/systems/InputSystem.ts',
      'src/systems/UISystem.ts',
      'src/systems/CameraSystem.ts'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.passed.push(`檔案存在: ${file}`);
      } else {
        this.issues.push(`缺少檔案: ${file}`);
      }
    }
  }

  checkInterfaces() {
    const interfaceFiles = [
      'src/interfaces/IGameManager.ts',
      'src/interfaces/IUnit.ts',
      'src/interfaces/IGroupUnit.ts',
      'src/interfaces/IObstacle.ts',
      'src/interfaces/IFlock.ts'
    ];
    
    for (const file of interfaceFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const interfaceName = path.basename(file, '.ts');
        
        if (content.includes(`export interface ${interfaceName}`)) {
          this.passed.push(`介面定義正確: ${interfaceName}`);
        } else {
          this.issues.push(`介面定義錯誤: ${interfaceName}`);
        }
      } else {
        this.issues.push(`缺少介面檔案: ${file}`);
      }
    }
  }

  checkMainComponents() {
    // 檢查 GameManager 是否有基本方法
    if (fs.existsSync('src/core/GameManager.ts')) {
      const content = fs.readFileSync('src/core/GameManager.ts', 'utf8');
      const requiredMethods = [
        'update',
        'render', 
        'getGroupUnits',
        'getObstacles',
        'getCurrentControl',
        'setCurrentControl'
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.passed.push(`GameManager 包含方法: ${method}`);
        } else {
          this.issues.push(`GameManager 缺少方法: ${method}`);
        }
      }
    }
    
    // 檢查 Unit 是否實作 IUnit
    if (fs.existsSync('src/models/Unit.ts')) {
      const content = fs.readFileSync('src/models/Unit.ts', 'utf8');
      
      if (content.includes('implements IUnit')) {
        this.passed.push('Unit 實作 IUnit 介面');
      } else {
        this.issues.push('Unit 未實作 IUnit 介面');
      }
      
      const requiredProperties = ['position', 'velocity', 'health', 'isAlive'];
      for (const prop of requiredProperties) {
        if (content.includes(prop)) {
          this.passed.push(`Unit 包含屬性: ${prop}`);
        } else {
          this.issues.push(`Unit 缺少屬性: ${prop}`);
        }
      }
    }
  }

  generateReport() {
    console.log('\n📊 基本遊戲邏輯驗證報告');
    console.log('='.repeat(50));
    console.log(`通過檢查: ${this.passed.length}`);
    console.log(`發現問題: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ 發現的問題:');
      this.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
    
    if (this.passed.length > 0) {
      console.log('\n✅ 通過的檢查:');
      this.passed.slice(0, 10).forEach(pass => {
        console.log(`  - ${pass}`);
      });
      
      if (this.passed.length > 10) {
        console.log(`  ... 還有 ${this.passed.length - 10} 項通過`);
      }
    }
    
    if (this.issues.length === 0) {
      console.log('\n🎉 基本遊戲邏輯驗證通過！');
    } else {
      console.log('\n⚠️  需要修復發現的問題');
    }
  }
}

// 執行驗證
const validator = new BasicGameValidation();
const success = validator.validate();

process.exit(success ? 0 : 1);