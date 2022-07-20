
let displayWidth = 1024;
let displayHeight = 640;
let viewX = 0;
let viewY = 0;
let gupUnitObj_size = 9;
let gupUnitObjs = [];
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
let currCamera = null;
let textWithViewPort = null;




function setup() {
  createCanvas(displayWidth, displayHeight,WEBGL);//WEBGL
  currCamera = createCamera();
  viewX = displayWidth/2;
  viewY = displayHeight/2;
  textWithViewPort = new TextWithViewPort(displayWidth,displayHeight);
  textWithViewPort.setViewPort(viewX, viewY);

  currCamera.setPosition(viewX, viewY, 554); 


  createP("Group Move.");
  for (let i = 0; i < gupUnitObj_size; i++) {
    let w_length = (displayWidth/gupUnitObj_size)*i+20;
    gupUnitObjTmp = new GupUnitObj(w_length,displayHeight-50,i+1);
    gupUnitObjs.push(gupUnitObjTmp);
  }

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
  obstacles.addObstacle(550,480,65);
  obstacles.addObstacle(250,450,85);
  obstacles.addObstacle(850,400,85);

  btn_change_control = createButton('控制_P1');
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
  patrol.addpoint(50,height-50,300);
  patrol.addpoint(width/2,height-50,300);
  patrol.addpoint(width/2,50,400);

  for (let i = 0; i < gupUnitObj_size; i++) {
    let w_length = displayWidth/gupUnitObj_size+20;
    patrol.addGupUnitObj(gupUnitObjs[i],i%patrol.patrol_points.length,w_length,displayHeight-50); 
  }

}

function draw() {
  
  _lastTime =  Date.now()-lastTime;
  if(_lastTime >= 41 && gupUnitObjs.length > 0) {
    if (keyIsPressed === true) {
        let migration_length = 10;
        if(keyCode==87) viewY-=migration_length;
        if(keyCode==83) viewY+=migration_length;
        if(keyCode==65) viewX-=migration_length;
        if(keyCode==68) viewX+=migration_length;
        
      currCamera.setPosition(viewX, viewY, 554); 
      textWithViewPort.setViewPort(viewX, viewY);
    } 


    
    textWithViewPort.clear();
    background(51);

    for (let i = 0; i < gupUnitObj_size; i++) {
      let g_enemy = [];
      for (let j = 0; j < gupUnitObj_size; j++) {
        if(i!=j){
          g_enemy = g_enemy.concat(gupUnitObjs[j].unitObjs);
        }
          
      }

      flock.run(gupUnitObjs[i].Leader , gupUnitObjs[i].unitObjs , obstacles.obstacles,g_enemy);
     
        
      gupUnitObjs[i].update(g_enemy);
    }

    obstacles.render();

    for (let i = 0; i < gupUnitObj_size; i++) {
      gupUnitObjs[i].render(textWithViewPort);
    }


    patrol.run();
    patrol.draw();
    
    textWithViewPort.fill(color(249,249,246));
    for (let i = 0; i < gupUnitObj_size; i++) {
      let xPos = viewX-displayWidth/2+100+i*50;

      textWithViewPort.text('P'+(i+1)+'_'+ gupUnitObjs[i].unitObjs.length, xPos, (viewY-displayHeight/2)+20);
    }

    


    if(isPVP){
      isPVP_time--;
      textWithViewPort.text('PT '+isPVP_time, width/2+85, 50);
      if(isPVP_time<=0){
        isPVP_time = 1200;
        for (let i = 1; i < gupUnitObj_size; i++) {
          gupUnitObjs[i].setDestination(gupUnitObjs[0].Leader.position);  
        }
      }

    }
    
    textWithViewPort.render();

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
  let newmouseX = mouseX - (displayWidth/2-viewX);
  let newmouseY = mouseY - (displayHeight/2-viewY);

  gupUnitObjs[control-1].setDestination(createVector(newmouseX, newmouseY));
 
}

function new_unit()
{
  ismousePressed = true;

  if((Date.now()-mouselastTime) >= 200){
    for (var j = 0; j < 20; j++) {
      gupUnitObjs[control-1].add(displayWidth/2,displayHeight-50);
    }

    mouselastTime = Date.now();
  }
}

function change_control(){
  ismousePressed = true;
  control+=1;
  if(control>gupUnitObj_size) 
    control = 1;
  btn_change_control.html('控制_P'+control);
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

function TextWithViewPort(displayWidth,displayHeight) {
  this.displayWidth = displayWidth;
  this.displayHeight = displayHeight;
  this.viewX = 0;
  this.viewY = 0;
  this.textScreen = createGraphics(displayWidth,displayHeight);
  //this.textScreen.background(51);
}
TextWithViewPort.prototype.setViewPort = function(viewX,viewY) {
  this.viewX = viewX;
  this.viewY = viewY;
}
  
TextWithViewPort.prototype.clear = function() {
  this.textScreen.clear();
}

TextWithViewPort.prototype.fill = function(color) {
  this.textScreen.fill(color);
}
TextWithViewPort.prototype.text = function(text,x,y) {
  let newX = x+this.displayWidth/2-this.viewX;
  let newY = y+this.displayHeight/2-this.viewY;
  this.textScreen.text(text,newX,newY);
}
TextWithViewPort.prototype.render = function() {
  image(this.textScreen,this.viewX-this.displayWidth/2,this.viewY-this.displayHeight/2);
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