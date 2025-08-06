import { IObstacleManager, IObstacle } from '../interfaces/IObstacle';
import { IUnit } from '../interfaces/IUnit';
import { IVector } from '../types/vector';
export declare class ObstacleManager implements IObstacleManager {
    obstacles: IObstacle[];
    private p;
    constructor(p: p5Instance);
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
    createObstacle(x: number, y: number, radius: number): IObstacle;
    createCircularObstacles(centerX: number, centerY: number, count: number, circleRadius: number, obstacleRadius: number): IObstacle[];
    createRectangularObstacles(left: number, top: number, width: number, height: number, spacing: number, obstacleRadius: number): IObstacle[];
    createBoundaryObstacles(width: number, height: number, thickness: number): IObstacle[];
    isPathClear(from: IVector, to: IVector, unitRadius?: number): boolean;
    onObstacleAdded?(obstacle: IObstacle): void;
    onObstacleRemoved?(obstacle: IObstacle): void;
}
//# sourceMappingURL=ObstacleManager.d.ts.map