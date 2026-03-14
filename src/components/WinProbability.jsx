const WinProbability = ({ probability }) => {
  const percentage = Math.round(probability * 100);
  const getColor = () => {
    if (percentage >= 60) return "#00ffaa";
    if (percentage >= 40) return "#ffd000";
    return "#ff4655";
  };

  return (
    <div className="win-probability">
      <div className="label">Win Chance</div>
      <div className="percentage" style={{ color: getColor() }}>
        {percentage}%
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
      <style jsx>{`
        .win-probability {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          min-width: 180px;
        }
        .label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }
        .percentage {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default WinProbability;
