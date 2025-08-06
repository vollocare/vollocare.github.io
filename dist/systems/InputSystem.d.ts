import { IVector } from '../types/vector';
export interface IInputSystem {
    update(deltaTime: number): void;
    onMousePressed(mouseX: number, mouseY: number): void;
    getMousePosition(): IVector;
    getWorldMousePosition(viewX: number, viewY: number, displayWidth: number, displayHeight: number): IVector;
    onKeyPressed(keyCode: number): void;
    onKeyReleased(keyCode: number): void;
    isKeyPressed(keyCode: number): boolean;
    getCameraMovement(): IVector;
    setKeyMapping(action: string, keyCode: number): void;
    getKeyMapping(action: string): number | undefined;
    setInputDelay(delay: number): void;
    addEventListener(eventType: InputEventType, callback: InputEventCallback): void;
    removeEventListener(eventType: InputEventType, callback: InputEventCallback): void;
}
export declare enum InputEventType {
    MOUSE_CLICK = "mouse_click",
    MOUSE_MOVE = "mouse_move",
    KEY_DOWN = "key_down",
    KEY_UP = "key_up",
    CAMERA_MOVE = "camera_move"
}
export type InputEventCallback = (event: InputEvent) => void;
export interface InputEvent {
    type: InputEventType;
    timestamp: number;
    mousePosition?: IVector;
    worldPosition?: IVector;
    keyCode?: number;
    movement?: IVector;
}
export interface KeyMapping {
    CAMERA_UP: number;
    CAMERA_DOWN: number;
    CAMERA_LEFT: number;
    CAMERA_RIGHT: number;
    TOGGLE_PVP: number;
    CHANGE_CONTROL: number;
    ADD_UNITS: number;
    TOGGLE_ARROWS: number;
    TOGGLE_TARGET_LINES: number;
    TOGGLE_UNIT_STATS: number;
    TOGGLE_DEBUG: number;
}
export declare const DEFAULT_KEY_MAPPING: KeyMapping;
export declare class InputSystem implements IInputSystem {
    private p;
    private keyMapping;
    private pressedKeys;
    private lastInputTime;
    private inputDelay;
    private eventListeners;
    private mousePosition;
    private lastMousePosition;
    private mousePressed;
    private lastMousePressTime;
    private mouseClickDelay;
    private cameraMovement;
    private cameraMoveSpeed;
    constructor(p: p5Instance, keyMapping?: Partial<KeyMapping>);
    private initializeEventListeners;
    update(_deltaTime: number): void;
    onMousePressed(mouseX: number, mouseY: number): void;
    getMousePosition(): IVector;
    getWorldMousePosition(viewX: number, viewY: number, displayWidth: number, displayHeight: number): IVector;
    onKeyPressed(keyCode: number): void;
    onKeyReleased(keyCode: number): void;
    isKeyPressed(keyCode: number): boolean;
    getCameraMovement(): IVector;
    private updateCameraMovement;
    private handleSpecialKeys;
    setKeyMapping(action: string, keyCode: number): void;
    getKeyMapping(action: string): number | undefined;
    setInputDelay(delay: number): void;
    setCameraMoveSpeed(speed: number): void;
    setMouseClickDelay(delay: number): void;
    addEventListener(eventType: InputEventType, callback: InputEventCallback): void;
    removeEventListener(eventType: InputEventType, callback: InputEventCallback): void;
    private triggerEvent;
    getInputState(): {
        pressedKeys: number[];
        mousePosition: IVector;
        mousePressed: boolean;
        cameraMovement: IVector;
    };
    isMovementKey(keyCode: number): boolean;
    isAnyMovementKeyPressed(): boolean;
    private inputHistory;
    getInputHistory(): InputEvent[];
    clearInputHistory(): void;
}
export declare class InputUtils {
    static keyCodeToString(keyCode: number): string;
    static isNumberKey(keyCode: number): boolean;
    static isLetterKey(keyCode: number): boolean;
    static isFunctionKey(keyCode: number): boolean;
}
//# sourceMappingURL=InputSystem.d.ts.map