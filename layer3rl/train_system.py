"""
Main Training Script for Sleep Environment Optimization System

This script demonstrates the complete workflow:
1. Generate synthetic users
2. Train RL agents for each user
3. Generate recommendations
4. Evaluate performance
"""

import os
import json
import numpy as np
from typing import Dict, List, Any
import argparse
from datetime import datetime

from user_generator import SyntheticUserGenerator, UserProfile
from rl_agent import SleepOptimizationAgent, train_multiple_users
from recommendation_engine import RecommendationEngine, create_recommendation_engine


def train_single_user_demo():
    """Demonstrate training for a single user."""
    print("=== Single User Training Demo ===")
    
    # Generate a test user
    generator = SyntheticUserGenerator(seed=42)
    user = generator.generate_user_profile("demo_user_001")
    
    print(f"Generated user: {user.user_id}")
    print(f"  Age: {user.age}, Gender: {user.gender}")
    print(f"  Optimal Temperature: {user.temp_optimal:.1f}°C")
    print(f"  Light Sensitivity: {user.light_sensitivity:.2f}")
    print(f"  Noise Tolerance: {user.noise_tolerance:.2f}")
    print(f"  Baseline Sleep Score: {user.baseline_sleep_score:.1f}")
    
    # Create and train agent
    print("\nTraining RL agent...")
    agent = SleepOptimizationAgent(user, algorithm="PPO")
    
    # Train for a short time for demo
    training_history = agent.train(
        total_timesteps=20000,
        save_path="demo_models/single_user",
        eval_freq=5000
    )
    
    # Evaluate the agent
    print("\nEvaluating agent...")
    eval_results = agent.evaluate(n_eval_episodes=10)
    
    print(f"Evaluation Results:")
    print(f"  Mean Reward: {eval_results['mean_reward']:.3f}")
    print(f"  Mean Sleep Score: {eval_results['mean_sleep_score']:.1f}")
    print(f"  Mean Fragmentation: {eval_results['mean_fragmentation']:.1f}")
    print(f"  Mean Apnea Risk: {eval_results['mean_apnea_risk']:.3f}")
    
    # Generate recommendations
    print("\nGenerating recommendations...")
    recommendations = agent.get_recommendations()
    
    print(f"Recommendations:")
    print(f"  Expected Sleep Score: {recommendations['expected_sleep_score']:.1f}")
    print(f"  Expected Improvement: {recommendations['expected_improvement']:.1f}")
    print(f"  Confidence: {recommendations['confidence']:.2f}")
    print(f"  Recommended Temperature: {recommendations['recommended_settings']['temperature']:.1f}°C")
    print(f"  Recommended Light Intensity: {recommendations['recommended_settings']['light_intensity']:.2f}")
    print(f"  Recommended Noise Level: {recommendations['recommended_settings']['noise_level']:.2f}")
    
    # Test recommendation engine
    print("\nTesting recommendation engine...")
    try:
        engine = create_recommendation_engine("demo_models/single_user", "PPO")
        report = engine.generate_recommendations()
        
        print(f"Generated comprehensive report for user {report.user_id}")
        print(f"  Overall Confidence: {report.overall_confidence:.2f}")
        print(f"  Priority Factors: {report.environment_recommendations.priority_factors}")
        print(f"  Risk Factors: {report.environment_recommendations.risk_factors}")
        
        # Save report
        os.makedirs("demo_reports", exist_ok=True)
        report_path = f"demo_reports/{user.user_id}_report.json"
        with open(report_path, 'w') as f:
            f.write(engine.export_report(report, "json"))
        
        print(f"Report saved to: {report_path}")
        
    except Exception as e:
        print(f"Error testing recommendation engine: {e}")
    
    return agent, eval_results, recommendations


