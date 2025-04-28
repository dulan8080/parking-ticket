"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import Button from "./ui/Button";

interface QrScannerProps {
  onScanSuccess: (receiptId: string) => void;
  onClose: () => void;
}

const QrScanner = ({ onScanSuccess, onClose }: QrScannerProps) => {
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize scanner on component mount
    if (!scannerRef.current) {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader");
      } catch (err) {
        console.error("Failed to initialize QR scanner:", err);
        setError("Failed to initialize scanner. Please try again.");
      }
    }

    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          scannerRef.current
            .stop()
            .catch(error => console.error("Failed to stop scanner:", error));
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader");
      } catch (err) {
        console.error("Failed to initialize QR scanner:", err);
        setError("Failed to initialize scanner. Please try again.");
        return;
      }
    }
    
    setError("");
    setScanning(true);
    
    try {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR Code scanned, decoded text:", decodedText);
          
          // Accept any text as valid for now - we'll check in the callback
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Only log to console to avoid flooding UI with errors during scanning
          console.debug("QR scan error:", errorMessage);
        }
      );
    } catch (err) {
      setScanning(false);
      console.error("QR Scanner error:", err);
      setError("Could not start camera. Please check camera permissions and try again.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error("Failed to stop scanner:", error);
      } finally {
        setScanning(false);
      }
    } else {
      setScanning(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div 
        id="qr-reader" 
        ref={containerRef}
        className="w-full max-w-sm mx-auto overflow-hidden rounded-md"
        style={{ height: scanning ? "300px" : "auto" }}
      >
        {!scanning && (
          <div className="flex justify-center items-center h-40 bg-gray-100 rounded-md">
            <p className="text-gray-500">Camera preview will appear here</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-2">
        {!scanning ? (
          <Button onClick={startScanner}>Start Scanning</Button>
        ) : (
          <Button variant="secondary" onClick={stopScanner}>Stop Scanning</Button>
        )}
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        Position the QR code from the entry receipt in front of your camera
      </p>
    </div>
  );
};

export default QrScanner; 