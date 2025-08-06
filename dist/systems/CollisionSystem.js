// CollisionSystem - 優化的碰撞檢測系統，使用空間分割提升效能
/// <reference path="../types/p5.d.ts" />
import { QuadTree } from '../utils/SpatialPartitioning';
export class CollisionSystem {
    constructor(_p, worldBounds) {
        // this.p = p;
        this.spatialPartitioningEnabled = true;
        // 碰撞層級
        this.collisionLayers = new Map();
        // 統計資料
        this.stats = {
            totalChecks: 0,
            spatialQueries: 0,
            hitCount: 0,
            averageChecksPerFrame: 0,
            spatialPartitioningEnabled: true
        };
        // 效能追蹤
        this.frameChecks = 0;
        this.frameHistory = [];
        // private lastFrameTime: number = Date.now();
        // 快取
        this.nearbyUnitsCache = new Map();
        this.cacheExpireTime = 100; // 100ms
        // 初始化空間分割結構
        this.unitQuadTree = new QuadTree(worldBounds, 8, 6);
        this.obstacleQuadTree = new QuadTree(worldBounds, 4, 4);
        // 設定默認碰撞層級
        this.setupDefaultCollisionLayers();
    }
    setupDefaultCollisionLayers() {
        // 玩家層
        this.collisionLayers.set('player', {
            name: 'player',
            mask: 1 << 0,
            collidesWith: [1 << 1, 1 << 2] // 與敵人和障礙物碰撞
        });
        // 敵人層
        this.collisionLayers.set('enemy', {
            name: 'enemy',
            mask: 1 << 1,
            collidesWith: [1 << 0, 1 << 2] // 與玩家和障礙物碰撞
        });
        // 障礙物層
        this.collisionLayers.set('obstacle', {
            name: 'obstacle',
            mask: 1 << 2,
            collidesWith: [1 << 0, 1 << 1] // 與所有單位碰撞
        });
    }
    checkCollision(obj1, obj2) {
        this.stats.totalChecks++;
        this.frameChecks++;
        const dx = obj1.position.x - obj2.position.x;
        const dy = obj1.position.y - obj2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius1 = obj1.r || 1;
        const radius2 = obj2.r || 1;
        const minDistance = radius1 + radius2;
        const collision = distance < minDistance;
        if (collision) {
            this.stats.hitCount++;
        }
        return collision;
    }
    checkCollisionWithObstacles(unit, obstacles) {
        if (this.spatialPartitioningEnabled && this.obstacleQuadTree) {
            // 使用空間分割查詢鄰近障礙物
            const nearbyObstacles = this.obstacleQuadTree.queryPoint(unit.position, unit.r * 3);
            this.stats.spatialQueries++;
            for (const obstacle of nearbyObstacles) {
                if (this.checkCollision(unit, obstacle)) {
                    return obstacle;
                }
            }
        }
        else {
            // 暴力檢查所有障礙物
            for (const obstacle of obstacles) {
                if (this.checkCollision(unit, obstacle)) {
                    return obstacle;
                }
            }
        }
        return null;
    }
    findUnitsInRange(center, radius, units) {
        // 檢查快取
        const cacheKey = `${center.x.toFixed(0)},${center.y.toFixed(0)},${radius}`;
        const cached = this.nearbyUnitsCache.get(cacheKey);
        const now = Date.now();
        if (cached && now - cached.timestamp < this.cacheExpireTime) {
            return cached.units;
        }
        let result;
        if (this.spatialPartitioningEnabled && this.unitQuadTree) {
            // 使用空間分割
            result = this.unitQuadTree.queryPoint(center, radius);
            this.stats.spatialQueries++;
        }
        else {
            // 暴力搜尋
            result = units.filter(unit => {
                const dx = unit.position.x - center.x;
                const dy = unit.position.y - center.y;
                return Math.sqrt(dx * dx + dy * dy) <= radius;
            });
        }
        // 快取結果
        this.nearbyUnitsCache.set(cacheKey, { units: result, timestamp: now });
        // 清理過期快取
        if (this.nearbyUnitsCache.size > 100) {
            this.cleanCache();
        }
        return result;
    }
    findNearestUnit(position, units, maxDistance = Infinity) {
        if (this.spatialPartitioningEnabled && this.unitQuadTree) {
            return this.unitQuadTree.queryNearest(position, maxDistance);
        }
        let nearest = null;
        let nearestDistance = maxDistance;
        for (const unit of units) {
            const dx = unit.position.x - position.x;
            const dy = unit.position.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < nearestDistance) {
                nearest = unit;
                nearestDistance = distance;
            }
        }
        return nearest;
    }
    updateSpatialStructure(units, obstacles) {
        if (!this.spatialPartitioningEnabled)
            return;
        // 清空並重建空間結構
        if (this.unitQuadTree) {
            this.unitQuadTree.clear();
            for (const unit of units) {
                if (unit.isAlive) {
                    this.unitQuadTree.insert(unit);
                }
            }
        }
        if (this.obstacleQuadTree) {
            this.obstacleQuadTree.clear();
            for (const obstacle of obstacles) {
                this.obstacleQuadTree.insert(obstacle);
            }
        }
        // 清理快取
        this.nearbyUnitsCache.clear();
        // 更新統計
        this.updateFrameStats();
    }
    querySpatialRange(bounds) {
        const results = [];
        if (this.unitQuadTree) {
            results.push(...this.unitQuadTree.queryRange(bounds));
        }
        if (this.obstacleQuadTree) {
            results.push(...this.obstacleQuadTree.queryRange(bounds));
        }
        this.stats.spatialQueries++;
        return results;
    }
    enableSpatialPartitioning(enabled) {
        this.spatialPartitioningEnabled = enabled;
        this.stats.spatialPartitioningEnabled = enabled;
        if (!enabled) {
            this.nearbyUnitsCache.clear();
        }
    }
    setCollisionLayers(layers) {
        this.collisionLayers.clear();
        for (const layer of layers) {
            this.collisionLayers.set(layer.name, layer);
        }
    }
    getCollisionStats() {
        return {
            ...this.stats,
            quadTreeStats: this.spatialPartitioningEnabled ? {
                units: this.unitQuadTree?.getStats(),
                obstacles: this.obstacleQuadTree?.getStats()
            } : undefined
        };
    }
    resetStats() {
        this.stats = {
            totalChecks: 0,
            spatialQueries: 0,
            hitCount: 0,
            averageChecksPerFrame: 0,
            spatialPartitioningEnabled: this.spatialPartitioningEnabled
        };
        this.frameHistory = [];
        this.frameChecks = 0;
        if (this.unitQuadTree)
            this.unitQuadTree.resetStats();
        if (this.obstacleQuadTree)
            this.obstacleQuadTree.resetStats();
    }
    updateFrameStats() {
        // 更新每幀統計
        this.frameHistory.push(this.frameChecks);
        if (this.frameHistory.length > 60) { // 保持 60 幀的歷史
            this.frameHistory.shift();
        }
        // 計算平均值
        if (this.frameHistory.length > 0) {
            const total = this.frameHistory.reduce((sum, checks) => sum + checks, 0);
            this.stats.averageChecksPerFrame = total / this.frameHistory.length;
        }
        this.frameChecks = 0;
        // this.lastFrameTime = now;
    }
    cleanCache() {
        const now = Date.now();
        for (const [key, cached] of this.nearbyUnitsCache.entries()) {
            if (now - cached.timestamp > this.cacheExpireTime) {
                this.nearbyUnitsCache.delete(key);
            }
        }
    }
    // 進階碰撞檢測方法
    checkRaycast(start, end) {
        const result = { hit: false };
        // 使用空間分割查詢射線路徑上的障礙物
        if (this.spatialPartitioningEnabled && this.obstacleQuadTree) {
            const bounds = {
                left: Math.min(start.x, end.x) - 10,
                right: Math.max(start.x, end.x) + 10,
                top: Math.min(start.y, end.y) - 10,
                bottom: Math.max(start.y, end.y) + 10
            };
            const candidates = this.obstacleQuadTree.queryRange(bounds);
            for (const obstacle of candidates) {
                if (this.lineCircleIntersection(start, end, obstacle.position, obstacle.radius)) {
                    result.hit = true;
                    result.obstacle = obstacle;
                    result.point = obstacle.position; // 簡化實作
                    break;
                }
            }
        }
        return result;
    }
    lineCircleIntersection(lineStart, lineEnd, circleCenter, radius) {
        // 線段與圓形相交檢測
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const fx = lineStart.x - circleCenter.x;
        const fy = lineStart.y - circleCenter.y;
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - radius * radius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0)
            return false;
        const sqrt = Math.sqrt(discriminant);
        const t1 = (-b - sqrt) / (2 * a);
        const t2 = (-b + sqrt) / (2 * a);
        return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
    }
    // 渲染調試資訊
    renderDebug(p) {
        if (this.spatialPartitioningEnabled) {
            p.push();
            p.stroke(100, 255, 100, 50);
            p.strokeWeight(1);
            p.noFill();
            if (this.unitQuadTree) {
                this.unitQuadTree.render(p, false);
            }
            p.pop();
        }
    }
}
// 工具函數
export function createCollisionSystem(p, worldBounds) {
    return new CollisionSystem(p, worldBounds);
}
//# sourceMappingURL=CollisionSystem.js.map