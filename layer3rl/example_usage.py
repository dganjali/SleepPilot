"""
Example Usage of Layer 3 Sleep Environment Optimization System

This script demonstrates a realistic workflow for using the system:
1. Create a user profile
2. Train an RL agent
3. Generate recommendations
4. Analyze results
"""

import os
import json
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

from user_generator import SyntheticUserGenerator, print_user_profile
from rl_agent import SleepOptimizationAgent
from recommendation_engine import create_recommendation_engine


def create_realistic_user():
    """Create a realistic user profile for demonstration."""
    print("=== Creating Realistic User Profile ===")
    
    # Create a user with specific characteristics
    user = SyntheticUserGenerator(seed=42).generate_user_profile("demo_user_001")
    
    # Override with realistic values
    user.age = 35
    user.gender = "female"
    user.weight = 65.0
    user.height = 165.0
    user.temp_optimal = 19.5  # Prefers cooler temperatures
    user.light_sensitivity = 0.3  # Quite light sensitive
    user.noise_tolerance = 0.4  # Moderate noise sensitivity
    user.humidity_preference = 0.6  # Prefers moderate humidity
    user.airflow_preference = 0.7  # Prefers some airflow
    user.baseline_sleep_score = 62.0  # Below average sleep
    user.baseline_apnea_risk = 0.08  # Low risk
    user.baseline_fragmentation = 18.0  # Moderate fragmentation
    
    print_user_profile(user)
    return user


def train_agent_demo(user):
    """Demonstrate training an RL agent."""
    print("\n=== Training RL Agent ===")
    
    # Create agent
    agent = SleepOptimizationAgent(user, algorithm="PPO")
    
    print(f"Training agent for user: {user.user_id}")
    print(f"Algorithm: {agent.algorithm}")
    print(f"Episode length: {agent.env.episode_length}")
    
    # Train the agent
    print("\nStarting training...")
    training_history = agent.train(
        total_timesteps=30000,  # Moderate training time
        save_path="example_models",
        eval_freq=5000
    )
    
    print("Training completed!")
    
    # Evaluate the agent
    print("\nEvaluating agent...")
    eval_results = agent.evaluate(n_eval_episodes=10)
    
    print(f"Evaluation Results:")
    print(f"  Mean Reward: {eval_results['mean_reward']:.3f}")
    print(f"  Mean Sleep Score: {eval_results['mean_sleep_score']:.1f}")
    print(f"  Mean Fragmentation: {eval_results['mean_fragmentation']:.1f}")
    print(f"  Mean Apnea Risk: {eval_results['mean_apnea_risk']:.3f}")
    
    return agent, eval_results


def generate_recommendations_demo(agent, user):
    """Demonstrate generating recommendations."""
    print("\n=== Generating Recommendations ===")
    
    # Get basic recommendations from agent
    basic_recs = agent.get_recommendations()
    
    print("Basic Recommendations:")
    print(f"  Expected Sleep Score: {basic_recs['expected_sleep_score']:.1f}")
    print(f"  Expected Improvement: {basic_recs['expected_improvement']:.1f}")
    print(f"  Confidence: {basic_recs['confidence']:.2f}")
    
    print("\nRecommended Settings:")
    settings = basic_recs['recommended_settings']
    print(f"  Temperature: {settings['temperature']:.1f}°C")
    print(f"  Light Intensity: {settings['light_intensity']:.2f}")
    print(f"  Noise Level: {settings['noise_level']:.2f}")
    print(f"  Humidity: {settings['humidity']:.2f}")
    print(f"  Airflow: {settings['airflow']:.2f}")
    
    # Generate comprehensive report
    print("\nGenerating comprehensive report...")
    engine = create_recommendation_engine("example_models", "PPO")
    report = engine.generate_recommendations()
    
    print(f"\nComprehensive Report for {report.user_id}:")
    print(f"  Overall Confidence: {report.overall_confidence:.2f}")
    print(f"  Data Quality Score: {report.data_quality_score:.2f}")
    
    print(f"\nPriority Factors: {report.environment_recommendations.priority_factors}")
    print(f"Risk Factors: {report.environment_recommendations.risk_factors}")
    
    print(f"\nImplementation Notes:")
    for note in report.environment_recommendations.implementation_notes:
        print(f"  - {note}")
    
    return report


