#!/usr/bin/env python3
"""
Test script to verify the RL implementation works correctly with enhanced data handling
"""

import numpy as np
import os
from data_loader import PSGAudioLoader
from apnea_env import ApneaDetectionEnv
from rl_agent import ApneaDetectionAgent
from utils import calculate_ece, aggregate_patient_metrics

def test_data_loader():
    """Test enhanced data loader functionality"""
    print("🧪 Testing Enhanced Data Loader...")
    
    loader = PSGAudioLoader()
    
    # Test feature extraction
    test_audio = np.random.randn(160000)  # 10 seconds at 16kHz
    features = loader.extract_features(test_audio)
    
    assert features.shape[0] == 64 * 64, f"Expected 4096 features, got {features.shape[0]}"
    print("✅ Feature extraction working correctly")
    
    # Test patient-wise splitting logic
    test_data = {
        'patient_1': {'ap': np.random.randn(5, 160000), 'nap': np.random.randn(5, 160000)},
        'patient_2': {'ap': np.random.randn(3, 160000), 'nap': np.random.randn(3, 160000)},
        'patient_3': {'ap': np.random.randn(4, 160000), 'nap': np.random.randn(4, 160000)},
        'patient_4': {'ap': np.random.randn(6, 160000), 'nap': np.random.randn(6, 160000)},
        'patient_5': {'ap': np.random.randn(2, 160000), 'nap': np.random.randn(2, 160000)},
    }
    
    train_patients, val_patients, test_patients = loader.create_patient_wise_splits(
        test_data, train_ratio=0.6, val_ratio=0.2, test_ratio=0.2
    )
    
    assert len(train_patients) == 3, f"Expected 3 train patients, got {len(train_patients)}"
    assert len(val_patients) == 1, f"Expected 1 val patient, got {len(val_patients)}"
    assert len(test_patients) == 1, f"Expected 1 test patient, got {len(test_patients)}"
    print("✅ Patient-wise splitting working correctly")
    
    return loader

def test_environment():
    """Test RL environment functionality"""
    print("🧪 Testing RL Environment...")
    
    # Create synthetic data
    n_samples = 100
    n_features = 4096
    n_patients = 10
    
    features = np.random.randn(n_samples, n_features).astype(np.float32)
    labels = np.random.randint(0, 2, n_samples)
    patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
    
    # Create environment
    env = ApneaDetectionEnv(features, labels, patient_ids, max_episode_length=20)
    
    # Test reset
    obs, info = env.reset()
    assert obs.shape == (n_features,), f"Expected observation shape {n_features}, got {obs.shape}"
    assert 'patient_id' in info, "Info should contain patient_id"
    print("✅ Environment reset working correctly")
    
    # Test step function
    action = 1  # DIAGNOSE
    obs, reward, terminated, truncated, info = env.step(action)
    
    assert isinstance(reward, (int, float)), "Reward should be numeric"
    assert isinstance(terminated, bool), "Terminated should be boolean"
    assert isinstance(truncated, bool), "Truncated should be boolean"
    print("✅ Environment step working correctly")
    
    # Test episode completion
    for _ in range(25):  # Force episode completion
        obs, reward, terminated, truncated, info = env.step(0)  # WAIT
        if terminated or truncated:
            break
    
    # Test metrics
    metrics = env.get_episode_metrics()
    if metrics:
        assert 'accuracy' in metrics, "Metrics should contain accuracy"
        assert 'ece' in metrics, "Metrics should contain ECE"
        print("✅ Episode metrics working correctly")
    
    return env

def test_rl_agent():
    """Test RL agent functionality"""
    print("🧪 Testing RL Agent...")
    
    # Create synthetic environment
    n_samples = 50
    n_features = 4096
    n_patients = 5
    
    features = np.random.randn(n_samples, n_features).astype(np.float32)
    labels = np.random.randint(0, 2, n_samples)
    patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
    
    env = ApneaDetectionEnv(features, labels, patient_ids, max_episode_length=10)
    
    # Create agent
    agent = ApneaDetectionAgent(env, learning_rate=1e-3, n_steps=64)
    
    # Test prediction
    test_obs = np.random.randn(n_features).astype(np.float32)
    action, confidence = agent.predict_with_confidence(test_obs)
    
    assert action in [0, 1, 2], f"Action should be 0, 1, or 2, got {action}"
    assert 0 <= confidence <= 1, f"Confidence should be between 0 and 1, got {confidence}"
    print("✅ Agent prediction working correctly")
    
    return agent

def test_utils():
    """Test utility functions"""
    print("🧪 Testing Utility Functions...")
    
    # Test ECE calculation
    confidences = np.array([0.1, 0.3, 0.5, 0.7, 0.9])
    predictions = np.array([0, 0, 1, 1, 1])
    true_labels = np.array([0, 0, 1, 1, 1])
    
    ece = calculate_ece(confidences, predictions, true_labels)
    assert isinstance(ece, float), "ECE should be a float"
    assert ece >= 0, "ECE should be non-negative"
    print("✅ ECE calculation working correctly")
    
    # Test patient metrics aggregation
    episode_metrics = [
        {'accuracy': 0.8, 'ece': 0.1, 'mean_confidence': 0.7, 'severity_score': 0.3, 'n_apnea_events': 2},
        {'accuracy': 0.9, 'ece': 0.05, 'mean_confidence': 0.8, 'severity_score': 0.4, 'n_apnea_events': 3}
    ]
    
    aggregated = aggregate_patient_metrics(episode_metrics)
    assert 'mean_accuracy' in aggregated, "Aggregated metrics should contain mean_accuracy"
    assert aggregated['mean_accuracy'] == 0.85, f"Expected mean accuracy 0.85, got {aggregated['mean_accuracy']}"
    print("✅ Patient metrics aggregation working correctly")

