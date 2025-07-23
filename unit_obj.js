  // 三角物件基本數據

  function UnitObj(x, y) {
    //種類
    this.unitType = 0;//0=一般 1=領導座標
    //p1p2
    this.p1p2 = 1;
    //加速度
    this.acceleration = createVector(0, 0);
    //速度
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    //方向
    this.direction = this.velocity;
    //位置
    this.position = createVector(x, y);
    //半徑 = 健康度/3+基礎半徑
    this.r = 6.0;
    //基礎半徑
    this.base_r = 2.0;
    //極限速度
    this.maxspeed = 1;    
    //最大轉向力度
    this.maxforce = 0.05; 
    //目標
    this.destination = createVector(x, y);
    //目標趨近係數
    this.approach_range = this.maxspeed+0.5;

    //狀態
    this.move_state = 'move';//狀態列表 move stop follow attack escape die
    //攻擊目標
    this.attack_unit = null;
    //health
    this.health = 12;//健康度 最大 int(2880/288)+2 
    //life
    this.life = 2880;//壽命 兩分鐘

    //攻擊CD時間定義 Attack cooldown
    this.def_attack_cooldown = 30;
    //攻擊CD Attack cooldown
    this.now_attack_cooldown = 0;
    //攻擊可視距離
    this.attack_visible_distance = 120;
    //攻擊有效距離
    this.attack_range= 60;
    //攻擊特效
    this.attack_VFX = null;
    //回覆冷卻時間
    this.now_health_recovery_cooldown = 0;


    this.info = '';

  }


  //設定移動目標
  UnitObj.prototype.setDestination = function(target) {
  
    this.destination = target;
    //速度重置讓方向正確
    this.velocity = this.direction.copy();
    //改變狀態
    this.move_state = 'move';

  }
  //設定跟隨
  UnitObj.prototype.isMove = function() {
    return (this.move_state == 'move');
  }

  //設定跟隨
  UnitObj.prototype.isFollow = function() {
    return (this.move_state == 'follow');
  }

  //是否跟隨中
  UnitObj.prototype.setFollow = function() {
    this.move_state = 'follow';
  }
  
  //設定停止
  UnitObj.prototype.setStop = function() {
    if(this.move_state == 'follow' || this.move_state == 'move'){
        this.direction = this.velocity.copy();//複製避免同步歸0
        this.velocity.mult(0);
        this.move_state = 'stop';
    }
  }

  //設定攻擊
  UnitObj.prototype.setAttack = function(enemyunit) {
    this.attack_unit = enemyunit;
    this.move_state ='attack';
  
  }
  //是否攻擊中
  UnitObj.prototype.isAttack = function() {
    return (this.move_state == 'attack');
  }

  //增加加速度
  UnitObj.prototype.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }
  
  //指定加速度
  UnitObj.prototype.setForce = function(force) {
    this.acceleration = force;
  }

  
  
  // Method to update location
  UnitObj.prototype.update = function() {

    //生命減1
    if(this.unitType!=1)
      this.life-=1;
    if(this.life <= 0){
      this.health = 0;
      return;
    }

    //最高血量
    let maxHealth = int(this.life/288)+2;
    //回復冷卻後回血
    if(this.health<maxHealth){
      this.now_health_recovery_cooldown--;
      if(this.now_health_recovery_cooldown<=0){
        this.now_health_recovery_cooldown = 150;
        this.health++;
      }
    }
    // 生命與健康同步
    if(this.health > maxHealth)
      this.health = maxHealth;
    // 計算當前半徑
    this.r = this.health/3+this.base_r;
    if(this.unitType==1)
      this.r = this.base_r+1;
    
    
    if(this.move_state == 'move'){

      if(p5.Vector.mult(this.acceleration,1000).mag() > 0.5)
        if(showArrows) this.drawArrow(this.position,p5.Vector.mult(this.acceleration,1000),color(243,201,159));
        
      if(this.acceleration.mag() == 0){
        this.applyForce(this.seek(this.destination))
        
        if(p5.Vector.mult(this.acceleration,1000).mag() > 0.5)
          if(showArrows) this.drawArrow(this.position,p5.Vector.mult(this.acceleration,1000),'yellow');
        
      }
      
      if(showArrows) this.drawArrow(this.position,p5.Vector.mult(this.velocity,100),'green');
      

      // Update velocity
      this.velocity.add(this.acceleration);
      // Limit speed
      this.velocity.limit(this.maxspeed);

      this.position.add(this.velocity);
      // Reset accelertion to 0 each cycle
      this.acceleration.mult(0);

      //同步方向
      this.direction = this.velocity;

      

      //目標趨近停止
      let d = p5.Vector.dist(this.position,this.destination);
      if(d <= this.approach_range){
        this.setStop();
      }
    }

    if(this.move_state == 'follow'){
      // Update velocity
      this.velocity.add(this.acceleration);
      // Limit speed
      this.velocity.limit(this.maxspeed);

      this.position.add(this.velocity);
      // Reset accelertion to 0 each cycle
      this.acceleration.mult(0);

      //同步方向
      this.direction = this.velocity;
    }

    //----攻擊判斷--------------------------------------------------------
  //  this.info = ''+this.move_state+' '+this.now_attack_cooldown;

    if(this.attack_VFX && this.attack_VFX.showtime<=0)
       this.attack_VFX = null;

    if(this.move_state == 'attack'){
      // PVP F 狀態下停止攻擊並回到跟隨狀態
      if(!isPVP){
        this.attack_unit = null;
        this.move_state = 'follow';
        return;
      }

      if(this.attack_unit == null){
        this.move_state = 'follow';
        return; 
      }
      

      let v1 = p5.Vector.sub(this.attack_unit.position,this.position);
      if(showTargetLines) this.drawAttArrow(this.position,v1,color(223, 165, 165));
      

      if(this.now_attack_cooldown > 0)
      {
          this.now_attack_cooldown--;
      }
      else{
        let dist = p5.Vector.dist(this.attack_unit.position,this.position)
        if(dist <= this.attack_range && this.now_attack_cooldown >= 0 && isPVP){
          this.now_attack_cooldown =  this.def_attack_cooldown;
          let v = p5.Vector.sub(this.attack_unit.position,this.position);
          this.attack_VFX = new Attack_VFX(this.position,v,'red');
          this.attack_unit.health--;
          
        }
        else if(dist > this.attack_visible_distance)
          this.attack_unit = null; 
      }
      if(this.attack_unit && this.attack_unit.health <= 0)
        this.attack_unit = null; 

      if(this.attack_unit == null){
        this.move_state = 'follow';
        return; //
      }
      //--------------------------------------------------------

      //----攻擊目標策略 可以攻擊才接近 ------------------------------------
      let distancePos = this.attack_unit.position;
      let dist = p5.Vector.dist(this.attack_unit.position,this.position)
      let v = p5.Vector.sub(this.attack_unit.position,this.position);

      if(this.health<=6){//快沒血就跑走等回血
        let rv150 = p5.Vector.rotate(v,160);
        distancePos = p5.Vector.add(this.position,rv150); 


        if(showArrows) this.drawArrow(this.position,rv150,'orange');
      }
      else if(this.now_attack_cooldown > 0 && dist < this.attack_range*1.5){
        
        let rv25 = p5.Vector.rotate(v,25);
        distancePos = p5.Vector.add(this.position,rv25); 
      }

      this.applyForce(this.seek(distancePos));

     // this.info += ' '+int(dist);
      //----------------------------------------------------------------

        // Update velocity
      this.velocity.add(this.acceleration);
      // Limit speed
      this.velocity.limit(this.maxspeed);

      this.position.add(this.velocity);
      // Reset accelertion to 0 each cycle
      this.acceleration.mult(0);

      //同步方向
      this.direction = this.velocity;
    }

  }
  
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  UnitObj.prototype.seek = function(target) {
    let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }
  
  UnitObj.prototype.render = function(textWithViewPort) {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.direction.heading() + radians(90);
    fill(127);
    stroke(200);
    let colors = [color(154,206,167),color(58,126,76),'orange','yellow','green','blue','indigo','violet'];
    if(this.p1p2 != 1){
      let color_index = (this.p1p2-2)%colors.length;
      fill(colors[color_index]); 
    }
      
    if(this.unitType == 1)
      stroke('red');
    
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();

    if(this.unitType==1){
      textWithViewPort.text(this.p1p2, this.position.x+10, this.position.y);
    }
    
    if(showUnitStats){
      if(this.unitType!=1){
        textWithViewPort.text(int(this.health), this.position.x+10, this.position.y-5);
        textWithViewPort.text(int(this.life/100), this.position.x+10, this.position.y+7);
      }
      textWithViewPort.text(this.info, this.position.x+25, this.position.y);
    }

    //攻擊特效
    if(this.attack_VFX){
      this.attack_VFX.draw();
    }
  }


  UnitObj.prototype.drawArrow = function(base, vec, myColor) {

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
  // 畫攻擊線
  UnitObj.prototype.drawAttArrow = function(base, vec, myColor) {

    push();
    stroke(myColor);
    strokeWeight(1);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 3;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  function Attack_VFX(base, vec, myColor) {
    this.showtime = 10;
    this.base = base;
    this.vec = vec;
    this.myColor = myColor;
  }

  Attack_VFX.prototype.draw = function(){
    
    this.showtime--;
    push();
    stroke(this.myColor);
    strokeWeight(3);
    fill(this.myColor);
    translate(this.base.x, this.base.y);
    line(0, 0, this.vec.x, this.vec.y);
    rotate(this.vec.heading());
    pop();

  }

 

  