/**
 * QRCodeModal Component - Redesigned QR Code Display Modal
 * 
 * **Core Features:**
 * - Responsive QR code display with mobile-first design
 * - Optimized download functionality (PNG/SVG)
 * - Clean product information layout with proper hierarchy
 * - Horizontal scroll elimination with flexible layouts
 * - Improved button organization and accessibility
 * 
 * **Design Improvements:**
 * - Mobile-first responsive design with no horizontal scroll
 * - Better visual hierarchy with proper spacing and typography
 * - Organized action buttons with clear grouping
 * - Optimized content width and flexible QR code sizing
 * - Clean information architecture following shadcn/ui patterns
 * 
 * **Technical Architecture:**
 * - Client component with optimized QR generation
 * - Canvas-based PNG/SVG download with error handling
 * - Responsive breakpoints with mobile-optimized layouts
 * - Performance optimized with React.memo
 * 
 * **Integration Points:**
 * - ProductCard component integration
 * - Mock data system compatibility
 * - shadcn/ui Dialog system with custom styling
 */

"use client";

import React, { memo, useRef, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCode } from "@/components/ui/qr-code";
import { 
  Download, 
  Printer, 
  X,
  Package,
  Calendar,
  MapPin,
  Building,
  QrCode as QrIcon
} from "lucide-react";
import { cn } from "@certplus/utils";

// Props interface per il modal
interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    qr_code: string;
    tipo_segnale: string;
    anno: number;
    forma: string;
    dimensioni: string;
    materiale_supporto: string;
    materiale_pellicola: string;
    gps_lat?: number;
    gps_lng?: number;
    companyId: string;
    createdAt: string;
  };
  company?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  className?: string;
}

/**
 * QRCodeModal Component principale
 * Visualizza QR code del prodotto con informazioni e azioni
 */
const QRCodeModal = memo(function QRCodeModal({
  isOpen,
  onClose,
  product,
  company,
  className = ""
}: QRCodeModalProps) {
  
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Genera URL prodotto per QR code
  const productUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/public/product/${product.qr_code}`;
  }, [product.qr_code]);
  
  // Handler per download QR come PNG
  const handleDownloadPNG = async () => {
    if (!qrRef.current) return;
    
    setIsDownloading(true);
    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) throw new Error('SVG not found');
      
      // Converti SVG in Canvas per download PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        
        // Background bianco per PNG
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `QR_${product.qr_code}_${product.tipo_segnale.replace(/\s+/g, '_')}.png`;
            a.click();
            URL.revokeObjectURL(downloadUrl);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      };
      
      img.onerror = () => {
        console.error('Failed to load SVG');
        setIsDownloading(false);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };


  // Handler per stampa - Solo QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const qrSvg = qrRef.current?.querySelector('svg');
    if (!qrSvg) return;
    
    const svgData = new XMLSerializer().serializeToString(qrSvg);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${product.qr_code}</title>
          <meta charset="UTF-8">
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            body { 
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }
            .qr-container {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            }
            .qr-code {
              width: 400px;
              height: 400px;
              display: block;
            }
            .qr-code svg {
              width: 100%;
              height: 100%;
              display: block;
            }
            @media print {
              @page { 
                margin: 0; 
                size: A4 portrait;
              }
              body { 
                margin: 0; 
                padding: 0;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .qr-container { 
                width: 100vw; 
                height: 100vh;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">${svgData}</div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.documentElement.innerHTML = htmlContent;
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "w-full max-w-md mx-auto p-0 gap-0 overflow-hidden",
          className
        )}
        showCloseButton={false}
      >
        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <QrIcon className="w-4 h-4 text-primary" />
              QR Code
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-7 w-7 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Product Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                {product.qr_code}
              </Badge>
              {company && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  <Building className="w-3 h-3 mr-1" />
                  {company.name}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-sm leading-tight text-foreground">
              {product.tipo_segnale}
            </h3>
            <p className="text-xs text-muted-foreground">
              {product.forma} • {product.dimensioni} • {product.anno}
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="px-6 py-6">
          <div className="flex justify-center mb-4">
            <div 
              ref={qrRef}
              className="p-3 bg-white rounded-lg border shadow-sm"
            >
              <QRCode 
                data={productUrl}
                className="w-40 h-40 sm:w-48 sm:h-48"
                robustness="M"
                size={160}
              />
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Package className="w-3 h-3" />
                Materiale
              </span>
              <span className="font-medium text-xs text-right">
                {product.materiale_supporto}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="w-3 h-3" />
                Creato
              </span>
              <span className="font-medium text-xs">
                {new Date(product.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>

            {product.gps_lat && product.gps_lng && (
              <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3 h-3" />
                  GPS
                </span>
                <span className="font-mono text-xs">
                  {product.gps_lat.toFixed(4)}, {product.gps_lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Simplified */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleDownloadPNG} 
              disabled={isDownloading}
              className="h-10"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Scaricando...' : 'Scarica'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="h-10"
              size="sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Stampa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export { QRCodeModal };
export type { QRCodeModalProps };