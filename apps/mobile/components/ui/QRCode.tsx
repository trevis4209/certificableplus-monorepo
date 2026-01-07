/**
 * QRCode Component - Base QR Code Display Component
 *
 * **Core Features:**
 * - React Native QR code generation using react-native-qrcode-svg
 * - Configurable size and error correction level
 * - Clean, simple API matching web version
 *
 * **Technical Architecture:**
 * - Uses react-native-qrcode-svg for native QR generation
 * - Type-safe props interface
 * - Responsive sizing support
 *
 * **Integration Points:**
 * - QRCodeModal component
 * - Product detail pages
 */

import React from 'react';
import { View } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';

interface QRCodeProps {
  /**
   * Data to encode in the QR code (usually a URL)
   */
  data: string;

  /**
   * Size of the QR code in pixels
   * @default 200
   */
  size?: number;

  /**
   * Error correction level
   * - 'L': Low (7% recovery)
   * - 'M': Medium (15% recovery)
   * - 'Q': Quartile (25% recovery)
   * - 'H': High (30% recovery)
   * @default 'M'
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  /**
   * Background color (hex)
   * @default '#ffffff'
   */
  backgroundColor?: string;

  /**
   * Foreground color (hex)
   * @default '#000000'
   */
  color?: string;

  /**
   * Enable logo in center (future feature)
   */
  logo?: string;

  /**
   * Logo size (if logo provided)
   */
  logoSize?: number;
}

/**
 * QRCode Component
 * Renders a QR code using react-native-qrcode-svg
 */
const QRCode: React.FC<QRCodeProps> = React.memo(({
  data,
  size = 200,
  errorCorrectionLevel = 'M',
  backgroundColor = '#ffffff',
  color = '#000000',
  logo,
  logoSize = 50
}) => {
  if (!data) {
    return null;
  }

  return (
    <View style={{ backgroundColor }}>
      <QRCodeSVG
        value={data}
        size={size}
        backgroundColor={backgroundColor}
        color={color}
        ecl={errorCorrectionLevel}
        logo={logo ? { uri: logo } : undefined}
        logoSize={logo ? logoSize : undefined}
        logoBackgroundColor={backgroundColor}
      />
    </View>
  );
});

QRCode.displayName = 'QRCode';

export default QRCode;
