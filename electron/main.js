import { app, BrowserWindow, ipcMain, screen } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { fileURLToPath } from 'url';
import screenshot from 'screenshot-desktop';
import { initOCREngine, parseScore, runOCRAndParse } from './ocrParser.js';

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
  alive_teammates: [],
  alive_enemies: [],
  spike_remaining: null,
  predicted_enemy_positions: [],
  strategy_recommendations: [],
  ocr_status: 'initializing'
};

// Default calibration regions (can be modified via UI)
let calibrationRegions = [
  { name: 'Score', x: 880, y: 10, width: 160, height: 30 },
  { name: 'Health', x: 920, y: 1030, width: 80, height: 30 },
  { name: 'Minimap', x: 1600, y: 800, width: 300, height: 250 },
  { name: 'Team', x: 10, y: 10, width: 150, height: 30 },
  { name: 'Spike Timer', x: 900, y: 50, width: 120, height: 30 }
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
