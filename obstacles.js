function Obstacle(x, y,r) {
    //位置
    this.position = createVector(x, y);
    //半徑
    this.r = r;
}


function Obstacles() {
    //障礙物
    this.obstacles = [];
}

Obstacles.prototype.addObstacle = function(x, y,r) {
    obstacleTmp = new Obstacle(x, y, r);
    this.obstacles.push(obstacleTmp);
}

Obstacles.prototype.render = function() {
    
    for (let i = 0; i < this.obstacles.length; i++) {
        fill(127);
        stroke('red');
        circle(this.obstacles[i].position.x, this.obstacles[i].position.y, this.obstacles[i].r);
      }

  }