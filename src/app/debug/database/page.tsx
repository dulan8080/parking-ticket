"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DatabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        setLoading(true);
        const res = await fetch("/api/debug/connection");
        const data = await res.json();
        setConnectionStatus(data);
      } catch (err) {
        setError("Failed to fetch connection status");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  const handleSeedDatabase = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/seed");
      const data = await res.json();
      alert(data.message);
      // Refresh connection status
      const newRes = await fetch("/api/debug/connection");
      const newData = await newRes.json();
      setConnectionStatus(newData);
    } catch (err) {
      setError("Failed to seed database");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold">Database Connection Diagnostic</h1>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-600">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  connectionStatus?.status === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <h2 className="text-lg font-semibold">
                Database Connection Status: {connectionStatus?.status}
              </h2>
            </div>

            <div className="text-gray-700 mb-6">
              <p className="mb-2">
                <strong>Connection Type:</strong> {connectionStatus?.connection}
              </p>
              <p className="mb-2">
                <strong>DATABASE_URL:</strong> {connectionStatus?.databaseUrl}
              </p>
              <p className="mb-2">
                <strong>DIRECT_URL:</strong> {connectionStatus?.directUrl}
              </p>
              
              {connectionStatus?.tables && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Table Data:</p>
                  <ul className="ml-4 list-disc">
                    <li>Vehicle Types: {connectionStatus.tables.vehicleTypes}</li>
                    <li>Parking Entries: {connectionStatus.tables.parkingEntries}</li>
                  </ul>
                </div>
              )}

              {connectionStatus?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  <p className="font-medium">Error Message:</p>
                  <p className="font-mono text-sm">{connectionStatus.error}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {connectionStatus?.status === "success" && connectionStatus?.tables?.vehicleTypes === 0 && (
                <button
                  onClick={handleSeedDatabase}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow transition-colors"
                >
                  Seed Database with Default Vehicle Types
                </button>
              )}

              <button
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow transition-colors"
              >
                {showTroubleshooting ? "Hide Troubleshooting Tips" : "Show Troubleshooting Tips"}
              </button>
            </div>
          </div>
        )}

        {showTroubleshooting && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Troubleshooting Tips</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">1. Check Environment Variables</h3>
              <p className="text-gray-700">
                Make sure your Supabase connection details are properly set in your environment variables. You need both:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-700">
                <li><code className="bg-gray-100 px-1 rounded">DATABASE_URL</code> - Your Supabase PostgreSQL connection string</li>
                <li><code className="bg-gray-100 px-1 rounded">DIRECT_URL</code> - Direct connection URL for Prisma (often the same as DATABASE_URL)</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">2. Check Supabase Status</h3>
              <p className="text-gray-700">
                Make sure your Supabase project is active and the database is running.
                Verify you're using the correct connection strings from the Supabase dashboard.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">3. Database Schema</h3>
              <p className="text-gray-700">
                If you're connecting but have no data, you might need to run migrations:
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                npx prisma migrate deploy
              </pre>
              <p className="text-gray-700 mt-2">
                Or generate the client after schema changes:
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                npx prisma generate
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. If Using Mock Data</h3>
              <p className="text-gray-700">
                If you see "Using mock Prisma client", it means the application is using the fallback mock data service.
                This happens when the database connection fails or isn't configured.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 