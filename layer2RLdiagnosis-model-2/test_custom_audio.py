#!/usr/bin/env python3
"""
Utility script for testing the trained RL agent on custom audio files.
"""

import os
import numpy as np
import torch
import matplotlib.pyplot as plt
import librosa
import soundfile as sf
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Import our custom modules
from data_loader import AudioPreprocessor
from apnea_detection_env import ApneaDetectionEnv
from rl_agent import ApneaRLAgent


class CustomAudioTester:
    """Test the trained RL agent on custom audio files."""
    
    def __init__(self, model_path: str = "models/apnea_detection_agent"):
        self.model_path = model_path
        self.preprocessor = AudioPreprocessor()
        self.agent = None
        
        # Load trained agent if available
        if os.path.exists(model_path):
            self.load_agent()
    
    def load_agent(self) -> None:
        """Load the trained agent."""
        try:
            # Create a dummy environment for loading
            dummy_env = ApneaDetectionEnv(
                audio_segments=[np.zeros(160000)],  # 10 seconds at 16kHz
                labels=[0]
            )
            
            self.agent = ApneaRLAgent(dummy_env)
            self.agent.load(self.model_path)
            print(f"Agent loaded from {self.model_path}")
            
        except Exception as e:
            print(f"Error loading agent: {e}")
            print("Please ensure the agent is trained first")
    
    def test_audio_file(self, audio_path: str, segment_duration: float = 10.0) -> Dict:
        """Test a single audio file for apnea detection."""
        if self.agent is None:
            raise ValueError("Agent not loaded. Please train the agent first.")
        
        print(f"Testing audio file: {audio_path}")
        
        # Load audio
        try:
            audio, sr = self.preprocessor.load_audio(audio_path)
            print(f"Audio loaded: {len(audio)} samples, {sr} Hz sample rate")
        except Exception as e:
            print(f"Error loading audio: {e}")
            return {}
        
        # Segment audio
        segments = self.preprocessor.segment_audio(audio, sr)
        print(f"Created {len(segments)} segments of {segment_duration} seconds each")
        
        if not segments:
            print("No valid segments extracted")
            return {}
        
        # Create test environment
        test_env = ApneaDetectionEnv(
            audio_segments=segments,
            labels=[0] * len(segments)  # Unknown labels for custom audio
        )
        
        # Run inference
        results = self.agent.evaluate_episode(test_env)
        
        # Analyze results
        analysis = self._analyze_results(results, segments, sr, segment_duration)
        
        return analysis
    
    def _analyze_results(self, results: Dict, segments: List[np.ndarray], 
                        sr: int, segment_duration: float) -> Dict:
        """Analyze the results and provide detailed insights."""
        analysis = {
            'audio_info': {
                'total_duration': len(segments) * segment_duration,
                'segment_count': len(segments),
                'sample_rate': sr
            },
            'detection_results': results,
            'apnea_events': [],
            'confidence_analysis': {},
            'severity_assessment': {}
        }
        
        # Extract episode results
        if results.get('episode_results'):
            episode_results = results['episode_results']
            
            # Apnea events with timestamps
            if 'diagnosed_segments' in episode_results:
                for i, segment_info in enumerate(episode_results['diagnosed_segments']):
                    if segment_info.get('label', 0) == 1:  # Apnea detected
                        timestamp = i * segment_duration
                        confidence = segment_info.get('confidence', 0)
                        
                        analysis['apnea_events'].append({
                            'timestamp': timestamp,
                            'duration': segment_duration,
                            'confidence': confidence,
                            'segment_index': i
                        })
            
            # Confidence analysis
            if 'median_confidence' in episode_results:
                analysis['confidence_analysis'] = {
                    'median_confidence': episode_results['median_confidence'],
                    'ece_score': episode_results.get('ece', 0),
                    'confidence_reliability': 'High' if episode_results.get('ece', 1) < 0.1 else 'Medium' if episode_results.get('ece', 1) < 0.2 else 'Low'
                }
            
            # Severity assessment
            if 'severity' in episode_results:
                severity = episode_results['severity']
                analysis['severity_assessment'] = {
                    'severity_score': severity,
                    'severity_level': self._get_severity_level(severity),
                    'apnea_frequency': f"{episode_results.get('apnea_count', 0)} events per {len(segments)} segments",
                    'recommendation': self._get_recommendation(severity)
                }
        
        return analysis
    
    def _get_severity_level(self, severity: float) -> str:
        """Convert severity score to human-readable level."""
        if severity < 0.1:
            return "Very Low"
        elif severity < 0.25:
            return "Low"
        elif severity < 0.5:
            return "Moderate"
        elif severity < 0.75:
            return "High"
        else:
            return "Very High"
    
    def _get_recommendation(self, severity: float) -> str:
        """Provide recommendations based on severity."""
        if severity < 0.1:
            return "No immediate action needed. Continue monitoring."
        elif severity < 0.25:
            return "Consider lifestyle changes and monitor sleep patterns."
        elif severity < 0.5:
            return "Consult a sleep specialist for evaluation."
        elif severity < 0.75:
            return "Immediate medical attention recommended."
        else:
            return "Urgent medical evaluation required."
    
    def visualize_results(self, analysis: Dict, save_path: str = None) -> None:
        """Visualize the analysis results."""
        if not analysis or 'apnea_events' not in analysis:
            print("No analysis results to visualize")
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # Apnea events timeline
        if analysis['apnea_events']:
            timestamps = [event['timestamp'] for event in analysis['apnea_events']]
            confidences = [event['confidence'] for event in analysis['apnea_events']]
            
            axes[0, 0].scatter(timestamps, confidences, c='red', s=100, alpha=0.7)
            axes[0, 0].set_title('Apnea Events Timeline')
            axes[0, 0].set_xlabel('Time (seconds)')
            axes[0, 0].set_ylabel('Confidence')
            axes[0, 0].grid(True, alpha=0.3)
            
            # Add severity threshold line
            total_duration = analysis['audio_info']['total_duration']
            axes[0, 0].axhline(y=0.5, color='orange', linestyle='--', alpha=0.7, label='Confidence Threshold')
            axes[0, 0].legend()
        
        # Confidence distribution
        if analysis['confidence_analysis']:
            confidence_data = [analysis['confidence_analysis']['median_confidence']]
            axes[0, 1].bar(['Median Confidence'], confidence_data, color='blue', alpha=0.7)
            axes[0, 1].set_title('Confidence Analysis')
            axes[0, 1].set_ylabel('Confidence Score')
            axes[0, 1].set_ylim(0, 1)
            
            # Add ECE score
            if 'ece_score' in analysis['confidence_analysis']:
                axes[0, 1].text(0, confidence_data[0] + 0.05, 
                               f"ECE: {analysis['confidence_analysis']['ece_score']:.3f}", 
                               ha='center', va='bottom')
        
        # Severity assessment
        if analysis['severity_assessment']:
            severity_score = analysis['severity_assessment']['severity_score']
            severity_level = analysis['severity_assessment']['severity_level']
            
            # Color code based on severity
            colors = ['green', 'lightgreen', 'yellow', 'orange', 'red']
            severity_colors = {
                'Very Low': 'green',
                'Low': 'lightgreen', 
                'Moderate': 'yellow',
                'High': 'orange',
                'Very High': 'red'
            }
            
            color = severity_colors.get(severity_level, 'gray')
            
            axes[1, 0].bar(['Severity Score'], [severity_score], color=color, alpha=0.7)
            axes[1, 0].set_title('Severity Assessment')
            axes[1, 0].set_ylabel('Severity Score')
            axes[1, 0].set_ylim(0, 1)
            
            # Add severity level text
            axes[1, 0].text(0, severity_score + 0.05, severity_level, 
                           ha='center', va='bottom', fontweight='bold')
        
        # Audio information
        audio_info = analysis['audio_info']
        info_text = f"""
        Total Duration: {audio_info['total_duration']:.1f}s
        Segments: {audio_info['segment_count']}
        Sample Rate: {audio_info['sample_rate']} Hz
        Apnea Events: {len(analysis['apnea_events'])}
        """
        
        axes[1, 1].text(0.1, 0.5, info_text, transform=axes[1, 1].transAxes,
                        fontsize=12, verticalalignment='center',
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.5))
        axes[1, 1].set_title('Audio Information')
        axes[1, 1].axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
    
    def generate_report(self, analysis: Dict, output_file: str = "apnea_analysis_report.txt") -> None:
        """Generate a detailed text report of the analysis."""
        with open(output_file, 'w') as f:
            f.write("SLEEP APNEA DETECTION ANALYSIS REPORT\n")
            f.write("=" * 50 + "\n\n")
            
            # Audio information
            f.write("AUDIO INFORMATION:\n")
            f.write("-" * 20 + "\n")
            audio_info = analysis['audio_info']
            f.write(f"Total Duration: {audio_info['total_duration']:.1f} seconds\n")
            f.write(f"Number of Segments: {audio_info['segment_count']}\n")
            f.write(f"Sample Rate: {audio_info['sample_rate']} Hz\n\n")
            
            # Detection results
            f.write("DETECTION RESULTS:\n")
            f.write("-" * 20 + "\n")
            if analysis['apnea_events']:
                f.write(f"Total Apnea Events Detected: {len(analysis['apnea_events'])}\n\n")
                
                f.write("Apnea Events Details:\n")
                for i, event in enumerate(analysis['apnea_events'], 1):
                    f.write(f"  Event {i}:\n")
                    f.write(f"    Timestamp: {event['timestamp']:.1f}s\n")
                    f.write(f"    Duration: {event['duration']:.1f}s\n")
                    f.write(f"    Confidence: {event['confidence']:.3f}\n")
                    f.write(f"    Segment Index: {event['segment_index']}\n\n")
            else:
                f.write("No apnea events detected.\n\n")
            
            # Confidence analysis
            f.write("CONFIDENCE ANALYSIS:\n")
            f.write("-" * 20 + "\n")
            if analysis['confidence_analysis']:
                conf_analysis = analysis['confidence_analysis']
                f.write(f"Median Confidence: {conf_analysis['median_confidence']:.3f}\n")
                f.write(f"ECE Score: {conf_analysis['ece_score']:.3f}\n")
                f.write(f"Confidence Reliability: {conf_analysis['confidence_reliability']}\n\n")
            
            # Severity assessment
            f.write("SEVERITY ASSESSMENT:\n")
            f.write("-" * 20 + "\n")
            if analysis['severity_assessment']:
                severity = analysis['severity_assessment']
                f.write(f"Severity Score: {severity['severity_score']:.3f}\n")
                f.write(f"Severity Level: {severity['severity_level']}\n")
                f.write(f"Apnea Frequency: {severity['apnea_frequency']}\n")
                f.write(f"Recommendation: {severity['recommendation']}\n\n")
            
            # Summary
            f.write("SUMMARY:\n")
            f.write("-" * 20 + "\n")
            if analysis['apnea_events']:
                f.write("Apnea events were detected in the audio recording. ")
                f.write("The severity and confidence scores indicate the reliability ")
                f.write("of these detections. Please consult the recommendations above.\n")
            else:
                f.write("No apnea events were detected in the audio recording. ")
                f.write("This suggests normal sleep patterns, but continued monitoring ")
                f.write("is recommended for comprehensive assessment.\n")
        
        print(f"Report saved to {output_file}")


