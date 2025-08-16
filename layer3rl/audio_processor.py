"""
Audio Processor - Layer 1: MP3 Sleep Audio Analysis

This module processes MP3 audio files to extract sleep-related metrics:
- Sound levels and patterns
- Sleep efficiency calculations
- Sleep stage detection (deep, REM, light)
- Sleep latency and wake-up detection
- Audio quality assessment

For now, this simulates the larger model output, but can be extended
to integrate with actual ML models for sleep audio analysis.
"""

import numpy as np
import librosa
import soundfile as sf
from typing import Dict, List, Optional, Tuple
import json
import logging
from pathlib import Path
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SleepAudioProcessor:
    """
    Processes sleep audio recordings to extract sleep quality metrics
    """
    
    def __init__(self):
        self.sample_rate = 22050  # Standard sample rate for analysis
        self.frame_length = 2048
        self.hop_length = 512
        
        logger.info("Sleep Audio Processor initialized")
    
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load audio file and resample to standard rate
        """
        try:
            # Load audio file
            audio, sr = librosa.load(file_path, sr=self.sample_rate)
            logger.info(f"Loaded audio: {len(audio)/sr:.2f}s at {sr}Hz")
            return audio, sr
        except Exception as e:
            logger.error(f"Error loading audio file: {e}")
            raise
    
    def analyze_sound_levels(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Analyze sound levels throughout the recording
        """
        # Calculate RMS energy
        rms = librosa.feature.rms(y=audio, frame_length=self.frame_length, hop_length=self.hop_length)[0]
        
        # Convert to dB
        db = 20 * np.log10(rms + 1e-10)
        
        # Calculate statistics
        peak_level = np.max(db)
        average_level = np.mean(db)
        quiet_threshold = np.percentile(db, 25)  # 25th percentile as quiet threshold
        
        # Calculate quiet periods (below threshold)
        quiet_periods = np.sum(db < quiet_threshold) / len(db) * 100
        
        # Detect noise events (sudden increases in sound level)
        db_diff = np.diff(db)
        noise_events = np.sum(np.abs(db_diff) > 10)  # Threshold for significant changes
        
        return {
            'peak_level': float(peak_level),
            'average_level': float(average_level),
            'quiet_periods': float(quiet_periods),
            'noise_events': int(noise_events),
            'min_level': float(np.min(db)),
            'std_level': float(np.std(db))
        }
    
    def detect_sleep_patterns(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Detect sleep patterns and stages from audio
        """
        # Extract spectral features
        mfcc = librosa.feature.mfcc(y=audio, sr=self.sample_rate, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=self.sample_rate)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=self.sample_rate)[0]
        
        # Calculate sleep efficiency (based on audio regularity)
        audio_regularity = 1.0 / (1.0 + np.std(spectral_centroid))
        sleep_efficiency = min(1.0, max(0.0, audio_regularity * 0.9 + 0.1))
        
        # Estimate sleep stages based on spectral characteristics
        # Deep sleep: low frequency, regular patterns
        deep_sleep_indicators = np.mean(spectral_centroid < 1000)
        deep_sleep_percentage = min(1.0, deep_sleep_indicators * 1.5)
        
        # REM sleep: moderate frequency, some variability
        rem_sleep_indicators = np.mean((spectral_centroid >= 1000) & (spectral_centroid < 3000))
        rem_sleep_percentage = min(1.0, rem_sleep_indicators * 1.2)
        
        # Light sleep: higher frequency, more variability
        light_sleep_percentage = 1.0 - deep_sleep_percentage - rem_sleep_percentage
        light_sleep_percentage = max(0.0, light_sleep_percentage)
        
        return {
            'sleep_efficiency': float(sleep_efficiency),
            'deep_sleep_percentage': float(deep_sleep_percentage),
            'rem_sleep_percentage': float(rem_sleep_percentage),
            'light_sleep_percentage': float(light_sleep_percentage)
        }
    
    def estimate_sleep_metrics(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Estimate sleep latency and wake-up events
        """
        # Estimate sleep latency based on audio settling time
        # Look for when audio becomes more regular (indicating sleep)
        rms = librosa.feature.rms(y=audio, frame_length=self.frame_length, hop_length=self.hop_length)[0]
        
        # Calculate rolling standard deviation to detect settling
        window_size = 50  # frames
        rolling_std = []
        for i in range(len(rms) - window_size):
            rolling_std.append(np.std(rms[i:i+window_size]))
        
        if len(rolling_std) > 0:
            # Find when audio becomes more regular (lower std)
            threshold = np.percentile(rolling_std, 30)
            sleep_start_idx = np.where(np.array(rolling_std) < threshold)[0]
            
            if len(sleep_start_idx) > 0:
                # Convert frame index to time
                sleep_latency = (sleep_start_idx[0] * self.hop_length) / self.sample_rate / 60  # minutes
            else:
                sleep_latency = 15.0  # Default fallback
        else:
            sleep_latency = 15.0
        
        # Detect wake-up events (sudden increases in activity)
        rms_diff = np.diff(rms)
        wake_up_threshold = np.percentile(rms_diff, 90)
        wake_ups = np.sum(rms_diff > wake_up_threshold)
        
        return {
            'sleep_latency': float(sleep_latency),
            'wake_ups': int(wake_ups)
        }
    
    def assess_audio_quality(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Assess overall audio quality for analysis
        """
        # Calculate signal-to-noise ratio
        signal_power = np.mean(audio**2)
        noise_power = np.var(audio)
        snr = 10 * np.log10(signal_power / (noise_power + 1e-10))
        
        # Calculate spectral flatness (indicates noise vs. signal)
        spectral_flatness = librosa.feature.spectral_flatness(y=audio)[0]
        avg_flatness = np.mean(spectral_flatness)
        
        # Overall quality score (0-1)
        # Higher SNR and lower flatness = better quality
        quality_score = min(1.0, max(0.0, 
            (snr + 20) / 40 * 0.6 +  # SNR contribution (60%)
            (1.0 - avg_flatness) * 0.4  # Flatness contribution (40%)
        ))
        
        return {
            'quality_score': float(quality_score),
            'snr_db': float(snr),
            'spectral_flatness': float(avg_flatness)
        }
    
    def process_sleep_audio(self, file_path: str) -> Dict[str, any]:
        """
        Main method to process sleep audio file
        """
        logger.info(f"Processing sleep audio file: {file_path}")
        
        try:
            # Load and analyze audio
            audio, sr = self.load_audio(file_path)
            
            # Perform various analyses
            sound_levels = self.analyze_sound_levels(audio)
            sleep_patterns = self.detect_sleep_patterns(audio)
            sleep_metrics = self.estimate_sleep_metrics(audio)
            audio_quality = self.assess_audio_quality(audio)
            
            # Combine all results
            results = {
                'file_path': file_path,
                'duration_seconds': len(audio) / sr,
                'sample_rate': sr,
                'analysis_timestamp': str(np.datetime64('now')),
                
                # Sound level analysis
                'peak_level': sound_levels['peak_level'],
                'average_level': sound_levels['average_level'],
                'quiet_periods': sound_levels['quiet_periods'],
                'noise_events': sound_levels['noise_events'],
                'min_level': sound_levels['min_level'],
                'std_level': sound_levels['std_level'],
                
                # Sleep pattern analysis
                'sleep_efficiency': sleep_patterns['sleep_efficiency'],
                'deep_sleep_percentage': sleep_patterns['deep_sleep_percentage'],
                'rem_sleep_percentage': sleep_patterns['rem_sleep_percentage'],
                'light_sleep_percentage': sleep_patterns['light_sleep_percentage'],
                
                # Sleep metrics
                'sleep_latency': sleep_metrics['sleep_latency'],
                'wake_ups': sleep_metrics['wake_ups'],
                
                # Audio quality
                'quality_score': audio_quality['quality_score'],
                'snr_db': audio_quality['snr_db'],
                'spectral_flatness': audio_quality['spectral_flatness']
            }
            
            logger.info("Audio processing completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            raise
    
    def save_results(self, results: Dict[str, any], output_path: str):
        """
        Save analysis results to JSON file
        """
        try:
            with open(output_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            logger.info(f"Results saved to: {output_path}")
        except Exception as e:
            logger.error(f"Error saving results: {e}")
            raise


def create_mock_audio_data(duration_seconds: float = 28800) -> np.ndarray:
    """
    Create mock audio data for testing (8 hours of sleep)
    """
    sample_rate = 22050
    samples = int(duration_seconds * sample_rate)
    
    # Create realistic sleep audio patterns
    t = np.linspace(0, duration_seconds, samples)
    
    # Base breathing pattern (slow, regular)
    breathing = 0.1 * np.sin(2 * np.pi * 0.2 * t)  # 0.2 Hz breathing
    
    # Add some variation over time
    variation = 0.05 * np.sin(2 * np.pi * 0.001 * t)  # Very slow variation
    
    # Add occasional noise events (movement, snoring)
    noise_events = np.zeros_like(t)
    event_times = np.random.choice(len(t), size=20, replace=False)
    for event_time in event_times:
        start = max(0, event_time - 1000)
        end = min(len(t), event_time + 1000)
        noise_events[start:end] += 0.3 * np.exp(-np.abs(np.arange(start-end, end-start)) / 500)
    
    # Combine all components
    audio = breathing + variation + noise_events
    
    # Add some realistic noise
    noise = 0.01 * np.random.randn(len(audio))
    audio += noise
    
    return audio


def save_mock_audio(audio: np.ndarray, output_path: str, sample_rate: int = 22050):
    """
    Save mock audio data to WAV file
    """
    try:
        sf.write(output_path, audio, sample_rate)
        logger.info(f"Mock audio saved to: {output_path}")
    except Exception as e:
        logger.error(f"Error saving mock audio: {e}")
        raise


# Example usage and testing
if __name__ == "__main__":
    processor = SleepAudioProcessor()
    
    # Create and save mock audio data
    mock_audio = create_mock_audio_data(3600)  # 1 hour for testing
    mock_file = "mock_sleep_audio.wav"
    save_mock_audio(mock_audio, mock_file)
    
    # Process the mock audio
    results = processor.process_sleep_audio(mock_file)
    
    # Save results
    processor.save_results(results, "sleep_audio_analysis.json")
    
    # Print summary
    print("=== Sleep Audio Analysis Results ===")
    print(f"Duration: {results['duration_seconds']:.1f} seconds")
    print(f"Peak Level: {results['peak_level']:.1f} dB")
    print(f"Average Level: {results['average_level']:.1f} dB")
    print(f"Sleep Efficiency: {results['sleep_efficiency']:.2f}")
    print(f"Deep Sleep: {results['deep_sleep_percentage']:.1%}")
    print(f"REM Sleep: {results['rem_sleep_percentage']:.1%}")
    print(f"Sleep Latency: {results['sleep_latency']:.1f} minutes")
    print(f"Wake-ups: {results['wake_ups']}")
    print(f"Quality Score: {results['quality_score']:.2f}")
    
    # Clean up mock file
    if os.path.exists(mock_file):
        os.remove(mock_file)
        print(f"Cleaned up mock file: {mock_file}")
