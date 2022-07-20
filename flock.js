

function Flock() {

}

Flock.prototype.run = function(Leader,unitObjs,obstacles,enemy_unitObjs) {
    for (let i = 0; i < unitObjs.length; i++) {   
        if(unitObjs[i].isFollow()){ 
            let sep = this.separate(Leader,unitObjs[i],unitObjs);   // Separation
            let ali = this.align(Leader,unitObjs[i],unitObjs);      // Alignment
            let coh = this.cohesion(Leader,unitObjs[i],unitObjs);   // Cohesion
            let avo = this.avoid(unitObjs[i],obstacles);
            let avo_enemy = this.avoid(unitObjs[i],enemy_unitObjs);
        

            // Arbitrarily weight these forces
            sep.mult(2.2);
            ali.mult(1.0);
            coh.mult(1.0);
            // Add the force vectors to acceleration
            unitObjs[i].applyForce(sep);
            unitObjs[i].applyForce(ali);
            unitObjs[i].applyForce(coh);
            if(avo.mag()>0){
                this.drawArrow(unitObjs[i].position, p5.Vector.mult(avo,1000), 'while');
                avo.mult(2.0);
                unitObjs[i].applyForce(avo);
            }

            if(avo_enemy.mag()>0){
                this.drawArrow(unitObjs[i].position, p5.Vector.mult(avo_enemy,1000), 'purple');
                avo_enemy.mult(2.0);
                unitObjs[i].applyForce(avo_enemy);
            }
        }
        if(unitObjs[i].isAttack()){ 
            let sep = this.separate(Leader,unitObjs[i],unitObjs);   // Separation
            let coh = this.cohesion(Leader,unitObjs[i],unitObjs);   // Cohesion
            let avo = this.avoid(unitObjs[i],obstacles);
            let avo_enemy = this.avoid(unitObjs[i],enemy_unitObjs);
            sep.mult(1.2);
            coh.mult(1.0);
            unitObjs[i].applyForce(sep);
            unitObjs[i].applyForce(coh);
            
            if(avo.mag()>0){
                this.drawArrow(unitObjs[i].position, p5.Vector.mult(avo,1000), 'while');
                avo.mult(2.0);
                unitObjs[i].applyForce(avo);
            }

            if(avo_enemy.mag()>0){
                this.drawArrow(unitObjs[i].position, p5.Vector.mult(avo_enemy,1000), 'purple');
                avo_enemy.mult(2.0);
                unitObjs[i].applyForce(avo_enemy);
            }
        }
    }

    if(Leader.isMove()){
        let avo = this.avoid(Leader,obstacles);

        if(avo.mag()>0){
            
            this.drawArrow(Leader.position, p5.Vector.mult(avo,1000), 'while');
            Leader.applyForce(avo);
        }
    }
    

    let desiredseparation = 10.0;
    if(!Leader.isMove()){
        let sum = createVector(0, 0);
        for (let i = 0; i < unitObjs.length; i++) {
            sum.add(unitObjs[i].position); // Add location
          }
        if(unitObjs.length > 0) 
            sum.div(unitObjs.length);
        let d = p5.Vector.dist(Leader.position,sum);
        if(d < desiredseparation) {
            for (let i = 0; i < unitObjs.length; i++) {
                if(!unitObjs[i].isAttack())   
                    unitObjs[i].setStop();
            }
        }

    }

}

// Separation
// Method checks for nearby Unit and steers away
Flock.prototype.separate = function(Leader,targetUnitObj,unitObjs) {
 
    let desiredseparation = 25.0;
    let steer = createVector(0, 0);
    let count = 0;
   
    let diff = p5.Vector.sub(targetUnitObj.position, Leader.position);
    let d = p5.Vector.dist(targetUnitObj.position,Leader.position);
    if(d < desiredseparation) {
        diff.normalize();
        if( d != 0)
            diff.div(d);        // Weight by distance
        steer.add(diff);
        count=1;
    }

    for (let i = 0; i < unitObjs.length; i++) {

        let d = p5.Vector.dist(targetUnitObj.position,unitObjs[i].position);
        if(d>0 && d < desiredseparation){
            let diff = p5.Vector.sub(targetUnitObj.position, unitObjs[i].position);
            diff.normalize();
            if( d != 0)
                diff.div(d);        // Weight by distance
            steer.add(diff);
            count++;
        }

    }
    // Average -- divide by how many
    if (count > 0) {
        steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
        // Implement Reynolds: Steering = Desired - Velocity
        steer.normalize();
        steer.mult(targetUnitObj.maxspeed);
        steer.sub(targetUnitObj.velocity);
        steer.limit(targetUnitObj.maxforce);
      }
    return steer;
}

