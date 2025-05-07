"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ParkingEntry } from "@/types";

function HistoryContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<ParkingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the userId from the search params (will be set by middleware for non-admin users)
  const userId = searchParams.get("userId");
  const isAdmin = session?.user?.roles?.includes("ADMIN");
  
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        // Build the API URL with the userId if provided
        let url = "/api/parking-entries";
        if (userId) {
          url += `?userId=${userId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        setEntries(data.entries || []);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Failed to load parking history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user) {
      fetchEntries();
    }
  }, [session, userId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Parking History</h1>
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Parking History</h1>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parking History</h1>
        {isAdmin && !userId && (
          <div className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            Viewing all entries (Admin)
          </div>
        )}
        {userId && (
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Showing your entries only
          </div>
        )}
      </div>
      
      {entries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
          <p className="text-gray-500">No parking history available</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exit Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => {
                  const entryTime = new Date(entry.entryTime);
                  const exitTime = entry.exitTime ? new Date(entry.exitTime) : null;
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof entry.vehicleType === 'string' 
                          ? entry.vehicleType 
                          : entry.vehicleType?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(entryTime, 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exitTime 
                          ? format(exitTime, 'MMM d, yyyy h:mm a')
                          : <span className="text-blue-600">Not exited</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.duration 
                          ? `${entry.duration} hr${entry.duration !== 1 ? 's' : ''}`
                          : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {entry.totalAmount 
                          ? `₹${entry.totalAmount.toFixed(2)}`
                          : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback UI
function HistorySkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Parking History</h1>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-10 bg-gray-200 rounded-t" />
          <div className="space-y-4 p-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-12 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function HistoryPage() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryContent />
    </Suspense>
  );
} 