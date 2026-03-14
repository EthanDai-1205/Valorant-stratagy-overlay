use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{SampleFormat, Sample, StreamConfig};
use whisper_rs::{WhisperContext, FullParams, SamplingStrategy};
use once_cell::sync::Lazy;
use std::sync::{Mutex, Arc};
use crate::state::*;

// Audio buffer for storing captured system audio
static AUDIO_BUFFER: Lazy<Mutex<Vec<f32>>> = Lazy::new(|| {
    Mutex::new(Vec::with_capacity(16000 * 10)) // 10 seconds of audio at 16kHz
});

// Whisper context for speech-to-text
static WHISPER_CTX: Lazy<Mutex<Option<WhisperContext>>> = Lazy::new(|| {
    match WhisperContext::new("models/ggml-base.bin") {
        Ok(ctx) => Mutex::new(Some(ctx)),
        Err(e) => {
            eprintln!("Failed to load Whisper model: {}", e);
            Mutex::new(None)
        }
    }
});

pub fn start_audio_processing() {
    // Start system audio capture thread
    std::thread::spawn(move || {
        if let Err(e) = capture_system_audio() {
            eprintln!("Audio capture error: {}", e);
        }
    });

    // Start speech-to-text thread for voice chat transcription
    std::thread::spawn(move || {
        run_speech_to_text();
    });

    // Start sound event detection thread
    std::thread::spawn(move || {
        detect_sound_events();
    });

    println!("Audio processing pipeline started");
}

fn capture_system_audio() -> Result<(), Box<dyn std::error::Error>> {
    let host = cpal::default_host();
    let device = host.default_output_device().ok_or("No output device found")?;
    println!("Capturing system audio from: {}", device.name()?);

    let supported_configs = device.supported_output_configs()?;
    let config = supported_configs
        .filter(|c| c.channels() == 1 || c.channels() == 2)
        .find(|c| c.min_sample_rate().0 <= 16000 && c.max_sample_rate().0 >= 16000)
        .ok_or("No supported audio config found")?
        .with_sample_rate(cpal::SampleRate(16000))
        .config();

    let stream = device.build_output_stream(
        &config,
        move |data: &[f32], _: &cpal::OutputCallbackInfo| {
            let mut buffer = AUDIO_BUFFER.lock().unwrap();
            buffer.extend_from_slice(data);

            // Keep only last 10 seconds of audio
            if buffer.len() > 16000 * 10 {
                let drain_to = buffer.len() - 16000 * 10;
                buffer.drain(0..drain_to);
            }
        },
        move |err| {
            eprintln!("Audio stream error: {}", err);
        },
        None,
    )?;

    stream.play()?;
    std::thread::park();

    Ok(())
}

fn run_speech_to_text() {
    let mut ctx_guard = WHISPER_CTX.lock().unwrap();
    let Some(ctx) = ctx_guard.as_mut() else {
        eprintln!("Whisper model not loaded, speech-to-text disabled");
        return;
    };

    let mut state = ctx.create_state().unwrap();
    println!("Whisper speech-to-text initialized (Chinese + English support)");

    loop {
        std::thread::sleep(std::time::Duration::from_secs(2));

        let audio_data = {
            let mut buffer = AUDIO_BUFFER.lock().unwrap();
            if buffer.len() < 16000 * 2 { // Need at least 2 seconds of audio
                continue;
            }
            buffer.clone()
        };

        // Run Whisper transcription
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        params.set_language(Some("zh")); // Auto-detect Chinese and English
        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);

        if let Err(e) = state.full(params, &audio_data) {
            eprintln!("Whisper transcription error: {}", e);
            continue;
        }

        // Extract text
        let num_segments = state.full_n_segments().unwrap_or(0);
        for i in 0..num_segments {
            if let Ok(text) = state.full_get_segment_text(i) {
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    println!("Transcribed voice: {}", trimmed);
                    // Update game state with voice callout info
                    let mut state = GAME_STATE.lock().unwrap();
                    state.add_strategy_tip(format!("Teammate callout: {}", trimmed));
                }
            }
        }
    }
}

fn detect_sound_events() {
    println!("Sound event detection running (footsteps, abilities, spike)");

    loop {
        std::thread::sleep(std::time::Duration::from_millis(500));

        let audio_data = {
            let buffer = AUDIO_BUFFER.lock().unwrap();
            if buffer.len() < 16000 * 1 { // Need at least 1 second of audio
                continue;
            }
            buffer.clone()
        };

        // TODO: Implement sound event detection using a pre-trained model
        // Detect: footsteps, ability sounds, spike plant/defuse sounds, etc.
    }
}
