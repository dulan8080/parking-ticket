"use client";

import { useState, useEffect } from "react";
import EntryForm from "../components/EntryForm";
import ExitForm from "../components/ExitForm";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import InstallPrompt from "../components/InstallPrompt";
import { registerServiceWorker } from "./register-sw";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"entry" | "exit">("entry");
  const router = useRouter();

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
          <Button
            variant="secondary"
            onClick={() => router.push("/history")}
            aria-label="View parking history"
          >
            History
          </Button>
        </header>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("entry")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "entry"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={activeTab === "entry" ? "page" : undefined}
              >
                Entry
              </button>
              <button
                onClick={() => setActiveTab("exit")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "exit"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={activeTab === "exit" ? "page" : undefined}
              >
                Exit
              </button>
            </nav>
          </div>

          {activeTab === "entry" ? <EntryForm /> : <ExitForm />}
        </div>
      </div>
      <InstallPrompt />
    </main>
  );
}
