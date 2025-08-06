// PerformanceMonitor - 效能監控系統，追蹤遊戲效能指標
/// <reference path="../types/p5.d.ts" />

export interface PerformanceMetrics {
  // FPS 相關
  currentFPS: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  
  // 幀時間 (ms)
  frameTime: number;
  averageFrameTime: number;
  
  // 更新時間分解
  updateTime: number;
  renderTime: number;
  systemTime: number;
  
  // 記憶體使用（如果可用）
  memoryUsed?: number;
  memoryTotal?: number;
  
  // 遊戲物件統計
  totalUnits: number;
  totalObstacles: number;
  totalEffects: number;
  
  // 物件池統計
  poolUtilization: number;
  poolHitRate: number;
}

export interface PerformanceConfig {
  // 採樣設定
  sampleSize: number;      // FPS 採樣大小
  updateInterval: number;  // 更新間隔（毫秒）
  
  // 警告閾值
  lowFPSThreshold: number;
  highFrameTimeThreshold: number;
  
  // 記錄設定
  enableLogging: boolean;
  logInterval: number;
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  
  // FPS 追蹤
  private fpsSamples: number[] = [];
  private frameTimeSamples: number[] = [];
  private lastFrameTime: number = 0;
  
  // 計時器
  private timers: Map<string, number> = new Map();
  private lastUpdateTime: number = 0;
  private updateCounter: number = 0;
  
