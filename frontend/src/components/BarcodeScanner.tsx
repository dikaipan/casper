'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (serialNumber: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onScanError, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'qr-reader';

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, [isScanning]);

  const startScan = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText.trim());
          stopScan();
        },
        (errorMessage) => {
          // Error callback (ignore, will keep trying)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera. Please check permissions.');
      if (onScanError) {
        onScanError(err.message || 'Failed to start camera');
      }
    }
  };

  const stopScan = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scan Barcode</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <div id={scannerId} className="w-full rounded-md overflow-hidden border"></div>

      <div className="flex gap-2">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScan}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Start Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScan}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Stop Scanner
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Position the barcode within the frame. The scanner will automatically detect it.
      </p>
    </div>
  );
}