def main():
    """Main function for testing custom audio."""
    print("Custom Audio Apnea Detection Tester")
    print("=" * 50)
    
    # Initialize tester
    tester = CustomAudioTester()
    
    # Test on apnea.mp3 if available
    if os.path.exists("apnea.mp3"):
        print("Testing on apnea.mp3...")
        
        try:
            # Run analysis
            analysis = tester.test_audio_file("apnea.mp3")
            
            if analysis:
                # Display results
                print("\n" + "="*50)
                print("ANALYSIS RESULTS")
                print("="*50)
                
                print(f"Audio Duration: {analysis['audio_info']['total_duration']:.1f} seconds")
                print(f"Segments Analyzed: {analysis['audio_info']['segment_count']}")
                print(f"Apnea Events Detected: {len(analysis['apnea_events'])}")
                
                if analysis['severity_assessment']:
                    severity = analysis['severity_assessment']
                    print(f"Severity Level: {severity['severity_level']}")
                    print(f"Recommendation: {severity['recommendation']}")
                
                # Visualize results
                tester.visualize_results(analysis, save_path="apnea_analysis.png")
                
                # Generate report
                tester.generate_report(analysis)
                
            else:
                print("No analysis results available")
        
        except Exception as e:
            print(f"Error during analysis: {e}")
            import traceback
            traceback.print_exc()
    
    else:
        print("apnea.mp3 not found. Please ensure the file is in the current directory.")
        print("You can test other audio files by calling:")
        print("  tester = CustomAudioTester()")
        print("  analysis = tester.test_audio_file('your_audio_file.mp3')")


if __name__ == "__main__":
    main()
