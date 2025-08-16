"""
Test Script for Layer 3 Sleep Environment Optimization System

This script tests all major components to ensure they work correctly together.
"""

import os
import sys
import json
import tempfile
import shutil
from typing import Dict, Any

def test_user_generator():
    """Test the synthetic user generator."""
    print("Testing User Generator...")
    
    try:
        from user_generator import SyntheticUserGenerator, UserProfile
        
        # Test basic user generation
        generator = SyntheticUserGenerator(seed=42)
        user = generator.generate_user_profile("test_user")
        
        assert user.user_id == "test_user"
        assert 15 <= user.temp_optimal <= 25
        assert 0 <= user.light_sensitivity <= 1
        assert 0 <= user.noise_tolerance <= 1
        assert user.baseline_sleep_score is not None
        
        print("  ✓ Basic user generation works")
        
        # Test batch generation
        users = generator.generate_user_batch(5, seed=123)
        assert len(users) == 5
        assert all(isinstance(u, UserProfile) for u in users)
        
        print("  ✓ Batch user generation works")
        
        # Test diverse user generation
        diverse_users = generator.generate_diverse_users(10)
        assert len(diverse_users) == 10
        
        # Check diversity in temperature preferences
        temps = [u.temp_optimal for u in diverse_users]
        temp_range = max(temps) - min(temps)
        assert temp_range > 2  # Should have some diversity
        
        print("  ✓ Diverse user generation works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ User generator test failed: {e}")
        return False


def test_sleep_environment():
    """Test the sleep environment."""
    print("Testing Sleep Environment...")
    
    try:
        from user_generator import SyntheticUserGenerator
        from sleep_environment import create_sleep_environment, SleepEnvironment
        
        # Create test user
        generator = SyntheticUserGenerator(seed=42)
        user = generator.generate_user_profile("env_test_user")
        
        # Test environment creation
        env = create_sleep_environment(user, episode_length=50)
        
        assert env.user_profile.user_id == "env_test_user"
        assert env.observation_space.shape[0] == 16  # Expected observation size
        assert env.action_space.shape[0] == 7  # Expected action size
        
        print("  ✓ Environment creation works")
        
        # Test environment reset
        obs, info = env.reset()
        assert obs.shape == (16,)
        assert "sleep_score" in info
        
        print("  ✓ Environment reset works")
        
        # Test environment step
        action = env.action_space.sample()
        obs, reward, terminated, truncated, info = env.step(action)
        
        assert obs.shape == (16,)
        assert isinstance(reward, float)
        assert isinstance(terminated, bool)
        assert isinstance(truncated, bool)
        assert "sleep_score" in info
        
        print("  ✓ Environment step works")
        
        # Test optimal settings
        optimal = env.get_optimal_settings()
        assert "temperature" in optimal
        assert "light_intensity" in optimal
        assert "noise_level" in optimal
        
        print("  ✓ Optimal settings generation works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Sleep environment test failed: {e}")
        return False


def test_rl_agent():
    """Test the RL agent (basic functionality only)."""
    print("Testing RL Agent...")
    
    try:
        from user_generator import SyntheticUserGenerator
        from rl_agent import SleepOptimizationAgent
        
        # Create test user
        generator = SyntheticUserGenerator(seed=42)
        user = generator.generate_user_profile("agent_test_user")
        
        # Test agent creation
        agent = SleepOptimizationAgent(user, algorithm="PPO")
        
        assert agent.user_profile.user_id == "agent_test_user"
        assert agent.algorithm == "PPO"
        assert agent.model is not None
        
        print("  ✓ Agent creation works")
        
        # Test short training (very short for testing)
        with tempfile.TemporaryDirectory() as temp_dir:
            training_history = agent.train(
                total_timesteps=1000,  # Very short for testing
                save_path=temp_dir,
                eval_freq=500
            )
            
            assert isinstance(training_history, dict)
            print("  ✓ Agent training works")
            
            # Test evaluation
            eval_results = agent.evaluate(n_eval_episodes=2)
            
            assert "mean_reward" in eval_results
            assert "mean_sleep_score" in eval_results
            assert "mean_fragmentation" in eval_results
            assert "mean_apnea_risk" in eval_results
            
            print("  ✓ Agent evaluation works")
            
            # Test recommendations
            recommendations = agent.get_recommendations()
            
            assert "recommended_settings" in recommendations
            assert "expected_sleep_score" in recommendations
            assert "expected_improvement" in recommendations
            assert "confidence" in recommendations
            
            print("  ✓ Agent recommendations work")
            
            # Test model saving and loading
            agent.save_model(temp_dir)
            
            # Test loading
            loaded_agent = SleepOptimizationAgent.load_model(temp_dir, "PPO")
            assert loaded_agent.user_profile.user_id == user.user_id
            
            print("  ✓ Model saving and loading works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ RL agent test failed: {e}")
        return False


def test_recommendation_engine():
    """Test the recommendation engine."""
    print("Testing Recommendation Engine...")
    
    try:
        from user_generator import SyntheticUserGenerator
        from rl_agent import SleepOptimizationAgent
        from recommendation_engine import create_recommendation_engine
        
        # Create test user and train agent
        generator = SyntheticUserGenerator(seed=42)
        user = generator.generate_user_profile("rec_test_user")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Train a quick agent
            agent = SleepOptimizationAgent(user, algorithm="PPO")
            agent.train(total_timesteps=1000, save_path=temp_dir)
            agent.save_model(temp_dir)
            
            # Test recommendation engine
            engine = create_recommendation_engine(temp_dir, "PPO")
            
            # Generate recommendations
            report = engine.generate_recommendations()
            
            assert report.user_id == "rec_test_user"
            assert report.environment_recommendations is not None
            assert report.lifestyle_recommendations is not None
            assert report.sleep_quality_analysis is not None
            assert report.risk_assessment is not None
            assert report.implementation_plan is not None
            assert 0 <= report.overall_confidence <= 1
            assert 0 <= report.data_quality_score <= 1
            
            print("  ✓ Recommendation generation works")
            
            # Test report export
            json_report = engine.export_report(report, "json")
            assert isinstance(json_report, str)
            
            dict_report = engine.export_report(report, "dict")
            assert isinstance(dict_report, dict)
            
            print("  ✓ Report export works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Recommendation engine test failed: {e}")
        return False


