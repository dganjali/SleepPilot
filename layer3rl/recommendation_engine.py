"""
Policy Export and Recommendation Engine

This module converts trained RL agents into actionable recommendations for the dashboard.
It provides a clean interface between the RL system and the frontend.
"""

import numpy as np
import json
import os
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta

from user_generator import UserProfile
from rl_agent import SleepOptimizationAgent


@dataclass
class EnvironmentRecommendation:
    """Represents a recommendation for environmental optimization."""
    # Temperature recommendations
    temperature: float  # Recommended temperature (°C)
    light_intensity: float  # Recommended light intensity (0-1)
    light_color_temp: float  # Recommended color temperature (0-1, warm to cool)
    noise_level: float  # Recommended noise level (0-1)
    noise_type: str  # Type of noise (white, pink, nature, fan, none)
    humidity: float  # Recommended humidity (0-1)
    airflow: float  # Recommended airflow (0-1)
    
    # Expected outcomes
    expected_sleep_score: float  # Expected sleep score with these settings
    expected_improvement: float  # Expected improvement over baseline
    confidence: float  # Confidence in the recommendation (0-1)
    
    # Additional insights
    priority_factors: List[str]  # Most important factors for this user
    risk_factors: List[str]  # Potential risk factors
    implementation_notes: List[str]  # Notes for implementation
    
    # Optional time-based schedules
    temperature_schedule: Optional[List[Dict[str, Any]]] = None  # Time-based schedule
    light_schedule: Optional[List[Dict[str, Any]]] = None  # Time-based schedule
    noise_schedule: Optional[List[Dict[str, Any]]] = None  # Time-based schedule


@dataclass
class LifestyleRecommendation:
    """Represents lifestyle recommendations for better sleep."""
    pre_sleep_routine: List[str]  # Recommended pre-sleep activities
    bedtime_schedule: Dict[str, str]  # Recommended bedtime and wake time
    dietary_recommendations: List[str]  # Dietary suggestions
    exercise_recommendations: List[str]  # Exercise timing suggestions
    stress_management: List[str]  # Stress reduction techniques


@dataclass
class SleepOptimizationReport:
    """Complete sleep optimization report for a user."""
    user_id: str
    timestamp: str
    current_sleep_score: float
    baseline_sleep_score: float
    
    # Environmental recommendations
    environment_recommendations: EnvironmentRecommendation
    
    # Lifestyle recommendations
    lifestyle_recommendations: LifestyleRecommendation
    
    # Analysis
    sleep_quality_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    
    # Implementation plan
    implementation_plan: Dict[str, Any]
    
    # Confidence and reliability
    overall_confidence: float
    data_quality_score: float


