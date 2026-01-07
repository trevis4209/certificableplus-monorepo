// Custom hook per i servizi di geolocalizzazione
// Gestisce la richiesta GPS con timeout, error handling e feedback utente

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { UseLocationServiceReturn, LocationError, LocationOptions } from '../../types/scanner';

const DEFAULT_LOCATION_OPTIONS: LocationOptions = {
  timeout: 15000, // 15 secondi di timeout
  enableHighAccuracy: true,
  maximumAge: 30000, // Cache location for 30 seconds
};

export const useLocationService = (
  options: LocationOptions = DEFAULT_LOCATION_OPTIONS
): UseLocationServiceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulisce il timeout quando necessario
  const clearLocationTimeout = useCallback(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }, []);

  // Gestisce gli errori di geolocalizzazione
  const handleLocationError = useCallback((error: any): LocationError => {
    console.error('Errore geolocalizzazione:', error);
    
    if (error.code === 'E_LOCATION_UNAVAILABLE') {
      return new LocationError(
        'GPS non disponibile. Verifica che il servizio di localizzazione sia attivo.',
        'POSITION_UNAVAILABLE',
        true
      );
    } else if (error.code === 'E_LOCATION_TIMEOUT') {
      return new LocationError(
        'Timeout nella richiesta GPS. Riprova in un\'area con migliore copertura.',
        'TIMEOUT',
        true
      );
    } else if (error.message?.includes('permission')) {
      return new LocationError(
        'Permessi di localizzazione negati.',
        'PERMISSION_DENIED',
        false
      );
    } else {
      return new LocationError(
        'Errore sconosciuto nella localizzazione. Riprova.',
        'POSITION_UNAVAILABLE',
        true
      );
    }
  }, []);

  // Ottiene la posizione corrente con timeout personalizzato
  const getCurrentLocation = useCallback(async (): Promise<{ lat: string; lng: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verifica e richiedi permessi
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const permissionError = new LocationError(
          'È necessario concedere i permessi di geolocalizzazione per ottenere la posizione attuale.',
          'PERMISSION_DENIED',
          false
        );
        setError(permissionError);
        
        Alert.alert(
          'Permesso Negato',
          permissionError.message,
          [{ text: 'OK' }]
        );
        
        throw permissionError;
      }

      // Configura il timeout personalizzato
      const timeoutPromise = new Promise<never>((_, reject) => {
        locationTimeoutRef.current = setTimeout(() => {
          reject(new LocationError(
            `Timeout nella richiesta GPS dopo ${(options.timeout || 15000) / 1000} secondi.`,
            'TIMEOUT',
            true
          ));
        }, options.timeout || 15000);
      });

      // Richiesta di posizione con race condition per timeout
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 5,
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);
      clearLocationTimeout();

      const lat = location.coords.latitude.toString();
      const lng = location.coords.longitude.toString();

      // Feedback di successo
      Alert.alert(
        'Posizione Ottenuta',
        `Coordinate aggiornate:\nLat: ${location.coords.latitude.toFixed(6)}\nLng: ${location.coords.longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

      return { lat, lng };
      
    } catch (error: any) {
      clearLocationTimeout();
      const locationError = handleLocationError(error);
      setError(locationError);
      
      // Mostra alert solo per errori non di permesso (già mostrato sopra)
      if (locationError.code !== 'PERMISSION_DENIED') {
        Alert.alert(
          'Errore GPS',
          locationError.message,
          [{ text: 'OK' }]
        );
      }
      
      throw locationError;
    } finally {
      setIsLoading(false);
      clearLocationTimeout();
    }
  }, [options.timeout, handleLocationError, clearLocationTimeout]);

  // Ottiene posizione in background senza alert (per usi interni)
  const getCurrentLocationSilent = useCallback(async (): Promise<{ lat: string; lng: string } | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: location.coords.latitude.toString(),
        lng: location.coords.longitude.toString(),
      };
    } catch (error) {
      const locationError = handleLocationError(error);
      setError(locationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleLocationError]);

  // Verifica se i permessi sono disponibili
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }, []);

  return {
    getCurrentLocation,
    getCurrentLocationSilent,
    checkPermissions,
    isLoading,
    error,
  };
};