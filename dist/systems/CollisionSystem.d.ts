import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IVector } from '../types/vector';
import { BoundingBox } from '../types/common';
import { ISpatialObject } from '../utils/SpatialPartitioning';
export interface ICollisionSystem {
    checkCollision(obj1: ISpatialObject, obj2: ISpatialObject): boolean;
    checkCollisionWithObstacles(unit: IUnit, obstacles: IObstacle[]): IObstacle | null;
    findUnitsInRange(center: IVector, radius: number, units: IUnit[]): IUnit[];
    findNearestUnit(position: IVector, units: IUnit[], maxDistance?: number): IUnit | null;
    updateSpatialStructure(units: IUnit[], obstacles: IObstacle[]): void;
    querySpatialRange(bounds: BoundingBox): ISpatialObject[];
    enableSpatialPartitioning(enabled: boolean): void;
    setCollisionLayers(layers: CollisionLayer[]): void;
    getCollisionStats(): CollisionStats;
    resetStats(): void;
}
export interface CollisionLayer {
    name: string;
    mask: number;
    collidesWith: number[];
}
export interface CollisionStats {
    totalChecks: number;
    spatialQueries: number;
    hitCount: number;
    averageChecksPerFrame: number;
    spatialPartitioningEnabled: boolean;
    quadTreeStats?: any;
}
export declare class CollisionSystem implements ICollisionSystem {
    private p;
    private unitQuadTree?;
    private obstacleQuadTree?;
    private spatialPartitioningEnabled;
    private collisionLayers;
    private stats;
    private frameChecks;
    private frameHistory;
    private lastFrameTime;
    private nearbyUnitsCache;
    private cacheExpireTime;
    constructor(p: p5Instance, worldBounds: BoundingBox);
    private setupDefaultCollisionLayers;
    checkCollision(obj1: ISpatialObject, obj2: ISpatialObject): boolean;
    checkCollisionWithObstacles(unit: IUnit, obstacles: IObstacle[]): IObstacle | null;
    findUnitsInRange(center: IVector, radius: number, units: IUnit[]): IUnit[];
    findNearestUnit(position: IVector, units: IUnit[], maxDistance?: number): IUnit | null;
    updateSpatialStructure(units: IUnit[], obstacles: IObstacle[]): void;
    querySpatialRange(bounds: BoundingBox): ISpatialObject[];
    enableSpatialPartitioning(enabled: boolean): void;
    setCollisionLayers(layers: CollisionLayer[]): void;
    getCollisionStats(): CollisionStats;
    resetStats(): void;
    private updateFrameStats;
    private cleanCache;
    checkRaycast(start: IVector, end: IVector, obstacles: IObstacle[]): {
        hit: boolean;
        obstacle?: IObstacle;
        point?: IVector;
    };
    private lineCircleIntersection;
    renderDebug(p: p5Instance): void;
}
export declare function createCollisionSystem(p: p5Instance, worldBounds: BoundingBox): CollisionSystem;
//# sourceMappingURL=CollisionSystem.d.ts.map