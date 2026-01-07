import { SignalCard } from '../../components/cards/SignalCard';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/hooks/useProducts';
import { useBackendData } from '@/hooks/useBackendData';
import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import MaintenanceOptionsModal from '../../components/modals/MaintenanceOptionsModal';
import ProductDetailModal from '../../components/modals/ProductDetailModal';
import type { Product } from '../../types';

// Tipi e interfacce per la gestione dei segnali sulla mappa
type SignalStatus = 'ok' | 'check' | 'maintenance';

interface SignalMarker {
  id: string;
  name: string;
  type: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  status: SignalStatus;
  qr_code: string;
  company: string;
  distance?: string;
}

// Rimuovo MapBounds interface dato che non viene utilizzata
// interface MapBounds {
//   northBound: number;
//   southBound: number;
//   eastBound: number;
//   westBound: number;
// }

interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

// Costanti per la configurazione della mappa
const MAP_CONFIG = {
  MILAN_COORDINATES: {
    latitude: 45.4642,
    longitude: 9.1900,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  EARTH_RADIUS_KM: 6371,
  ANIMATION_DURATION: 1000,
  MARKER_SCALE_SELECTED: 1.1,
  MARKER_SCALE_DEFAULT: 1,
} as const;

const STATUS_COLORS = {
  ok: '#10B981',
  check: '#F59E0B',
  maintenance: '#EF4444',
  default: '#6B7280',
} as const;

const STATUS_ICONS = {
  ok: '✓',
  check: '⚠',
  maintenance: '🔧',
} as const;

// Tipi di segnale e relative icone (come versione web)
const SIGNAL_TYPES = {
  ALL: 'all',
  PERICOLO: 'pericolo',
  OBBLIGO: 'obbligo',
  DIVIETO: 'divieto',
  INFORMAZIONE: 'informazione',
} as const;

const SIGNAL_TYPE_ICONS = {
  pericolo: '⚠️',
  obbligo: '🔵',
  divieto: '🚫',
  informazione: 'ℹ️',
  default: '📍',
} as const;

const SIGNAL_TYPE_COLORS = {
  pericolo: '#EF4444',    // red
  obbligo: '#3B82F6',     // blue
  divieto: '#F59E0B',     // orange
  informazione: '#10B981', // green
  default: '#6B7280',     // gray
} as const;

// Hook personalizzato per il debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook personalizzato per il throttle
function useThrottle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  const [throttledFunc] = useState(() => {
    let lastExecTime = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return ((...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        lastExecTime = currentTime;
        func(...args);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastExecTime = Date.now();
          func(...args);
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  });
  
  return throttledFunc;
}

// Hook personalizzato per la gestione della posizione
function useMapLocation() {
  const [userLocation, setUserLocation] = useState<LocationCoordinate | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const initializeLocation = useCallback(async () => {
    try {
      setLocationError(null);
      
      // Richiedi permessi di geolocalizzazione
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Permesso di geolocalizzazione negato');
        Alert.alert(
          'Permesso negato', 
          'Permesso di geolocalizzazione necessario per mostrare la tua posizione. Verrà utilizzata la posizione di Milano come fallback.'
        );
        return null;
      }

      // Ottieni la posizione corrente dell'utente con timeout
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout GPS')), 10000)
        )
      ]) as Location.LocationObject;
      
      const userCoords: LocationCoordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      return userCoords;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      setLocationError(errorMsg);
      console.log('Errore nel recuperare la posizione:', errorMsg);
      
      Alert.alert(
        'Posizione non disponibile',
        'Impossibile ottenere la posizione corrente. Verrà utilizzata Milano come posizione di default.',
        [{ text: 'OK', style: 'default' }]
      );
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  return { userLocation, isLoadingLocation, locationError, initializeLocation };
}

export default function MapPage() {
  const { user } = useAuth();
  const companyId = user?.companyId || 'default-company';

  // Fetch real products from backend
  const { products, loading: loadingProducts, refetch: refetchProducts } = useProducts(companyId);

  // Get refresh function for data updates
  const { refreshData } = useBackendData();

  // Refresh data when screen comes into focus (e.g., after creating a new maintenance in another tab)
  useFocusEffect(
    useCallback(() => {
      refetchProducts();
    }, [refetchProducts])
  );

  const mapRef = useRef<MapView>(null);
  const cardsScrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, MAP_CONFIG.DEBOUNCE_DELAY);
  const [filterType, setFilterType] = useState<string>(SIGNAL_TYPES.ALL);
  const [selectedSignal, setSelectedSignal] = useState<SignalMarker | null>(null);
  const { userLocation, isLoadingLocation, initializeLocation } = useMapLocation();
  const [currentRegion, setCurrentRegion] = useState<Region>(MAP_CONFIG.MILAN_COORDINATES);

  // Stati per i modal
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<string[]>([]);
  
  // Throttled function per l'aggiornamento della regione
  const throttledSetCurrentRegion = useThrottle(
    useCallback((region: Region) => setCurrentRegion(region), []),
    MAP_CONFIG.THROTTLE_DELAY
  );

  // Funzione deterministica per generare lo status basato sull'ID del prodotto
  const getStatusForProduct = useCallback((productId: string): SignalStatus => {
    // Genera un hash deterministico dall'ID del prodotto
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const statuses: SignalStatus[] = ['ok', 'check', 'maintenance'];
    return statuses[hash % statuses.length];
  }, []);

  // Converti i prodotti reali in marker per la mappa - memoizzato per performance
  const signalMarkers = useMemo((): SignalMarker[] => {
    const productsWithGPS = products.filter(product => product.gps_lat != null && product.gps_lng != null);

    console.log(`🗺️ [MAP] Creating markers:`, {
      totalProducts: products.length,
      productsWithGPS: productsWithGPS.length,
      productsWithoutGPS: products.length - productsWithGPS.length
    });

    if (productsWithGPS.length > 0) {
      console.log(`📍 [MAP] Sample product with GPS:`, {
        id: productsWithGPS[0].id.substring(0, 8),
        qr_code: productsWithGPS[0].qr_code,
        lat: productsWithGPS[0].gps_lat,
        lng: productsWithGPS[0].gps_lng
      });
    }

    return productsWithGPS.map(product => ({
      id: product.id,
      name: `${product.tipo_segnale} - ${product.wl}`,
      type: product.tipo_segnale,
      coordinate: {
        latitude: product.gps_lat!,
        longitude: product.gps_lng!
      },
      status: getStatusForProduct(product.id),
      qr_code: product.qr_code,
      company: user?.companyId || 'CertPlus'
    }));
  }, [products, getStatusForProduct, user]);

  // Funzione per ottenere il colore dello status - ottimizzata
  const getStatusColor = useCallback((status: SignalStatus): string => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  }, []);

  // Funzione per ottenere l'icona dello status
  const getStatusIcon = useCallback((status: SignalStatus): string => {
    return STATUS_ICONS[status] || '?';
  }, []);

  // Funzioni per ottenere icona e colore basati sul TIPO di segnale (come versione web)
  const getSignalTypeIcon = useCallback((type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pericolo')) return SIGNAL_TYPE_ICONS.pericolo;
    if (lowerType.includes('obbligo')) return SIGNAL_TYPE_ICONS.obbligo;
    if (lowerType.includes('divieto')) return SIGNAL_TYPE_ICONS.divieto;
    if (lowerType.includes('informazione')) return SIGNAL_TYPE_ICONS.informazione;
    return SIGNAL_TYPE_ICONS.default;
  }, []);

  const getSignalTypeColor = useCallback((type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pericolo')) return SIGNAL_TYPE_COLORS.pericolo;
    if (lowerType.includes('obbligo')) return SIGNAL_TYPE_COLORS.obbligo;
    if (lowerType.includes('divieto')) return SIGNAL_TYPE_COLORS.divieto;
    if (lowerType.includes('informazione')) return SIGNAL_TYPE_COLORS.informazione;
    return SIGNAL_TYPE_COLORS.default;
  }, []);




  // Calcola distanza approssimativa con gestione errori migliorata
  const calculateDistance = useCallback((coord1: LocationCoordinate, coord2: LocationCoordinate): string => {
    try {
      const R = MAP_CONFIG.EARTH_RADIUS_KM;
      const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
      const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Validazione del risultato
      if (isNaN(distance) || distance < 0) {
        return 'N/A';
      }
      
      if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
      }
      return `${distance.toFixed(1)}km`;
    } catch (error) {
      console.warn('Errore nel calcolo della distanza:', error);
      return 'N/A';
    }
  }, []);

  // Funzione per verificare se un segnale è visibile nella regione corrente - memoizzata
  const isSignalInRegion = useCallback((signal: SignalMarker, region: Region): boolean => {
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
      const signalLat = signal.coordinate.latitude;
      const signalLng = signal.coordinate.longitude;
      
      // Validazione delle coordinate
      if (isNaN(signalLat) || isNaN(signalLng) || isNaN(latitude) || isNaN(longitude)) {
        return false;
      }
      
      // Calcola i bounds della regione visibile
      const northBound = latitude + latitudeDelta / 2;
      const southBound = latitude - latitudeDelta / 2;
      const eastBound = longitude + longitudeDelta / 2;
      const westBound = longitude - longitudeDelta / 2;
      
      // Verifica se il segnale è dentro i bounds
      return (
        signalLat <= northBound &&
        signalLat >= southBound &&
        signalLng <= eastBound &&
        signalLng >= westBound
      );
    } catch (error) {
      console.warn('Errore nel controllo regione:', error);
      return false;
    }
  }, []);

  // Filtra i segnali in base alla ricerca, tipo e regione visibile - memoizzato per performance
  const filteredSignals = useMemo((): SignalMarker[] => {
    try {
      const searchLower = debouncedSearchQuery.toLowerCase().trim();

      return signalMarkers
        .filter(signal => {
          // Filtro di ricerca - usa il valore debounciato
          const matchesSearch = !searchLower ||
            signal.name.toLowerCase().includes(searchLower) ||
            signal.type.toLowerCase().includes(searchLower) ||
            signal.qr_code.toLowerCase().includes(searchLower);

          // Filtro per tipo segnale (come versione web)
          const matchesType = filterType === SIGNAL_TYPES.ALL ||
            signal.type.toLowerCase().includes(filterType.toLowerCase());

          // Filtro per regione visibile
          const inRegion = isSignalInRegion(signal, currentRegion);

          return matchesSearch && matchesType && inRegion;
        })
        .map(signal => ({
          ...signal,
          distance: userLocation ? calculateDistance(userLocation, signal.coordinate) : undefined
        }))
        .sort((a, b) => {
          // Ordinamento per distanza se disponibile
          if (userLocation && a.distance && b.distance && a.distance !== 'N/A' && b.distance !== 'N/A') {
            const distA = parseFloat(a.distance.replace(/[^0-9.]/g, ''));
            const distB = parseFloat(b.distance.replace(/[^0-9.]/g, ''));
            return distA - distB;
          }
          return 0;
        });
    } catch (error) {
      console.warn('Errore nel filtro segnali:', error);
      return [];
    }
  }, [signalMarkers, debouncedSearchQuery, filterType, currentRegion, userLocation, isSignalInRegion, calculateDistance]);


  // Inizializza la mappa con posizione utente
  useEffect(() => {
    const initializeMap = async () => {
      const userCoords = await initializeLocation();

      if (userCoords) {
        // Imposta la regione iniziale sulla posizione dell'utente
        setCurrentRegion({
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: MAP_CONFIG.MILAN_COORDINATES.latitudeDelta,
          longitudeDelta: MAP_CONFIG.MILAN_COORDINATES.longitudeDelta,
        });
      } else {
        setCurrentRegion(MAP_CONFIG.MILAN_COORDINATES);
      }
    };

    initializeMap();
  }, [initializeLocation]);

  // Gestisce la pressione su un marker
  const onMarkerPress = useCallback((signal: SignalMarker) => {
    setSelectedSignal(signal);

    // Scroll automatico alla card corrispondente
    const index = filteredSignals.findIndex(s => s.id === signal.id);
    if (index !== -1 && cardsScrollViewRef.current) {
      // Calcola la posizione della card (w-72 = 288px + mr-3 = 12px)
      const CARD_WIDTH = 288;  // w-72 in Tailwind
      const CARD_MARGIN = 12;  // mr-3 in Tailwind
      const scrollPosition = index * (CARD_WIDTH + CARD_MARGIN);

      cardsScrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true
      });

      console.log(`📍 [MAP] Auto-scrolling to card ${index + 1} of ${filteredSignals.length}`);
    }
  }, [filteredSignals]);

  // Gestisce la pressione su una card nel footer - memoizzato
  const onCardPress = useCallback((signal: SignalMarker) => {
    setSelectedSignal(signal);
    // Centra la mappa sul segnale selezionato
    mapRef.current?.animateToRegion({
      latitude: signal.coordinate.latitude,
      longitude: signal.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, MAP_CONFIG.ANIMATION_DURATION);
  }, []);


  // Reset stato modal - memoizzato
  const resetMapState = useCallback(() => {
    setShowOptionsModal(false);
    setSelectedProduct(null);
    setEmployeePermissions([]);
  }, []);

  // Handler for maintenance success (called by MaintenanceOptionsModal after successful creation)
  const handleMaintenanceSuccess = useCallback(async () => {
    await refreshData();
    resetMapState();
  }, [refreshData, resetMapState]);

  // Gestisce le azioni di manutenzione - memoizzato
  const handleMaintenanceAction = useCallback((actionType: string) => {
    const actionLabels = {
      'installazione': 'Installazione',
      'revisione': 'Revisione',
      'sostituzione': 'Sostituzione',
      'dismissione': 'Dismissione'
    };
    
    Alert.alert(
      'Azione Registrata!',
      `Tipo: ${actionLabels[actionType as keyof typeof actionLabels]}\nCartello: ${selectedProduct?.tipo_segnale}\nQR Code: ${selectedProduct?.qr_code}`,
      [
        {
          text: 'OK',
          onPress: () => {
            resetMapState();
          },
        },
      ]
    );
  }, [selectedProduct, resetMapState]);

  // Reset stato modal dettagli - memoizzato
  const resetDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  }, []);

  // Gestisce la visualizzazione dei dettagli del prodotto - memoizzato
  const onDetailsPress = useCallback((signal: SignalMarker) => {
    try {
      // Trova il prodotto completo dai dati reali
      const product = products.find(p => p.qr_code === signal.qr_code);

      if (!product) {
        Alert.alert('Errore', 'Prodotto non trovato nel database');
        return;
      }

      setSelectedProduct(product);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Errore nella visualizzazione dettagli:', error);
      Alert.alert('Errore', 'Impossibile visualizzare i dettagli del prodotto');
    }
  }, [products]);

  // Gestisce la navigazione - ora gestita direttamente nel componente SignalCard - memoizzato
  const onNavigatePress = useCallback((signal: SignalMarker) => {
    Alert.alert('Navigazione', `Errore nell'aprire l'app di navigazione per: ${signal.name}`);
  }, []);
  
  // Handler per la gestione del cambio regione con throttling
  const handleRegionChangeComplete = useCallback((region: Region) => {
    throttledSetCurrentRegion(region);
  }, [throttledSetCurrentRegion]);



  // Mostra loading mentre si ottiene la posizione GPS
  if (isLoadingLocation) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 text-lg">Ottenendo la tua posizione...</Text>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={StyleSheet.absoluteFillObject}>
        {/* Mappa */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={currentRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          zoomTapEnabled={true}
          zoomControlEnabled={Platform.OS === 'android'}
          loadingEnabled={true}
          moveOnMarkerPress={false}
          showsCompass={true}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          mapType="standard"
          onRegionChangeComplete={handleRegionChangeComplete}
        >
        {filteredSignals.map((signal) => (
          <Marker
            key={signal.id}
            coordinate={signal.coordinate}
            onPress={() => onMarkerPress(signal)}
            tracksViewChanges={false}
            stopPropagation={true}
            accessibilityLabel={`Segnale ${signal.name}, tipo ${signal.type}`}
          >
            <View style={{
              padding: 2,
              borderRadius: 18,
              backgroundColor: 'transparent',
              transform: selectedSignal?.id === signal.id ? [{ scale: MAP_CONFIG.MARKER_SCALE_SELECTED }] : [{ scale: MAP_CONFIG.MARKER_SCALE_DEFAULT }]
            }}>
              <View className="w-10 h-10 bg-white rounded-full border-2 border-white justify-center items-center shadow-md" style={{ borderColor: getSignalTypeColor(signal.type) }}>
                <Text className="text-base font-bold" style={{ color: getSignalTypeColor(signal.type) }}>
                  {getSignalTypeIcon(signal.type)}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Barra di ricerca e filtri overlay */}
      <View className="absolute top-12 left-4 right-4 z-10">
        {/* Search bar */}
        <View className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 mb-3">
          <View className="flex-row items-center px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Cerca segnali per nome, tipo o QR..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              accessibilityLabel="Campo di ricerca segnali"
              accessibilityHint="Inserisci il nome, tipo o QR code per filtrare i segnali"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtri e statistiche */}
        <View className="flex-row items-center justify-between">
          {/* Filtro tipo segnale */}
          <View className="flex-1 mr-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setFilterType(SIGNAL_TYPES.ALL)}
                  className={`px-3 py-2 rounded-lg border ${filterType === SIGNAL_TYPES.ALL ? 'bg-blue-500 border-blue-600' : 'bg-white/90 border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === SIGNAL_TYPES.ALL ? 'text-white' : 'text-gray-700'}`}>
                    Tutti
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterType(SIGNAL_TYPES.PERICOLO)}
                  className={`px-3 py-2 rounded-lg border ${filterType === SIGNAL_TYPES.PERICOLO ? 'bg-red-500 border-red-600' : 'bg-white/90 border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === SIGNAL_TYPES.PERICOLO ? 'text-white' : 'text-gray-700'}`}>
                    ⚠️ Pericolo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterType(SIGNAL_TYPES.OBBLIGO)}
                  className={`px-3 py-2 rounded-lg border ${filterType === SIGNAL_TYPES.OBBLIGO ? 'bg-blue-500 border-blue-600' : 'bg-white/90 border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === SIGNAL_TYPES.OBBLIGO ? 'text-white' : 'text-gray-700'}`}>
                    🔵 Obbligo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterType(SIGNAL_TYPES.DIVIETO)}
                  className={`px-3 py-2 rounded-lg border ${filterType === SIGNAL_TYPES.DIVIETO ? 'bg-orange-500 border-orange-600' : 'bg-white/90 border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === SIGNAL_TYPES.DIVIETO ? 'text-white' : 'text-gray-700'}`}>
                    🚫 Divieto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterType(SIGNAL_TYPES.INFORMAZIONE)}
                  className={`px-3 py-2 rounded-lg border ${filterType === SIGNAL_TYPES.INFORMAZIONE ? 'bg-green-500 border-green-600' : 'bg-white/90 border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === SIGNAL_TYPES.INFORMAZIONE ? 'text-white' : 'text-gray-700'}`}>
                    ℹ️ Info
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Statistiche rapide */}
          <View className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/50 px-3 py-2">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-blue-500" />
                <Text className="text-xs text-gray-600 font-medium">{filteredSignals.length}</Text>
              </View>
              <Text className="text-xs text-gray-400">/</Text>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-gray-400" />
                <Text className="text-xs text-gray-600 font-medium">{products.length}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Cards scorrevoli nel footer */}
      <View className="absolute bottom-0 left-0 right-0 z-10">
        {filteredSignals.length === 0 ? (
          /* Messaggio quando non ci sono prodotti con GPS */
          <View className="mx-4 mb-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="location-outline" size={32} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
                Nessun prodotto con GPS trovato
              </Text>
              <Text className="text-sm text-gray-600 text-center mb-4">
                {products.length > 0
                  ? `Hai ${products.length} prodotti, ma nessuno ha un'installazione con GPS registrata.`
                  : 'Non ci sono prodotti da visualizzare.'}
              </Text>
              {products.length > 0 && (
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="information-circle" size={20} color="#F59E0B" />
                    <View className="flex-1">
                      <Text className="text-sm text-amber-800 font-medium mb-1">
                        💡 Come aggiungere prodotti alla mappa
                      </Text>
                      <Text className="text-xs text-amber-700 leading-5">
                        Per far apparire i prodotti sulla mappa, registra un'installazione o manutenzione con GPS tramite lo scanner QR. Le coordinate vengono salvate automaticamente durante l'intervento.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Cards normali quando ci sono prodotti */
          <ScrollView
            ref={cardsScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            className="flex-row"
            decelerationRate="fast"
            snapToInterval={300}
            snapToAlignment="start"
          >
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onPress={onCardPress}
                onDetailsPress={onDetailsPress}
                onNavigatePress={onNavigatePress}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modal per opzioni manutenzione */}
      <MaintenanceOptionsModal
        visible={showOptionsModal}
        product={selectedProduct}
        onClose={resetMapState}
        onSelectOption={handleMaintenanceAction}
        onSuccess={handleMaintenanceSuccess}
        allowedActions={employeePermissions}
      />

      {/* Modal per dettagli prodotto */}
      <ProductDetailModal
        visible={showDetailsModal}
        product={selectedProduct}
        onClose={resetDetailsModal}
      />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// Componente memoizzato per l'overlay di ricerca
const MapSearchOverlay = React.memo<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}>(function MapSearchOverlay({ searchQuery, onSearchChange }) {
  const handleClear = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <View className="absolute top-12 left-4 right-4 z-10">
      <View className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
        <View className="flex-row items-center px-4 py-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder="Cerca segnali per nome, tipo o QR..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            accessibilityLabel="Campo di ricerca segnali"
            accessibilityHint="Inserisci il nome, tipo o QR code per filtrare i segnali"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} accessibilityLabel="Pulisci ricerca">
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

// Componente memoizzato per i markers dei segnali
const SignalMarkers = React.memo<{
  signals: SignalMarker[];
  selectedSignalId?: string;
  onMarkerPress: (signal: SignalMarker) => void;
  getStatusColor: (status: SignalStatus) => string;
  getStatusIcon: (status: SignalStatus) => string;
}>(function SignalMarkers({ signals, selectedSignalId, onMarkerPress, getStatusColor, getStatusIcon }) {
  return (
    <>
      {signals.map((signal) => (
        <Marker
          key={signal.id}
          coordinate={signal.coordinate}
          onPress={() => onMarkerPress(signal)}
          tracksViewChanges={false}
          stopPropagation={true}
          accessibilityLabel={`Segnale ${signal.name}, stato ${signal.status}`}
        >
          <View style={{
            padding: 2,
            borderRadius: 18,
            backgroundColor: 'transparent',
            transform: selectedSignalId === signal.id ? [{ scale: MAP_CONFIG.MARKER_SCALE_SELECTED }] : [{ scale: MAP_CONFIG.MARKER_SCALE_DEFAULT }]
          }}>
            <View className="w-8 h-8 bg-white rounded-full border-2 border-white justify-center items-center shadow-md" style={{ borderColor: getStatusColor(signal.status) }}>
              <Text className="text-xs font-bold" style={{ color: getStatusColor(signal.status) }}>
                {getStatusIcon(signal.status)}
              </Text>
            </View>
          </View>
        </Marker>
      ))}
    </>
  );
});

// Componente memoizzato per le cards nel footer
const SignalCardsFooter = React.memo<{
  signals: SignalMarker[];
  onCardPress: (signal: SignalMarker) => void;
  onDetailsPress: (signal: SignalMarker) => void;
  onNavigatePress: (signal: SignalMarker) => void;
}>(function SignalCardsFooter({ signals, onCardPress, onDetailsPress, onNavigatePress }) {
  return (
    <View className="absolute bottom-0 left-0 right-0 z-10">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        className="flex-row"
        accessibilityLabel="Elenco segnali scorrevole"
      >
        {signals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onPress={onCardPress}
            onDetailsPress={onDetailsPress}
            onNavigatePress={onNavigatePress}
          />
        ))}
      </ScrollView>
    </View>
  );
});

// Esporta i componenti per potenziale riutilizzo
export { MapSearchOverlay, SignalMarkers, SignalCardsFooter };

