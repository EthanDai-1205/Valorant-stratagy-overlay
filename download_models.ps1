<#
.SYNOPSIS
Downloads required AI models for Valorant Strategy Overlay
#>

Write-Host "Downloading required AI models for Valorant Strategy Overlay..." -ForegroundColor Cyan
Write-Host ""

# Create models directory if it doesn't exist
if (-not (Test-Path "models")) {
    New-Item -ItemType Directory -Path "models" | Out-Null
}
Set-Location "models"

# Download YOLOv8n pre-trained on Valorant assets
Write-Host "Downloading YOLOv8 Valorant detection model..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://github.com/your-repo/valorant-models/releases/download/v1.0/valorant-yolov8n.pt" -OutFile "valorant-yolov8n.pt"

# Download Whisper base model for speech-to-text (supports Chinese and English)
Write-Host "Downloading Whisper base model..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin" -OutFile "ggml-base.bin"

# Download Tesseract Valorant custom trained data
Write-Host "Downloading Valorant custom Tesseract font data..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://github.com/your-repo/valorant-models/releases/download/v1.0/valorant.traineddata" -OutFile "valorant.traineddata"

Write-Host ""
Write-Host "✅ All models downloaded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Models installed:" -ForegroundColor Cyan
Write-Host "  - models/valorant-yolov8n.pt (YOLOv8 object detection)"
Write-Host "  - models/ggml-base.bin (Whisper speech-to-text)"
Write-Host "  - models/valorant.traineddata (Custom Tesseract OCR for Valorant font)"
