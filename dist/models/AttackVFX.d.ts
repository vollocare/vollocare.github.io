import { IVector } from '../types/vector';
import { Color } from '../types/common';
export declare class AttackVFX {
    private showtime;
    private base;
    private vec;
    private color;
    private p;
    constructor(p: p5Instance, base: IVector, vec: IVector, color: Color | string);
    draw(): void;
    isExpired(): boolean;
    getRemainingTime(): number;
}
//# sourceMappingURL=AttackVFX.d.ts.map