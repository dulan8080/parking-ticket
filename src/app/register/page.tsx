"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (pin && (pin.length !== 4 || !/^\d+$/.test(pin))) {
      setError("PIN must be a 4-digit number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          pin: pin || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setSuccess("Registration successful! You can now login.");
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPin("");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-8 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
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

        <Card>
          <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="mb-4"
            />
            
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mb-4"
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="mb-4"
            />
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN (optional - 4 digits)
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN (optional)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 4))}
                  disabled={loading}
                  className="block w-full px-4 py-2 text-2xl tracking-widest text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                PIN can be used for quick login without email/password
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mb-4" 
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
} 