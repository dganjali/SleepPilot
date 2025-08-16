# Sleep Health App - React Native Frontend

A comprehensive React Native mobile application for sleep health monitoring and optimization, featuring AI-powered recommendations and real-time sleep analysis.

## 🚀 Features

### Core Functionality
- **Sleep Score Dashboard** - Real-time sleep quality assessment with visual gauges
- **Trends & Analytics** - Interactive charts showing sleep patterns over time
- **AI Recommendations** - Personalized environment optimization suggestions
- **Risk Assessment** - Sleep disorder detection and health monitoring
- **User Profile Management** - Customizable preferences and settings

### Technical Features
- **Dark Theme** - Optimized for nighttime use and reduced eye strain
- **Real-time Updates** - Live data visualization and progress tracking
- **Offline Support** - Local data storage with sync capabilities
- **Responsive Design** - Optimized for various screen sizes
- **Accessibility** - Support for screen readers and assistive technologies

## 📱 Screens

### 1. Dashboard
- Sleep score gauge with color-coded indicators
- Key metrics cards (snoring, apnea risk, fragmentation, duration)
- Sleep stages pie chart
- Quick action buttons
- Recent recommendations

### 2. Trends & Insights
- Interactive line charts for sleep metrics
- Time period selection (week/month/year)
- AI-generated insights and recommendations
- Sleep stages comparison
- Pattern analysis

### 3. Recommendations
- AI-powered environment optimization suggestions
- Category filtering (temperature, lighting, noise, etc.)
- Priority levels and confidence scores
- Actionable implementation steps
- Progress tracking

### 4. Sleep Risks
- Risk assessment for sleep disorders
- Probability gauges with visual indicators
- Educational content and explanations
- Specialist referral options
- Health summary dashboard

### 5. Profile & Settings
- User profile management
- Sleep preferences configuration
- App settings and notifications
- Data export/import functionality
- Privacy and support options

## 🛠 Tech Stack

### Core Framework
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript development

### UI & Navigation
- **React Native Paper** - Material Design components
- **React Navigation** - Screen navigation and routing
- **Ionicons** - Icon library
- **Victory Native** - Charting and data visualization

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **AsyncStorage** - Local data persistence

### API & Data
- **Axios** - HTTP client for API communication
- **FastAPI Backend** - Integration with Layer 3 RL system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Copy the example environment file and configure it:
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your API URL:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Install Expo CLI (if not already installed)**
   ```bash
   npm install -g @expo/cli
   ```

5. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

6. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

7. **Using Expo Go app**
   - Install Expo Go on your mobile device
   - Scan the QR code from the terminal
   - The app will load on your device

## 🔧 Configuration

### API Integration
The app connects to the Layer 3 RL backend for:
- Sleep data analysis
- AI recommendations
- Risk assessments
- User profile management

### Theme Customization
The app uses a comprehensive theme system with:
- Dark theme optimized for sleep
- Color-coded metrics and indicators
- Consistent typography and spacing
- Accessibility considerations

### Data Persistence
- Local storage for offline functionality
- Secure data handling
- Export/import capabilities
- Cloud sync options

## 📊 Data Flow

### 1. Sleep Data Collection
```
User Records Audio → Backend Processing → Sleep Score Calculation → Frontend Display
```

### 2. AI Recommendations
```
Sleep Patterns → RL Agent Analysis → Personalized Recommendations → Frontend Presentation
```

### 3. Risk Assessment
```
Sleep Metrics → Risk Analysis → Probability Calculation → Health Alerts
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#6366f1) - Main brand color
- **Secondary**: Teal (#14b8a6) - Supporting elements
- **Tertiary**: Amber (#f59e0b) - Accent color
- **Success**: Emerald (#10b981) - Positive indicators
- **Warning**: Amber (#f59e0b) - Caution indicators
- **Error**: Red (#ef4444) - Error states

### Typography
- **Headings**: Bold, large text for hierarchy
- **Body**: Regular weight for readability
- **Captions**: Smaller text for metadata
- **Labels**: Medium weight for form elements

### Components
- **Cards**: Elevated surfaces for content grouping
- **Buttons**: Consistent interaction patterns
- **Charts**: Interactive data visualization
- **Gauges**: Circular progress indicators
- **Lists**: Organized information display

## 🔒 Security & Privacy

### Data Protection
- Local data encryption
- Secure API communication
- User consent management
- Privacy policy compliance

### Permissions
- Microphone access for audio recording
- Storage access for data management
- Notification permissions for alerts

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 📱 Platform Support

### iOS
- iOS 13.0+
- iPhone and iPad support
- Optimized for iOS design patterns

### Android
- Android 6.0+ (API level 23)
- Material Design implementation
- Adaptive layouts

### Web
- Progressive Web App (PWA) support
- Responsive design
- Cross-browser compatibility

## 🚀 Deployment

### App Store Deployment
1. Build production version
2. Configure app signing
3. Submit for review

### Play Store Deployment
1. Generate signed APK/AAB
2. Configure store listing
3. Submit for review

### Web Deployment
1. Build web version
2. Deploy to hosting platform
3. Configure domain and SSL

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)

### Community
- GitHub Issues for bug reports
- Discord server for discussions
- Stack Overflow for questions

## 🔮 Roadmap

### Upcoming Features
- **Voice Commands** - Hands-free interaction
- **Smart Home Integration** - IoT device control
- **Social Features** - Community and sharing
- **Advanced Analytics** - Machine learning insights
- **Wearable Integration** - Smartwatch support

### Performance Improvements
- **Lazy Loading** - Optimized data loading
- **Caching Strategy** - Improved offline experience
- **Bundle Optimization** - Smaller app size
- **Memory Management** - Better resource usage

---

**Built with ❤️ for better sleep health**
