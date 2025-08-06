// Obstacle 類別 - 障礙物實體
/// <reference path="../types/p5.d.ts" />
import { Vector } from '../utils/Vector';
export class Obstacle {
    constructor(p, x, y, radius) {
        this.p = p;
        this.id = `obstacle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position = new Vector(p, x, y);
        this.radius = radius;
        // 預設顏色
        this.color = { r: 127, g: 127, b: 127 };
        this.strokeColor = { r: 255, g: 0, b: 0 }; // 紅色邊框
        this.strokeWeight = 1;
    }
    // 碰撞檢測
    checkCollision(unit) {
        const distance = Vector.dist(unit.position, this.position);
        return distance < (this.radius / 2 + unit.r); // radius 是直徑，所以除以 2
    }
    checkCollisionWithPoint(point) {
        const distance = Vector.dist(point, this.position);
        return distance < this.radius / 2;
    }
    checkCollisionWithCircle(center, radius) {
        const distance = Vector.dist(center, this.position);
        return distance < (this.radius / 2 + radius);
    }
    // 距離計算
    distanceToPoint(point) {
        const distance = Vector.dist(point, this.position);
        return Math.max(0, distance - this.radius / 2);
    }
    distanceToUnit(unit) {
        const distance = Vector.dist(unit.position, this.position);
        return Math.max(0, distance - this.radius / 2 - unit.r);
    }
    // 避障計算
    getAvoidanceForce(unit) {
        const direction = Vector.sub(this.p, unit.position, this.position);
        const distance = direction.mag();
        if (distance === 0) {
            // 如果位置重疊，給一個隨機方向
            return new Vector(this.p, this.p.random(-1, 1), this.p.random(-1, 1));
        }
        direction.normalize();
        // 避障力度與距離成反比
        const avoidanceRadius = this.radius / 2 + unit.r + 20; // 額外的安全距離
        if (distance < avoidanceRadius) {
            const strength = (avoidanceRadius - distance) / avoidanceRadius;
            direction.mult(strength * unit.maxForce * 2); // 乘以 2 增強避障力度
            return direction;
        }
        return new Vector(this.p, 0, 0);
    }
    getClosestPoint(point) {
        const direction = Vector.sub(this.p, point, this.position);
        const distance = direction.mag();
        if (distance <= this.radius / 2) {
            // 點在圓內，回傳圓心
            return this.position.copy();
        }
        // 點在圓外，回傳圓周上最近的點
        direction.normalize();
        direction.mult(this.radius / 2);
        return Vector.add(this.p, this.position, direction);
    }
    // 邊界框
    getBoundingBox() {
        const halfRadius = this.radius / 2;
        return {
            left: this.position.x - halfRadius,
            right: this.position.x + halfRadius,
            top: this.position.y - halfRadius,
            bottom: this.position.y + halfRadius
        };
    }
    // 渲染
    render(p) {
        p.push();
        // 設定填充顏色
        p.fill(this.color.r, this.color.g, this.color.b, this.color.a || 255);
        // 設定邊框
        if (this.strokeColor) {
            p.stroke(this.strokeColor.r, this.strokeColor.g, this.strokeColor.b, this.strokeColor.a || 255);
            if (this.strokeWeight) {
                p.strokeWeight(this.strokeWeight);
            }
        }
        else {
            p.noStroke();
        }
        // 繪製圓形障礙物
        p.circle(this.position.x, this.position.y, this.radius);
        p.pop();
    }
    // 工具方法
    isPointInside(point) {
        return this.checkCollisionWithPoint(point);
    }
    copy() {
        const newObstacle = new Obstacle(this.p, this.position.x, this.position.y, this.radius);
        newObstacle.color = { ...this.color };
        if (this.strokeColor) {
            newObstacle.strokeColor = { ...this.strokeColor };
        }
        newObstacle.strokeWeight = this.strokeWeight;
        return newObstacle;
    }
    // 設定方法
    setColor(color) {
        this.color = color;
    }
    setStroke(color, weight) {
        this.strokeColor = color;
        this.strokeWeight = weight;
    }
    setPosition(x, y) {
        this.position.set(x, y);
    }
    setRadius(radius) {
        this.radius = Math.max(0, radius);
    }
}
//# sourceMappingURL=Obstacle.js.map