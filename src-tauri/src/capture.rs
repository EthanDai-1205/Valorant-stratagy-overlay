// Screen capture disabled in base build (requires image/ocr dependencies)
pub fn start_capture() {
    println!("Screen capture disabled in base build");

    loop {
        // Just update capture time to keep state updated
        if let Ok(mut state) = crate::state::GAME_STATE.lock() {
            state.last_capture_time = std::time::SystemTime::now();
        }
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}
