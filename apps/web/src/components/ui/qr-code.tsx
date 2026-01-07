"use client";

import React from "react";
import QRCodeLib from "qrcode";
import { cn } from "@certplus/utils";

interface QRCodeProps {
  data: string;
  className?: string;
  robustness?: "L" | "M" | "Q" | "H";
  size?: number;
}

export function QRCode({ 
  data, 
  className, 
  robustness = "M",
  size = 200 
}: QRCodeProps) {
  const [svgString, setSvgString] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const svg = await QRCodeLib.toString(data, {
          type: "svg",
          width: size,
          errorCorrectionLevel: robustness,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setSvgString(svg);
        setError("");
      } catch (err) {
        console.error("QR Code generation failed:", err);
        setError("Failed to generate QR code");
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size, robustness]);

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg",
        className
      )}>
        <p className="text-sm text-muted-foreground">QR Code Error</p>
      </div>
    );
  }

  if (!svgString) {
    return (
      <div className={cn(
        "flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg animate-pulse",
        className
      )}>
        <p className="text-sm text-muted-foreground">Generating...</p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}