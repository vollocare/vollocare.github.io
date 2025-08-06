import { ControlMode } from '../types/common';
import { IVector } from '../types/vector';
export interface IUISystem {
    initialize(): void;
    update(deltaTime: number): void;
    destroy(): void;
    createButton(id: string, text: string, x: number, y: number, callback: () => void): UIButton;
    getButton(id: string): UIButton | undefined;
    removeButton(id: string): void;
    updateControlDisplay(control: ControlMode): void;
    updatePVPDisplay(isPVP: boolean): void;
    updateArrowDisplay(showArrows: boolean): void;
    updateTargetLineDisplay(showTargetLines: boolean): void;
    updateUnitStatsDisplay(showUnitStats: boolean): void;
    updateUnitCounts(unitCounts: number[]): void;
    addEventListener(eventType: UIEventType, callback: UIEventCallback): void;
    removeEventListener(eventType: UIEventType, callback: UIEventCallback): void;
}
export declare enum UIEventType {
    CONTROL_CHANGED = "control_changed",
    PVP_TOGGLED = "pvp_toggled",
    NEW_UNIT_REQUESTED = "new_unit_requested",
    ARROW_TOGGLED = "arrow_toggled",
    TARGET_LINE_TOGGLED = "target_line_toggled",
    UNIT_STATS_TOGGLED = "unit_stats_toggled",
    BUTTON_CLICKED = "button_clicked"
}
export type UIEventCallback = (event: UIEvent) => void;
export interface UIEvent {
    type: UIEventType;
    timestamp: number;
    buttonId?: string;
    data?: any;
}
export interface UIButton {
    id: string;
    element: any;
    text: string;
    position: IVector;
    visible: boolean;
    enabled: boolean;
    callback: () => void;
    setText(text: string): void;
    setVisible(visible: boolean): void;
    setEnabled(enabled: boolean): void;
    setPosition(x: number, y: number): void;
    destroy(): void;
}
export interface UIPanel {
    id: string;
    position: IVector;
    size: IVector;
    visible: boolean;
    buttons: UIButton[];
    addButton(button: UIButton): void;
    removeButton(buttonId: string): void;
    setVisible(visible: boolean): void;
}
export declare class UISystem implements IUISystem {
    private p;
    private buttons;
    private panels;
    private eventListeners;
    private currentControl;
    private isPVP;
    private showArrows;
    private showTargetLines;
    private showUnitStats;
    private displayWidth;
    constructor(p: p5Instance, displayWidth: number, _displayHeight: number);
    private initializeEventListeners;
    initialize(): void;
    private createDefaultButtons;
    update(_deltaTime: number): void;
    destroy(): void;
    createButton(id: string, text: string, x: number, y: number, callback: () => void): UIButton;
    getButton(id: string): UIButton | undefined;
    removeButton(id: string): void;
    private changeControl;
    private requestNewUnits;
    private togglePVP;
    private toggleArrows;
    private toggleTargetLines;
    private toggleUnitStats;
    updateControlDisplay(control: ControlMode): void;
    updatePVPDisplay(isPVP: boolean): void;
    updateArrowDisplay(showArrows: boolean): void;
    updateTargetLineDisplay(showTargetLines: boolean): void;
    updateUnitStatsDisplay(showUnitStats: boolean): void;
    updateUnitCounts(_unitCounts: number[]): void;
    addEventListener(eventType: UIEventType, callback: UIEventCallback): void;
    removeEventListener(eventType: UIEventType, callback: UIEventCallback): void;
    private triggerEvent;
    getCurrentControl(): ControlMode;
    getIsPVP(): boolean;
    getDisplaySettings(): {
        showArrows: boolean;
        showTargetLines: boolean;
        showUnitStats: boolean;
    };
    updateAllDisplaySettings(settings: {
        isPVP?: boolean;
        showArrows?: boolean;
        showTargetLines?: boolean;
        showUnitStats?: boolean;
    }): void;
    createPanel(id: string, x: number, y: number, width: number, height: number): UIPanel;
    getPanel(id: string): UIPanel | undefined;
    removePanel(id: string): void;
}
//# sourceMappingURL=UISystem.d.ts.map