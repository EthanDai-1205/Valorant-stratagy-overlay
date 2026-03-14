use std::sync::Mutex;
use image::DynamicImage;
use chrono;
use serde::{Serialize, Deserialize};
use once_cell::sync::Lazy;

/// Global game state shared across all threads
pub static GAME_STATE: Lazy<Mutex<GameState>> = Lazy::new(|| {
    Mutex::new(GameState::default())
});

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GameState {
    /// Last captured and preprocessed frame
    #[serde(skip)]
    pub last_frame: Option<DynamicImage>,

    /// Time of last capture
    pub last_capture_time: std::time::SystemTime,

    /// Current map being played
    pub current_map: Option<String>,

    /// Current player team (Attack/Defend)
    pub current_team: Option<Team>,

    /// Current score for our team
    pub our_score: u8,

    /// Current score for enemy team
    pub enemy_score: u8,

    /// Current round number
    pub round_number: u8,

    /// List of alive teammates
    pub alive_teammates: Vec<Player>,

    /// List of alive enemies
    pub alive_enemies: Vec<Player>,

    /// Remaining spike time (if planted)
    pub spike_remaining: Option<f32>,

    /// Predicted enemy positions
    pub predicted_enemy_positions: Vec<Position>,

    /// Generated strategy recommendations
    pub strategy_recommendations: Vec<String>,

    /// Calibration settings
    pub calibration: CalibrationRegions,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Team {
    Attack,
    Defend,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub name: String,
    pub health: u8,
    pub armor: u8,
    pub current_weapon: String,
    pub position: Position,
    pub is_alive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Position {
    pub x: f32,
    pub y: f32,
    pub z: Option<f32>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CalibrationRegions {
    /// Screen region for score display
    pub score_region: ScreenRegion,
    /// Screen region for player health
    pub health_region: ScreenRegion,
    /// Screen region for minimap
    pub minimap_region: ScreenRegion,
    /// Screen region for team selection
    pub team_region: ScreenRegion,
    /// Screen region for spike timer
    pub spike_region: ScreenRegion,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ScreenRegion {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}
