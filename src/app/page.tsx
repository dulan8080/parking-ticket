"use client";

import { useState } from "react";
import Link from "next/link";
import EntryForm from "../components/EntryForm";
import ExitForm from "../components/ExitForm";
import Button from "../components/ui/Button";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"entry" | "exit">("entry");

  return (
    <div className="container mx-auto px-4 py-6 max-w-md min-h-screen flex flex-col">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parking Ticket System</h1>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </header>

      <div className="tab-container mb-4">
        <div className="flex border-b border-gray-300">
          <button
            className={`py-2 px-4 text-center flex-1 ${
              activeTab === "entry"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("entry")}
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
          >
            Vehicle Exit
          </button>
        </div>
      </div>

      <div className="flex-grow">
        {activeTab === "entry" ? <EntryForm /> : <ExitForm />}
      </div>

      <footer className="py-4 mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Parking Ticket System. All rights reserved.</p>
      </footer>
    </div>
  );
}
