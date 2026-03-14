use opencv::prelude::*;
use tesseract::Tesseract;
use once_cell::sync::Lazy;
use std::sync::Mutex;
use crate::state::*;

// Lazy initialized Tesseract instances for different use cases
static TESS_TEXT: Lazy<Mutex<Tesseract>> = Lazy::new(|| {
    let mut tess = Tesseract::new(None, Some("chi_sim+eng")).unwrap();
    // Configure for Valorant UI font
    tess.set_variable("tessedit_pageseg_mode", "7").unwrap(); // Single line text
    tess.set_variable("tessedit_char_blacklist", "{}[]|\\`~").unwrap();
    Mutex::new(tess)
});

static TESS_NUMBERS: Lazy<Mutex<Tesseract>> = Lazy::new(|| {
    let mut tess = Tesseract::new(None, Some("eng")).unwrap();
    tess.set_variable("tessedit_pageseg_mode", "7").unwrap(); // Single line text
    tess.set_variable("tessedit_char_whitelist", "0123456789₡").unwrap();
    Mutex::new(tess)
});

pub fn extract_text(frame: &Mat) -> String {
    let mut tess = TESS_TEXT.lock().unwrap();
    tess.set_image_from_opencv(frame).unwrap();

    let text = tess.get_text().unwrap();
    let cleaned = text.trim().replace("\n", " ").replace("\t", " ");

    // Parse text and update game state
    if !cleaned.is_empty() {
        println!("Extracted text: {}", cleaned);
        parse_extracted_text(&cleaned);
    }

    cleaned
}

pub fn extract_ability_cooldowns(frame: &Mat) -> Vec<u32> {
    let mut tess = TESS_NUMBERS.lock().unwrap();
    tess.set_image_from_opencv(frame).unwrap();

    let text = tess.get_text().unwrap();
    let cooldowns: Vec<u32> = text
        .split_whitespace()
        .filter_map(|s| {
            let num = s.replace('₡', "");
            num.parse().ok()
        })
        .collect();

    // Update game state with cooldowns
    if !cooldowns.is_empty() {
        println!("Extracted cooldowns: {:?}", cooldowns);
    }

    cooldowns
}

fn parse_extracted_text(text: &str) {
    let mut state = GAME_STATE.lock().unwrap();

    // Parse economy numbers (credit values ending with ₡)
    if text.contains('₡') {
        if let Some(credits) = text.split('₡').next() {
            let cleaned = credits.trim().replace(|c: char| !c.is_numeric(), "");
            if let Ok(credits) = cleaned.parse::<u32>() {
                state.update_own_credits(credits);
                println!("Detected own credits: {}", credits);
            }
        }
    }

    // Parse kill feed entries (format: "Killer killed Victim [Weapon]")
    let lower_text = text.to_lowercase();
    if lower_text.contains("killed") || lower_text.contains("击杀") { // Support Chinese UI
        let parts: Vec<&str> = if lower_text.contains("killed") {
            text.split("killed").collect()
        } else {
            text.split("击杀").collect()
        };

        if parts.len() >= 2 {
            let killer = parts[0].trim();
            let victim_part = parts[1].split('[').next().unwrap_or(parts[1]).trim();
            let victim = victim_part.split(' ').next().unwrap_or(victim_part);

            let kill_event = KillEvent {
                killer: killer.to_string(),
                victim: victim.to_string(),
                weapon: "".to_string(), // TODO: Parse weapon from brackets
                position: Position::default(), // TODO: Get position from minimap
                timestamp: chrono::Utc::now().timestamp() as u64,
            };

            state.add_kill_event(kill_event.clone());
            println!("Kill detected: {} -> {}", killer, victim);

            // Update enemy profiles with this kill
            crate::prediction::update_enemy_profiles(&mut state, &kill_event);
        }
    }

    // Parse round numbers
    if lower_text.contains("round") || lower_text.contains("回合") {
        // TODO: Extract and update current round number
    }
}

