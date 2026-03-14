import { useSettings } from '../contexts/SettingsContext';

const SettingsPanel = () => {
  const { settings, showSettings, setShowSettings, updateSetting, resetSettings } = useSettings();

  if (!showSettings) return null;

  const toggleFeature = (feature) => {
    updateSetting(feature, !settings[feature]);
  };

  return (
    <div className="settings-panel clickable">
      <div className="settings-header">
        <h2>Overlay Settings</h2>
        <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
      </div>

      <div className="settings-section">
        <h3>General</h3>
        <div className="setting-item">
          <label>
            <span>Opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
            />
            <span className="value">{Math.round(settings.opacity * 100)}%</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Enabled Features</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showEconomyAdvisor}
              onChange={() => toggleFeature('showEconomyAdvisor')}
            />
            <span>Economy Advisor</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showBuyRecommendations}
              onChange={() => toggleFeature('showBuyRecommendations')}
            />
            <span>Buy Recommendations</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showStrategyTips}
              onChange={() => toggleFeature('showStrategyTips')}
            />
            <span>Strategy Tips</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showWinProbability}
              onChange={() => toggleFeature('showWinProbability')}
            />
            <span>Win Probability</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showRoundTimer}
              onChange={() => toggleFeature('showRoundTimer')}
            />
            <span>Round Timer</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showAbilityCooldowns}
              onChange={() => toggleFeature('showAbilityCooldowns')}
            />
            <span>Team Ability Cooldowns</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showFPSMonitor}
              onChange={() => toggleFeature('showFPSMonitor')}
            />
            <span>FPS/Ping Monitor</span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.showPerRoundStats}
              onChange={() => toggleFeature('showPerRoundStats')}
            />
            <span>Per-Round Stats</span>
          </label>
        </div>
      </div>

      <div className="settings-footer">
        <button className="reset-btn" onClick={resetSettings}>Reset to Defaults</button>
      </div>

      <style jsx>{`
        .settings-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(17, 17, 17, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 400px;
          max-height: 80vh;
          overflow-y: auto;
          color: white;
          font-size: 14px;
          z-index: 9999;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .settings-header h2 {
          margin: 0;
          font-size: 18px;
          color: #ff4655;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .settings-section {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .settings-section h3 {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: #00d4ff;
        }
        .setting-item {
          margin-bottom: 12px;
        }
        .setting-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .setting-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff4655;
        }
        .setting-item input[type="range"] {
          flex: 1;
          margin: 0 12px;
        }
        .setting-item .value {
          min-width: 40px;
          text-align: right;
          color: rgba(255, 255, 255, 0.7);
        }
        .settings-footer {
          padding: 16px 20px;
          text-align: center;
        }
        .reset-btn {
          background: rgba(255, 70, 85, 0.2);
          border: 1px solid #ff4655;
          color: #ff4655;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }
        .reset-btn:hover {
          background: rgba(255, 70, 85, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SettingsPanel;
