import { IUnit } from '../interfaces/IUnit';
import { IGroupUnit } from '../interfaces/IGroupUnit';
import { IVector } from '../types/vector';
export interface ITextRenderer {
    text(str: string, x: number, y: number): void;
}
export declare class GroupUnit implements IGroupUnit {
    readonly id: number;
    readonly groupId: number;
    private p;
    private unitObjs;
    private leader;
    private destination;
    constructor(p: p5Instance, groupId: number, x?: number, y?: number);
    updateWithEnemies(enemyUnits: IUnit[], deltaTime?: number, isPVP?: boolean): void;
    private manageAttackTarget;
    private findNewTarget;
    renderWithText(p: p5Instance, textRenderer?: ITextRenderer): void;
    setDestination(target: IVector): void;
    add(x: number, y: number): void;
    addUnit(x: number, y: number): IUnit;
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
    getLeader(): IUnit;
    getUnits(): IUnit[];
    getAllUnits(): IUnit[];
    getUnitCount(): number;
    getTotalUnitCount(): number;
    getGroupId(): number;
    getAliveUnits(): IUnit[];
    getDeadUnits(): IUnit[];
    setGroupFollow(): void;
    setGroupStop(): void;
    removeUnit(unit: IUnit): boolean;
    removeUnitById(id: string): boolean;
    removeDeadUnits(): number;
    getAverageHealth(): number;
    getGroupCenter(): IVector;
    isGroupIdle(): boolean;
    hasAttackingUnits(): boolean;
    getAttackingUnits(): IUnit[];
    getFollowingUnits(): IUnit[];
}
//# sourceMappingURL=GroupUnit.d.ts.map