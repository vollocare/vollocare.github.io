// ObstacleManager 類別 - 障礙物管理系統
/// <reference path="../types/p5.d.ts" />

import { IObstacleManager, IObstacle } from '../interfaces/IObstacle';
import { IUnit } from '../interfaces/IUnit';
import { IVector } from '../types/vector';
import { Vector } from '../utils/Vector';
import { Obstacle } from './Obstacle';

export class ObstacleManager implements IObstacleManager {
  public obstacles: IObstacle[];
  
  private p: p5Instance;
  
  constructor(p: p5Instance) {
    this.p = p;
    this.obstacles = [];
  }
  
  // 添加和移除
  public addObstacle(obstacle: IObstacle): void {
    this.obstacles.push(obstacle);
    this.onObstacleAdded?.(obstacle);
  }
  
  public removeObstacle(obstacle: IObstacle): void {
    const index = this.obstacles.indexOf(obstacle);
    if (index !== -1) {
      this.obstacles.splice(index, 1);
      this.onObstacleRemoved?.(obstacle);
    }
  }
  
  public removeObstacleById(id: string): void {
    const index = this.obstacles.findIndex(obstacle => obstacle.id === id);
    if (index !== -1) {
      const obstacle = this.obstacles[index];
      this.obstacles.splice(index, 1);
      this.onObstacleRemoved?.(obstacle);
    }
  }
  
  // 批量操作
  public addObstacles(obstacles: IObstacle[]): void {
    for (const obstacle of obstacles) {
      this.addObstacle(obstacle);
    }
  }
  
  public removeAllObstacles(): void {
    const removedObstacles = [...this.obstacles];
    this.obstacles = [];
    
    for (const obstacle of removedObstacles) {
      this.onObstacleRemoved?.(obstacle);
    }
  }
  
  // 查詢方法
  public getObstacle(id: string): IObstacle | undefined {
    return this.obstacles.find(obstacle => obstacle.id === id);
  }
  
  public getObstaclesInRadius(center: IVector, radius: number): IObstacle[] {
    return this.obstacles.filter(obstacle => {
      const distance = Vector.dist(center, obstacle.position);
      return distance <= radius + obstacle.radius / 2;
    });
  }
  
  public getObstaclesInRange(min: IVector, max: IVector): IObstacle[] {
    return this.obstacles.filter(obstacle => {
      const pos = obstacle.position;
      const halfRadius = obstacle.radius / 2;
      
      return pos.x + halfRadius >= min.x &&
             pos.x - halfRadius <= max.x &&
             pos.y + halfRadius >= min.y &&
             pos.y - halfRadius <= max.y;
    });
  }
  
  // 碰撞檢測
  public checkCollisions(unit: IUnit): IObstacle[] {
    return this.obstacles.filter(obstacle => obstacle.checkCollision(unit));
  }
  
  public checkAnyCollision(unit: IUnit): boolean {
    return this.obstacles.some(obstacle => obstacle.checkCollision(unit));
  }
  
  // 避障計算
  public calculateAvoidanceForce(unit: IUnit): IVector {
    const totalForce = new Vector(this.p, 0, 0);
    let forceCount = 0;
    
    // 計算避障範圍
    const avoidanceRange = unit.r * 5; // 避障檢測範圍
    
    for (const obstacle of this.obstacles) {
      const distance = Vector.dist(unit.position, obstacle.position);
      
      if (distance < avoidanceRange) {
        const avoidanceForce = obstacle.getAvoidanceForce(unit);
        if (avoidanceForce.mag() > 0) {
          totalForce.add(avoidanceForce);
          forceCount++;
        }
      }
    }
    
    // 平均化避障力
    if (forceCount > 0) {
      totalForce.div(forceCount);
    }
    
    return totalForce;
  }
  
  public getClosestObstacle(point: IVector): IObstacle | undefined {
    if (this.obstacles.length === 0) return undefined;
    
    let closestObstacle = this.obstacles[0];
    let minDistance = Vector.dist(point, closestObstacle.position);
    
    for (let i = 1; i < this.obstacles.length; i++) {
      const distance = Vector.dist(point, this.obstacles[i].position);
      if (distance < minDistance) {
        minDistance = distance;
        closestObstacle = this.obstacles[i];
      }
    }
    
    return closestObstacle;
  }
  
  // 渲染
  public render(p: p5Instance): void {
    for (const obstacle of this.obstacles) {
      obstacle.render(p);
    }
  }
  
  // 統計
  public getObstacleCount(): number {
    return this.obstacles.length;
  }
  
  public getTotalArea(): number {
    return this.obstacles.reduce((total, obstacle) => {
      const radius = obstacle.radius / 2;
      return total + Math.PI * radius * radius;
    }, 0);
  }
  
  // 便利方法：創建障礙物並添加
  public createObstacle(x: number, y: number, radius: number): IObstacle {
    const obstacle = new Obstacle(this.p, x, y, radius);
    this.addObstacle(obstacle);
    return obstacle;
  }
  
  // 便利方法：批量創建圓形障礙物
  public createCircularObstacles(centerX: number, centerY: number, count: number, 
                                 circleRadius: number, obstacleRadius: number): IObstacle[] {
    const obstacles: IObstacle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * circleRadius;
      const y = centerY + Math.sin(angle) * circleRadius;
      
      const obstacle = this.createObstacle(x, y, obstacleRadius);
      obstacles.push(obstacle);
    }
    
    return obstacles;
  }
  
  // 便利方法：創建矩形區域的障礙物
  public createRectangularObstacles(left: number, top: number, width: number, height: number, 
                                   spacing: number, obstacleRadius: number): IObstacle[] {
    const obstacles: IObstacle[] = [];
    
    for (let x = left; x <= left + width; x += spacing) {
      for (let y = top; y <= top + height; y += spacing) {
        const obstacle = this.createObstacle(x, y, obstacleRadius);
        obstacles.push(obstacle);
      }
    }
    
    return obstacles;
  }
  
  // 便利方法：創建邊界障礙物
  public createBoundaryObstacles(width: number, height: number, thickness: number): IObstacle[] {
    const obstacles: IObstacle[] = [];
    const half = thickness / 2;
    
    // 上邊界
    for (let x = 0; x <= width; x += thickness) {
      obstacles.push(this.createObstacle(x, half, thickness));
    }
    
    // 下邊界
    for (let x = 0; x <= width; x += thickness) {
      obstacles.push(this.createObstacle(x, height - half, thickness));
    }
    
    // 左邊界
    for (let y = thickness; y < height - thickness; y += thickness) {
      obstacles.push(this.createObstacle(half, y, thickness));
    }
    
    // 右邊界
    for (let y = thickness; y < height - thickness; y += thickness) {
      obstacles.push(this.createObstacle(width - half, y, thickness));
    }
    
    return obstacles;
  }
  
  // 路徑尋找輔助方法
  public isPathClear(from: IVector, to: IVector, unitRadius: number = 0): boolean {
    const direction = Vector.sub(this.p, to, from);
    const distance = direction.mag();
    
    if (distance === 0) return true;
    
    direction.normalize();
    
    // 檢查路徑上的點是否與障礙物碰撞
    const stepSize = 5; // 檢查間隔
    const steps = Math.ceil(distance / stepSize);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkPoint = Vector.add(this.p, from, Vector.mult(this.p, direction, distance * t));
      
      for (const obstacle of this.obstacles) {
        if (obstacle.checkCollisionWithCircle(checkPoint, unitRadius)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // 事件處理 (可選實作)
  public onObstacleAdded?(obstacle: IObstacle): void;
  public onObstacleRemoved?(obstacle: IObstacle): void;
}