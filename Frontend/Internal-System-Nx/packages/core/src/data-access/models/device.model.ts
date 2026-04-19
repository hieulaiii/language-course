export  interface Device {
  id: string
  name: string
  data: DeviceData | null
}

export interface DeviceData {
  color?: string;
  capacity?: string;
  'capacity GB'?: number;
  price?: number;
  year?: number;
  [key: string]: unknown;
}
