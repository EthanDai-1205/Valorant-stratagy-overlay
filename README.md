# Valorant Real-Time Strategy Evaluator Overlay (无畏契约战略辅助 overlay)

100% anti-cheat compliant external overlay for Valorant (Chinese version) that provides real-time strategy recommendations using OCR, computer vision, and audio analysis with zero game process interaction.

## 🚨 CRITICAL ANTI-CHEAT COMPLIANCE (100% SAFE)
This app is designed to be **100% undetectable** by Tencent ACE anti-cheat:
- ❌ **NO** game process hooking, memory reading, or code injection of any kind
- ❌ **NO** game file modification or network traffic interception
- ✅ **ONLY** uses standard system-level screen capture/audio capture APIs
- ✅ Runs as a regular user application (NO administrator privileges required)
- ✅ All operations are 100% read-only and completely external to the game process
- ✅ All audio processing and speech-to-text runs 100% locally on your device (zero external data transmission)
- ✅ No code interacts with the Valorant game process in any way

### Anti-Cheat Verification
We have performed extensive testing to ensure zero detection risk:
- No DLL injection or process manipulation
- No writes to game memory or game files
- Uses only public Windows/macOS system APIs that are used by thousands of legitimate apps
- No signature patterns that would trigger anti-cheat detection

## Features

### Core Strategy Features
1. **Economy & Buy Advisor**: Optimal gun/ability buy recommendations based on team/enemy credits
2. **Positioning Advisor**: Real-time positioning tips and enemy position heatmaps
3. **Ability Tracker**: Tracks all teammate/enemy ability cooldowns and usage
4. **Live Win Probability**: Continuously updated win rate calculation
5. **Enemy Pattern Detection**: Learns individual enemy play patterns per match

### Advanced Detection
- Map icon and ability effect detection (smokes, fires, spike plants, etc.)
- Kill feed parsing with location tracking
- Off-screen enemy position prediction when killed from out of view
- Audio detection for footsteps, ability sounds, and spike plant/defuse
- Local voice chat transcription (Chinese/English) to extract tactical callouts
- All audio processing is 100% local with zero data transmission

### Quality of Life
- Teammate ability cooldown overlays
- Customizable round timer overlay
- Real-time FPS/network latency monitor
- Per-round combat stat tracking
- Enemy profile overlay showing rank/playstyle tendencies
- Full overlay customization (position, opacity, size, toggle features)

### Post-Match Analysis
- Crosshair placement analysis and accuracy statistics
- In-game decision review (buy decisions, positioning, ability usage)
- Personal performance summary and personalized improvement advice
- Match replay highlights of key moments and mistakes

## Tech Stack
- **Backend**: Rust + Tauri (minimal runtime, low CPU/GPU usage)
- **OCR/Computer Vision**: Tesseract OCR + OpenCV + YOLOv8
- **Frontend**: React (transparent overlay UI)
- **Audio Processing**: OpenAI Whisper (local speech-to-text) + sound event detection

## Performance Target
- <5% CPU usage
- <2% GPU usage
- <100ms end-to-end latency

## Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Tesseract OCR (with Chinese language pack)
- OpenCV 4.5+

### Installation
```bash
# Install frontend dependencies
npm install

# Download required AI models (one-time setup)
./download_models.sh

# Run in development mode
npm run tauri dev

# Build production release
npm run tauri build
```

### First Time Setup
1. Run Valorant in fullscreen mode on your main monitor
2. Open the calibration tool with `Ctrl/Cmd + Shift + C`
3. Click "Run Auto-Calibration" to automatically detect UI regions
4. Adjust regions manually if needed, then save settings
5. Open settings with `Ctrl/Cmd + Shift + S` to customize features and overlay appearance

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + S` | Open settings panel |
| `Ctrl/Cmd + Shift + C` | Open calibration tool |
| `Ctrl/Cmd + Shift + M` | Open post-match analysis |

## Performance Optimization Tips
- Use auto-calibration for best OCR/object detection accuracy
- Disable features you don't use in settings to reduce CPU/GPU usage
- The app is optimized to use <5% CPU and <2% GPU on modern systems

## Project Structure
```
valorant-strategy-overlay/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # App entry point
│   │   ├── capture/             # Screen capture module
│   │   ├── preprocessing/       # OpenCV image preprocessing
│   │   ├── ocr/                 # Tesseract OCR integration
│   │   ├── computer_vision/     # YOLOv8 object detection
│   │   ├── audio/               # Audio capture, sound detection, speech-to-text
│   │   ├── state/               # Game state tracking
│   │   ├── strategy/            # Strategy evaluation engine
│   │   ├── prediction/          # Enemy behavior prediction
│   │   └── post_match/          # Post-match analysis
├── src/                          # React frontend
│   ├── components/
│   │   ├── Overlay.jsx          # Main overlay root
│   │   ├── EconomyAdvisor.jsx   # Buy round suggestions
│   │   ├── StrategyTips.jsx     # Real-time strategy tips
│   │   └── WinProbability.jsx   # Win probability display
│   ├── App.jsx
│   └── main.css
```

## License
MIT
