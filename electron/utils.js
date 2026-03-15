// Shared utility functions for OCR and image processing

// Calculate average confidence from all detections in a region
export function calculateAverageConfidence(lines) {
  if (lines.length === 0) return 0;
  const total = lines.reduce((sum, line) => sum + (line.confidence || 0), 0);
  return total / lines.length;
}
