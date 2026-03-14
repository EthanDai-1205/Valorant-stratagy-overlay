use screenshots::Screen;
use image::DynamicImage;
use std::time::Duration;
use crate::state::GAME_STATE;
use crate::preprocessing::preprocess_screenshot;

/// Start continuous screen capture
pub fn start_capture() {
    println!("Screen capture started (external capture only - anti-cheat compliant)");

    // Get the primary display
    let screens = match Screen::all() {
        Ok(screens) => screens,
        Err(e) => {
            eprintln!("Failed to get screens: {}", e);
            return;
        }
    };

    let primary_screen = match screens.first() {
        Some(screen) => screen,
        None => {
            eprintln!("No screens found");
            return;
        }
    };

    loop {
        // Capture screenshot
        let image = match primary_screen.capture() {
            Ok(image) => DynamicImage::ImageRgba8(image),
            Err(e) => {
                eprintln!("Failed to capture screen: {}", e);
                std::thread::sleep(Duration::from_millis(100));
                continue;
            }
        };

        // Preprocess image for OCR and computer vision
        let processed_image = preprocess_screenshot(&image);

        // Update game state with new frame
        if let Ok(mut state) = GAME_STATE.lock() {
            state.last_frame = Some(processed_image);
            state.last_capture_time = std::time::SystemTime::now();
        }

        // Capture at 10 FPS (100ms interval)
        std::thread::sleep(Duration::from_millis(100));
    }
}

/// Capture a single screenshot
pub fn capture_single() -> Result<DynamicImage, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    let primary_screen = screens.first().ok_or("No screens found")?;

    let image = primary_screen.capture()
        .map_err(|e| e.to_string())?;

    Ok(DynamicImage::ImageRgba8(image))
}
