// CollisionSystem - 優化的碰撞檢測系統，使用空間分割提升效能
/// <reference path="../types/p5.d.ts" />

import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IVector } from '../types/vector';
import { BoundingBox } from '../types/common';
import { QuadTree, ISpatialObject } from '../utils/SpatialPartitioning';

export interface ICollisionSystem {
  // 基本碰撞檢測
  checkCollision(obj1: ISpatialObject, obj2: ISpatialObject): boolean;
  checkCollisionWithObstacles(unit: IUnit, obstacles: IObstacle[]): IObstacle | null;
  
  // 範圍查詢
  findUnitsInRange(center: IVector, radius: number, units: IUnit[]): IUnit[];
  findNearestUnit(position: IVector, units: IUnit[], maxDistance?: number): IUnit | null;
  
  // 空間分割管理
  updateSpatialStructure(units: IUnit[], obstacles: IObstacle[]): void;
  querySpatialRange(bounds: BoundingBox): ISpatialObject[];
  
  // 效能優化
  enableSpatialPartitioning(enabled: boolean): void;
  setCollisionLayers(layers: CollisionLayer[]): void;
  
  // 統計資訊
  getCollisionStats(): CollisionStats;
  resetStats(): void;
}

export interface CollisionLayer {
  name: string;
  mask: number; // 位元遮罩
  collidesWith: number[]; // 可以碰撞的層級
}

export interface CollisionStats {
  totalChecks: number;
  spatialQueries: number;
  hitCount: number;
  averageChecksPerFrame: number;
  spatialPartitioningEnabled: boolean;
  quadTreeStats?: any;
}

export class CollisionSystem implements ICollisionSystem {
  // private p: p5Instance;
  
  // 空間分割結構
  private unitQuadTree?: QuadTree<IUnit>;
  private obstacleQuadTree?: QuadTree<IObstacle>;
  private spatialPartitioningEnabled: boolean = true;
  
  // 碰撞層級
  private collisionLayers: Map<string, CollisionLayer> = new Map();
  
  // 統計資料
  private stats: CollisionStats = {
    totalChecks: 0,
    spatialQueries: 0,
    hitCount: 0,
    averageChecksPerFrame: 0,
    spatialPartitioningEnabled: true
  };
  
  // 效能追蹤
  private frameChecks: number = 0;
  private frameHistory: number[] = [];
  // private lastFrameTime: number = Date.now();
  
  // 快取
  private nearbyUnitsCache: Map<string, { units: IUnit[]; timestamp: number }> = new Map();
  private cacheExpireTime: number = 100; // 100ms
  
  constructor(_p: p5Instance, worldBounds: BoundingBox) {
    // this.p = p;
    
    // 初始化空間分割結構
    this.unitQuadTree = new QuadTree<IUnit>(worldBounds, 8, 6);
    this.obstacleQuadTree = new QuadTree<IObstacle>(worldBounds, 4, 4);
    
    // 設定默認碰撞層級
    this.setupDefaultCollisionLayers();
  }
  
