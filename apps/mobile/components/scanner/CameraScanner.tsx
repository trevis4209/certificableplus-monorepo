// Componente per la gestione della fotocamera e scansione QR
// Responsabile solo della visualizzazione camera e overlay di scansione

import { BarcodeScanningResult, CameraView } from 'expo-camera';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraScannerProps, ScanOperation } from '../../types/scanner';
import ScanOverlay from './ScanOverlay';

interface CameraScannerComponentProps extends Omit<CameraScannerProps, 'onBarCodeScanned'> {
  onBarcodeScanned?: (result: BarcodeScanningResult) => void;
  onBarCodeScanned?: (result: BarcodeScanningResult) => void;
  className?: string;
  selectedOperation?: ScanOperation | null;
}

const CameraScanner: React.FC<CameraScannerComponentProps> = React.memo(({
  facing,
  scanned,
  onBarcodeScanned,
  onBarCodeScanned,
  className = "flex-1 bg-black",
  selectedOperation
}) => {
  const handleScan = onBarCodeScanned || onBarcodeScanned || (() => {});
  return (
    <View className={className}>
      {/* Fotocamera a schermo intero */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
      />

      {/* Overlay per il targeting del QR code */}
      <ScanOverlay scanned={scanned} selectedOperation={selectedOperation} />
    </View>
  );
});

CameraScanner.displayName = 'CameraScanner';

export default CameraScanner;