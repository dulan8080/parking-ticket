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
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt"); // "prompt", "granted", "denied"
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check camera permission on component mount
    const checkCameraPermission = async () => {
      try {
        // Check if camera permissions API is supported
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(result.state);
          
          // Listen for permission changes
          result.onchange = () => {
            setPermissionStatus(result.state);
            
            // If permission is granted after a change, try to start the scanner
            if (result.state === 'granted' && !scanning) {
              initScanner();
            }
          };
        }
      } catch (err) {
        console.log("Permission query not supported, will try direct access");
      }
    };
    
    checkCameraPermission();
    
    return () => {
      // Cleanup scanner when component unmounts
      cleanupScanner();
    };
  }, []);
  
  const cleanupScanner = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        try {
          await scannerRef.current.stop();
        } catch (error) {
          console.error("Failed to stop scanner:", error);
        }
      }
      scannerRef.current = null;
    }
  };

  const initScanner = () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
        console.log("QR scanner initialized successfully");
      }
      return true;
    } catch (err) {
      console.error("Failed to initialize QR scanner:", err);
      setError("Failed to initialize scanner. Please try again.");
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      // Explicitly request camera access - this will prompt the user
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      // If we get here, permission was granted
      setPermissionStatus('granted');
      
      // Stop the stream since we only needed it to request permission
      stream.getTracks().forEach(track => track.stop());
      
      // Now start the scanner
      startScanner();
    } catch (err) {
      console.error("Camera permission denied:", err);
      setPermissionStatus('denied');
      setError("Camera access was denied. Please enable camera access in your browser settings and try again.");
    }
  };

  const startScanner = async () => {
    // Clean up any existing scanner
    await cleanupScanner();
    
    // Initialize a new scanner
    if (!initScanner()) {
      return;
    }
    
    setError("");
    
    try {
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      setScanning(true);
      
      await scannerRef.current!.start(
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
    } catch (err: any) {
      setScanning(false);
      
      // Provide more specific error messages based on the error
      if (err.toString().includes('Permission denied') || err.toString().includes('NotAllowedError')) {
        setError("Camera access denied. Please check your browser settings and enable camera access.");
      } else if (err.toString().includes('NotFoundError')) {
        setError("No camera found. Please make sure your device has a working camera.");
      } else if (err.toString().includes('NotReadableError')) {
        setError("Camera is in use by another application or not available.");
      } else {
        console.error("QR Scanner error:", err);
        setError("Could not start camera. Please check camera permissions and try again.");
      }
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

  const renderPermissionButton = () => {
    if (permissionStatus === 'granted') {
      return (
        <Button onClick={startScanner}>Start Scanning</Button>
      );
    } else {
      return (
        <Button onClick={requestCameraPermission}>
          Allow Camera Access
        </Button>
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md">
          {error}
          {permissionStatus === 'denied' && (
            <p className="mt-2 text-sm">
              If you previously denied permission, you may need to reset permissions in your browser settings.
            </p>
          )}
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
            <p className="text-gray-500">
              {permissionStatus === 'granted' 
                ? "Camera preview will appear here" 
                : "Camera permission required"}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-2">
        {!scanning ? (
          renderPermissionButton()
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