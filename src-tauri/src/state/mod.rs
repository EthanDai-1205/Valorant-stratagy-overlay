use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use once_cell::sync::Lazy;
use std::sync::Mutex;

/// Global game state instance accessible from all modules
pub static GAME_STATE: Lazy<Mutex<GameState>> = Lazy::new(|| {
    Mutex::new(GameState::default())
});

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GameState {
    pub current_round: u32,
    pub is_attacking: bool,
    pub own_credits: u32,
    pub team_credits: Vec<u32>,
    pub enemy_credits: Vec<u32>,
    pub team_ability_cooldowns: Vec<AbilityCooldowns>,
    pub enemy_ability_cooldowns: Vec<AbilityCooldowns>,
    pub player_positions: Vec<Position>,
    pub enemy_position_probabilities: HashMap<Position, f32>,
    pub kill_feed: Vec<KillEvent>,
    pub round_history: Vec<RoundResult>,
    pub enemy_profiles: Vec<EnemyProfile>,
    pub win_probability: f32,
    pub strategy_tips: Vec<String>,
    pub buy_recommendations: Vec<BuyRecommendation>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AbilityCooldowns {
    pub q: u32,
    pub e: u32,
    pub c: u32,
    pub x: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Hash, PartialEq, Eq)]
pub struct Position {
    pub x: f32,
    pub y: f32,
    pub site: Site,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Hash, PartialEq, Eq)]
pub enum Site {
    #[default]
    A,
    B,
    C,
    Mid,
    Spawn,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct KillEvent {
    pub killer: String,
    pub victim: String,
    pub weapon: String,
    pub position: Position,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RoundResult {
    pub round_number: u32,
    pub won: bool,
    pub attack_side: bool,
    pub site_taken: Option<Site>,
    pub remaining_players: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EnemyProfile {
    pub player_name: String,
    pub agent: String,
    pub rank: String,
    pub playstyle: Playstyle,
    pub preferred_site: Site,
    pub rotation_pattern: RotationPattern,
    pub utility_usage_habits: UtilityHabits,
    pub average_reaction_time: f32,
    pub headshot_percentage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum Playstyle {
    Aggressive,
    Passive,
    #[default]
    Balanced,
    Lurker,
    Support,
    EntryFragger,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub enum RotationPattern {
    Fast,
    Slow,
    #[default]
    Medium,
    Predictable,
    Random,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UtilityHabits {
    pub uses_smokes_on_attack: bool,
    pub uses_flashes_on_entry: bool,
    pub saves_ult_for_retake: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BuyRecommendation {
    pub weapon: String,
    pub armor: String,
    pub abilities: Vec<String>,
    pub total_cost: u32,
}

impl GameState {
    /// Update own credits from OCR detection
    pub fn update_own_credits(&mut self, credits: u32) {
        self.own_credits = credits;
    }

    /// Add a kill event to the kill feed
    pub fn add_kill_event(&mut self, kill: KillEvent) {
        self.kill_feed.push(kill);
        if self.kill_feed.len() > 20 {
            self.kill_feed.remove(0);
        }
    }

    /// Update ability cooldowns for team
    pub fn update_team_ability_cooldowns(&mut self, index: usize, cooldowns: AbilityCooldowns) {
        if index < self.team_ability_cooldowns.len() {
            self.team_ability_cooldowns[index] = cooldowns;
        }
    }

    /// Update enemy position probabilities
    pub fn update_enemy_position_probabilities(&mut self, positions: HashMap<Position, f32>) {
        self.enemy_position_probabilities = positions;
    }

    /// Update win probability from strategy engine
    pub fn update_win_probability(&mut self, probability: f32) {
        self.win_probability = probability.clamp(0.0, 1.0);
    }

    /// Add strategy tips
    pub fn add_strategy_tip(&mut self, tip: String) {
        self.strategy_tips.push(tip);
        if self.strategy_tips.len() > 5 {
            self.strategy_tips.remove(0);
        }
    }

    /// Reset state for new match
    pub fn reset_for_new_match(&mut self) {
        *self = GameState::default();
    }
}
