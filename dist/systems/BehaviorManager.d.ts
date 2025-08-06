import { IUnit } from '../interfaces/IUnit';
import { IObstacle } from '../interfaces/IObstacle';
import { IFlockBehavior } from '../interfaces/IFlockBehavior';
import { UnitState } from '../types/common';
export interface IBehaviorManager {
    update(units: IUnit[], leader: IUnit, obstacles: IObstacle[], enemies: IUnit[], deltaTime: number): void;
    transitionUnitState(unit: IUnit, targetState: UnitState): boolean;
    setFlockBehavior(flockBehavior: IFlockBehavior): void;
    enableFlockingBehavior(enabled: boolean): void;
    enableCombatBehavior(enabled: boolean): void;
    enableAvoidanceBehavior(enabled: boolean): void;
}
export interface IBehaviorState {
    readonly stateName: UnitState;
    onEnter(unit: IUnit): void;
    onUpdate(unit: IUnit, deltaTime: number): void;
    onExit(unit: IUnit): void;
    canTransitionTo(targetState: UnitState): boolean;
}
export declare class BehaviorManager implements IBehaviorManager {
    private flockBehavior;
    private behaviorStates;
    private flockingEnabled;
    private combatEnabled;
    private avoidanceEnabled;
    constructor(p: p5Instance);
    update(units: IUnit[], leader: IUnit, obstacles: IObstacle[], enemies: IUnit[], deltaTime: number): void;
    transitionUnitState(unit: IUnit, targetState: UnitState): boolean;
    private checkAutomaticTransitions;
    private processCombatBehavior;
    private findNearestEnemy;
    private findBestAttackTarget;
    setFlockBehavior(flockBehavior: IFlockBehavior): void;
    enableFlockingBehavior(enabled: boolean): void;
    enableCombatBehavior(enabled: boolean): void;
    enableAvoidanceBehavior(enabled: boolean): void;
    getStateStatistics(units: IUnit[]): Map<UnitState, number>;
    transitionUnitsToState(units: IUnit[], targetState: UnitState): number;
    getSystemStatus(): {
        flockingEnabled: boolean;
        combatEnabled: boolean;
        avoidanceEnabled: boolean;
    };
}
//# sourceMappingURL=BehaviorManager.d.ts.map