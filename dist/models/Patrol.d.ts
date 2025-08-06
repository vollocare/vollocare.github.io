import { IPatrol, IPatrolPoint, IPatrolGroupUnit } from '../interfaces/IPatrol';
import { IGroupUnit } from '../interfaces/IGroupUnit';
import { IVector } from '../types/vector';
export declare class PatrolPoint implements IPatrolPoint {
    position: IVector;
    time: number;
    constructor(p: p5Instance, x: number, y: number, time: number);
}
export declare class PatrolGroupUnit implements IPatrolGroupUnit {
    groupUnit: IGroupUnit;
    lastTime: number;
    nowIndex: number;
    createX: number;
    createY: number;
    constructor(groupUnit: IGroupUnit, index: number, createX: number, createY: number);
}
export declare class Patrol implements IPatrol {
    patrolPoints: IPatrolPoint[];
    patrolGroupUnits: IPatrolGroupUnit[];
    private p;
    private active;
    private maxUnitsPerGroup;
    private unitsAddedPerCycle;
    constructor(p: p5Instance);
    addPoint(x: number, y: number, time: number): void;
    addGroupUnit(groupUnit: IGroupUnit, index: number, createX: number, createY: number): void;
    update(): void;
    private spawnEnemyUnits;
    render(p: p5Instance): void;
    removePoint(index: number): void;
    removeGroupUnit(groupUnit: IGroupUnit): void;
    clear(): void;
    getPointCount(): number;
    getGroupUnitCount(): number;
    isActive(): boolean;
    setActive(active: boolean): void;
    setMaxUnitsPerGroup(max: number): void;
    setUnitsAddedPerCycle(count: number): void;
    getStats(): {
        pointCount: number;
        groupUnitCount: number;
        totalUnits: number;
        active: boolean;
    };
}
//# sourceMappingURL=Patrol.d.ts.map