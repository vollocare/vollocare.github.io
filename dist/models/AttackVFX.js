// 攻擊視覺特效類別
/// <reference path="../types/p5.d.ts" />
export class AttackVFX {
    constructor(p, base, vec, color) {
        this.p = p;
        this.showtime = 10;
        this.base = base;
        this.vec = vec;
        this.color = color;
    }
    draw() {
        this.showtime--;
        this.p.push();
        // 設定顏色
        if (typeof this.color === 'string') {
            this.p.stroke(this.color);
            this.p.fill(this.color);
        }
        else {
            this.p.stroke(this.color.r, this.color.g, this.color.b, this.color.a || 255);
            this.p.fill(this.color.r, this.color.g, this.color.b, this.color.a || 255);
        }
        this.p.strokeWeight(3);
        this.p.translate(this.base.x, this.base.y);
        this.p.line(0, 0, this.vec.x, this.vec.y);
        this.p.rotate(this.vec.heading());
        this.p.pop();
    }
    isExpired() {
        return this.showtime <= 0;
    }
    getRemainingTime() {
        return this.showtime;
    }
}
//# sourceMappingURL=AttackVFX.js.map