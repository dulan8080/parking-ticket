"use client";

import { SessionProvider } from "next-auth/react";
import { ParkingProvider } from "@/context/ParkingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ParkingProvider>{children}</ParkingProvider>
    </SessionProvider>
  );
} 