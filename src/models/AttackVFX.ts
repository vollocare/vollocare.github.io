// 攻擊視覺特效類別
/// <reference path="../types/p5.d.ts" />

import { IVector } from '../types/vector';
import { Color } from '../types/common';

export class AttackVFX {
  private showtime: number;
  private base: IVector;
  private vec: IVector;
  private color: Color | string;
  private p: p5Instance;
  
  constructor(p: p5Instance, base: IVector, vec: IVector, color: Color | string) {
    this.p = p;
    this.showtime = 10;
    this.base = base;
    this.vec = vec;
    this.color = color;
  }
  
  public draw(): void {
    this.showtime--;
    
    this.p.push();
    
    // 設定顏色
    if (typeof this.color === 'string') {
      this.p.stroke(this.color);
      this.p.fill(this.color);
    } else {
      this.p.stroke(this.color.r, this.color.g, this.color.b, this.color.a || 255);
      this.p.fill(this.color.r, this.color.g, this.color.b, this.color.a || 255);
    }
    
    this.p.strokeWeight(3);
    this.p.translate(this.base.x, this.base.y);
    this.p.line(0, 0, this.vec.x, this.vec.y);
    this.p.rotate(this.vec.heading());
    
    this.p.pop();
  }
  
  public isExpired(): boolean {
    return this.showtime <= 0;
  }
  
  public getRemainingTime(): number {
    return this.showtime;
  }
}