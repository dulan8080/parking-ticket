"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CameraDebugPage() {
  const [status, setStatus] = useState('Checking camera...');
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('Camera API not supported by this browser');
      return;
    }

    // List available devices
    checkDevices();

    return () => {
      // Cleanup: stop any active stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const checkDevices = async () => {
    try {
      setStatus('Enumerating devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setCameras(videoDevices);
      
      if (videoDevices.length === 0) {
        setStatus('No cameras found on this device');
      } else {
        setStatus(`Found ${videoDevices.length} camera(s)`);
        
        // Try to determine if we have permission already
        const hasLabels = videoDevices.some(device => !!device.label);
        if (hasLabels) {
          setStatus(`Found ${videoDevices.length} camera(s) with permission already granted`);
        } else {
          setStatus(`Found ${videoDevices.length} camera(s), but permission not yet granted`);
        }
      }
    } catch (err) {
      console.error('Error accessing devices:', err);
      setStatus('Failed to enumerate devices');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const startCamera = async () => {
    try {
      setStatus('Requesting camera permission...');
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera with ideal settings for QR scanning
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // If a specific camera is selected, use it
      if (selectedCamera) {
        constraints.video = { 
          deviceId: { exact: selectedCamera },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Connect the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setStatus('Camera streaming successfully');
        
        // Now that we have permission, refresh the device list to get labels
        await checkDevices();
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setStreaming(false);
      setStatus('Camera access failed');
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please check your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('Camera not found on your device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError(`${err.name}: ${err.message}`);
        }
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setStreaming(false);
      setStatus('Camera stopped');
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
    
    // If already streaming, restart with new camera
    if (streaming) {
      stopCamera();
      setTimeout(() => startCamera(), 300);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Camera Debug Tool</h1>
          <p className="text-sm opacity-80">Use this page to test camera access</p>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="font-medium">Status:</div>
            <div className="text-gray-700">{status}</div>
            
            {error && (
              <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                Error: {error}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="font-medium mb-1">Available Cameras:</div>
            {cameras.length === 0 ? (
              <div className="text-gray-500 text-sm">No cameras detected or permission not granted</div>
            ) : (
              <select 
                value={selectedCamera}
                onChange={handleCameraChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={streaming}
              >
                <option value="">Use default (environment-facing)</option>
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-4">
            <div className="relative bg-gray-200 rounded-md overflow-hidden" style={{ height: '300px' }}>
              {streaming ? (
                <video 
                  ref={videoRef} 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  playsInline 
                  muted
                ></video>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Camera preview will appear here
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!streaming ? (
              <button 
                onClick={startCamera}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <button 
                onClick={stopCamera}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            )}
          </div>
          
          <div className="mt-4 border-t pt-4">
            <h2 className="font-medium mb-2">Troubleshooting Steps:</h2>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Make sure your device has a working camera</li>
              <li>Check that your browser has permission to access the camera</li>
              <li>For mobile devices, ensure the site is on HTTPS</li>
              <li>Try using a different browser if issues persist</li>
              <li>On iOS, some browsers other than Safari may have limited camera access</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              href="/"
              className="text-blue-600 hover:underline text-sm"
            >
              Return to Main App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 