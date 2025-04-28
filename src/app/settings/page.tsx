"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { useParkingContext } from "../../context/ParkingContext";
import { HourlyRate } from "../../types";

// Icons for different vehicle types
const vehicleIcons = {
  car: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  bike: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h5v4h-5zM6 9h5.79a2 2 0 0 0 1.76-1.05L15 6" />
      <path d="M8 17h7.1a2 2 0 0 0 1.66-.9l3.8-5.7a2 2 0 0 0 .2-.8m-8.26 0-1.87 5.6a2 2 0 0 1-1.9 1.4h-.63" />
    </svg>
  ),
  truck: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <path d="M14 17h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  bus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
      <circle cx="7" cy="18" r="2" />
      <path d="M9 18h5" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  ),
  van: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17h4V5H3a1 1 0 0 0-1 1v10h2" />
      <path d="M14 5v12h7a1 1 0 0 0 1-1V9.5c0-.3-.1-.5-.3-.7l-3-3a1 1 0 0 0-.7-.3H14Z" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  scooter: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="17" r="4" />
      <path d="M19 17h-5.3a1 1 0 0 1-.5-1.8L18 11.5" />
      <path d="M14 9V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
      <path d="M6 15V9" />
      <path d="M4.5 12h1.5" />
      <path d="M17 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
    </svg>
  ),
  bicycle: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="15" r="4" />
      <circle cx="18" cy="15" r="4" />
      <path d="M6 15 9 6 15 6" />
      <path d="m18 15-6-6" />
      <path d="M6 9h8" />
    </svg>
  ),
  default: (
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
  )
};

