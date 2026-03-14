use crate::state::{GameState, Team, Player, Position};
// OCR disabled for base build
// use crate::ocr::{ocr_region, ocr_numeric, ocr_player_name};
// use image::DynamicImage;
use std::time::SystemTime;

/// Process a frame and update game state with extracted information (stub for base build)
pub fn process_frame(state: &mut GameState) -> Result<(), String> {
    // OCR disabled for base build
    state.last_capture_time = SystemTime::now();
    Ok(())
}

/// Start background computer vision processing thread (stub for base build)
pub fn start_computer_vision() {
    println!("Computer vision processing disabled in base build");
}

