

let gupUnitObj = null;
let gupUnitObj_enemy = null;
let gupUnitObj_enemy2 = null;
let control = 1;//1=我方 2=enemy 3=enemy2
let flock = null;
let obstacles = null; //障礙物
let lastTime = 0;
let mouselastTime = 0;
let btn_change_control = null;
let ismousePressed = false;
let patrol = null;//巡邏點
let isPVP = false;
let btn_is_PVP = null;
let isPVP_time = 1200;


function setup() {
  createCanvas(900, 550);
  createP("Group Move.");

  gupUnitObj = new GupUnitObj(50,height / 2,1);
  gupUnitObj_enemy = new GupUnitObj(width - 150,height - 150,2);
  gupUnitObj_enemy2 = new GupUnitObj(width/2,height - 150,3);

  flock = new Flock();
  patrol = new Patrol();


  obstacles = new Obstacles();
  obstacles.addObstacle(200,150,80);
  obstacles.addObstacle(350,250,65);
  obstacles.addObstacle(450,350,65);
  obstacles.addObstacle(520,150,65);
  obstacles.addObstacle(320,100,25);
  obstacles.addObstacle(100,300,55);
  obstacles.addObstacle(600,300,100);
  obstacles.addObstacle(700,200,70);


  btn_change_control = createButton('控制_我方');
  btn_change_control.position(20, 20);
  btn_change_control.mousePressed(change_control);

  button = createButton('新單位');
  button.position(20, 50);
  button.mousePressed(new_unit);

  btn_is_PVP = createButton('PVP F');
  btn_is_PVP.position(20, 80);
  btn_is_PVP.mousePressed(sw_pvp);

  patrol.addpoint(50,50,350);
  patrol.addpoint(width - 50,50,400);
  patrol.addpoint(width - 50,height-50,350);
  patrol.addpoint(50,height-50,400);

  patrol.addGupUnitObj(gupUnitObj_enemy,0,50,150);
  patrol.addGupUnitObj(gupUnitObj,2,width-50, 150);
  patrol.addGupUnitObj(gupUnitObj_enemy2,3,width-50, 150);

}

function draw() {
  
  _lastTime =  Date.now()-lastTime;
  if(_lastTime >= 41 && gupUnitObj!=null) {
    background(51);
    let g0_enemy = gupUnitObj_enemy.unitObjs.concat(gupUnitObj_enemy2.unitObjs);
    let g1_enemy = gupUnitObj_enemy2.unitObjs.concat(gupUnitObj.unitObjs);
    let g2_enemy = gupUnitObj.unitObjs.concat(gupUnitObj_enemy.unitObjs);

    flock.run(gupUnitObj.Leader , gupUnitObj.unitObjs , obstacles.obstacles,g0_enemy);
    flock.run(gupUnitObj_enemy.Leader , gupUnitObj_enemy.unitObjs , obstacles.obstacles,g1_enemy);
    flock.run(gupUnitObj_enemy2.Leader , gupUnitObj_enemy2.unitObjs , obstacles.obstacles,g2_enemy);

   
    gupUnitObj.update(g0_enemy);
    gupUnitObj_enemy.update(g1_enemy);
    gupUnitObj_enemy2.update(g2_enemy);

    obstacles.render();

    gupUnitObj.render();
    gupUnitObj_enemy.render();
    gupUnitObj_enemy2.render();


    patrol.run();
    patrol.draw();
    
    text('我 '+gupUnitObj.unitObjs.length, width/2-75, 20);
    text('敵1 '+gupUnitObj_enemy.unitObjs.length, width/2-25, 20);
    text('敵2 '+gupUnitObj_enemy2.unitObjs.length, width/2+25, 20);

    if(isPVP){
      isPVP_time--;
      text('PT '+isPVP_time, width/2+85, 20);
      if(isPVP_time<=0){
        isPVP_time = 1200;
        gupUnitObj.setDestination(gupUnitObj_enemy.Leader.position);
        gupUnitObj_enemy.setDestination(gupUnitObj.Leader.position);
        gupUnitObj_enemy2.setDestination(gupUnitObj.Leader.position);
 
      }

    }
    
    

    lastTime = Date.now();

  }
  
}

