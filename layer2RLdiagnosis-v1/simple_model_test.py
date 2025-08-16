#!/usr/bin/env python3
"""
Simple test to just load the SB3 model
"""

import os
from stable_baselines3 import PPO

def test_model_loading():
    """Just test if we can load the model"""
    print("🧪 SIMPLE MODEL LOADING TEST")
    print("=" * 40)
    
    # Try different paths
    possible_paths = [
        "models/apnea-detection-rl_final.zip",  # Direct zip file
        "models/apnea-detection-rl_final",      # Extracted folder
        "best_model/best_model.zip"             # Alternative zip
    ]
    
    for path in possible_paths:
        print(f"\n🔍 Trying path: {path}")
        
        if not os.path.exists(path):
            print(f"  ❌ Path does not exist")
            continue
            
        try:
            print(f"  📁 Path exists, attempting to load...")
            model = PPO.load(path)
            print(f"  ✅ SUCCESS! Model loaded from {path}")
            print(f"  📊 Model type: {type(model)}")
            print(f"  🧠 Policy type: {type(model.policy)}")
            return model
        except Exception as e:
            print(f"  ❌ Failed to load: {e}")
    
    print("\n❌ Could not load model from any path")
    return None

if __name__ == "__main__":
    model = test_model_loading()
    if model:
        print("\n🎉 Model loading successful!")
    else:
        print("\n💥 Model loading failed!")
