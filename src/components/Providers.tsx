"use client";

import { SessionProvider } from "next-auth/react";
import { ParkingProvider } from "@/context/ParkingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <ParkingProvider>{children}</ParkingProvider>
    </SessionProvider>
  );
} 