// OCR Parsing utilities for extracting Valorant game state
// Using Tesseract.js for reliable cross-platform OCR
import { createWorker } from 'tesseract.js';
import { calculateAverageConfidence } from './utils.js';

let ocrWorker;

// Initialize OCR worker with optimized settings for Valorant UI
export async function initOCREngine() {
  try {
    ocrWorker = await createWorker('eng', 1, {
      logger: m => console.log(m)
    });

    // Optimize for white text on dark backgrounds (Valorant UI)
    await ocrWorker.setParameters({
      tessedit_pageseg_mode: 6, // Assume a single uniform block of text
    });

    console.log('Tesseract OCR Engine initialized for Valorant UI parsing');
    return true;
  } catch (e) {
    console.error('Failed to initialize Tesseract OCR Engine:', e);
    return false;
  }
}

// Cleanup Tesseract on shutdown
export async function cleanupOCREngine() {
  if (ocrWorker) {
    try {
      await ocrWorker.terminate();
      ocrWorker = null;
      console.log('Tesseract OCR Engine cleaned up successfully');
    } catch (e) {
      console.error('Failed to cleanup Tesseract:', e);
    }
  }
}

// Parse score from OCR text
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
      };
    }
  }

  return null;
}

// Parse economy credits from OCR text
export function parseCredits(text) {
  if (!text) return null;

  // Clean text: remove any non-numeric characters
  const cleaned = text.replace(/[^0-9]/g, '').trim();

  if (cleaned.length >= 1 && cleaned.length <= 4) {
    const credits = parseInt(cleaned, 10);
    if (!isNaN(credits) && credits >= 0 && credits <= 9000) { // Valorant max credits is 9000
      return {
        credits,
      };
    }
  }

  return null;
}

// Parse round timer from OCR text
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
      };
    }
  }

  return null;
}

// Detect if spike is planted from OCR text
export function detectSpikePlanted(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return lowerText.includes('spike') || lowerText.includes('planted') || lowerText.includes('45') || lowerText.includes('40') || lowerText.includes('35');
}

// Parse health/armor value from OCR text
export function parseHealthArmor(text) {
  if (!text) return null;

  // Clean text: remove any non-numeric characters
  const cleaned = text.replace(/[^0-9]/g, '').trim();

  if (cleaned.length >= 1 && cleaned.length <= 3) {
    const value = parseInt(cleaned, 10);
    if (!isNaN(value) && value >= 0 && value <= 150) { // Max health+armor is 150
      return {
        value,
      };
    }
  }

  return null;
}

// Run full screen OCR once, then extract text for all calibrated regions
// This is much more efficient than running OCR once per region (9x per second vs 1x per second)
export async function runFullScreenOCR(imageBuffer) {
  try {
    if (!ocrWorker) return null;

    const { data } = await ocrWorker.recognize(imageBuffer);
    return data.lines || [];
  } catch (e) {
    console.error('Full screen OCR failed:', e);
    return null;
  }
}

// Extract parsed result for a single region from full OCR output
export function extractFromOCRResult(ocrLines, region, parseFunction) {
  if (!ocrLines || !Array.isArray(ocrLines) || ocrLines.length === 0) {
    return null;
  }

  // Tesseract.js gives us bounding boxes for each line
  // A line counts as being in the region if its bbox intersects with our calibrated region
  const linesInRegion = ocrLines.filter(line => {
    const bbox = line.bbox;
    // Check if any part of the line bbox intersects with our region
    const lineBottom = bbox.y0 + bbox.height;
    const lineRight = bbox.x0 + bbox.width;

    // Check for intersection
    const intersects = !(
      bbox.x1 < region.x ||
      bbox.x0 > region.x + region.width ||
      bbox.y1 < region.y ||
      bbox.y0 > region.y + region.height
    );

    return intersects;
  });

  if (linesInRegion.length === 0) {
    return null;
  }

  // Combine all text from lines in this region
  const text = linesInRegion.map(l => l.text).join(' ').trim();
  const averageConfidence = calculateAverageConfidence(linesInRegion);

  // Parse the combined text
  const parsedResult = parseFunction(text);

  // Add confidence to the parsed result
  if (parsedResult && typeof parsedResult === 'object') {
    parsedResult.confidence = averageConfidence;
  }

  return parsedResult;
}
