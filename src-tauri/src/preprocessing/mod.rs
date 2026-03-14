use opencv::prelude::*;
use opencv::imgproc;
use opencv::core::{Scalar, in_range};

/// Valorant UI color ranges for filtering
const VALORANT_WHITE_LOW: Scalar = Scalar::new(200.0, 200.0, 200.0, 0.0);
const VALORANT_WHITE_HIGH: Scalar = Scalar::new(255.0, 255.0, 255.0, 255.0);
const VALORANT_RED_LOW: Scalar = Scalar::new(0.0, 0.0, 150.0, 0.0);
const VALORANT_RED_HIGH: Scalar = Scalar::new(100.0, 100.0, 255.0, 255.0);
const VALORANT_BLUE_LOW: Scalar = Scalar::new(150.0, 0.0, 0.0, 0.0);
const VALORANT_BLUE_HIGH: Scalar = Scalar::new(255.0, 100.0, 100.0, 255.0);

pub fn process_frame(mut frame: Mat, roi_name: &str) {
    match roi_name {
        "economy" | "kill_feed" => process_text_region(frame),
        "minimap" => process_minimap(frame),
        "ability_bar" => process_ability_bar(frame),
        _ => (),
    }
}

fn process_text_region(mut frame: Mat) -> Mat {
    // Filter for Valorant UI text colors (white and red/blue team colors)
    let mut white_mask = Mat::default();
    in_range(&frame, &VALORANT_WHITE_LOW, &VALORANT_WHITE_HIGH, &mut white_mask).unwrap();

    let mut red_mask = Mat::default();
    in_range(&frame, &VALORANT_RED_LOW, &VALORANT_RED_HIGH, &mut red_mask).unwrap();

    let mut blue_mask = Mat::default();
    in_range(&frame, &VALORANT_BLUE_LOW, &VALORANT_BLUE_HIGH, &mut blue_mask).unwrap();

    // Combine masks
    let mut combined_mask = Mat::default();
    opencv::core::bitwise_or(&white_mask, &red_mask, &mut combined_mask, &opencv::core::no_array()).unwrap();
    opencv::core::bitwise_or(&combined_mask, &blue_mask, &mut combined_mask, &opencv::core::no_array()).unwrap();

    // Apply mask to original frame
    let mut filtered = Mat::default();
    frame.copy_to(&mut filtered, &combined_mask).unwrap();

    // Convert to grayscale and threshold
    let mut gray = Mat::default();
    imgproc::cvt_color(&filtered, &mut gray, imgproc::COLOR_BGRA2GRAY, 0).unwrap();

    let mut thresholded = Mat::default();
    imgproc::adaptive_threshold(&gray, &mut thresholded, 255.0, imgproc::ADAPTIVE_THRESH_GAUSSIAN_C, imgproc::THRESH_BINARY, 11, 2.0).unwrap();

    // Remove noise
    let mut kernel = imgproc::get_structuring_element(imgproc::MORPH_RECT, opencv::core::Size::new(2, 2), opencv::core::Point::new(-1, -1)).unwrap();
    let mut denoised = Mat::default();
    imgproc::morphology_ex(&thresholded, &mut denoised, imgproc::MORPH_OPEN, &kernel, opencv::core::Point::new(-1, -1), 1, opencv::core::BORDER_CONSTANT, imgproc::morphology_default_border_value()).unwrap();

    // Send to OCR module
    crate::ocr::extract_text(&denoised);

    denoised
}

fn process_minimap(mut frame: Mat) -> Mat {
    // Color filtering for ability effects (smokes, fires, etc.)
    let mut hsv = Mat::default();
    imgproc::cvt_color(&frame, &mut hsv, imgproc::COLOR_BGRA2HSV, 0).unwrap();

    // Send to computer vision module for object detection
    crate::computer_vision::detect_objects(&frame, "minimap");

    frame
}

fn process_ability_bar(mut frame: Mat) -> Mat {
    // Preprocess for ability cooldown detection
    let mut gray = Mat::default();
    imgproc::cvt_color(&frame, &mut gray, imgproc::COLOR_BGRA2GRAY, 0).unwrap();

    // Send to OCR for cooldown number extraction
    crate::ocr::extract_ability_cooldowns(&gray);

    gray
}
