"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GupUnitObj = void 0;
const unit_obj_1 = require("./unit_obj");
require("./globals");
class GupUnitObj {
    constructor(x, y, p1p2) {
        this.unitObjs = [];
        this.Leader = new unit_obj_1.UnitObj(x, y);
        this.Leader.unitType = 1;
        this.Leader.p1p2 = p1p2;
        this.p1p2 = p1p2;
    }
    update(enemyunits) {
        this.Leader.update();
        for (let i = 0; i < this.unitObjs.length; i++) {
            // 存活確認
            if (this.unitObjs[i].health <= 0) {
                this.unitObjs.splice(i, 1);
                continue;
            }
            // 攻擊對象判斷
            if (this.unitObjs[i].attack_unit) {
                if (this.unitObjs[i].attack_unit.health <= 0) {
                    this.unitObjs[i].attack_unit = null;
                }
            }
            if (this.unitObjs[i].attack_unit) {
                // 距離太遠重選敵人
                const dist = Vector.dist(this.unitObjs[i].attack_unit.position, this.unitObjs[i].position);
                if (dist > this.unitObjs[i].attack_visible_distance / 2) {
                    this.unitObjs[i].attack_unit = null;
                }
            }
            // PVP F 狀態下清除攻擊目標
            if (!window.isPVP && this.unitObjs[i].attack_unit) {
                this.unitObjs[i].attack_unit = null;
                this.unitObjs[i].setFollow();
            }
            if (this.unitObjs[i].attack_unit === null && window.isPVP) {
                let min_dist = 999999;
                let min_enemyunit = null;
                for (let j = 0; j < enemyunits.length; j++) {
                    if (enemyunits[j].health > 0) {
                        const dist = Vector.dist(enemyunits[j].position, this.unitObjs[i].position);
                        if (dist < this.unitObjs[i].attack_visible_distance) {
                            if (dist < min_dist) {
                                min_dist = dist;
                                min_enemyunit = enemyunits[j];
                            }
                        }
                    }
                }
                if (min_enemyunit) {
                    this.unitObjs[i].setAttack(min_enemyunit);
                }
            }
            this.unitObjs[i].update();
        }
    }
    render(textScreen) {
        this.Leader.render(textScreen);
        for (let i = 0; i < this.unitObjs.length; i++) {
            this.unitObjs[i].render(textScreen);
        }
    }
    setDestination(target) {
        this.Leader.setDestination(target);
        for (let i = 0; i < this.unitObjs.length; i++) {
            if (!this.unitObjs[i].isAttack()) {
                this.unitObjs[i].setFollow();
            }
        }
    }
    add(x, y) {
        const uObj = new unit_obj_1.UnitObj(x, y);
        uObj.setFollow();
        uObj.p1p2 = this.p1p2;
        this.unitObjs.push(uObj);
    }
}
exports.GupUnitObj = GupUnitObj;
