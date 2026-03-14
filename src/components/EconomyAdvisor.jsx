const EconomyAdvisor = ({ economy }) => {
  const recommendBuy = () => {
    if (economy.ownCredits >= 3900) {
      return "Full buy: Vandal/Phantom + Full armor + Utility";
    } else if (economy.ownCredits >= 2000) {
      return "Half buy: Spectre/Guardian + Light armor + Partial utility";
    } else if (economy.ownCredits >= 1000) {
      return "Eco save: Ghost/Marshal + Light armor";
    } else {
      return "Full eco: Only pistol + No armor";
    }
  };

  return (
    <div className="economy-advisor">
      <div className="credits">
        Credits: {economy.ownCredits}₡
      </div>
      <div className="recommendation">
        {recommendBuy()}
      </div>
      <style jsx>{`
        .economy-advisor {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          min-width: 250px;
        }
        .credits {
          font-weight: bold;
          margin-bottom: 6px;
          color: #ff4655;
        }
        .recommendation {
          font-size: 13px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default EconomyAdvisor;