class RecommendationEngine:
    """
    Engine that converts trained RL agents into actionable recommendations.
    """
    
    def __init__(self, model_path: str, algorithm: str = "PPO"):
        """
        Initialize the recommendation engine.
        
        Args:
            model_path: Path to the trained model
            algorithm: Algorithm used for training
        """
        self.model_path = model_path
        self.algorithm = algorithm
        self.agent = None
        self.user_profile = None
        
        # Load the trained agent
        self._load_agent()
    
    def _load_agent(self):
        """Load the trained RL agent."""
        try:
            self.agent = SleepOptimizationAgent.load_model(self.model_path, self.algorithm)
            self.user_profile = self.agent.user_profile
        except Exception as e:
            raise ValueError(f"Failed to load agent from {self.model_path}: {e}")
    
    def generate_recommendations(self, 
                                current_environment: Optional[Dict[str, float]] = None,
                                include_lifestyle: bool = True) -> SleepOptimizationReport:
        """
        Generate comprehensive sleep optimization recommendations.
        
        Args:
            current_environment: Current environment settings (optional)
            include_lifestyle: Whether to include lifestyle recommendations
            
        Returns:
            Complete sleep optimization report
        """
        # Get RL agent recommendations
        rl_recommendations = self.agent.get_recommendations(current_environment)
        
        # Create environment recommendations
        env_rec = self._create_environment_recommendations(rl_recommendations)
        
        # Create lifestyle recommendations
        lifestyle_rec = None
        if include_lifestyle:
            lifestyle_rec = self._create_lifestyle_recommendations()
        
        # Create sleep quality analysis
        sleep_analysis = self._analyze_sleep_quality()
        
        # Create risk assessment
        risk_assessment = self._assess_risks()
        
        # Create implementation plan
        implementation_plan = self._create_implementation_plan(env_rec)
        
        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(rl_recommendations)
        
        # Calculate data quality score
        data_quality_score = self._calculate_data_quality_score()
        
        return SleepOptimizationReport(
            user_id=self.user_profile.user_id,
            timestamp=datetime.now().isoformat(),
            current_sleep_score=rl_recommendations['expected_sleep_score'],
            baseline_sleep_score=self.user_profile.baseline_sleep_score or 60.0,
            environment_recommendations=env_rec,
            lifestyle_recommendations=lifestyle_rec,
            sleep_quality_analysis=sleep_analysis,
            risk_assessment=risk_assessment,
            implementation_plan=implementation_plan,
            overall_confidence=overall_confidence,
            data_quality_score=data_quality_score
        )
    
    def _create_environment_recommendations(self, rl_recommendations: Dict[str, Any]) -> EnvironmentRecommendation:
        """Create detailed environment recommendations."""
        settings = rl_recommendations['recommended_settings']
        
        # Determine priority factors based on user profile
        priority_factors = self._identify_priority_factors()
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(settings)
        
        # Create implementation notes
        implementation_notes = self._create_implementation_notes(settings)
        
        # Create time-based schedules
        temp_schedule = self._create_temperature_schedule(settings['temperature'])
        light_schedule = self._create_light_schedule(settings['light_intensity'], settings['light_color_temp'])
        noise_schedule = self._create_noise_schedule(settings['noise_level'], settings['noise_type'])
        
        return EnvironmentRecommendation(
            temperature=settings['temperature'],
            temperature_schedule=temp_schedule,
            light_intensity=settings['light_intensity'],
            light_color_temp=settings['light_color_temp'],
            light_schedule=light_schedule,
            noise_level=settings['noise_level'],
            noise_type=self._noise_type_to_string(settings['noise_type']),
            noise_schedule=noise_schedule,
            humidity=settings['humidity'],
            airflow=settings['airflow'],
            expected_sleep_score=rl_recommendations['expected_sleep_score'],
            expected_improvement=rl_recommendations['expected_improvement'],
            confidence=rl_recommendations['confidence'],
            priority_factors=priority_factors,
            risk_factors=risk_factors,
            implementation_notes=implementation_notes
        )
    
    def _create_lifestyle_recommendations(self) -> LifestyleRecommendation:
        """Create lifestyle recommendations based on user profile."""
        # Pre-sleep routine based on user characteristics
        pre_sleep_routine = self._generate_pre_sleep_routine()
        
        # Bedtime schedule
        bedtime_schedule = self._generate_bedtime_schedule()
        
        # Dietary recommendations
        dietary_recommendations = self._generate_dietary_recommendations()
        
        # Exercise recommendations
        exercise_recommendations = self._generate_exercise_recommendations()
        
        # Stress management
        stress_management = self._generate_stress_management()
        
        return LifestyleRecommendation(
            pre_sleep_routine=pre_sleep_routine,
            bedtime_schedule=bedtime_schedule,
            dietary_recommendations=dietary_recommendations,
            exercise_recommendations=exercise_recommendations,
            stress_management=stress_management
        )
    
    def _identify_priority_factors(self) -> List[str]:
        """Identify the most important environmental factors for this user."""
        factors = []
        
        # Temperature is always important
        factors.append("Temperature")
        
        # Add factors based on user sensitivity
        if self.user_profile.light_sensitivity < 0.3:
            factors.append("Light Control")
        
        if self.user_profile.noise_tolerance < 0.3:
            factors.append("Noise Management")
        
        if abs(self.user_profile.humidity_preference - 0.5) > 0.2:
            factors.append("Humidity Control")
        
        if self.user_profile.airflow_preference > 0.7:
            factors.append("Airflow")
        
        return factors[:3]  # Top 3 factors
    
    def _identify_risk_factors(self, settings: Dict[str, float]) -> List[str]:
        """Identify potential risk factors in the recommended settings."""
        risks = []
        
        # Temperature risks
        if settings['temperature'] < 15 or settings['temperature'] > 25:
            risks.append("Temperature outside optimal range")
        
        # Light risks
        if settings['light_intensity'] > 0.3:
            risks.append("Light intensity may interfere with sleep")
        
        # Noise risks
        if settings['noise_level'] > 0.6:
            risks.append("Noise level may be disruptive")
        
        # Humidity risks
        if settings['humidity'] > 0.7:
            risks.append("High humidity may affect breathing")
        
        return risks
    
    def _create_implementation_notes(self, settings: Dict[str, float]) -> List[str]:
        """Create notes for implementing the recommendations."""
        notes = []
        
        # Temperature notes
        temp_diff = abs(settings['temperature'] - 20.0)  # Assume 20°C is typical
        if temp_diff > 3:
            notes.append(f"Temperature adjustment of {temp_diff:.1f}°C recommended")
        
        # Light notes
        if settings['light_intensity'] < 0.1:
            notes.append("Ensure complete darkness for optimal sleep")
        elif settings['light_intensity'] > 0.2:
            notes.append("Consider blackout curtains or eye mask")
        
        # Noise notes
        if settings['noise_type'] < 0.5:
            notes.append("White or pink noise recommended for sleep")
        
        return notes
    
    def _create_temperature_schedule(self, optimal_temp: float) -> List[Dict[str, Any]]:
        """Create a temperature schedule for the night."""
        return [
            {
                "time": "21:00",
                "temperature": optimal_temp + 1.0,
                "action": "Begin cooling"
            },
            {
                "time": "22:00", 
                "temperature": optimal_temp + 0.5,
                "action": "Continue cooling"
            },
            {
                "time": "23:00",
                "temperature": optimal_temp,
                "action": "Maintain optimal temperature"
            },
            {
                "time": "06:00",
                "temperature": optimal_temp + 1.0,
                "action": "Begin warming"
            }
        ]
    
    def _create_light_schedule(self, intensity: float, color_temp: float) -> List[Dict[str, Any]]:
        """Create a light schedule for the night."""
        return [
            {
                "time": "20:00",
                "intensity": min(intensity + 0.2, 1.0),
                "color_temp": max(color_temp - 0.2, 0.0),
                "action": "Begin dimming, warm light"
            },
            {
                "time": "21:00",
                "intensity": intensity,
                "color_temp": color_temp,
                "action": "Maintain sleep lighting"
            },
            {
                "time": "22:00",
                "intensity": max(intensity - 0.1, 0.0),
                "color_temp": color_temp,
                "action": "Further dimming"
            },
            {
                "time": "06:00",
                "intensity": min(intensity + 0.3, 1.0),
                "color_temp": min(color_temp + 0.3, 1.0),
                "action": "Gradual brightening, cool light"
            }
        ]
    
    def _create_noise_schedule(self, level: float, noise_type: float) -> List[Dict[str, Any]]:
        """Create a noise schedule for the night."""
        noise_type_str = self._noise_type_to_string(noise_type)
        
        return [
            {
                "time": "21:00",
                "level": min(level + 0.1, 1.0),
                "type": noise_type_str,
                "action": "Begin ambient noise"
            },
            {
                "time": "22:00",
                "level": level,
                "type": noise_type_str,
                "action": "Maintain sleep noise"
            },
            {
                "time": "06:00",
                "level": max(level - 0.2, 0.0),
                "type": "none",
                "action": "Gradually reduce noise"
            }
        ]
    
    def _noise_type_to_string(self, noise_type: float) -> str:
        """Convert noise type float to string."""
        if noise_type < 0.25:
            return "white"
        elif noise_type < 0.5:
            return "pink"
        elif noise_type < 0.75:
            return "nature"
        else:
            return "fan"
    
    def _generate_pre_sleep_routine(self) -> List[str]:
        """Generate pre-sleep routine recommendations."""
        routine = [
            "Avoid screens 1 hour before bedtime",
            "Practice relaxation techniques (deep breathing, meditation)",
            "Take a warm bath or shower",
            "Read a book (physical book, not e-reader)"
        ]
        
        # Add personalized recommendations based on user profile
        if self.user_profile.age and self.user_profile.age > 50:
            routine.append("Consider magnesium supplements")
        
        if self.user_profile.baseline_apnea_risk and self.user_profile.baseline_apnea_risk > 0.2:
            routine.append("Sleep on your side to reduce apnea risk")
        
        return routine
    
    def _generate_bedtime_schedule(self) -> Dict[str, str]:
        """Generate bedtime schedule recommendations."""
        # Assume 8 hours of sleep needed
        wake_time = "07:00"  # Default wake time
        bedtime = "23:00"    # Default bedtime
        
        return {
            "bedtime": bedtime,
            "wake_time": wake_time,
            "sleep_duration": "8 hours"
        }
    
    def _generate_dietary_recommendations(self) -> List[str]:
        """Generate dietary recommendations for better sleep."""
        return [
            "Avoid caffeine after 2 PM",
            "Limit alcohol consumption, especially close to bedtime",
            "Avoid heavy meals 2-3 hours before sleep",
            "Consider light snack with tryptophan (turkey, nuts) if hungry",
            "Stay hydrated but reduce fluid intake 2 hours before bed"
        ]
    
    def _generate_exercise_recommendations(self) -> List[str]:
        """Generate exercise recommendations for better sleep."""
        return [
            "Exercise regularly, but avoid vigorous activity 3 hours before bedtime",
            "Consider gentle stretching or yoga in the evening",
            "Get natural light exposure during the day",
            "Aim for 30 minutes of moderate exercise daily"
        ]
    
    def _generate_stress_management(self) -> List[str]:
        """Generate stress management recommendations."""
        return [
            "Practice mindfulness or meditation daily",
            "Keep a worry journal to clear your mind before bed",
            "Establish a consistent daily routine",
            "Consider professional help if stress is persistent"
        ]
    
    def _analyze_sleep_quality(self) -> Dict[str, Any]:
        """Analyze current sleep quality and factors affecting it."""
        baseline_score = self.user_profile.baseline_sleep_score or 60.0
        
        analysis = {
            "current_score": baseline_score,
            "score_category": self._categorize_sleep_score(baseline_score),
            "primary_factors": self._identify_primary_factors(),
            "improvement_potential": self._assess_improvement_potential(),
            "trend_analysis": "stable"  # Would be calculated from historical data
        }
        
        return analysis
    
    def _categorize_sleep_score(self, score: float) -> str:
        """Categorize sleep score."""
        if score >= 80:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 60:
            return "fair"
        elif score >= 50:
            return "poor"
        else:
            return "very_poor"
    
    def _identify_primary_factors(self) -> List[str]:
        """Identify primary factors affecting sleep quality."""
        factors = []
        
        if self.user_profile.baseline_fragmentation and self.user_profile.baseline_fragmentation > 20:
            factors.append("Sleep fragmentation")
        
        if self.user_profile.baseline_apnea_risk and self.user_profile.baseline_apnea_risk > 0.15:
            factors.append("Sleep apnea risk")
        
        if self.user_profile.light_sensitivity < 0.3:
            factors.append("Light sensitivity")
        
        if self.user_profile.noise_tolerance < 0.3:
            factors.append("Noise sensitivity")
        
        return factors
    
    def _assess_improvement_potential(self) -> str:
        """Assess potential for improvement."""
        baseline_score = self.user_profile.baseline_sleep_score or 60.0
        
        if baseline_score < 60:
            return "high"
        elif baseline_score < 75:
            return "moderate"
        else:
            return "low"
    
    def _assess_risks(self) -> Dict[str, Any]:
        """Assess potential health risks."""
        risks = {
            "apnea_risk": {
                "level": self._categorize_risk(self.user_profile.baseline_apnea_risk or 0.1),
                "value": self.user_profile.baseline_apnea_risk or 0.1,
                "recommendation": "Consider sleep study if symptoms persist"
            },
            "fragmentation_risk": {
                "level": self._categorize_risk((self.user_profile.baseline_fragmentation or 15) / 50.0),
                "value": self.user_profile.baseline_fragmentation or 15,
                "recommendation": "Focus on environmental optimization"
            }
        }
        
        return risks
    
    def _categorize_risk(self, risk_value: float) -> str:
        """Categorize risk level."""
        if risk_value < 0.1:
            return "low"
        elif risk_value < 0.25:
            return "moderate"
        else:
            return "high"
    
    def _create_implementation_plan(self, env_rec: EnvironmentRecommendation) -> Dict[str, Any]:
        """Create an implementation plan for the recommendations."""
        return {
            "immediate_actions": [
                "Adjust room temperature to recommended setting",
                "Implement lighting changes",
                "Set up noise management system"
            ],
            "short_term_goals": [
                "Establish consistent sleep schedule",
                "Create optimal sleep environment",
                "Monitor sleep quality improvements"
            ],
            "long_term_goals": [
                "Maintain optimized sleep environment",
                "Continue lifestyle improvements",
                "Regular sleep quality assessments"
            ],
            "timeline": {
                "week_1": "Implement environmental changes",
                "week_2": "Establish new sleep routine",
                "month_1": "Evaluate improvements and adjust",
                "month_3": "Comprehensive sleep quality review"
            }
        }
    
    def _calculate_overall_confidence(self, rl_recommendations: Dict[str, Any]) -> float:
        """Calculate overall confidence in the recommendations."""
        # Base confidence from RL agent
        base_confidence = rl_recommendations['confidence']
        
        # Adjust based on data quality
        data_quality = self._calculate_data_quality_score()
        
        # Adjust based on user profile completeness
        profile_completeness = self._calculate_profile_completeness()
        
        # Combine factors
        overall_confidence = (base_confidence * 0.5 + 
                            data_quality * 0.3 + 
                            profile_completeness * 0.2)
        
        return min(overall_confidence, 0.95)
    
    def _calculate_data_quality_score(self) -> float:
        """Calculate data quality score."""
        # This would be based on the quality and quantity of training data
        # For now, return a reasonable default
        return 0.8
    
    def _calculate_profile_completeness(self) -> float:
        """Calculate how complete the user profile is."""
        required_fields = [
            'temp_optimal', 'light_sensitivity', 'noise_tolerance',
            'humidity_preference', 'airflow_preference'
        ]
        
        optional_fields = [
            'baseline_sleep_score', 'baseline_apnea_risk', 'baseline_fragmentation',
            'age', 'gender', 'weight', 'height'
        ]
        
        required_completeness = sum(1 for field in required_fields 
                                  if getattr(self.user_profile, field) is not None) / len(required_fields)
        
        optional_completeness = sum(1 for field in optional_fields 
                                  if getattr(self.user_profile, field) is not None) / len(optional_fields)
        
        return required_completeness * 0.7 + optional_completeness * 0.3
    
    def export_report(self, report: SleepOptimizationReport, format: str = "json") -> str:
        """
        Export the report in the specified format.
        
        Args:
            report: Sleep optimization report
            format: Export format ("json", "dict")
            
        Returns:
            Exported report
        """
        if format == "json":
            return json.dumps(asdict(report), indent=2)
        elif format == "dict":
            return asdict(report)
        else:
            raise ValueError(f"Unsupported format: {format}")


def create_recommendation_engine(model_path: str, algorithm: str = "PPO") -> RecommendationEngine:
    """
    Factory function to create a recommendation engine.
    
    Args:
        model_path: Path to the trained model
        algorithm: Algorithm used for training
        
    Returns:
        RecommendationEngine instance
    """
    return RecommendationEngine(model_path, algorithm)


if __name__ == "__main__":
    # Test the recommendation engine
    # Note: This requires a trained model to exist
    try:
        engine = create_recommendation_engine("test_model", "PPO")
        report = engine.generate_recommendations()
        
        print("Sleep Optimization Report:")
        print(json.dumps(engine.export_report(report, "dict"), indent=2))
        
    except Exception as e:
        print(f"Error testing recommendation engine: {e}")
        print("Please train a model first using rl_agent.py")