// Add a new unit into the System
function doubleClicked() {
  

}

function mousePressed() {
  if(ismousePressed == true) {
    ismousePressed  = false;
    return;
  }
 
  if(control == 1)
    gupUnitObj.setDestination(createVector(mouseX, mouseY));
  else if(control == 2) {
    gupUnitObj_enemy.setDestination(createVector(mouseX, mouseY));
  }else{  
    gupUnitObj_enemy2.setDestination(createVector(mouseX, mouseY));
  }

 
}

function new_unit()
{
  ismousePressed = true;

  if((Date.now()-mouselastTime) >= 200){
    for (var j = 0; j < 20; j++) {
      if(control == 1)
        gupUnitObj.add(50, 150);
      else if(control == 2) {
        gupUnitObj_enemy.add(width-50, 150);
      } else{ 
        gupUnitObj_enemy2.add(width/2, 150);
      }
    }

    mouselastTime = Date.now();
  }
}

function change_control(){
  ismousePressed = true;

  if(control == 1){
    btn_change_control.html('控制_敵1');
    control = 2;
  }else if(control == 2){ 
    btn_change_control.html('控制_敵2');
    control = 3;
  }else{  
    btn_change_control.html('控制_我方');
    control = 1;
  }

}

function sw_pvp(){
 
  isPVP = !isPVP;

  isPVP_time = 50;
  if(isPVP)
    btn_is_PVP.html('PVP T');
  else
    btn_is_PVP.html('PVP F');
}

function Patrol_point(x,y,_time) {
  this.position = createVector(x,y);
  this.time = _time;
}

function Patrol_gupUnitObj(gupUnitObj,index,create_x,create_y) {
  this.gupUnitObj = gupUnitObj;
  this.lastTime = 0;
  this.nowIndex = index;
  this.create_x = create_x;
  this.create_y = create_y;
}

function Patrol() {
  this.patrol_points = [];
  this.patrol_gupUnitObjs = [];
}

Patrol.prototype.addpoint = function(x,y,_time) {
  patrol_point = new Patrol_point(x,y,_time);
  this.patrol_points.push(patrol_point);
}

Patrol.prototype.addGupUnitObj = function(gupUnitObj,index,create_x,create_y) {
  patrol_gupUnitObj = new Patrol_gupUnitObj(gupUnitObj,index,create_x,create_y);
  this.patrol_gupUnitObjs.push(patrol_gupUnitObj);
}

Patrol.prototype.run = function() {
  if(this.patrol_points.length==0) return;
  if(this.patrol_gupUnitObjs.length==0) return;
  for(var i=0; i<this.patrol_gupUnitObjs.length; i++) {
    let pGupUnitObj = this.patrol_gupUnitObjs[i];
    pGupUnitObj.lastTime--;
    if(pGupUnitObj.lastTime<=0){
      pGupUnitObj.nowIndex++;
      if(pGupUnitObj.nowIndex >= this.patrol_points.length)
        pGupUnitObj.nowIndex = 0;

        pGupUnitObj.lastTime = this.patrol_points[pGupUnitObj.nowIndex].time;
        pGupUnitObj.gupUnitObj.setDestination(this.patrol_points[pGupUnitObj.nowIndex].position);
        
        //加敵人
        let imax = 100;
        let cnt = imax-pGupUnitObj.gupUnitObj.unitObjs.length;
        if(cnt > 20) cnt = 20;
        for (var j = 0; j < cnt; j++) {
          let tmpindex = random(0,this.patrol_points.length);
          let pTmp = this.patrol_points[int(tmpindex)].position;
          pGupUnitObj.gupUnitObj.add(pTmp.x,pTmp.y+j*5);
          //pGupUnitObj.gupUnitObj.add(pGupUnitObj.create_x,pGupUnitObj.create_y+j*5);
        }
    } 
  }
  
}

Patrol.prototype.draw = function() {
  for(let i=0;i<this.patrol_points.length;i++) {
    let p = this.patrol_points[i].position;
   
    fill(255);
    stroke(color(255,255,255));
    circle(p.x, p.y, 3);
  }
}