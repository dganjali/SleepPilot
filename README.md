# SleepPilot - AI-Powered Sleep Optimization Platform

A comprehensive, multi-layered AI system for sleep analysis, diagnosis, and optimization using machine learning, reinforcement learning, and real-time data processing.

## Overview

SleepPilot is a cutting-edge sleep optimization platform that combines multiple AI technologies to provide personalized sleep insights and recommendations. The system processes sleep data through three distinct layers, each specializing in different aspects of sleep analysis and optimization.

## Architecture

The project is structured in three main layers, each serving a specific purpose in the sleep optimization pipeline:

```
ignition/
├── layer1/          # ML-based sleep quality scoring
├── layer2RLdiagnosis-v1/  # RL-based apnea diagnosis
├── layer3rl/        # RL environment optimization & API
└── frontend2/       # React Native mobile application
```

## Layer 1: ML Sleep Quality Scoring

**Location**: `layer1/`

**Purpose**: Initial sleep quality assessment using machine learning models.

**Key Features**:
- Sleep quality scoring based on audio and environmental data
- Pre-trained models for rapid analysis
- Baseline sleep pattern recognition

**Technologies**:
- PyTorch
- Audio processing with librosa
- Machine learning models for sleep classification

**Files**:
- `sleep_quality_scorer.py` - Main scoring algorithm
- `larger_trainer.py` - Model training scripts
- `final_larger_model.pth` - Pre-trained model weights

## Layer 2: RL Apnea Diagnosis

**Location**: `layer2RLdiagnosis-v1/`

**Purpose**: Advanced sleep apnea detection using reinforcement learning.

**Key Features**:
- Real-time apnea event detection
- RL agent training for diagnosis optimization
- Multi-parameter sleep analysis
- Confidence scoring for medical applications

**Technologies**:
- PyTorch
- Gymnasium (OpenAI Gym)
- Stable-Baselines3
- Reinforcement Learning algorithms (PPO, SAC)

**Key Components**:
- `apnea_env.py` - Custom RL environment for sleep apnea detection
- `diagnose_agent.py` - RL agent implementation
- `rl_agent.py` - Core RL algorithms
- `main.py` - Training and evaluation scripts

**Dependencies**:
```bash
pip install -r requirements.txt
```

## Layer 3: RL Environment Optimization & API

**Location**: `layer3rl/`

**Purpose**: Real-time environment optimization and API services for the frontend.

**Key Features**:
- RESTful API for sleep data processing
- Real-time environment optimization using RL
- Sleep quality improvement recommendations
- Audio analysis and processing

**Technologies**:
- FastAPI
- PyTorch
- Gymnasium
- Stable-Baselines3
- Audio processing libraries

**API Endpoints**:
- `/analyze` - Sleep data analysis
- `/optimize` - Environment optimization
- `/recommendations` - Personalized sleep recommendations

**Dependencies**:
```bash
pip install -r requirements.txt
```

## Frontend: React Native Mobile App

**Location**: `frontend2/`

**Purpose**: Cross-platform mobile application for user interaction and data visualization.

**Key Features**:
- Beautiful, modern UI with dark theme
- Real-time sleep data visualization
- Interactive charts and graphs
- Personalized recommendations display
- Layer 3 RL analytics dashboard

**Technologies**:
- React Native
- Expo
- Victory Native (charts)
- React Navigation
- Linear gradients and animations

**Screens**:
- **Landing Screen**: Interactive cloud animations and app introduction
- **Dashboard**: Sleep data input and processing
- **Trends**: Sleep pattern visualization with 5 distinct peaks
- **Recommendations**: Personalized tips with RL training analytics
- **Risks**: Sleep risk assessment
- **Profile**: User settings and preferences

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ignition.git
cd ignition
```

#### 2. Set Up Layer 1 (ML Sleep Scoring)
```bash
cd layer1
pip install torch torchaudio librosa numpy scipy
# Run training or use pre-trained models
python larger_trainer.py
```

#### 3. Set Up Layer 2 (RL Apnea Diagnosis)
```bash
cd ../layer2RLdiagnosis-v1
pip install -r requirements.txt
# Train the RL agent
python main.py
```

#### 4. Set Up Layer 3 (RL API)
```bash
cd ../layer3rl
pip install -r requirements.txt
# Start the API server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

#### 5. Set Up Frontend
```bash
cd ../frontend2
npm install
npm start
```

### Running the Application

1. **Start Layer 3 API**:
   ```bash
   cd layer3rl
   uvicorn api:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend2
   npm start
   ```

3. **Access the App**:
   - Use Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or run on iOS/Android simulators

## 📊 Features & Capabilities

### Sleep Analysis
- **Audio Processing**: Real-time sleep audio analysis
- **Pattern Recognition**: ML-based sleep pattern identification
- **Quality Scoring**: Comprehensive sleep quality metrics
- **Event Detection**: Apnea and sleep disturbance detection

