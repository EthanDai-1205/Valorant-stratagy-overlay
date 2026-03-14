use leptess::{LepTess, Variable};
use image::DynamicImage;
use std::sync::Mutex;
use once_cell::sync::Lazy;

/// Global OCR engine instance
static TESSERACT: Lazy<Mutex<Option<LepTess>>> = Lazy::new(|| Mutex::new(None));

/// Initialize OCR engine once at startup
pub fn init_ocr() -> Result<(), String> {
    let mut tess_lock = TESSERACT.lock().map_err(|e| e.to_string())?;

    if tess_lock.is_some() {
        return Ok(());
    }

    // Initialize Tesseract with English language
    let mut lt = LepTess::new(None, "eng")
        .map_err(|e| format!("Failed to initialize Tesseract: {}", e))?;

    // Set default parameters
    lt.set_variable(Variable::TesseditPagesegMode, "6") // Assume single uniform block of text
        .map_err(|e| format!("Failed to set OCR parameters: {}", e))?;

    lt.set_variable(Variable::TesseditOcrEngineMode, "3") // Default OCR engine
        .map_err(|e| format!("Failed to set OCR engine mode: {}", e))?;

    *tess_lock = Some(lt);
    Ok(())
}

/// Perform OCR on an image and return extracted text
pub fn perform_ocr(image: &DynamicImage) -> Result<String, String> {
    let mut tess_lock = TESSERACT.lock().map_err(|e| e.to_string())?;
    let tess = tess_lock.as_mut().ok_or("OCR engine not initialized")?;

    // Convert image to grayscale and get raw pixels
    let grayscale = image.to_luma8();
    let width = grayscale.width() as i32;
    let height = grayscale.height() as i32;
    let bytes_per_pixel = 1;
    let bytes_per_line = width * bytes_per_pixel;

    // Set image for OCR
    tess.set_image(
        grayscale.as_raw(),
        width,
        height,
        bytes_per_pixel,
        bytes_per_line,
    ).map_err(|e| format!("Failed to set OCR image: {}", e))?;

    // Get OCR text
    let text = tess.get_utf8_text()
        .map_err(|e| format!("OCR failed: {}", e))?;

    Ok(text.trim().to_string())
}

/// Perform OCR on a specific region of the screen
pub fn ocr_region(image: &DynamicImage, x: u32, y: u32, width: u32, height: u32) -> Result<String, String> {
    // Crop image to the specified region
    let cropped = image.crop_imm(x, y, width, height);
    perform_ocr(&cropped)
}

/// Specialized OCR for reading player names
pub fn ocr_player_name(image: &DynamicImage, x: u32, y: u32, width: u32, height: u32) -> Result<String, String> {
    let mut tess_lock = TESSERACT.lock().map_err(|e| e.to_string())?;
    let tess = tess_lock.as_mut().ok_or("OCR engine not initialized")?;

    let cropped = image.crop_imm(x, y, width, height);
    let grayscale = cropped.to_luma8();

    // Use PSM 7 for single line of text (player names)
    tess.set_variable(Variable::TesseditPagesegMode, "7")
        .map_err(|e| format!("Failed to set PSM mode: {}", e))?;

    // Set image for OCR
    let width = grayscale.width() as i32;
    let height = grayscale.height() as i32;
    tess.set_image(
        grayscale.as_raw(),
        width,
        height,
        1,
        width,
    ).map_err(|e| format!("Failed to set OCR image: {}", e))?;

    let text = tess.get_utf8_text()
        .map_err(|e| format!("Player name OCR failed: {}", e))?;

    // Reset to default PSM mode
    let _ = tess.set_variable(Variable::TesseditPagesegMode, "6");

    Ok(text.trim().to_string())
}

/// Specialized OCR for reading numeric values (health, ammo, scores)
pub fn ocr_numeric(image: &DynamicImage, x: u32, y: u32, width: u32, height: u32) -> Result<String, String> {
    let mut tess_lock = TESSERACT.lock().map_err(|e| e.to_string())?;
    let tess = tess_lock.as_mut().ok_or("OCR engine not initialized")?;

    let cropped = image.crop_imm(x, y, width, height);
    let grayscale = cropped.to_luma8();

    // Use PSM 8 for single word, restrict to digits only
    tess.set_variable(Variable::TesseditPagesegMode, "8")
        .map_err(|e| format!("Failed to set PSM mode: {}", e))?;

    tess.set_variable(Variable::TesseditCharWhitelist, "0123456789")
        .map_err(|e| format!("Failed to set character whitelist: {}", e))?;

    // Set image for OCR
    let width = grayscale.width() as i32;
    let height = grayscale.height() as i32;
    tess.set_image(
        grayscale.as_raw(),
        width,
        height,
        1,
        width,
    ).map_err(|e| format!("Failed to set OCR image: {}", e))?;

    let text = tess.get_utf8_text()
        .map_err(|e| format!("Numeric OCR failed: {}", e))?;

    // Reset to default settings
    let _ = tess.set_variable(Variable::TesseditPagesegMode, "6");
    let _ = tess.set_variable(Variable::TesseditCharWhitelist, "");

    Ok(text.trim().to_string())
}
