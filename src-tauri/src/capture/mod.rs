use opencv::prelude::*;
use screenshots::Screen;
use std::time::Duration;
use serde::{Serialize, Deserialize};
use crate::calibration::CalibrationSettings;

/// Region of Interest for screen capture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ROIRegion {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
    pub name: String,
}

/// Get ROI regions from calibration settings
pub fn get_roi_regions() -> Vec<ROIRegion> {
    match CalibrationSettings::load() {
        Ok(settings) => settings.regions,
        Err(_) => {
            // Fallback to default regions if no calibration exists
            let screen = screenshot::Screen::from_point(0, 0).unwrap();
            CalibrationSettings::generate_default_regions(screen.width(), screen.height())
        }
    }
}

pub fn start_capture() {
    // Get primary display
    let screens = Screen::all().unwrap();
    let screen = screens.first().unwrap();
    let _width = screen.width();
    let _height = screen.height();

    // Load calibrated regions
    let mut roi_regions = get_roi_regions();
    println!("Starting screen capture with {} ROI regions", roi_regions.len());

    let mut frame_counter = 0;
    let mut last_calibration_check = std::time::Instant::now();

    loop {
        // Reload calibration settings every 10 seconds
        if last_calibration_check.elapsed() > std::time::Duration::from_secs(10) {
            roi_regions = get_roi_regions();
            last_calibration_check = std::time::Instant::now();
        }

        // Performance optimization: skip 1 out of 3 frames to reduce CPU usage
        // Still maintain 20 FPS effective capture rate
        frame_counter += 1;
        if frame_counter % 3 == 0 {
            std::thread::sleep(Duration::from_millis(16)); // ~60 FPS base, skip to ~20 FPS
            continue;
        }

        // Capture screen
        match screen.capture() {
            Ok(image) => {
                // Process each ROI region
                for roi in &roi_regions {
                    // Crop screenshot to ROI
                    let cropped = image.crop_imm(
                        roi.x,
                        roi.y,
                        roi.width,
                        roi.height
                    );

                    // Convert to OpenCV Mat for processing
                    let mat = Mat::from_slice(cropped.as_raw()).unwrap();
                    let mat = Mat::reshape(&mat, 4, cropped.height() as i32).unwrap();

                    // Send to preprocessing module
                    crate::preprocessing::process_frame(mat, &roi.name);
                }
            }
            Err(e) => eprintln!("Screen capture error: {}", e),
        }

        // Capture at ~20 FPS (50ms interval) with frame skipping
        std::thread::sleep(Duration::from_millis(16));
    }
}
