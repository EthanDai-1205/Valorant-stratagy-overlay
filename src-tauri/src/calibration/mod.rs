use crate::capture::ROIRegion;
use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CalibrationSettings {
    pub screen_width: u32,
    pub screen_height: u32,
    pub ui_scale: f32,
    pub regions: Vec<ROIRegion>,
}

impl CalibrationSettings {
    /// Load calibration settings from disk
    pub fn load() -> Result<Self, String> {
        let path = Self::get_settings_path();
        if !path.exists() {
            return Ok(Self::default());
        }

        match fs::read_to_string(path) {
            Ok(content) => match serde_json::from_str(&content) {
                Ok(settings) => Ok(settings),
                Err(e) => Err(format!("Failed to parse calibration settings: {}", e)),
            },
            Err(e) => Err(format!("Failed to load calibration settings: {}", e)),
        }
    }

    /// Save calibration settings to disk
    pub fn save(&self) -> Result<(), String> {
        let path = Self::get_settings_path();
        if let Some(parent) = path.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                return Err(format!("Failed to create settings directory: {}", e));
            }
        }

        match serde_json::to_string_pretty(self) {
            Ok(json) => match fs::write(path, json) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to save calibration settings: {}", e)),
            },
            Err(e) => Err(format!("Failed to serialize calibration settings: {}", e)),
        }
    }

    /// Generate default ROI regions for the given screen resolution
    pub fn generate_default_regions(screen_width: u32, screen_height: u32) -> Vec<ROIRegion> {
        vec![
            // Economy (top right)
            ROIRegion {
                x: screen_width - 300,
                y: 20,
                width: 280,
                height: 120,
                name: "economy".to_string(),
            },
            // Kill feed (bottom left)
            ROIRegion {
                x: 20,
                y: screen_height - 300,
                width: 400,
                height: 280,
                name: "kill_feed".to_string(),
            },
            // Ability bar (bottom center)
            ROIRegion {
                x: (screen_width / 2) - 250,
                y: screen_height - 100,
                width: 500,
                height: 80,
                name: "ability_bar".to_string(),
            },
            // Minimap (top right)
            ROIRegion {
                x: screen_width - 250,
                y: 150,
                width: 230,
                height: 230,
                name: "minimap".to_string(),
            },
        ]
    }

    /// Get the path to the calibration settings file
    fn get_settings_path() -> PathBuf {
        let mut path = PathBuf::from(std::env::var("HOME").unwrap_or_default());
        path.push(".valorant-overlay");
        path.push("calibration.json");
        path
    }
}

/// Run auto-calibration to detect optimal ROI regions
pub fn auto_calibrate() -> Result<CalibrationSettings, String> {
    // Get primary display resolution
    let screens = screenshots::Screen::all()
        .map_err(|e| format!("Failed to get screen info: {}", e))?;
    let screen = screens.first().ok_or("No screens found")?;

    let width = screen.width();
    let height = screen.height();

    let mut settings = CalibrationSettings {
        screen_width: width,
        screen_height: height,
        ui_scale: 1.0,
        regions: CalibrationSettings::generate_default_regions(width, height),
    };

    // TODO: Implement auto-calibration using template matching to detect UI elements
    // For now, use default regions

    settings.save()?;
    Ok(settings)
}

/// Validate calibration settings are correct
pub fn validate_calibration(settings: &CalibrationSettings) -> bool {
    for region in &settings.regions {
        if region.x + region.width > settings.screen_width ||
           region.y + region.height > settings.screen_height {
            return false;
        }
        if region.width == 0 || region.height == 0 {
            return false;
        }
    }
    true
}
