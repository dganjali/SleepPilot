import numpy as np
import gymnasium as gym
from gymnasium import spaces
import torch
import torch.nn.functional as F
from typing import Dict, List, Tuple, Optional
import librosa
import soundfile as sf


class ApneaDetectionEnv(gym.Env):
    """
    Gymnasium environment for sleep apnea detection using RL.
    
    Action space:
    0 = WAIT (observe next segment)
    1 = DIAGNOSE (emit probability of apnea for current segment)
    2 = ESCALATE (flag high-risk)
    
    Reward function: correctness - (confidence - correctness)^2
    """
    
    def __init__(self, audio_segments: List[np.ndarray], labels: List[int], 
                 segment_duration: float = 10.0, sample_rate: int = 16000):
        super().__init__()
        
        self.audio_segments = audio_segments
        self.labels = labels
        self.segment_duration = segment_duration
        self.sample_rate = sample_rate
        
        # Environment state
        self.current_segment_idx = 0
        self.diagnosed_segments = []
        self.escalated = False
        
        # Action and observation spaces
        self.action_space = spaces.Discrete(3)  # WAIT, DIAGNOSE, ESCALATE
        
        # Observation: mel-spectrogram features (128 mel bands, time frames)
        # Using 128 mel bands and variable time frames based on 10-second segments
        n_mels = 128
        n_frames = int(segment_duration * sample_rate / 512) + 1  # Approximate frame count
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, 
            shape=(n_mels, n_frames), 
            dtype=np.float32
        )
        
        # Precompute features for all segments
        self.features = self._extract_features()
        
    def _extract_features(self) -> List[np.ndarray]:
        """Extract mel-spectrogram features from audio segments."""
        features = []
        
        for segment in self.audio_segments:
            # Ensure segment is the right length
            target_length = int(self.segment_duration * self.sample_rate)
            if len(segment) < target_length:
                # Pad with zeros if too short
                segment = np.pad(segment, (0, target_length - len(segment)))
            elif len(segment) > target_length:
                # Truncate if too long
                segment = segment[:target_length]
            
            # Extract mel-spectrogram
            mel_spec = librosa.feature.melspectrogram(
                y=segment, 
                sr=self.sample_rate,
                n_mels=128,
                hop_length=512,
                n_fft=2048
            )
            
            # Convert to log scale
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            # Normalize
            mel_spec_db = (mel_spec_db - mel_spec_db.mean()) / (mel_spec_db.std() + 1e-8)
            
            features.append(mel_spec_db.astype(np.float32))
            
        return features
    
    def reset(self, seed: Optional[int] = None) -> Tuple[np.ndarray, Dict]:
        """Reset environment to initial state."""
        super().reset(seed=seed)
        
        self.current_segment_idx = 0
        self.diagnosed_segments = []
        self.escalated = False
        
        observation = self.features[0]
        info = {
            'current_segment': 0,
            'total_segments': len(self.audio_segments),
            'diagnosed_count': 0,
            'escalated': False
        }
        
        return observation, info
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        """Execute one step in the environment."""
        done = False
        reward = 0.0
        info = {}
        
        if action == 0:  # WAIT
            reward = 0.0
            self.current_segment_idx += 1
            
        elif action == 1:  # DIAGNOSE
            # Get current segment info
            current_label = self.labels[self.current_segment_idx]
            
            # Simulate confidence from agent (this will be replaced by actual model prediction)
            # For now, use a placeholder confidence
            confidence = 0.7  # This will come from the RL agent's policy
            
            # Calculate reward using ECE-inspired formula
            correctness = float(current_label)
            reward = correctness - (confidence - correctness) ** 2
            
            # Record diagnosis
            self.diagnosed_segments.append({
                'segment_idx': self.current_segment_idx,
                'label': current_label,
                'confidence': confidence,
                'reward': reward
            })
            
            self.current_segment_idx += 1
            
        elif action == 2:  # ESCALATE
            reward = -0.1  # Small penalty for escalation
            self.escalated = True
            done = True
        
        # Check if episode is done
        if self.current_segment_idx >= len(self.audio_segments):
            done = True
        
        # Get next observation
        if not done:
            observation = self.features[self.current_segment_idx]
        else:
            observation = np.zeros_like(self.features[0])
        
        # Update info
        info = {
            'current_segment': self.current_segment_idx,
            'total_segments': len(self.audio_segments),
            'diagnosed_count': len(self.diagnosed_segments),
            'escalated': self.escalated,
            'diagnosed_segments': self.diagnosed_segments
        }
        
        return observation, reward, done, False, info
    
    def get_episode_results(self) -> Dict:
        """Get results from the completed episode."""
        if not self.diagnosed_segments:
            return {}
        
        # Calculate metrics
        labels = [seg['label'] for seg in self.diagnosed_segments]
        confidences = [seg['confidence'] for seg in self.diagnosed_segments]
        rewards = [seg['reward'] for seg in self.diagnosed_segments]
        
        # Calculate severity (number of apnea events)
        apnea_count = sum(labels)
        severity = apnea_count / len(self.diagnosed_segments) if self.diagnosed_segments else 0
        
        # Calculate median confidence
        median_confidence = np.median(confidences)
        
        # Calculate ECE
        ece = self._calculate_ece(labels, confidences)
        
        return {
            'total_segments': len(self.diagnosed_segments),
            'apnea_count': apnea_count,
            'normal_count': len(self.diagnosed_segments) - apnea_count,
            'severity': severity,
            'median_confidence': median_confidence,
            'ece': ece,
            'mean_reward': np.mean(rewards),
            'diagnosed_segments': self.diagnosed_segments
        }
    
    def _calculate_ece(self, labels: List[int], confidences: List[float], 
                      n_bins: int = 10) -> float:
        """Calculate Expected Calibration Error."""
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        bin_lowers = bin_boundaries[:-1]
        bin_uppers = bin_boundaries[1:]
        
        ece = 0.0
        for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
            # Find predictions in this bin
            in_bin = np.logical_and(confidences > bin_lower, confidences <= bin_upper)
            bin_size = np.sum(in_bin)
            
            if bin_size > 0:
                bin_acc = np.sum(np.array(labels)[in_bin]) / bin_size
                bin_conf = np.mean(np.array(confidences)[in_bin])
                ece += bin_size * np.abs(bin_acc - bin_conf)
        
        return ece / len(labels)


class ApneaDetectionEnvWrapper:
    """Wrapper to handle multiple patients and episodes."""
    
    def __init__(self, patient_data: Dict[str, Dict]):
        self.patient_data = patient_data
        self.current_patient = None
        self.current_env = None
        
    def reset_patient(self, patient_id: str) -> ApneaDetectionEnv:
        """Reset environment for a specific patient."""
        if patient_id not in self.patient_data:
            raise ValueError(f"Patient {patient_id} not found in data")
        
        patient_info = self.patient_data[patient_id]
        self.current_patient = patient_id
        self.current_env = ApneaDetectionEnv(
            audio_segments=patient_info['segments'],
            labels=patient_info['labels']
        )
        
        return self.current_env
    
    def get_patient_ids(self) -> List[str]:
        """Get list of available patient IDs."""
        return list(self.patient_data.keys())
