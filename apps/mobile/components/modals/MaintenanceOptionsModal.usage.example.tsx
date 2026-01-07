import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MaintenanceOptionsModal from './MaintenanceOptionsModal';
import { Product } from '../../types';

/**
 * Esempio di utilizzo del MaintenanceOptionsModal per testare la correzione del layout
 * 
 * PROBLEMI RISOLTI:
 * 1. ScrollView content non visibile - Risolto con struttura layout corretta
 * 2. Header e footer visibili ma contenuto nascosto - Risolto con flex e dimensioni esplicite  
 * 3. Modal troppo piccolo - Aggiunto minHeight e gestione dimensioni responsive
 * 4. Footer button sovrapposto al contenuto - Posizionato absolutely con padding appropriato
 */

// Dati di esempio per testare il modal
const exampleProduct: Product = {
  id: 'EX001',
  qr_code: 'QR-MAINT-2025-001',
  tipo_segnale: 'Divieto di Sosta',
  anno: 2025,
  forma: 'Triangolare',
  materiale_supporto: 'Alluminio',
  spessore_supporto: 2,
  wl: 'WL001',
  fissaggio: 'Palo',
  dimensioni: '60x90 cm',
  materiale_pellicola: 'Rifrangente',
  figura_url: 'https://example.com/figura.png',
  gps_lat: 41.9028,
  gps_lng: 12.4964,
  companyId: 'company-001',
  createdBy: 'user-001',
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z'
};

export default function MaintenanceOptionsModalExample() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectOption = (optionId: string) => {
    Alert.alert(
      'Azione Selezionata',
      `Hai scelto: ${optionId}`,
      [
        {
          text: 'OK',
          onPress: () => setModalVisible(false)
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center p-5">
      <Text className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Test MaintenanceOptionsModal
      </Text>

      <Text className="text-sm text-gray-600 mb-5 text-center px-4">
        Nota: Il modal ora determina automaticamente lo stato di installazione
        del prodotto controllando la cronologia degli interventi, senza bisogno
        di passare un prop productStatus.
      </Text>

      {/* Pulsante per aprire il modal */}
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-xl w-full max-w-sm"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Apri Modal Manutenzione
        </Text>
      </TouchableOpacity>

      <Text className="text-sm text-gray-600 mt-4 text-center px-4">
        Questo esempio dimostra il modal con layout corretto: header visibile,
        contenuto scrollabile nel mezzo, e footer button fisso in basso.
      </Text>

      {/* Modal di Test */}
      <MaintenanceOptionsModal
        visible={modalVisible}
        product={exampleProduct}
        onClose={() => setModalVisible(false)}
        onSelectOption={handleSelectOption}
        allowedActions={['revisione', 'sostituzione', 'installare']} // Autorizzazioni di esempio
        title="Opzioni Manutenzione"
        subtitle="Modal di test con layout corretto"
      />
    </View>
  );
}

/**
 * SOLUZIONI APPLICATE:
 * 
 * 1. Struttura Layout Corretta:
 *    - Rimosso flex flex-col dalla classe del contenitore principale
 *    - Aggiunto flexDirection: 'column' nello style inline
 *    - Aggiunto minHeight: 300 per garantire altezza minima
 * 
 * 2. ScrollView Corretto:
 *    - Wrappato in View con flex: 1
 *    - Aggiunto flexGrow: 1 al contentContainerStyle
 *    - Aggiunto paddingBottom per evitare sovrapposizione con footer
 *    - Abilitato showsVerticalScrollIndicator per debug visivo
 * 
 * 3. Footer Button Fisso:
 *    - Posizionato con position: absolute bottom: 0
 *    - Aggiunto background bianco e border radius appropriati
 *    - Il ScrollView ha padding bottom per non essere sovrapposto
 * 
 * 4. Responsive Design:
 *    - Mantenuto width responsive con Math.min(screenWidth - 40, 400)
 *    - Aggiunto maxHeight: '85%' per evitare overflow su schermi piccoli
 *    - minHeight per garantire spazio minimo per il contenuto
 * 
 * TESTING:
 * - Testa con diversi stati del prodotto (installed/not installed)
 * - Verifica che tutto il contenuto sia visibile e scrollabile
 * - Controlla che il footer button sia sempre visibile e funzionante
 * - Testa su diverse dimensioni di schermo per responsività
 */