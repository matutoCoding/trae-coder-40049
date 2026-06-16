import { create } from "zustand";
import type {
  Order,
  Printer,
  CleaningStation,
  CuringStation,
  Resin,
  DailyStats,
  OrderStatus,
} from "../types";
import {
  mockOrders,
  mockPrinters,
  mockCleaningStations,
  mockCuringStations,
  mockResins,
  mockDailyStats,
} from "../data/mockData";

interface FactoryState {
  orders: Order[];
  printers: Printer[];
  cleaningStations: CleaningStation[];
  curingStations: CuringStation[];
  resins: Resin[];
  dailyStats: DailyStats[];
  currentOrderId: string | null;

  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getPrinterById: (id: string) => Printer | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, operator: string, remark: string) => void;
  updatePrinterProgress: (printerId: string, progress: number, currentLayer: number) => void;
  updateCleaningStation: (stationId: string, updates: Partial<CleaningStation>) => void;
  updateCuringStation: (stationId: string, updates: Partial<CuringStation>) => void;
  setCurrentOrder: (orderId: string | null) => void;
  addOrder: (order: Order) => void;
}

export const useFactoryStore = create<FactoryState>((set, get) => ({
  orders: mockOrders,
  printers: mockPrinters,
  cleaningStations: mockCleaningStations,
  curingStations: mockCuringStations,
  resins: mockResins,
  dailyStats: mockDailyStats,
  currentOrderId: null,

  getOrdersByStatus: (status) => {
    return get().orders.filter((o) => o.status === status);
  },

  getOrderById: (id) => {
    return get().orders.find((o) => o.id === id);
  },

  getPrinterById: (id) => {
    return get().printers.find((p) => p.id === id);
  },

  updateOrderStatus: (orderId, status, operator, remark) => {
    const statusLabels: Record<OrderStatus, string> = {
      pending: "待审核",
      reviewed: "已审核",
      layout: "排版中",
      printing: "打印中",
      cleaning: "清洗中",
      support: "去支撑",
      qc: "质检中",
      shipping: "发货中",
      completed: "已完成",
    };

    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...order.timeline,
                {
                  status,
                  statusLabel: statusLabels[status],
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator,
                  remark,
                },
              ],
            }
          : order
      ),
    }));
  },

  updatePrinterProgress: (printerId, progress, currentLayer) => {
    set((state) => ({
      printers: state.printers.map((p) =>
        p.id === printerId ? { ...p, progress, currentLayer } : p
      ),
    }));
  },

  updateCleaningStation: (stationId, updates) => {
    set((state) => ({
      cleaningStations: state.cleaningStations.map((s) =>
        s.id === stationId ? { ...s, ...updates } : s
      ),
    }));
  },

  updateCuringStation: (stationId, updates) => {
    set((state) => ({
      curingStations: state.curingStations.map((s) =>
        s.id === stationId ? { ...s, ...updates } : s
      ),
    }));
  },

  setCurrentOrder: (orderId) => {
    set({ currentOrderId: orderId });
  },

  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },
}));