def analyze_results_demo(report, user):
    """Demonstrate analyzing the results."""
    print("\n=== Analyzing Results ===")
    
    # Compare baseline vs optimized
    baseline_score = user.baseline_sleep_score
    optimized_score = report.current_sleep_score
    improvement = optimized_score - baseline_score
    
    print(f"Sleep Quality Analysis:")
    print(f"  Baseline Score: {baseline_score:.1f}")
    print(f"  Optimized Score: {optimized_score:.1f}")
    print(f"  Improvement: +{improvement:.1f} points")
    print(f"  Improvement Percentage: {(improvement/baseline_score)*100:.1f}%")
    
    # Risk assessment
    print(f"\nRisk Assessment:")
    for risk_name, risk_data in report.risk_assessment.items():
        level = risk_data['level']
        value = risk_data['value']
        recommendation = risk_data['recommendation']
        print(f"  {risk_name.replace('_', ' ').title()}: {level} (value: {value:.3f})")
        print(f"    Recommendation: {recommendation}")
    
    # Implementation plan
    print(f"\nImplementation Plan:")
    print(f"  Immediate Actions:")
    for action in report.implementation_plan['immediate_actions']:
        print(f"    - {action}")
    
    print(f"  Short-term Goals:")
    for goal in report.implementation_plan['short_term_goals']:
        print(f"    - {goal}")
    
    return {
        'baseline_score': baseline_score,
        'optimized_score': optimized_score,
        'improvement': improvement,
        'improvement_percentage': (improvement/baseline_score)*100
    }


def visualize_results_demo(analysis_results, report):
    """Demonstrate visualizing the results."""
    print("\n=== Visualizing Results ===")
    
    # Create a simple visualization
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
    
    # 1. Sleep score comparison
    scores = ['Baseline', 'Optimized']
    values = [analysis_results['baseline_score'], analysis_results['optimized_score']]
    colors = ['#ff6b6b', '#4ecdc4']
    
    bars = ax1.bar(scores, values, color=colors)
    ax1.set_title('Sleep Score Comparison')
    ax1.set_ylabel('Sleep Score (0-100)')
    ax1.set_ylim(0, 100)
    
    # Add value labels on bars
    for bar, value in zip(bars, values):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{value:.1f}', ha='center', va='bottom')
    
    # 2. Environmental factors radar chart
    env_rec = report.environment_recommendations
    factors = ['Temperature', 'Light', 'Noise', 'Humidity', 'Airflow']
    
    # Normalize values to 0-1 scale for radar chart
    temp_norm = 1 - abs(env_rec.temperature - 20) / 10  # Optimal around 20°C
    light_norm = 1 - env_rec.light_intensity  # Lower is better for sleep
    noise_norm = 1 - env_rec.noise_level  # Lower is better for sleep
    humidity_norm = 1 - abs(env_rec.humidity - 0.5)  # Optimal around 0.5
    airflow_norm = env_rec.airflow  # Higher is better for this user
    
    values = [temp_norm, light_norm, noise_norm, humidity_norm, airflow_norm]
    
    angles = np.linspace(0, 2 * np.pi, len(factors), endpoint=False).tolist()
    values += values[:1]  # Complete the circle
    angles += angles[:1]
    
    ax2.plot(angles, values, 'o-', linewidth=2, color='#4ecdc4')
    ax2.fill(angles, values, alpha=0.25, color='#4ecdc4')
    ax2.set_xticks(angles[:-1])
    ax2.set_xticklabels(factors)
    ax2.set_ylim(0, 1)
    ax2.set_title('Environmental Factor Optimization')
    
    # 3. Priority factors
    priority_factors = report.environment_recommendations.priority_factors
    factor_counts = {}
    for factor in priority_factors:
        factor_counts[factor] = factor_counts.get(factor, 0) + 1
    
    if factor_counts:
        ax3.pie(factor_counts.values(), labels=factor_counts.keys(), autopct='%1.1f%%')
        ax3.set_title('Priority Factors')
    
    # 4. Confidence and quality scores
    metrics = ['Overall Confidence', 'Data Quality']
    scores = [report.overall_confidence, report.data_quality_score]
    colors = ['#ff6b6b', '#4ecdc4']
    
    bars = ax4.bar(metrics, scores, color=colors)
    ax4.set_title('System Confidence')
    ax4.set_ylabel('Score (0-1)')
    ax4.set_ylim(0, 1)
    
    # Add value labels on bars
    for bar, score in zip(bars, scores):
        ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f'{score:.2f}', ha='center', va='bottom')
    
    plt.tight_layout()
    
    # Save the plot
    os.makedirs("example_outputs", exist_ok=True)
    plot_path = "example_outputs/sleep_optimization_results.png"
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    print(f"Visualization saved to: {plot_path}")
    
    plt.show()


