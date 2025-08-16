#!/usr/bin/env python3
"""
Debug script to step through the environment and see what's happening
"""

import os
import numpy as np
from rl_agent import ApneaDetectionAgent
from apnea_env import ApneaDetectionEnv
from stable_baselines3 import PPO

def find_model():
    """Find the actual trained model"""
    zip_paths = [
        "models/apnea-detection-rl_final.zip",
        "best_model/best_model.zip"
    ]
    
    for zip_path in zip_paths:
        if os.path.exists(zip_path):
            print(f"📦 Found working zip file: {zip_path}")
            return zip_path
    
    return None

def debug_environment():
    """Step through environment to debug severity calculation"""
    print("🔍 DEBUGGING ENVIRONMENT STEP-BY-STEP")
    print("=" * 50)
    
    # Find the model
    model_path = find_model()
    if not model_path:
        print("❌ No model found!")
        return
    
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
    
    # Load the model
    print("🤖 Loading trained agent...")
    loaded_model = PPO.load(model_path)
    print(f"✅ Model loaded successfully")
    
    # Create agent
    agent = ApneaDetectionAgent(env=test_env)
    agent.model = loaded_model
    
    # Step through one episode manually
    print("\n📈 STEPPING THROUGH ONE EPISODE")
    print("=" * 40)
    
    obs, _ = test_env.reset()
    episode_reward = 0
    step_count = 0
    diagnose_count = 0
    
    print(f"Episode started with patient: {test_env.current_patient}")
    print(f"Total available steps: {len(test_env.patient_data[test_env.current_patient]['features'])}")
    
    while step_count < 60:  # Max episode length
        # Get action from model
        action, _ = agent.model.predict(obs, deterministic=True)
        
        # Ensure action is a scalar integer
        if isinstance(action, np.ndarray):
            action = int(action.item())
        else:
            action = int(action)
        
        action_names = {0: "WAIT", 1: "DIAGNOSE", 2: "ESCALATE"}
        
        print(f"\nStep {step_count + 1}:")
        print(f"  Action: {action_names[action]} (Action {action})")
        
        # Take step
        obs, reward, terminated, truncated, info = test_env.step(action)
        
        print(f"  Reward: {reward:.4f}")
        print(f"  Terminated: {terminated}, Truncated: {truncated}")
        
        if action == 1:  # DIAGNOSE
            diagnose_count += 1
            print(f"  DIAGNOSE action taken! Count: {diagnose_count}")
            
            # Check what was stored
            if test_env.episode_predictions:
                last_prediction = test_env.episode_predictions[-1]
                last_confidence = test_env.episode_confidences[-1]
                print(f"  Last prediction: {last_prediction}, Confidence: {last_confidence:.3f}")
        
        episode_reward += reward
        step_count += 1
        
        if terminated or truncated:
            print(f"\nEpisode ended after {step_count} steps")
            break
    
    print(f"\n📊 EPISODE SUMMARY")
    print("=" * 30)
    print(f"Total steps: {step_count}")
    print(f"Total reward: {episode_reward:.4f}")
    print(f"DIAGNOSE actions: {diagnose_count}")
    
    # Check episode metrics
    print(f"\n📋 EPISODE METRICS")
    print("=" * 30)
    
    if test_env.episode_predictions:
        print(f"Total predictions: {len(test_env.episode_predictions)}")
        print(f"Predictions: {test_env.episode_predictions}")
        print(f"Confidences: {[f'{c:.3f}' for c in test_env.episode_confidences]}")
        print(f"Timestamps: {[f'{t:.1f}s' for t in test_env.episode_timestamps]}")
        
        # Count apnea predictions
        apnea_predictions = sum(test_env.episode_predictions)
        print(f"Apnea predictions (1s): {apnea_predictions}")
        print(f"Normal predictions (0s): {len(test_env.episode_predictions) - apnea_predictions}")
        
        # Get metrics
        metrics = test_env.get_episode_metrics()
        if metrics:
            print(f"\n📊 CALCULATED METRICS:")
            print(f"  Severity Score: {metrics['severity_score']:.4f}")
            print(f"  AHI Score: {metrics['ahi_score']:.2f} events/hour")
            print(f"  Apnea Events: {metrics['n_apnea_events']}")
            print(f"  Total Duration: {metrics['total_duration_minutes']:.1f} minutes")
            
            if 'apnea_event_details' in metrics:
                print(f"  Apnea Event Details: {len(metrics['apnea_event_details'])} events")
                for i, event in enumerate(metrics['apnea_event_details'][:5]):  # Show first 5
                    print(f"    Event {i+1}: Time={event['timestamp']:.1f}s, Confidence={event['confidence']:.3f}")
        else:
            print("❌ No metrics available")
    else:
        print("❌ No predictions made during episode")
    
    return test_env

if __name__ == "__main__":
    env = debug_environment()
