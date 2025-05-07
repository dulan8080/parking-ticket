"use client";

import Link from "next/link";
import UserProfile from "@/components/UserProfile";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("ADMIN");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Parking Logo"
                >
                  <rect x="2" y="5" width="36" height="30" rx="4" fill="#3B82F6" />
                  <text x="11" y="27" fontSize="22" fontWeight="bold" fill="white">P</text>
                </svg>
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  ZynkSlot
                </span>
              </Link>
              
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Home
                </Link>
                
                <Link
                  href="/history"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  History
                </Link>
                
                {isAdmin && (
                  <Link
                    href="/settings"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    Settings
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
} 