def export_results_demo(report, analysis_results):
    """Demonstrate exporting results."""
    print("\n=== Exporting Results ===")
    
    # Create output directory
    os.makedirs("example_outputs", exist_ok=True)
    
    # Export comprehensive report as JSON
    from recommendation_engine import create_recommendation_engine
    engine = create_recommendation_engine("example_models", "PPO")
    
    json_report = engine.export_report(report, "json")
    report_path = "example_outputs/comprehensive_report.json"
    with open(report_path, 'w') as f:
        f.write(json_report)
    print(f"Comprehensive report saved to: {report_path}")
    
    # Export summary as text
    summary_path = "example_outputs/summary_report.txt"
    with open(summary_path, 'w') as f:
        f.write("Sleep Environment Optimization Summary Report\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"User ID: {report.user_id}\n")
        f.write(f"Generated: {report.timestamp}\n\n")
        
        f.write("SLEEP QUALITY ANALYSIS\n")
        f.write("-" * 25 + "\n")
        f.write(f"Baseline Score: {analysis_results['baseline_score']:.1f}\n")
        f.write(f"Optimized Score: {analysis_results['optimized_score']:.1f}\n")
        f.write(f"Improvement: +{analysis_results['improvement']:.1f} points\n")
        f.write(f"Improvement: {analysis_results['improvement_percentage']:.1f}%\n\n")
        
        f.write("RECOMMENDED SETTINGS\n")
        f.write("-" * 25 + "\n")
        env_rec = report.environment_recommendations
        f.write(f"Temperature: {env_rec.temperature:.1f}°C\n")
        f.write(f"Light Intensity: {env_rec.light_intensity:.2f}\n")
        f.write(f"Noise Level: {env_rec.noise_level:.2f}\n")
        f.write(f"Humidity: {env_rec.humidity:.2f}\n")
        f.write(f"Airflow: {env_rec.airflow:.2f}\n\n")
        
        f.write("PRIORITY FACTORS\n")
        f.write("-" * 25 + "\n")
        for factor in env_rec.priority_factors:
            f.write(f"- {factor}\n")
        f.write("\n")
        
        f.write("IMPLEMENTATION NOTES\n")
        f.write("-" * 25 + "\n")
        for note in env_rec.implementation_notes:
            f.write(f"- {note}\n")
    
    print(f"Summary report saved to: {summary_path}")


def main():
    """Run the complete example workflow."""
    print("Layer 3 Sleep Environment Optimization System - Example Usage")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Step 1: Create realistic user
        user = create_realistic_user()
        
        # Step 2: Train RL agent
        agent, eval_results = train_agent_demo(user)
        
        # Step 3: Generate recommendations
        report = generate_recommendations_demo(agent, user)
        
        # Step 4: Analyze results
        analysis_results = analyze_results_demo(report, user)
        
        # Step 5: Visualize results (optional - requires matplotlib)
        try:
            visualize_results_demo(analysis_results, report)
        except ImportError:
            print("\nMatplotlib not available - skipping visualization")
        
        # Step 6: Export results
        export_results_demo(report, analysis_results)
        
        print("\n" + "=" * 70)
        print("EXAMPLE COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nOutput files created in 'example_outputs/' directory:")
        print("- comprehensive_report.json")
        print("- summary_report.txt")
        print("- sleep_optimization_results.png (if matplotlib available)")
        
    except Exception as e:
        print(f"\nError during example execution: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
