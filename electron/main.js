import { app, BrowserWindow, ipcMain, screen } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { fileURLToPath } from 'url';
import screenshot from 'screenshot-desktop';
import { initOCREngine, cleanupOCREngine, parseScore, parseCredits, parseTimer, detectSpikePlanted, parseHealthArmor, runFullScreenOCR, extractFromOCRResult, setOCRWhitelist } from './ocrParser.js';
import { calculateAverageConfidence } from './utils.js';
import { generateBuyRecommendations, calculateWinProbability, generateStrategyTips, isDefaultState } from './strategyEngine.js';

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

// Default calibration regions for 2560x1440 resolution (can be modified via UI)
let calibrationRegions = [
  { name: 'Score', x: 1173, y: 13, width: 213, height: 40 },
  { name: 'Round Timer', x: 1227, y: 40, width: 107, height: 40 },
  { name: 'Spike Indicator', x: 1200, y: 80, width: 160, height: 40 },
  { name: 'Health', x: 1227, y: 1373, width: 107, height: 40 },
  { name: 'Armor', x: 1333, y: 1373, width: 107, height: 40 },
  { name: 'Minimap', x: 2133, y: 1067, width: 400, height: 333 },
  { name: 'Team', x: 13, y: 13, width: 200, height: 40 },
  { name: 'Own Credits', x: 2200, y: 13, width: 107, height: 40 },
  { name: 'Team 1 Credits', x: 13, y: 67, width: 93, height: 33 },
  { name: 'Team 2 Credits', x: 13, y: 107, width: 93, height: 33 },
  { name: 'Team 3 Credits', x: 13, y: 147, width: 93, height: 33 },
  { name: 'Team 4 Credits', x: 13, y: 187, width: 93, height: 33 },
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

// Automatic OCR capture loop - optimized to run OCR once per capture (not once per region)
async function startGameStateCapture() {
  console.log('Starting automatic game state capture...');
  currentGameState.ocr_status = 'running';

  // Run capture every 1 second - one OCR per second (9x faster than before)
  setInterval(async () => {
    try {
      // Capture screen once
      const imgBuffer = await screenshot({ format: 'png' });

      // Run OCR once on the full screen
      const fullOcrResult = await runFullScreenOCR(imgBuffer);
      if (!fullOcrResult) return;

      // Extract all regions from the single OCR result
      // Parse score
      const scoreRegion = calibrationRegions.find(r => r.name === 'Score');
      if (scoreRegion) {
        const scoreResult = extractFromOCRResult(fullOcrResult, scoreRegion, parseScore);
        if (scoreResult) {
          // Only update if we got a valid score (prevents flickering)
          if (scoreResult.ourScore !== currentGameState.our_score || scoreResult.enemyScore !== currentGameState.enemy_score) {
            currentGameState.our_score = scoreResult.ourScore;
            currentGameState.enemy_score = scoreResult.enemyScore;
            console.log('Detected score:', scoreResult.ourScore, '-', scoreResult.enemyScore);
          }
        }
      }

      // Parse own credits
      const ownCreditsRegion = calibrationRegions.find(r => r.name === 'Own Credits');
      if (ownCreditsRegion) {
        const creditsResult = extractFromOCRResult(fullOcrResult, ownCreditsRegion, parseCredits);
        if (creditsResult && creditsResult.credits !== currentGameState.economy.ownCredits) {
          currentGameState.economy.ownCredits = creditsResult.credits;
          console.log('Detected own credits:', creditsResult.credits);
        }
      }

      // Parse team credits (4 teammates)
      for (let i = 1; i <= 4; i++) {
        const teamRegion = calibrationRegions.find(r => r.name === `Team ${i} Credits`);
        if (teamRegion) {
          const creditsResult = extractFromOCRResult(fullOcrResult, teamRegion, parseCredits);
          if (creditsResult && creditsResult.credits !== currentGameState.economy.teamCredits[i]) {
            currentGameState.economy.teamCredits[i] = creditsResult.credits;
            console.log(`Detected Team ${i} credits:`, creditsResult.credits);
          }
        }
      }

      // Parse round timer
      const timerRegion = calibrationRegions.find(r => r.name === 'Round Timer');
      if (timerRegion) {
        const timerResult = extractFromOCRResult(fullOcrResult, timerRegion, parseTimer);
        if (timerResult && (timerResult.minutes !== currentGameState.roundTimer.minutes || timerResult.seconds !== currentGameState.roundTimer.seconds)) {
          currentGameState.roundTimer = timerResult;
          console.log('Detected round timer:', `${timerResult.minutes}:${timerResult.seconds.toString().padStart(2, '0')}`);
        }
      }

      // Detect spike planted
      const spikeRegion = calibrationRegions.find(r => r.name === 'Spike Indicator');
      if (spikeRegion) {
        const spikeResult = extractFromOCRResult(fullOcrResult, spikeRegion, detectSpikePlanted);
        if (spikeResult !== null && spikeResult !== currentGameState.spikePlanted) {
          currentGameState.spikePlanted = !!spikeResult;
          if (currentGameState.spikePlanted && currentGameState.roundTimer) {
            // Estimate spike remaining time based on timer
            currentGameState.spikeRemaining = Math.max(0, 45 - (100 - currentGameState.roundTimer.totalSeconds));
            console.log('Spike planted! Remaining:', currentGameState.spikeRemaining);
          } else {
            currentGameState.spikeRemaining = null;
          }
        }
      }

      // Parse health
      const healthRegion = calibrationRegions.find(r => r.name === 'Health');
      if (healthRegion) {
        const healthResult = extractFromOCRResult(fullOcrResult, healthRegion, parseHealthArmor);
        if (healthResult && healthResult.value !== currentGameState.health) {
          currentGameState.health = healthResult.value;
          console.log('Detected health:', healthResult.value);
        }
      }

      // Parse armor
      const armorRegion = calibrationRegions.find(r => r.name === 'Armor');
      if (armorRegion) {
        const armorResult = extractFromOCRResult(fullOcrResult, armorRegion, parseHealthArmor);
        if (armorResult && armorResult.value !== currentGameState.armor) {
          currentGameState.armor = armorResult.value;
          console.log('Detected armor:', armorResult.value);
        }
      }

      // Generate strategy recommendations and win probability only if we have valid data
      // Only regenerate if something actually changed to avoid unnecessary recomputation
      if (!isDefaultState(currentGameState)) {
        const buyRecommendations = generateBuyRecommendations(currentGameState);
        currentGameState.buyRecommendations = buyRecommendations.recommendations;
        currentGameState.winProbability = calculateWinProbability(currentGameState);
        currentGameState.strategyTips = generateStrategyTips(currentGameState);
      } else {
        // Use the strategy engine's default state messages for consistency
        const buyRecommendations = generateBuyRecommendations(currentGameState);
        currentGameState.buyRecommendations = buyRecommendations.recommendations;
        currentGameState.winProbability = calculateWinProbability(currentGameState);
        currentGameState.strategyTips = generateStrategyTips(currentGameState);
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

// IPC: Run OCR on a specific screen region - for calibration testing
ipcMain.handle('run-ocr', async (_, region) => {
  try {
    // Capture screen
    const imgBuffer = await screenshot({ format: 'png' });

    // Determine region type for whitelisting
    let regionType = 'default';
    if (region.name.includes('Credits') || region.name === 'Score' || region.name === 'Health' || region.name === 'Armor') {
      regionType = 'numeric';
    } else if (region.name === 'Round Timer') {
      regionType = 'timer';
    } else if (region.name === 'Spike Indicator') {
      regionType = 'spike';
    }

    const fullOcrResult = await runFullScreenOCR(imgBuffer, regionType);
    if (!fullOcrResult) {
      return { success: false, error: 'OCR failed to process image' };
    }

    const extracted = extractFromOCRResult(fullOcrResult, region, text => text);
    let confidence = 0;

    // Re-run to get confidence by extracting with parser
    if (extracted) {
      const withConfidence = extractFromOCRResult(fullOcrResult, region, t => t);
      confidence = withConfidence?.confidence || 0;
    }

    return {
      success: true,
      text: extracted || '',
      confidence
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

// IPC: Enable mouse interaction (when popup is open)
ipcMain.handle('enable-mouse-interaction', async () => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setFocusable(true);
    mainWindow.focus();
    return { success: true };
  }
  return { success: false, error: 'Main window not found' };
});

// IPC: Disable mouse interaction (when popup is closed)
ipcMain.handle('disable-mouse-interaction', async () => {
  if (mainWindow) {
    // Keep focusable always true so keyboard events (hotkeys) work even when mouse is ignored
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setFocusable(true);
    return { success: true };
  }
  return { success: false, error: 'Main window not found' };
});

// IPC: Set forward mouse events with filter (only allow clicks on non-transparent areas)
ipcMain.handle('set-mouse-filter', async (_, enabled) => {
  if (mainWindow) {
    // When enabled, use forward mode to only pass clicks to non-transparent areas
    // This maintains anti-cheat compliance as transparent areas still pass through
    mainWindow.setIgnoreMouseEvents(enabled, { forward: true });
    return { success: true };
  }
  return { success: false, error: 'Main window not found' };
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

app.on('window-all-closed', async () => {
  await cleanupOCREngine();
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