// Alignment
// For every nearby Unit in the system, calculate the average velocity
Flock.prototype.align = function(Leader,targetUnitObj,unitObjs) {

    let sum = createVector(0,0);
    let count = 1;

    //太遠就不對齊
    let neighbordist = 30;
    let d = p5.Vector.dist(targetUnitObj.position,Leader.position);
    if(d > neighbordist)
        return createVector(0,0);
    
    sum.add(Leader.direction);
    for (let i = 0; i < unitObjs.length; i++) {
      let d = p5.Vector.dist(targetUnitObj.position,unitObjs[i].position);
      if (d > 0) {
        sum.add(unitObjs[i].velocity);
        count++;
      }
    }
   
    sum.div(count);
    sum.normalize();
    sum.mult(targetUnitObj.maxspeed);
    let steer = p5.Vector.sub(sum, targetUnitObj.velocity);
    steer.limit(targetUnitObj.maxforce);
    return steer;
   
}

// Cohesion
// For the average location (i.e. center) of all nearby Unit, calculate steering vector towards that location
Flock.prototype.cohesion = function(Leader,targetUnitObj,unitObjs) {

    let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 1;

    sum.add(Leader.position);
/*
    for (let i = 0; i < unitObjs.length; i++) {
      let d = p5.Vector.dist(targetUnitObj.position,unitObjs[i].position);
      if (d > 0) {
        sum.add(unitObjs[i].position); // Add location
        count++;
      }
    }
   
    sum.div(count);
    */
    return targetUnitObj.seek(sum);  // Steer towards the location

  }

  Flock.prototype.avoid = function(targetUnitObj,obstacles) {
    
    // 避開障礙物
    let _COLLISION_VISIBILITY_FACTOR = 6;//碰撞可視係數 時間係數

    let sum = createVector(0, 0);

    
    for(j=0; j<obstacles.length; j++)
    {
        //判斷碰撞
        //距離判定 目前速度方向等比目標距離長度 - 目標半徑加自己半徑 <= 0 才判斷
        //目前速度方向向量轉目標距離長度等距 - 取得與目標距離 =取得相差長度
        //判斷相差長度是否<=目標半徑加自己半徑
        //轉向力道 = 取得相差向量約束轉向長度
        let obstacle = obstacles[j];
        let dist = p5.Vector.dist(obstacle.position,targetUnitObj.position);
        let vLength = targetUnitObj.velocity.mag()*_COLLISION_VISIBILITY_FACTOR;
     
       
        //進入碰撞判斷
        if((vLength+obstacle.r+targetUnitObj.r) >= dist){
            let a = p5.Vector.sub(obstacle.position,targetUnitObj.position);
            let v = p5.Vector.mult(targetUnitObj.velocity,_COLLISION_VISIBILITY_FACTOR);
          
            v.normalize();
            v.mult(a.mag());
            

            let b = p5.Vector.sub(v,a);
            let twoObj_radius_addition = obstacle.r+targetUnitObj.r;
            
            
            
            //碰撞
            if(b.mag()<= twoObj_radius_addition){
                if(b.mag() == 0){
                    b=p5.Vector.rotate(targetUnitObj.velocity,10);
                }
                if(b.mag()<twoObj_radius_addition){
                    b.normalize();
                    b.mult(twoObj_radius_addition);
                }

                sum.add(b);
                
            }
        }
    } 

    sum.limit(targetUnitObj.maxforce);


    
    return sum;

  }

  Flock.prototype.drawArrow = function(base, vec, myColor) {

    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }