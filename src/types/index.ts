export type VehicleType = {
  id: string;
  name: string;
  rates: HourlyRate[];
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
}; 