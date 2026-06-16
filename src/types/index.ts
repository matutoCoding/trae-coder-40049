export interface ModelFile {
  id: string;
  name: string;
  size: number;
  url: string;
  dimensions: { x: number; y: number; z: number };
  volume: number;
  hasSupports: boolean;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface OrderTimeline {
  status: string;
  statusLabel: string;
  timestamp: string;
  operator: string;
  remark: string;
}

export type OrderStatus =
  | "pending"
  | "reviewed"
  | "layout"
  | "printing"
  | "cleaning"
  | "curing"
  | "support"
  | "qc"
  | "shipping"
  | "completed";

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  modelFiles: ModelFile[];
  materialType: string;
  materialColor: string;
  layerHeight: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  isUrgent?: boolean;
  createdAt: string;
  updatedAt: string;
  remark: string;
  timeline: OrderTimeline[];
  assignedPrinterId?: string;
  assignedCleaningId?: string;
  assignedCuringId?: string;
  estimatedDuration?: {
    printing: number;
    cleaning: number;
    curing: number;
    support: number;
    qc: number;
    shipping: number;
  };
  qcResult?: {
    passed: boolean;
    surfaceScore: number;
    dimensionalAccuracy: number;
    defects: string[];
    inspector: string;
    inspectedAt: string;
  };
  reworkCount?: number;
  printDuration?: number;
  review?: {
    rating: number;
    comment: string;
    reviewedAt: string;
  };
  shippingInfo?: {
    carrier: string;
    trackingNo: string;
    shippedAt: string;
    deliveredAt?: string;
    confirmedBy?: string;
    confirmedAt?: string;
  };
}

export type PrinterStatus = "idle" | "printing" | "paused" | "maintenance";

export interface Printer {
  id: string;
  name: string;
  model: string;
  status: PrinterStatus;
  currentOrderId?: string;
  currentOrderNo?: string;
  progress: number;
  resinLevel: number;
  resinType: string;
  resinColor: string;
  platformHeight: number;
  temperature: number;
  exposureTime: number;
  layerHeight: number;
  totalLayers: number;
  currentLayer: number;
  printDuration: number;
  elapsedTime: number;
  buildVolume: { x: number; y: number; z: number };
}

export type StationStatus = "idle" | "cleaning" | "curing" | "completed";

export interface CleaningStation {
  id: string;
  name: string;
  status: StationStatus;
  orderId?: string;
  orderNo?: string;
  alcoholConcentration: number;
  cleaningTime: number;
  remainingTime: number;
  basketId?: string;
  temperature: number;
}

export interface CuringStation {
  id: string;
  name: string;
  status: StationStatus;
  orderId?: string;
  orderNo?: string;
  uvIntensity: number;
  temperature: number;
  curingTime: number;
  remainingTime: number;
  rotationSpeed: number;
}

export interface Resin {
  id: string;
  name: string;
  type: string;
  color: string;
  colorHex: string;
  manufacturer: string;
  stock: number;
  unit: string;
  expiryDate: string;
  pricePerUnit: number;
  recommendedExposure: number;
  layerHeights: number[];
}

export interface DailyStats {
  date: string;
  ordersReceived: number;
  ordersCompleted: number;
  printingHours: number;
  resinUsed: number;
}
