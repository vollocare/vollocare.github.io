#!/usr/bin/env node

/**
 * 程式碼品質檢查腳本
 * 檢查 TypeScript 檔案的程式碼品質和風格
 */

const fs = require('fs');
const path = require('path');

class CodeQualityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.checkedFiles = 0;
  }

  // 主要檢查方法
  checkDirectory(dirPath) {
    console.log('🔍 開始程式碼品質檢查...');
    
    this.scanDirectory(dirPath);
    this.generateReport();
    
    return this.issues.length === 0;
  }

  // 掃描目錄
  scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // 跳過特定目錄
        if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
          this.scanDirectory(fullPath);
        }
      } else if (entry.name.endsWith('.ts')) {
        this.checkFile(fullPath);
      }
    }
  }

  // 檢查單個檔案
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.checkedFiles++;
      console.log(`檢查: ${filePath}`);
      
      // 執行各種檢查
      this.checkCodeStyle(filePath, content, lines);
      this.checkComplexity(filePath, content, lines);
      this.checkNaming(filePath, content, lines);
      this.checkBestPractices(filePath, content, lines);
      
    } catch (error) {
      this.issues.push({
        file: filePath,
        type: 'ERROR',
        message: `無法讀取檔案: ${error.message}`,
        line: 0
      });
    }
  }

  // 檢查程式碼風格
  checkCodeStyle(file, content, lines) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // 檢查行長度
      if (line.length > 120) {
        this.warnings.push({
          file,
          type: 'STYLE',
          message: `行過長 (${line.length} > 120 字元)`,
          line: lineNum
        });
      }
      
      // 檢查縮排
      const leadingSpaces = line.match(/^\s*/)[0].length;
      if (line.trim() && leadingSpaces % 2 !== 0) {
        this.warnings.push({
          file,
          type: 'STYLE',
          message: '縮排應該使用 2 個空格',
          line: lineNum
        });
      }
      
      // 檢查分號
      if (line.trim().match(/^(let|const|var|return|throw).*[^;]$/)) {
        this.warnings.push({
          file,
          type: 'STYLE',
          message: '語句應該以分號結尾',
          line: lineNum
        });
      }
    });
  }

  // 檢查複雜度
  checkComplexity(file, content, lines) {
    let functionComplexity = 0;
    let inFunction = false;
    let braceLevel = 0;
    let functionStartLine = 0;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // 檢查函數開始
      if (trimmed.match(/^\s*(public|private|protected)?\s*(async\s+)?function|^\s*\w+\s*\(.*\)\s*{|^\s*(public|private|protected)\s+\w+\s*\(/)) {
        inFunction = true;
        functionStartLine = lineNum;
        functionComplexity = 1;
      }
      
      // 計算大括號層級
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceLevel += openBraces - closeBraces;
      
      if (inFunction) {
        // 計算複雜度
        if (trimmed.match(/\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/)) {
          functionComplexity++;
        }
        
        // 函數結束
        if (braceLevel === 0 && trimmed.includes('}')) {
          if (functionComplexity > 15) {
            this.issues.push({
              file,
              type: 'COMPLEXITY',
              message: `函數複雜度過高 (${functionComplexity} > 15)`,
              line: functionStartLine
            });
          } else if (functionComplexity > 10) {
            this.warnings.push({
              file,
              type: 'COMPLEXITY',
              message: `函數複雜度較高 (${functionComplexity})`,
              line: functionStartLine
            });
          }
          
          inFunction = false;
          functionComplexity = 0;
        }
      }
    });
  }

  // 檢查命名規範
  checkNaming(file, content, lines) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // 檢查介面命名
      const interfaceMatch = line.match(/interface\s+(\w+)/);
      if (interfaceMatch && !interfaceMatch[1].startsWith('I')) {
        this.warnings.push({
          file,
          type: 'NAMING',
          message: `介面應該以 'I' 開頭: ${interfaceMatch[1]}`,
          line: lineNum
        });
      }
      
      // 檢查類別命名
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch && !/^[A-Z][a-zA-Z0-9]*$/.test(classMatch[1])) {
        this.warnings.push({
          file,
          type: 'NAMING',
          message: `類別名稱應該使用 PascalCase: ${classMatch[1]}`,
          line: lineNum
        });
      }
      
      // 檢查常數命名
      const constMatch = line.match(/const\s+([A-Z_][A-Z_0-9]*)\s*=/);
      if (constMatch && constMatch[1].length > 3 && !/^[A-Z][A-Z_0-9]*$/.test(constMatch[1])) {
        this.warnings.push({
          file,
          type: 'NAMING',
          message: `常數應該使用 UPPER_CASE: ${constMatch[1]}`,
          line: lineNum
        });
      }
    });
  }

  // 檢查最佳實踐
  checkBestPractices(file, content, lines) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // 檢查 console.log（在非測試檔案中）
      if (trimmed.includes('console.log') && !file.includes('test')) {
        this.warnings.push({
          file,
          type: 'BEST_PRACTICE',
          message: '避免在生產代碼中使用 console.log',
          line: lineNum
        });
      }
      
      // 檢查 any 型別
      if (trimmed.includes(': any') || trimmed.includes('<any>')) {
        this.warnings.push({
          file,
          type: 'TYPESCRIPT',
          message: '避免使用 any 型別，盡量使用具體型別',
          line: lineNum
        });
      }
      
      // 檢查未使用的變數（簡單檢查）
      const varMatch = trimmed.match(/(?:let|const)\s+(\w+)/);
      if (varMatch && !content.includes(varMatch[1] + '.') && !content.includes(varMatch[1] + '[')) {
        const varName = varMatch[1];
        const usageCount = (content.match(new RegExp('\\b' + varName + '\\b', 'g')) || []).length;
        if (usageCount === 1) {
          this.warnings.push({
            file,
            type: 'UNUSED',
            message: `可能未使用的變數: ${varName}`,
            line: lineNum
          });
        }
      }
    });
  }

  // 產生報告
  generateReport() {
    console.log('\n📊 程式碼品質檢查報告');
    console.log('='.repeat(50));
    console.log(`檢查檔案數: ${this.checkedFiles}`);
    console.log(`問題數量: ${this.issues.length}`);
    console.log(`警告數量: ${this.warnings.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ 問題:');
      this.issues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} [${issue.type}] ${issue.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.slice(0, 20).forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} [${warning.type}] ${warning.message}`);
      });
      
      if (this.warnings.length > 20) {
        console.log(`  ... 還有 ${this.warnings.length - 20} 個警告`);
      }
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 程式碼品質檢查通過！');
    } else if (this.issues.length === 0) {
      console.log('\n✅ 沒有嚴重問題，但有一些可以改善的地方');
    } else {
      console.log('\n❌ 發現需要修復的問題');
    }
  }
}

// 執行檢查
const checker = new CodeQualityChecker();
const success = checker.checkDirectory('./src');

process.exit(success ? 0 : 1);