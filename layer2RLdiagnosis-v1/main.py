#!/usr/bin/env python3
"""
Main script for Sleep Apnea Detection using Reinforcement Learning
"""

import os
import numpy as np
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import json
import torch

from data_loader import PSGAudioLoader
from apnea_env import ApneaDetectionEnv
from rl_agent import ApneaDetectionAgent

def setup_directories():
    """Create necessary directories for the project"""
    dirs = [
        "./models",
        "./logs", 
        "./checkpoints",
        "./best_model",
        "./tensorboard_logs",
        "./results",
        "./visualizations"
    ]
    
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)

def train_and_evaluate():
    """Main training and evaluation pipeline with proper data splitting"""
    print("🚀 Starting Sleep Apnea Detection RL Project")
    print("=" * 60)
    
    # Setup directories
    setup_directories()
    
    # Initialize data loader
    print("📊 Loading PSG Audio Dataset...")
    data_loader = PSGAudioLoader()
    
    try:
        # Try to download dataset first
        print("🔽 Attempting to download dataset from Kaggle...")
        dataset_path = data_loader.download_dataset()
        print(f"Dataset downloaded to: {dataset_path}")
        
        # Use the new proper data splitting method
        print("🔄 Creating patient-wise train/validation/test splits...")
        data_splits = data_loader.prepare_data_with_proper_splits(
            dataset_path, 
            train_ratio=0.7, 
            val_ratio=0.15, 
            test_ratio=0.15
        )
        
        # Extract data for each split
        train_features, train_labels, train_patient_ids = data_splits['train']
        val_features, val_labels, val_patient_ids = data_splits['validation']
        test_features, test_labels, test_patient_ids = data_splits['test']
        
        print(f"✅ Dataset loaded successfully!")
        print(f"   Training: {len(train_features)} samples from {len(set(train_patient_ids))} patients")
        print(f"   Validation: {len(val_features)} samples from {len(set(val_patient_ids))} patients")
        print(f"   Test: {len(test_features)} samples from {len(set(test_patient_ids))} patients")
        print(f"   Feature dimension: {train_features.shape[1]}")
        print(f"   Class distribution (train): {np.bincount(train_labels)}")
        
    except Exception as e:
        print(f"⚠️  Dataset loading failed: {e}")
        print("Creating synthetic data for demonstration...")
        
        # Create synthetic data for demonstration
        n_samples = 1000
        n_features = 4096  # 64 * 64 mel-spectrogram
        n_patients = 50
        
        features = np.random.randn(n_samples, n_features).astype(np.float32)
        labels = np.random.randint(0, 2, n_samples)
        patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
        
        # Split synthetic data
        train_idx, temp_idx = train_test_split(
            range(len(features)), 
            test_size=0.3, 
            stratify=labels,
            random_state=42
        )
        
        val_idx, test_idx = train_test_split(
            temp_idx,
            test_size=0.5,
            stratify=[labels[i] for i in temp_idx],
            random_state=42
        )
        
        train_features, train_labels, train_patient_ids = features[train_idx], labels[train_idx], [patient_ids[i] for i in train_idx]
        val_features, val_labels, val_patient_ids = features[val_idx], labels[val_idx], [patient_ids[i] for i in val_idx]
        test_features, test_labels, test_patient_ids = features[test_idx], labels[test_idx], [patient_ids[i] for i in test_idx]
        
        print(f"Created synthetic data: {n_samples} samples, {n_features} features")
    
    # Create environments for each split
    print("🎮 Creating RL environments...")
    train_env = ApneaDetectionEnv(
        train_features, 
        train_labels, 
        train_patient_ids,
        mode='train'
    )
    
    val_env = ApneaDetectionEnv(
        val_features, 
        val_labels, 
        val_patient_ids,
        mode='validation'
    )
    
    test_env = ApneaDetectionEnv(
        test_features, 
        test_labels, 
        test_patient_ids,
        mode='test'
    )
    
    print(f"✅ Environments created successfully")
    
    # Initialize RL agent
    print("🤖 Initializing RL Agent (PPO)...")
    agent = ApneaDetectionAgent(
        env=train_env,
        learning_rate=3e-4,
        n_steps=2048
    )
    
    # Training
    print("🎯 Starting Training...")
    training_results = agent.train(total_timesteps=500000)  # Adjust based on dataset size
    print(f"Training completed: {training_results}")
    
    # Save the trained model in a more accessible format
    print("💾 Saving trained model...")
    try:
        # Save the PPO model using SB3's save method (creates ZIP)
        zip_model_path = "./models/apnea-detection-rl_final.zip"
        agent.model.save(zip_model_path)
        print(f"✅ Model saved as ZIP: {zip_model_path}")
        
        # Also save model components separately for easier access
        print("📁 Saving model components separately...")
        
        # Save policy network weights
        policy_weights_path = "./models/policy_weights.pt"
        torch.save(agent.model.policy.state_dict(), policy_weights_path)
        print(f"✅ Policy weights saved: {policy_weights_path}")
        
        # Save value function weights
        value_weights_path = "./models/value_weights.pt"
        torch.save(agent.model.policy.value_net.state_dict(), value_weights_path)
        print(f"✅ Value function weights saved: {value_weights_path}")
        
        # Save model configuration
        config_path = "./models/model_config.json"
        model_config = {
            'policy_type': 'MlpPolicy',
            'learning_rate': 3e-4,
            'n_steps': 2048,
            'batch_size': 64,
            'n_epochs': 10,
            'gamma': 0.99,
            'gae_lambda': 0.95,
            'clip_range': 0.2,
            'ent_coef': 0.05,
            'vf_coef': 0.5,
            'max_grad_norm': 0.5,
            'observation_space': str(agent.env.observation_space),
            'action_space': str(agent.env.action_space),
            'training_timesteps': 500000,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        with open(config_path, 'w') as f:
            json.dump(model_config, f, indent=2)
        print(f"✅ Model config saved: {config_path}")
        
        # Create a simple model loader script
        loader_script_path = "./models/load_model.py"
        loader_script = '''#!/usr/bin/env python3
"""
Simple script to load the trained model components
"""

import torch
import json
from stable_baselines3 import PPO
from stable_baselines3.common.policies import MlpPolicy
from stable_baselines3.common.vec_env import DummyVecEnv
import numpy as np

def load_trained_model():
    """Load the trained model from saved components"""
    try:
        # Load model configuration
        with open("./models/model_config.json", 'r') as f:
            config = json.load(f)
        
        print(f"Loading model with config: {config}")
        
        # Create a dummy environment to initialize the model
        # (We need this because SB3 requires an environment to create a model)
        dummy_features = np.random.randn(10, 4096).astype(np.float32)
        dummy_labels = np.random.randint(0, 2, 10)
        dummy_patient_ids = ["dummy"] * 10
        
        from apnea_env import ApneaDetectionEnv
        dummy_env = ApneaDetectionEnv(
            dummy_features, dummy_labels, dummy_patient_ids, mode='test'
        )
        
        # Create new PPO model with same configuration
        model = PPO(
            "MlpPolicy",
            dummy_env,
            learning_rate=config['learning_rate'],
            n_steps=config['n_steps'],
            batch_size=config['batch_size'],
            n_epochs=config['n_epochs'],
            gamma=config['gamma'],
            gae_lambda=config['gae_lambda'],
            clip_range=config['clip_range'],
            normalize_advantage=True,
            ent_coef=config['ent_coef'],
            vf_coef=config['vf_coef'],
            max_grad_norm=config['max_grad_norm'],
            verbose=0
        )
        
        # Load the trained weights
        policy_weights = torch.load("./models/policy_weights.pt")
        value_weights = torch.load("./models/value_weights.pt")
        
        # Apply weights to the model
        model.policy.load_state_dict(policy_weights)
        model.policy.value_net.load_state_dict(value_weights)
        
        print("✅ Model loaded successfully from saved components!")
        return model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

if __name__ == "__main__":
    model = load_trained_model()
    if model:
        print("Model is ready for use!")
'''
        
        with open(loader_script_path, 'w') as f:
            f.write(loader_script)
        print(f"✅ Model loader script saved: {loader_script_path}")
        
        # Create a README for model loading
        readme_path = "./models/README.md"
        readme_content = '''# Model Loading Instructions

## Option 1: Load from ZIP (Original SB3 format)
```python
from stable_baselines3 import PPO
model = PPO.load("./models/apnea-detection-rl_final.zip")
```

## Option 2: Load from separate components (Recommended)
```python
# Use the provided loader script
from models.load_model import load_trained_model
model = load_trained_model()
```

## Option 3: Manual loading
```python
import torch
from stable_baselines3 import PPO

# Create dummy environment first
dummy_env = create_dummy_env()  # You need to implement this

# Create model with same config
model = PPO("MlpPolicy", dummy_env, ...)

# Load weights
model.policy.load_state_dict(torch.load("./models/policy_weights.pt"))
model.policy.value_net.load_state_dict(torch.load("./models/value_weights.pt"))
```

## Files in this directory:
- `apnea-detection-rl_final.zip` - Original SB3 model (ZIP format)
- `policy_weights.pt` - Policy network weights (PyTorch format)
- `value_weights.pt` - Value function weights (PyTorch format)
- `model_config.json` - Model configuration and hyperparameters
- `load_model.py` - Helper script to load the model
- `README.md` - This file

## Note:
The ZIP file is the standard SB3 format but can cause issues on some systems.
The separate component files provide a more robust alternative.
'''
        
        with open(readme_path, 'w') as f:
            f.write(readme_content)
        print(f"✅ Model README saved: {readme_path}")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not save model components separately: {e}")
        print("   Model saved as ZIP only")
    
    # Evaluation on validation set
    print("📈 Evaluating on Validation Set...")
    val_results = agent.evaluate(n_eval_episodes=50)
    
    # Evaluation on test set (unseen data)
    print("🧪 Evaluating on Test Set (Unseen Data)...")
    # Temporarily replace agent's environment for test evaluation
    original_env = agent.env
    agent.env = test_env
    test_results = agent.evaluate(n_eval_episodes=50)
    agent.env = original_env  # Restore original environment
    
    # Save results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    results_file = f"./results/evaluation_results_{timestamp}.json"
    
    all_results = {
        'training': training_results,
        'validation': val_results,
        'test': test_results,
        'data_info': {
            'train_samples': len(train_features),
            'val_samples': len(val_features),
            'test_samples': len(test_features),
            'train_patients': len(set(train_patient_ids)),
            'val_patients': len(set(val_patient_ids)),
            'test_patients': len(set(test_patient_ids))
        }
    }
    
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2, default=str)
    
    print(f"Results saved to: {results_file}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TRAINING SUMMARY")
    print("=" * 60)
    print(f"Validation Set Results:")
    print(f"  Mean Reward: {val_results.get('mean_reward', 'N/A'):.4f}")
    print(f"  Mean Accuracy: {val_results.get('mean_accuracy', 'N/A'):.4f}")
    print(f"  Mean ECE: {val_results.get('mean_ece', 'N/A'):.4f}")
    print(f"  Mean Severity Score: {val_results.get('mean_severity', 'N/A'):.4f}")
    print(f"  Mean AHI Score: {val_results.get('mean_ahi_score', 'N/A'):.2f} events/hour")
    
    print(f"\nTest Set Results (Unseen Data):")
    print(f"  Mean Reward: {test_results.get('mean_reward', 'N/A'):.4f}")
    print(f"  Mean Accuracy: {test_results.get('mean_accuracy', 'N/A'):.4f}")
    print(f"  Mean ECE: {test_results.get('mean_ece', 'N/A'):.4f}")
    print(f"  Mean Severity Score: {test_results.get('mean_severity', 'N/A'):.4f}")
    print(f"  Mean AHI Score: {test_results.get('mean_ahi_score', 'N/A'):.2f} events/hour")
    
    print(f"\nEpisodes Evaluated: Val={val_results.get('n_episodes', 'N/A')}, Test={test_results.get('n_episodes', 'N/A')}")
    
    # Display detailed apnea event information
    if 'patient_metrics' in test_results:
        print(f"\n📋 DETAILED APNEA EVENT ANALYSIS:")
        print("=" * 40)
        
        total_apnea_events = 0
        total_confidence = 0
        event_count = 0
        
        for patient_id, metrics_list in test_results['patient_metrics'].items():
            for metrics in metrics_list:
                if 'apnea_event_details' in metrics:
                    n_events = len(metrics['apnea_event_details'])
                    if n_events > 0:
                        total_apnea_events += n_events
                        patient_confidences = [event['confidence'] for event in metrics['apnea_event_details']]
                        total_confidence += sum(patient_confidences)
                        event_count += n_events
                        
                        print(f"  Patient {patient_id}: {n_events} apnea events")
                        print(f"    - Severity: {metrics.get('severity_score', 'N/A'):.3f}")
                        print(f"    - AHI: {metrics.get('ahi_score', 'N/A'):.2f} events/hour")
                        print(f"    - Duration: {metrics.get('total_duration_minutes', 'N/A'):.1f} minutes")
                        print(f"    - Avg Confidence: {np.mean(patient_confidences):.3f}")
        
        if event_count > 0:
            print(f"\n📊 AGGREGATE STATISTICS:")
            print(f"  Total Apnea Events: {total_apnea_events}")
            print(f"  Average Confidence per Event: {total_confidence/event_count:.3f}")
            print(f"  Events per Episode: {event_count/test_results.get('n_episodes', 1):.2f}")
    
    return agent, all_results

