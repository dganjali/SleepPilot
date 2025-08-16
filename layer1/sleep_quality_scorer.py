"""
Sleep Quality Scorer

A comprehensive system for calculating sleep quality scores based on:
- Detected sleep events (snore, apnea, cough counts)
- Sleep duration
- Self-reported factors (sleep rating, environment rating)

Outputs a normalized score from 0-100.
"""

from typing import Dict, Optional, Tuple
from dataclasses import dataclass


@dataclass
class SleepEventData:
    """Container for sleep event counts"""
    snore_count: int = 0
    apnea_count: int = 0
    cough_count: int = 0


@dataclass
class SelfReportedData:
    """Container for self-reported sleep factors"""
    sleep_rating: int  # 1-10 scale
    environment_rating: int  # 1-10 scale


class SleepQualityScorer:
    """
    Sleep quality scoring system with configurable weights and normalization.
    
    The scoring formula considers:
    1. Sleep duration (optimal range: 7-9 hours)
    2. Sleep events (negative impact: snoring, apnea, coughing)
    3. Self-reported sleep quality (1-10 scale)
    4. Self-reported environment quality (1-10 scale)
    """
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """
        Initialize the scorer with custom weights or use defaults.
        
        Args:
            weights: Dictionary of weights for each factor. If None, uses defaults.
        """
        self.weights = weights or {
            'duration': 0.25,      # Sleep duration weight
            'events': 0.25,        # Sleep events weight (negative impact)
            'sleep_rating': 0.30,  # Self-reported sleep quality weight
            'environment': 0.20    # Environment rating weight
        }
        
        # Validate weights sum to 1.0
        total_weight = sum(self.weights.values())
        if abs(total_weight - 1.0) > 1e-6:
            raise ValueError(f"Weights must sum to 1.0, got {total_weight}")
        
        # Optimal sleep duration range (in hours)
        self.optimal_duration_min = 7.0
        self.optimal_duration_max = 9.0
        
        # Event thresholds for normalization
        self.event_thresholds = {
            'snore': 50,    # High snore count threshold
            'apnea': 10,    # High apnea count threshold  
            'cough': 20     # High cough count threshold
        }
    
    def calculate_duration_score(self, duration_hours: float) -> float:
        """
        Calculate duration score based on optimal sleep range.
        
        Args:
            duration_hours: Sleep duration in hours
            
        Returns:
            Score from 0-100, where 100 is optimal duration
        """
        if duration_hours <= 0:
            return 0.0
        
        # Optimal range gets full score
        if self.optimal_duration_min <= duration_hours <= self.optimal_duration_max:
            return 100.0
        
        # Calculate penalty for being outside optimal range
        if duration_hours < self.optimal_duration_min:
            # Too little sleep - linear penalty
            penalty = (self.optimal_duration_min - duration_hours) / self.optimal_duration_min
            return max(0, 100 - penalty * 100)
        else:
            # Too much sleep - exponential penalty
            excess = duration_hours - self.optimal_duration_max
            penalty = min(1.0, excess / 3.0)  # Cap penalty at 100%
            return max(0, 100 - penalty * 100)
    
    def calculate_events_score(self, events: SleepEventData) -> float:
        """
        Calculate events score (negative impact).
        
        Args:
            events: SleepEventData object with event counts
            
        Returns:
            Score from 0-100, where 100 is no events
        """
        # Normalize each event type
        snore_penalty = min(1.0, events.snore_count / self.event_thresholds['snore'])
        apnea_penalty = min(1.0, events.apnea_count / self.event_thresholds['apnea'])
        cough_penalty = min(1.0, events.cough_count / self.event_thresholds['cough'])
        
        # Weight the penalties (apnea is most serious, then cough, then snore)
        total_penalty = (snore_penalty * 0.3 + 
                        apnea_penalty * 0.5 + 
                        cough_penalty * 0.2)
        
        return max(0, 100 - total_penalty * 100)
    
    def normalize_rating(self, rating: int, scale: int = 10) -> float:
        """
        Normalize a rating to 0-100 scale.
        
        Args:
            rating: Rating value
            scale: Original scale (default 10)
            
        Returns:
            Normalized score from 0-100
        """
        return (rating / scale) * 100
    
    def calculate_sleep_quality_score(
        self,
        duration_hours: float,
        events: SleepEventData,
        self_reported: SelfReportedData
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculate overall sleep quality score.
        
        Args:
            duration_hours: Sleep duration in hours
            events: SleepEventData object with event counts
            self_reported: SelfReportedData object with ratings
            
        Returns:
            Tuple of (overall_score, component_scores)
        """
        # Calculate individual component scores
        duration_score = self.calculate_duration_score(duration_hours)
        events_score = self.calculate_events_score(events)
        sleep_rating_score = self.normalize_rating(self_reported.sleep_rating)
        environment_score = self.normalize_rating(self_reported.environment_rating)
        
        # Calculate weighted overall score
        overall_score = (
            duration_score * self.weights['duration'] +
            events_score * self.weights['events'] +
            sleep_rating_score * self.weights['sleep_rating'] +
            environment_score * self.weights['environment']
        )
        
        # Ensure score is within 0-100 range
        overall_score = max(0, min(100, overall_score))
        
        component_scores = {
            'duration': duration_score,
            'events': events_score,
            'sleep_rating': sleep_rating_score,
            'environment': environment_score,
            'overall': overall_score
        }
        
        return overall_score, component_scores
    
    def get_quality_category(self, score: float) -> str:
        """
        Categorize sleep quality based on score.
        
        Args:
            score: Sleep quality score (0-100)
            
        Returns:
            Quality category string
        """
        if score >= 90:
            return "Excellent"
        elif score >= 80:
            return "Good"
        elif score >= 70:
            return "Fair"
        elif score >= 60:
            return "Poor"
        else:
            return "Very Poor"
    
    def get_recommendations(self, component_scores: Dict[str, float]) -> list:
        """
        Generate recommendations based on component scores.
        
        Args:
            component_scores: Dictionary of component scores
            
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        # Duration recommendations
        if component_scores['duration'] < 70:
            if component_scores['duration'] < 50:
                recommendations.append("Consider increasing sleep duration to 7-9 hours")
            else:
                recommendations.append("Try to maintain consistent sleep schedule")
        
        # Events recommendations
        if component_scores['events'] < 80:
            if component_scores['events'] < 60:
                recommendations.append("Consult healthcare provider about sleep events")
            else:
                recommendations.append("Monitor sleep events and consider lifestyle changes")
        
        # Sleep rating recommendations
        if component_scores['sleep_rating'] < 70:
            recommendations.append("Consider sleep hygiene practices and stress management")
        
        # Environment recommendations
        if component_scores['environment'] < 70:
            recommendations.append("Optimize sleep environment (temperature, noise, comfort)")
        
        return recommendations


def main():
    """Example usage of the SleepQualityScorer"""
    
    # Initialize scorer
    scorer = SleepQualityScorer()
    
    # Example data
    duration = 7.5  # hours
    events = SleepEventData(
        snore_count=15,
        apnea_count=2,
        cough_count=3
    )
    self_reported = SelfReportedData(
        sleep_rating=7,
        environment_rating=8
    )
    
    # Calculate score
    overall_score, component_scores = scorer.calculate_sleep_quality_score(
        duration, events, self_reported
    )
    
    # Get quality category and recommendations
    quality_category = scorer.get_quality_category(overall_score)
    recommendations = scorer.get_recommendations(component_scores)
    
    # Print results
    print("=== Sleep Quality Assessment ===")
    print(f"Overall Score: {overall_score:.1f}/100")
    print(f"Quality Category: {quality_category}")
    print("\nComponent Scores:")
    for component, score in component_scores.items():
        if component != 'overall':
            print(f"  {component.replace('_', ' ').title()}: {score:.1f}/100")
    
    print(f"\nRecommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec}")


if __name__ == "__main__":
    main()
