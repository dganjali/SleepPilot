/// <reference types="nativewind/types" />

// Add this to enable NativeWind IntelliSense
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
}

declare module "react-native-safe-area-context" {
  interface SafeAreaViewProps {
    className?: string;
  }
}

declare module "react-native-reanimated" {
  interface AnimateProps<T> {
    className?: string;
  }
}
