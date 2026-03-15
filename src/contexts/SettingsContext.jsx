import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  opacity: 0.85,
  showEconomyAdvisor: true,
  showBuyRecommendations: true,
  showStrategyTips: true,
  showWinProbability: true,
  showRoundTimer: true,
  showFPSMonitor: true,
  showPerRoundStats: true,
  positions: {
    economyAdvisor: { top: 20, right: 20 },
    buyRecommendations: { top: 100, right: 20 },
    strategyTips: { bottom: 120, left: 20 },
    winProbability: { top: 20, left: 20 },
    roundTimer: { top: 20, left: '50%' },
    fpsMonitor: { top: 20, left: 200 },
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('overlay-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to local storage when changed
  useEffect(() => {
    localStorage.setItem('overlay-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePosition = (component, position) => {
    setSettings(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [component]: {
          ...prev.positions[component],
          ...position,
        },
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      showSettings,
      setShowSettings,
      updateSetting,
      updatePosition,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
