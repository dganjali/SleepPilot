#!/usr/bin/env python3
"""
Diagnostic script to understand why the RL agent is being conservative
"""

import os
import numpy as np
from rl_agent import ApneaDetectionAgent
from apnea_env import ApneaDetectionEnv
from stable_baselines3 import PPO
import matplotlib.pyplot as plt

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

def diagnose_agent_behavior():
    """Analyze why the agent is being conservative"""
    print("🔍 DIAGNOSING AGENT BEHAVIOR")
    print("=" * 50)
    
    # Find the model
    model_path = find_model()
    if not model_path:
        print("❌ No model found!")
        return
    
    # Create test environment
    n_samples = 120  # 20 minutes of 10-second segments
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
        max_episode_length=120
    )
    
    # Load the model
    print("🤖 Loading trained agent...")
    loaded_model = PPO.load(model_path)
    print(f"✅ Model loaded successfully")
    
    # Create agent
    agent = ApneaDetectionAgent(env=test_env)
    agent.model = loaded_model
    
    # Analyze action distribution
    print("\n📊 ANALYZING ACTION DISTRIBUTION")
    print("=" * 40)
    
    action_counts = {0: 0, 1: 0, 2: 0}  # WAIT, DIAGNOSE, ESCALATE
    action_rewards = {0: [], 1: [], 2: []}
    action_confidences = {0: [], 1: [], 2: []}
    
    # Run a few episodes to collect data
    n_episodes = 5
    total_steps = 0
    
    for episode in range(n_episodes):
        print(f"\n📈 Episode {episode + 1}")
        obs, _ = test_env.reset()
        episode_reward = 0
        step_count = 0
        
        while step_count < 120:  # Max episode length
            # Get action from model
            action, _ = agent.model.predict(obs, deterministic=False)  # Use stochastic for analysis
            
            # Ensure action is a scalar integer
            if isinstance(action, np.ndarray):
                action = int(action.item())
            else:
                action = int(action)
            
            # Get action probabilities
            if hasattr(agent.model, 'policy'):
                # Convert numpy array to tensor for policy
                import torch
                obs_tensor = torch.FloatTensor(obs).unsqueeze(0)  # Add batch dimension
                action_probs = agent.model.policy.get_distribution(obs_tensor).distribution.probs
                action_probs = action_probs.detach().numpy().flatten()
            else:
                action_probs = [0.33, 0.33, 0.34]  # Default if can't get probabilities
            
            # Take step
            obs, reward, terminated, truncated, info = test_env.step(action)
            
            # Record data
            action_counts[action] += 1
            action_rewards[action].append(reward)
            if action == 1:  # DIAGNOSE
                action_confidences[action].append(action_probs[1])
            
            episode_reward += reward
            step_count += 1
            total_steps += 1
            
            if terminated or truncated:
                break
        
        print(f"  Steps: {step_count}, Reward: {episode_reward:.3f}")
    
    # Print action analysis
    print(f"\n📊 ACTION ANALYSIS (Total Steps: {total_steps})")
    print("=" * 50)
    
    action_names = {0: "WAIT", 1: "DIAGNOSE", 2: "ESCALATE"}
    
    for action in [0, 1, 2]:
        count = action_counts[action]
        percentage = (count / total_steps) * 100
        avg_reward = np.mean(action_rewards[action]) if action_rewards[action] else 0
        
        print(f"{action_names[action]} (Action {action}):")
        print(f"  Count: {count} ({percentage:.1f}%)")
        print(f"  Average Reward: {avg_reward:.4f}")
        
        if action == 1 and action_confidences[action]:  # DIAGNOSE
            avg_confidence = np.mean(action_confidences[action])
            print(f"  Average Confidence: {avg_confidence:.4f}")
    
    # Analyze why DIAGNOSE actions are rare
    print(f"\n🔍 WHY IS THE AGENT CONSERVATIVE?")
    print("=" * 40)
    
    if action_counts[1] == 0:
        print("❌ The agent NEVER chooses DIAGNOSE (Action 1)")
        print("   This explains why severity = 0.0000")
        print("\n💡 Possible reasons:")
        print("   1. Reward function too harsh on DIAGNOSE actions")
        print("   2. Training didn't learn when DIAGNOSE is beneficial")
        print("   3. Action space exploration too low during training")
        print("   4. Model overfitted to avoid risky predictions")
    else:
        diagnose_ratio = action_counts[1] / total_steps
        print(f"✅ Agent does DIAGNOSE sometimes ({diagnose_ratio:.1%})")
        print(f"   But still very conservative")
    
    # Check reward distribution
    print(f"\n💰 REWARD ANALYSIS")
    print("=" * 30)
    
    all_rewards = []
    for rewards in action_rewards.values():
        all_rewards.extend(rewards)
    
    if all_rewards:
        print(f"Overall Reward Stats:")
        print(f"  Mean: {np.mean(all_rewards):.4f}")
        print(f"  Std:  {np.std(all_rewards):.4f}")
        print(f"  Min:  {np.min(all_rewards):.4f}")
        print(f"  Max:  {np.max(all_rewards):.4f}")
        
        # Check if rewards are too negative
        negative_rewards = [r for r in all_rewards if r < 0]
        if negative_rewards:
            print(f"  Negative rewards: {len(negative_rewards)} ({len(negative_rewards)/len(all_rewards)*100:.1f}%)")
            print(f"  This might discourage DIAGNOSE actions")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS TO IMPROVE PERFORMANCE")
    print("=" * 50)
    
    if action_counts[1] == 0:
        print("1. 🎯 REWARD FUNCTION TUNING:")
        print("   - Reduce penalty for incorrect DIAGNOSE actions")
        print("   - Increase reward for correct DIAGNOSE actions")
        print("   - Add exploration bonus for trying DIAGNOSE")
        
        print("\n2. 🔧 TRAINING IMPROVEMENTS:")
        print("   - Increase entropy coefficient (ent_coef)")
        print("   - Reduce learning rate for more stable learning")
        print("   - Add curriculum learning (start simple, get complex)")
        
        print("\n3. 📊 DATA & ENVIRONMENT:")
        print("   - Ensure training data has balanced action examples")
        print("   - Add more diverse scenarios during training")
        print("   - Consider action masking for invalid actions")
    else:
        print("1. 🎯 FINE-TUNING:")
        print("   - Slightly increase DIAGNOSE rewards")
        print("   - Reduce WAIT action rewards")
        print("   - Balance action distribution")
    
    print(f"\n4. 🧠 MODEL ARCHITECTURE:")
    print("   - Consider deeper policy network")
    print("   - Add attention mechanisms for better feature understanding")
    print("   - Implement auxiliary tasks for better representation learning")
    
    return action_counts, action_rewards

if __name__ == "__main__":
    action_counts, action_rewards = diagnose_agent_behavior()