def train_multiple_users_demo(num_users: int = 5):
    """Demonstrate training for multiple users."""
    print(f"\n=== Multiple Users Training Demo ({num_users} users) ===")
    
    # Generate diverse users
    generator = SyntheticUserGenerator(seed=123)
    users = generator.generate_diverse_users(num_users)
    
    print(f"Generated {len(users)} diverse users:")
    for user in users:
        print(f"  {user.user_id}: Age {user.age}, Temp {user.temp_optimal:.1f}°C, "
              f"Light Sens {user.light_sensitivity:.2f}, Sleep Score {user.baseline_sleep_score:.1f}")
    
    # Train agents for all users
    print(f"\nTraining agents for all users...")
    results = train_multiple_users(
        user_profiles=users,
        output_dir="demo_models/multiple_users",
        algorithm="PPO",
        total_timesteps=30000  # Shorter training for demo
    )
    
    # Print summary results
    print(f"\nTraining Results Summary:")
    print(f"{'User ID':<15} {'Sleep Score':<12} {'Fragmentation':<15} {'Apnea Risk':<12}")
    print("-" * 60)
    
    for user_id, result in results.items():
        print(f"{user_id:<15} {result['mean_sleep_score']:<12.1f} "
              f"{result['mean_fragmentation']:<15.1f} {result['mean_apnea_risk']:<12.3f}")
    
    # Generate recommendations for a sample user
    sample_user_id = list(results.keys())[0]
    print(f"\nGenerating recommendations for sample user: {sample_user_id}")
    
    try:
        engine = create_recommendation_engine(
            f"demo_models/multiple_users/user_{sample_user_id}", 
            "PPO"
        )
        report = engine.generate_recommendations()
        
        print(f"Sample Report Summary:")
        print(f"  User: {report.user_id}")
        print(f"  Current Sleep Score: {report.current_sleep_score:.1f}")
        print(f"  Expected Improvement: {report.environment_recommendations.expected_improvement:.1f}")
        print(f"  Confidence: {report.overall_confidence:.2f}")
        print(f"  Priority Factors: {report.environment_recommendations.priority_factors}")
        
        # Save sample report
        os.makedirs("demo_reports", exist_ok=True)
        report_path = f"demo_reports/multi_user_sample_report.json"
        with open(report_path, 'w') as f:
            f.write(engine.export_report(report, "json"))
        
        print(f"Sample report saved to: {report_path}")
        
    except Exception as e:
        print(f"Error generating sample report: {e}")
    
    return results


def compare_algorithms_demo():
    """Compare different RL algorithms."""
    print(f"\n=== Algorithm Comparison Demo ===")
    
    # Generate a test user
    generator = SyntheticUserGenerator(seed=456)
    user = generator.generate_user_profile("algo_test_user")
    
    algorithms = ["PPO", "SAC", "TD3"]
    results = {}
    
    for algorithm in algorithms:
        print(f"\nTraining with {algorithm}...")
        
        try:
            agent = SleepOptimizationAgent(user, algorithm=algorithm)
            agent.train(total_timesteps=15000, save_path=f"demo_models/algo_comparison/{algorithm}")
            
            eval_results = agent.evaluate(n_eval_episodes=10)
            results[algorithm] = eval_results
            
            print(f"  {algorithm} Results:")
            print(f"    Mean Sleep Score: {eval_results['mean_sleep_score']:.1f}")
            print(f"    Mean Reward: {eval_results['mean_reward']:.3f}")
            print(f"    Mean Fragmentation: {eval_results['mean_fragmentation']:.1f}")
            
        except Exception as e:
            print(f"  Error with {algorithm}: {e}")
            results[algorithm] = None
    
    # Print comparison
    print(f"\nAlgorithm Comparison Summary:")
    print(f"{'Algorithm':<10} {'Sleep Score':<12} {'Reward':<10} {'Fragmentation':<15}")
    print("-" * 50)
    
    for algorithm, result in results.items():
        if result:
            print(f"{algorithm:<10} {result['mean_sleep_score']:<12.1f} "
                  f"{result['mean_reward']:<10.3f} {result['mean_fragmentation']:<15.1f}")
        else:
            print(f"{algorithm:<10} {'Failed':<12} {'Failed':<10} {'Failed':<15}")
    
    return results


