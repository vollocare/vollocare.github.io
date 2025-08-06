import { IObjectPool, IPoolable, ObjectPoolStats, IObjectPoolManager } from '../interfaces/IObjectPool';
export declare class ObjectPool<T extends IPoolable> implements IObjectPool<T> {
    private pool;
    private createFn;
    private maxSize;
    private stats;
    constructor(createFunction: () => T, initialSize?: number, maxSize?: number);
    acquire(): T;
    release(obj: T): void;
    clear(): void;
    resize(newSize: number): void;
    getActiveCount(): number;
    getPoolSize(): number;
    getAvailableCount(): number;
    getStats(): ObjectPoolStats;
    private updateStats;
    debugInfo(): string;
}
export declare class ObjectPoolManager implements IObjectPoolManager {
    private pools;
    private cleanupInterval?;
    registerPool<T extends IPoolable>(name: string, pool: IObjectPool<T>): void;
    getPool<T extends IPoolable>(name: string): IObjectPool<T> | null;
    removePool(name: string): void;
    clearAllPools(): void;
    getGlobalStats(): {
        [poolName: string]: ObjectPoolStats;
    };
    enableAutoCleanup(intervalMs: number): void;
    disableAutoCleanup(): void;
    private performAutoCleanup;
    getPoolNames(): string[];
    getTotalStats(): {
        totalPools: number;
        totalObjects: number;
        totalActive: number;
        averageHitRate: number;
    };
}
export declare const globalPoolManager: ObjectPoolManager;
//# sourceMappingURL=ObjectPool.d.ts.map