"use client";

import { useState } from "react";
import { useParkingContext } from "../context/ParkingContext";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import Receipt from "./Receipt";

const EntryForm = () => {
  const { vehicleTypes, addParkingEntry } = useParkingContext();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [error, setError] = useState("");
  const [createdEntry, setCreatedEntry] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required");
      return;
    }

    if (!selectedVehicleType) {
      setError("Please select a vehicle type");
      return;
    }

    try {
      setIsProcessing(true);
      const entry = await addParkingEntry(vehicleNumber, selectedVehicleType);
      console.log("Created entry:", entry); // Debug log
      setCreatedEntry(entry);
      setShowReceipt(true);
      
      // Reset form
      setVehicleNumber("");
      setSelectedVehicleType("");
    } catch (err) {
      console.error("Error creating entry:", err);
      setError("Failed to create parking entry. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewEntry = () => {
    setShowReceipt(false);
    setCreatedEntry(null);
  };

  // Function to get appropriate icon for vehicle type
  const getVehicleIcon = (typeName: string) => {
    const name = typeName.toLowerCase();
    
    if (name.includes('car')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
          <circle cx="6.5" cy="16.5" r="2.5" />
          <circle cx="16.5" cy="16.5" r="2.5" />
        </svg>
      );
    } 
    
    if (name.includes('bike') || name.includes('motorcycle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6h5v4h-5zM6 9h5.79a2 2 0 0 0 1.76-1.05L15 6" />
          <path d="M8 17h7.1a2 2 0 0 0 1.66-.9l3.8-5.7a2 2 0 0 0 .2-.8m-8.26 0-1.87 5.6a2 2 0 0 1-1.9 1.4h-.63" />
        </svg>
      );
    }
    
    if (name.includes('scooter')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4" />
          <path d="M19 17h-5.3a1 1 0 0 1-.5-1.8L18 11.5" />
          <path d="M14 9V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
          <path d="M6 15V9" />
          <path d="M4.5 12h1.5" />
          <path d="M17 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
        </svg>
      );
    }
    
    if (name.includes('bicycle') || name.includes('cycle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="15" r="4" />
          <circle cx="18" cy="15" r="4" />
          <path d="M6 15 9 6 15 6" />
          <path d="m18 15-6-6" />
          <path d="M6 9h8" />
        </svg>
      );
    }
    
    if (name.includes('van')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H3a1 1 0 0 0-1 1v10h2" />
          <path d="M14 5v12h7a1 1 0 0 0 1-1V9.5c0-.3-.1-.5-.3-.7l-3-3a1 1 0 0 0-.7-.3H14Z" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    }
    
    if (name.includes('truck')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H2v12h3" />
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
          <path d="M14 17h1" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    }
    
    if (name.includes('bus')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v6" />
          <path d="M15 6v6" />
          <path d="M2 12h19.6" />
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
          <circle cx="7" cy="18" r="2" />
          <path d="M9 18h5" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      );
    }
    
    // Default icon for any other type
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h.01" />
        <path d="M17 7h.01" />
        <path d="M7 12h.01" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 17h.01" />
        <path d="M12 17h.01" />
        <path d="M17 17h.01" />
      </svg>
    );
  };

  if (showReceipt && createdEntry) {
    console.log("Showing receipt for entry:", createdEntry); // Debug log
    return (
      <div className="mt-4">
        <Receipt entry={createdEntry} />
        <div className="text-center mt-4">
          <Button 
            onClick={handleNewEntry}
            variant="secondary"
          >
            New Entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <h2 className="text-xl font-semibold mb-4">Vehicle Entry</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {vehicleTypes.map((vt) => (
              <button
                key={vt.id}
                type="button"
                onClick={() => setSelectedVehicleType(vt.id)}
                disabled={isProcessing}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${selectedVehicleType === vt.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                tabIndex={0}
                aria-label={`Select ${vt.name}`}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
                  {getVehicleIcon(vt.name)}
                </div>
                <span className="text-sm font-medium">{vt.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <Input
          label="Vehicle Number"
          placeholder="Enter vehicle number (e.g., AB12C3456)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={isProcessing}
        />
        
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Generating..." : "Generate Entry Ticket"}
        </Button>
      </form>
    </Card>
  );
};

export default EntryForm; 