export default function SettingsPage() {
  const router = useRouter();
  const { vehicleTypes, addVehicleType, updateVehicleRates, updateVehicleType, deleteVehicleType } = useParkingContext();
  const [newVehicleName, setNewVehicleName] = useState("");
  const [selectedIconType, setSelectedIconType] = useState("car");
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(
    vehicleTypes.length > 0 ? vehicleTypes[0].id : null
  );
  const [rates, setRates] = useState<HourlyRate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingVehicleName, setEditingVehicleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log vehicle types when they change for debugging
  useEffect(() => {
    console.log("Settings: Vehicle types updated:", vehicleTypes);
  }, [vehicleTypes]);

  // Format currency in Sri Lankan Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Load rates when vehicle type changes
  const handleVehicleSelect = (vehicleId: string) => {
    console.log(`Selected vehicle type with ID: ${vehicleId}`);
    
    setActiveVehicleId(vehicleId);
    const selectedVehicle = vehicleTypes.find((vt) => vt.id === vehicleId);
    
    if (selectedVehicle) {
      console.log(`Found vehicle: ${selectedVehicle.name}`, JSON.stringify(selectedVehicle, null, 2));
      
      // Make sure we have rates for all 24 hours
      const updatedRates: HourlyRate[] = [];
      for (let i = 1; i <= 24; i++) {
        const existingRate = selectedVehicle.rates.find((r) => r.hour === i);
        updatedRates.push(existingRate || { hour: i, price: 0 });
      }
      
      console.log(`Prepared rates for UI:`, JSON.stringify(updatedRates, null, 2));
      setRates(updatedRates);
    } else {
      console.error(`Vehicle with ID ${vehicleId} not found in the available types`);
    }
  };

  // Add new vehicle type
  const handleAddVehicle = async () => {
    if (!newVehicleName.trim()) {
      setError("Vehicle name is required");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Pass the custom icon if the selected icon type is "custom"
      const iconToSave = selectedIconType === "custom" ? customIcon : null;
      
      // Add the vehicle type with the name and the custom icon
      await addVehicleType(newVehicleName, iconToSave);
      
      // Reset the form fields
      setNewVehicleName("");
      setCustomIcon(null);
      setSelectedIconType("car");
    } catch (err) {
      console.error("Settings: Error adding vehicle type:", err);
      setError(err instanceof Error ? err.message : "Failed to add vehicle type");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomIcon(event.target.result as string);
          setSelectedIconType("custom");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get icon for vehicle type
  const getVehicleIcon = (vehicleType: any) => {
    // If the vehicle type has a custom icon URL, use it
    if (vehicleType.iconUrl) {
      // Check if it's a data URI
      if (vehicleType.iconUrl.startsWith('data:')) {
        return (
          <img 
            src={vehicleType.iconUrl} 
            alt={vehicleType.name} 
            width={24} 
            height={24} 
            className="w-6 h-6 object-contain" 
          />
        );
      }
      
      // Otherwise use the Next.js Image component for static paths
      return (
        <Image 
          src={vehicleType.iconUrl} 
          alt={vehicleType.name} 
          width={24} 
          height={24} 
          className="w-6 h-6 object-contain" 
        />
      );
    }
    
    // Otherwise, use the default icons based on name
    const name = vehicleType.name.toLowerCase();
    
    if (name.includes('car')) return vehicleIcons.car;
    if (name.includes('bike') || name.includes('motorcycle')) return vehicleIcons.bike;
    if (name.includes('truck')) return vehicleIcons.truck;
    if (name.includes('bus')) return vehicleIcons.bus;
    if (name.includes('van')) return vehicleIcons.van;
    if (name.includes('scooter')) return vehicleIcons.scooter;
    if (name.includes('bicycle') || name.includes('cycle')) return vehicleIcons.bicycle;
    
    return vehicleIcons.default;
  };

  // Update rate for a specific hour
  const handleRateChange = (hour: number, price: string) => {
    const numericPrice = parseInt(price) || 0;
    setRates(
      rates.map((rate) =>
        rate.hour === hour ? { ...rate, price: numericPrice } : rate
      )
    );
  };

  // Save rates for current vehicle
  const handleSaveRates = async () => {
    if (activeVehicleId) {
      console.log(`Saving rates for vehicle ID: ${activeVehicleId}`);
      console.log(`Rates to save:`, JSON.stringify(rates, null, 2));
      
      try {
        await updateVehicleRates(activeVehicleId, rates);
        console.log(`Rates saved successfully for vehicle ID: ${activeVehicleId}`);
        alert("Rates saved successfully!");
      } catch (error) {
        console.error(`Error saving rates:`, error);
        alert(`Failed to save rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.error("Cannot save rates: No active vehicle selected");
      alert("Please select a vehicle type first");
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = (id: string, name: string) => {
    setEditingVehicleId(id);
    setEditingVehicleName(name);
  };

  // Handle save edited vehicle name
  const handleSaveEditedVehicle = async () => {
    if (editingVehicleId && editingVehicleName.trim()) {
      try {
        await updateVehicleType(editingVehicleId, editingVehicleName);
        setEditingVehicleId(null);
        setEditingVehicleName("");
      } catch (error) {
        console.error("Error updating vehicle type:", error);
        alert(`Failed to update vehicle type: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingVehicleId(null);
    setEditingVehicleName("");
  };

  // Handle delete vehicle
  const handleDeleteVehicle = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle type?")) {
      deleteVehicleType(id);
      if (activeVehicleId === id) {
        setActiveVehicleId(vehicleTypes.length > 0 ? vehicleTypes[0].id : null);
      }
      if (editingVehicleId === id) {
        setEditingVehicleId(null);
        setEditingVehicleName("");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Button 
        variant="outline" 
        onClick={() => router.push("/")}
        className="mb-6"
      >
        Back to Home
      </Button>
      
      {/* Add debug information */}
      <div className="mb-4 p-2 bg-gray-100 text-xs">
        <p>Vehicle Types Count: {vehicleTypes.length}</p>
        <details>
          <summary>Debug Info</summary>
          <pre className="overflow-auto max-h-40 p-2 bg-gray-800 text-white">
            {JSON.stringify({ vehicleTypes }, null, 2)}
          </pre>
        </details>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-500 rounded">
          {error}
        </div>
      )}
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Vehicle Type</h2>
        <div className="mb-4">
          <Input
            placeholder="Vehicle Type Name"
            value={newVehicleName}
            onChange={(e) => setNewVehicleName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Icon Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
            <button 
              type="button"
              onClick={() => setSelectedIconType("car")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "car" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.car}</div>
              <span className="text-xs mt-1">Car</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("bike")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "bike" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.bike}</div>
              <span className="text-xs mt-1">Motorcycle</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("scooter")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "scooter" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.scooter}</div>
              <span className="text-xs mt-1">Scooter</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("bicycle")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "bicycle" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.bicycle}</div>
              <span className="text-xs mt-1">Bicycle</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("van")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "van" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.van}</div>
              <span className="text-xs mt-1">Van</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("truck")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "truck" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.truck}</div>
              <span className="text-xs mt-1">Truck</span>
            </button>
            <button 
              type="button"
              onClick={() => setSelectedIconType("bus")}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "bus" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="text-gray-700">{vehicleIcons.bus}</div>
              <span className="text-xs mt-1">Bus</span>
            </button>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 border rounded-lg flex flex-col items-center ${selectedIconType === "custom" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              {customIcon ? (
                <Image src={customIcon} alt="Custom icon" width={24} height={24} className="w-6 h-6 object-contain" />
              ) : (
                <div className="text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                  </svg>
                </div>
              )}
              <span className="text-xs mt-1">Custom</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAddVehicle} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Vehicle Type"}
        </Button>
      </Card>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Vehicle Types</h2>
        
        {vehicleTypes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {vehicleTypes.map((vt) => (
              <div 
                key={vt.id} 
                className="border rounded-lg p-3 flex flex-col items-center"
              >
                <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
                  {getVehicleIcon(vt)}
                </div>
                
                {editingVehicleId === vt.id ? (
                  <div className="w-full">
                    <Input
                      value={editingVehicleName}
                      onChange={(e) => setEditingVehicleName(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex space-x-1 mt-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveEditedVehicle}
                        className="text-xs flex-1 py-1"
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="text-xs flex-1 py-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm">{vt.name}</span>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditVehicle(vt.id, vt.name)}
                        className="text-xs text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vt.id)}
                        className="text-xs text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No vehicle types added yet.
          </p>
        )}
      </Card>
      
      {vehicleTypes.length > 0 ? (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Configure Hourly Rates</h2>
          
          <div className="mb-4">
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={activeVehicleId || ""}
              onChange={(e) => handleVehicleSelect(e.target.value)}
            >
              {vehicleTypes.map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name}
                </option>
              ))}
            </select>
          </div>
          
          {activeVehicleId && (
            <>
              <div className="mb-4 overflow-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Hour</th>
                      <th className="border border-gray-300 p-2 text-left">Price (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate) => (
                      <tr key={rate.hour}>
                        <td className="border border-gray-300 p-2">
                          {rate.hour === 1 ? "1st hour" : `${rate.hour}${rate.hour <= 3 ? ["nd", "rd"][rate.hour - 2] : "th"} hour`}
                        </td>
                        <td className="border border-gray-300 p-2 relative">
                          <div className="flex items-center">
                            <span className="absolute left-3 text-gray-500">LKR</span>
                            <Input
                              type="number"
                              value={rate.price}
                              onChange={(e) => handleRateChange(rate.hour, e.target.value)}
                              min={0}
                              className="mb-0 pl-12"
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(rate.price)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between">
                <Button onClick={handleSaveRates}>Save Rates</Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteVehicle(activeVehicleId)}
                >
                  Delete Vehicle Type
                </Button>
              </div>
            </>
          )}
        </Card>
      ) : null}
    </div>
  );
} 