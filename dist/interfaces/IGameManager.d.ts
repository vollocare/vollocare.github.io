import { IGroupUnit } from './IGroupUnit';
import { IObstacle } from './IObstacle';
import { IPatrol } from './IPatrol';
import { ControlMode } from '../types/common';
export interface IGameManager {
    initialize(): void;
    update(deltaTime: number): void;
    render(): void;
    destroy(): void;
    isPaused(): boolean;
    setPaused(paused: boolean): void;
    getGroupUnits(): IGroupUnit[];
    getGroupUnit(index: number): IGroupUnit | undefined;
    addGroupUnit(groupUnit: IGroupUnit): void;
    removeGroupUnit(index: number): void;
    getObstacles(): IObstacle[];
    addObstacle(obstacle: IObstacle): void;
    removeObstacle(obstacle: IObstacle): void;
    getPatrol(): IPatrol;
    getCurrentControl(): ControlMode;
    setCurrentControl(control: ControlMode): void;
    isPVPMode(): boolean;
    setPVPMode(enabled: boolean): void;
    getDisplaySize(): {
        width: number;
        height: number;
    };
    getGameStats(): {
        frameRate: number;
        totalUnits: number;
        totalObstacles: number;
        currentControl: ControlMode;
        isPVP: boolean;
        isActive: boolean;
    };
}
//# sourceMappingURL=IGameManager.d.ts.map