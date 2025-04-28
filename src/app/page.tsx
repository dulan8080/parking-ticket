"use client";

import { useState } from "react";
import EntryForm from "../components/EntryForm";
import ExitForm from "../components/ExitForm";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"entry" | "exit">("entry");
  const router = useRouter();

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
              <path d="M127 10.5v19" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M134 29.5c4 0 6-3 6-7s-2-7-6-7c4 0 6-3 6-5h-6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M145 10.5v19h6l-6-9.5h10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M160 10.5v19" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              <path d="M168 21.5c0 6.8 10 6.8 10 0s-10-6.8-10 0z" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M182 10.5v19" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M187 29.5c-5 0-5-19 0-19" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/history")}
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              History
            </Button>
          </div>
        </header>
        
        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <label 
              htmlFor="toggle-switch" 
              className={`mr-3 font-medium text-lg ${activeTab === "entry" ? "text-green-600" : "text-gray-500"}`}
            >
              Vehicle Entry
            </label>
            
            <div className="relative inline-block w-16 h-8 transition duration-200 ease-in-out">
              <input
                id="toggle-switch"
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={activeTab === "exit"}
                onChange={() => setActiveTab(activeTab === "entry" ? "exit" : "entry")}
                aria-label={`Switch to ${activeTab === "entry" ? "Vehicle Exit" : "Vehicle Entry"}`}
              />
              <label
                htmlFor="toggle-switch"
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                  activeTab === "exit" ? "bg-red-500" : "bg-green-500"
                }`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveTab(activeTab === "entry" ? "exit" : "entry");
                  }
                }}
              >
                <span 
                  className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md transform ${
                    activeTab === "exit" ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </label>
            </div>
            
            <label 
              htmlFor="toggle-switch" 
              className={`ml-3 font-medium text-lg ${activeTab === "exit" ? "text-red-600" : "text-gray-500"}`}
            >
              Vehicle Exit
            </label>
          </div>
          
          <div className={`text-sm font-medium text-center transition-opacity duration-200 ${
            activeTab === "entry" ? "opacity-100" : "opacity-0"
          }`}>
            <span className="text-green-600">Record a new vehicle entering the parking lot</span>
          </div>
          
          <div className={`text-sm font-medium text-center transition-opacity duration-200 ${
            activeTab === "exit" ? "opacity-100" : "opacity-0"
          }`}>
            <span className="text-red-600">Process a vehicle exiting the parking lot</span>
          </div>
        </div>
        
        <div className="transition-opacity duration-300 ease-in-out">
          {activeTab === "entry" ? <EntryForm /> : <ExitForm />}
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© ZynkSlot by Zynknet Technology Solutions 2025</p>
        </footer>
      </div>
    </main>
  );
}
