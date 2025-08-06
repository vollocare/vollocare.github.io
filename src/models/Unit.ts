// Unit 類別 - 單位實體實作
/// <reference path="../types/p5.d.ts" />

import { IUnit } from '../interfaces/IUnit';
import { UnitState, AttackConfig, Color } from '../types/common';
import { IVector } from '../types/vector';
import { Vector } from '../utils/Vector';
import { AttackVFX } from './AttackVFX';

export class Unit implements IUnit {
  // 基本屬性
  public readonly id: string;
  public position: IVector;
  public velocity: IVector;
  public acceleration: IVector;
  
  // 物理屬性
  public readonly r: number;
  public maxSpeed: number;
  public maxForce: number;
  
  // 生命系統
  public health: number;
  public maxHealth: number;
  public isAlive: boolean;
  
  // 狀態管理
  public state: UnitState;
  public previousState: UnitState;
  public stateChangeTime: number;
  
  // 攻擊系統
  public attackConfig: AttackConfig;
  public lastAttackTime: number;
  public canAttack: boolean;
  
  // 視覺屬性
  public color: Color;
  
  // 目標系統
  public target?: IVector;
  public destination?: IVector;
  
  // 群組相關
  public groupId?: number;
  public isLeader: boolean;
  
  // Unit 特有屬性
  private p: p5Instance;
  private unitType: number; // 0=一般, 1=領導
  private p1p2: number; // 群組標識
  public direction: IVector;
  private baseRadius: number;
  private life: number; // 壽命
  private approachRange: number;
  private attackUnit: IUnit | null;
  private attackVisibleDistance: number;
  private attackRange: number;
  private attackVFX: AttackVFX | null;
  private healthRecoveryCooldown: number;
  
  constructor(p: p5Instance, x: number, y: number, groupId: number = 1) {
    this.p = p;
    this.id = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 初始化基本屬性
    this.position = new Vector(p, x, y);
    this.velocity = new Vector(p, p.random(-1, 1), p.random(-1, 1));
    this.acceleration = new Vector(p, 0, 0);
    this.direction = this.velocity.copy();
    this.destination = new Vector(p, x, y);
    
    // 物理屬性
    this.baseRadius = 2.0;
    this.r = 6.0;
    this.maxSpeed = 1;
    this.maxForce = 0.05;
    this.approachRange = this.maxSpeed + 0.5;
    
    // 生命系統
    this.health = 12;
    this.maxHealth = 12;
    this.life = 2880; // 兩分鐘
    this.isAlive = true;
    this.healthRecoveryCooldown = 0;
    
    // 狀態管理
    this.state = UnitState.MOVE;
    this.previousState = UnitState.STOP;
    this.stateChangeTime = Date.now();
    
    // 攻擊系統
    this.attackConfig = {
      damage: 1,
      range: 60,
      cooldown: 30,
      duration: 10
    };
    this.lastAttackTime = 0;
    this.canAttack = true;
    this.attackUnit = null;
    this.attackVisibleDistance = 120;
    this.attackRange = this.attackConfig.range;
    this.attackVFX = null;
    
    // 視覺屬性
    this.color = { r: 127, g: 127, b: 127 };
    
    // 群組相關
    this.groupId = groupId;
    this.isLeader = false;
    this.unitType = 0;
    this.p1p2 = groupId;
  }
  
  // 生命週期方法
  public update(deltaTime: number): void {
    // 生命減少 (leader 不會死亡)
    if (this.unitType !== 1) {
      this.life -= 1;
    }
    
    if (this.life <= 0) {
      this.health = 0;
      this.isAlive = false;
      if (this.state !== UnitState.DIE) {
        this.setState(UnitState.DIE);
      }
      return;
    }
    
    // 計算最高血量
    this.maxHealth = Math.floor(this.life / 288) + 2;
    
    // 回復血量
    if (this.health < this.maxHealth) {
      this.healthRecoveryCooldown--;
      if (this.healthRecoveryCooldown <= 0) {
        this.healthRecoveryCooldown = 150;
        this.health++;
      }
    }
    
    // 血量上限檢查
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
    
    // 計算當前半徑
    if (this.unitType === 1) {
      (this as any).r = this.baseRadius + 1;
    } else {
      (this as any).r = this.health / 3 + this.baseRadius;
    }
    
    // 根據狀態更新
    this.updateByState(deltaTime);
    
    // 更新攻擊特效
    if (this.attackVFX && this.attackVFX.isExpired()) {
      this.attackVFX = null;
    }
  }
  
