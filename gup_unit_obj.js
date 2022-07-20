
// 三角物件組

function GupUnitObj(x,y,p1p2) {

  this.unitObjs = [];
  this.Leader = new UnitObj(x,y);
  this.Leader.unitType = 1;
  this.p1p2 = p1p2;
}

GupUnitObj.prototype.update = function(enemyunits) {
  this.Leader.update();
  for (let i = 0; i < this.unitObjs.length; i++) {
    //  存活確認
    if(this.unitObjs[i].health <= 0){
      this.unitObjs.splice(i,1);
      continue;
    }
      
    //----攻擊對象判斷------------------------
    if(this.unitObjs[i].attack_unit){
      if(this.unitObjs[i].attack_unit.health <= 0)
        this.unitObjs[i].attack_unit = null;
    }
    if(this.unitObjs[i].attack_unit){
      //距離太遠重選敵人
      let dist = p5.Vector.dist(this.unitObjs[i].attack_unit.position,this.unitObjs[i].position);
      if(dist > this.unitObjs[i].attack_visible_distance/2)
        this.unitObjs[i].attack_unit = null;
    }
    if(this.unitObjs[i].attack_unit == null){
      let min_dist = 999999;
      let min_enemyunit = null;
      for (let j = 0; j < enemyunits.length; j++) {
        if(enemyunits[j].health > 0){
          let dist = p5.Vector.dist(enemyunits[j].position,this.unitObjs[i].position);
          
          if(dist < this.unitObjs[i].attack_visible_distance){
            if(dist<min_dist){
              min_dist = dist;
              min_enemyunit = enemyunits[j];
            }
            
          }
        }
        if(min_enemyunit)
          this.unitObjs[i].setAttack(min_enemyunit);

      }

      
    }
    //----------------------------------------------------------------

    this.unitObjs[i].update();
  }
}

GupUnitObj.prototype.render = function() {
  this.Leader.render();

  for (let i = 0; i < this.unitObjs.length; i++) {
      this.unitObjs[i].render();  
    }

}

GupUnitObj.prototype.setDestination = function(target) {
  this.Leader.setDestination(target);

  for (let i = 0; i < this.unitObjs.length; i++) {
      if(!this.unitObjs[i].isAttack())
        this.unitObjs[i].setFollow();  
    }

}



GupUnitObj.prototype.add = function(x,y) {
  uObj = new UnitObj(x,y);
  uObj.setFollow();
  uObj.p1p2 = this.p1p2;
  this.unitObjs.push(uObj);

}
