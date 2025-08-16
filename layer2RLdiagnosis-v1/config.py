"""
Configuration file for Sleep Apnea Detection RL Project
"""

# Data Configuration
DATA_CONFIG = {
    'sample_rate': 16000,
    'segment_duration': 10.0,
    'n_mels': 64,
    'hop_length': 512,
    'feature_dim': 64 * 64,  # 4096
    'train_val_split': 0.8,
    'random_seed': 42
}

# Environment Configuration
ENV_CONFIG = {
    'max_episode_length': 100,
    'wait_reward': 0.0,
    'escalate_penalty': -0.1,
    'n_confidence_bins': 10
}

# RL Agent Configuration
RL_CONFIG = {
    'algorithm': 'PPO',
    'learning_rate': 3e-4,
    'n_steps': 2048,
    'batch_size': 64,
    'n_epochs': 10,
    'gamma': 0.99,
    'gae_lambda': 0.95,
    'clip_range': 0.2,
    'ent_coef': 0.01,
    'vf_coef': 0.5,
    'max_grad_norm': 0.5,
    'use_sde': False,
    'sde_sample_freq': -1,
    'target_kl': None
}

# Training Configuration
TRAINING_CONFIG = {
    'total_timesteps': 1000000,
    'eval_freq': 50000,
    'checkpoint_freq': 100000,
    'n_eval_episodes': 100,
    'tensorboard_log': './tensorboard_logs/',
    'verbose': 1
}

# Model Configuration
MODEL_CONFIG = {
    'model_name': 'apnea-detection-rl',
    'save_path': './models/',
    'best_model_path': './best_model/',
    'checkpoint_path': './checkpoints/',
    'logs_path': './logs/'
}

# Evaluation Configuration
EVAL_CONFIG = {
    'n_bins': 10,
    'confidence_threshold': 0.5,
    'severity_thresholds': {
        'normal': 5,
        'mild': 15,
        'moderate': 30,
        'severe': float('inf')
    }
}

# Audio Processing Configuration
AUDIO_CONFIG = {
    'resample_rate': 16000,
    'segment_overlap': 0.0,  # No overlap between segments
    'normalize_audio': True,
    'preemphasis': 0.97,
    'window_type': 'hann',
    'n_fft': 1024
}

# Feature Extraction Configuration
FEATURE_CONFIG = {
    'mel_type': 'power',
    'fmin': 0,
    'fmax': 8000,
    'n_mfcc': 13,
    'delta_order': 2,
    'normalization_method': 'standard'  # 'standard', 'minmax', 'robust'
}

# Logging Configuration
LOGGING_CONFIG = {
    'log_level': 'INFO',
    'log_format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'log_file': './logs/apnea_detection.log',
    'console_output': True,
    'file_output': True
}

# Visualization Configuration
VIZ_CONFIG = {
    'figure_size': (15, 12),
    'dpi': 300,
    'save_format': 'png',
    'style': 'seaborn-v0_8',
    'color_palette': 'husl',
    'alpha': 0.7
}

# Hugging Face Configuration
HF_CONFIG = {
    'repo_id': 'your-username/apnea-detection-rl',
    'commit_message': 'Add trained apnea detection model',
    'model_card_template': True,
    'push_to_hub': False  # Set to True when ready to upload
}

# Experimental Configuration
EXPERIMENT_CONFIG = {
    'use_synthetic_data': True,  # Set to False for real dataset
    'synthetic_samples': 1000,
    'synthetic_patients': 50,
    'enable_wandb': False,
    'wandb_project': 'apnea-detection-rl',
    'wandb_entity': None
}

# Validation Configuration
VALIDATION_CONFIG = {
    'cross_validation_folds': 5,
    'stratified_splitting': True,
    'patient_wise_split': True,
    'test_size': 0.2,
    'validation_size': 0.1
}

# Performance Configuration
PERFORMANCE_CONFIG = {
    'num_workers': 4,
    'pin_memory': True,
    'prefetch_factor': 2,
    'persistent_workers': True,
    'use_cuda': True,
    'mixed_precision': False
}

def get_config():
    """Return complete configuration dictionary"""
    return {
        'data': DATA_CONFIG,
        'environment': ENV_CONFIG,
        'rl': RL_CONFIG,
        'training': TRAINING_CONFIG,
        'model': MODEL_CONFIG,
        'evaluation': EVAL_CONFIG,
        'audio': AUDIO_CONFIG,
        'features': FEATURE_CONFIG,
        'logging': LOGGING_CONFIG,
        'visualization': VIZ_CONFIG,
        'huggingface': HF_CONFIG,
        'experiment': EXPERIMENT_CONFIG,
        'validation': VALIDATION_CONFIG,
        'performance': PERFORMANCE_CONFIG
    }

def update_config(config_name: str, key: str, value):
    """Update a specific configuration value"""
    config = get_config()
    if config_name in config and key in config[config_name]:
        config[config_name][key] = value
        return True
    return False

def print_config():
    """Print current configuration"""
    config = get_config()
    print("Current Configuration:")
    print("=" * 50)
    for section, params in config.items():
        print(f"\n{section.upper()}:")
        for key, value in params.items():
            print(f"  {key}: {value}")
