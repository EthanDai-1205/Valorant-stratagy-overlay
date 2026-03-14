// Valorant Strategy Engine - Generates real-time recommendations based on game state

// Valorant economy constants
const ECONOMY = {
  FULL_BUY_COST: 3900, // Vandal + Full Armor + Full Utility
  HALF_BUY_COST: 2000, // Spectre/Phantom + Light Armor + Partial Utility
  ECO_BUY_COST: 1000, // Classic + Light Armor + minimal utility
  FORCE_BUY_THRESHOLD: 1500, // Minimum team average to force buy
  MAX_CREDITS: 9000,
};

// Weapon tiers by cost
const WEAPON_TIERS = {
  S: { name: 'Vandal/Phantom', minCost: 2900, recommendation: 'Buy Vandal/Phantom' },
  A: { name: 'Spectre/Bulldog', minCost: 1600, recommendation: 'Buy Spectre/Bulldog' },
  B: { name: 'Stinger/Guardian', minCost: 1100, recommendation: 'Buy Stinger/Guardian' },
  C: { name: 'Sheriff/Ghost', minCost: 500, recommendation: 'Buy Sheriff/Ghost' },
  D: { name: 'Classic', minCost: 0, recommendation: 'Use Classic, save for next round' },
};

// Generate buy recommendations based on current game state
export function generateBuyRecommendations(gameState) {
  const { economy, our_score, enemy_score } = gameState;
  const recommendations = [];

  // Calculate average team credits
  const allTeamCredits = [economy.ownCredits, ...economy.teamCredits];
  const averageTeamCredits = Math.round(allTeamCredits.reduce((a, b) => a + b, 0) / allTeamCredits.length);
  const minTeamCredits = Math.min(...allTeamCredits);
  const maxTeamCredits = Math.max(...allTeamCredits);

  // Determine buy round type
  let roundType;
  if (averageTeamCredits >= ECONOMY.FULL_BUY_COST) {
    roundType = 'FULL BUY';
    recommendations.push('✅ Full buy recommended for all players');
    recommendations.push('• Buy Vandal/Phantom + Heavy Armor + full utility');
  } else if (averageTeamCredits >= ECONOMY.HALF_BUY_COST) {
    roundType = 'HALF BUY';
    recommendations.push('⚠️ Half buy recommended');
    recommendations.push('• Buy Spectre + Light Armor + partial utility');
  } else if (averageTeamCredits >= ECONOMY.FORCE_BUY_THRESHOLD && our_score < enemy_score) {
    roundType = 'FORCE BUY';
    recommendations.push('⚡ Force buy recommended (we are losing)');
    recommendations.push('• Buy whatever you can afford to try and turn the round');
  } else {
    roundType = 'ECO ROUND';
    recommendations.push('💸 Eco round recommended');
    recommendations.push('• Buy only Classic + Light Armor, save credits for next round');
  }

  // Personal recommendations
  if (economy.ownCredits >= ECONOMY.FULL_BUY_COST) {
    recommendations.push(`👤 You can full buy (you have ${economy.ownCredits}₡)`);
  } else if (economy.ownCredits >= ECONOMY.HALF_BUY_COST) {
    recommendations.push(`👤 You can half buy (you have ${economy.ownCredits}₡)`);
  } else {
    recommendations.push(`👤 You should eco (you have ${economy.ownCredits}₡)`);
  }

  // Team context
  recommendations.push(`📊 Team average: ${averageTeamCredits}₡, Lowest: ${minTeamCredits}₡, Highest: ${maxTeamCredits}₡`);

  // Weapon recommendation based on personal credits
  let weaponRecommendation = WEAPON_TIERS.D;
  if (economy.ownCredits >= WEAPON_TIERS.S.minCost) weaponRecommendation = WEAPON_TIERS.S;
  else if (economy.ownCredits >= WEAPON_TIERS.A.minCost) weaponRecommendation = WEAPON_TIERS.A;
  else if (economy.ownCredits >= WEAPON_TIERS.B.minCost) weaponRecommendation = WEAPON_TIERS.B;
  else if (economy.ownCredits >= WEAPON_TIERS.C.minCost) weaponRecommendation = WEAPON_TIERS.C;

  recommendations.push(`🔫 Recommendation: ${weaponRecommendation.recommendation}`);

  return {
    roundType,
    averageTeamCredits,
    recommendations,
    weaponRecommendation: weaponRecommendation.name,
  };
}

// Generate win probability based on score and economy
export function calculateWinProbability(gameState) {
  const { our_score, enemy_score, economy } = gameState;

  // Base probability from score difference
  const scoreDiff = our_score - enemy_score;
  let probability = 0.5 + (scoreDiff * 0.03); // +3% per round lead

  // Adjust for economy difference
  const ourTotalEconomy = economy.ownCredits + economy.teamCredits.reduce((a, b) => a + b, 0);
  const enemyTotalEconomy = economy.enemyCredits.reduce((a, b) => a + b, 0);
  const economyDiff = ourTotalEconomy - enemyTotalEconomy;
  const economyFactor = Math.min(Math.max(economyDiff / 20000, -0.2), 0.2); // +/- 20% max based on economy
  probability += economyFactor;

  // Clamp between 0.1 and 0.9
  return Math.min(Math.max(probability, 0.1), 0.9);
}

// Generate strategy tips based on game state
export function generateStrategyTips(gameState) {
  const tips = [];

  // Spike planted tips
  if (gameState.spikePlanted) {
    if (gameState.our_score > gameState.enemy_score) {
      tips.push('🚨 Spike planted! Play retake positions carefully');
    } else {
      tips.push('🚨 Spike planted! Coordinate with team to retake site');
    }
    tips.push(`⏱️ Spike time remaining: ~${gameState.spikeRemaining}s`);
  }

  // Round timer tips
  if (gameState.roundTimer.totalSeconds < 30 && !gameState.spikePlanted) {
    tips.push('⏱️ Less than 30s remaining in round! Push site or play for time');
  }

  // Economy tips
  const averageTeamCredits = Math.round([gameState.economy.ownCredits, ...gameState.economy.teamCredits].reduce((a, b) => a + b, 0) / 5);
  if (averageTeamCredits < 1500 && gameState.roundTimer.totalSeconds > 100) {
    tips.push('💸 Low team economy! Play passive this round');
  }

  return tips;
}
