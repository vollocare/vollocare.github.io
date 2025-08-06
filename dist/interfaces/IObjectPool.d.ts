export interface IPoolable {
    reset(): void;
    isActive(): boolean;
    setActive(active: boolean): void;
}
export interface IObjectPool<T extends IPoolable> {
    acquire(): T;
    release(obj: T): void;
    clear(): void;
    resize(newSize: number): void;
    getActiveCount(): number;
    getPoolSize(): number;
    getAvailableCount(): number;
    getStats(): ObjectPoolStats;
}
export interface ObjectPoolStats {
    totalCreated: number;
    totalAcquired: number;
    totalReleased: number;
    currentActive: number;
    currentAvailable: number;
    poolSize: number;
    hitRate: number;
}
export interface IObjectPoolManager {
    registerPool<T extends IPoolable>(name: string, pool: IObjectPool<T>): void;
    getPool<T extends IPoolable>(name: string): IObjectPool<T> | null;
    removePool(name: string): void;
    clearAllPools(): void;
    getGlobalStats(): {
        [poolName: string]: ObjectPoolStats;
    };
    enableAutoCleanup(intervalMs: number): void;
    disableAutoCleanup(): void;
}
//# sourceMappingURL=IObjectPool.d.ts.map