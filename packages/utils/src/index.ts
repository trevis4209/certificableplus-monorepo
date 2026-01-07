/**
 * @certplus/utils - Shared Utility Functions
 * CertificablePlus Monorepo
 */

// QR Code utilities (CRITICAL - Mobile scanner depends on these)
export { extractQRCode, normalizeQRCode, matchQRCode } from './qr-utils';

// Tailwind className utility (Web only)
export { cn } from './cn';