def analyze_user_diversity():
    """Analyze the diversity of generated users."""
    print(f"\n=== User Diversity Analysis ===")
    
    generator = SyntheticUserGenerator(seed=789)
    users = generator.generate_diverse_users(20)
    
    # Analyze temperature preferences
    temps = [user.temp_optimal for user in users]
    light_sens = [user.light_sensitivity for user in users]
    noise_tol = [user.noise_tolerance for user in users]
    sleep_scores = [user.baseline_sleep_score for user in users]
    
    print(f"Temperature Analysis:")
    print(f"  Mean: {np.mean(temps):.1f}°C")
    print(f"  Std: {np.std(temps):.1f}°C")
    print(f"  Range: {min(temps):.1f}°C - {max(temps):.1f}°C")
    
    print(f"\nLight Sensitivity Analysis:")
    print(f"  Mean: {np.mean(light_sens):.2f}")
    print(f"  Std: {np.std(light_sens):.2f}")
    print(f"  Range: {min(light_sens):.2f} - {max(light_sens):.2f}")
    
    print(f"\nNoise Tolerance Analysis:")
    print(f"  Mean: {np.mean(noise_tol):.2f}")
    print(f"  Std: {np.std(noise_tol):.2f}")
    print(f"  Range: {min(noise_tol):.2f} - {max(noise_tol):.2f}")
    
    print(f"\nSleep Score Analysis:")
    print(f"  Mean: {np.mean(sleep_scores):.1f}")
    print(f"  Std: {np.std(sleep_scores):.1f}")
    print(f"  Range: {min(sleep_scores):.1f} - {max(sleep_scores):.1f}")
    
    # Categorize users
    cool_sleepers = [u for u in users if u.temp_optimal < 18]
    warm_sleepers = [u for u in users if u.temp_optimal > 22]
    light_sensitive = [u for u in users if u.light_sensitivity < 0.3]
    noise_sensitive = [u for u in users if u.noise_tolerance < 0.3]
    
    print(f"\nUser Categories:")
    print(f"  Cool Sleepers (<18°C): {len(cool_sleepers)} users")
    print(f"  Warm Sleepers (>22°C): {len(warm_sleepers)} users")
    print(f"  Light Sensitive: {len(light_sensitive)} users")
    print(f"  Noise Sensitive: {len(noise_sensitive)} users")


def main():
    """Main function to run all demos."""
    parser = argparse.ArgumentParser(description="Sleep Environment Optimization Training")
    parser.add_argument("--demo", choices=["single", "multiple", "algorithms", "diversity", "all"], 
                       default="all", help="Which demo to run")
    parser.add_argument("--num-users", type=int, default=5, 
                       help="Number of users for multiple user demo")
    parser.add_argument("--output-dir", default="demo_models", 
                       help="Output directory for models")
    
    args = parser.parse_args()
    
    # Create output directories
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs("demo_reports", exist_ok=True)
    
    print("Sleep Environment Optimization System - Training Demo")
    print("=" * 60)
    print(f"Output directory: {args.output_dir}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    if args.demo in ["single", "all"]:
        results["single_user"] = train_single_user_demo()
    
    if args.demo in ["multiple", "all"]:
        results["multiple_users"] = train_multiple_users_demo(args.num_users)
    
    if args.demo in ["algorithms", "all"]:
        results["algorithm_comparison"] = compare_algorithms_demo()
    
    if args.demo in ["diversity", "all"]:
        analyze_user_diversity()
    
    # Save summary results
    summary_path = f"{args.output_dir}/training_summary.json"
    with open(summary_path, 'w') as f:
        # Convert results to serializable format
        serializable_results = {}
        for key, value in results.items():
            if isinstance(value, tuple):
                serializable_results[key] = {
                    "agent_trained": True,
                    "eval_results": value[1] if len(value) > 1 else None,
                    "recommendations": value[2] if len(value) > 2 else None
                }
            elif isinstance(value, dict):
                serializable_results[key] = value
        
        json.dump(serializable_results, f, indent=2, default=str)
    
    print(f"\nTraining summary saved to: {summary_path}")
    print("\nDemo completed successfully!")


if __name__ == "__main__":
    main()
