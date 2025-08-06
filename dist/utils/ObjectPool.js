// ObjectPool - 通用物件池實作，提升大量物件創建和銷毀的效能
/// <reference path="../types/p5.d.ts" />
export class ObjectPool {
    constructor(createFunction, initialSize = 10, maxSize = 100) {
        this.pool = [];
        // 統計資料
        this.stats = {
            totalCreated: 0,
            totalAcquired: 0,
            totalReleased: 0,
            currentActive: 0,
            currentAvailable: 0,
            poolSize: 0,
            hitRate: 0
        };
        this.createFn = createFunction;
        this.maxSize = maxSize;
        // 預先建立初始物件
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj.setActive(false);
            this.pool.push(obj);
            this.stats.totalCreated++;
        }
        this.updateStats();
    }
    acquire() {
        let obj;
        // 嘗試從池中取得物件
        const availableObj = this.pool.find(item => !item.isActive());
        if (availableObj) {
            // 從池中重用物件
            obj = availableObj;
        }
        else {
            // 池中沒有可用物件，創建新物件
            if (this.pool.length < this.maxSize) {
                obj = this.createFn();
                this.pool.push(obj);
                this.stats.totalCreated++;
            }
            else {
                // 池已滿，強制重用最舊的物件
                console.warn(`ObjectPool full (${this.maxSize}), reusing oldest object`);
                obj = this.pool[0];
            }
        }
        // 重置並激活物件
        obj.reset();
        obj.setActive(true);
        this.stats.totalAcquired++;
        this.updateStats();
        return obj;
    }
    release(obj) {
        if (!obj || !this.pool.includes(obj)) {
            console.warn('Attempting to release object not from this pool');
            return;
        }
        if (!obj.isActive()) {
            console.warn('Attempting to release already inactive object');
            return;
        }
        // 停用物件
        obj.setActive(false);
        this.stats.totalReleased++;
        this.updateStats();
    }
    clear() {
        // 停用所有物件
        for (const obj of this.pool) {
            obj.setActive(false);
        }
        this.updateStats();
    }
    resize(newSize) {
        if (newSize < 0) {
            console.warn('Pool size cannot be negative');
            return;
        }
        this.maxSize = newSize;
        // 如果當前池子大小超過新限制，移除多餘的非活躍物件
        if (this.pool.length > newSize) {
            const objectsToRemove = this.pool.length - newSize;
            const inactiveObjects = this.pool.filter(obj => !obj.isActive());
            for (let i = 0; i < objectsToRemove && i < inactiveObjects.length; i++) {
                const index = this.pool.indexOf(inactiveObjects[i]);
                if (index !== -1) {
                    this.pool.splice(index, 1);
                }
            }
        }
        this.updateStats();
    }
    getActiveCount() {
        return this.pool.filter(obj => obj.isActive()).length;
    }
    getPoolSize() {
        return this.pool.length;
    }
    getAvailableCount() {
        return this.pool.filter(obj => !obj.isActive()).length;
    }
    getStats() {
        return { ...this.stats };
    }
    updateStats() {
        this.stats.currentActive = this.getActiveCount();
        this.stats.currentAvailable = this.getAvailableCount();
        this.stats.poolSize = this.pool.length;
        // 計算命中率（重用率）
        if (this.stats.totalAcquired > 0) {
            const reusedObjects = this.stats.totalAcquired - this.stats.totalCreated;
            this.stats.hitRate = Math.max(0, reusedObjects / this.stats.totalAcquired);
        }
    }
    // 調試方法
    debugInfo() {
        const stats = this.getStats();
        return [
            `Pool Size: ${stats.poolSize}/${this.maxSize}`,
            `Active: ${stats.currentActive}`,
            `Available: ${stats.currentAvailable}`,
            `Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`,
            `Total Created: ${stats.totalCreated}`
        ].join(', ');
    }
}
export class ObjectPoolManager {
    constructor() {
        this.pools = new Map();
    }
    registerPool(name, pool) {
        if (this.pools.has(name)) {
            console.warn(`Pool with name '${name}' already exists, replacing...`);
        }
        this.pools.set(name, pool);
    }
    getPool(name) {
        return this.pools.get(name) || null;
    }
    removePool(name) {
        const pool = this.pools.get(name);
        if (pool) {
            pool.clear();
            this.pools.delete(name);
        }
    }
    clearAllPools() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
    }
    getGlobalStats() {
        const globalStats = {};
        for (const [name, pool] of this.pools.entries()) {
            globalStats[name] = pool.getStats();
        }
        return globalStats;
    }
    enableAutoCleanup(intervalMs) {
        this.disableAutoCleanup(); // 清除現有的定時器
        this.cleanupInterval = setInterval(() => {
            this.performAutoCleanup();
        }, intervalMs);
    }
    disableAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
    performAutoCleanup() {
        // 自動清理策略：如果池子利用率低於 20%，縮小池子大小
        for (const [name, pool] of this.pools.entries()) {
            const stats = pool.getStats();
            if (stats.poolSize > 10) { // 只對較大的池子進行清理
                const utilization = stats.currentActive / stats.poolSize;
                if (utilization < 0.2) {
                    const newSize = Math.max(10, Math.floor(stats.poolSize * 0.8));
                    pool.resize(newSize);
                    console.log(`Auto-cleaned pool '${name}': ${stats.poolSize} → ${newSize}`);
                }
            }
        }
    }
    getPoolNames() {
        return Array.from(this.pools.keys());
    }
    getTotalStats() {
        const allStats = this.getGlobalStats();
        const poolCount = Object.keys(allStats).length;
        let totalObjects = 0;
        let totalActive = 0;
        let totalHitRate = 0;
        for (const stats of Object.values(allStats)) {
            totalObjects += stats.poolSize;
            totalActive += stats.currentActive;
            totalHitRate += stats.hitRate;
        }
        return {
            totalPools: poolCount,
            totalObjects,
            totalActive,
            averageHitRate: poolCount > 0 ? totalHitRate / poolCount : 0
        };
    }
}
// 全域物件池管理器實例
export const globalPoolManager = new ObjectPoolManager();
//# sourceMappingURL=ObjectPool.js.map