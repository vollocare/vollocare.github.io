export interface IVector {
    x: number;
    y: number;
    z?: number;
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
}
export interface VectorStatic {
    add(v1: IVector, v2: IVector): IVector;
    sub(v1: IVector, v2: IVector): IVector;
    mult(v: IVector, n: number): IVector;
    div(v: IVector, n: number): IVector;
    dist(v1: IVector, v2: IVector): number;
    dot(v1: IVector, v2: IVector): number;
    cross(v1: IVector, v2: IVector): number;
    angleBetween(v1: IVector, v2: IVector): number;
    fromAngle(angle: number, length?: number): IVector;
    random2D(): IVector;
    random3D(): IVector;
    lerp(v1: IVector, v2: IVector, amt: number): IVector;
}
export interface VectorUtils {
    isWithinBounds(v: IVector, bounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }): boolean;
    toDegrees(radians: number): number;
    toRadians(degrees: number): number;
    toString(v: IVector): string;
    equals(v1: IVector, v2: IVector, tolerance?: number): boolean;
}
export declare const ZERO_VECTOR: Readonly<IVector>;
export declare const UNIT_VECTOR_X: Readonly<IVector>;
export declare const UNIT_VECTOR_Y: Readonly<IVector>;
export declare const UNIT_VECTOR_Z: Readonly<IVector>;
//# sourceMappingURL=vector.d.ts.map