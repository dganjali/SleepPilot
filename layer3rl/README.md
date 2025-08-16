# Layer 3: Personalized Sleep Environment Optimization System

This is Layer 3 of the Personalized Sleep Health & Smart Optimization System, implementing a Reinforcement Learning (RL) based approach to optimize sleep environments for individual users.

## Overview

The system uses RL agents to learn optimal environmental settings (temperature, lighting, noise, humidity, airflow) that maximize sleep quality for each user. It provides personalized recommendations without requiring physical smart home devices.

## Architecture

### Core Components

1. **Synthetic User Generator** (`user_generator.py`)
   - Creates realistic user profiles with varying environmental sensitivities
   - Generates diverse user populations for training and testing

2. **Simulated Environment** (`sleep_environment.py`)
   - Gymnasium environment that models how environmental factors affect sleep
   - Provides realistic sleep quality predictions based on user preferences

3. **RL Agent** (`rl_agent.py`)
   - Implements PPO, SAC, and TD3 algorithms for environment optimization
   - Learns personalized strategies for each user

4. **Recommendation Engine** (`recommendation_engine.py`)
   - Converts trained RL agents into actionable recommendations
   - Provides comprehensive sleep optimization reports

5. **API Server** (`api.py`)
   - FastAPI server for integration with frontend dashboards
   - RESTful endpoints for user management, training, and recommendations

## Features

### Environmental Factors Optimized

1. **Temperature**
   - Room temperature (°C/°F)
   - Gradual cooling/heating schedules
   - Optimal temperature ranges per user

2. **Lighting**
   - Light intensity and color temperature
   - Time-based dimming schedules
   - Warm vs. cool light optimization

3. **Noise/Sound**
   - Ambient noise levels
   - Sound types (white, pink, nature, fan)
   - Timing and fade schedules

4. **Humidity & Airflow**
   - Relative humidity levels
   - Airflow intensity
   - Ventilation optimization

### Personalized Recommendations

- **Environmental Settings**: Optimal values for all factors
- **Time-based Schedules**: When to adjust settings throughout the night
- **Lifestyle Recommendations**: Pre-sleep routines, dietary advice, exercise timing
- **Risk Assessment**: Sleep apnea and fragmentation risk analysis
- **Implementation Plans**: Step-by-step guidance for improvements

## Installation

### Prerequisites

- Python 3.8+
- pip

### Setup

1. **Clone the repository**
   ```bash
   cd layer3rl
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation**
   ```bash
   python -c "import gymnasium, stable_baselines3, torch; print('Installation successful!')"
   ```

## Quick Start

### 1. Basic Training Demo

Train a single RL agent for a synthetic user:

```bash
python train_system.py --demo single
```

### 2. Multiple Users Demo

Train agents for multiple diverse users:

```bash
python train_system.py --demo multiple --num-users 10
```

### 3. Algorithm Comparison

Compare different RL algorithms:

```bash
python train_system.py --demo algorithms
```

### 4. Start API Server

Launch the REST API server:

```bash
python api.py
```

The API will be available at `http://localhost:8000`

## Usage Examples

### Training an RL Agent

```python
from user_generator import SyntheticUserGenerator
from rl_agent import SleepOptimizationAgent

# Generate a user profile
generator = SyntheticUserGenerator(seed=42)
user = generator.generate_user_profile("my_user")

# Create and train agent
agent = SleepOptimizationAgent(user, algorithm="PPO")
agent.train(total_timesteps=50000, save_path="my_models")

# Get recommendations
recommendations = agent.get_recommendations()
print(f"Optimal temperature: {recommendations['recommended_settings']['temperature']}°C")
```

### Using the Recommendation Engine

```python
from recommendation_engine import create_recommendation_engine

# Load trained model and generate comprehensive report
engine = create_recommendation_engine("my_models", "PPO")
report = engine.generate_recommendations()

# Export report
json_report = engine.export_report(report, "json")
```

### API Integration

```python
import requests

# Create a user
response = requests.post("http://localhost:8000/users", json={
    "age": 30,
    "gender": "male",
    "temp_optimal": 20.0
})
user_id = response.json()["user_id"]

# Start training
requests.post("http://localhost:8000/train", json={
    "user_id": user_id,
    "algorithm": "PPO",
    "total_timesteps": 50000
})

# Get recommendations
recommendations = requests.post("http://localhost:8000/recommendations", json={
    "user_id": user_id
}).json()
```

## API Endpoints

### User Management

- `POST /users` - Create user profile
- `GET /users/{user_id}` - Get user profile
- `GET /users` - List all users
- `DELETE /users/{user_id}` - Delete user

### Training

- `POST /train` - Start RL agent training
- `GET /train/status/{user_id}` - Get training status
- `GET /train/status` - Get all training statuses

### Recommendations

