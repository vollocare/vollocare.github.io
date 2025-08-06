import { IFlockBehavior, IFlockConfiguration } from '../interfaces/IFlockBehavior';
import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IVector } from '../types/vector';
export declare class Flock implements IFlockBehavior {
    private p;
    private config;
    constructor(p: p5Instance, config?: Partial<IFlockConfiguration>);
    run(leader: IUnit, units: IUnit[], obstacles: IObstacle[], enemies: IUnit[]): void;
    private applyFollowBehaviors;
    private applyAttackBehaviors;
    private handleGroupStopping;
    separate(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
    align(leader: IUnit, targetUnit: IUnit, units: IUnit[]): IVector;
    cohesion(leader: IUnit, targetUnit: IUnit, _units: IUnit[]): IVector;
    avoid(targetUnit: IUnit, obstacles: IObstacle[]): IVector;
    avoidEnemies(targetUnit: IUnit, enemies: IUnit[]): IVector;
    drawArrow(p: p5Instance, base: IVector, vec: IVector, color: string): void;
    setSeparationWeight(weight: number): void;
    setAlignmentWeight(weight: number): void;
    setCohesionWeight(weight: number): void;
    setAvoidanceWeight(weight: number): void;
    setDesiredSeparation(distance: number): void;
    setNeighborDistance(distance: number): void;
    setCollisionVisibilityFactor(factor: number): void;
    enableArrows(enable: boolean): void;
    getConfiguration(): IFlockConfiguration;
    updateConfiguration(config: Partial<IFlockConfiguration>): void;
}
//# sourceMappingURL=Flock.d.ts.map