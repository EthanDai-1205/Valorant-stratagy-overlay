use opencv::prelude::*;
use ultralytics::YOLO;
use once_cell::sync::Lazy;
use std::sync::Mutex;
use crate::state::*;

// Lazy initialized YOLOv8 model fine-tuned on Valorant assets
static YOLO_MODEL: Lazy<Mutex<YOLO>> = Lazy::new(|| {
    // Load custom trained YOLOv8 model for Valorant object detection
    let mut yolo = YOLO::new("models/valorant-yolov8n.pt").unwrap();
    yolo.set_confidence_threshold(0.5);
    yolo.set_iou_threshold(0.4);
    Mutex::new(yolo)
});

/// Detected Valorant object types
#[derive(Debug, Clone)]
pub enum ValorantObject {
    PlayerAlly,
    PlayerEnemy,
    Spike,
    SpikePlanted,
    Smoke,
    Fire,
    Flash,
    SageWall,
    ObjectiveMarker,
}

pub fn detect_objects(frame: &Mat, source: &str) {
    let mut yolo = YOLO_MODEL.lock().unwrap();

    // Convert OpenCV Mat to image buffer for YOLO
    let mut img = image::ImageBuffer::new(frame.cols() as u32, frame.rows() as u32);
    for y in 0..frame.rows() {
        for x in 0..frame.cols() {
            let pixel = frame.at_2d::<opencv::core::Vec4b>(y, x).unwrap();
            img.put_pixel(x as u32, y as u32, image::Rgba([pixel[2], pixel[1], pixel[0], pixel[3]]));
        }
    }

    // Run detection
    let results = yolo.predict(&img).unwrap();

    match source {
        "minimap" => {
            process_minimap_detections(results);
        }
        "full_screen" => {
            detect_crosshair_placement(frame, &results);
        }
        _ => (),
    }
}

fn process_minimap_detections(results: ultralytics::Results) {
    let mut state = GAME_STATE.lock().unwrap();

    for detection in results.detections {
        match detection.class_id {
            0 => { // PlayerEnemy
                let pos = Position {
                    x: detection.bbox.x + detection.bbox.width / 2.0,
                    y: detection.bbox.y + detection.bbox.height / 2.0,
                    site: Site::default(),
                };
                // Update enemy position probability
                state.enemy_position_probabilities.insert(pos, detection.confidence);
                println!("Detected enemy at: {:?} (confidence: {:.2})", pos, detection.confidence);
            }
            1 => { // SpikePlanted
                println!("Spike planted detected!");
                // Update game state
            }
            2 => { // Smoke
                println!("Smoke detected on minimap");
            }
            3 => { // Fire
                println!("Fire/molotov detected on minimap");
            }
            _ => (),
        }
    }
}

fn detect_crosshair_placement(frame: &Mat, detections: &ultralytics::Results) {
    // Screen center is crosshair position (Valorant has centered crosshair)
    let crosshair_x = frame.cols() as f32 / 2.0;
    let crosshair_y = frame.rows() as f32 / 2.0;

    for detection in detections {
        if detection.class_id == 0 { // Enemy player
            let enemy_center_x = detection.bbox.x + detection.bbox.width / 2.0;
            let enemy_center_y = detection.bbox.y + detection.bbox.height / 2.0;

            let distance = ((crosshair_x - enemy_center_x).powi(2) + (crosshair_y - enemy_center_y).powi(2)).sqrt();
            println!("Crosshair distance to enemy: {:.2}px", distance);

            // Store for post-match analysis
        }
    }
}
