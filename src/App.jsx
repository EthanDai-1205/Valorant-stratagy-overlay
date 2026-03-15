import { useState, useEffect } from 'react';
import { useSettings } from './contexts/SettingsContext';
import Overlay from './components/Overlay';
import EconomyAdvisor from './components/EconomyAdvisor';
import StrategyTips from './components/StrategyTips';
import WinProbability from './components/WinProbability';
import BuyRecommendations from './components/BuyRecommendations';
import RoundTimer from './components/RoundTimer';
import FPSMonitor from './components/FPSMonitor';
import PerRoundStats from './components/PerRoundStats';
import SettingsPanel from './components/SettingsPanel';
import PostMatchSummary from './components/PostMatchSummary';
import CalibrationTool from './components/CalibrationTool';
import ControlPanel from './components/ControlPanel';

function App() {
  const { settings, setShowSettings, showSettings } = useSettings();
  const [gameState, setGameState] = useState({
    round: 1,
    economy: {
      ownCredits: 800,
      teamCredits: [800, 800, 800, 800, 800],
      enemyCredits: [800, 800, 800, 800, 800],
    },
    winProbability: 0.5,
    strategyTips: [],
    buyRecommendations: [],
    roundStats: {},
    showRoundStats: false,
  });
  const [showPostMatch, setShowPostMatch] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(true); // Show on launch by default
  const [popupOpen, setPopupOpen] = useState(true); // Track if any popup is open

  // Track if any popup is open
  useEffect(() => {
    const anyPopupOpen = showSettings || showPostMatch || showCalibration || showControlPanel;
    setPopupOpen(anyPopupOpen);
  }, [showSettings, showPostMatch, showCalibration, showControlPanel]);

  // Manage mouse interaction based on popup state
  useEffect(() => {
    const updateMouseInteraction = async () => {
      try {
        if (popupOpen) {
          // When popup is open: enable full mouse interaction for the window
          await window.electronAPI.enableMouseInteraction();
          // Set CSS to allow pointer events on the app container
          document.body.style.pointerEvents = 'auto';
        } else {
          // When no popups are open: make window click-through for anti-cheat compliance
          await window.electronAPI.disableMouseInteraction();
          // Set CSS to prevent pointer events on the app container
          document.body.style.pointerEvents = 'none';
        }
      } catch (e) {
        console.error('Failed to update mouse interaction:', e);
      }
    };

    updateMouseInteraction();
  }, [popupOpen]);

  useEffect(() => {
    // Fetch game state from Tauri backend every 100ms
    const interval = setInterval(async () => {
      try {
        const state = await window.electronAPI.getGameState();
        setGameState(state);
      } catch (e) {
        console.error('Failed to fetch game state:', e);
        // Don't randomize win probability - keep last valid value
      }
    }, 1000); // Reduced to 1s from 100ms to reduce CPU usage

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Open settings: Ctrl+Shift+S / Cmd+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      // Open post-match analysis: Ctrl+Shift+M / Cmd+Shift+M
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setShowPostMatch(prev => !prev);
      }
      // Open calibration tool: Ctrl+Shift+C / Cmd+Shift+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setShowCalibration(prev => !prev);
      }
      // Open control panel: Ctrl+Shift+P / Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowControlPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowSettings]);

  return (
    <div style={{ opacity: settings.opacity }}>
      <Overlay>
        {settings.showEconomyAdvisor && (
          <div style={settings.positions.economyAdvisor}>
            <EconomyAdvisor economy={gameState.economy} />
          </div>
        )}

        {settings.showBuyRecommendations && (
          <div style={settings.positions.buyRecommendations}>
            <BuyRecommendations recommendations={gameState.buyRecommendations} />
          </div>
        )}

        {settings.showStrategyTips && (
          <div style={settings.positions.strategyTips}>
            <StrategyTips tips={gameState.strategyTips} />
          </div>
        )}

        {settings.showWinProbability && (
          <div style={settings.positions.winProbability}>
            <WinProbability probability={gameState.winProbability} />
          </div>
        )}

        {settings.showRoundTimer && (
          <div style={settings.positions.roundTimer}>
            <RoundTimer />
          </div>
        )}


        {settings.showFPSMonitor && (
          <div style={settings.positions.fpsMonitor}>
            <FPSMonitor />
          </div>
        )}

        {settings.showPerRoundStats && (
          <PerRoundStats stats={gameState.roundStats} show={gameState.showRoundStats} />
        )}

        <SettingsPanel />
        <PostMatchSummary show={showPostMatch} onClose={() => setShowPostMatch(false)} />
        <CalibrationTool show={showCalibration} onClose={() => setShowCalibration(false)} />
        <ControlPanel
          show={showControlPanel}
          onClose={() => setShowControlPanel(false)}
          onOpenCalibration={() => {
            setShowCalibration(true);
            setShowControlPanel(false);
          }}
          onOpenSettings={() => {
            setShowSettings(true);
            setShowControlPanel(false);
          }}
          onOpenPostMatch={() => {
            setShowPostMatch(true);
            setShowControlPanel(false);
          }}
        />
      </Overlay>
    </div>
  );
}

export default App;