  private updateByState(deltaTime: number): void {
    switch (this.state) {
      case UnitState.MOVE:
        this.updateMoveState(deltaTime);
        break;
      case UnitState.FOLLOW:
        this.updateFollowState(deltaTime);
        break;
      case UnitState.ATTACK:
        this.updateAttackState(deltaTime);
        break;
      case UnitState.STOP:
        // 停止狀態不需要更新位置
        break;
      case UnitState.DIE:
        // 死亡狀態
        break;
    }
  }
  
  private updateMoveState(_deltaTime: number): void {
    if (this.acceleration.mag() === 0 && this.destination) {
      this.applyForce(this.seek(this.destination));
    }
    
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    this.direction = this.velocity.copy();
    
    // 檢查是否到達目標
    if (this.destination) {
      const distance = Vector.dist(this.position, this.destination);
      if (distance <= this.approachRange) {
        this.setState(UnitState.STOP);
      }
    }
  }
  
  private updateFollowState(_deltaTime: number): void {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    this.direction = this.velocity.copy();
  }
  
  private updateAttackState(_deltaTime: number): void {
    // PVP 模式檢查
    // TODO: 從遊戲狀態獲取 isPVP 狀態
    const isPVP = true; // 暫時設為 true
    
    if (!isPVP) {
      this.attackUnit = null;
      this.setState(UnitState.FOLLOW);
      return;
    }
    
    if (!this.attackUnit) {
      this.setState(UnitState.FOLLOW);
      return;
    }
    
    // 攻擊冷卻
    if (this.lastAttackTime > 0) {
      this.lastAttackTime--;
    } else {
      const distance = Vector.dist(this.attackUnit.position, this.position);
      
      if (distance <= this.attackRange && this.lastAttackTime <= 0 && isPVP) {
        this.performAttack(this.attackUnit);
      } else if (distance > this.attackVisibleDistance) {
        this.attackUnit = null;
      }
    }
    
    // 檢查目標是否死亡
    if (this.attackUnit && !this.attackUnit.isAlive) {
      this.attackUnit = null;
    }
    
    if (!this.attackUnit) {
      this.setState(UnitState.FOLLOW);
      return;
    }
    
    // 計算攻擊策略位置
    let targetPosition = this.attackUnit.position;
    const distance = Vector.dist(this.attackUnit.position, this.position);
    const directionToTarget = Vector.sub(this.p, this.attackUnit.position, this.position);
    
    if (this.health <= 6) {
      // 血量低時逃跑
      const escapeDirection = directionToTarget.copy().rotate(Math.PI);
      targetPosition = Vector.add(this.p, this.position, escapeDirection);
    } else if (this.lastAttackTime > 0 && distance < this.attackRange * 1.5) {
      // 攻擊冷卻時保持距離
      const sideDirection = directionToTarget.copy().rotate(0.44); // 約 25 度
      targetPosition = Vector.add(this.p, this.position, sideDirection);
    }
    
    this.applyForce(this.seek(targetPosition));
    
    // 更新物理
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    this.direction = this.velocity.copy();
  }
  
  private performAttack(target: IUnit): void {
    this.lastAttackTime = this.attackConfig.cooldown;
    const attackDirection = Vector.sub(this.p, target.position, this.position);
    this.attackVFX = new AttackVFX(this.p, this.position, attackDirection, 'red');
    target.takeDamage(this.attackConfig.damage, this);
  }
  
  public render(p: p5Instance): void {
    const theta = this.direction.heading() + p.radians(90);
    
    // 設定顏色
    p.fill(127);
    p.stroke(200);
    
    const colors = [
      { r: 154, g: 206, b: 167 },
      { r: 58, g: 126, b: 76 },
      'orange',
      'yellow',
      'green',
      'blue',
      'indigo',
      'violet'
    ];
    
    if (this.p1p2 !== 1) {
      const colorIndex = (this.p1p2 - 2) % colors.length;
      const selectedColor = colors[colorIndex];
      if (typeof selectedColor === 'string') {
        p.fill(selectedColor);
      } else {
        p.fill(selectedColor.r, selectedColor.g, selectedColor.b);
      }
    }
    
    if (this.unitType === 1) {
      p.stroke('red');
    }
    
    // 繪製三角形
    p.push();
    p.translate(this.position.x, this.position.y);
    p.rotate(theta);
    p.beginShape();
    p.vertex(0, -this.r * 2);
    p.vertex(-this.r, this.r * 2);
    p.vertex(this.r, this.r * 2);
    p.endShape(p.CLOSE);
    p.pop();
    
    // 繪製攻擊特效
    if (this.attackVFX) {
      this.attackVFX.draw();
    }
  }
  
