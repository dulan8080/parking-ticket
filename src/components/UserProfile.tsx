"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { Session } from "next-auth";

interface UserProfileProps {
  session: Session | null;
}

const UserProfile = ({ session }: UserProfileProps) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  
  if (!session) {
    return (
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={() => router.push("/login")}
          size="sm"
        >
          Login
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/register")}
          size="sm"
        >
          Register
        </Button>
      </div>
    );
  }
  
  // Check if user is admin
  const isAdmin = session.user?.roles?.includes("ADMIN");
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          {session.user?.name?.[0] || "U"}
        </div>
        <span className="text-sm font-medium hidden md:block">
          {session.user?.name}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 hidden md:block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {showMenu && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          onClick={() => setShowMenu(false)}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
            <div className="mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {isAdmin ? "Admin" : "Operator"}
              </span>
            </div>
          </div>
          
          <a
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a>
          
          <a
            href="/history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            History
          </a>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 