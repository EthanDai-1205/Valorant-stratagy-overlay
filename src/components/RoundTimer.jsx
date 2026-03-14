import { useState, useEffect } from 'react';

const RoundTimer = ({ roundTime = 100 }) => {
  const [timeLeft, setTimeLeft] = useState(roundTime);

  useEffect(() => {
    // TODO: Sync with actual round time from OCR detection
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 100;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (timeLeft > 30) return '#00ffaa';
    if (timeLeft > 10) return '#ffd000';
    return '#ff4655';
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="round-timer">
      <div className="timer-circle" style={{ borderColor: getColor() }}>
        <span className="time-text" style={{ color: getColor() }}>
          {formatTime()}
        </span>
      </div>
      <style jsx>{`
        .round-timer {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }
        .timer-circle {
          width: 70px;
          height: 70px;
          border: 3px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }
        .time-text {
          font-size: 24px;
          font-weight: bold;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};

export default RoundTimer;
