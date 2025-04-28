export type VehicleType = {
  id: string;
  name: string;
  rates: HourlyRate[];
  iconUrl?: string | null;
};

export type HourlyRate = {
  hour: number;
  price: number;
};

export type ParkingEntry = {
  id: string;
  vehicleNumber: string;
  vehicleType: string | VehicleType;
  entryTime: string;
  exitTime?: string;
  totalAmount?: number;
  duration?: number; // in hours
  receiptId: string;
  isPickAndGo?: boolean; // Flag for 15 minutes free parking
}; 