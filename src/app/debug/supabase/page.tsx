'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/debug/supabase');
        const data = await response.json();
        setConnectionStatus(data);
      } catch (err) {
        setError('Failed to check Supabase connection. Server error.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/debug/database" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Database Debug
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Supabase Connection Debug</h1>
      
      {isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700">Checking Supabase connection...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-red-600 font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus?.status === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus?.status === 'success' ? 'Connected' : 'Connection Failed'}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Connection Details</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p><strong>Environment:</strong> {connectionStatus?.connection_info?.env}</p>
              <p><strong>Runtime:</strong> {connectionStatus?.connection_info?.runtime}</p>
              <p><strong>DATABASE_URL:</strong> {connectionStatus?.connection_info?.database_url_set ? 'Set' : 'Not set'}</p>
              <p><strong>DIRECT_URL:</strong> {connectionStatus?.connection_info?.direct_url_set ? 'Set' : 'Not set'}</p>
              <p><strong>Using Mock Data:</strong> {connectionStatus?.using_mock_data ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {connectionStatus?.status === 'success' && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Database Tables</h2>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <ul className="space-y-1">
                  <li><strong>Vehicle Types:</strong> {connectionStatus?.table_counts?.vehicle_types}</li>
                  <li><strong>Users:</strong> {connectionStatus?.table_counts?.users}</li>
                  <li><strong>Parking Entries:</strong> {connectionStatus?.table_counts?.parking_entries}</li>
                  <li><strong>Roles:</strong> {connectionStatus?.table_counts?.roles}</li>
                </ul>
              </div>
            </div>
          )}

          {connectionStatus?.status === 'error' && (
            <div className="mt-4 bg-red-50 p-4 rounded border border-red-200">
              <h2 className="text-lg font-semibold mb-2 text-red-600">Error Details</h2>
              <p className="text-gray-700">{connectionStatus?.message}</p>
              {connectionStatus?.error && (
                <pre className="mt-2 p-2 bg-red-100 rounded text-sm overflow-x-auto">
                  {connectionStatus.error}
                </pre>
              )}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Troubleshooting Steps</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Check Environment Variables</h3>
                <p className="text-gray-700">
                  Make sure your Supabase connection strings are properly set in your Vercel environment variables.
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <code className="text-sm">DATABASE_URL=postgresql://postgres:password@db.project-id.supabase.co:5432/postgres</code>
                </div>
                <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                  <code className="text-sm">DIRECT_URL=postgresql://postgres:password@db.project-id.supabase.co:5432/postgres</code>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">2. Run Database Migrations</h3>
                <p className="text-gray-700">
                  If your database is connected but empty, you need to run migrations:
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <code className="text-sm">npx prisma migrate deploy</code>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">3. Seed Initial Data</h3>
                <p className="text-gray-700">
                  After migrations, seed your database with initial data:
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <code className="text-sm">npx prisma db seed</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 