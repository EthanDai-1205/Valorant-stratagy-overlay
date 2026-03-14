import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from './contexts/SettingsContext';
import Overlay from './components/Overlay';
import EconomyAdvisor from './components/EconomyAdvisor';
import StrategyTips from './components/StrategyTips';
import WinProbability from './components/WinProbability';
import BuyRecommendations from './components/BuyRecommendations';
import RoundTimer from './components/RoundTimer';
import AbilityCooldownOverlay from './components/AbilityCooldownOverlay';
import FPSMonitor from './components/FPSMonitor';
import PerRoundStats from './components/PerRoundStats';
import SettingsPanel from './components/SettingsPanel';
import PostMatchSummary from './components/PostMatchSummary';
import CalibrationTool from './components/CalibrationTool';

function App() {
  const { settings, setShowSettings } = useSettings();
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
    teamAbilityCooldowns: [],
    roundStats: {},
    showRoundStats: false,
  });
  const [showPostMatch, setShowPostMatch] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    // Fetch game state from Tauri backend every 100ms
    const interval = setInterval(async () => {
      try {
        const state = await invoke('get_game_state');
        setGameState(state);
      } catch (e) {
        console.error('Failed to fetch game state:', e);
        // Fallback to mock update if backend not available
        setGameState(prev => ({
          ...prev,
          winProbability: Math.random(),
        }));
      }
    }, 100);

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

        {settings.showAbilityCooldowns && (
          <div style={settings.positions.abilityCooldowns}>
            <AbilityCooldownOverlay teamCooldowns={gameState.teamAbilityCooldowns} />
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
      </Overlay>
    </div>
  );
}

export default App;
