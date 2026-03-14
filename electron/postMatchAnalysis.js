// Post-match analysis generator
class PostMatchAnalyzer {
  constructor() {
    this.roundHistory = [];
    this.totalKills = 0;
    this.totalDeaths = 0;
    this.totalAssists = 0;
    this.headshotCount = 0;
    this.clutchWins = 0;
    this.buyDecisionAccuracy = 0;
    this.abilityUsageCount = 0;
  }

  addRoundData(roundData) {
    this.roundHistory.push(roundData);
  }

  generateAnalysis() {
    const winCount = this.roundHistory.filter(r => r.won).length;
    const lossCount = this.roundHistory.length - winCount;
    const winRate = this.roundHistory.length > 0 ? (winCount / this.roundHistory.length) * 100 : 0;

    // Calculate performance grade
    let performanceGrade;
    if (winRate >= 70) performanceGrade = 'A';
    else if (winRate >= 55) performanceGrade = 'B';
    else if (winRate >= 40) performanceGrade = 'C';
    else if (winRate >= 25) performanceGrade = 'D';
    else performanceGrade = 'F';

    // Calculate KD ratio
    const kdRatio = this.totalDeaths > 0 ? this.totalKills / this.totalDeaths : this.totalKills;

    // Generate improvement tips
    const improvementTips = [];
    if (this.headshotCount / Math.max(this.totalKills, 1) < 0.3) {
      improvementTips.push('Work on increasing your headshot percentage');
    }
    if (this.clutchWins < 2) {
      improvementTips.push('Practice 1vX clutch scenarios to improve your late-round play');
    }
    if (this.buyDecisionAccuracy < 0.7) {
      improvementTips.push('Try to follow the buy recommendations more closely to optimize your economy');
    }
    if (this.abilityUsageCount < this.roundHistory.length * 2) {
      improvementTips.push('Use your abilities more frequently to gain map control and information');
    }

    return {
      matchSummary: {
        totalRounds: this.roundHistory.length,
        wins: winCount,
        losses: lossCount,
        winRate: winRate.toFixed(1),
        performanceGrade
      },
      stats: {
        kills: this.totalKills,
        deaths: this.totalDeaths,
        assists: this.totalAssists,
        kdRatio: kdRatio.toFixed(2),
        headshotPercentage: this.totalKills > 0 ? ((this.headshotCount / this.totalKills) * 100).toFixed(1) : 0,
        clutchWins: this.clutchWins
      },
      improvementTips,
      keyMoments: this.roundHistory
        .filter(r => r.impactScore >= 8)
        .map(r => ({
          roundNumber: r.roundNumber,
          description: r.description,
          impactScore: r.impactScore
        }))
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3)
    };
  }
}

export const postMatchAnalyzer = new PostMatchAnalyzer();
