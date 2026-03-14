import { useState } from 'react';

const PerRoundStats = ({ stats = {}, show = true }) => {
  const currentStats = stats || {
    kills: 2,
    deaths: 1,
    assists: 1,
    headshotPercentage: 67,
    damageDealt: 342,
    utilityUsed: 3,
  };

  if (!show) return null;

  return (
    <div className="per-round-stats">
      <h3>Round Stats</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">K/D/A</span>
          <span className="stat-value">{currentStats.kills}/{currentStats.deaths}/{currentStats.assists}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">HS %</span>
          <span className="stat-value">{currentStats.headshotPercentage}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Damage</span>
          <span className="stat-value">{currentStats.damageDealt}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Utility Used</span>
          <span className="stat-value">{currentStats.utilityUsed}</span>
        </div>
      </div>
      <style jsx>{`
        .per-round-stats {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.85);
          padding: 20px 24px;
          border-radius: 12px;
          min-width: 300px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
        }
        h3 {
          color: #ffd000;
          text-align: center;
          margin-bottom: 16px;
          font-size: 18px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }
        .stat-value {
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default PerRoundStats;
