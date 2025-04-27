"use client";

import { useState } from "react";
import { useParkingContext } from "../context/ParkingContext";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import Receipt from "./Receipt";
import QrScanner from "./QrScanner";
import { ParkingEntry } from "../types";

const ExitForm = () => {
  const { findParkingEntry, exitVehicle, findParkingEntryByReceiptId } = useParkingContext();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");
  const [exitedEntry, setExitedEntry] = useState<ParkingEntry | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required");
      return;
    }

    await processExit(vehicleNumber);
  };

  const processExit = async (vehicleNum: string) => {
    try {
      setIsProcessing(true);
      console.log("Starting processExit with vehicle number:", vehicleNum);
      
      // Find the entry
      const entry = await findParkingEntry(vehicleNum);
      
      console.log("Found entry:", entry ? JSON.stringify(entry, null, 2) : "No entry found");
      
      if (!entry) {
        setError("No active parking entry found for this vehicle");
        setIsProcessing(false);
        return;
      }
      
      if (entry.exitTime) {
        setError(`This vehicle (${vehicleNum}) has already exited at ${new Date(entry.exitTime).toLocaleString()}`);
        setIsProcessing(false);
        return;
      }

      console.log("Processing exit for entry ID:", entry.id);
      
      // Process the exit
      const updatedEntry = await exitVehicle(entry.id);
      
      console.log("Updated entry after exit:", updatedEntry ? JSON.stringify(updatedEntry, null, 2) : "Failed to update entry");
      
      if (updatedEntry) {
        console.log("Exit processed successfully. Total amount:", updatedEntry.totalAmount);
        setExitedEntry(updatedEntry);
        setShowReceipt(true);
        setVehicleNumber("");
      } else {
        setError("Could not process exit for this vehicle. Please check console for details.");
      }
    } catch (err) {
      console.error("Error processing exit:", err);
      setError(`An error occurred while processing the exit: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewExit = () => {
    setShowReceipt(false);
    setExitedEntry(null);
  };

  const handleScanSuccess = async (receiptId: string) => {
    try {
      // Find entry by receipt ID
      const entry = await findParkingEntryByReceiptId(receiptId);

      if (entry && !entry.exitTime) {
        await processExit(entry.vehicleNumber);
      } else {
        setError("No active entry found with this QR code");
      }
    } catch (err) {
      console.error("Error processing QR scan:", err);
      setError("An error occurred while processing the QR code");
    } finally {
      setShowScanner(false);
    }
  };

  if (showScanner) {
    return (
      <Card className="mt-4">
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      </Card>
    );
  }

  if (showReceipt && exitedEntry) {
    return (
      <div className="mt-4">
        <Receipt entry={exitedEntry} isExit={true} />
        <div className="text-center mt-4">
          <Button 
            onClick={handleNewExit}
            variant="secondary"
          >
            Process Another Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <h2 className="text-xl font-semibold mb-4">Vehicle Exit</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex justify-center">
        <Button 
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            <rect width="7" height="7" x="7" y="7" rx="1"></rect>
          </svg>
          Scan QR Code
        </Button>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Vehicle Number"
          placeholder="Enter vehicle number to process exit"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={isProcessing}
        />
        
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Exit"}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Either scan the QR code from the entry receipt or enter the vehicle number.</p>
      </div>
    </Card>
  );
};

export default ExitForm; 