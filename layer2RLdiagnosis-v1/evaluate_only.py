#!/usr/bin/env python3
"""
Evaluation script for existing trained model
"""

from model_loader import load_trained_model
from data_loader import PSGAudioLoader
from apnea_env import ApneaDetectionEnv
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def quick_evaluate():
    """Quick evaluation of the trained model"""
    print("🧪 EVALUATING EXISTING MODEL")
    print("=" * 50)
    
    # Load the trained model using the new loader
    print("📦 Loading trained model...")
    model = load_trained_model()
    
    if not model:
        print("❌ Failed to load model!")
        return
    
    print("✅ Model loaded successfully!")
    
    # Try to load real data, fallback to synthetic
    try:
        print("📊 Attempting to load Kaggle dataset...")
        data_loader = PSGAudioLoader()
        dataset_path = data_loader.download_dataset()
        
        # Use synthetic data for now (you can modify this to use real data)
        print("🔄 Using synthetic data for evaluation...")
        raise Exception("Using synthetic data for now")
        
    except Exception as e:
        print(f"⚠️  Using synthetic data: {e}")
        
        # Create synthetic test data
        n_samples = 120  # 20 minutes of 10-second segments
        n_features = 4096
        n_patients = 5
        
        features = np.random.randn(n_samples, n_features).astype(np.float32)
        labels = np.random.randint(0, 2, n_samples)
        patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
        
        test_env = ApneaDetectionEnv(
            features=features,
            labels=labels,
            patient_ids=patient_ids,
            mode='test',
            max_episode_length=120
        )
    
    # Evaluation
    print("📈 Running evaluation...")
    n_episodes = 10
    total_reward = 0
    total_accuracy = 0
    total_ece = 0
    total_severity = 0
    total_ahi = 0
    total_confidence = 0
    
    episode_metrics = []
    
    for episode in range(n_episodes):
        obs, _ = test_env.reset()
        episode_reward = 0
        step_count = 0
        
        while step_count < 120:  # Max episode length
            action, _ = model.predict(obs, deterministic=True)
            
            # Ensure action is a scalar integer
            if isinstance(action, np.ndarray):
                action = int(action.item())
            else:
                action = int(action)
            
            obs, reward, terminated, truncated, info = test_env.step(action)
            episode_reward += reward
            step_count += 1
            
            if terminated or truncated:
                break
        
        # Get episode metrics
        metrics = test_env.get_episode_metrics()
        if metrics:
            episode_metrics.append(metrics)
            total_reward += episode_reward
            total_accuracy += metrics.get('accuracy', 0)
            total_ece += metrics.get('ece', 0)
            total_severity += metrics.get('severity_score', 0)
            total_ahi += metrics.get('ahi_score', 0)
            total_confidence += metrics.get('mean_confidence', 0)
    
    # Print results
    print("\n📊 EVALUATION RESULTS:")
    print("=" * 40)
    print(f"Mean Reward: {total_reward/n_episodes:.4f}")
    print(f"Mean Accuracy: {total_accuracy/n_episodes:.4f}")
    print(f"Mean ECE: {total_ece/n_episodes:.4f}")
    print(f"Mean Severity Score: {total_severity/n_episodes:.4f}")
    print(f"Mean AHI Score: {total_ahi/n_episodes:.2f} events/hour")
    print(f"Mean Confidence: {total_confidence/n_episodes:.4f}")
    print(f"Episodes Evaluated: {n_episodes}")
    
    # Show detailed results
    if episode_metrics:
        print(f"\n📋 DETAILED APNEA EVENT ANALYSIS:")
        print("=" * 40)
        
        total_apnea_events = 0
        total_confidence = 0
        event_count = 0
        
        for i, metrics in enumerate(episode_metrics):
            if 'apnea_event_details' in metrics:
                n_events = len(metrics['apnea_event_details'])
                if n_events > 0:
                    total_apnea_events += n_events
                    patient_confidences = [event['confidence'] for event in metrics['apnea_event_details']]
                    total_confidence += sum(patient_confidences)
                    event_count += n_events
                    
                    print(f"  Episode {i+1}: {n_events} apnea events")
                    print(f"    - Severity: {metrics.get('severity_score', 'N/A'):.3f}")
                    print(f"    - AHI: {metrics.get('ahi_score', 'N/A'):.2f} events/hour")
                    print(f"    - Duration: {metrics.get('total_duration_minutes', 'N/A'):.1f} minutes")
                    print(f"    - Avg Confidence: {np.mean(patient_confidences):.3f}")
        
        if event_count > 0:
            print(f"\n📊 AGGREGATE STATISTICS:")
            print(f"  Total Apnea Events: {total_apnea_events}")
            print(f"  Average Confidence per Event: {total_confidence/event_count:.3f}")
            print(f"  Events per Episode: {event_count/n_episodes:.2f}")
    
    # Quick visualization
    print("\n📊 Creating quick visualizations...")
    try:
        create_quick_visualizations(episode_metrics)
        print("✅ Visualizations created!")
    except Exception as e:
        print(f"⚠️  Visualization failed: {e}")
    
    print("\n✅ Evaluation completed!")

def create_quick_visualizations(episode_metrics):
    """Create quick visualizations of the results"""
    if not episode_metrics:
        return
    
    # Extract data
    severities = [m.get('severity_score', 0) for m in episode_metrics]
    accuracies = [m.get('accuracy', 0) for m in episode_metrics]
    eces = [m.get('ece', 0) for m in episode_metrics]
    confidences = [m.get('mean_confidence', 0) for m in episode_metrics]
    
    # Create plots
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Quick Evaluation Results', fontsize=14, fontweight='bold')
    
    # Severity distribution
    axes[0, 0].hist(severities, bins=10, alpha=0.7, edgecolor='black')
    axes[0, 0].set_xlabel('Severity Score')
    axes[0, 0].set_ylabel('Frequency')
    axes[0, 0].set_title('Severity Distribution')
    axes[0, 0].axvline(np.mean(severities), color='red', linestyle='--', 
                       label=f'Mean: {np.mean(severities):.3f}')
    axes[0, 0].legend()
    
    # Accuracy distribution
    axes[0, 1].hist(accuracies, bins=10, alpha=0.7, edgecolor='black')
    axes[0, 1].set_xlabel('Accuracy')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].set_title('Accuracy Distribution')
    axes[0, 1].axvline(np.mean(accuracies), color='red', linestyle='--',
                       label=f'Mean: {np.mean(accuracies):.3f}')
    axes[0, 1].legend()
    
    # ECE vs Confidence
    axes[1, 0].scatter(confidences, eces, alpha=0.6)
    axes[1, 0].set_xlabel('Mean Confidence')
    axes[1, 0].set_ylabel('Expected Calibration Error (ECE)')
    axes[1, 0].set_title('ECE vs Confidence')
    
    # Severity vs Accuracy
    axes[1, 1].scatter(severities, accuracies, alpha=0.6)
    axes[1, 1].set_xlabel('Severity Score')
    axes[1, 1].set_ylabel('Accuracy')
    axes[1, 1].set_title('Severity vs Accuracy')
    
    plt.tight_layout()
    plt.savefig('./visualizations/quick_evaluation.png', dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    quick_evaluate()
