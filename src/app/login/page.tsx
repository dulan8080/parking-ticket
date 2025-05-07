"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const [activeTab, setActiveTab] = useState<"credentials" | "pin">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // PIN state
  const [pin, setPin] = useState("");

  // Check for error in URL
  useEffect(() => {
    const errorFromUrl = searchParams?.get("error");
    if (errorFromUrl) {
      setError(
        errorFromUrl === "CredentialsSignin" 
          ? "Invalid credentials" 
          : "An error occurred during login"
      );
    }
  }, [searchParams]);

  const handleNavigation = useCallback((url: string) => {
    try {
      // Using plain window.location for more direct navigation
      window.location.href = url;
    } catch (e) {
      console.error("Navigation error:", e);
    }
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        handleNavigation(callbackUrl);
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        pin,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid PIN");
      } else if (result?.ok) {
        handleNavigation(callbackUrl);
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-8 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Link href="/">
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
          </Link>
        </div>

        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative bg-gray-200 rounded-full h-12 p-1 shadow-inner w-full max-w-xs mx-auto">
              <button
                onClick={() => {
                  setActiveTab("credentials");
                  setError(null);
                }}
                className={`absolute inset-y-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center text-sm font-medium w-[calc(50%-2px)] ${
                  activeTab === "credentials"
                    ? "bg-blue-500 text-white shadow-md translate-x-0"
                    : "bg-gray-200 text-gray-500"
                }`}
                type="button"
              >
                Email & Password
              </button>
              <button
                onClick={() => {
                  setActiveTab("pin");
                  setError(null);
                }}
                className={`absolute inset-y-1 right-1 rounded-full transition-all duration-300 flex items-center justify-center text-sm font-medium w-[calc(50%-2px)] ${
                  activeTab === "pin"
                    ? "bg-blue-500 text-white shadow-md translate-x-0"
                    : "bg-gray-200 text-gray-500"
                }`}
                type="button"
              >
                PIN
              </button>
            </div>
          </div>

          {activeTab === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mb-4"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="mb-6"
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={handlePinChange}
                    disabled={loading}
                    className="block w-full px-4 py-2 text-2xl tracking-widest text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || pin.length !== 4}
              >
                {loading ? "Logging in..." : "Login with PIN"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}

// Loading fallback UI
function LoginSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-8 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-[190px] h-[40px] bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/2 mx-auto" />
          <div className="h-12 bg-gray-200 rounded-full mb-6 mx-auto w-full max-w-xs" />
          <div className="h-[72px] bg-gray-200 rounded mb-4" />
          <div className="h-[72px] bg-gray-200 rounded mb-6" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
} 