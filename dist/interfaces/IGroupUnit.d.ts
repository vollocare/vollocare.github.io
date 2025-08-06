import { IUnit } from './IUnit';
import { IVector } from '../types/vector';
export interface IGroupUnit {
    readonly id: number;
    readonly groupId: number;
    getUnits(): IUnit[];
    getUnitCount(): number;
    getLeader(): IUnit | null;
    addUnit(x: number, y: number): IUnit;
    removeUnit(unit: IUnit): boolean;
    removeDeadUnits(): number;
    setDestination(destination: IVector): void;
    getDestination(): IVector | null;
    update(deltaTime: number): void;
    render(p: p5Instance): void;
    isActive(): boolean;
    getAveragePosition(): IVector;
    getBounds(): {
        min: IVector;
        max: IVector;
    };
    getTotalHealth(): number;
    getAverageHealth(): number;
    getAliveUnits(): IUnit[];
    getDeadUnits(): IUnit[];
}
//# sourceMappingURL=IGroupUnit.d.ts.map