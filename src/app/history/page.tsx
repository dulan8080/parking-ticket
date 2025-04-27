"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useParkingContext } from "../../context/ParkingContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function HistoryPage() {
  const router = useRouter();
  const { parkingEntries, vehicleTypes, deleteVehicleType } = useParkingContext();
  const [activeTab, setActiveTab] = useState<"entries" | "vehicles">("entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("entryTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filter entries based on search term
  const filteredEntries = searchTerm
    ? parkingEntries.filter(
        (entry) =>
          entry.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof entry.vehicleType === "object"
            ? entry.vehicleType.name.toLowerCase().includes(searchTerm.toLowerCase())
            : entry.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          entry.receiptId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : parkingEntries;
    
  // Filter vehicles based on search term
  const filteredVehicles = searchTerm
    ? vehicleTypes.filter(
        (vehicle) => vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : vehicleTypes;
  
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
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  // Get vehicle type name with proper handling of different data types
  const getVehicleTypeName = (type: string | any) => {
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
    } catch (error) {
      return "Error";
    }
  };
  
  // Get the count of active entries for a vehicle type
  const getActiveEntryCount = (vehicleTypeId: string) => {
    return parkingEntries.filter(
      entry => 
        (typeof entry.vehicleType === 'object' ? entry.vehicleType.id : entry.vehicleType) === vehicleTypeId && 
        !entry.exitTime
    ).length;
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking History</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          <button
            className={`py-2 px-4 text-center flex-1 ${
              activeTab === "entries"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("entries")}
          >
            Parking Entries
          </button>
          <button
            className={`py-2 px-4 text-center flex-1 ${
              activeTab === "vehicles"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("vehicles")}
          >
            Vehicle Types
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder={`Search ${activeTab === "entries" ? "by vehicle number, type or receipt ID" : "by vehicle type name"}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        {activeTab === "entries" ? (
          <>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.vehicleNumber}
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
                            {entry.totalAmount ? `₹${entry.totalAmount}` : "—"}
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
                              entry.exitTime
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {entry.exitTime ? "Completed" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No parking entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Vehicle Types</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Hour Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Entries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-gray-700">
                              {getVehicleIcon(vehicle.name)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.rates.find(r => r.hour === 1)?.price
                              ? `₹${vehicle.rates.find(r => r.hour === 1)?.price}`
                              : "Not set"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getActiveEntryCount(vehicle.id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.createdAt ? formatDate(vehicle.createdAt) : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => router.push(`/settings`)}
                            >
                              Edit Rates
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (getActiveEntryCount(vehicle.id) > 0) {
                                  alert("Cannot delete vehicle type with active entries");
                                  return;
                                }
                                if (confirm("Are you sure you want to delete this vehicle type?")) {
                                  deleteVehicleType(vehicle.id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No vehicle types found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// Function to get vehicle icon based on name
const getVehicleIcon = (name: string) => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('car')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    );
  }
  
  if (lowercaseName.includes('bike') || lowercaseName.includes('motorcycle')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6h5v4h-5zM6 9h5.79a2 2 0 0 0 1.76-1.05L15 6" />
        <path d="M8 17h7.1a2 2 0 0 0 1.66-.9l3.8-5.7a2 2 0 0 0 .2-.8m-8.26 0-1.87 5.6a2 2 0 0 1-1.9 1.4h-.63" />
      </svg>
    );
  }
  
  if (lowercaseName.includes('scooter')) {
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
  
  if (lowercaseName.includes('bicycle') || lowercaseName.includes('cycle')) {
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
  
  if (lowercaseName.includes('van')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4V5H3a1 1 0 0 0-1 1v10h2" />
        <path d="M14 5v12h7a1 1 0 0 0 1-1V9.5c0-.3-.1-.5-.3-.7l-3-3a1 1 0 0 0-.7-.3H14Z" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    );
  }
  
  if (lowercaseName.includes('truck')) {
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
  
  if (lowercaseName.includes('bus')) {
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