  // 回調函數
  private onLowPerformance?: (metrics: PerformanceMetrics) => void;
  private onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  
  // 記錄
  private performanceLog: PerformanceMetrics[] = [];
  private lastLogTime: number = 0;
  
  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      sampleSize: 60,
      updateInterval: 1000,
      lowFPSThreshold: 30,
      highFrameTimeThreshold: 33.33,
      enableLogging: false,
      logInterval: 5000,
      ...config
    };
    
    this.metrics = this.createDefaultMetrics();
    this.lastFrameTime = Date.now();
    this.lastUpdateTime = Date.now();
  }
  
  private createDefaultMetrics(): PerformanceMetrics {
    return {
      currentFPS: 60,
      averageFPS: 60,
      minFPS: 60,
      maxFPS: 60,
      frameTime: 16.67,
      averageFrameTime: 16.67,
      updateTime: 0,
      renderTime: 0,
      systemTime: 0,
      totalUnits: 0,
      totalObstacles: 0,
      totalEffects: 0,
      poolUtilization: 0,
      poolHitRate: 0
    };
  }
  
  // 開始計時
  public startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }
  
  // 結束計時
  public endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }
    
    const elapsed = performance.now() - startTime;
    this.timers.delete(name);
    return elapsed;
  }
  
  // 更新效能指標
  public update(): void {
    const now = Date.now();
    
    // 計算 FPS
    const frameTime = now - this.lastFrameTime;
    const currentFPS = frameTime > 0 ? 1000 / frameTime : 0;
    
    // 更新採樣
    this.fpsSamples.push(currentFPS);
    this.frameTimeSamples.push(frameTime);
    
    // 維持採樣大小
    if (this.fpsSamples.length > this.config.sampleSize) {
      this.fpsSamples.shift();
      this.frameTimeSamples.shift();
    }
    
    // 更新指標
    this.metrics.currentFPS = currentFPS;
    this.metrics.frameTime = frameTime;
    
    // 定期計算平均值
    if (now - this.lastUpdateTime >= this.config.updateInterval) {
      this.calculateAverages();
      this.checkPerformanceThresholds();
      
      if (this.onPerformanceUpdate) {
        this.onPerformanceUpdate(this.metrics);
      }
      
      this.lastUpdateTime = now;
      this.updateCounter++;
    }
    
    // 記錄效能數據
    if (this.config.enableLogging && now - this.lastLogTime >= this.config.logInterval) {
      this.logPerformance();
      this.lastLogTime = now;
    }
    
    this.lastFrameTime = now;
  }
  
  private calculateAverages(): void {
    if (this.fpsSamples.length === 0) return;
    
    // FPS 統計
    const validFPS = this.fpsSamples.filter(fps => fps > 0 && fps <= 1000);
    this.metrics.averageFPS = validFPS.reduce((sum, fps) => sum + fps, 0) / validFPS.length;
    this.metrics.minFPS = Math.min(...validFPS);
    this.metrics.maxFPS = Math.max(...validFPS);
    
    // 幀時間統計
    const validFrameTimes = this.frameTimeSamples.filter(time => time > 0 && time <= 1000);
    this.metrics.averageFrameTime = validFrameTimes.reduce((sum, time) => sum + time, 0) / validFrameTimes.length;
  }
  
  private checkPerformanceThresholds(): void {
    // 檢查低效能警告
    if (this.metrics.averageFPS < this.config.lowFPSThreshold ||
        this.metrics.averageFrameTime > this.config.highFrameTimeThreshold) {
      
      if (this.onLowPerformance) {
        this.onLowPerformance(this.metrics);
      }
    }
  }
  
  private logPerformance(): void {
    this.performanceLog.push({ ...this.metrics });
    
    // 限制記錄大小
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }
    
    console.log('Performance Update:', {
      FPS: this.metrics.currentFPS.toFixed(1),
      AvgFPS: this.metrics.averageFPS.toFixed(1),
      FrameTime: this.metrics.frameTime.toFixed(2) + 'ms',
      UpdateTime: this.metrics.updateTime.toFixed(2) + 'ms',
      RenderTime: this.metrics.renderTime.toFixed(2) + 'ms'
    });
  }
  
  // 設定遊戲物件統計
  public updateGameStats(units: number, obstacles: number, effects: number): void {
    this.metrics.totalUnits = units;
    this.metrics.totalObstacles = obstacles;
    this.metrics.totalEffects = effects;
  }
  
  // 設定物件池統計
  public updatePoolStats(utilization: number, hitRate: number): void {
    this.metrics.poolUtilization = utilization;
    this.metrics.poolHitRate = hitRate;
  }
  
  // 設定系統時間
  public setSystemTimes(updateTime: number, renderTime: number): void {
    this.metrics.updateTime = updateTime;
    this.metrics.renderTime = renderTime;
    this.metrics.systemTime = updateTime + renderTime;
  }
  
  // 獲取當前指標
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  // 獲取效能摘要
  public getSummary(): string {
    const m = this.metrics;
    return [
      `FPS: ${m.currentFPS.toFixed(1)} (avg: ${m.averageFPS.toFixed(1)})`,
      `Frame: ${m.frameTime.toFixed(1)}ms`,
      `Update: ${m.updateTime.toFixed(1)}ms`,
      `Render: ${m.renderTime.toFixed(1)}ms`,
      `Objects: ${m.totalUnits + m.totalObstacles + m.totalEffects}`,
      `Pool Hit: ${(m.poolHitRate * 100).toFixed(1)}%`
    ].join(' | ');
  }
  
  // 設定回調函數
  public setOnLowPerformance(callback: (metrics: PerformanceMetrics) => void): void {
    this.onLowPerformance = callback;
  }
  
  public setOnPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.onPerformanceUpdate = callback;
  }
  
  // 獲取效能歷史
  public getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceLog];
  }
  
  // 重置統計
  public reset(): void {
    this.fpsSamples = [];
    this.frameTimeSamples = [];
    this.performanceLog = [];
    this.timers.clear();
    this.metrics = this.createDefaultMetrics();
    this.lastFrameTime = Date.now();
    this.lastUpdateTime = Date.now();
    this.lastLogTime = Date.now();
    this.updateCounter = 0;
  }
  
  // 效能分析
  public analyzePerformance(): PerformanceAnalysis {
    const m = this.metrics;
    const history = this.performanceLog.slice(-20); // 最近 20 次記錄
    
    let stability = 'stable';
    if (history.length >= 10) {
      const fpsVariance = this.calculateVariance(history.map(h => h.currentFPS));
      if (fpsVariance > 100) stability = 'unstable';
      else if (fpsVariance > 50) stability = 'moderate';
    }
    
    let bottleneck = 'none';
    if (m.updateTime > m.renderTime * 2) bottleneck = 'update';
    else if (m.renderTime > m.updateTime * 2) bottleneck = 'render';
    else if (m.averageFPS < 30) bottleneck = 'overall';
    
    return {
      overallRating: this.calculateOverallRating(),
      stability,
      bottleneck,
      recommendations: this.generateRecommendations()
    };
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
  
  private calculateOverallRating(): PerformanceRating {
    const m = this.metrics;
    
    if (m.averageFPS >= 55 && m.averageFrameTime <= 20) return 'excellent';
    if (m.averageFPS >= 45 && m.averageFrameTime <= 25) return 'good';
    if (m.averageFPS >= 30 && m.averageFrameTime <= 35) return 'acceptable';
    if (m.averageFPS >= 20) return 'poor';
    return 'critical';
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const m = this.metrics;
    
    if (m.averageFPS < 30) {
      recommendations.push('考慮減少遊戲物件數量或降低更新頻率');
    }
    
    if (m.updateTime > 20) {
      recommendations.push('優化遊戲邏輯更新，考慮使用物件池');
    }
    
    if (m.renderTime > 20) {
      recommendations.push('優化渲染，考慮視錐剔除或 LOD 技術');
    }
    
    if (m.poolHitRate < 0.8) {
      recommendations.push('調整物件池大小以提高重用率');
    }
    
    if (m.totalUnits + m.totalObstacles + m.totalEffects > 500) {
      recommendations.push('考慮實作空間分割以提升碰撞檢測效能');
    }
    
    return recommendations;
  }
}

export interface PerformanceAnalysis {
  overallRating: PerformanceRating;
  stability: 'stable' | 'moderate' | 'unstable';
  bottleneck: 'none' | 'update' | 'render' | 'overall';
  recommendations: string[];
}

export type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';