import { IVector } from '../types/vector';
import { IUnit } from './IUnit';
import { Color, BoundingBox } from '../types/common';
export interface IObstacle {
    readonly id: string;
    position: IVector;
    radius: number;
    color: Color;
    strokeColor?: Color;
    strokeWeight: number | undefined;
    checkCollision(unit: IUnit): boolean;
    checkCollisionWithPoint(point: IVector): boolean;
    checkCollisionWithCircle(center: IVector, radius: number): boolean;
    distanceToPoint(point: IVector): number;
    distanceToUnit(unit: IUnit): number;
    getAvoidanceForce(unit: IUnit): IVector;
    getClosestPoint(point: IVector): IVector;
    getBoundingBox(): BoundingBox;
    render(p: p5Instance): void;
    isPointInside(point: IVector): boolean;
    copy(): IObstacle;
}
export interface IObstacleManager {
    obstacles: IObstacle[];
    addObstacle(obstacle: IObstacle): void;
    removeObstacle(obstacle: IObstacle): void;
    removeObstacleById(id: string): void;
    addObstacles(obstacles: IObstacle[]): void;
    removeAllObstacles(): void;
    getObstacle(id: string): IObstacle | undefined;
    getObstaclesInRadius(center: IVector, radius: number): IObstacle[];
    getObstaclesInRange(min: IVector, max: IVector): IObstacle[];
    checkCollisions(unit: IUnit): IObstacle[];
    checkAnyCollision(unit: IUnit): boolean;
    calculateAvoidanceForce(unit: IUnit): IVector;
    getClosestObstacle(point: IVector): IObstacle | undefined;
    render(p: p5Instance): void;
    getObstacleCount(): number;
    getTotalArea(): number;
    updateSpatialIndex?(): void;
    onObstacleAdded?(obstacle: IObstacle): void;
    onObstacleRemoved?(obstacle: IObstacle): void;
}
//# sourceMappingURL=IObstacle.d.ts.map