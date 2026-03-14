// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod capture;
mod preprocessing;
// mod ocr;
mod computer_vision;
mod audio;
mod state;
mod strategy;
mod prediction;
mod post_match;
mod calibration;

use state::{GameState, GAME_STATE};
use crate::strategy::generate_strategy_recommendations;
use crate::prediction::predict_enemy_positions;
use crate::post_match::PostMatchAnalysis;
use crate::calibration::{CalibrationSettings, auto_calibrate, validate_calibration};

#[tauri::command]
fn get_game_state() -> Result<GameState, String> {
    Ok(GAME_STATE.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?.clone())
}

#[tauri::command]
fn get_post_match_analysis() -> Result<PostMatchAnalysis, String> {
    let state = GAME_STATE.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
    Ok(crate::post_match::generate_post_match_analysis(&state))
}

#[tauri::command]
fn get_calibration_settings() -> Result<CalibrationSettings, String> {
    CalibrationSettings::load()
}

#[tauri::command]
fn save_calibration_settings(settings: CalibrationSettings) -> Result<(), String> {
    if !validate_calibration(&settings) {
        return Err("Invalid calibration settings: regions out of bounds".to_string());
    }
    settings.save()
}

#[tauri::command]
fn run_auto_calibration() -> Result<CalibrationSettings, String> {
    auto_calibrate()
}

/// Background thread that runs strategy and prediction updates
fn run_strategy_engine() {
    println!("Strategy engine started");

    loop {
        {
            // Lock game state and run updates
            let mut state = GAME_STATE.lock().unwrap();

            // Run prediction first to get enemy positions
            predict_enemy_positions(&mut state);

            // Generate strategy recommendations based on updated state
            generate_strategy_recommendations(&mut state);
        }

        // Update every 100ms (10 FPS) to save CPU
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_game_state,
            get_post_match_analysis,
            get_calibration_settings,
            save_calibration_settings,
            run_auto_calibration
        ])
        .setup(|app| {
            // Initialize OCR engine first (disabled for base build)
            // if let Err(e) = crate::ocr::init_ocr() {
            //     eprintln!("Warning: Failed to initialize OCR engine: {}", e);
            // }

            // Get the main window
            let window = app.get_webview_window("main").unwrap();

            // Set window to be on top of all fullscreen apps
            window.set_always_on_top(true).unwrap();

            // Make window fully transparent and click-through
            window.set_ignore_cursor_events(true).unwrap();

            // Maximize window to full screen
            window.maximize().unwrap();

            // Start screen capture thread
            std::thread::spawn(move || {
                capture::start_capture();
            });

            // Start audio processing thread
            std::thread::spawn(move || {
                audio::start_audio_processing();
            });

            // Start strategy and prediction engine thread
            std::thread::spawn(move || {
                run_strategy_engine();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
