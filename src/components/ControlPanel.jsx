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
          background: linear-gradient(135deg, #0f0f12 0%, #1a1a20 100%);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 20px;
          width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          font-size: 14px;
          z-index: 10000;
          box-shadow:
            0 0 40px rgba(0, 212, 255, 0.15),
            0 30px 80px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          animation: panelFadeIn 0.3s ease-out;
          backdrop-filter: blur(20px);
        }

        @keyframes panelFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.1);
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.08), rgba(255, 70, 85, 0.08));
          border-radius: 20px 20px 0 0;
        }

        .panel-logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00d4ff 0%, #ff4655 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(90deg, #00d4ff, #00ffaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.3px;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 70, 85, 0.2);
          border-color: rgba(255, 70, 85, 0.4);
          transform: scale(1.05);
        }

        .panel-content {
          padding: 28px;
        }

        .section {
          margin-bottom: 28px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffd000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator.online {
          background: rgba(0, 255, 170, 0.15);
          color: #00ffaa;
          border: 1px solid rgba(0, 255, 170, 0.4);
          box-shadow: 0 0 12px rgba(0, 255, 170, 0.2);
        }

        .status-indicator.offline {
          background: rgba(255, 70, 85, 0.15);
          color: #ff4655;
          border: 1px solid rgba(255, 70, 85, 0.4);
          box-shadow: 0 0 12px rgba(255, 70, 85, 0.2);
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          background: rgba(255, 255, 255, 0.03);
          padding: 20px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-item .label {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          font-size: 13px;
        }

        .status-item .value {
          font-weight: 600;
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
          gap: 14px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 18px 14px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .action-btn:hover::before {
          left: 100%;
        }

        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          color: black;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }

        .action-btn.primary:hover {
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }

        .action-btn.secondary {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn.secondary:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          border-color: rgba(0, 212, 255, 0.3);
        }

        .action-btn.success {
          background: linear-gradient(135deg, #00ffaa 0%, #00cc88 100%);
          color: black;
          box-shadow: 0 4px 15px rgba(0, 255, 170, 0.3);
        }

        .action-btn.success:hover {
          box-shadow: 0 6px 20px rgba(0, 255, 170, 0.4);
        }

        .action-btn.danger {
          background: linear-gradient(135deg, #ff4655 0%, #cc2936 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 70, 85, 0.3);
        }

        .action-btn.danger:hover {
          box-shadow: 0 6px 20px rgba(255, 70, 85, 0.4);
        }

        .action-btn.warning {
          background: linear-gradient(135deg, #ffd000 0%, #e6b800 100%);
          color: black;
          box-shadow: 0 4px 15px rgba(255, 208, 0, 0.3);
        }

        .action-btn.warning:hover {
          box-shadow: 0 6px 20px rgba(255, 208, 0, 0.4);
        }

        .btn-icon {
          font-size: 24px;
        }

        .toggles-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .toggle-item {
          background: rgba(255, 255, 255, 0.03);
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .toggle-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 212, 255, 0.2);
        }

        .toggle-item label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-weight: 500;
        }

        .toggle-item input[type="checkbox"] {
          appearance: none;
          width: 44px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .toggle-item input[type="checkbox"]:checked {
          background: linear-gradient(90deg, #00d4ff, #00ffaa);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }

        .toggle-item input[type="checkbox"]::before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-item input[type="checkbox"]:checked::before {
          left: 22px;
        }

        .info {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(255, 70, 85, 0.03) 100%);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
        }

        .info p {
          margin: 0 0 10px 0;
          font-weight: 500;
        }

        .info .small {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          letter-spacing: 0.3px;
        }

        /* Scrollbar styling */
        .control-panel::-webkit-scrollbar {
          width: 8px;
        }

        .control-panel::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0 20px 20px 0;
        }

        .control-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 4px;
        }

        .control-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;
