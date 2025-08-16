# Ignition - Sleep Optimization App

A React Native mobile application for sleep optimization and health monitoring, built with Expo.

## Features

- **Dashboard**: Sleep score tracking and daily metrics
- **Trends**: Sleep pattern analysis and progress tracking
- **Recommendations**: Personalized sleep improvement tips
- **Risk Assessment**: Sleep-related health risk monitoring
- **Profile Management**: User preferences and settings

## Tech Stack

- React Native
- Expo
- React Navigation
- Lucide React Native (Icons)
- Expo Linear Gradient
- React Native Safe Area Context

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Project Structure

```
src/
├── screens/           # Main screen components
│   ├── LandingScreen.js
│   ├── DashboardScreen.js
│   ├── TrendsScreen.js
│   ├── RecommendationsScreen.js
│   ├── RisksScreen.js
│   └── ProfileScreen.js
├── components/        # Reusable UI components
├── navigation/        # Navigation configuration
└── utils/            # Utility functions
```

## Navigation

The app uses React Navigation with:
- Stack Navigator for main app flow
- Bottom Tab Navigator for main screens
- Safe area handling for different devices

## Styling

- Uses React Native StyleSheet
- Dark theme optimized
- Responsive design for different screen sizes
- Custom color palette with CSS variables

## Icons

Uses Lucide React Native for consistent iconography across the app.

## Getting Started

1. Scan the QR code with Expo Go app on your device
2. Or press 'i' for iOS simulator or 'a' for Android emulator
3. Make changes and see them live reload

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
