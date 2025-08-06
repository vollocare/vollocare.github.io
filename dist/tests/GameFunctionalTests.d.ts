import { GameManager } from '../core/GameManager';
export interface TestResult {
    name: string;
    passed: boolean;
    message: string;
    duration: number;
    details?: any;
}
export interface TestSuite {
    name: string;
    tests: TestResult[];
    passed: boolean;
    duration: number;
}
export declare class GameFunctionalTests {
    private gameManager;
    private p;
    private testResults;
    constructor(gameManager: GameManager, p: p5Instance);
    runAllTests(): Promise<Map<string, TestSuite>>;
    private runUnitTests;
    private testUnitCreation;
    private testUnitMovement;
    private testUnitAttack;
    private testUnitDeath;
    private testUnitStateMachine;
    private runGroupUnitTests;
    private testGroupUnitCreation;
    private testGroupUnitDestination;
    private testGroupUnitLeadership;
    private runGameManagerTests;
    private testGameManagerInitialization;
    private testControlModeSwitch;
    private testPauseResume;
    private runInputSystemTests;
    private runRenderSystemTests;
    private runCollisionTests;
    private runPVPTests;
    private testPVPModeToggle;
    private createTestSuite;
    private finalizeTestSuite;
    private generateTestReport;
    private delay;
}
//# sourceMappingURL=GameFunctionalTests.d.ts.map