// OCR Parsing utilities for extracting Valorant game state
import { createWorker } from 'tesseract.js';

let ocrWorker;

// Initialize OCR worker with optimized settings for Valorant UI
export async function initOCREngine() {
  try {
    ocrWorker = await createWorker('eng', 1, {
      logger: m => console.log(m)
    });

    // Optimize for white text on dark backgrounds (Valorant UI)
    await ocrWorker.setParameters({
      tessedit_char_whitelist: '0123456789/', // Only recognize numbers and slash for scores
      tessedit_pageseg_mode: 6, // Assume a single uniform block of text
    });

    console.log('OCR Engine initialized for Valorant UI parsing');
    return true;
  } catch (e) {
    console.error('Failed to initialize OCR Engine:', e);
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

// Run OCR on a specific region and parse the result
export async function runOCRAndParse(imageBuffer, region, parserFunction, customWhitelist = '0123456789/') {
  try {
    if (!ocrWorker) return null;

    // Set custom whitelist for this specific OCR operation
    await ocrWorker.setParameters({
      tessedit_char_whitelist: customWhitelist,
      tessedit_pageseg_mode: 6,
    });

    const { data: { text } } = await ocrWorker.recognize(imageBuffer, {
      rectangle: {
        left: region.x,
        top: region.y,
        width: region.width,
        height: region.height
      }
    });

    return parserFunction(text.trim());
  } catch (e) {
    console.error('OCR parsing failed:', e);
    return null;
  }
}
