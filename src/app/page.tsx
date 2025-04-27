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
          <h1 className="text-2xl font-bold text-center">Parking Ticket System</h1>
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
        
        <div className="flex border-b border-gray-300">
          <button
            className={`py-2 px-4 text-center flex-1 ${
              activeTab === "entry"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("entry")}
            aria-label="Switch to Vehicle Entry"
            tabIndex={0}
          >
            Vehicle Entry
          </button>
          <button
            className={`py-2 px-4 text-center flex-1 ${
              activeTab === "exit"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("exit")}
            aria-label="Switch to Vehicle Exit"
            tabIndex={0}
          >
            Vehicle Exit
          </button>
        </div>
        
        {activeTab === "entry" ? <EntryForm /> : <ExitForm />}
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2023 Parking Ticket System</p>
        </footer>
      </div>
    </main>
  );
}
