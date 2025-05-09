"use client";

import { useState } from "react";
import { useParkingContext } from "../context/ParkingContext";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import Receipt from "./Receipt";
import { ParkingEntry } from "../types";
import Image from "next/image";

const EntryForm = () => {
  const { vehicleTypes, addParkingEntry, findParkingEntry } = useParkingContext();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [isPickAndGo, setIsPickAndGo] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<{receiptId?: string, entryTime?: string} | null>(null);
  const [createdEntry, setCreatedEntry] = useState<ParkingEntry | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails(null);

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
      
      // Check if vehicle with same number is already parked (has no exit time)
      const existingEntry = await findParkingEntry(vehicleNumber);
      
      if (existingEntry && !existingEntry.exitTime) {
        setError(`Vehicle with number ${vehicleNumber} is already in the parking lot.`);
        setErrorDetails({
          receiptId: existingEntry.receiptId,
          entryTime: new Date(existingEntry.entryTime).toLocaleString()
        });
        setIsProcessing(false);
        return;
      }

      // Pass the isPickAndGo flag to addParkingEntry
      const entry = await addParkingEntry(vehicleNumber, selectedVehicleType, isPickAndGo);
      console.log("Created entry:", entry); // Debug log
      setCreatedEntry(entry);
      setShowReceipt(true);
      
      // Reset form
      setVehicleNumber("");
      setSelectedVehicleType("");
      setIsPickAndGo(false);
    } catch (err) {
      console.error("Error creating entry:", err);
      
      // Check if the error has details property (from API)
      const error = err as Error & { details?: {receiptId?: string, entryTime?: string} };
      
      // Check if the error has details property (from API)
      if (error.details) {
        setError(error.message || "Failed to create parking entry.");
        setErrorDetails(error.details);
      } else {
        setError(error.message || "Failed to create parking entry. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewEntry = () => {
    setShowReceipt(false);
    setCreatedEntry(null);
    setIsPickAndGo(false);
  };

  // Function to get appropriate icon for vehicle type
  const getVehicleIcon = (vehicleType: any) => {
    // If the vehicle type has a custom icon URL, use it
    if (vehicleType.iconUrl) {
      return (
        <Image 
          src={vehicleType.iconUrl} 
          alt={vehicleType.name} 
          width={36} 
          height={36} 
          className="w-9 h-9 object-contain" 
        />
      );
    }
    
    // Otherwise, use the default icons based on name
    const name = vehicleType.name.toLowerCase();
    
    if (name.includes('car')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
          <circle cx="6.5" cy="16.5" r="2.5" fill="#DBEAFE" />
          <circle cx="16.5" cy="16.5" r="2.5" fill="#DBEAFE" />
        </svg>
      );
    } 
    
    if (name.includes('bike') || name.includes('motorcycle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" fill="#FEE2E2" />
          <circle cx="18.5" cy="17.5" r="3.5" fill="#FEE2E2" />
          <path d="M15 6h5v4h-5zM6 9h5.79a2 2 0 0 0 1.76-1.05L15 6" />
          <path d="M8 17h7.1a2 2 0 0 0 1.66-.9l3.8-5.7a2 2 0 0 0 .2-.8m-8.26 0-1.87 5.6a2 2 0 0 1-1.9 1.4h-.63" />
        </svg>
      );
    }
    
    if (name.includes('scooter')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="4" fill="#D1FAE5" />
          <path d="M19 17h-5.3a1 1 0 0 1-.5-1.8L18 11.5" />
          <path d="M14 9V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
          <path d="M6 15V9" />
          <path d="M4.5 12h1.5" />
          <path d="M17 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" fill="#D1FAE5" />
        </svg>
      );
    }
    
    if (name.includes('bicycle') || name.includes('cycle')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="15" r="4" fill="#E0E7FF" />
          <circle cx="18" cy="15" r="4" fill="#E0E7FF" />
          <path d="M6 15 9 6 15 6" />
          <path d="m18 15-6-6" />
          <path d="M6 9h8" />
        </svg>
      );
    }
    
    if (name.includes('van')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H3a1 1 0 0 0-1 1v10h2" fill="#F3E8FF" />
          <path d="M14 5v12h7a1 1 0 0 0 1-1V9.5c0-.3-.1-.5-.3-.7l-3-3a1 1 0 0 0-.7-.3H14Z" fill="#F3E8FF" />
          <circle cx="7.5" cy="17.5" r="2.5" fill="#F3E8FF" />
          <circle cx="17.5" cy="17.5" r="2.5" fill="#F3E8FF" />
        </svg>
      );
    }
    
    if (name.includes('truck')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H2v12h3" fill="#FEF3C7" />
          <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" fill="#FEF3C7" />
          <path d="M14 17h1" />
          <circle cx="7.5" cy="17.5" r="2.5" fill="#FEF3C7" />
          <circle cx="17.5" cy="17.5" r="2.5" fill="#FEF3C7" />
        </svg>
      );
    }
    
    if (name.includes('bus')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v6" />
          <path d="M15 6v6" />
          <path d="M2 12h19.6" />
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" fill="#E0F2FE" />
          <circle cx="7" cy="18" r="2" fill="#E0F2FE" />
          <path d="M9 18h5" />
          <circle cx="16" cy="18" r="2" fill="#E0F2FE" />
        </svg>
      );
    }
    
    // Default icon for any other type
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" fill="#F3F4F6" />
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
        <Receipt entry={createdEntry} autoPrint={true} />
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
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          <p className="font-medium">{error}</p>
          {errorDetails && (
            <div className="mt-2 text-sm">
              <p><span className="font-semibold">Receipt ID:</span> {errorDetails.receiptId}</p>
              <p><span className="font-semibold">Entry Time:</span> {errorDetails.entryTime}</p>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Vehicle Number Input - Moved to top and made larger */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-800 mb-2">
            Vehicle Number
          </label>
          <input
            className="w-full px-4 py-4 text-2xl font-semibold tracking-wider border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-center"
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="ENTER VEHICLE NUMBER"
            disabled={isProcessing}
            required
          />
        </div>
        
        {/* Vehicle Type Selection */}
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
                <div className="w-16 h-16 flex items-center justify-center mb-2">
                  {getVehicleIcon(vt)}
                </div>
                <span className="text-sm font-medium">{vt.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Pick&Go toggle switch */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-800">Pick&Go Service</h3>
              <p className="text-sm text-gray-500">First 15 minutes free of charge</p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
              <input
                id="pick-and-go-switch"
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={isPickAndGo}
                onChange={() => setIsPickAndGo(!isPickAndGo)}
                aria-label="Enable Pick&Go service"
              />
              <label
                htmlFor="pick-and-go-switch"
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                  isPickAndGo ? 'bg-green-500' : 'bg-gray-300'
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsPickAndGo(!isPickAndGo);
                  }
                }}
              >
                <span 
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md transform ${
                    isPickAndGo ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </label>
            </div>
          </div>
          
          {isPickAndGo && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  <strong>Important:</strong> You have selected Pick&Go service. You will have 15 minutes free of charge. 
                  You cannot leave the vehicle at the parking premise. After 15 minutes, standard parking charges will apply.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Generating..." : "Generate Entry Ticket"}
        </Button>
      </form>
    </Card>
  );
};

export default EntryForm; 