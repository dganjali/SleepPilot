#!/usr/bin/env python3
"""
Model loader utility for the trained RL agent
Loads models from separate component files instead of ZIP
"""

import os
import torch
import json
import numpy as np
from stable_baselines3 import PPO
from apnea_env import ApneaDetectionEnv

def create_dummy_env():
    """Create a minimal dummy environment for model initialization"""
    dummy_features = np.random.randn(10, 4096).astype(np.float32)
    dummy_labels = np.random.randint(0, 2, 10)
    dummy_patient_ids = ["dummy"] * 10
    
    return ApneaDetectionEnv(
        dummy_features, dummy_labels, dummy_patient_ids, mode='test'
    )

def load_model_from_components():
    """Load the trained model from separate component files"""
    try:
        # Check if component files exist
        required_files = [
            "./models/policy_weights.pt",
            "./models/value_weights.pt", 
            "./models/model_config.json"
        ]
        
        missing_files = [f for f in required_files if not os.path.exists(f)]
        if missing_files:
            print(f"❌ Missing required files: {missing_files}")
            print("   Please run main.py first to train and save the model")
            return None
        
        # Load model configuration
        with open("./models/model_config.json", 'r') as f:
            config = json.load(f)
        
        print(f"📋 Loading model with configuration:")
        for key, value in config.items():
            if key != 'observation_space' and key != 'action_space':
                print(f"   {key}: {value}")
        
        # Create dummy environment (required by SB3)
        print("🎮 Creating dummy environment for model initialization...")
        dummy_env = create_dummy_env()
        
        # Create new PPO model with same configuration
        print("🤖 Initializing PPO model...")
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
        print("📥 Loading trained weights...")
        policy_weights = torch.load("./models/policy_weights.pt")
        value_weights = torch.load("./models/value_weights.pt")
        
        # Apply weights to the model
        model.policy.load_state_dict(policy_weights)
        model.policy.value_net.load_state_dict(value_weights)
        
        print("✅ Model loaded successfully from saved components!")
        return model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

def load_model_fallback():
    """Fallback: try to load from ZIP if components fail"""
    try:
        zip_path = "./models/apnea-detection-rl_final.zip"
        if os.path.exists(zip_path):
            print(f"🔄 Falling back to ZIP model: {zip_path}")
            model = PPO.load(zip_path)
            print("✅ Model loaded from ZIP successfully!")
            return model
        else:
            print("❌ No ZIP model found either")
            return None
    except Exception as e:
        print(f"❌ ZIP loading also failed: {e}")
        return None

def load_trained_model():
    """Main function to load the trained model with fallback"""
    print("🔍 LOADING TRAINED MODEL")
    print("=" * 40)
    
    # Try loading from components first
    model = load_model_from_components()
    
    if model is None:
        print("\n⚠️  Component loading failed, trying fallback...")
        model = load_model_fallback()
    
    if model is None:
        print("\n❌ Failed to load model from all sources!")
        print("   Please ensure you have:")
        print("   1. Run main.py to train the model")
        print("   2. Check that ./models/ directory contains the saved files")
        return None
    
    print(f"\n🎯 Model loaded successfully!")
    print(f"   Policy type: {type(model.policy).__name__}")
    print(f"   Observation space: {model.observation_space}")
    print(f"   Action space: {model.action_space}")
    
    return model

if __name__ == "__main__":
    # Test the model loader
    model = load_trained_model()
    if model:
        print("\n🧪 Testing model prediction...")
        
        # Create a test observation
        test_obs = np.random.randn(4096).astype(np.float32)
        
        # Get prediction
        action, _ = model.predict(test_obs, deterministic=True)
        print(f"   Test observation shape: {test_obs.shape}")
        print(f"   Predicted action: {action}")
        print(f"   Action type: {type(action)}")
        
        print("\n✅ Model is working correctly!")
    else:
        print("\n❌ Model loading failed!")
