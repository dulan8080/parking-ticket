export interface HourlyRate {
  hour: number;
  price: number;
}

export interface VehicleType {
  id: string;
  name: string;
  iconUrl?: string;
  rates: HourlyRate[];
}

export interface ParkingEntry {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType | string;
  vehicleTypeId?: string;
  entryTime: string;
  exitTime?: string;
  receiptId: string;
  totalAmount?: number;
  duration?: number;
  isPickAndGo?: boolean;
  userId?: string;
} 