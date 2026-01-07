# CLAUDE.md - /assets

**Static Assets** - Immagini, font, file statici dell'applicazione

## 📁 Struttura

```
assets/
├── images/                  # Immagini app (loghi, placeholder, illustrazioni)
├── fonts/                   # Font personalizzati
│   └── SpaceMono-Regular.ttf    # Font monospace per codice/QR
└── [future-assets]/         # Future assets (icons, animations, etc.)
```

## 🎯 Responsabilità

### Static Resources
- **Images**: Loghi app, placeholder, illustrazioni UI
- **Fonts**: Font personalizzati per typography
- **Icons**: Icon sets personalizzati (futuro)
- **Animations**: File animazioni Lottie (futuro)

### Asset Organization
- **Size Optimization**: Immagini ottimizzate per mobile
- **Format Standards**: WebP preferito, PNG/JPG fallback
- **Responsive Assets**: Multiple resolutions per diversi schermi
- **Accessibility**: Alt text e descriptions appropriate

## 📋 Asset Guidelines

### `/images` - Image Assets
**Convenzioni**:
- **Naming**: kebab-case descriptive names
- **Formats**: WebP (preferred), PNG (transparency), JPG (photos)
- **Sizes**: Multiple resolutions per responsive design
- **Optimization**: Compressed per performance mobile

**Examples**:
```
images/
├── logo/
│   ├── app-logo.webp           # Logo principale
│   ├── app-logo-white.webp     # Logo versione bianca
│   └── app-logo@2x.webp        # Logo alta risoluzione
├── placeholders/
│   ├── product-placeholder.webp    # Placeholder prodotti
│   ├── avatar-placeholder.webp     # Placeholder utenti
│   └── no-image.webp              # Fallback immagini
└── illustrations/
    ├── onboarding-1.webp       # Illustrazioni onboarding
    ├── empty-state.webp        # Empty states
    └── error-illustration.webp  # Error pages
```

### `/fonts` - Typography
**Current Fonts**:
- `SpaceMono-Regular.ttf`: Font monospace per QR codes, codici

**Usage Pattern**:
```typescript
// Font loading in _layout.tsx
const [loaded] = useFonts({
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
});

// Usage in components
<Text style={{ fontFamily: 'SpaceMono' }}>QR-ABC123</Text>
```

**Future Fonts**:
- Brand fonts per typography hierarchy
- Icon fonts se necessari
- Multiple weights (light, regular, bold)

### Future Assets

#### `/icons` (Future)
**Scopo**: Custom icon set per app branding
```
icons/
├── svg/                    # SVG sources
├── png/                    # PNG exports (multiple sizes)
└── font/                   # Icon font generation
```

#### `/animations` (Future)
**Scopo**: Lottie animations per enhanced UX
```
animations/
├── loading-spinner.json    # Loading animations
├── success-checkmark.json  # Success feedback
└── scanning-animation.json # Scanner feedback
```

## 🔧 Asset Management

### Image Optimization
```typescript
// Responsive image loading
import { Image } from 'expo-image';

const ProductImage = ({ uri, placeholder }) => (
  <Image
    source={{ uri }}
    placeholder={placeholder}
    transition={200}
    style={styles.image}
    contentFit="cover"
  />
);
```

### Font Registration
```typescript
// Font preloading
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('./assets/fonts/SpaceMono-Regular.ttf'),
    'Custom-Regular': require('./assets/fonts/Custom-Regular.ttf'),
    'Custom-Bold': require('./assets/fonts/Custom-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return <AppContent />;
}
```

### Asset Constants
```typescript
// Centralized asset references
export const Images = {
  logo: require('../assets/images/logo/app-logo.webp'),
  logoWhite: require('../assets/images/logo/app-logo-white.webp'),
  placeholder: require('../assets/images/placeholders/product-placeholder.webp'),
  emptyState: require('../assets/images/illustrations/empty-state.webp'),
} as const;

// Usage in components
import { Images } from '@/constants/Images';

<Image source={Images.logo} style={styles.logo} />
```

## ⚠️ Best Practices

### Image Optimization
- **Size**: Max 1MB per image per performance mobile
- **Format**: WebP quando supportato, fallback PNG/JPG
- **Resolution**: Provide @2x e @3x per high-DPI screens
- **Compression**: Use tools come ImageOptim, TinyPNG

### Accessibility
```typescript
// Image con accessibility
<Image
  source={Images.productPhoto}
  alt="Segnale stradale di pericolo triangolare"
  style={styles.image}
/>

// Font leggibility
const styles = StyleSheet.create({
  text: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    lineHeight: 24, // 1.5x per readability
  },
});
```

### Performance
- **Lazy Loading**: Load images when needed
- **Caching**: Use Expo Image per automatic caching
- **Preloading**: Preload critical images
- **Progressive**: Use progressive JPEG per large images

## 🚨 Regole Importanti

### ✅ Fare
- Optimize all images prima di commit
- Use descriptive file names
- Provide multiple resolutions
- Test su diverse densità schermo
- Centralize asset references in constants

### ❌ Non Fare
- Commit large unoptimized images (>1MB)
- Use unclear asset names
- Skip accessibility alt text
- Hard-code asset paths in components
- Ignore copyright/licensing per assets

## 📚 Asset Organization Patterns

### Responsive Images
```typescript
// Multiple resolution support
const getImageSource = (imageName: string, density: number = 1) => {
  const suffix = density > 1 ? `@${density}x` : '';
  return require(`../assets/images/${imageName}${suffix}.webp`);
};

// Usage
const logoSource = getImageSource('logo', PixelRatio.get());
```

### Themed Assets
```typescript
// Theme-aware assets
const useThemedImage = (lightImage: string, darkImage: string) => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkImage : lightImage;
};

// Usage
const Images = {
  logo: {
    light: require('../assets/images/logo-light.webp'),
    dark: require('../assets/images/logo-dark.webp'),
  },
};

const logoSource = Images.logo[useColorScheme() ?? 'light'];
```

### Asset Preloading
```typescript
// Critical asset preloading
const preloadAssets = async () => {
  const imageAssets = [
    Images.logo,
    Images.placeholder,
    Images.emptyState,
  ];

  const cacheImages = imageAssets.map(image => {
    return Asset.fromModule(image).downloadAsync();
  });

  await Promise.all(cacheImages);
};

// Use in app startup
useEffect(() => {
  preloadAssets();
}, []);
```

### Dynamic Asset Loading
```typescript
// Dynamic asset loading per user content
const ProductImage = ({ productId }) => {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const loadProductImage = async () => {
      try {
        const uri = await getProductImageUri(productId);
        setImageUri(uri);
      } catch {
        setImageUri(Images.placeholder);
      }
    };

    loadProductImage();
  }, [productId]);

  return (
    <Image
      source={{ uri: imageUri }}
      placeholder={Images.placeholder}
      style={styles.productImage}
    />
  );
};
```