const AbilityCooldownOverlay = ({ teamCooldowns = [] }) => {
  // Default cooldowns if no data
  const cooldowns = teamCooldowns.length > 0 ? teamCooldowns : [
    { q: 0, e: 8, c: 0, x: 45 },
    { q: 12, e: 0, c: 3, x: 0 },
    { q: 0, e: 0, c: 0, x: 60 },
    { q: 4, e: 0, c: 15, x: 20 },
    { q: 0, e: 7, c: 0, x: 0 },
  ];

  return (
    <div className="ability-cooldowns">
      <h4>Team Abilities</h4>
      <div className="players">
        {cooldowns.map((cds, index) => (
          <div key={index} className="player-cooldowns">
            <div className="player-index">{index + 1}</div>
            <div className="abilities">
              <div className={`ability ${cds.q === 0 ? 'ready' : ''}`}>
                {cds.q > 0 ? cds.q : 'Q'}
              </div>
              <div className={`ability ${cds.e === 0 ? 'ready' : ''}`}>
                {cds.e > 0 ? cds.e : 'E'}
              </div>
              <div className={`ability ${cds.c === 0 ? 'ready' : ''}`}>
                {cds.c > 0 ? cds.c : 'C'}
              </div>
              <div className={`ability ultimate ${cds.x === 0 ? 'ready' : ''}`}>
                {cds.x > 0 ? cds.x : 'X'}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .ability-cooldowns {
          position: absolute;
          bottom: 120px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
        }
        h4 {
          color: #00d4ff;
          margin-bottom: 8px;
          font-size: 13px;
          text-align: center;
        }
        .players {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .player-cooldowns {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .player-index {
          width: 16px;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-weight: bold;
        }
        .abilities {
          display: flex;
          gap: 4px;
        }
        .ability {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 11px;
        }
        .ability.ready {
          background: rgba(0, 255, 170, 0.3);
          border-color: #00ffaa;
          color: #00ffaa;
        }
        .ability.ultimate.ready {
          background: rgba(255, 208, 0, 0.3);
          border-color: #ffd000;
          color: #ffd000;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default AbilityCooldownOverlay;