- `POST /recommendations` - Generate recommendations
- `GET /recommendations/{user_id}` - Get latest recommendations

### System

- `GET /` - API information
- `GET /health` - Health check
- `GET /status` - System status
- `GET /models` - List trained models

## Configuration

### Environment Variables

```bash
# Optional: Set device for training
export CUDA_VISIBLE_DEVICES=0  # Use GPU
export CUDA_VISIBLE_DEVICES=""  # Use CPU only
```

### Training Parameters

Key parameters that can be adjusted:

- **Episode Length**: Number of time steps per training episode (default: 100)
- **Total Timesteps**: Total training steps (default: 50,000)
- **Learning Rate**: RL algorithm learning rate (default: 3e-4)
- **Network Architecture**: Neural network size (default: 256x256)

### User Profile Customization

Users can be created with specific preferences:

```python
user = UserProfile(
    user_id="custom_user",
    temp_optimal=18.5,  # Prefers cooler temperatures
    light_sensitivity=0.2,  # Very light sensitive
    noise_tolerance=0.8,  # High noise tolerance
    humidity_preference=0.6,  # Prefers moderate humidity
    airflow_preference=0.7,  # Prefers airflow
    baseline_sleep_score=65.0,  # Current sleep quality
    age=35,
    gender="female"
)
```

## Performance Metrics

The system tracks several key metrics:

### Sleep Quality Metrics
- **Sleep Score**: Overall sleep quality (0-100)
- **Fragmentation**: Number of sleep disruptions per night
- **Apnea Risk**: Probability of sleep apnea (0-1)

### Training Metrics
- **Mean Reward**: Average reward during training
- **Sleep Score Improvement**: Expected improvement over baseline
- **Training Time**: Time to complete training

### Recommendation Quality
- **Confidence**: Confidence in recommendations (0-1)
- **Data Quality Score**: Quality of training data
- **Profile Completeness**: Completeness of user profile

## Integration with Other Layers

### Layer 1 Integration (Sleep Quality Evaluation)
- Can use real sleep scores from audio analysis
- Replace synthetic environment with ML predictions
- Feed actual sleep metrics into RL training

### Layer 2 Integration (Sleep Disorder Diagnosis)
- Incorporate apnea risk predictions
- Adjust reward function based on disorder likelihood
- Provide medical context for recommendations

### Layer 4 Integration (Frontend Dashboard)
- REST API provides data for visualization
- Real-time training status updates
- Comprehensive recommendation reports

## Advanced Features

### Multi-Agent Training
Train agents for multiple users simultaneously:

```python
from rl_agent import train_multiple_users

users = generator.generate_diverse_users(20)
results = train_multiple_users(users, output_dir="multi_user_models")
```

### Custom Reward Functions
Modify the reward function in `sleep_environment.py`:

```python
def _calculate_reward(self) -> float:
    # Custom reward logic
    sleep_reward = self.current_state.sleep_score / 100.0
    comfort_penalty = self._calculate_comfort_penalty()
    health_penalty = self._calculate_health_penalty()
    
    return sleep_reward - comfort_penalty - health_penalty
```

### Environment Customization
Extend the environment with additional factors:

```python
# Add new environmental factors
self.current_state.air_quality = 0.5
self.current_state.electromagnetic_fields = 0.1
```

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**
   ```bash
   export CUDA_VISIBLE_DEVICES=""  # Use CPU
   ```

2. **Training Not Converging**
   - Increase `total_timesteps`
   - Adjust learning rate
   - Check reward function

3. **API Connection Errors**
   - Verify server is running on correct port
   - Check CORS settings
   - Ensure all dependencies are installed

### Debug Mode

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Optimization

- Use GPU for faster training
- Increase batch size for better GPU utilization
- Use multiple environments for parallel training

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Install development dependencies
4. Run tests
5. Submit a pull request

### Testing

```bash
# Run unit tests
python -m pytest tests/

# Run integration tests
python -m pytest tests/integration/

# Run performance benchmarks
python benchmarks/performance_test.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Citation

If you use this system in your research, please cite:

```bibtex
@article{sleep_optimization_2024,
  title={Personalized Sleep Environment Optimization Using Reinforcement Learning},
  author={Your Name},
  journal={Journal of Sleep Research},
  year={2024}
}
```

## Support

For questions and support:

- Create an issue on GitHub
- Check the documentation
- Review the examples in the `examples/` directory

## Roadmap

### Planned Features

- [ ] Real-time environment monitoring
- [ ] Multi-objective optimization
- [ ] Transfer learning between users
- [ ] Mobile app integration
- [ ] Cloud deployment support
- [ ] Advanced visualization tools

### Performance Improvements

- [ ] Distributed training support
- [ ] Model compression for edge devices
- [ ] Automated hyperparameter tuning
- [ ] Real-time inference optimization
