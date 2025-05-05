"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./ui/Button";

interface SimpleQrScannerProps {
  onScanSuccess: (receiptId: string) => void;
  onClose: () => void;
}

const SimpleQrScanner = ({ onScanSuccess, onClose }: SimpleQrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const [canScan, setCanScan] = useState<boolean>(false);
  const [scanningTimer, setScanningTimer] = useState<NodeJS.Timeout | null>(null);

  const startScanner = async () => {
    setError("");
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not supported by your browser");
      return;
    }
    
    try {
      // Stop any existing streams
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      // Request access to the camera using very basic constraints
      // This approach has better compatibility with various mobile browsers
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setScanning(true);
          setCanScan(true);
          startScanningProcess();
        };
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera access was denied. Please enable camera access in your browser settings.");
      } else {
        setError("Failed to access camera. Make sure your device has a working camera and permissions are granted.");
      }
    }
  };

  const stopScanner = () => {
    if (scanningTimer) {
      clearTimeout(scanningTimer);
      setScanningTimer(null);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    setCanScan(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // A very simple QR code scanning function
  // Note: This is a simple implementation that just demonstrates the camera
  // For actual QR scanning, you'd need to implement decoding logic or use a library
  const startScanningProcess = () => {
    if (!canScan || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real implementation, you would now analyze the canvas for QR codes
    // For demo, we'll just simulate success after 3 seconds
    const timer = setTimeout(() => {
      // This is where you'd typically process the image and look for QR codes
      // For demonstration, just call onScanSuccess with a sample value after a delay
      onScanSuccess("DEMO-QR-12345");
    }, 3000);
    
    setScanningTimer(timer);
  };

  const handleScanButtonClick = () => {
    if (scanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md">
          {error}
          <p className="mt-2 text-sm">
            Try using a different browser (like Chrome for Android or Safari for iOS)
          </p>
        </div>
      )}
      
      <div className="relative w-full bg-gray-200 rounded-md overflow-hidden aspect-square max-w-sm mx-auto">
        <video 
          ref={videoRef} 
          className="absolute top-0 left-0 w-full h-full object-cover"
          playsInline // This is important for iOS!
          muted // Required for autoplay
          autoPlay // Attempt to autoplay
        />
        
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Camera preview will appear here</p>
          </div>
        )}
        
        <canvas 
          ref={canvasRef} 
          className="hidden" // Hide the canvas, it's just for processing
        />
      </div>
      
      <div className="mt-4 flex justify-center gap-2">
        <Button 
          onClick={handleScanButtonClick}
          variant={scanning ? "secondary" : "primary"}
        >
          {scanning ? "Stop Camera" : "Start Camera"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        Position the QR code from the entry receipt in front of your camera
      </p>
    </div>
  );
};

export default SimpleQrScanner; 