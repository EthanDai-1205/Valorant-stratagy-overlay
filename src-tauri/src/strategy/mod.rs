use crate::state::*;
use crate::prediction::*;
use std::cmp::min;
use rand::Rng;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RoundType {
    Pistol,
    Eco,
    ForceBuy,
    HalfBuy,
    FullBuy,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttackStrategy {
    RushA,
    RushB,
    SlowA,
    SlowB,
    FakeARushB,
    FakeBRushA,
    Default,
    HoldMid,
}

/// Main strategy generation function called every game tick
pub fn generate_strategy_recommendations(state: &mut GameState) {
    state.strategy_tips.clear();

    // Generate all recommendation types
    generate_economy_recommendations(state);
    generate_ability_tips(state);
    generate_positioning_recommendations(state);
    generate_attack_strategy_recommendations(state);
    calculate_win_probability(state);

    // Add prediction-based tips
    add_prediction_based_tips(state);
}

/// Generate optimal buy recommendations based on team/enemy economy
pub fn generate_economy_recommendations(state: &mut GameState) {
    let round_type = determine_round_type(state.own_credits, &state.team_credits);
    let enemy_round_type = determine_round_type(0, &state.enemy_credits);

    state.buy_recommendations.clear();

    // Generate buy for each team member
    for (i, &credits) in state.team_credits.iter().enumerate() {
        let rec = match determine_round_type(credits, &[]) {
            RoundType::Pistol => BuyRecommendation {
                weapon: "Classic/Ghost".to_string(),
                armor: "Light".to_string(),
                abilities: vec!["1 utility".to_string()],
                total_cost: min(credits, 800),
            },
            RoundType::Eco => BuyRecommendation {
                weapon: "Classic".to_string(),
                armor: if credits >= 400 { "Light".to_string() } else { "None".to_string() },
                abilities: vec![],
                total_cost: min(credits, 400),
            },
            RoundType::ForceBuy => BuyRecommendation {
                weapon: if credits >= 1100 { "Spectre".to_string() } else { "Sheriff".to_string() },
                armor: "Light".to_string(),
                abilities: vec!["All available".to_string()],
                total_cost: min(credits, 2000),
            },
            RoundType::HalfBuy => BuyRecommendation {
                weapon: if credits >= 2250 { "Guardian/Phantom".to_string() } else { "Spectre".to_string() },
                armor: "Heavy".to_string(),
                abilities: vec!["2 utilities".to_string()],
                total_cost: min(credits, 3000),
            },
            RoundType::FullBuy => BuyRecommendation {
                weapon: if credits >= 3900 { "Vandal/Phantom".to_string() } else { "Guardian".to_string() },
                armor: "Heavy".to_string(),
                abilities: vec!["Full utility".to_string()],
                total_cost: min(credits, 4500),
            },
        };
        state.buy_recommendations.push(rec);
    }

    // Add economy-related strategy tips
    match round_type {
        RoundType::Eco => {
            state.add_strategy_tip("Eco round: Play safe, save weapons for next round".to_string());
        }
        RoundType::ForceBuy => {
            state.add_strategy_tip("Force buy: Play aggressive, try to win the round".to_string());
        }
        RoundType::FullBuy => {
            if enemy_round_type == RoundType::Eco {
                state.add_strategy_tip("Enemy eco: Play disciplined, don't give away free weapons".to_string());
            }
        }
        _ => {}
    }
}

/// Generate ability usage tips
pub fn generate_ability_tips(state: &mut GameState) {
    for (i, cooldowns) in state.team_ability_cooldowns.iter().enumerate() {
        if cooldowns.x == 0 { // Ultimate ready
            state.add_strategy_tip(format!("Teammate {} ultimate is ready! Use for site execute/retake", i + 1));
        }
    }

    // Check enemy utility usage
    if state.enemy_ability_cooldowns.iter().any(|c| c.c == 0) {
        state.add_strategy_tip("Enemy has used smokes/flashes recently - push now".to_string());
    }
}

/// Generate positioning recommendations
pub fn generate_positioning_recommendations(state: &mut GameState) {
    if state.is_attacking {
        state.add_strategy_tip("Spread out when pushing site to avoid multi-kills".to_string());

        // Recommend site based on enemy positions
        let enemy_positions = &state.enemy_position_probabilities;
        let a_site_count = enemy_positions.iter().filter(|(p, _)| p.site == Site::A).count();
        let b_site_count = enemy_positions.iter().filter(|(p, _)| p.site == Site::B).count();

        if a_site_count < b_site_count {
            state.add_strategy_tip("A site has fewer defenders - consider attacking A".to_string());
        } else if b_site_count < a_site_count {
            state.add_strategy_tip("B site has fewer defenders - consider attacking B".to_string());
        }
    } else {
        // Defense positioning
        state.add_strategy_tip("Hold off-angles to catch enemies off guard".to_string());
        state.add_strategy_tip("Maintain crossfire coverage with teammates".to_string());
    }
}

/// Generate attack strategy recommendations
pub fn generate_attack_strategy_recommendations(state: &mut GameState) {
    if !state.is_attacking {
        return;
    }

    let strategy = select_optimal_attack_strategy(state);

    match strategy {
        AttackStrategy::RushA => {
            state.add_strategy_tip("Recommended strategy: Rush A site immediately".to_string());
            state.add_strategy_tip("Use smokes to block common angles early".to_string());
        }
        AttackStrategy::RushB => {
            state.add_strategy_tip("Recommended strategy: Rush B site immediately".to_string());
            state.add_strategy_tip("Flash site entrance before pushing in".to_string());
        }
        AttackStrategy::FakeARushB => {
            state.add_strategy_tip("Recommended strategy: Fake A site execute, then rush B".to_string());
            state.add_strategy_tip("Use utility on A to draw defenders, then rotate quickly".to_string());
        }
        AttackStrategy::Default => {
            state.add_strategy_tip("Recommended strategy: Default play, take map control slowly".to_string());
            state.add_strategy_tip("Gather information before committing to a site".to_string());
        }
        _ => {}
    }
}

/// Calculate real-time win probability
pub fn calculate_win_probability(state: &mut GameState) {
    let mut probability = 0.5;

    // Factor 1: Economy advantage
    let team_total: u32 = state.team_credits.iter().sum();
    let enemy_total: u32 = state.enemy_credits.iter().sum();
    let economy_factor = (team_total as f32 - enemy_total as f32) / 20000.0; // Max ±0.25
    probability += economy_factor.clamp(-0.25, 0.25);

    // Factor 2: Player advantage (alive players)
    let alive_team = 5; // TODO: Track alive players from kill feed
    let alive_enemy = 5;
    let player_factor = (alive_team as f32 - alive_enemy as f32) * 0.1; // ±0.1 per player
    probability += player_factor.clamp(-0.3, 0.3);

    // Factor 3: Ultimate advantage
    let team_ults: u32 = state.team_ability_cooldowns.iter().filter(|c| c.x == 0).count() as u32;
    let enemy_ults: u32 = state.enemy_ability_cooldowns.iter().filter(|c| c.x == 0).count() as u32;
    let ult_factor = (team_ults as f32 - enemy_ults as f32) * 0.08; // ±0.08 per ult
    probability += ult_factor.clamp(-0.2, 0.2);

    // Factor 4: Historical round win rate
    let team_wins = state.round_history.iter().filter(|r| r.won).count() as f32;
    let total_rounds = state.round_history.len() as f32;
    if total_rounds > 0 {
        let historical_factor = (team_wins / total_rounds - 0.5) * 0.2;
        probability += historical_factor;
    }

    // Add small random variance for realism
    let mut rng = rand::thread_rng();
    probability += (rng.gen::<f32>() - 0.5) * 0.05;

    state.update_win_probability(probability);
}

/// Determine round type based on available credits
pub fn determine_round_type(own_credits: u32, team_credits: &[u32]) -> RoundType {
    let avg_credits = if team_credits.is_empty() {
        own_credits
    } else {
        team_credits.iter().sum::<u32>() / team_credits.len() as u32
    };

    match avg_credits {
        0..=999 => RoundType::Eco,
        1000..=1999 => RoundType::ForceBuy,
        2000..=3499 => RoundType::HalfBuy,
        3500.. => RoundType::FullBuy,
    }
}

/// Select optimal attack strategy based on current game state
fn select_optimal_attack_strategy(state: &GameState) -> AttackStrategy {
    let mut rng = rand::thread_rng();
    let roll = rng.gen::<f32>();

    // Adjust probabilities based on game state
    let round_type = determine_round_type(state.own_credits, &state.team_credits);

    match round_type {
        RoundType::ForceBuy | RoundType::Pistol => {
            // Higher chance to rush on force buys/pistol rounds
            if roll < 0.4 { AttackStrategy::RushA }
            else if roll < 0.8 { AttackStrategy::RushB }
            else { AttackStrategy::Default }
        }
        RoundType::FullBuy => {
            // More varied strategies on full buys
            if roll < 0.2 { AttackStrategy::RushA }
            else if roll < 0.4 { AttackStrategy::RushB }
            else if roll < 0.6 { AttackStrategy::SlowA }
            else if roll < 0.75 { AttackStrategy::FakeARushB }
            else if roll < 0.9 { AttackStrategy::FakeBRushA }
            else { AttackStrategy::Default }
        }
        _ => {
            // Default play for eco/half buy
            AttackStrategy::Default
        }
    }
}

/// Add tips based on prediction engine outputs
fn add_prediction_based_tips(state: &mut GameState) {
    // Get predicted enemy positions
    let predicted_positions = predict_enemy_rotations(state);

    if !predicted_positions.is_empty() {
        let next_site = predicted_positions[0];
        state.add_strategy_tip(format!("Predicted enemy rotation to {:?} site - prepare defenses", next_site));
    }

    // Check for off-screen enemy threats
    if state.kill_feed.last().is_some() {
        let last_kill = state.kill_feed.last().unwrap();
        let predicted_pos = predict_off_screen_enemy_position(state, &last_kill.position);
        state.add_strategy_tip(format!("Enemy likely at {:?} - watch that angle", predicted_pos.site));
    }
}