def test_api_models():
    """Test the API data models."""
    print("Testing API Models...")
    
    try:
        from api import (
            UserProfileRequest, UserProfileResponse, TrainingRequest,
            TrainingStatus, RecommendationRequest, RecommendationResponse,
            SystemStatus
        )
        
        # Test UserProfileRequest
        user_request = UserProfileRequest(
            age=30,
            gender="male",
            temp_optimal=20.0
        )
        assert user_request.age == 30
        assert user_request.gender == "male"
        assert user_request.temp_optimal == 20.0
        
        print("  ✓ UserProfileRequest validation works")
        
        # Test TrainingRequest
        training_request = TrainingRequest(
            user_id="test_user",
            algorithm="PPO",
            total_timesteps=50000
        )
        assert training_request.user_id == "test_user"
        assert training_request.algorithm == "PPO"
        assert training_request.total_timesteps == 50000
        
        print("  ✓ TrainingRequest validation works")
        
        # Test TrainingStatus
        training_status = TrainingStatus(
            user_id="test_user",
            status="training",
            progress=50.0,
            current_step=25000,
            total_steps=50000,
            start_time="2024-01-01T00:00:00",
            estimated_completion="2024-01-01T01:00:00",
            error_message=None
        )
        assert training_status.user_id == "test_user"
        assert training_status.status == "training"
        assert training_status.progress == 50.0
        
        print("  ✓ TrainingStatus validation works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ API models test failed: {e}")
        return False


def test_integration():
    """Test integration between components."""
    print("Testing Integration...")
    
    try:
        from user_generator import SyntheticUserGenerator
        from rl_agent import SleepOptimizationAgent
        from recommendation_engine import create_recommendation_engine
        from sleep_environment import create_sleep_environment
        
        # Create a complete workflow
        generator = SyntheticUserGenerator(seed=42)
        user = generator.generate_user_profile("integration_test_user")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # 1. Create environment
            env = create_sleep_environment(user, episode_length=50)
            obs, info = env.reset()
            
            # 2. Train agent
            agent = SleepOptimizationAgent(user, algorithm="PPO")
            agent.train(total_timesteps=1000, save_path=temp_dir)
            
            # 3. Evaluate agent
            eval_results = agent.evaluate(n_eval_episodes=2)
            
            # 4. Generate recommendations
            recommendations = agent.get_recommendations()
            
            # 5. Use recommendation engine
            engine = create_recommendation_engine(temp_dir, "PPO")
            report = engine.generate_recommendations()
            
            # 6. Verify consistency
            assert report.user_id == user.user_id
            assert report.current_sleep_score > 0
            assert report.overall_confidence > 0
            
            # 7. Test with different environmental settings
            current_env = {
                "temperature": 25.0,
                "light_intensity": 0.5,
                "noise_level": 0.3
            }
            
            report_with_env = engine.generate_recommendations(
                current_environment=current_env
            )
            
            assert report_with_env.user_id == user.user_id
            
            print("  ✓ Complete workflow integration works")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Integration test failed: {e}")
        return False


def test_performance():
    """Test basic performance characteristics."""
    print("Testing Performance...")
    
    try:
        import time
        from user_generator import SyntheticUserGenerator
        from rl_agent import SleepOptimizationAgent
        
        # Test user generation performance
        generator = SyntheticUserGenerator(seed=42)
        
        start_time = time.time()
        users = generator.generate_diverse_users(100)
        generation_time = time.time() - start_time
        
        assert len(users) == 100
        assert generation_time < 5.0  # Should be fast
        
        print(f"  ✓ User generation: {generation_time:.2f}s for 100 users")
        
        # Test training performance (very short)
        user = users[0]
        
        start_time = time.time()
        agent = SleepOptimizationAgent(user, algorithm="PPO")
        agent.train(total_timesteps=1000)
        training_time = time.time() - start_time
        
        assert training_time < 30.0  # Should be reasonable for 1000 steps
        
        print(f"  ✓ Training: {training_time:.2f}s for 1000 steps")
        
        # Test recommendation generation performance
        start_time = time.time()
        recommendations = agent.get_recommendations()
        rec_time = time.time() - start_time
        
        assert rec_time < 5.0  # Should be very fast
        
        print(f"  ✓ Recommendations: {rec_time:.2f}s")
        
        return True
        
    except Exception as e:
        print(f"  ✗ Performance test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("Layer 3 Sleep Environment Optimization System - Test Suite")
    print("=" * 60)
    
    tests = [
        ("User Generator", test_user_generator),
        ("Sleep Environment", test_sleep_environment),
        ("RL Agent", test_rl_agent),
        ("Recommendation Engine", test_recommendation_engine),
        ("API Models", test_api_models),
        ("Integration", test_integration),
        ("Performance", test_performance),
    ]
    
    results = {}
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        try:
            success = test_func()
            results[test_name] = success
            if success:
                passed += 1
        except Exception as e:
            print(f"  ✗ {test_name} test crashed: {e}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, success in results.items():
        status = "PASS" if success else "FAIL"
        print(f"{test_name:<25} {status}")
    
    print(f"\nPassed: {passed}/{total} tests")
    
    if passed == total:
        print("🎉 All tests passed! The system is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
