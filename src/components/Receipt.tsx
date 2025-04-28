"use client";

import { useRef, useEffect, useState } from "react";
import { format, formatDistanceStrict, isValid } from "date-fns";
// Uncomment the QRCode import
// import ReactToPrint from "react-to-print";
import QRCode from "react-qr-code";
import { ParkingEntry } from "../types";
import Button from "./ui/Button";

type ReceiptProps = {
  entry: ParkingEntry;
  isExit?: boolean;
};

const Receipt = ({ entry, isExit = false }: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  // Replace qrCanvasRef with qrValue
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrValue, setQrValue] = useState("");

  // Debug on mount
  useEffect(() => {
    console.log("Receipt Component Mounted");
    console.log("Entry data:", JSON.stringify(entry, null, 2));
    
    // Set QR code value
    if (entry.receiptId) {
      setQrValue(entry.receiptId);
    }
  }, [entry]);

  const formatDate = (dateString: string) => {
    try {
      console.log("Formatting date:", dateString);
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (!isValid(date)) {
        console.warn('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      return format(date, "PPp"); // Format: Apr 29, 2023, 3:30 PM
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const formatDuration = (entryTime: string, exitTime?: string) => {
    if (!exitTime) return "Ongoing";
    
    try {
      const start = new Date(entryTime);
      const end = new Date(exitTime);
      
      // Check if both dates are valid
      if (!isValid(start) || !isValid(end)) {
        console.warn('Invalid date for duration calculation');
        return 'Invalid duration';
      }
      
      return formatDistanceStrict(start, end, { 
        addSuffix: false,
        roundingMethod: 'ceil'
      });
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Duration error';
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    setIsPrinting(true);
    
    const originalContents = document.body.innerHTML;
    const printContent = receiptRef.current.innerHTML;
    
    document.body.innerHTML = `
      <div style="max-width: 80mm; margin: 0 auto; padding: 10px;">
        ${printContent}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    
    // This is a workaround as we lost React's state management during printing
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Create a safe function for displaying the current date
  const getCurrentDate = () => {
    try {
      return format(new Date(), "PPp");
    } catch (error) {
      console.error('Error formatting current date:', error);
      return 'Current date';
    }
  };

  // Function to get vehicle type name
  const getVehicleTypeName = () => {
    try {
      if (!entry.vehicleType) return 'N/A';
      
      if (typeof entry.vehicleType === 'object') {
        console.log("Vehicle type is an object:", entry.vehicleType);
        return entry.vehicleType.name || 'Unknown';
      }
      
      return entry.vehicleType;
    } catch (error) {
      console.error('Error getting vehicle type:', error);
      return 'Unknown';
    }
  };

  // Function to format currency in Sri Lankan Rupees
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'LKR 0.00';
    
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="mb-4">
      <div 
        ref={receiptRef} 
        className="bg-white p-6 border border-gray-300 rounded-lg max-w-md mx-auto shadow-md"
      >
        <div className="text-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold">Parking Receipt</h2>
          <p className="text-gray-600 text-sm mt-1">{isExit ? "Exit Ticket" : "Entry Ticket"}</p>
          <p className="text-xs text-gray-500 mt-1">Issue Date: {getCurrentDate()}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Receipt ID:</span>
            <span className="font-mono">{entry.receiptId || 'N/A'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Vehicle Number:</span>
            <span className="font-semibold">{entry.vehicleNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Vehicle Type:</span>
            <span>{getVehicleTypeName()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Entry Time:</span>
            <span>{entry.entryTime ? formatDate(entry.entryTime) : 'N/A'}</span>
          </div>
          
          {/* Add Pick&Go notice */}
          {entry.isPickAndGo && (
            <div className="bg-yellow-50 p-3 my-2 rounded-md border border-yellow-200">
              <p className="text-yellow-800 font-medium mb-1">You Have selected Pick&Go</p>
              <p className="text-yellow-700 text-sm">You have 15min Free Of Charge. You can Not leave the vehicle at Parking premise. After 15min You will be charged.</p>
            </div>
          )}
          
          {isExit && entry.exitTime && (
            <>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Exit Time:</span>
                <span>{formatDate(entry.exitTime)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Duration:</span>
                <span>{formatDuration(entry.entryTime, entry.exitTime)}</span>
              </div>
              <div className="flex justify-between mb-2 text-lg font-bold mt-3 pt-2 border-t">
                <span>Total Amount:</span>
                <span>{formatCurrency(entry.totalAmount)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-center my-4">
          <div className="border-2 border-gray-300 p-4 rounded bg-white">
            {/* Replace canvas with QRCode component */}
            <QRCode
              value={qrValue || "placeholder"}
              size={150}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              level="H"
            />
            <p className="text-center text-xs mt-2 text-gray-500">
              Scan for verification
            </p>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-4 border-t pt-3">
          <p>Thank you for using our parking service!</p>
          <p className="mt-1">This receipt serves as proof of parking. Please keep it safe.</p>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Receipt
        </Button>
      </div>
    </div>
  );
};

export default Receipt; 