  private setupDefaultCollisionLayers(): void {
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
  
  public checkCollision(obj1: ISpatialObject, obj2: ISpatialObject): boolean {
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
  
  public checkCollisionWithObstacles(unit: IUnit, obstacles: IObstacle[]): IObstacle | null {
    if (this.spatialPartitioningEnabled && this.obstacleQuadTree) {
      // 使用空間分割查詢鄰近障礙物
      const nearbyObstacles = this.obstacleQuadTree.queryPoint(unit.position, unit.r * 3);
      this.stats.spatialQueries++;
      
      for (const obstacle of nearbyObstacles) {
        if (this.checkCollision(unit, obstacle)) {
          return obstacle;
        }
      }
    } else {
      // 暴力檢查所有障礙物
      for (const obstacle of obstacles) {
        if (this.checkCollision(unit, obstacle)) {
          return obstacle;
        }
      }
    }
    
    return null;
  }
  
  public findUnitsInRange(center: IVector, radius: number, units: IUnit[]): IUnit[] {
    // 檢查快取
    const cacheKey = `${center.x.toFixed(0)},${center.y.toFixed(0)},${radius}`;
    const cached = this.nearbyUnitsCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.cacheExpireTime) {
      return cached.units;
    }
    
    let result: IUnit[];
    
    if (this.spatialPartitioningEnabled && this.unitQuadTree) {
      // 使用空間分割
      result = this.unitQuadTree.queryPoint(center, radius);
      this.stats.spatialQueries++;
    } else {
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
  
  public findNearestUnit(position: IVector, units: IUnit[], maxDistance: number = Infinity): IUnit | null {
    if (this.spatialPartitioningEnabled && this.unitQuadTree) {
      return this.unitQuadTree.queryNearest(position, maxDistance);
    }
    
    let nearest: IUnit | null = null;
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
  
  public updateSpatialStructure(units: IUnit[], obstacles: IObstacle[]): void {
    if (!this.spatialPartitioningEnabled) return;
    
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
  
  public querySpatialRange(bounds: BoundingBox): ISpatialObject[] {
    const results: ISpatialObject[] = [];
    
    if (this.unitQuadTree) {
      results.push(...this.unitQuadTree.queryRange(bounds));
    }
    
    if (this.obstacleQuadTree) {
      results.push(...this.obstacleQuadTree.queryRange(bounds));
    }
    
    this.stats.spatialQueries++;
    return results;
  }
  
  public enableSpatialPartitioning(enabled: boolean): void {
    this.spatialPartitioningEnabled = enabled;
    this.stats.spatialPartitioningEnabled = enabled;
    
    if (!enabled) {
      this.nearbyUnitsCache.clear();
    }
  }
  
  public setCollisionLayers(layers: CollisionLayer[]): void {
    this.collisionLayers.clear();
    for (const layer of layers) {
      this.collisionLayers.set(layer.name, layer);
    }
  }
  
  public getCollisionStats(): CollisionStats {
    return {
      ...this.stats,
      quadTreeStats: this.spatialPartitioningEnabled ? {
        units: this.unitQuadTree?.getStats(),
        obstacles: this.obstacleQuadTree?.getStats()
      } : undefined
    };
  }
  
  public resetStats(): void {
    this.stats = {
      totalChecks: 0,
      spatialQueries: 0,
      hitCount: 0,
      averageChecksPerFrame: 0,
      spatialPartitioningEnabled: this.spatialPartitioningEnabled
    };
    
    this.frameHistory = [];
    this.frameChecks = 0;
    
    if (this.unitQuadTree) this.unitQuadTree.resetStats();
    if (this.obstacleQuadTree) this.obstacleQuadTree.resetStats();
  }
  
  private updateFrameStats(): void {
    const now = Date.now();
    
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
  
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.nearbyUnitsCache.entries()) {
      if (now - cached.timestamp > this.cacheExpireTime) {
        this.nearbyUnitsCache.delete(key);
      }
    }
  }
  
  // 進階碰撞檢測方法
  public checkRaycast(start: IVector, end: IVector): { hit: boolean; obstacle?: IObstacle; point?: IVector } {
    const result: { hit: boolean; obstacle?: IObstacle; point?: IVector } = { hit: false };
    
    // 使用空間分割查詢射線路徑上的障礙物
    if (this.spatialPartitioningEnabled && this.obstacleQuadTree) {
      const bounds: BoundingBox = {
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
  
  private lineCircleIntersection(lineStart: IVector, lineEnd: IVector, circleCenter: IVector, radius: number): boolean {
    // 線段與圓形相交檢測
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const fx = lineStart.x - circleCenter.x;
    const fy = lineStart.y - circleCenter.y;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return false;
    
    const sqrt = Math.sqrt(discriminant);
    const t1 = (-b - sqrt) / (2 * a);
    const t2 = (-b + sqrt) / (2 * a);
    
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }
  
  // 渲染調試資訊
  public renderDebug(p: p5Instance): void {
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
export function createCollisionSystem(p: p5Instance, worldBounds: BoundingBox): CollisionSystem {
  return new CollisionSystem(p, worldBounds);
}