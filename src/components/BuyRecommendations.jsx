const BuyRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const ownRecommendation = recommendations[0]; // First recommendation is for current player

  return (
    <div className="buy-recommendations">
      <h4>Recommended Buy</h4>
      <div className="buy-items">
        <div className="buy-item">
          <span className="label">Weapon:</span>
          <span className="value">{ownRecommendation.weapon}</span>
        </div>
        <div className="buy-item">
          <span className="label">Armor:</span>
          <span className="value">{ownRecommendation.armor}</span>
        </div>
        <div className="buy-item">
          <span className="label">Abilities:</span>
          <span className="value">{ownRecommendation.abilities.join(', ')}</span>
        </div>
        <div className="buy-item total">
          <span className="label">Total:</span>
          <span className="value">{ownRecommendation.total_cost}₡</span>
        </div>
      </div>
      <style jsx>{`
        .buy-recommendations {
          position: absolute;
          top: 100px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          min-width: 250px;
        }
        h4 {
          margin-bottom: 8px;
          color: #ffd000;
          font-size: 14px;
        }
        .buy-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .buy-item {
          display: flex;
          justify-content: space-between;
        }
        .label {
          opacity: 0.8;
        }
        .value {
          font-weight: 500;
        }
        .total {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .total .value {
          color: #ff4655;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default BuyRecommendations;
