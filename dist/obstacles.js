"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obstacles = exports.Obstacle = void 0;
class Obstacle {
    constructor(x, y, r) {
        this.position = window.createVector(x, y);
        this.r = r;
    }
}
exports.Obstacle = Obstacle;
class Obstacles {
    constructor() {
        this.obstacles = [];
    }
    addObstacle(x, y, r) {
        const obstacleTmp = new Obstacle(x, y, r);
        this.obstacles.push(obstacleTmp);
    }
    render() {
        for (let i = 0; i < this.obstacles.length; i++) {
            window.fill(127);
            window.stroke('red');
            window.circle(this.obstacles[i].position.x, this.obstacles[i].position.y, this.obstacles[i].r);
        }
    }
}
exports.Obstacles = Obstacles;
