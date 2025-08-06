"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitObj = exports.AttackVFX = void 0;
require("./globals");
class AttackVFX {
    constructor(base, vec, myColor) {
        this.showtime = 10;
        this.base = base;
        this.vec = vec;
        this.myColor = myColor;
    }
    draw() {
        this.showtime--;
        window.push();
        window.stroke(this.myColor);
        window.strokeWeight(3);
        window.fill(this.myColor);
        window.translate(this.base.x, this.base.y);
        window.line(0, 0, this.vec.x, this.vec.y);
        window.rotate(this.vec.heading());
        window.pop();
    }
}
exports.AttackVFX = AttackVFX;
class UnitObj {
    constructor(x, y) {
        this.id = Math.floor(Math.random() * 10000);
        this.unitType = 0;
        this.p1p2 = 1;
        this.acceleration = window.createVector(0, 0);
        this.velocity = window.createVector(window.random(-1, 1), window.random(-1, 1));
        this.direction = this.velocity;
        this.position = window.createVector(x, y);
        this.r = 6.0;
        this.base_r = 2.0;
        this.maxspeed = 1;
        this.maxforce = 0.05;
        this.destination = window.createVector(x, y);
        this.approach_range = this.maxspeed + 0.5;
        this.move_state = 'move';
        this.attack_unit = null;
        this.health = 12;
        this.life = 2880;
        this.def_attack_cooldown = 30;
        this.now_attack_cooldown = 0;
        this.attack_visible_distance = 120;
        this.attack_range = 60;
        this.attack_VFX = null;
        this.now_health_recovery_cooldown = 0;
        this.info = '';
    }
    setDestination(target) {
        this.destination = target;
        this.velocity = this.direction.copy();
        this.move_state = 'move';
    }
    isMove() {
        return this.move_state === 'move';
    }
    isFollow() {
        return this.move_state === 'follow';
    }
    setFollow() {
        this.move_state = 'follow';
    }
    setStop() {
        if (this.move_state === 'follow' || this.move_state === 'move') {
            this.direction = this.velocity.copy();
            this.velocity.mult(0);
            this.move_state = 'stop';
        }
    }
    setAttack(enemyunit) {
        this.attack_unit = enemyunit;
        this.move_state = 'attack';
    }
    isAttack() {
        return this.move_state === 'attack';
    }
    applyForce(force) {
        this.acceleration.add(force);
    }
    setForce(force) {
        this.acceleration = force;
    }
    update() {
        if (this.unitType !== 1) {
            this.life -= 1;
        }
        if (this.life <= 0) {
            this.health = 0;
            return;
        }
        const maxHealth = window.int(this.life / 288) + 2;
        if (this.health < maxHealth) {
            this.now_health_recovery_cooldown--;
            if (this.now_health_recovery_cooldown <= 0) {
                this.now_health_recovery_cooldown = 150;
                this.health++;
            }
        }
        if (this.health > maxHealth) {
            this.health = maxHealth;
        }
        this.r = this.health / 3 + this.base_r;
        if (this.unitType === 1) {
            this.r = this.base_r + 1;
        }
        if (this.move_state === 'move') {
            const accelVector = this.acceleration.copy();
            accelVector.mult(1000);
            if (accelVector.mag() > 0.5) {
                if (window.showArrows) {
                    this.drawArrow(this.position, accelVector, window.color(243, 201, 159));
                }
            }
            if (this.acceleration.mag() === 0) {
                this.applyForce(this.seek(this.destination));
                const newAccelVector = this.acceleration.copy();
                newAccelVector.mult(1000);
                if (newAccelVector.mag() > 0.5) {
                    if (window.showArrows) {
                        this.drawArrow(this.position, newAccelVector, 'yellow');
                    }
                }
            }
            if (window.showArrows) {
                const velocityArrow = this.velocity.copy();
                velocityArrow.mult(100);
                this.drawArrow(this.position, velocityArrow, 'green');
            }
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxspeed);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
            this.direction = this.velocity;
            const d = Vector.dist(this.position, this.destination);
            if (d <= this.approach_range) {
                this.setStop();
            }
        }
        if (this.move_state === 'follow') {
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxspeed);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
            this.direction = this.velocity;
        }
        if (this.attack_VFX && this.attack_VFX.showtime <= 0) {
            this.attack_VFX = null;
        }
        if (this.move_state === 'attack') {
            if (!window.isPVP) {
                this.attack_unit = null;
                this.move_state = 'follow';
                return;
            }
            if (this.attack_unit === null) {
                this.move_state = 'follow';
                return;
            }
            const v1 = Vector.sub(this.attack_unit.position, this.position);
            if (window.showTargetLines) {
                this.drawAttArrow(this.position, v1, window.color(223, 165, 165));
            }
            if (this.now_attack_cooldown > 0) {
                this.now_attack_cooldown--;
            }
            else {
                const dist = Vector.dist(this.attack_unit.position, this.position);
                if (dist <= this.attack_range && this.now_attack_cooldown >= 0 && window.isPVP) {
                    this.now_attack_cooldown = this.def_attack_cooldown;
                    const v = Vector.sub(this.attack_unit.position, this.position);
                    this.attack_VFX = new AttackVFX(this.position, v, 'red');
                    this.attack_unit.health--;
                }
                else if (dist > this.attack_visible_distance) {
                    this.attack_unit = null;
                }
            }
            if (this.attack_unit && this.attack_unit.health <= 0) {
                this.attack_unit = null;
            }
            if (this.attack_unit === null) {
                this.move_state = 'follow';
                return;
            }
            let distancePos = this.attack_unit.position;
            const dist = Vector.dist(this.attack_unit.position, this.position);
            const v = Vector.sub(this.attack_unit.position, this.position);
            if (this.health <= 6) {
                const rv150 = v.copy();
                rv150.rotate(160);
                distancePos = Vector.add(this.position, rv150);
                if (window.showArrows) {
                    this.drawArrow(this.position, rv150, 'orange');
                }
            }
            else if (this.now_attack_cooldown > 0 && dist < this.attack_range * 1.5) {
                const rv25 = v.copy();
                rv25.rotate(25);
                distancePos = Vector.add(this.position, rv25);
            }
            this.applyForce(this.seek(distancePos));
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxspeed);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
            this.direction = this.velocity;
        }
    }
    seek(target) {
        const desired = Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxspeed);
        const steer = Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    }
    render(textWithViewPort) {
        const theta = this.direction.heading() + window.radians(90);
        window.fill(127);
        window.stroke(200);
        const colors = [
            window.color(154, 206, 167),
            window.color(58, 126, 76),
            'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'
        ];
        if (this.p1p2 !== 1) {
            const colorIndex = (this.p1p2 - 2) % colors.length;
            window.fill(colors[colorIndex]);
        }
        if (this.unitType === 1) {
            window.stroke('red');
        }
        window.push();
        window.translate(this.position.x, this.position.y);
        window.rotate(theta);
        window.beginShape();
        window.vertex(0, -this.r * 2);
        window.vertex(-this.r, this.r * 2);
        window.vertex(this.r, this.r * 2);
        window.endShape(window.CLOSE);
        window.pop();
        if (this.unitType === 1 && textWithViewPort) {
            textWithViewPort.text(this.p1p2, this.position.x + 10, this.position.y);
        }
        if (window.showUnitStats && textWithViewPort) {
            if (this.unitType !== 1) {
                textWithViewPort.text(window.int(this.health), this.position.x + 10, this.position.y - 5);
                textWithViewPort.text(window.int(this.life / 100), this.position.x + 10, this.position.y + 7);
            }
            textWithViewPort.text(this.info, this.position.x + 25, this.position.y);
        }
        if (this.attack_VFX) {
            this.attack_VFX.draw();
        }
    }
    drawArrow(base, vec, myColor) {
        window.push();
        window.stroke(myColor);
        window.strokeWeight(3);
        window.fill(myColor);
        window.translate(base.x, base.y);
        window.line(0, 0, vec.x, vec.y);
        window.rotate(vec.heading());
        const arrowSize = 7;
        window.translate(vec.mag() - arrowSize, 0);
        window.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        window.pop();
    }
    drawAttArrow(base, vec, myColor) {
        window.push();
        window.stroke(myColor);
        window.strokeWeight(1);
        window.fill(myColor);
        window.translate(base.x, base.y);
        window.line(0, 0, vec.x, vec.y);
        window.rotate(vec.heading());
        const arrowSize = 3;
        window.translate(vec.mag() - arrowSize, 0);
        window.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        window.pop();
    }
}
exports.UnitObj = UnitObj;
