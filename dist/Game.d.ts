import { GameSketch } from './sketch/GameSketch';
export declare class Game {
    private gameSketch;
    private p5Instance;
    constructor();
    private init;
    pause(): void;
    resume(): void;
    reset(): void;
    getGameSketch(): GameSketch | null;
    isInitialized(): boolean;
    destroy(): void;
}
//# sourceMappingURL=Game.d.ts.map