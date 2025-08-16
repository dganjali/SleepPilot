"""
Apnea Diagnosis - Layer 2: RL-based Sleep Disorder Detection

This module simulates the RL diagnosis system that detects:
- Apnea events (breathing interruptions)
- Hypopnea events (shallow breathing)
- Oxygen desaturation
- Snoring patterns
- Breathing regularity

For now, this outputs 4 negative apnea events as requested,
but can be extended to integrate with actual RL models.
"""

import numpy as np
import json
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ApneaEvent:
    """Individual apnea event data"""
    timestamp: float  # seconds from start
    duration: float   # seconds
    severity: str     # mild, moderate, severe
    type: str         # obstructive, central, mixed
    oxygen_drop: float  # percentage drop


@dataclass
class ApneaDiagnosis:
    """Complete apnea diagnosis results"""
    total_apnea_events: int
    total_hypopnea_events: int
    apnea_hypopnea_index: float  # AHI: events per hour
    oxygen_desaturation: float   # lowest oxygen percentage
    snoring_intensity: float     # 0-1 scale
    breathing_regularity: float  # 0-1 scale
    risk_level: str              # low, medium, high
    events: List[ApneaEvent]
    analysis_confidence: float   # 0-1 scale


class MockApneaDiagnostic:
    """
    Mock RL-based apnea diagnostic system
    Currently outputs 4 negative apnea events as requested
    """
    
    def __init__(self):
        self.analysis_window = 3600  # 1 hour analysis window
        self.min_event_duration = 10  # minimum 10 seconds for apnea
        self.max_event_duration = 60  # maximum 60 seconds for apnea
        
        logger.info("Mock Apnea Diagnostic System initialized")
    
    def generate_mock_apnea_events(self, duration_hours: float = 8.0) -> List[ApneaEvent]:
        """
        Generate realistic mock apnea events
        Currently configured to output 4 negative events
        """
        events = []
        total_seconds = duration_hours * 3600
        
        # Generate 4 apnea events as requested
        event_times = np.random.choice(
            int(total_seconds), 
            size=4, 
            replace=False
        )
        
        for i, event_time in enumerate(event_times):
            # Randomize event characteristics
            duration = np.random.uniform(15, 45)  # 15-45 seconds
            severity = np.random.choice(['mild', 'moderate', 'severe'], p=[0.5, 0.3, 0.2])
            event_type = np.random.choice(['obstructive', 'central', 'mixed'], p=[0.7, 0.2, 0.1])
            oxygen_drop = np.random.uniform(2, 8)  # 2-8% oxygen drop
            
            event = ApneaEvent(
                timestamp=float(event_time),
                duration=duration,
                severity=severity,
                type=event_type,
                oxygen_drop=oxygen_drop
            )
            events.append(event)
        
        # Sort events by timestamp
        events.sort(key=lambda x: x.timestamp)
        
        logger.info(f"Generated {len(events)} mock apnea events")
        return events
    
    def calculate_ahi(self, events: List[ApneaEvent], duration_hours: float) -> float:
        """
        Calculate Apnea-Hypopnea Index (events per hour)
        """
        total_events = len(events)
        ahi = total_events / duration_hours
        
        return round(ahi, 1)
    
    def calculate_oxygen_desaturation(self, events: List[ApneaEvent]) -> float:
        """
        Calculate lowest oxygen saturation during events
        """
        if not events:
            return 98.0  # Normal oxygen level
        
        # Start with normal oxygen level
        base_oxygen = 98.0
        
        # Find the event with the largest oxygen drop
        max_drop = max(event.oxygen_drop for event in events)
        
        # Calculate lowest oxygen level
        lowest_oxygen = base_oxygen - max_drop
        
        return round(lowest_oxygen, 1)
    
    def assess_snoring_intensity(self, events: List[ApneaEvent]) -> float:
        """
        Assess snoring intensity based on apnea events
        """
        if not events:
            return 0.1  # Minimal snoring
        
        # More severe events = more snoring
        severity_weights = {'mild': 0.3, 'moderate': 0.6, 'severe': 0.9}
        total_intensity = sum(severity_weights[event.severity] for event in events)
        
        # Normalize to 0-1 scale
        avg_intensity = total_intensity / len(events)
        
        return round(avg_intensity, 2)
    
    def assess_breathing_regularity(self, events: List[ApneaEvent], duration_hours: float) -> float:
        """
        Assess breathing regularity (higher = more regular)
        """
        if not events:
            return 0.95  # Very regular breathing
        
        # More events = less regular breathing
        event_frequency = len(events) / duration_hours
        
        # Convert to regularity score (0-1)
        # 0 events/hour = 0.95, 10+ events/hour = 0.3
        regularity = max(0.3, 0.95 - (event_frequency * 0.065))
        
        return round(regularity, 2)
    
    def determine_risk_level(self, ahi: float, oxygen_level: float) -> str:
        """
        Determine overall risk level based on AHI and oxygen
        """
        if ahi < 5 and oxygen_level > 95:
            return 'low'
        elif ahi < 15 and oxygen_level > 90:
            return 'medium'
        else:
            return 'high'
    
    def calculate_confidence(self, events: List[ApneaEvent], duration_hours: float) -> float:
        """
        Calculate confidence in the diagnosis
        """
        # More data = higher confidence
        if duration_hours >= 6:
            base_confidence = 0.9
        elif duration_hours >= 4:
            base_confidence = 0.8
        else:
            base_confidence = 0.7
        
        # Event consistency affects confidence
        if events:
            event_durations = [event.duration for event in events]
            duration_std = np.std(event_durations)
            
            # More consistent event durations = higher confidence
            consistency_factor = max(0.1, 1.0 - (duration_std / 30))
            confidence = base_confidence * consistency_factor
        else:
            confidence = base_confidence
        
        return round(confidence, 2)
    
    def diagnose_sleep_apnea(self, duration_hours: float = 8.0) -> ApneaDiagnosis:
        """
        Main method to perform apnea diagnosis
        """
        logger.info(f"Starting apnea diagnosis for {duration_hours} hours of sleep")
        
        # Generate mock apnea events (4 events as requested)
        events = self.generate_mock_apnea_events(duration_hours)
        
        # Calculate diagnostic metrics
        ahi = self.calculate_ahi(events, duration_hours)
        oxygen_level = self.calculate_oxygen_desaturation(events)
        snoring_intensity = self.assess_snoring_intensity(events)
        breathing_regularity = self.assess_breathing_regularity(events, duration_hours)
        risk_level = self.determine_risk_level(ahi, oxygen_level)
        confidence = self.calculate_confidence(events, duration_hours)
        
        # Create diagnosis object
        diagnosis = ApneaDiagnosis(
            total_apnea_events=len(events),
            total_hypopnea_events=0,  # No hypopnea events in this mock
            apnea_hypopnea_index=ahi,
            oxygen_desaturation=oxygen_level,
            snoring_intensity=snoring_intensity,
            breathing_regularity=breathing_regularity,
            risk_level=risk_level,
            events=events,
            analysis_confidence=confidence
        )
        
        logger.info(f"Apnea diagnosis completed: {len(events)} events, AHI: {ahi}")
        return diagnosis
    
    def save_diagnosis(self, diagnosis: ApneaDiagnosis, output_path: str):
        """
        Save diagnosis results to JSON file
        """
        try:
            # Convert dataclass to dict for JSON serialization
            diagnosis_dict = {
                'total_apnea_events': diagnosis.total_apnea_events,
                'total_hypopnea_events': diagnosis.total_hypopnea_events,
                'apnea_hypopnea_index': diagnosis.apnea_hypopnea_index,
                'oxygen_desaturation': diagnosis.oxygen_desaturation,
                'snoring_intensity': diagnosis.snoring_intensity,
                'breathing_regularity': diagnosis.breathing_regularity,
                'risk_level': diagnosis.risk_level,
                'analysis_confidence': diagnosis.analysis_confidence,
                'events': [
                    {
                        'timestamp': event.timestamp,
                        'duration': event.duration,
                        'severity': event.severity,
                        'type': event.type,
                        'oxygen_drop': event.oxygen_drop
                    }
                    for event in diagnosis.events
                ],
                'analysis_timestamp': datetime.now().isoformat()
            }
            
            with open(output_path, 'w') as f:
                json.dump(diagnosis_dict, f, indent=2)
            
            logger.info(f"Diagnosis results saved to: {output_path}")
            
        except Exception as e:
            logger.error(f"Error saving diagnosis: {e}")
            raise


