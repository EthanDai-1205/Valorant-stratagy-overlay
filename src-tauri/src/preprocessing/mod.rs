// Preprocessing placeholder implementation
pub fn process_frame(frame: Vec<u8>, roi_name: &str) {
    match roi_name {
        "economy" | "kill_feed" => {
            crate::ocr::extract_text(&frame);
        }
        "minimap" => {
            crate::computer_vision::detect_objects(&[], "minimap");
        }
        "ability_bar" => {
            crate::ocr::extract_ability_cooldowns(&frame);
        }
        _ => (),
    }
}
