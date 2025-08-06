export interface PerformanceMetrics {
    currentFPS: number;
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    frameTime: number;
    averageFrameTime: number;
    updateTime: number;
    renderTime: number;
    systemTime: number;
    memoryUsed?: number;
    memoryTotal?: number;
    totalUnits: number;
    totalObstacles: number;
    totalEffects: number;
    poolUtilization: number;
    poolHitRate: number;
}
export interface PerformanceConfig {
    sampleSize: number;
    updateInterval: number;
    lowFPSThreshold: number;
    highFrameTimeThreshold: number;
    enableLogging: boolean;
    logInterval: number;
}
export declare class PerformanceMonitor {
    private config;
    private metrics;
    private fpsSamples;
    private frameTimeSamples;
    private lastFrameTime;
    private timers;
    private lastUpdateTime;
    private updateCounter;
    private onLowPerformance?;
    private onPerformanceUpdate?;
    private performanceLog;
    private lastLogTime;
    constructor(config?: Partial<PerformanceConfig>);
    private createDefaultMetrics;
    startTimer(name: string): void;
    endTimer(name: string): number;
    update(): void;
    private calculateAverages;
    private checkPerformanceThresholds;
    private logPerformance;
    updateGameStats(units: number, obstacles: number, effects: number): void;
    updatePoolStats(utilization: number, hitRate: number): void;
    setSystemTimes(updateTime: number, renderTime: number): void;
    getMetrics(): PerformanceMetrics;
    getSummary(): string;
    setOnLowPerformance(callback: (metrics: PerformanceMetrics) => void): void;
    setOnPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): void;
    getPerformanceHistory(): PerformanceMetrics[];
    reset(): void;
    analyzePerformance(): PerformanceAnalysis;
    private calculateVariance;
    private calculateOverallRating;
    private generateRecommendations;
}
export interface PerformanceAnalysis {
    overallRating: PerformanceRating;
    stability: 'stable' | 'moderate' | 'unstable';
    bottleneck: 'none' | 'update' | 'render' | 'overall';
    recommendations: string[];
}
export type PerformanceRating = 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
//# sourceMappingURL=PerformanceMonitor.d.ts.map