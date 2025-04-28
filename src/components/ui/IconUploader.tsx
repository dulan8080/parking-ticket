"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from './Button';

interface IconUploaderProps {
  initialIconUrl?: string | null;
  onIconChange: (iconData: string | null) => void;
  vehicleType: string;
}

const IconUploader = ({ initialIconUrl, onIconChange, vehicleType }: IconUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(initialIconUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialIconUrl) {
      setPreview(initialIconUrl);
    }
  }, [initialIconUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, SVG)');
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Image size must be less than 1MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const iconData = event.target.result as string;
        setPreview(iconData);
        onIconChange(iconData);
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveIcon = () => {
    setPreview(null);
    onIconChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div 
        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50"
      >
        {preview ? (
          <Image 
            src={preview} 
            alt={`${vehicleType} icon`} 
            width={80} 
            height={80} 
            className="object-contain" 
          />
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-gray-400"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
      />
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Icon'}
        </Button>
        {preview && (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleRemoveIcon}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default IconUploader; 