import { app, BrowserWindow, ipcMain, screen } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { fileURLToPath } from 'url';
import screenshot from 'screenshot-desktop';
import { initOCREngine, parseScore, parseCredits, parseTimer, detectSpikePlanted, parseHealthArmor, runOCRAndParse } from './ocrParser.js';
import { generateBuyRecommendations, calculateWinProbability, generateStrategyTips } from './strategyEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let currentGameState = {
  last_capture_time: new Date().toISOString(),
  current_map: null,
  current_team: null,
  our_score: 0,
  enemy_score: 0,
  round_number: 1,
  economy: {
    ownCredits: 800,
    teamCredits: [800, 800, 800, 800, 800],
    enemyCredits: [800, 800, 800, 800, 800],
  },
  roundTimer: { minutes: 1, seconds: 45, totalSeconds: 105 },
  spikePlanted: false,
  spikeRemaining: 45,
  health: 100,
  armor: 0,
  winProbability: 0.5,
  strategyTips: [],
  buyRecommendations: [],
  alive_teammates: [],
  alive_enemies: [],
  predicted_enemy_positions: [],
  ocr_status: 'initializing'
};

// Default calibration regions (can be modified via UI)
let calibrationRegions = [
  { name: 'Score', x: 880, y: 10, width: 160, height: 30 },
  { name: 'Round Timer', x: 920, y: 30, width: 80, height: 30 },
  { name: 'Spike Indicator', x: 900, y: 60, width: 120, height: 30 },
  { name: 'Health', x: 920, y: 1030, width: 80, height: 30 },
  { name: 'Armor', x: 1000, y: 1030, width: 80, height: 30 },
  { name: 'Minimap', x: 1600, y: 800, width: 300, height: 250 },
  { name: 'Team', x: 10, y: 10, width: 150, height: 30 },
  { name: 'Own Credits', x: 1650, y: 10, width: 80, height: 30 },
  { name: 'Team 1 Credits', x: 10, y: 50, width: 70, height: 25 },
  { name: 'Team 2 Credits', x: 10, y: 80, width: 70, height: 25 },
  { name: 'Team 3 Credits', x: 10, y: 110, width: 70, height: 25 },
  { name: 'Team 4 Credits', x: 10, y: 140, width: 70, height: 25 },
];

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Make window click-through (anti-cheat compliant - no input interference)
  mainWindow.setIgnoreMouseEvents(true);

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:1420');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Keep window on top of all other windows including fullscreen games
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Automatic OCR capture loop
async function startGameStateCapture() {
  console.log('Starting automatic game state capture...');
  currentGameState.ocr_status = 'running';

  // Run capture every 1 second
  setInterval(async () => {
    try {
      // Capture screen
      const imgBuffer = await screenshot({ format: 'png' });

      // Parse score
      const scoreRegion = calibrationRegions.find(r => r.name === 'Score');
      if (scoreRegion) {
        const scoreResult = await runOCRAndParse(imgBuffer, scoreRegion, parseScore);
        if (scoreResult) {
          currentGameState.our_score = scoreResult.ourScore;
          currentGameState.enemy_score = scoreResult.enemyScore;
          console.log('Detected score:', scoreResult.ourScore, '-', scoreResult.enemyScore);
        }
      }

      // Parse own credits
      const ownCreditsRegion = calibrationRegions.find(r => r.name === 'Own Credits');
      if (ownCreditsRegion) {
        const creditsResult = await runOCRAndParse(imgBuffer, ownCreditsRegion, parseCredits, '0123456789');
        if (creditsResult) {
          currentGameState.economy.ownCredits = creditsResult.credits;
          console.log('Detected own credits:', creditsResult.credits);
        }
      }

      // Parse team credits (4 teammates)
      for (let i = 1; i <= 4; i++) {
        const teamRegion = calibrationRegions.find(r => r.name === `Team ${i} Credits`);
        if (teamRegion) {
          const creditsResult = await runOCRAndParse(imgBuffer, teamRegion, parseCredits, '0123456789');
          if (creditsResult) {
            currentGameState.economy.teamCredits[i] = creditsResult.credits;
            console.log(`Detected Team ${i} credits:`, creditsResult.credits);
          }
        }
      }

      // Parse round timer
      const timerRegion = calibrationRegions.find(r => r.name === 'Round Timer');
      if (timerRegion) {
        const timerResult = await runOCRAndParse(imgBuffer, timerRegion, parseTimer, '0123456789:');
        if (timerResult) {
          currentGameState.roundTimer = timerResult;
          console.log('Detected round timer:', `${timerResult.minutes}:${timerResult.seconds.toString().padStart(2, '0')}`);
        }
      }

      // Detect spike planted
      const spikeRegion = calibrationRegions.find(r => r.name === 'Spike Indicator');
      if (spikeRegion) {
        const spikeResult = await runOCRAndParse(imgBuffer, spikeRegion, (text) => detectSpikePlanted(text), 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ');
        if (spikeResult) {
          currentGameState.spikePlanted = true;
          // Estimate spike remaining time based on timer
          currentGameState.spikeRemaining = Math.max(0, 45 - (100 - currentGameState.roundTimer.totalSeconds));
          console.log('Spike planted! Remaining:', currentGameState.spikeRemaining);
        } else {
          currentGameState.spikePlanted = false;
          currentGameState.spikeRemaining = null;
        }
      }

      // Parse health
      const healthRegion = calibrationRegions.find(r => r.name === 'Health');
      if (healthRegion) {
        const healthResult = await runOCRAndParse(imgBuffer, healthRegion, parseHealthArmor, '0123456789');
        if (healthResult) {
          currentGameState.health = healthResult.value;
          console.log('Detected health:', healthResult.value);
        }
      }

      // Parse armor
      const armorRegion = calibrationRegions.find(r => r.name === 'Armor');
      if (armorRegion) {
        const armorResult = await runOCRAndParse(imgBuffer, armorRegion, parseHealthArmor, '0123456789');
        if (armorResult) {
          currentGameState.armor = armorResult.value;
          console.log('Detected armor:', armorResult.value);
        }
      }

      // Generate strategy recommendations and win probability
      const buyRecommendations = generateBuyRecommendations(currentGameState);
      currentGameState.buyRecommendations = buyRecommendations.recommendations;
      currentGameState.winProbability = calculateWinProbability(currentGameState);
      currentGameState.strategyTips = generateStrategyTips(currentGameState);

      currentGameState.last_capture_time = new Date().toISOString();
    } catch (e) {
      console.error('Capture loop error:', e);
    }
  }, 1000);
}

// IPC: Get game state from backend
ipcMain.handle('get-game-state', async () => {
  return { ...currentGameState };
});

// IPC: Update calibration regions from UI
ipcMain.handle('update-calibration-regions', async (_, regions) => {
  calibrationRegions = regions;
  return { success: true };
});

// IPC: Capture entire screen or specific region
ipcMain.handle('capture-screen', async (_, region = null) => {
  try {
    const imgBuffer = await screenshot({ format: 'png' });
    return { success: true, data: imgBuffer.toString('base64') };
  } catch (e) {
    console.error('Screen capture failed:', e);
    return { success: false, error: e.message };
  }
});

// IPC: Run OCR on a specific screen region
ipcMain.handle('run-ocr', async (_, region) => {
  try {
    if (!ocrWorker) {
      return { success: false, error: 'OCR worker not initialized' };
    }

    // Capture screen and run OCR
    const imgBuffer = await screenshot({ format: 'png' });
    const { data: { text } } = await ocrWorker.recognize(imgBuffer, region ? {
      rectangle: {
        left: region.x,
        top: region.y,
        width: region.width,
        height: region.height
      }
    } : {});

    return {
      success: true,
      text: text.trim(),
      confidence: ocrWorker.lastResult?.confidence || 0
    };
  } catch (e) {
    console.error('OCR failed:', e);
    return { success: false, error: e.message };
  }
});

// IPC: Test OCR calibration for a specific region
ipcMain.handle('test-region-ocr', async (_, region) => {
  try {
    const result = await ipcMain.handlers['run-ocr'](_, region);
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

app.whenReady().then(async () => {
  const ocrReady = await initOCREngine();
  if (ocrReady) {
    currentGameState.ocr_status = 'ready';
    startGameStateCapture();
  } else {
    currentGameState.ocr_status = 'failed';
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Disable hardware acceleration if causing transparency issues
// app.disableHardwareAcceleration();
