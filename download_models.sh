#!/bin/bash
set -e

echo "Downloading required AI models for Valorant Strategy Overlay..."
echo ""

# Create models directory if it doesn't exist
mkdir -p models
cd models

# Download YOLOv8n pre-trained on Valorant assets
echo "Downloading YOLOv8 Valorant detection model..."
curl -L -o valorant-yolov8n.pt "https://github.com/your-repo/valorant-models/releases/download/v1.0/valorant-yolov8n.pt"

# Download Whisper base model for speech-to-text (supports Chinese and English)
echo "Downloading Whisper base model..."
curl -L -o ggml-base.bin "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"

# Download Tesseract Valorant custom trained data
echo "Downloading Valorant custom Tesseract font data..."
curl -L -o valorant.traineddata "https://github.com/your-repo/valorant-models/releases/download/v1.0/valorant.traineddata"

echo ""
echo "✅ All models downloaded successfully!"
echo ""
echo "Models installed:"
echo "  - models/valorant-yolov8n.pt (YOLOv8 object detection)"
echo "  - models/ggml-base.bin (Whisper speech-to-text)"
echo "  - models/valorant.traineddata (Custom Tesseract OCR for Valorant font)"
