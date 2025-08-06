import { IUnit } from './IUnit';
import { IObstacle } from './IObstacle';
import { IVector } from '../types/vector';
import { FlockWeights } from '../types/common';
export interface IFlockBehavior {
    weights: FlockWeights;
    separate(unit: IUnit, neighbors: IUnit[]): IVector;
    align(unit: IUnit, neighbors: IUnit[]): IVector;
    cohesion(unit: IUnit, neighbors: IUnit[]): IVector;
    avoid(unit: IUnit, obstacles: IObstacle[]): IVector;
    avoidUnits(unit: IUnit, otherUnits: IUnit[]): IVector;
    boundaries(unit: IUnit, bounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }): IVector;
    findNeighbors(unit: IUnit, allUnits: IUnit[], radius: number): IUnit[];
    calculateForces(unit: IUnit, allUnits: IUnit[], obstacles: IObstacle[]): IVector;
    setWeight(behavior: keyof FlockWeights, weight: number): void;
    getWeight(behavior: keyof FlockWeights): number;
    adjustWeightsForState(unit: IUnit): void;
}
export interface IFlock {
    units: IUnit[];
    behavior: IFlockBehavior;
    addUnit(unit: IUnit): void;
    removeUnit(unit: IUnit): void;
    removeUnitById(id: string): void;
    addUnits(units: IUnit[]): void;
    removeAllUnits(): void;
    getUnit(id: string): IUnit | undefined;
    getUnitsInRadius(center: IVector, radius: number): IUnit[];
    getUnitsInRange(min: IVector, max: IVector): IUnit[];
    update(deltaTime: number): void;
    render(p: p5Instance): void;
    getUnitCount(): number;
    getAliveUnits(): IUnit[];
    getDeadUnits(): IUnit[];
    getUnitsByGroup(groupId: number): IUnit[];
    getLeaders(): IUnit[];
    onUnitAdded?(unit: IUnit): void;
    onUnitRemoved?(unit: IUnit): void;
    onUnitDied?(unit: IUnit): void;
}
//# sourceMappingURL=IFlock.d.ts.map