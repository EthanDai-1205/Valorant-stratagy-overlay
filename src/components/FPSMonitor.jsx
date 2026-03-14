import { useState, useEffect } from 'react';

const FPSMonitor = () => {
  const [fps, setFps] = useState(144);
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    // TODO: Get actual FPS/latency from Tauri backend or system
    const interval = setInterval(() => {
      setFps(Math.floor(130 + Math.random() * 30));
      setLatency(Math.floor(8 + Math.random() * 15));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getFpsColor = () => {
    if (fps >= 144) return '#00ffaa';
    if (fps >= 60) return '#ffd000';
    return '#ff4655';
  };

  const getLatencyColor = () => {
    if (latency <= 20) return '#00ffaa';
    if (latency <= 50) return '#ffd000';
    return '#ff4655';
  };

  return (
    <div className="fps-monitor">
      <div className="metric">
        <span className="label">FPS:</span>
        <span className="value" style={{ color: getFpsColor() }}>{fps}</span>
      </div>
      <div className="metric">
        <span className="label">PING:</span>
        <span className="value" style={{ color: getLatencyColor() }}>{latency}ms</span>
      </div>
      <style jsx>{`
        .fps-monitor {
          position: absolute;
          top: 20px;
          left: 200px;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          gap: 16px;
        }
        .metric {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }
        .value {
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default FPSMonitor;
