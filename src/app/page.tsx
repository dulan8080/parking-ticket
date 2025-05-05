"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import EntryForm from "../components/EntryForm";
import ExitForm from "../components/ExitForm";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import InstallPrompt from "../components/InstallPrompt";
import { registerServiceWorker } from "./register-sw";
import { useParkingContext } from "../context/ParkingContext";
import UserProfile from "../components/UserProfile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"entry" | "exit">("entry");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg 
              width="190" 
              height="40" 
              viewBox="0 0 190 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="ZynkSlot Parking System"
            >
              <rect x="2" y="5" width="36" height="30" rx="4" fill="#3B82F6" />
              <text x="11" y="27" fontSize="22" fontWeight="bold" fill="white">P</text>
              
              <path d="M46 10.5h10.2l-8.5 19h10.8" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M62 29.5l2.5-9.5 2 5.5 2-5.5 2.5 9.5" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M74 29.5l2-19 3 11 3-11 2 19" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M87 29.5v-19l7 19v-19" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M106 10.5h-6v19h6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M99 20h5" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M110 10.5h6c3.8 0 5 3 5 5.5s-1.2 5.5-5 5.5h-6v8" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M125 10.5v19" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M143 10.5c-5.5 0-10 4-10 9.5s4.5 9.5 10 9.5 10-4 10-9.5-4.5-9.5-10-9.5z" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M163 10.5v19h6c4 0 5.5-3 5.5-6s-1.5-6-5.5-6h-6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex space-x-2 items-center">
            {session ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/settings")}
                  aria-label="Settings"
                  className="flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/history")}
                  aria-label="View parking history"
                >
                  History
                </Button>
                <UserProfile session={session} />
              </>
            ) : (
              <UserProfile session={null} />
            )}
          </div>
        </header>

        {session ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-6 flex justify-center">
              <div className="relative bg-gray-200 rounded-full h-14 p-1 shadow-inner w-full max-w-xs">
                <button
                  onClick={() => setActiveTab("entry")}
                  className={`absolute inset-y-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center text-base font-medium w-[calc(50%-2px)] ${
                    activeTab === "entry"
                      ? "bg-green-500 text-white shadow-md translate-x-0"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  ENTRY
                </button>
                <button
                  onClick={() => setActiveTab("exit")}
                  className={`absolute inset-y-1 right-1 rounded-full transition-all duration-300 flex items-center justify-center text-base font-medium w-[calc(50%-2px)] ${
                    activeTab === "exit"
                      ? "bg-red-500 text-white shadow-md translate-x-0"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  EXIT
                </button>
              </div>
            </div>

            {activeTab === "entry" ? <EntryForm /> : <ExitForm />}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Parking Management</h1>
            <p className="mb-6">Please login to access the parking system.</p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => router.push("/login")}
                variant="primary"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push("/register")}
                variant="outline"
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </div>
      <InstallPrompt />
    </main>
  );
}