  // 狀態管理方法
  public setState(newState: UnitState): void {
    if (this.state !== newState) {
      this.previousState = this.state;
      this.state = newState;
      this.stateChangeTime = Date.now();
      this.onStateChanged?.(this.previousState, newState);
    }
  }
  
  public canTransitionTo(_targetState: UnitState): boolean {
    // 死亡狀態不能轉換到其他狀態
    if (this.state === UnitState.DIE) {
      return false;
    }
    
    // 其他狀態轉換邏輯
    return true;
  }
  
  // 移動方法
  public seek(target: IVector): IVector {
    const desired = Vector.sub(this.p, target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    
    const steer = Vector.sub(this.p, desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }
  
  public flee(target: IVector): IVector {
    const desired = Vector.sub(this.p, this.position, target);
    desired.normalize();
    desired.mult(this.maxSpeed);
    
    const steer = Vector.sub(this.p, desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }
  
  public arrive(target: IVector, slowingRadius: number = 50): IVector {
    const desired = Vector.sub(this.p, target, this.position);
    const distance = desired.mag();
    
    desired.normalize();
    
    if (distance < slowingRadius) {
      const speed = this.maxSpeed * (distance / slowingRadius);
      desired.mult(speed);
    } else {
      desired.mult(this.maxSpeed);
    }
    
    const steer = Vector.sub(this.p, desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }
  
  // 攻擊方法
  public attack(target: IUnit): boolean {
    if (!this.canAttack || this.lastAttackTime > 0) {
      return false;
    }
    
    if (this.isInAttackRange(target)) {
      this.setAttack(target);
      return true;
    }
    
    return false;
  }
  
  public takeDamage(damage: number, _source?: IUnit): void {
    const oldHealth = this.health;
    this.health = Math.max(0, this.health - damage);
    this.onHealthChanged?.(oldHealth, this.health);
    
    if (this.health <= 0 && this.isAlive) {
      this.isAlive = false;
      this.setState(UnitState.DIE);
      this.onDeath?.();
    }
  }
  
  public isInAttackRange(target: IUnit): boolean {
    const distance = Vector.dist(this.position, target.position);
    return distance <= this.attackRange;
  }
  
  // 工具方法
  public distanceTo(target: IVector | IUnit): number {
    const targetPos = 'position' in target ? target.position : target;
    return Vector.dist(this.position, targetPos);
  }
  
  public angleTo(target: IVector | IUnit): number {
    const targetPos = 'position' in target ? target.position : target;
    const direction = Vector.sub(this.p, targetPos, this.position);
    return direction.heading();
  }
  
  public copy(): IUnit {
    const newUnit = new Unit(this.p, this.position.x, this.position.y, this.groupId);
    // 複製其他屬性...
    return newUnit;
  }
  
  // 增加力
  public applyForce(force: IVector): void {
    this.acceleration.add(force);
  }
  
  // 設定力
  public setForce(force: IVector): void {
    this.acceleration = force;
  }
  
  // 設定目標
  public setDestination(target: IVector): void {
    this.destination = target;
    this.velocity = this.direction.copy();
    this.setState(UnitState.MOVE);
  }
  
  // 設定跟隨
  public setFollow(): void {
    this.setState(UnitState.FOLLOW);
  }
  
  // 設定停止
  public setStop(): void {
    if (this.state === UnitState.FOLLOW || this.state === UnitState.MOVE) {
      this.direction = this.velocity.copy();
      this.velocity.mult(0);
      this.setState(UnitState.STOP);
    }
  }
  
  // 設定攻擊
  public setAttack(enemyUnit: IUnit): void {
    this.attackUnit = enemyUnit;
    this.setState(UnitState.ATTACK);
  }
  
  // 狀態檢查方法
  public isMove(): boolean {
    return this.state === UnitState.MOVE;
  }
  
  public isFollow(): boolean {
    return this.state === UnitState.FOLLOW;
  }
  
  public isAttacking(): boolean {
    return this.state === UnitState.ATTACK;
  }
  
  // 設定 leader
  public setAsLeader(): void {
    this.isLeader = true;
    this.unitType = 1;
  }
  
  // 事件處理 (可選實作)
  public onStateChanged?(oldState: UnitState, newState: UnitState): void;
  public onHealthChanged?(oldHealth: number, newHealth: number): void;
  public onDeath?(): void;
}