def test_enhanced_data_pipeline():
    """Test the enhanced data pipeline with proper splits"""
    print("🧪 Testing Enhanced Data Pipeline...")
    
    # Create synthetic dataset structure
    n_patients = 20
    n_segments_per_patient = 10
    
    # Simulate the actual dataset structure
    synthetic_data = {}
    for i in range(n_patients):
        patient_id = f"patient_{i:03d}"
        # Each .npy file contains multiple 10-second segments
        synthetic_data[patient_id] = {
            'ap': np.random.randn(n_segments_per_patient, 160000),  # 10 segments of 10s each
            'nap': np.random.randn(n_segments_per_patient, 160000)
        }
    
    # Test the data splitting
    loader = PSGAudioLoader()
    train_patients, val_patients, test_patients = loader.create_patient_wise_splits(
        synthetic_data, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15
    )
    
    # Verify splits
    assert len(train_patients) == 14, f"Expected 14 train patients, got {len(train_patients)}"
    assert len(val_patients) == 3, f"Expected 3 val patients, got {len(val_patients)}"
    assert len(test_patients) == 3, f"Expected 3 test patients, got {len(test_patients)}"
    
    # Test feature extraction from preprocessed data
    train_features, train_labels, train_patient_ids = loader.prepare_features_from_preprocessed(
        synthetic_data, train_patients
    )
    
    expected_features = len(train_patients) * n_segments_per_patient * 2  # ap + nap
    assert len(train_features) == expected_features, f"Expected {expected_features} features, got {len(train_features)}"
    assert len(train_labels) == expected_features, f"Expected {expected_features} labels, got {len(train_labels)}"
    
    print("✅ Enhanced data pipeline working correctly")

def run_integration_test():
    """Run a complete integration test with proper data splitting"""
    print("🧪 Running Enhanced Integration Test...")
    
    # Create synthetic dataset with proper structure
    n_patients = 30
    n_segments_per_patient = 15
    
    print(f"Creating synthetic dataset: {n_patients} patients, {n_segments_per_patient} segments per patient")
    
    # Simulate the actual dataset structure
    synthetic_data = {}
    for i in range(n_patients):
        patient_id = f"patient_{i:03d}"
        synthetic_data[patient_id] = {
            'ap': np.random.randn(n_segments_per_patient, 160000),
            'nap': np.random.randn(n_segments_per_patient, 160000)
        }
    
    # Use the enhanced data loader
    loader = PSGAudioLoader()
    
    # Create proper splits
    train_patients, val_patients, test_patients = loader.create_patient_wise_splits(
        synthetic_data, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15
    )
    
    # Prepare features for each split
    train_features, train_labels, train_patient_ids = loader.prepare_features_from_preprocessed(
        synthetic_data, train_patients
    )
    
    val_features, val_labels, val_patient_ids = loader.prepare_features_from_preprocessed(
        synthetic_data, val_patients
    )
    
    test_features, test_labels, test_patient_ids = loader.prepare_features_from_preprocessed(
        synthetic_data, test_patients
    )
    
    print(f"Data splits created: Train={len(train_features)}, Val={len(val_features)}, Test={len(test_features)}")
    
    # Create training environment
    train_env = ApneaDetectionEnv(train_features, train_labels, train_patient_ids, max_episode_length=20)
    
    # Create agent
    agent = ApneaDetectionAgent(train_env, learning_rate=1e-3, n_steps=128)
    
    # Quick training (few steps for testing)
    print("Training agent for 1000 timesteps...")
    training_results = agent.train(total_timesteps=1000)
    print(f"Training completed: {training_results}")
    
    # Quick evaluation on validation set
    print("Evaluating on validation set...")
    val_env = ApneaDetectionEnv(val_features, val_labels, val_patient_ids, max_episode_length=20)
    agent.env = val_env
    val_results = agent.evaluate(n_eval_episodes=3)
    print(f"Validation evaluation completed: {val_results}")
    
    # Quick evaluation on test set
    print("Evaluating on test set...")
    test_env = ApneaDetectionEnv(test_features, test_labels, test_patient_ids, max_episode_length=20)
    agent.env = test_env
    test_results = agent.evaluate(n_eval_episodes=3)
    print(f"Test evaluation completed: {test_results}")
    
    print("✅ Enhanced integration test completed successfully!")

def main():
    """Run all tests"""
    print("🚀 Starting Enhanced Implementation Tests")
    print("=" * 50)
    
    try:
        # Test individual components
        test_data_loader()
        test_environment()
        test_rl_agent()
        test_utils()
        
        print("\n" + "=" * 50)
        print("✅ All component tests passed!")
        
        # Test enhanced data pipeline
        print("\n" + "=" * 50)
        test_enhanced_data_pipeline()
        
        # Run enhanced integration test
        print("\n" + "=" * 50)
        run_integration_test()
        
        print("\n🎉 All tests completed successfully!")
        print("The enhanced RL implementation is working correctly with proper data splitting.")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
