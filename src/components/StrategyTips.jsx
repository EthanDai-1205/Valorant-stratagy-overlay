const StrategyTips = ({ tips }) => {
  // Default tips if none provided
  const displayTips = tips.length > 0 ? tips : [
    "Hold A site long angles",
    "Save smoke for retake",
    "Listen for footsteps on site",
  ];

  return (
    <div className="strategy-tips">
      <h4>Strategy Tips</h4>
      <ul>
        {displayTips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
      <style jsx>{`
        .strategy-tips {
          position: absolute;
          bottom: 120px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          min-width: 220px;
        }
        h4 {
          margin-bottom: 8px;
          color: #00ffaa;
          font-size: 14px;
        }
        ul {
          list-style: none;
        }
        li {
          margin-bottom: 4px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default StrategyTips;
