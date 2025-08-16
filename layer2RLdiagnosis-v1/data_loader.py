import os
import numpy as np
import librosa
from typing import Tuple, List, Dict, Any
import kagglehub

class PSGAudioLoader:
    def __init__(self, sample_rate: int = 16000, segment_duration: float = 10.0):
        self.sample_rate = sample_rate
        self.segment_duration = segment_duration
        self.segment_samples = int(sample_rate * segment_duration)
        
    def download_dataset(self) -> str:
        """Download PSG audio dataset from Kaggle"""
        path = kagglehub.dataset_download("bryandarquea/psg-audio-apnea-audios")
        return path
    
    def load_preprocessed_data(self, dataset_path: str) -> Dict[str, Any]:
        """Load preprocessed data from the actual Kaggle dataset structure"""
        print(f"📁 Loading preprocessed data from: {dataset_path}")
        
        # The actual dataset structure is:
        # dataset_path/PSG-AUDIO/APNEA_EDF/{patient_id}/{patient_id}_ap.npy and {patient_id}_nap.npy
        
        # Navigate to the correct folder structure
        psg_audio_path = os.path.join(dataset_path, "PSG-AUDIO")
        if not os.path.exists(psg_audio_path):
            raise FileNotFoundError(f"PSG-AUDIO folder not found in {dataset_path}")
        
        apnea_edf_path = os.path.join(psg_audio_path, "APNEA_EDF")
        if not os.path.exists(apnea_edf_path):
            raise FileNotFoundError(f"APNEA_EDF folder not found in {psg_audio_path}")
        
        print(f"✅ Found dataset structure at: {apnea_edf_path}")
        
        # Get all patient folders
        patient_folders = [f for f in os.listdir(apnea_edf_path) 
                          if os.path.isdir(os.path.join(apnea_edf_path, f))]
        
        print(f"📊 Found {len(patient_folders)} patient folders")
        
        data = {}
        total_samples = 0
        
        for patient_folder in patient_folders:
            patient_path = os.path.join(apnea_edf_path, patient_folder)
            
            # Look for _ap.npy and _nap.npy files
            ap_file = os.path.join(patient_path, f"{patient_folder}_ap.npy")
            nap_file = os.path.join(patient_path, f"{patient_folder}_nap.npy")
            
            if os.path.exists(ap_file) and os.path.exists(nap_file):
                try:
                    # Load apnea data
                    ap_data = np.load(ap_file)
                    nap_data = np.load(nap_file)
                    
                    # Determine if these are single segments or arrays of segments
                    if ap_data.ndim == 1:
                        # Single segment
                        ap_data = ap_data.reshape(1, -1)
                    if nap_data.ndim == 1:
                        # Single segment
                        nap_data = nap_data.reshape(1, -1)
                    
                    # Combine data
                    patient_features = np.vstack([ap_data, nap_data])
                    patient_labels = np.concatenate([
                        np.ones(len(ap_data)),  # 1 for apnea
                        np.zeros(len(nap_data))  # 0 for normal
                    ])
                    
                    data[patient_folder] = {
                        'features': patient_features,
                        'labels': patient_labels,
                        'n_apnea': len(ap_data),
                        'n_normal': len(nap_data)
                    }
                    
                    total_samples += len(patient_features)
                    
                    print(f"  ✅ {patient_folder}: {len(ap_data)} apnea + {len(nap_data)} normal = {len(patient_features)} total")
                    
                except Exception as e:
                    print(f"  ⚠️  Error loading {patient_folder}: {e}")
                    continue
            else:
                print(f"  ❌ Missing files for {patient_folder}")
        
        print(f"📊 Total samples loaded: {total_samples}")
        return data
    
    def create_patient_wise_splits(self, data: Dict, train_ratio: float = 0.7, 
                                   val_ratio: float = 0.15, test_ratio: float = 0.15) -> Tuple[List, List, List]:
        """
        Split by PATIENT, not by individual audio segments
        This ensures complete patient isolation for proper evaluation
        """
        patient_ids = list(data.keys())
        n_patients = len(patient_ids)
        
        # Validate ratios
        if abs(train_ratio + val_ratio + test_ratio - 1.0) > 1e-6:
            raise ValueError("Train, validation, and test ratios must sum to 1.0")
        
        # Calculate split indices
        n_train = int(n_patients * train_ratio)
        n_val = int(n_patients * val_ratio)
        n_test = n_patients - n_train - n_val
        
        # Shuffle patients for random split
        np.random.seed(42)  # For reproducibility
        np.random.shuffle(patient_ids)
        
        train_patients = patient_ids[:n_train]
        val_patients = patient_ids[n_train:n_train + n_val]
        test_patients = patient_ids[n_train + n_val:]
        
        print(f"Split: {len(train_patients)} train, {len(val_patients)} val, {len(test_patients)} test patients")
        
        return train_patients, val_patients, test_patients
    
    def prepare_features_from_preprocessed(self, data: Dict[str, Any], patient_list: List[str]) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Extract features from preprocessed data for given patients"""
        all_features = []
        all_labels = []
        all_patient_ids = []
        
        for patient_id in patient_list:
            if patient_id in data:
                patient_data = data[patient_id]
                features = patient_data['features']
                labels = patient_data['labels']
                
                # Add patient ID for each sample
                patient_ids = [patient_id] * len(features)
                
                all_features.append(features)
                all_labels.append(labels)
                all_patient_ids.extend(patient_ids)
        
        if not all_features:
            raise ValueError("No data found for the specified patients")
        
        # Concatenate all data
        features = np.vstack(all_features)
        labels = np.concatenate(all_labels)
        
        print(f"📊 Prepared features: {features.shape}, labels: {labels.shape}, patients: {len(set(all_patient_ids))}")
        
        return features, labels, all_patient_ids
    
    def load_patient_data(self, dataset_path: str) -> Dict[str, np.ndarray]:
        """Legacy method - kept for compatibility"""
        return self.load_preprocessed_data(dataset_path)
    
    def extract_features(self, audio_segment: np.ndarray) -> np.ndarray:
        """Extract mel-spectrogram features from audio segment"""
        mel_spec = librosa.feature.melspectrogram(
            y=audio_segment, 
            sr=self.sample_rate,
            n_mels=64,
            hop_length=512
        )
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        return mel_spec_db.flatten()
    
    def prepare_training_data(self, dataset_path: str) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Legacy method - kept for compatibility"""
        data = self.load_preprocessed_data(dataset_path)
        features, labels, patient_ids = [], [], []
        
        for patient_id, patient_data in data.items():
            if patient_data['ap'] is not None and patient_data['nap'] is not None:
                # Apnea events
                for segment in patient_data['ap']:
                    if len(segment) == self.segment_samples:
                        features.append(self.extract_features(segment))
                        labels.append(1)
                        patient_ids.append(patient_id)
                
                # Normal events
                for segment in patient_data['nap']:
                    if len(segment) == self.segment_samples:
                        features.append(self.extract_features(segment))
                        labels.append(0)
                        patient_ids.append(patient_id)
        
        return np.array(features), np.array(labels), patient_ids
    
    def prepare_data_with_proper_splits(self, dataset_path: str, 
                                       train_ratio: float = 0.7,
                                       val_ratio: float = 0.15,
                                       test_ratio: float = 0.15) -> Dict[str, Tuple]:
        """
        Prepare data with proper train/validation/test splits
        Ensures testing occurs on completely unseen data
        """
        # Load all data
        data = self.load_preprocessed_data(dataset_path)
        
        # Create patient-wise splits
        train_patients, val_patients, test_patients = self.create_patient_wise_splits(
            data, train_ratio, val_ratio, test_ratio
        )
        
        # Prepare features for each split
        train_data = self.prepare_features_from_preprocessed(data, train_patients)
        val_data = self.prepare_features_from_preprocessed(data, val_patients)
        test_data = self.prepare_features_from_preprocessed(data, test_patients)
        
        return {
            'train': train_data,
            'validation': val_data,
            'test': test_data,
            'patient_splits': {
                'train': train_patients,
                'validation': val_patients,
                'test': test_patients
            }
        }
