// IObjectPool - 物件池介面，用於管理可重用物件以提升效能
/// <reference path="../types/p5.d.ts" />

export interface IPoolable {
  // 物件池物件必須實作的介面
  reset(): void;  // 重置物件到初始狀態
  isActive(): boolean;  // 檢查物件是否在使用中
  setActive(active: boolean): void;  // 設定物件活躍狀態
}

export interface IObjectPool<T extends IPoolable> {
  // 基本操作
  acquire(): T;  // 獲取一個物件
  release(obj: T): void;  // 釋放物件回池中
  
  // 池管理
  clear(): void;  // 清空池子
  resize(newSize: number): void;  // 調整池子大小
  
  // 狀態查詢
  getActiveCount(): number;  // 獲取活躍物件數量
  getPoolSize(): number;  // 獲取池子總大小
  getAvailableCount(): number;  // 獲取可用物件數量
  
  // 統計資訊
  getStats(): ObjectPoolStats;
}

export interface ObjectPoolStats {
  totalCreated: number;  // 總共創建的物件數
  totalAcquired: number;  // 總共獲取的次數
  totalReleased: number;  // 總共釋放的次數
  currentActive: number;  // 目前活躍的物件數
  currentAvailable: number;  // 目前可用的物件數
  poolSize: number;  // 池子大小
  hitRate: number;  // 命中率（重用率）
}

export interface IObjectPoolManager {
  // 池子註冊管理
  registerPool<T extends IPoolable>(name: string, pool: IObjectPool<T>): void;
  getPool<T extends IPoolable>(name: string): IObjectPool<T> | null;
  removePool(name: string): void;
  
  // 全域管理
  clearAllPools(): void;
  getGlobalStats(): { [poolName: string]: ObjectPoolStats };
  
  // 自動管理
  enableAutoCleanup(intervalMs: number): void;
  disableAutoCleanup(): void;
}