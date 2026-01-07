/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Cutye Business color palette
 * Tema professionale e moderno
 */

const tintColorLight = '#2A9D8F';
const tintColorDark = '#2A9D8F';

export const Colors = {
  light: {
    // Base
    text: '#1A1A1A',        // Almost black for better readability
    background: '#FFFFFF',   // Pure white background
    tint: tintColorLight,
    
    // Brand Colors
    primary: '#2A9D8F',     // Teal
    secondary: '#264653',   // Dark blue
    accent: '#E9C46A',      // Gold
    
    // UI Elements
    icon: '#264653',        // Dark blue
    tabIconDefault: '#6C757D', // Grigio più scuro per maggiore visibilità
    tabIconSelected: tintColorLight,
    
    // Status Colors
    success: '#2A9D8F',     // Teal
    warning: '#E9C46A',     // Gold
    error: '#E76F51',       // Coral
    info: '#264653',        // Dark blue
    
    // Grayscale
    gray100: '#F8F9FA',     // Lightest
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',     // Darkest
    
    // Semantic
    border: '#DEE2E6',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    textSecondary: '#6C757D',
  },
  dark: {
    // Base
    text: '#F8F9FA',        // Very light gray
    background: '#000000',  // Pure black background
    tint: tintColorDark,
    
    // Brand Colors
    primary: '#2A9D8F',     // Teal
    secondary: '#264653',   // Dark blue
    accent: '#E9C46A',      // Gold
    
    // UI Elements
    icon: '#F8F9FA',
    tabIconDefault: '#6C757D',
    tabIconSelected: tintColorDark,
    
    // Status Colors
    success: '#2A9D8F',
    warning: '#E9C46A',
    error: '#E76F51',
    info: '#264653',
    
    // Grayscale
    gray100: '#F8F9FA',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    
    // Semantic
    border: '#343A40',
    card: '#1A1A1A',
    shadow: 'rgba(0, 0, 0, 0.2)',
    textSecondary: '#ADB5BD',
  },
} as const;

export default Colors;