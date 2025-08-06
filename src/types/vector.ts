// 向量相關型別定義

export interface IVector {
  x: number;
  y: number;
  z?: number;

  // 基本運算
  add(v: IVector): IVector;
  sub(v: IVector): IVector;
  mult(n: number): IVector;
  div(n: number): IVector;
  
  // 向量屬性
  mag(): number;
  magSq(): number;
  normalize(): IVector;
  limit(max: number): IVector;
  
  // 方向相關
  heading(): number;
  rotate(angle: number): IVector;
  
  // 工具方法
  copy(): IVector;
  dist(v: IVector): number;
  dot(v: IVector): number;
  cross(v: IVector): number;
  angleBetween(v: IVector): number;
  
  // 設定方法
  set(x: number, y: number, z?: number): IVector;
  setMag(len: number): IVector;
}

// 靜態向量工具
export interface VectorStatic {
  // 靜態運算方法
  add(v1: IVector, v2: IVector): IVector;
  sub(v1: IVector, v2: IVector): IVector;
  mult(v: IVector, n: number): IVector;
  div(v: IVector, n: number): IVector;
  
  // 靜態距離計算
  dist(v1: IVector, v2: IVector): number;
  dot(v1: IVector, v2: IVector): number;
  cross(v1: IVector, v2: IVector): number;
  angleBetween(v1: IVector, v2: IVector): number;
  
  // 創建方法
  fromAngle(angle: number, length?: number): IVector;
  random2D(): IVector;
  random3D(): IVector;
  
  // 插值方法
  lerp(v1: IVector, v2: IVector, amt: number): IVector;
}

// 向量工具函數
export interface VectorUtils {
  // 邊界檢查
  isWithinBounds(v: IVector, bounds: { left: number; right: number; top: number; bottom: number }): boolean;
  
  // 角度轉換
  toDegrees(radians: number): number;
  toRadians(degrees: number): number;
  
  // 向量到字符串
  toString(v: IVector): string;
  
  // 向量比較
  equals(v1: IVector, v2: IVector, tolerance?: number): boolean;
}

// 特殊向量類型
export declare const ZERO_VECTOR: Readonly<IVector>;
export declare const UNIT_VECTOR_X: Readonly<IVector>;
export declare const UNIT_VECTOR_Y: Readonly<IVector>;
export declare const UNIT_VECTOR_Z: Readonly<IVector>;