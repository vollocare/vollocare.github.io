import { IObstacle } from '../interfaces/IObstacle';
import { IUnit } from '../interfaces/IUnit';
import { IVector } from '../types/vector';
import { Color, BoundingBox } from '../types/common';
export declare class Obstacle implements IObstacle {
    readonly id: string;
    position: IVector;
    radius: number;
    color: Color;
    strokeColor?: Color;
    strokeWeight: number | undefined;
    private p;
    constructor(p: p5Instance, x: number, y: number, radius: number);
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
    setColor(color: Color): void;
    setStroke(color: Color, weight?: number): void;
    setPosition(x: number, y: number): void;
    setRadius(radius: number): void;
}
//# sourceMappingURL=Obstacle.d.ts.map