def visualize_results(eval_results):
    """Create visualizations of the results"""
    print("📊 Creating visualizations...")
    
    # Set style
    plt.style.use('seaborn-v0_8')
    sns.set_palette("husl")
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Sleep Apnea Detection RL Agent - Evaluation Results', fontsize=16, fontweight='bold')
    
    # Function to plot metrics for a dataset
    def plot_dataset_metrics(axes_row, dataset_name, results):
        if 'patient_metrics' not in results:
            return
        
        patient_accuracies = []
        eces = []
        confidences = []
        severities = []
        
        for patient_id, metrics_list in results['patient_metrics'].items():
            for metrics in metrics_list:
                patient_accuracies.append(metrics['accuracy'])
                eces.append(metrics['ece'])
                confidences.append(metrics['mean_confidence'])
                severities.append(metrics['severity_score'])
        
        if patient_accuracies:
            # Accuracy distribution
            axes[axes_row, 0].hist(patient_accuracies, bins=20, alpha=0.7, edgecolor='black')
            axes[axes_row, 0].set_xlabel('Accuracy')
            axes[axes_row, 0].set_ylabel('Frequency')
            axes[axes_row, 0].set_title(f'{dataset_name} - Accuracy Distribution')
            axes[axes_row, 0].axvline(np.mean(patient_accuracies), color='red', linestyle='--', 
                                     label=f'Mean: {np.mean(patient_accuracies):.3f}')
            axes[axes_row, 0].legend()
            
            # ECE vs Confidence correlation
            axes[axes_row, 1].scatter(confidences, eces, alpha=0.6)
            axes[axes_row, 1].set_xlabel('Mean Confidence')
            axes[axes_row, 1].set_ylabel('Expected Calibration Error (ECE)')
            axes[axes_row, 1].set_title(f'{dataset_name} - ECE vs Confidence')
            
            # Severity distribution
            axes[axes_row, 2].hist(severities, bins=20, alpha=0.7, edgecolor='black')
            axes[axes_row, 2].set_xlabel('Severity Score')
            axes[axes_row, 2].set_ylabel('Frequency')
            axes[axes_row, 2].set_title(f'{dataset_name} - Severity Distribution')
            axes[axes_row, 2].axvline(np.mean(severities), color='red', linestyle='--',
                                     label=f'Mean: {np.mean(severities):.3f}')
            axes[axes_row, 2].legend()
    
    # Plot validation set results
    if 'validation' in eval_results:
        plot_dataset_metrics(0, 'Validation', eval_results['validation'])
    
    # Plot test set results
    if 'test' in eval_results:
        plot_dataset_metrics(1, 'Test', eval_results['test'])
    
    # Adjust layout and save
    plt.tight_layout()
    viz_file = f"./visualizations/results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    plt.savefig(viz_file, dpi=300, bbox_inches='tight')
    print(f"Visualizations saved to: {viz_file}")
    
    plt.show()

def main():
    """Main execution function"""
    try:
        # Train and evaluate
        agent, eval_results = train_and_evaluate()
        
        # Create visualizations
        visualize_results(eval_results)
        
        print("\n🎉 Project completed successfully!")
        print("📁 Check the following directories for outputs:")
        print("   - ./models/ - Trained models")
        print("   - ./results/ - Evaluation results")
        print("   - ./visualizations/ - Charts and graphs")
        print("   - ./logs/ - Training logs")
        
    except Exception as e:
        print(f"❌ Error during execution: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
