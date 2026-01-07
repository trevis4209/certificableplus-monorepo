/**
 * QR Code Utilities
 *
 * Utility functions for handling QR codes in different formats:
 * - Full URL: https://certificateplus.arredasparma.it/public/product/QRY59331623016
 * - Path: /public/product/QRY59331623016
 * - Code: QRY59331623016
 */

/**
 * Extracts the QR code from a URL or returns the code directly
 *
 * Supports multiple formats:
 * - Full URL: https://example.com/product/CODE123 → CODE123
 * - Path: /product/CODE123 → CODE123
 * - Path with public: /public/product/CODE123 → CODE123
 * - Direct code: CODE123 → CODE123
 *
 * @param qrString - The QR code string (URL or direct code)
 * @returns The extracted QR code
 *
 * @example
 * extractQRCode('https://example.com/public/product/QRY123') // 'QRY123'
 * extractQRCode('/product/QRY123') // 'QRY123'
 * extractQRCode('QRY123') // 'QRY123'
 */
export function extractQRCode(qrString: string): string {
  if (!qrString) {
    return '';
  }

  const trimmed = qrString.trim();

  // Check if it's a URL or path
  if (trimmed.includes('/')) {
    // Try to match patterns like:
    // - /product/{CODE}
    // - /public/product/{CODE}
    // - https://domain.com/product/{CODE}
    // - https://domain.com/public/product/{CODE}

    const patterns = [
      /\/product\/([^/?#]+)/i,           // Matches: /product/CODE or /public/product/CODE
      /\/public\/product\/([^/?#]+)/i,  // Explicit match for /public/product/CODE
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If no pattern matched, try to get the last segment
    const segments = trimmed.split('/').filter(s => s.length > 0);
    if (segments.length > 0) {
      // Remove query params and hash if present
      const lastSegment = segments[segments.length - 1];
      return lastSegment.split('?')[0].split('#')[0];
    }
  }

  // If it's not a URL/path, return as is
  return trimmed;
}

/**
 * Normalizes QR code for comparison
 * Returns both the extracted code and original for flexible matching
 *
 * @param qrString - The QR code string
 * @returns Object with extracted code and original string
 *
 * @example
 * normalizeQRCode('https://example.com/product/QRY123')
 * // { extracted: 'QRY123', original: 'https://example.com/product/QRY123' }
 */
export function normalizeQRCode(qrString: string): {
  extracted: string;
  original: string;
} {
  return {
    extracted: extractQRCode(qrString),
    original: qrString.trim(),
  };
}

/**
 * Checks if two QR codes match (handles both URL and code formats)
 *
 * @param qr1 - First QR code (can be URL or code)
 * @param qr2 - Second QR code (can be URL or code)
 * @returns true if the QR codes match
 *
 * @example
 * matchQRCode('https://example.com/product/QRY123', 'QRY123') // true
 * matchQRCode('QRY123', 'QRY123') // true
 * matchQRCode('QRY123', 'QRY456') // false
 */
export function matchQRCode(qr1: string, qr2: string): boolean {
  if (!qr1 || !qr2) {
    return false;
  }

  const normalized1 = normalizeQRCode(qr1);
  const normalized2 = normalizeQRCode(qr2);

  // Check if extracted codes match
  if (normalized1.extracted === normalized2.extracted) {
    return true;
  }

  // Check if original strings match
  if (normalized1.original === normalized2.original) {
    return true;
  }

  // Check cross-matches (extracted vs original)
  if (normalized1.extracted === normalized2.original) {
    return true;
  }

  if (normalized1.original === normalized2.extracted) {
    return true;
  }

  return false;
}
