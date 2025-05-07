"use client";

import { useSession, signOut } from "next-auth/react";
import Button from "./ui/Button";
import { useState } from "react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (status === "loading") {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
  }
  
  if (!session?.user) {
    return null;
  }
  
  const isAdmin = session.user.roles?.includes("ADMIN");
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };
  
  const userInitial = session.user.name?.charAt(0) || "U";
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-semibold transition-all hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="User profile menu"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        {userInitial}
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-3 px-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isAdmin ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
              }`}>
                {isAdmin ? "Admin" : "Operator"}
              </span>
            </div>
          </div>
          <div className="py-2">
            <Button
              onClick={handleLogout}
              className="w-full justify-center rounded-none bg-white text-red-600 hover:bg-red-50 py-2"
              type="button"
            >
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 