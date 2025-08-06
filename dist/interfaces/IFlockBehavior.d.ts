import { IVector } from '../types/vector';
import { IUnit } from './IUnit';
import { IObstacle } from './IObstacle';
export interface IFlockBehavior {
    separate(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
    align(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
    cohesion(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
    avoid(targetUnit: IUnit, obstacles: IObstacle[]): IVector;
    avoidEnemies(targetUnit: IUnit, enemies: IUnit[]): IVector;
    run(leader: IUnit, units: IUnit[], obstacles: IObstacle[], enemies: IUnit[]): void;
    setSeparationWeight(weight: number): void;
    setAlignmentWeight(weight: number): void;
    setCohesionWeight(weight: number): void;
    setAvoidanceWeight(weight: number): void;
    setDesiredSeparation(distance: number): void;
    setNeighborDistance(distance: number): void;
    setCollisionVisibilityFactor(factor: number): void;
    drawArrow(p: p5Instance, base: IVector, vec: IVector, color: string): void;
    enableArrows(enable: boolean): void;
}
export interface IFlockConfiguration {
    separationWeight: number;
    alignmentWeight: number;
    cohesionWeight: number;
    avoidanceWeight: number;
    enemyAvoidanceWeight: number;
    desiredSeparation: number;
    neighborDistance: number;
    collisionVisibilityFactor: number;
    showArrows: boolean;
}
export declare const DEFAULT_FLOCK_CONFIG: IFlockConfiguration;
//# sourceMappingURL=IFlockBehavior.d.ts.map