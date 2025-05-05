"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useParkingContext } from "../../context/ParkingContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Receipt from "../../components/Receipt";
import { ParkingEntry } from "../../types";

export default function HistoryPage() {
  const router = useRouter();
  const { parkingEntries, exitVehicle } = useParkingContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("entryTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<ParkingEntry | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [pickAndGoFilter, setPickAndGoFilter] = useState<"all" | "yes" | "no">("all");
  
  // Filter entries based on search term and Pick&Go status
  const filteredEntries = parkingEntries
    .filter(entry => {
      // Filter by search term
      const matchesSearch = searchTerm
        ? entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof entry.vehicleType === "object"
            ? entry.vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase())
            : entry.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          entry.receiptId.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      // Filter by Pick&Go status
      const matchesPickAndGo = 
        pickAndGoFilter === "all" ? true :
        pickAndGoFilter === "yes" ? entry.isPickAndGo === true :
        entry.isPickAndGo === false;
      
      return matchesSearch && matchesPickAndGo;
    });
  
  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortField === "entryTime") {
      const dateA = new Date(a.entryTime).getTime();
      const dateB = new Date(b.entryTime).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === "exitTime") {
      // Handle null exitTime values
      if (!a.exitTime && !b.exitTime) return 0;
      if (!a.exitTime) return sortDirection === "asc" ? -1 : 1;
      if (!b.exitTime) return sortDirection === "asc" ? 1 : -1;
      
      const dateA = new Date(a.exitTime).getTime();
      const dateB = new Date(b.exitTime).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === "vehicleNumber") {
      return sortDirection === "asc"
        ? a.vehicleNumber.localeCompare(b.vehicleNumber)
        : b.vehicleNumber.localeCompare(a.vehicleNumber);
    }
    
    if (sortField === "vehicleType") {
      const typeA = typeof a.vehicleType === "object" ? a.vehicleType.name : a.vehicleType;
      const typeB = typeof b.vehicleType === "object" ? b.vehicleType.name : b.vehicleType;
      return sortDirection === "asc" ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
    }
    
    if (sortField === "totalAmount") {
      const amountA = a.totalAmount || 0;
      const amountB = b.totalAmount || 0;
      return sortDirection === "asc" ? amountA - amountB : amountB - amountA;
    }
    
    return 0;
  });
  
  // Handle table header click for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Format date with proper handling of null values
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "PPp"); // Format: Apr 29, 2023, 3:30 PM
    } catch {
      return "Invalid date";
    }
  };
  
  // Get vehicle type name with proper handling of different data types
  const getVehicleTypeName = (type: string | { name: string }) => {
    if (!type) return "Unknown";
    return typeof type === "object" ? type.name : type;
  };
  
  // Calculate duration between entry and exit time
  const calculateDuration = (entryTime: string, exitTime?: string) => {
    if (!exitTime) return "Ongoing";
    
    try {
      const start = new Date(entryTime).getTime();
      const end = new Date(exitTime).getTime();
      const durationMs = end - start;
      
      // Convert to hours and minutes
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours === 0) {
        return `${minutes}m`;
      }
      
      return `${hours}h ${minutes}m`;
    } catch {
      return "Error";
    }
  };
  
  // Format currency in Sri Lankan Rupees
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "—";
    
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const handlePrintReceipt = (entry: ParkingEntry) => {
    setSelectedEntry(entry);
    setShowReceipt(true);
  };
  
  const handleCloseReceipt = () => {
    setSelectedEntry(null);
    setShowReceipt(false);
  };
  
  const handleProcessExit = async (entry: ParkingEntry) => {
    if (isProcessingExit) return;
    
    try {
      setIsProcessingExit(true);
      const updatedEntry = await exitVehicle(entry.id);
      if (updatedEntry) {
        setSelectedEntry(updatedEntry);
        setShowReceipt(true);
      }
    } catch (error) {
      console.error("Error processing exit:", error);
      alert("Failed to process exit. Please try again.");
    } finally {
      setIsProcessingExit(false);
    }
  };
  
  // If showing a receipt, render it
  if (showReceipt && selectedEntry) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Parking Receipt</h1>
          <Button variant="outline" onClick={handleCloseReceipt}>
            Back to History
          </Button>
        </div>
        
        <Receipt 
          entry={selectedEntry} 
          isExit={selectedEntry.exitTime ? true : false}
          autoPrint={selectedEntry.exitTime ? true : false} 
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking History</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search by vehicle number, type or receipt ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Pick&Go:</label>
            <div className="flex rounded-md shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-l-md ${
                  pickAndGoFilter === "all" ? "bg-blue-50 text-blue-700 border-blue-500" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setPickAndGoFilter("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-gray-700 border-t border-b border-gray-300 ${
                  pickAndGoFilter === "yes" ? "bg-blue-50 text-blue-700 border-blue-500" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setPickAndGoFilter("yes")}
              >
                Yes
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-r-md ${
                  pickAndGoFilter === "no" ? "bg-blue-50 text-blue-700 border-blue-500" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setPickAndGoFilter("no")}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Parking Entry History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("vehicleNumber")}
                >
                  Vehicle Number
                  {sortField === "vehicleNumber" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("vehicleType")}
                >
                  Vehicle Type
                  {sortField === "vehicleType" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("entryTime")}
                >
                  Entry Time
                  {sortField === "entryTime" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("exitTime")}
                >
                  Exit Time
                  {sortField === "exitTime" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("totalAmount")}
                >
                  Amount
                  {sortField === "totalAmount" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pick&Go
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.length > 0 ? (
                sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.vehicleNumber}
                        </div>
                        {!entry.exitTime && (
                          <button
                            onClick={() => handleProcessExit(entry)}
                            disabled={isProcessingExit}
                            aria-label="Quick exit"
                            className="bg-red-100 text-red-800 p-1 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 md:hidden"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getVehicleTypeName(entry.vehicleType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.entryTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.exitTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateDuration(entry.entryTime, entry.exitTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(entry.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {entry.receiptId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.isPickAndGo
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entry.isPickAndGo ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.exitTime
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {entry.exitTime ? "Completed" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handlePrintReceipt(entry)}
                          aria-label={`Print ${entry.exitTime ? "exit" : "entry"} receipt`}
                        >
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9"></polyline>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                              <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Print
                          </span>
                        </Button>
                        
                        {!entry.exitTime && (
                          <Button 
                            size="sm"
                            variant="secondary"
                            onClick={() => handleProcessExit(entry)}
                            disabled={isProcessingExit}
                            aria-label="Process exit"
                          >
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                              </svg>
                              Exit
                            </span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                    No parking entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 