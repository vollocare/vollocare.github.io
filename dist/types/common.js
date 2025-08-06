// 共用型別定義
// 單位狀態列舉
export var UnitState;
(function (UnitState) {
    UnitState["MOVE"] = "move";
    UnitState["STOP"] = "stop";
    UnitState["FOLLOW"] = "follow";
    UnitState["ATTACK"] = "attack";
    UnitState["ESCAPE"] = "escape";
    UnitState["DIE"] = "die";
})(UnitState || (UnitState = {}));
// 控制模式列舉
export var ControlMode;
(function (ControlMode) {
    ControlMode[ControlMode["PLAYER"] = 1] = "PLAYER";
    ControlMode[ControlMode["ENEMY"] = 2] = "ENEMY";
    ControlMode[ControlMode["ENEMY2"] = 3] = "ENEMY2";
})(ControlMode || (ControlMode = {}));
// 事件類型列舉
export var EventType;
(function (EventType) {
    EventType["UNIT_CREATED"] = "unit_created";
    EventType["UNIT_DESTROYED"] = "unit_destroyed";
    EventType["UNIT_ATTACK"] = "unit_attack";
    EventType["UNIT_DAMAGED"] = "unit_damaged";
    EventType["UNIT_STATE_CHANGED"] = "unit_state_changed";
    EventType["CONTROL_CHANGED"] = "control_changed";
})(EventType || (EventType = {}));
//# sourceMappingURL=common.js.map