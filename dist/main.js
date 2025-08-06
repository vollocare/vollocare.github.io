// 遊戲應用程式主入口
import { Game } from './Game';
// 全域遊戲實例
let game;
// 頁面載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    console.log('開始初始化 TypeScript 重構版本...');
    // 創建遊戲實例
    game = new Game();
    // 檢查初始化狀態
    const checkInit = () => {
        if (game.isInitialized()) {
            console.log('✅ 遊戲初始化完成');
            console.log('✅ p5.js Instance Mode 運行中');
            console.log('✅ GameSketch 架構已就緒');
        }
        else {
            setTimeout(checkInit, 100);
        }
    };
    checkInit();
});
// 全域遊戲控制函數
window.gameControls = {
    pause: () => game?.pause(),
    resume: () => game?.resume(),
    reset: () => game?.reset(),
    getSketch: () => game?.getGameSketch()
};
// 頁面卸載時清理資源
window.addEventListener('beforeunload', () => {
    game?.destroy();
});
//# sourceMappingURL=main.js.map