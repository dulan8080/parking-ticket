"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { VehicleType, HourlyRate } from "@/types";

interface RateInput {
  hour: number;
  price: number;
}

const DEFAULT_RATES: RateInput[] = [
  { hour: 1, price: 0 },
  { hour: 2, price: 0 },
  { hour: 3, price: 0 },
  { hour: 4, price: 0 },
  { hour: 5, price: 0 },
  { hour: 6, price: 0 },
  { hour: 7, price: 0 },
  { hour: 8, price: 0 },
  { hour: 9, price: 0 },
  { hour: 10, price: 0 },
  { hour: 11, price: 0 },
  { hour: 12, price: 0 }
];

// Add rate preset types
interface RatePreset {
  name: string;
  pattern: number[];
  description: string;
}

const RATE_PRESETS: RatePreset[] = [
  {
    name: "Linear",
    pattern: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
    description: "Equal increments (₹50/hr)"
  },
  {
    name: "Economy",
    pattern: [30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250],
    description: "Budget-friendly rates"
  },
  {
    name: "Premium",
    pattern: [100, 180, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700],
    description: "Higher rates with early steep increase"
  }
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'operators' | 'vehicles' | 'rates' | 'users'>('operators');
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingRates, setEditingRates] = useState<{ [key: string]: RateInput[] }>({});
  const [editingVehicleType, setEditingVehicleType] = useState<string | null>(null);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [baseRate, setBaseRate] = useState<string>("");
  const [multiplier, setMultiplier] = useState<string>("1");
  const [minuteRate, setMinuteRate] = useState<string>("");
  
  // Check if user is admin
  const isAdmin = session?.user?.roles?.includes("ADMIN");
  
  // Redirect non-admin users
  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/");
    }
  }, [status, isAdmin, router]);
  
  // Load vehicle types and users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load vehicle types
        const vehicleTypesResponse = await fetch('/api/vehicle-types');
        if (vehicleTypesResponse.ok) {
          const data = await vehicleTypesResponse.json();
          setVehicleTypes(data);
        }

        // Load users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load settings data'
        });
      }
    };

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);
  
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will be redirected by the useEffect
  }
  
  const handleCreateOperator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const pin = formData.get("pin") as string;
    
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          pin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create operator");
      }
      
      setMessage({
        type: "success",
        text: "Operator account created successfully",
      });
      
      // Reset form
      e.currentTarget.reset();
      
      // Refresh users list
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error creating operator:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create operator",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateVehicleType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    try {
      // First create the vehicle type
      const response = await fetch("/api/vehicle-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create vehicle type");
      }
      
      // Then set up default rates for the new vehicle type
      const vehicleTypeId = data.id;
      const ratesResponse = await fetch(`/api/vehicle-types/${vehicleTypeId}/rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: DEFAULT_RATES })
      });
      
      if (!ratesResponse.ok) {
        console.warn("Created vehicle type but failed to set up default rates");
      }
      
      setMessage({
        type: "success",
        text: "Vehicle type created successfully",
      });
      
      // Reset form
      e.currentTarget.reset();
      
      // Refresh vehicle types
      const vehicleTypesResponse = await fetch('/api/vehicle-types');
      if (vehicleTypesResponse.ok) {
        const data = await vehicleTypesResponse.json();
        setVehicleTypes(data);
      }
    } catch (error) {
      console.error("Error creating vehicle type:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create vehicle type",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const sortRates = (rates: RateInput[]): RateInput[] => {
    return [...rates].sort((a, b) => a.hour - b.hour);
  };
  
  const startEditingRates = (vehicleType: VehicleType) => {
    // Ensure we have rates for each hour 1-12
    let currentRates = vehicleType.rates || [];
    
    // Check for missing hours and fill with defaults
    const hours = new Set(currentRates.map(r => r.hour));
    const missingRates: RateInput[] = [];
    
    DEFAULT_RATES.forEach(defaultRate => {
      if (!hours.has(defaultRate.hour)) {
        missingRates.push({ ...defaultRate });
      }
    });
    
    // Combine existing and missing rates, then sort by hour
    const combinedRates = sortRates([...currentRates, ...missingRates]);
    
    setEditingVehicleType(vehicleType.id);
    setEditingRates({
      ...editingRates,
      [vehicleType.id]: combinedRates
    });
  };

  const handleRateChange = (vehicleTypeId: string, index: number, field: 'hour' | 'price', value: string) => {
    const newValue = parseInt(value) || 0;
    setEditingRates(prev => ({
      ...prev,
      [vehicleTypeId]: prev[vehicleTypeId].map((rate, i) => 
        i === index ? { ...rate, [field]: newValue } : rate
      )
    }));
  };

  const handleSaveRates = async (vehicleTypeId: string) => {
    try {
      setLoading(true);
      // Sort rates by hour before saving
      const rates = sortRates(editingRates[vehicleTypeId]);
      
      const response = await fetch(`/api/vehicle-types/${vehicleTypeId}/rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates })
      });

      if (!response.ok) {
        throw new Error('Failed to update rates');
      }

      // Refresh vehicle types
      const vehicleTypesResponse = await fetch('/api/vehicle-types');
      if (vehicleTypesResponse.ok) {
        const data = await vehicleTypesResponse.json();
        setVehicleTypes(data);
      }

      setMessage({
        type: 'success',
        text: 'Rates updated successfully'
      });
      setEditingVehicleType(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update rates'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkPrice(e.target.value);
  };

  const applyBulkPrice = (vehicleTypeId: string) => {
    const price = parseInt(bulkPrice) || 0;
    
    setEditingRates(prev => ({
      ...prev,
      [vehicleTypeId]: prev[vehicleTypeId].map(rate => ({
        ...rate,
        price
      }))
    }));
    
    // Clear the bulk price input after applying
    setBulkPrice("");
  };

  const handleBaseRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseRate(e.target.value);
  };

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiplier(e.target.value);
  };

  const applyProgressiveRates = (vehicleTypeId: string) => {
    const base = parseInt(baseRate) || 0;
    const mult = parseFloat(multiplier) || 1;
    
    setEditingRates(prev => ({
      ...prev,
      [vehicleTypeId]: prev[vehicleTypeId].map(rate => ({
        ...rate,
        price: Math.round(base * Math.pow(mult, rate.hour - 1))
      }))
    }));
    
    // Clear the inputs after applying
    setBaseRate("");
    setMultiplier("1");
  };

  const applyRatePreset = (vehicleTypeId: string, presetIndex: number) => {
    const preset = RATE_PRESETS[presetIndex];
    
    setEditingRates(prev => ({
      ...prev,
      [vehicleTypeId]: prev[vehicleTypeId].map((rate, index) => ({
        ...rate,
        price: preset.pattern[index] || 0
      }))
    }));
  };

  const handleMinuteRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinuteRate(e.target.value);
  };

  const applyMinuteRates = (vehicleTypeId: string) => {
    const rate = parseFloat(minuteRate) || 0;
    
    setEditingRates(prev => ({
      ...prev,
      [vehicleTypeId]: prev[vehicleTypeId].map(rateEntry => ({
        ...rateEntry,
        price: Math.round(rate * rateEntry.hour * 60) // Convert to per minute pricing
      }))
    }));
    
    // Clear input
    setMinuteRate("");
  };
  
  const renderRatesTab = () => (
    <div className="grid grid-cols-1 gap-6">
      {vehicleTypes.map((type) => (
        <Card key={type.id}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{type.name}</h3>
            {editingVehicleType !== type.id ? (
              <Button
                onClick={() => startEditingRates(type)}
                className="text-sm"
              >
                Edit Rates
              </Button>
            ) : (
              <div className="space-x-2">
                <Button
                  onClick={() => handleSaveRates(type.id)}
                  className="text-sm bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingVehicleType(null)}
                  className="text-sm bg-gray-500 hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {editingVehicleType === type.id ? (
              // Editing mode
              <div>
                {/* Individual hourly rates */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-4 flex items-center">
                    <span className="mr-2">Set Price for Each Hour</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Individual Pricing</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {editingRates[type.id]?.map((rate, index) => (
                      <div key={index} className="p-3 border rounded-md bg-gray-50 hover:bg-white transition-colors">
                        <div className="mb-2 font-medium text-sm">Hour {rate.hour}</div>
                        <div className="flex gap-2 items-center">
                          <span className="text-gray-700">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={rate.price}
                            onChange={(e) => handleRateChange(type.id, index, 'price', e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bulk editing tools */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                  <h4 className="text-md font-semibold text-gray-700 mb-4">Bulk Rate Tools</h4>
                  
                  {/* Flat rate for all hours */}
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Set Flat Rate</h5>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Input
                          label="Price for all hours (₹)"
                          type="number"
                          min="0"
                          value={bulkPrice}
                          onChange={handleBulkPriceChange}
                          placeholder="Enter price"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={() => applyBulkPrice(type.id)}
                        className="text-sm bg-blue-600 hover:bg-blue-700"
                        disabled={loading || bulkPrice === ""}
                      >
                        Apply to All
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progressive pricing */}
                  <div className="mb-6 pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Progressive Pricing</h5>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Input
                          label="Base Rate (₹)"
                          type="number"
                          min="0"
                          value={baseRate}
                          onChange={handleBaseRateChange}
                          placeholder="Starting rate"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label="Multiplier"
                          type="number"
                          min="1"
                          step="0.1"
                          value={multiplier}
                          onChange={handleMultiplierChange}
                          placeholder="e.g. 1.5"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={() => applyProgressiveRates(type.id)}
                        className="text-sm bg-purple-600 hover:bg-purple-700"
                        disabled={loading || baseRate === ""}
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Formula: Base Rate × (Multiplier ^ (Hour - 1))
                    </p>
                  </div>
                  
                  {/* Per-minute pricing */}
                  <div className="mb-6 pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Per-Minute Pricing</h5>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Input
                          label="Per-Minute Rate (₹)"
                          type="number"
                          min="0"
                          step="0.01"
                          value={minuteRate}
                          onChange={handleMinuteRateChange}
                          placeholder="e.g. 0.50 per minute"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={() => applyMinuteRates(type.id)}
                        className="text-sm bg-teal-600 hover:bg-teal-700"
                        disabled={loading || minuteRate === ""}
                      >
                        Calculate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Calculates total price based on minutes: Rate × Minutes
                    </p>
                  </div>
                  
                  {/* Rate presets */}
                  <div className="pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Rate Presets</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {RATE_PRESETS.map((preset, index) => (
                        <button
                          key={preset.name}
                          onClick={() => applyRatePreset(type.id, index)}
                          className="p-3 border rounded-md text-left hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          <div className="font-medium text-sm">{preset.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {type.rates?.map((rate) => (
                  <div key={rate.hour} className="flex justify-between items-center p-3 border rounded-md">
                    <span className="text-gray-600">{rate.hour} hour{rate.hour !== 1 ? 's' : ''}</span>
                    <span className="font-medium">₹{rate.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b">
          <Button
            onClick={() => setActiveTab("operators")}
            className={`px-4 py-2 rounded-t-md transition-colors ${
              activeTab === "operators" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Operators
          </Button>
          <Button
            onClick={() => setActiveTab("vehicles")}
            className={`px-4 py-2 rounded-t-md transition-colors ${
              activeTab === "vehicles" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Vehicle Types
          </Button>
          <Button
            onClick={() => setActiveTab("rates")}
            className={`px-4 py-2 rounded-t-md transition-colors ${
              activeTab === "rates" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hourly Rates
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-t-md transition-colors ${
              activeTab === "users" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Users
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === "operators" && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Create Operator Account</h2>
            <form onSubmit={handleCreateOperator}>
              <Input
                label="Name"
                name="name"
                placeholder="Operator Name"
                required
                disabled={loading}
                className="mb-4"
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="operator@example.com"
                required
                disabled={loading}
                className="mb-4"
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                disabled={loading}
                className="mb-4"
              />
              
              <Input
                label="PIN (4 digits)"
                name="pin"
                placeholder="Enter 4-digit PIN"
                pattern="[0-9]{4}"
                maxLength={4}
                required
                disabled={loading}
                className="mb-6"
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Operator"}
              </Button>
            </form>
          </Card>
        )}
        
        {activeTab === "vehicles" && (
          <>
            <Card>
              <h2 className="text-lg font-semibold mb-4">Create Vehicle Type</h2>
              <form onSubmit={handleCreateVehicleType}>
                <Input
                  label="Name"
                  name="name"
                  placeholder="Vehicle Type Name"
                  required
                  disabled={loading}
                  className="mb-4"
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Vehicle Type"}
                </Button>
              </form>
            </Card>
            
            <Card>
              <h2 className="text-lg font-semibold mb-4">Vehicle Types</h2>
              <div className="space-y-4">
                {vehicleTypes.map((type) => (
                  <div
                    key={type.id}
                    className="p-4 border rounded-md"
                  >
                    <h3 className="font-medium">{type.name}</h3>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
        
        {activeTab === "rates" && (
          <div className="col-span-2">
            {renderRatesTab()}
          </div>
        )}
        
        {activeTab === "users" && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">User List</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-sm">
                      {user.roles?.map((role: any) => (
                        <span
                          key={role.role.name}
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            role.role.name === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {role.role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        <Card>
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Admin User</h3>
              <p className="mt-1 text-sm text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Environment</h3>
              <p className="mt-1 text-sm text-gray-900">
                {process.env.NODE_ENV === "production" ? "Production" : "Development"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Database</h3>
              <p className="mt-1 text-sm text-gray-900">
                {process.env.DATABASE_URL ? "Connected" : "Using Mock Data"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 