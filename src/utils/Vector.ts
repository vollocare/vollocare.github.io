// 向量工具類別 - 封裝 p5.Vector 的 TypeScript 實作
/// <reference path="../types/p5.d.ts" />

import { IVector } from '../types/vector';

export class Vector implements IVector {
  public x: number;
  public y: number;
  public z?: number;
  
  private p: p5Instance;
  
  constructor(p: p5Instance, x: number = 0, y: number = 0, z?: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    if (z !== undefined) this.z = z;
  }
  
  
  // 基本運算
  add(v: IVector): IVector {
    this.x += v.x;
    this.y += v.y;
    if (v.z !== undefined && this.z !== undefined) this.z += v.z;
    return this;
  }
  
  sub(v: IVector): IVector {
    this.x -= v.x;
    this.y -= v.y;
    if (v.z !== undefined && this.z !== undefined) this.z -= v.z;
    return this;
  }
  
  mult(n: number): IVector {
    this.x *= n;
    this.y *= n;
    if (this.z !== undefined) this.z *= n;
    return this;
  }
  
  div(n: number): IVector {
    if (n === 0) return this;
    this.x /= n;
    this.y /= n;
    if (this.z !== undefined) this.z /= n;
    return this;
  }
  
  // 向量屬性
  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + (this.z || 0) * (this.z || 0));
  }
  
  magSq(): number {
    return this.x * this.x + this.y * this.y + (this.z || 0) * (this.z || 0);
  }
  
  normalize(): IVector {
    const magnitude = this.mag();
    if (magnitude > 0) {
      this.div(magnitude);
    }
    return this;
  }
  
  limit(max: number): IVector {
    const magnitude = this.mag();
    if (magnitude > max) {
      this.normalize();
      this.mult(max);
    }
    return this;
  }
  
  // 方向相關
  heading(): number {
    return Math.atan2(this.y, this.x);
  }
  
  rotate(angle: number): IVector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }
  
  // 工具方法
  copy(): IVector {
    return new Vector(this.p, this.x, this.y, this.z);
  }
  
  dist(v: IVector): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + ((this.z || 0) - (v.z || 0)) ** 2);
  }
  
  dot(v: IVector): number {
    return this.x * v.x + this.y * v.y + (this.z || 0) * (v.z || 0);
  }
  
  cross(v: IVector): number {
    return this.x * v.y - this.y * v.x;
  }
  
  angleBetween(v: IVector): number {
    const dot = this.dot(v);
    const mag1 = this.mag();
    const mag2 = v.mag();
    return Math.acos(dot / (mag1 * mag2));
  }
  
  // 設定方法
  set(x: number, y: number, z?: number): IVector {
    this.x = x;
    this.y = y;
    if (z !== undefined) this.z = z;
    return this;
  }
  
  setMag(len: number): IVector {
    this.normalize();
    this.mult(len);
    return this;
  }
  
  // 靜態方法
  static add(p: p5Instance, v1: IVector, v2: IVector): IVector {
    return new Vector(p, v1.x + v2.x, v1.y + v2.y, (v1.z || 0) + (v2.z || 0));
  }
  
  static sub(p: p5Instance, v1: IVector, v2: IVector): IVector {
    return new Vector(p, v1.x - v2.x, v1.y - v2.y, (v1.z || 0) - (v2.z || 0));
  }
  
  static mult(p: p5Instance, v: IVector, n: number): IVector {
    return new Vector(p, v.x * n, v.y * n, (v.z || 0) * n);
  }
  
  static div(p: p5Instance, v: IVector, n: number): IVector {
    return new Vector(p, v.x / n, v.y / n, (v.z || 0) / n);
  }
  
  static dist(v1: IVector, v2: IVector): number {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + ((v1.z || 0) - (v2.z || 0)) ** 2);
  }
  
  static dot(v1: IVector, v2: IVector): number {
    return v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0);
  }
  
  static cross(v1: IVector, v2: IVector): number {
    return v1.x * v2.y - v1.y * v2.x;
  }
  
  static angleBetween(v1: IVector, v2: IVector): number {
    const dot = Vector.dot(v1, v2);
    const mag1 = v1.mag();
    const mag2 = v2.mag();
    return Math.acos(dot / (mag1 * mag2));
  }
  
  static fromAngle(p: p5Instance, angle: number, length: number = 1): IVector {
    return new Vector(p, Math.cos(angle) * length, Math.sin(angle) * length);
  }
  
  static random2D(p: p5Instance): IVector {
    const angle = p.random(0, Math.PI * 2);
    return Vector.fromAngle(p, angle);
  }
  
  static random3D(p: p5Instance): IVector {
    const angle1 = p.random(0, Math.PI * 2);
    const angle2 = p.random(0, Math.PI * 2);
    return new Vector(p, Math.cos(angle1), Math.sin(angle1) * Math.cos(angle2), Math.sin(angle1) * Math.sin(angle2));
  }
  
  static lerp(p: p5Instance, v1: IVector, v2: IVector, amt: number): IVector {
    const x = v1.x + (v2.x - v1.x) * amt;
    const y = v1.y + (v2.y - v1.y) * amt;
    const z = (v1.z || 0) + ((v2.z || 0) - (v1.z || 0)) * amt;
    return new Vector(p, x, y, z);
  }
}