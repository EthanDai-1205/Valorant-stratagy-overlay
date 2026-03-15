import { useState } from 'react';

const ControlPanel = ({ show = true, onClose, onOpenCalibration, onOpenSettings, onOpenPostMatch }) => {
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [captureRunning, setCaptureRunning] = useState(true);
  const [autoStartOnBoot, setAutoStartOnBoot] = useState(false);
  const [showOnLaunch, setShowOnLaunch] = useState(true);

  if (!show) return null;

  return (
    <div className="control-panel clickable">
      <div className="panel-header">
        <div className="panel-logo">
          <div className="logo-icon">🎯</div>
          <h2>Valorant Strategy Overlay</h2>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="panel-content">
        {/* Status Section */}
        <div className="section">
          <div className="section-header">
            <h3>Status</h3>
            <div className={`status-indicator ${captureRunning ? 'online' : 'offline'}`}>
              {captureRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">Resolution:</span>
              <span className="value">2560 × 1440</span>
            </div>
            <div className="status-item">
              <span className="label">OCR Engine:</span>
              <span className="value online">Ready</span>
            </div>
            <div className="status-item">
              <span className="label">Last Capture:</span>
              <span className="value">0.2s ago</span>
            </div>
            <div className="status-item">
              <span className="label">Overlay:</span>
              <span className={`value ${overlayEnabled ? 'online' : 'offline'}`}>
                {overlayEnabled ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn primary" onClick={onOpenCalibration}>
              <span className="btn-icon">📐</span>
              Calibration Tool
            </button>
            <button className="action-btn secondary" onClick={onOpenSettings}>
              <span className="btn-icon">⚙️</span>
              Settings
            </button>
            <button className="action-btn secondary" onClick={onOpenPostMatch}>
              <span className="btn-icon">📊</span>
              Post-Match Analysis
            </button>
            <button
              className={`action-btn ${captureRunning ? 'danger' : 'success'}`}
              onClick={() => setCaptureRunning(prev => !prev)}
            >
              <span className="btn-icon">{captureRunning ? '⏸️' : '▶️'}</span>
              {captureRunning ? 'Pause Capture' : 'Start Capture'}
            </button>
            <button
              className={`action-btn ${overlayEnabled ? 'warning' : 'success'}`}
              onClick={() => setOverlayEnabled(prev => !prev)}
            >
              <span className="btn-icon">{overlayEnabled ? '👁️' : '👁️‍🗨️'}</span>
              {overlayEnabled ? 'Hide Overlay' : 'Show Overlay'}
            </button>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="section">
          <h3>Features</h3>
          <div className="toggles-list">
            <div className="toggle-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Real-time OCR Capture</span>
              </label>
            </div>
            <div className="toggle-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Strategy Recommendations</span>
              </label>
            </div>
            <div className="toggle-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Buy Recommendations</span>
              </label>
            </div>
            <div className="toggle-item">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Win Probability Display</span>
              </label>
            </div>
            <div className="toggle-item">
              <label>
                <input type="checkbox" checked={autoStartOnBoot} onChange={(e) => setAutoStartOnBoot(e.target.checked)} />
                <span>Start on System Boot</span>
              </label>
            </div>
            <div className="toggle-item">
              <label>
                <input type="checkbox" checked={showOnLaunch} onChange={(e) => setShowOnLaunch(e.target.checked)} />
                <span>Show this panel on launch</span>
              </label>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="section info">
          <p>v1.0.2 | 2560x1440 Configured | Anti-Cheat Compliant</p>
          <p className="small">Hotkeys: Ctrl+Shift+C (Calibrate) | Ctrl+Shift+S (Settings) | Ctrl+Shift+M (Analysis)</p>
        </div>
      </div>

      <style jsx>{`
        .control-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(255, 70, 85, 0.1));
        }
        .panel-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          font-size: 28px;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 18px;
          color: #00d4ff;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .panel-content {
          padding: 24px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .section h3 {
          margin: 0;
          font-size: 16px;
          color: #ffd000;
        }
        .status-indicator {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-indicator.online {
          background: rgba(0, 255, 170, 0.2);
          color: #00ffaa;
          border: 1px solid #00ffaa;
        }
        .status-indicator.offline {
          background: rgba(255, 70, 85, 0.2);
          color: #ff4655;
          border: 1px solid #ff4655;
        }
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 10px;
        }
        .status-item {
          display: flex;
          justify-content: space-between;
        }
        .status-item .label {
          color: rgba(255, 255, 255, 0.6);
        }
        .status-item .value.online {
          color: #00ffaa;
        }
        .status-item .value.offline {
          color: #ff4655;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }
        .action-btn:hover {
          transform: translateY(-2px);
        }
        .action-btn.primary {
          background: #00d4ff;
          color: black;
        }
        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .action-btn.success {
          background: #00ffaa;
          color: black;
        }
        .action-btn.danger {
          background: #ff4655;
          color: white;
        }
        .action-btn.warning {
          background: #ffd000;
          color: black;
        }
        .btn-icon {
          font-size: 20px;
        }
        .toggles-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toggle-item label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 8px 0;
        }
        .toggle-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .info {
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
        }
        .info p {
          margin: 0 0 8px 0;
        }
        .info .small {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;
