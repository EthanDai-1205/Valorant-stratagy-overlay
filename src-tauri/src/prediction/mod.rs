use crate::state::*;
use std::collections::HashMap;
use rand::Rng;
use std::f32::consts::PI;

/// Predict enemy position probability heatmap
pub fn predict_enemy_positions(state: &mut GameState) {
    let mut probabilities = HashMap::new();
    let mut rng = rand::thread_rng();

    // Base probabilities based on map and side
    if state.is_attacking {
        // Defenders are likely on their sites
        add_site_probability(&mut probabilities, Site::A, 0.35 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::B, 0.35 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::Mid, 0.2 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::Spawn, 0.1 + rng.gen::<f32>() * 0.05);
    } else {
        // Attackers are likely pushing from spawn/mid
        add_site_probability(&mut probabilities, Site::Spawn, 0.4 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::Mid, 0.3 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::A, 0.15 + rng.gen::<f32>() * 0.1);
        add_site_probability(&mut probabilities, Site::B, 0.15 + rng.gen::<f32>() * 0.1);
    }

    // Adjust probabilities based on known enemy profiles
    for profile in &state.enemy_profiles {
        let preferred_site_prob = match profile.playstyle {
            Playstyle::Aggressive => 0.8,
            Playstyle::Passive => 0.6,
            _ => 0.7,
        };
        adjust_site_probability(&mut probabilities, &profile.preferred_site, preferred_site_prob);
    }

    // Adjust based on kill feed events
    for kill in &state.kill_feed {
        adjust_site_probability(&mut probabilities, &kill.position.site, 1.2);
    }

    state.update_enemy_position_probabilities(probabilities);
}

/// Update individual enemy behavior profiles based on observed actions
pub fn update_enemy_profiles(state: &mut GameState, kill_event: &KillEvent) {
    // Find or create enemy profile
    let profile_index = state.enemy_profiles.iter().position(|p| p.player_name == kill_event.killer);

    let profile = if let Some(index) = profile_index {
        &mut state.enemy_profiles[index]
    } else {
        state.enemy_profiles.push(EnemyProfile {
            player_name: kill_event.killer.clone(),
            ..Default::default()
        });
        state.enemy_profiles.last_mut().unwrap()
    };

    // Update profile based on kill event
    profile.average_reaction_time = (profile.average_reaction_time * 0.9) + 0.2; // Adjust based on actual data

    // Determine playstyle based on kill position
    match kill_event.position.site {
        Site::Spawn | Site::Mid => {
            // Aggressive playstyle if getting kills in enemy spawn/mid
            profile.playstyle = Playstyle::Aggressive;
        }
        Site::A | Site::B => {
            // Passive if holding site
            profile.playstyle = Playstyle::Passive;
        }
        _ => {}
    }

    // Update preferred site
    profile.preferred_site = kill_event.position.site.clone();

    println!("Updated enemy profile for {}: Playstyle={:?}, Preferred Site={:?}",
             kill_event.killer, profile.playstyle, profile.preferred_site);
}

/// Predict enemy position when killed from off-screen
pub fn predict_off_screen_enemy_position(state: &GameState, kill_position: &Position) -> Position {
    let mut rng = rand::thread_rng();

    // Start with kill position
    let mut predicted = Position {
        x: kill_position.x,
        y: kill_position.y,
        site: kill_position.site.clone(),
    };

    // Adjust based on common off-screen angles
    let angle = rng.gen::<f32>() * 2.0 * PI;
    let distance = 10.0 + rng.gen::<f32>() * 20.0; // 10-30 units away from kill position

    predicted.x += distance * angle.cos();
    predicted.y += distance * angle.sin();

    // Adjust based on enemy profiles
    if let Some(killer_profile) = state.enemy_profiles.iter().find(|p| p.player_name == state.kill_feed.last().unwrap().killer) {
        match killer_profile.playstyle {
            Playstyle::Aggressive => {
                // Aggressive players push forward, so closer to your position
                predicted.x = kill_position.x + (predicted.x - kill_position.x) * 0.5;
                predicted.y = kill_position.y + (predicted.y - kill_position.y) * 0.5;
            }
            Playstyle::Passive => {
                // Passive players hold far angles, so further away
                predicted.x = kill_position.x + (predicted.x - kill_position.x) * 1.5;
                predicted.y = kill_position.y + (predicted.y - kill_position.y) * 1.5;
            }
            _ => {}
        }
    }

    predicted
}

/// Predict which site enemies will rotate to
pub fn predict_enemy_rotations(state: &GameState) -> Vec<Site> {
    let mut rotations = Vec::new();
    let mut rng = rand::thread_rng();

    if state.is_attacking {
        // Predict defender rotations
        let site_prob = rng.gen::<f32>();
        if site_prob < 0.6 {
            rotations.push(Site::A);
        }
        if site_prob > 0.4 {
            rotations.push(Site::B);
        }
    } else {
        // Predict attacker rotations
        let last_kill_site = state.kill_feed.last().map(|k| &k.position.site);

        if let Some(site) = last_kill_site {
            // If they got a kill on one site, they might push that site
            rotations.push(site.clone());
            // Also possible they rotate to the other site
            if rng.gen::<f32>() < 0.3 {
                rotations.push(if *site == Site::A { Site::B } else { Site::A });
            }
        } else {
            // Default prediction
            rotations.push(Site::A);
            rotations.push(Site::B);
        }
    }

    // Adjust based on enemy profiles
    for profile in &state.enemy_profiles {
        if profile.rotation_pattern == RotationPattern::Fast {
            // Fast rotators are more likely to switch sites
            if rotations.len() == 1 {
                rotations.push(if rotations[0] == Site::A { Site::B } else { Site::A });
            }
        }
    }

    rotations
}

/// Predict enemy behavior patterns based on historical data
pub fn predict_enemy_play_pattern(state: &GameState, player_name: &str) -> Option<&EnemyProfile> {
    state.enemy_profiles.iter().find(|p| p.player_name == player_name)
}

/// Generate heatmap of possible enemy positions for UI display
pub fn generate_enemy_position_heatmap(state: &GameState) -> HashMap<Position, f32> {
    let mut heatmap = HashMap::new();
    let probabilities = &state.enemy_position_probabilities;

    // Generate grid of positions around each high-probability site
    for (pos, prob) in probabilities {
        // Add surrounding positions with decreasing probability
        for dx in -2..=2 {
            for dy in -2..=2 {
                let distance = ((dx * dx + dy * dy) as f32).sqrt();
                let adjusted_prob = prob * (1.0 - distance * 0.15);
                if adjusted_prob > 0.05 {
                    let heat_pos = Position {
                        x: pos.x + dx as f32,
                        y: pos.y + dy as f32,
                        site: pos.site.clone(),
                    };
                    *heatmap.entry(heat_pos).or_insert(0.0) += adjusted_prob;
                }
            }
        }
    }

    heatmap
}

// Helper functions
fn add_site_probability(map: &mut HashMap<Position, f32>, site: Site, probability: f32) {
    let pos = Position { x: 0.0, y: 0.0, site };
    *map.entry(pos).or_insert(0.0) += probability;
}

fn adjust_site_probability(map: &mut HashMap<Position, f32>, site: &Site, multiplier: f32) {
    for (pos, prob) in map.iter_mut() {
        if &pos.site == site {
            *prob *= multiplier;
        }
    }

    // Normalize probabilities
    let total: f32 = map.values().sum();
    if total > 0.0 {
        for prob in map.values_mut() {
            *prob /= total;
        }
    }
}
