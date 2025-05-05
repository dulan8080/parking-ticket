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
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial setup
  useEffect(() => {
    const initialize = async () => {
      try {
        // Try to enumerate cameras to see if we have access
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError("Camera API not supported by your browser");
          return;
        }

        // Check if camera access is already granted
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          
          if (videoDevices.length > 0) {
            setCameras(videoDevices);
            // Set default camera - prefer rear camera for mobile
            const rearCamera = videoDevices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('environment')
            );
            setSelectedCamera(rearCamera?.deviceId || videoDevices[0].deviceId);
            
            // If we can see camera labels, permission is already granted
            if (videoDevices[0].label) {
              setPermissionStatus('granted');
            }
          } else {
            setError("No cameras found on your device");
          }
        } catch (err) {
          console.log("Permission check failed:", err);
        }
      } catch (err) {
        console.error("Error during initialization:", err);
        setError("Failed to initialize camera. Please try again.");
      }
    };

    initialize();
    
    return () => {
      cleanupScanner();
    };
  }, []);

  // Cleanup function for the scanner
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

  // Initialize the scanner
  const initScanner = () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader", { verbose: false });
        console.log("QR scanner initialized successfully");
      }
      return true;
    } catch (err) {
      console.error("Failed to initialize QR scanner:", err);
      setError("Failed to initialize scanner. Please try again.");
      return false;
    }
  };

  // Request camera permission directly
  const requestCameraPermission = async () => {
    try {
      setError("");
      
      // Force a direct camera access which will trigger the permission prompt
      const constraints = {
        video: {
          facingMode: "environment", // Prefer rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // If we get here, permission was granted
      setPermissionStatus('granted');
      
      // Get the list of cameras after permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      // Set default camera (prefer rear camera on mobile)
      const rearCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      setSelectedCamera(rearCamera?.deviceId || videoDevices[0].deviceId);
      
      // Stop the stream since we only needed it to request permission
      stream.getTracks().forEach(track => track.stop());
      
      // Wait a moment for the browser to update permissions
      setTimeout(() => {
        startScanner();
      }, 500);
    } catch (err) {
      console.error("Camera access error:", err);
      setPermissionStatus('denied');
      
      // Provide specific error message based on the error
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError("Camera access was denied. Please enable camera access in your browser settings.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera found on your device.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Could not access camera. Please check your device settings.");
      }
    }
  };

  // Start the QR scanner
  const startScanner = async () => {
    await cleanupScanner();
    
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
      
      // Use the selected camera if available, otherwise use environment facing mode
      const cameraConfig = selectedCamera 
        ? { deviceId: selectedCamera }
        : { facingMode: "environment" };
      
      await scannerRef.current!.start(
        cameraConfig,
        config,
        (decodedText) => {
          console.log("QR Code scanned, decoded text:", decodedText);
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
      
      console.error("QR Scanner error:", err);
      
      // Provide more specific error messages based on the error
      if (err.toString().includes('Permission denied') || err.toString().includes('NotAllowedError')) {
        setError("Camera access denied. Please check your browser settings and enable camera access.");
      } else if (err.toString().includes('NotFoundError')) {
        setError("No camera found. Please make sure your device has a working camera.");
      } else if (err.toString().includes('NotReadableError')) {
        setError("Camera is in use by another application or not available.");
      } else {
        setError("Could not start camera. Please try again or restart your browser.");
      }
    }
  };

  // Stop the scanner
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

  // Switch camera if multiple cameras are available
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    setSelectedCamera(newCameraId);
    
    if (scanning) {
      stopScanner().then(() => {
        startScanner();
      });
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
      
      {cameras.length > 1 && permissionStatus === 'granted' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Camera
          </label>
          <select 
            value={selectedCamera}
            onChange={handleCameraChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            disabled={scanning}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div 
        id="qr-reader" 
        ref={containerRef}
        className="w-full max-w-sm mx-auto overflow-hidden rounded-md"
        style={{ height: scanning ? "300px" : "200px" }}
      >
        {!scanning && (
          <div className="flex justify-center items-center h-full bg-gray-100 rounded-md">
            <p className="text-gray-500 text-center px-4">
              {permissionStatus === 'granted' 
                ? "Camera preview will appear here" 
                : "Camera permission required to scan QR codes"}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-2">
        {!scanning ? (
          permissionStatus === 'granted' ? (
            <Button onClick={startScanner}>Start Scanning</Button>
          ) : (
            <Button onClick={requestCameraPermission}>
              Allow Camera Access
            </Button>
          )
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