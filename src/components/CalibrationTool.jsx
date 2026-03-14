import { useState, useEffect } from 'react';
// import { invoke } from '@tauri-apps/api/core';

const CalibrationTool = ({ show = false, onClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (show) {
      loadSettings();
    }
  }, [show]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // const data = await invoke('get_calibration_settings');
      // Mock settings for now
      const data = {
        screen_width: 1920,
        screen_height: 1080,
        ui_scale: 1.0,
        regions: [
          { name: 'Score', x: 880, y: 10, width: 160, height: 30 },
          { name: 'Health', x: 920, y: 1030, width: 80, height: 30 },
          { name: 'Minimap', x: 1600, y: 800, width: 300, height: 250 },
          { name: 'Team', x: 10, y: 10, width: 150, height: 30 },
          { name: 'Spike Timer', x: 900, y: 50, width: 120, height: 30 }
        ]
      };
      setSettings(data);
    } catch (e) {
      console.error('Failed to load calibration settings:', e);
      setStatus({ type: 'error', message: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const runAutoCalibration = async () => {
    try {
      setStatus({ type: 'info', message: 'Running auto-calibration...' });
      // const data = await invoke('run_auto_calibration');
      // Mock success for now
      setTimeout(() => {
        setStatus({ type: 'success', message: 'Auto-calibration completed!' });
      }, 1500);
    } catch (e) {
      console.error('Auto-calibration failed:', e);
      setStatus({ type: 'error', message: 'Auto-calibration failed' });
    }
  };

  const saveSettings = async () => {
    try {
      setStatus({ type: 'info', message: 'Saving settings...' });
      // await invoke('save_calibration_settings', { settings });
      // Mock success for now
      setTimeout(() => {
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
        setTimeout(() => onClose(), 1500);
      }, 1000);
    } catch (e) {
      console.error('Failed to save settings:', e);
      setStatus({ type: 'error', message: e.toString() });
    }
  };

  const updateRegion = (index, field, value) => {
    const numValue = parseInt(value, 10) || 0;
    const newRegions = [...settings.regions];
    newRegions[index] = { ...newRegions[index], [field]: numValue };
    setSettings({ ...settings, regions: newRegions });
  };

  if (!show) return null;

  return (
    <div className="calibration-tool clickable">
      <div className="calibration-header">
        <h2>Calibration Tool</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="calibration-content">
        {loading ? (
          <div className="loading">Loading settings...</div>
        ) : settings ? (
          <>
            {/* Display Info */}
            <div className="section">
              <h3>Screen Info</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Resolution:</span>
                  <span className="value">{settings.screen_width} × {settings.screen_height}</span>
                </div>
                <div className="info-item">
                  <span className="label">UI Scale:</span>
                  <span className="value">{settings.ui_scale}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="section actions">
              <button className="btn btn-primary" onClick={runAutoCalibration}>
                Run Auto-Calibration
              </button>
              <button className="btn btn-secondary" onClick={saveSettings}>
                Save Settings
              </button>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`status status-${status.type}`}>
                {status.message}
              </div>
            )}

            {/* ROI Regions */}
            <div className="section">
              <h3>ROI Regions (adjust for your screen)</h3>
              <div className="regions-list">
                {settings.regions.map((region, index) => (
                  <div
                    key={region.name}
                    className={`region-item ${selectedRegion === index ? 'selected' : ''}`}
                    onClick={() => setSelectedRegion(index)}
                  >
                    <div className="region-name">{region.name}</div>
                    <div className="region-fields">
                      <div className="field">
                        <label>X:</label>
                        <input
                          type="number"
                          value={region.x}
                          onChange={(e) => updateRegion(index, 'x', e.target.value)}
                          min="0"
                          max={settings.screen_width}
                        />
                      </div>
                      <div className="field">
                        <label>Y:</label>
                        <input
                          type="number"
                          value={region.y}
                          onChange={(e) => updateRegion(index, 'y', e.target.value)}
                          min="0"
                          max={settings.screen_height}
                        />
                      </div>
                      <div className="field">
                        <label>W:</label>
                        <input
                          type="number"
                          value={region.width}
                          onChange={(e) => updateRegion(index, 'width', e.target.value)}
                          min="10"
                          max={settings.screen_width}
                        />
                      </div>
                      <div className="field">
                        <label>H:</label>
                        <input
                          type="number"
                          value={region.height}
                          onChange={(e) => updateRegion(index, 'height', e.target.value)}
                          min="10"
                          max={settings.screen_height}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="section instructions">
              <h3>Calibration Instructions:</h3>
              <ol>
                <li>Run Valorant in fullscreen mode on your main monitor</li>
                <li>Click "Run Auto-Calibration" to automatically detect UI regions</li>
                <li>If auto-calibration is not perfect, adjust the X/Y/Width/Height values manually</li>
                <li>Click "Save Settings" to apply changes</li>
                <li>Regions: Economy (top-right), Kill Feed (bottom-left), Ability Bar (bottom-center), Minimap (top-right)</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="error">Failed to load settings</div>
        )}
      </div>

      <style jsx>{`
        .calibration-tool {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(17, 17, 17, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          font-size: 14px;
          z-index: 9999;
        }
        .calibration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(255, 70, 85, 0.1));
        }
        .calibration-header h2 {
          margin: 0;
          font-size: 20px;
          color: #00d4ff;
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
        .calibration-content {
          padding: 20px 24px;
        }
        .loading, .error {
          padding: 40px;
          text-align: center;
          font-size: 16px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #ffd000;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        .info-item .label {
          color: rgba(255, 255, 255, 0.7);
        }
        .actions {
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        }
        .btn-primary {
          background: #00d4ff;
          color: black;
        }
        .btn-primary:hover {
          background: #00b3e6;
        }
        .btn-secondary {
          background: #00ffaa;
          color: black;
        }
        .btn-secondary:hover {
          background: #00cc88;
        }
        .status {
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        .status-info {
          background: rgba(0, 212, 255, 0.2);
          border: 1px solid #00d4ff;
          color: #00d4ff;
        }
        .status-success {
          background: rgba(0, 255, 170, 0.2);
          border: 1px solid #00ffaa;
          color: #00ffaa;
        }
        .status-error {
          background: rgba(255, 70, 85, 0.2);
          border: 1px solid #ff4655;
          color: #ff4655;
        }
        .regions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .region-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .region-item:hover, .region-item.selected {
          border-color: #00d4ff;
          background: rgba(0, 212, 255, 0.05);
        }
        .region-name {
          font-weight: bold;
          color: #ffd000;
          margin-bottom: 8px;
          text-transform: capitalize;
        }
        .region-fields {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .field label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }
        .field input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 6px 8px;
          color: white;
          font-size: 13px;
          width: 100%;
        }
        .field input:focus {
          outline: none;
          border-color: #00d4ff;
        }
        .instructions ol {
          margin: 0;
          padding-left: 20px;
          line-height: 1.6;
        }
        .instructions li {
          margin-bottom: 6px;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
};

export default CalibrationTool;
