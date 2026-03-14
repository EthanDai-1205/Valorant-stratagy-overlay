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

// Run OCR on a specific region and parse the result
export async function runOCRAndParse(imageBuffer, region, parserFunction) {
  try {
    if (!ocrWorker) return null;

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
