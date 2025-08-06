import { IVector } from '../types/vector';
export declare class Vector implements IVector {
    x: number;
    y: number;
    z?: number;
    private p;
    constructor(p: p5Instance, x?: number, y?: number, z?: number);
    add(v: IVector): IVector;
    sub(v: IVector): IVector;
    mult(n: number): IVector;
    div(n: number): IVector;
    mag(): number;
    magSq(): number;
    normalize(): IVector;
    limit(max: number): IVector;
    heading(): number;
    rotate(angle: number): IVector;
    copy(): IVector;
    dist(v: IVector): number;
    dot(v: IVector): number;
    cross(v: IVector): number;
    angleBetween(v: IVector): number;
    set(x: number, y: number, z?: number): IVector;
    setMag(len: number): IVector;
    static add(p: p5Instance, v1: IVector, v2: IVector): IVector;
    static sub(p: p5Instance, v1: IVector, v2: IVector): IVector;
    static mult(p: p5Instance, v: IVector, n: number): IVector;
    static div(p: p5Instance, v: IVector, n: number): IVector;
    static dist(v1: IVector, v2: IVector): number;
    static dot(v1: IVector, v2: IVector): number;
    static cross(v1: IVector, v2: IVector): number;
    static angleBetween(v1: IVector, v2: IVector): number;
    static fromAngle(p: p5Instance, angle: number, length?: number): IVector;
    static random2D(p: p5Instance): IVector;
    static random3D(p: p5Instance): IVector;
    static lerp(p: p5Instance, v1: IVector, v2: IVector, amt: number): IVector;
}
//# sourceMappingURL=Vector.d.ts.map