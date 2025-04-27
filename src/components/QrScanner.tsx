"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
    return () => {
      // Cleanup scanner when component unmounts
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(error => console.error("Failed to stop scanner:", error));
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    setError("");
    setScanning(true);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Check if the decoded text is a valid receipt ID (e.g., starts with PK-)
          if (decodedText && decodedText.startsWith("PK-")) {
            onScanSuccess(decodedText);
            stopScanner();
          } else {
            setError("Invalid QR code. Please scan a valid parking receipt QR code.");
          }
        },
        (errorMessage) => {
          // Ignoring the error callback to avoid flooding with errors
          // while scanning is active
        }
      );
    } catch (err) {
      setScanning(false);
      setError("Could not start camera. Please check camera permissions.");
      console.error("QR Scanner error:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (error) {
        console.error("Failed to stop scanner:", error);
      }
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