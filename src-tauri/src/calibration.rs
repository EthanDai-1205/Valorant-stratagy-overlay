// Calibration module stub
// Will be implemented after OCR is working fully

use serde::{Serialize, Deserialize};
use crate::state::CalibrationRegions;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CalibrationSettings {
    pub regions: CalibrationRegions,
}

impl CalibrationSettings {
    pub fn load() -> Result<Self, String> {
        Ok(Self::default())
    }

    pub fn save(&self) -> Result<(), String> {
        Ok(())
    }
}

pub fn validate_calibration(_settings: &CalibrationSettings) -> bool {
    true
}

pub fn auto_calibrate() -> Result<CalibrationSettings, String> {
    Ok(CalibrationSettings::default())
}
