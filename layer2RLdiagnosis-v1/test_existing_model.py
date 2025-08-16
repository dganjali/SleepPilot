#!/usr/bin/env python3
"""
Minimal test script for existing trained model
"""

from model_loader import load_trained_model
from apnea_env import ApneaDetectionEnv
import numpy as np

def quick_test():
    """Quick test of the trained model"""
    print("🧪 MINIMAL MODEL TEST")
    print("=" * 40)
    
    # Load the trained model using the new loader
    print("📦 Loading trained model...")
    model = load_trained_model()
    
    if not model:
        print("❌ Failed to load model!")
        return
    
    print("✅ Model loaded successfully!")
    
    # Create test environment
    n_samples = 60  # 10 minutes of 10-second segments
    n_features = 4096
    n_patients = 3
    
    features = np.random.randn(n_samples, n_features).astype(np.float32)
    labels = np.random.randint(0, 2, n_samples)
    patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
    
    test_env = ApneaDetectionEnv(
        features=features,
        labels=labels,
        patient_ids=patient_ids,
        mode='test',
        max_episode_length=60
    )
    
    # Quick evaluation
    print("📈 Running quick evaluation...")
    n_episodes = 3
    total_reward = 0
    total_severity = 0
    total_ahi = 0
    
    for episode in range(n_episodes):
        obs, _ = test_env.reset()
        episode_reward = 0
        step_count = 0
        
        while step_count < 60:  # Max episode length
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
            total_reward += episode_reward
            total_severity += metrics.get('severity_score', 0)
            total_ahi += metrics.get('ahi_score', 0)
    
    # Print results
    print("📊 QUICK RESULTS:")
    print(f"Mean Reward: {total_reward/n_episodes:.4f}")
    print(f"Mean Severity Score: {total_severity/n_episodes:.4f}")
    print(f"Mean AHI Score: {total_ahi/n_episodes:.2f} events/hour")
    print(f"Episodes: {n_episodes}")
    
    print("\n✅ Quick test completed!")

if __name__ == "__main__":
    quick_test()
