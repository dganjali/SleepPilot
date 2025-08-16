# Sleep Health App - React Native Frontend

A comprehensive React Native mobile application for monitoring and optimizing sleep health, featuring AI-powered recommendations and risk assessment.

## 🚀 Features

### Core Functionality
- **Sleep Score Dashboard**: Visual gauge showing daily sleep quality (0-100)
- **Real-time Metrics**: Snoring intensity, apnea risk, sleep fragmentation
- **Trend Analysis**: Weekly/monthly sleep score trends with interactive charts
- **AI Recommendations**: Personalized suggestions from RL agent for sleep optimization
- **Risk Assessment**: Sleep disorder risk evaluation with educational content
- **User Preferences**: Customizable settings for sensitivity and preferences

### Technical Features
- **Dark Theme**: Optimized for night-time use with minimal eye strain
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Real-time Updates**: Live data synchronization with backend
- **Offline Support**: Cached data for offline viewing
- **Cross-platform**: iOS and Android support

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation (Bottom Tabs)
- **Charts**: Victory Native for data visualization
- **State Management**: Zustand for lightweight state management
- **Data Fetching**: Axios for API communication
- **Icons**: Expo Vector Icons
- **TypeScript**: Full type safety

## 📱 Screens

1. **Dashboard**: Daily sleep overview with score gauge and key metrics
2. **Trends**: Sleep score trends, snoring intensity, and fragmentation charts
3. **Recommendations**: AI-powered sleep optimization suggestions
4. **Risks**: Sleep disorder risk assessment and educational content
5. **Profile**: User preferences, settings, and account management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web (development)
   npm run web
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=http://localhost:8000
```

### Backend Connection
Update the API base URL in `src/api/sleepApi.ts` to point to your backend server.

## 📊 Data Flow

1. **User uploads audio** → Backend processes with Layer 1 + 2
2. **Backend sends results** → Sleep score, events, and risk assessment
3. **RL agent runs** → Generates personalized environment recommendations
4. **Frontend displays** → Dashboard, trends, and actionable suggestions

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#059669)
- **Warning**: Yellow (#d97706)
- **Danger**: Red (#dc2626)
- **Background**: Dark slate (#0f172a, #020617)
- **Surface**: Slate (#1e293b, #334155)

### Typography
- **Headings**: Bold, large text for screen titles
- **Body**: Regular weight for content
- **Captions**: Small text for metadata and labels

### Components
- **Metric Cards**: Display key sleep metrics with color-coded variants
- **Sleep Score Gauge**: Circular progress indicator for sleep quality
- **Recommendation Cards**: Actionable suggestions with priority levels
- **Risk Assessment**: Interactive risk factors with educational modals

## 🔌 API Integration

### Endpoints
- `GET /sleep/current` - Current sleep data
- `GET /sleep/history` - Sleep history
- `GET /recommendations` - AI recommendations
- `GET /sleep/risk-assessment` - Risk assessment
- `POST /sleep/analyze` - Upload audio for analysis

### Data Models
See `src/types/index.ts` for complete TypeScript interfaces.

## 📱 Mobile Considerations

### iOS Specific
- Safe area handling for notches and home indicators
- Native iOS design patterns
- Optimized for iOS performance

### Android Specific
- Material Design components
- Android navigation patterns
- Cross-platform compatibility

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📦 Building for Production

### iOS Build
```bash
expo build:ios
```

### Android Build
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🚀 Deployment

### App Store (iOS)
1. Build with EAS
2. Upload to App Store Connect
3. Submit for review

### Google Play Store (Android)
1. Build with EAS
2. Upload to Google Play Console
3. Submit for review

## 🔒 Security Considerations

- API keys stored securely
- User data encrypted in transit
- Secure authentication (implement as needed)
- Privacy-first design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Sleep Tracking**: Real-time sleep monitoring
- **Smart Home Integration**: IoT device control
- **Social Features**: Sleep challenges and community
- **Advanced Analytics**: Machine learning insights
- **Wearable Integration**: Apple Watch, Fitbit support

---

**Built with ❤️ using React Native and Expo**
