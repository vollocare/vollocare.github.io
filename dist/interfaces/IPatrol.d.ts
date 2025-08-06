import { IVector } from '../types/vector';
import { IGroupUnit } from './IGroupUnit';
export interface IPatrolPoint {
    position: IVector;
    time: number;
}
export interface IPatrolGroupUnit {
    groupUnit: IGroupUnit;
    lastTime: number;
    nowIndex: number;
    createX: number;
    createY: number;
}
export interface IPatrol {
    patrolPoints: IPatrolPoint[];
    patrolGroupUnits: IPatrolGroupUnit[];
    addPoint(x: number, y: number, time: number): void;
    addGroupUnit(groupUnit: IGroupUnit, index: number, createX: number, createY: number): void;
    update(): void;
    render(p: p5Instance): void;
    removePoint(index: number): void;
    removeGroupUnit(groupUnit: IGroupUnit): void;
    clear(): void;
    getPointCount(): number;
    getGroupUnitCount(): number;
    isActive(): boolean;
}
//# sourceMappingURL=IPatrol.d.ts.map