# Example usage and testing
if __name__ == "__main__":
    # Initialize diagnostic system
    diagnostic = MockApneaDiagnostic()
    
    # Perform diagnosis for 8 hours of sleep
    diagnosis = diagnostic.diagnose_sleep_apnea(8.0)
    
    # Save results
    diagnostic.save_diagnosis(diagnosis, "apnea_diagnosis_results.json")
    
    # Print summary
    print("=== Apnea Diagnosis Results ===")
    print(f"Total Apnea Events: {diagnosis.total_apnea_events}")
    print(f"Apnea-Hypopnea Index (AHI): {diagnosis.apnea_hypopnea_index}")
    print(f"Lowest Oxygen Level: {diagnosis.oxygen_desaturation}%")
    print(f"Snoring Intensity: {diagnosis.snoring_intensity:.2f}")
    print(f"Breathing Regularity: {diagnosis.breathing_regularity:.2f}")
    print(f"Risk Level: {diagnosis.risk_level}")
    print(f"Analysis Confidence: {diagnosis.analysis_confidence:.2f}")
    
    print("\nApnea Events:")
    for i, event in enumerate(diagnosis.events, 1):
        print(f"  Event {i}: {event.type} apnea at {event.timestamp/3600:.1f}h, "
              f"duration {event.duration:.1f}s, severity {event.severity}")
    
    print(f"\nNote: Generated {diagnosis.total_apnea_events} negative apnea events as requested")
