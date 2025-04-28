"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface IconUploaderProps {
  onIconChange: (iconBase64: string | null) => void;
  initialIcon?: string | null;
  size?: "sm" | "md" | "lg";
}

const IconUploader = ({ onIconChange, initialIcon, size = "md" }: IconUploaderProps) => {
  const [iconPreview, setIconPreview] = useState<string | null>(initialIcon || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size mappings
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      icon: "w-8 h-8"
    },
    md: {
      container: "w-24 h-24",
      icon: "w-12 h-12"
    },
    lg: {
      container: "w-32 h-32",
      icon: "w-16 h-16"
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setIconPreview(base64);
          onIconChange(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setIconPreview(null);
    onIconChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size].container} relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer`} onClick={triggerFileInput}>
        {iconPreview ? (
          // Use standard img tag for base64 data
          iconPreview.startsWith('data:') ? (
            <img
              src={iconPreview}
              alt="Vehicle Icon"
              className={`${sizeClasses[size].icon} object-contain`}
            />
          ) : (
            // Use Next.js Image for URLs
            <Image
              src={iconPreview}
              alt="Vehicle Icon"
              width={sizeClasses[size].icon === "w-8 h-8" ? 32 : sizeClasses[size].icon === "w-12 h-12" ? 48 : 64}
              height={sizeClasses[size].icon === "w-8 h-8" ? 32 : sizeClasses[size].icon === "w-12 h-12" ? 48 : 64}
              className={`${sizeClasses[size].icon} object-contain`}
            />
          )
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${sizeClasses[size].icon} text-gray-400`}>
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden"
          aria-label="Upload vehicle icon"
        />
      </div>
      
      {iconPreview && (
        <button 
          type="button" 
          onClick={handleRemoveIcon} 
          className="text-xs text-red-600 hover:text-red-800"
        >
          Remove Icon
        </button>
      )}
    </div>
  );
};

export default IconUploader; 