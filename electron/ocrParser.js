// OCR Parsing utilities for extracting Valorant game state
// Using PaddleOCR for improved accuracy on game UI text
import * as PaddleOCR from 'paddleocr';

let paddleOCR;

// Initialize PaddleOCR engine with optimized settings for Valorant UI
export async function initOCREngine() {
  try {
    paddleOCR = new PaddleOCR.PaddleOCR({
      useCpu: true, // Compatible with all systems
      detection: true,
      recognition: true,
      cls: false,
    });
    await paddleOCR.init();
    console.log('PaddleOCR Engine initialized for Valorant UI parsing');
    return true;
  } catch (e) {
    console.error('Failed to initialize PaddleOCR Engine:', e);
    console.error('Falling back to Tesseract...');
    return false;
  }
}

// Parse score from score region OCR result
export function parseScore(text) {
  if (!text) return null;

  // Clean text: remove any non-numeric/slash characters
  const cleaned = text.replace(/[^0-9/]/g, '').trim();

  // Match patterns like "13/9", "13 - 9", "13 9"
  const scoreMatch = cleaned.match(/(\d{1,2})[\/\s-]?(\d{1,2})/);

  if (scoreMatch && scoreMatch.length >= 3) {
    const ourScore = parseInt(scoreMatch[1], 10);
    const enemyScore = parseInt(scoreMatch[2], 10);

    if (!isNaN(ourScore) && !isNaN(enemyScore) && ourScore <= 13 && enemyScore <= 13) {
      return {
        ourScore,
        enemyScore,
        confidence: ocrWorker?.lastResult?.confidence || 0
      };
    }
  }

  return null;
}

// Parse economy credits from OCR result
export function parseCredits(text) {
  if (!text) return null;

  // Clean text: remove any non-numeric characters
  const cleaned = text.replace(/[^0-9]/g, '').trim();

  if (cleaned.length >= 1 && cleaned.length <= 4) {
    const credits = parseInt(cleaned, 10);
    if (!isNaN(credits) && credits >= 0 && credits <= 9000) { // Valorant max credits is 9000
      return {
        credits,
        confidence: ocrWorker?.lastResult?.confidence || 0
      };
    }
  }

  return null;
}

// Parse round timer from OCR result
export function parseTimer(text) {
  if (!text) return null;

  // Clean text: keep numbers and colons
  const cleaned = text.replace(/[^0-9:]/g, '').trim();

  // Match patterns like "1:45", "0:45", "45"
  const timerMatch = cleaned.match(/(\d{1,2})?:?(\d{2})/);

  if (timerMatch) {
    const minutes = parseInt(timerMatch[1] || 0, 10);
    const seconds = parseInt(timerMatch[2], 10);

    if (!isNaN(minutes) && !isNaN(seconds) && seconds < 60 && minutes <= 2) {
      const totalSeconds = minutes * 60 + seconds;
      return {
        minutes,
        seconds,
        totalSeconds,
        confidence: ocrWorker?.lastResult?.confidence || 0
      };
    }
  }

  return null;
}

// Detect if spike is planted from OCR result
export function detectSpikePlanted(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return lowerText.includes('spike') || lowerText.includes('planted') || lowerText.includes('45') || lowerText.includes('40') || lowerText.includes('35');
}

// Parse health/armor value from OCR result
export function parseHealthArmor(text) {
  if (!text) return null;

  // Clean text: remove any non-numeric characters
  const cleaned = text.replace(/[^0-9]/g, '').trim();

  if (cleaned.length >= 1 && cleaned.length <= 3) {
    const value = parseInt(cleaned, 10);
    if (!isNaN(value) && value >= 0 && value <= 150) { // Max health+armor is 150
      return {
        value,
        confidence: ocrWorker?.lastResult?.confidence || 0
      };
    }
  }

  return null;
}

// Run OCR on a specific region and parse the result using PaddleOCR
export async function runOCRAndParse(imageBuffer, region, parserFunction) {
  try {
    if (!paddleOCR) return null;

    // Convert buffer to base64 for PaddleOCR
    const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Run OCR
    const result = await paddleOCR.ocr(base64);

    // Extract text that falls within our target region
    let text = '';
    if (result && result.length > 0) {
      // Filter results that are within the calibrated region bounds
      for (const detection of result) {
        const [box] = detection.box;
        const centerX = (box[0][0] + box[2][0]) / 2;
        const centerY = (box[0][1] + box[2][1]) / 2;

        if (
          centerX >= region.x &&
          centerX <= region.x + region.width &&
          centerY >= region.y &&
          centerY <= region.y + region.height
        ) {
          text += ' ' + detection.text;
        }
      }
    }

    return parserFunction(text.trim());
  } catch (e) {
    console.error('PaddleOCR parsing failed:', e);
    return null;
  }
}
