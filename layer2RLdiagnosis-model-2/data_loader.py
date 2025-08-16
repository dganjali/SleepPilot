import numpy as np
import os
import glob
from typing import Dict, List, Tuple, Optional
import kagglehub
import librosa
import soundfile as sf
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm


class ApneaDataLoader:
    """Data loader for the PSG-Audio Apnea dataset."""
    
    def __init__(self, data_dir: Optional[str] = None, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.data_dir = data_dir
        
        if data_dir is None:
            # Download dataset if not provided
            self.data_dir = self._download_dataset()
        
        self.patient_data = {}
        self._load_data()
    
    def _download_dataset(self) -> str:
        """Download the PSG-Audio Apnea dataset from Kaggle."""
        print("📥 Downloading PSG-Audio Apnea dataset from Kaggle...")
        try:
            path = kagglehub.dataset_download("bryandarquea/psg-audio-apnea-audios")
            print(f"✅ Dataset downloaded to: {path}")
            return path
        except Exception as e:
            print(f"❌ Error downloading dataset: {e}")
            print("Please ensure you have kaggle credentials configured.")
            raise
    
    def _load_data(self) -> None:
        """Load all patient data from the dataset with progress tracking."""
        print("🔄 Loading patient data...")
        
        # The actual .npy files are in the PSG-AUDIO subdirectory
        # Look for the PSG-AUDIO directory within the downloaded dataset
        psg_audio_dir = None
        
        # Search for PSG-AUDIO directory
        print("🔍 Searching for PSG-AUDIO directory...")
        for root, dirs, files in os.walk(self.data_dir):
            if 'PSG-AUDIO' in dirs:
                psg_audio_dir = os.path.join(root, 'PSG-AUDIO')
                break
        
        if psg_audio_dir is None:
            # Fallback: try to find it in common locations
            possible_paths = [
                os.path.join(self.data_dir, 'PSG-AUDIO'),
                os.path.join(self.data_dir, 'versions', '3', 'PSG-AUDIO'),
                os.path.join(self.data_dir, 'datasets', 'bryandarquea', 'psg-audio-apnea-audios', 'versions', '3', 'PSG-AUDIO')
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    psg_audio_dir = path
                    break
        
        if psg_audio_dir is None:
            raise ValueError(f"Could not find PSG-AUDIO directory in {self.data_dir}")
        
        print(f"✅ Found PSG-AUDIO directory at: {psg_audio_dir}")
        
        # Find all apnea and normal files in the PSG-AUDIO directory
        ap_files = glob.glob(os.path.join(psg_audio_dir, "*_ap.npy"))
        nap_files = glob.glob(os.path.join(psg_audio_dir, "*_nap.npy"))
        
        print(f"📁 Found {len(ap_files)} apnea files and {len(nap_files)} normal files")
        
        if len(ap_files) == 0 and len(nap_files) == 0:
            # Try searching recursively
            print("🔍 No files found in root, searching recursively...")
            ap_files = []
            nap_files = []
            for root, dirs, files in os.walk(psg_audio_dir):
                for file in files:
                    if file.endswith('_ap.npy'):
                        ap_files.append(os.path.join(root, file))
                    elif file.endswith('_nap.npy'):
                        nap_files.append(os.path.join(root, file))
            
            print(f"✅ Recursive search found {len(ap_files)} apnea files and {len(nap_files)} normal files")
        
        # Group files by patient ID
        print("📋 Grouping files by patient ID...")
        patient_files = {}
        for file_path in ap_files + nap_files:
            filename = os.path.basename(file_path)
            patient_id = filename.split('_')[0]
            
            if patient_id not in patient_files:
                patient_files[patient_id] = {'ap': None, 'nap': None}
            
            if '_ap.npy' in filename:
                patient_files[patient_id]['ap'] = file_path
            elif '_nap.npy' in filename:
                patient_files[patient_id]['nap'] = file_path
        
        # Load data for each patient with progress bar
        print(f"📊 Loading data for {len(patient_files)} patients...")
        for patient_id, files in tqdm(patient_files.items(), desc="Loading patient data", unit="patient"):
            if files['ap'] is not None and files['nap'] is not None:
                try:
                    # Load apnea segments
                    ap_segments = np.load(files['ap'])
                    ap_labels = np.ones(len(ap_segments))  # 1 for apnea
                    
                    # Load normal segments
                    nap_segments = np.load(files['nap'])
                    nap_labels = np.zeros(len(nap_segments))  # 0 for normal
                    
                    # Combine segments and labels
                    all_segments = np.concatenate([ap_segments, nap_segments])
                    all_labels = np.concatenate([ap_labels, nap_labels])
                    
                    # Shuffle data
                    indices = np.random.permutation(len(all_segments))
                    all_segments = all_segments[indices]
                    all_labels = all_labels[indices]
                    
                    self.patient_data[patient_id] = {
                        'segments': all_segments,
                        'labels': all_labels,
                        'ap_count': len(ap_segments),
                        'normal_count': len(nap_segments)
                    }
                    
                except Exception as e:
                    print(f"⚠️ Error loading data for patient {patient_id}: {e}")
                    continue
        
        print(f"✅ Successfully loaded data for {len(self.patient_data)} patients")
    
    def get_patient_data(self, patient_id: str) -> Optional[Dict]:
        """Get data for a specific patient."""
        return self.patient_data.get(patient_id)
    
    def get_all_patient_ids(self) -> List[str]:
        """Get list of all available patient IDs."""
        return list(self.patient_data.keys())
    
    def get_patient_statistics(self) -> Dict:
        """Get statistics about the loaded dataset."""
        if not self.patient_data:
            return {
                'total_patients': 0,
                'total_segments': 0,
                'total_apnea_segments': 0,
                'total_normal_segments': 0,
                'patient_details': {}
            }
        
        stats = {
            'total_patients': len(self.patient_data),
            'total_segments': 0,
            'total_apnea_segments': 0,
            'total_normal_segments': 0,
            'patient_details': {}
        }
        
        for patient_id, data in self.patient_data.items():
            stats['total_segments'] += len(data['segments'])
            stats['total_apnea_segments'] += data['ap_count']
            stats['total_normal_segments'] += data['normal_count']
            
            # Avoid division by zero
            if len(data['segments']) > 0:
                apnea_ratio = data['ap_count'] / len(data['segments'])
            else:
                apnea_ratio = 0.0
            
            stats['patient_details'][patient_id] = {
                'total_segments': len(data['segments']),
                'apnea_segments': data['ap_count'],
                'normal_segments': data['normal_count'],
                'apnea_ratio': apnea_ratio
            }
        
        return stats
    
    def split_patients(self, train_ratio: float = 0.7, val_ratio: float = 0.15, 
                      test_ratio: float = 0.15, random_state: int = 42) -> Tuple[List[str], List[str], List[str]]:
        """Split patients into train/validation/test sets."""
        assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6, "Ratios must sum to 1"
        
        patient_ids = self.get_all_patient_ids()
        
        if len(patient_ids) == 0:
            print("⚠️ Warning: No patients available for splitting")
            return [], [], []
        
        # First split: train vs (val + test)
        train_patients, temp_patients = train_test_split(
            patient_ids, 
            train_size=train_ratio, 
            random_state=random_state
        )
        
        # Second split: val vs test
        val_ratio_adjusted = val_ratio / (val_ratio + test_ratio)
        val_patients, test_patients = train_test_split(
            temp_patients, 
            train_size=val_ratio_adjusted, 
            random_state=random_state
        )
        
        print(f"📊 Split: {len(train_patients)} train, {len(val_patients)} validation, {len(test_patients)} test patients")
        
        return train_patients, val_patients, test_patients
    
    def create_environment_data(self, patient_ids: List[str]) -> List[Tuple[np.ndarray, int]]:
        """Create data suitable for the RL environment with progress tracking."""
        environment_data = []
        
        print(f"🏗️ Creating environment data for {len(patient_ids)} patients...")
        for patient_id in tqdm(patient_ids, desc="Processing patients", unit="patient"):
            if patient_id in self.patient_data:
                data = self.patient_data[patient_id]
                for segment, label in zip(data['segments'], data['labels']):
                    environment_data.append((segment, int(label)))
        
        print(f"✅ Created {len(environment_data)} environment data points")
        return environment_data
    
    def visualize_patient_distribution(self, save_path: Optional[str] = None) -> None:
        """Visualize the distribution of segments across patients."""
        stats = self.get_patient_statistics()
        
        # Check if we have data to visualize
        if stats['total_patients'] == 0:
            print("❌ No data available for visualization")
            return
        
        # Check for NaN values and handle them
        if np.isnan(stats['total_apnea_segments']) or np.isnan(stats['total_normal_segments']):
            print("⚠️ Warning: NaN values detected in statistics, skipping visualization")
            return
        
        if stats['total_apnea_segments'] == 0 and stats['total_normal_segments'] == 0:
            print("❌ No segments available for visualization")
            return
        
        print("📊 Generating patient distribution visualization...")
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # Patient segment counts
        patient_ids = list(stats['patient_details'].keys())
        if patient_ids:
            segment_counts = [stats['patient_details'][pid]['total_segments'] for pid in patient_ids]
            
            axes[0, 0].bar(range(len(patient_ids)), segment_counts)
            axes[0, 0].set_title('Total Segments per Patient')
            axes[0, 0].set_xlabel('Patient ID')
            axes[0, 0].set_ylabel('Number of Segments')
            axes[0, 0].tick_params(axis='x', rotation=45)
            
            # Apnea vs Normal distribution
            apnea_counts = [stats['patient_details'][pid]['apnea_segments'] for pid in patient_ids]
            normal_counts = [stats['patient_details'][pid]['normal_segments'] for pid in patient_ids]
            
            x = np.arange(len(patient_ids))
            width = 0.35
            
            axes[0, 1].bar(x - width/2, apnea_counts, width, label='Apnea', color='red', alpha=0.7)
            axes[0, 1].bar(x + width/2, normal_counts, width, label='Normal', color='blue', alpha=0.7)
            axes[0, 1].set_title('Apnea vs Normal Segments per Patient')
            axes[0, 1].set_xlabel('Patient ID')
            axes[0, 1].set_ylabel('Number of Segments')
            axes[0, 1].set_xticks(x)
            axes[0, 1].set_xticklabels(patient_ids, rotation=45)
            axes[0, 1].legend()
            
            # Overall dataset statistics
            categories = ['Apnea', 'Normal']
            counts = [stats['total_apnea_segments'], stats['total_normal_segments']]
            colors = ['red', 'blue']
            
            # Only create pie chart if we have valid counts
            if counts[0] > 0 or counts[1] > 0:
                axes[1, 0].pie(counts, labels=categories, colors=colors, autopct='%1.1f%%', startangle=90)
                axes[1, 0].set_title('Overall Dataset Distribution')
            else:
                axes[1, 0].text(0.5, 0.5, 'No data available', ha='center', va='center', transform=axes[1, 0].transAxes)
                axes[1, 0].set_title('Overall Dataset Distribution')
            
            # Apnea ratio per patient
            apnea_ratios = [stats['patient_details'][pid]['apnea_ratio'] for pid in patient_ids]
            
            axes[1, 1].bar(range(len(patient_ids)), apnea_ratios, color='orange', alpha=0.7)
            axes[1, 1].set_title('Apnea Ratio per Patient')
            axes[1, 1].set_xlabel('Patient ID')
            axes[1, 1].set_ylabel('Apnea Ratio')
            axes[1, 1].tick_params(axis='x', rotation=45)
            axes[1, 1].axhline(y=0.5, color='black', linestyle='--', alpha=0.5)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"💾 Visualization saved to {save_path}")
        
        plt.show()
    
    def get_sample_audio(self, patient_id: str, segment_idx: int = 0) -> Optional[Tuple[np.ndarray, int]]:
        """Get a sample audio segment for testing."""
        if patient_id not in self.patient_data:
            return None
        
        data = self.patient_data[patient_id]
        if segment_idx >= len(data['segments']):
            return None
        
        return data['segments'][segment_idx], int(data['labels'][segment_idx])


class AudioPreprocessor:
    """Audio preprocessing utilities for the RL environment."""
    
    def __init__(self, target_sr: int = 16000, segment_duration: float = 10.0):
        self.target_sr = target_sr
        self.segment_duration = segment_duration
        self.segment_length = int(target_sr * segment_duration)
    
    def preprocess_audio(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Preprocess audio for the RL environment."""
        # Resample if necessary
        if sr != self.target_sr:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=self.target_sr)
        
        # Ensure correct length
        if len(audio) < self.segment_length:
            # Pad with zeros
            audio = np.pad(audio, (0, self.segment_length - len(audio)))
        elif len(audio) > self.segment_length:
            # Truncate
            audio = audio[:self.segment_length]
        
        return audio
    
    def segment_audio(self, audio: np.ndarray, sr: int) -> List[np.ndarray]:
        """Segment audio into fixed-length segments with progress tracking."""
        # Preprocess audio
        audio = self.preprocess_audio(audio, sr)
        
        # Segment into fixed-length chunks
        segments = []
        total_segments = len(audio) // self.segment_length
        
        print(f"✂️ Segmenting audio into {total_segments} segments...")
        for i in tqdm(range(0, len(audio), self.segment_length), desc="Creating segments", unit="segment"):
            segment = audio[i:i + self.segment_length]
            if len(segment) == self.segment_length:
                segments.append(segment)
        
        return segments
    
    def load_audio(self, audio_path: str) -> Tuple[np.ndarray, int]:
        """Load audio file and return audio data and sample rate."""
        try:
            audio, sr = librosa.load(audio_path, sr=None)
            return audio, sr
        except Exception as e:
            print(f"❌ Error loading audio file {audio_path}: {e}")
            raise
    
    def extract_features(self, audio: np.ndarray) -> np.ndarray:
        """Extract mel-spectrogram features from audio."""
        # Ensure audio is the right length
        if len(audio) != self.segment_length:
            audio = self.preprocess_audio(audio, self.target_sr)
        
        # Extract mel-spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=audio,
            sr=self.target_sr,
            n_mels=128,
            hop_length=512,
            n_fft=2048
        )
        
        # Convert to log scale
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize
        mel_spec_db = (mel_spec_db - mel_spec_db.mean()) / (mel_spec_db.std() + 1e-8)
        
        return mel_spec_db.astype(np.float32)