### AI Optimization
- **Reinforcement Learning**: Continuous environment optimization
- **Personalized Recommendations**: User-specific sleep improvements
- **Real-time Adaptation**: Dynamic adjustment based on user feedback
- **Multi-parameter Optimization**: Temperature, light, noise, humidity, airflow

### Data Visualization
- **Interactive Charts**: Victory Native-powered visualizations
- **Real-time Updates**: Live data streaming and updates
- **Trend Analysis**: Historical sleep pattern analysis
- **Performance Metrics**: RL training progress and convergence

### User Experience
- **Intuitive Interface**: Modern, accessible design
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Engaging user interactions
- **Offline Capability**: Core functionality without internet

## Configuration

### Environment Variables

Create `.env` files in each layer directory:

**Layer 3 API**:
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=./models/
DEBUG_MODE=true
```

**Frontend**:
```env
API_BASE_URL=http://localhost:8000
ENABLE_ANALYTICS=true
DEBUG_MODE=true
```

### Model Configuration

Each layer can be configured through JSON configuration files:

- **Layer 1**: `config.json` for ML model parameters
- **Layer 2**: `config.py` for RL environment settings
- **Layer 3**: `config.py` for API and optimization parameters

## Performance & Scalability

### Optimization Features
- **Model Quantization**: Optimized inference for mobile devices
- **Batch Processing**: Efficient handling of multiple sleep sessions
- **Caching**: Intelligent data caching for improved performance
- **Async Processing**: Non-blocking API operations

### Scalability Considerations
- **Microservices Architecture**: Independent layer scaling
- **Load Balancing**: Distributed API handling
- **Database Optimization**: Efficient data storage and retrieval
- **Mobile Optimization**: Lightweight models for edge devices

## Testing

### Unit Tests
```bash
# Layer 1
cd layer1
python -m pytest tests/

# Layer 2
cd ../layer2RLdiagnosis-v1
python -m pytest tests/

# Layer 3
cd ../layer3rl
python -m pytest tests/
```

### Integration Tests
```bash
# Test API endpoints
cd layer3rl
python test_api.py

# Test frontend components
cd ../frontend2
npm test
```

### Performance Testing
```bash
# Load testing for API
cd layer3rl
python performance_test.py
```

## API Documentation

### Layer 3 API Endpoints

#### POST /analyze
Analyze sleep data and return quality metrics.

**Request Body**:
```json
{
  "audio_data": "base64_encoded_audio",
  "environmental_data": {
    "temperature": 22.5,
    "humidity": 45.0,
    "light_level": 0.1,
    "noise_level": 0.2
  },
  "user_metrics": {
    "hours_slept": 7.5,
    "sleep_rating": 8,
    "stress_level": "medium"
  }
}
```

**Response**:
```json
{
  "sleep_score": 85,
  "quality_category": "good",
  "confidence": 0.92,
  "recommendations": [
    "Optimize room temperature to 20°C",
    "Reduce ambient light exposure"
  ]
}
```

#### POST /optimize
Get RL-optimized environment recommendations.

**Request Body**:
```json
{
  "current_environment": {
    "temperature": 24.0,
    "humidity": 50.0,
    "light_level": 0.8,
    "noise_level": 0.6
  },
  "sleep_history": [...],
  "user_preferences": {...}
}
```

## Troubleshooting

### Common Issues

#### Layer 1 Issues
- **Model Loading Errors**: Ensure PyTorch version compatibility
- **Audio Processing**: Check librosa and soundfile installations

#### Layer 2 Issues
- **RL Training**: Verify Gymnasium and Stable-Baselines3 versions
- **Environment Errors**: Check custom environment implementation

#### Layer 3 Issues
- **API Connection**: Verify FastAPI server is running
- **Model Loading**: Check model file paths and permissions

#### Frontend Issues
- **Build Errors**: Clear npm cache and reinstall dependencies
- **Chart Rendering**: Ensure Victory Native is properly linked
- **Navigation**: Check React Navigation configuration

### Debug Mode

Enable debug mode in each layer for detailed logging:

```python
# Python layers
import logging
logging.basicConfig(level=logging.DEBUG)

# Frontend
console.log('Debug mode enabled');
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
- **Testing**: Write tests for new features
- **Documentation**: Update README and code comments
- **Performance**: Consider mobile device limitations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Research Community**: Sleep science and AI research papers
- **Open Source**: PyTorch, React Native, and other libraries
- **Medical Advisors**: Sleep medicine professionals
- **Beta Testers**: Early users and feedback providers

## Roadmap

### Phase 1 (Current)
- ✅ Basic ML sleep scoring
- ✅ RL apnea detection
- ✅ Environment optimization API
- ✅ Mobile frontend

### Phase 2 (Next)
- 🔄 Multi-user support
- 🔄 Cloud deployment
- 🔄 Advanced analytics
- 🔄 Medical device integration

### Phase 3 (Future)
- 📋 FDA approval for medical use
- 📋 Enterprise solutions
- 📋 Research partnerships
- 📋 Global expansion

---

**SleepPilot** - Revolutionizing sleep optimization through AI innovation.
