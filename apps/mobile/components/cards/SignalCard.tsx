import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { 
  Text, 
  TouchableOpacity, 
  View,
  Platform
} from 'react-native';
import * as Linking from 'expo-linking';
import { Product } from '@certplus/types';

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
  product?: Product; // Aggiungiamo riferimento al Product per il modal
}

interface SignalCardProps {
  signal: SignalMarker;
  onPress: (signal: SignalMarker) => void;
  onDetailsPress?: (signal: SignalMarker) => void;
  onNavigatePress?: (signal: SignalMarker) => void;
}

const getStatusColor = (status: SignalStatus): string => {
  switch (status) {
    case 'ok': return '#10B981';
    case 'check': return '#F59E0B';
    case 'maintenance': return '#EF4444';
    default: return '#6B7280';
  }
};

const getStatusIcon = (status: SignalStatus): string => {
  switch (status) {
    case 'ok': return '✓';
    case 'check': return '⚠';
    case 'maintenance': return '🔧';
    default: return '?';
  }
};

// Rimossa getStatusText - ora è gestita nel SignalDetailModal

// Funzione per aprire l'app di navigazione nativa (versione semplificata per il card)
const openNativeNavigation = async (latitude: number, longitude: number) => {
  const destination = `${latitude},${longitude}`;
  
  let url: string;
  
  try {
    if (Platform.OS === 'ios') {
      // Per iOS usa Apple Maps con formato semplificato
      url = `maps://maps.apple.com/?daddr=${destination}&dirflg=d`;
      
      // Verifica se l'app Maps è disponibile
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        // Fallback per Apple Maps nel browser
        url = `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
      }
    } else {
      // Per Android usa Google Maps
      url = `google.navigation:q=${destination}&mode=d`;
      
      // Verifica se l'app Google Maps è installata
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        // Fallback per Google Maps nel browser se l'app non è installata
        url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
    }
    
    await Linking.openURL(url);
  } catch (error) {
    console.error('Errore nell\'aprire l\'app di navigazione:', error);
    
    // Fallback universale per browser
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    try {
      await Linking.openURL(fallbackUrl);
    } catch (fallbackError) {
      console.error('Errore anche nel fallback:', fallbackError);
      throw new Error('Impossibile aprire l\'app di navigazione');
    }
  }
};

export const SignalCard: React.FC<SignalCardProps> = ({ 
  signal, 
  onPress, 
  onDetailsPress, 
  onNavigatePress
}) => {
  // Gestione navigazione diretta dal card (azione rapida)
  const handleNavigatePress = async () => {
    try {
      await openNativeNavigation(
        signal.coordinate.latitude,
        signal.coordinate.longitude
      );
    } catch (error) {
      console.error('Errore nella navigazione:', error);
      // Chiamiamo il callback originale come fallback
      onNavigatePress?.(signal);
    }
  };



  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 shadow-sm mr-3 w-72"
      activeOpacity={0.7}
      onPress={() => onPress(signal)}
    >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-800 font-semibold text-base flex-1" numberOfLines={1}>
            {signal.name}
          </Text>
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: getStatusColor(signal.status) + '20' }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ color: getStatusColor(signal.status) }}
            >
              {getStatusIcon(signal.status)}
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-500 text-sm mb-1">{signal.type}</Text>
        <Text className="text-gray-400 text-xs mb-2">QR: {signal.qr_code}</Text>
        
        {signal.distance && (
          <Text className="text-blue-600 text-xs font-medium mb-3">📍 ~{signal.distance}</Text>
        )}
        
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="bg-teal-50 px-3 py-2 rounded-lg flex-row items-center"
            onPress={() => onDetailsPress?.(signal)}
          >
            <Ionicons name="information-circle-outline" size={16} color="#0D9488" />
            <Text className="text-teal-600 text-xs font-medium ml-1">Dettagli</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-blue-50 px-3 py-2 rounded-lg flex-row items-center"
            onPress={handleNavigatePress}
          >
            <Ionicons name="navigate-outline" size={16} color="#3B82F6" />
            <Text className="text-blue-600 text-xs font-medium ml-1">Naviga</Text>
          </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SignalCard;