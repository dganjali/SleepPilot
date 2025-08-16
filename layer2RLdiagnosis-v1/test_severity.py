#!/usr/bin/env python3
"""
Test script to verify the new severity score calculation
"""

import numpy as np
from apnea_env import ApneaDetectionEnv

def test_severity_calculation():
    """Test the new severity score calculation"""
    print("🧪 Testing Enhanced Severity Score Calculation")
    print("=" * 50)
    
    # Test different scenarios with more realistic frequencies
    # Each scenario represents a full night's sleep (8 hours = 2880 segments)
    test_scenarios = [
        ("Normal Sleep (<5 events/hour)", 30, 2880),    # 30 events in 8 hours = 3.75/hour
        ("Mild Apnea (10 events/hour)", 80, 2880),      # 80 events in 8 hours = 10/hour  
        ("Moderate Apnea (20 events/hour)", 160, 2880), # 160 events in 8 hours = 20/hour
        ("Severe Apnea (35 events/hour)", 280, 2880),   # 280 events in 8 hours = 35/hour
        ("Very Severe (>50 events/hour)", 450, 2880),   # 450 events in 8 hours = 56.25/hour
    ]
    
    for scenario_name, n_apnea_events, n_samples in test_scenarios:
        print(f"\n📊 Testing: {scenario_name}")
        
        # Create fresh environment for each test scenario
        n_features = 4096
        n_patients = 3
        
        features = np.random.randn(n_samples, n_features).astype(np.float32)
        labels = np.random.randint(0, 2, n_samples)
        patient_ids = [f"patient_{i % n_patients}" for i in range(n_samples)]
        
        env = ApneaDetectionEnv(features, labels, patient_ids, max_episode_length=n_samples)
        
        # Reset environment
        obs, info = env.reset()
        
        # Simulate DIAGNOSE actions with realistic apnea distribution
        # Distribute apnea events throughout the night (not all at once)
        apnea_positions = np.linspace(0, n_samples-1, n_apnea_events, dtype=int)
        
        for step in range(n_samples):
            if step in apnea_positions:
                # Simulate apnea detection
                env.episode_predictions.append(1)
                env.episode_confidences.append(0.8)
                env.episode_timestamps.append(step * 10.0)
            else:
                # Simulate normal detection
                env.episode_predictions.append(0)
                env.episode_confidences.append(0.7)
                env.episode_timestamps.append(step * 10.0)
        
        # Get metrics
        metrics = env.get_episode_metrics()
        
        if metrics:
            print(f"  Severity Score: {metrics['severity_score']:.3f}")
            print(f"  AHI Score: {metrics['ahi_score']:.2f} events/hour")
            print(f"  Total Duration: {metrics['total_duration_minutes']:.1f} minutes")
            print(f"  Apnea Events: {metrics['n_apnea_events']}")
            print(f"  Apnea Frequency: {metrics['apnea_frequency_per_hour']:.2f} events/hour")
            
            # Show individual event details (just first few)
            if 'apnea_event_details' in metrics:
                print(f"  Event Details: {len(metrics['apnea_event_details'])} apnea events")
                for i, event in enumerate(metrics['apnea_event_details'][:3]):  # Show first 3
                    print(f"    Event {i+1}: Time={event['timestamp']:.1f}s, Confidence={event['confidence']:.3f}")
                if len(metrics['apnea_event_details']) > 3:
                    print(f"    ... and {len(metrics['apnea_event_details']) - 3} more events")
        else:
            print("  No metrics available")
    
    print("\n✅ Severity score calculation test completed!")

if __name__ == "__main__":
    test_severity_calculation()
