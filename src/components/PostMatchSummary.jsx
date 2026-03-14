import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const PostMatchSummary = ({ show = false, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      loadAnalysis();
    }
  }, [show]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await invoke('get_post_match_analysis');
      setAnalysis(data);
    } catch (e) {
      console.error('Failed to load post-match analysis:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#00ffaa';
      case 'B': return '#00d4ff';
      case 'C': return '#ffd000';
      case 'D': return '#ff8800';
      case 'F': return '#ff4655';
      default: return 'white';
    }
  };

  const getImpactColor = (score) => {
    if (score >= 8) return '#00ffaa';
    if (score >= 5) return '#ffd000';
    return '#ff4655';
  };

  return (
    <div className="post-match-summary clickable">
      <div className="summary-header">
        <h2>Post-Match Analysis</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {loading ? (
        <div className="loading">Loading analysis...</div>
      ) : analysis ? (
        <div className="summary-content">
          {/* Match Overview */}
          <div className="section">
            <h3>Match Overview</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <span className="label">Map:</span>
                <span className="value">{analysis.map}</span>
              </div>
              <div className="overview-item">
                <span className="label">Result:</span>
                <span className={`value ${analysis.won_match ? 'win' : 'loss'}`}>
                  {analysis.won_match ? 'Win' : 'Loss'} {analysis.final_score[0]} - {analysis.final_score[1]}
                </span>
              </div>
              <div className="overview-item">
                <span className="label">Date:</span>
                <span className="value">{analysis.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="section">
            <h3>Performance Summary</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value big" style={{ color: getGradeColor(analysis.performance_summary.performance_grade) }}>
                  {analysis.performance_summary.performance_grade}
                </div>
                <div className="stat-label">Overall Grade</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.performance_summary.total_kills} / {analysis.performance_summary.total_deaths} / {analysis.performance_summary.total_assists}</div>
                <div className="stat-label">K/D/A</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.performance_summary.average_damage_per_round.toFixed(0)}</div>
                <div className="stat-label">ADR</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.performance_summary.headshot_percentage.toFixed(0)}%</div>
                <div className="stat-label">Headshot %</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.performance_summary.kd_ratio.toFixed(2)}</div>
                <div className="stat-label">K/D Ratio</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.performance_summary.clutch_wins}</div>
                <div className="stat-label">Clutch Wins</div>
              </div>
            </div>
          </div>

          {/* Crosshair Placement */}
          <div className="section">
            <h3>Crosshair Placement</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value big" style={{ color: getGradeColor(analysis.crosshair_placement_stats.crosshair_grade) }}>
                  {analysis.crosshair_placement_stats.crosshair_grade}
                </div>
                <div className="stat-label">Crosshair Grade</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.crosshair_placement_stats.pre_aim_accuracy.toFixed(0)}%</div>
                <div className="stat-label">Pre-Aim Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(analysis.crosshair_placement_stats.average_reaction_time * 1000).toFixed(0)}ms</div>
                <div className="stat-label">Avg Reaction Time</div>
              </div>
            </div>
          </div>

          {/* Decision Review */}
          <div className="section">
            <h3>Decision Making</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value big" style={{ color: getGradeColor(analysis.decision_review.overall_decision_grade) }}>
                  {analysis.decision_review.overall_decision_grade}
                </div>
                <div className="stat-label">Decision Grade</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.decision_review.buy_decision_effectiveness.toFixed(0)}%</div>
                <div className="stat-label">Buy Decisions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.decision_review.positioning_score.toFixed(0)}%</div>
                <div className="stat-label">Positioning</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analysis.decision_review.ability_usage_efficiency.toFixed(0)}%</div>
                <div className="stat-label">Utility Usage</div>
              </div>
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="section">
            <h3>Improvement Tips</h3>
            <ul className="tips-list">
              {analysis.improvement_tips.map((tip, i) => (
                <li key={i}>💡 {tip}</li>
              ))}
            </ul>
          </div>

          {/* Key Moments */}
          <div className="section">
            <h3>Key Moments</h3>
            <div className="moments-list">
              {analysis.key_moments.map((moment, i) => (
                <div key={i} className="moment-item">
                  <div className="moment-round">Round {moment.round_number}</div>
                  <div className="moment-description">{moment.description}</div>
                  <div className="moment-impact" style={{ color: getImpactColor(moment.impact_score) }}>
                    Impact: {moment.impact_score.toFixed(1)}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="error">Failed to load analysis</div>
      )}

      <style jsx>{`
        .post-match-summary {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(17, 17, 17, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          font-size: 14px;
          z-index: 9999;
        }
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(90deg, rgba(255, 70, 85, 0.1), rgba(0, 212, 255, 0.1));
        }
        .summary-header h2 {
          margin: 0;
          font-size: 20px;
          color: #ff4655;
        }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .summary-content {
          padding: 20px 24px;
        }
        .loading, .error {
          padding: 40px;
          text-align: center;
          font-size: 16px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #00d4ff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        .overview-item {
          display: flex;
          justify-content: space-between;
        }
        .overview-item .label {
          color: rgba(255, 255, 255, 0.7);
        }
        .overview-item .value.win {
          color: #00ffaa;
          font-weight: bold;
        }
        .overview-item .value.loss {
          color: #ff4655;
          font-weight: bold;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .stat-value.big {
          font-size: 32px;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
        }
        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .tips-list li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          line-height: 1.5;
        }
        .moments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .moment-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .moment-round {
          font-weight: bold;
          min-width: 60px;
          color: #ffd000;
        }
        .moment-description {
          flex: 1;
          margin: 0 12px;
        }
        .moment-impact {
          font-weight: bold;
          min-width: 80px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default PostMatchSummary;
