import numpy as np
from typing import Tuple, List, Dict, Any
from sklearn.metrics import roc_auc_score, brier_score_loss
from sklearn.calibration import calibration_curve
import matplotlib.pyplot as plt

def calculate_ece(confidences: np.ndarray, predictions: np.ndarray, 
                  true_labels: np.ndarray, n_bins: int = 10) -> float:
    """
    Calculate Expected Calibration Error (ECE)
    
    Args:
        confidences: Model confidence scores
        predictions: Model predictions (0 or 1)
        true_labels: True labels (0 or 1)
        n_bins: Number of confidence bins
    
    Returns:
        ECE score
    """
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]
    
    ece = 0.0
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
        if np.sum(in_bin) > 0:
            bin_confidence = np.mean(confidences[in_bin])
            bin_accuracy = np.mean(true_labels[in_bin])
            ece += np.sum(in_bin) * np.abs(bin_confidence - bin_accuracy)
    
    return ece / len(confidences)

def calculate_brier_score(confidences: np.ndarray, true_labels: np.ndarray) -> float:
    """Calculate Brier score for confidence calibration"""
    return brier_score_loss(true_labels, confidences)

def calculate_auc(predictions: np.ndarray, true_labels: np.ndarray) -> float:
    """Calculate Area Under ROC Curve"""
    try:
        return roc_auc_score(true_labels, predictions)
    except ValueError:
        return 0.5  # Return 0.5 if only one class present

def aggregate_patient_metrics(episode_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate metrics across multiple episodes for a patient
    
    Args:
        episode_metrics: List of episode metric dictionaries
    
    Returns:
        Aggregated metrics dictionary
    """
    if not episode_metrics:
        return {}
    
    # Extract all metrics
    accuracies = [m['accuracy'] for m in episode_metrics]
    eces = [m['ece'] for m in episode_metrics]
    confidences = [m['mean_confidence'] for m in episode_metrics]
    severities = [m['severity_score'] for m in episode_metrics]
    n_apnea_events = [m['n_apnea_events'] for m in episode_metrics]
    
    # Calculate aggregated statistics
    aggregated = {
        'mean_accuracy': np.mean(accuracies),
        'std_accuracy': np.std(accuracies),
        'mean_ece': np.mean(eces),
        'std_ece': np.std(eces),
        'mean_confidence': np.mean(confidences),
        'std_confidence': np.std(confidences),
        'mean_severity': np.mean(severities),
        'std_severity': np.std(severities),
        'total_apnea_events': np.sum(n_apnea_events),
        'mean_apnea_events_per_episode': np.mean(n_apnea_events),
        'n_episodes': len(episode_metrics)
    }
    
    return aggregated

def create_calibration_plot(confidences: np.ndarray, true_labels: np.ndarray, 
                           save_path: str = None) -> plt.Figure:
    """
    Create calibration plot showing confidence vs accuracy
    
    Args:
        confidences: Model confidence scores
        true_labels: True labels
        save_path: Optional path to save the plot
    
    Returns:
        Matplotlib figure
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Calibration curve
    fraction_of_positives, mean_predicted_value = calibration_curve(
        true_labels, confidences, n_bins=10
    )
    
    ax1.plot(mean_predicted_value, fraction_of_positives, "s-", label="Model")
    ax1.plot([0, 1], [0, 1], "k:", label="Perfectly calibrated")
    ax1.set_xlabel("Mean Predicted Probability")
    ax1.set_ylabel("Fraction of Positives")
    ax1.set_title("Calibration Plot")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Confidence distribution
    ax2.hist(confidences, bins=20, alpha=0.7, edgecolor='black')
    ax2.set_xlabel("Confidence Score")
    ax2.set_ylabel("Frequency")
    ax2.set_title("Confidence Distribution")
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return fig

def calculate_severity_scale(apnea_events_per_hour: float) -> str:
    """
    Calculate apnea severity scale based on AHI (Apnea-Hypopnea Index)
    
    Args:
        apnea_events_per_hour: Number of apnea events per hour
    
    Returns:
        Severity category string
    """
    if apnea_events_per_hour < 5:
        return "Normal"
    elif apnea_events_per_hour < 15:
        return "Mild"
    elif apnea_events_per_hour < 30:
        return "Moderate"
    else:
        return "Severe"

def extract_timestamps(audio_segments: np.ndarray, sample_rate: int = 16000, 
                      segment_duration: float = 10.0) -> np.ndarray:
    """
    Extract timestamps for audio segments
    
    Args:
        audio_segments: Array of audio segments
        sample_rate: Audio sample rate
        segment_duration: Duration of each segment in seconds
    
    Returns:
        Array of timestamps in seconds
    """
    n_segments = len(audio_segments)
    timestamps = np.arange(0, n_segments * segment_duration, segment_duration)
    return timestamps

def normalize_features(features: np.ndarray, method: str = 'standard') -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Normalize feature vectors
    
    Args:
        features: Feature array
        method: Normalization method ('standard', 'minmax', 'robust')
    
    Returns:
        Normalized features and normalization parameters
    """
    if method == 'standard':
        mean = np.mean(features, axis=0)
        std = np.std(features, axis=0)
        std[std == 0] = 1  # Avoid division by zero
        normalized = (features - mean) / std
        params = {'mean': mean, 'std': std}
    
    elif method == 'minmax':
        min_val = np.min(features, axis=0)
        max_val = np.max(features, axis=0)
        range_val = max_val - min_val
        range_val[range_val == 0] = 1  # Avoid division by zero
        normalized = (features - min_val) / range_val
        params = {'min': min_val, 'max': max_val}
    
    elif method == 'robust':
        median = np.median(features, axis=0)
        mad = np.median(np.abs(features - median), axis=0)
        mad[mad == 0] = 1  # Avoid division by zero
        normalized = (features - median) / mad
        params = {'median': median, 'mad': mad}
    
    else:
        raise ValueError(f"Unknown normalization method: {method}")
    
    return normalized, params

def apply_normalization(features: np.ndarray, params: Dict[str, Any], 
                       method: str = 'standard') -> np.ndarray:
    """
    Apply normalization using pre-computed parameters
    
    Args:
        features: Features to normalize
        params: Normalization parameters
        method: Normalization method
    
    Returns:
        Normalized features
    """
    if method == 'standard':
        return (features - params['mean']) / params['std']
    elif method == 'minmax':
        return (features - params['min']) / (params['max'] - params['min'])
    elif method == 'robust':
        return (features - params['median']) / params['mad']
    else:
        raise ValueError(f"Unknown normalization method: {method}")
