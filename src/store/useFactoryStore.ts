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
  advanceToPrinting: (orderId: string, printerId: string) => void;
  advanceToCleaning: (orderId: string, cleaningStationId: string) => void;
  advanceToCuring: (orderId: string, curingStationId: string) => void;
  advanceSimple: (orderId: string, nextStatus: OrderStatus) => void;
  reworkOrder: (orderId: string, reason: string) => void;
  addReview: (orderId: string, rating: number, comment: string) => void;
  refillResin: (printerId: string, amountLiters: number) => void;
  changeResin: (printerId: string, resinId: string) => void;
  updateResinStock: (resinId: string, delta: number) => void;
  updatePrinter: (printerId: string, updates: Partial<Printer>) => void;
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
      curing: "固化中",
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

  advanceToPrinting: (orderId, printerId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    const printer = state.printers.find((p) => p.id === printerId);
    if (!order || !printer) return;

    const previousPrinterId = order.assignedPrinterId;
    const resinInfo = state.resins.find((r) => r.type === order.materialType);

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "printing" as OrderStatus,
              assignedPrinterId: printerId,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...o.timeline,
                {
                  status: "printing",
                  statusLabel: "打印中",
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator: "系统",
                  remark: `分配至 ${printer.name}，开始打印`,
                },
              ],
            }
          : o
      ),
      printers: state.printers.map((p) => {
        if (p.id === printerId) {
          return {
            ...p,
            status: "printing" as const,
            currentOrderId: orderId,
            currentOrderNo: order.orderNo,
            progress: 0,
            resinType: order.materialType,
            resinColor: order.materialColor,
            resinLevel: Math.max(p.resinLevel, 60),
            layerHeight: order.layerHeight,
            exposureTime: resinInfo?.recommendedExposure || 8.5,
            totalLayers: Math.round(300 / order.layerHeight),
            currentLayer: 0,
            printDuration: Math.round((300 / order.layerHeight) * (resinInfo?.recommendedExposure || 8.5)),
            elapsedTime: 0,
          };
        }
        if (p.id === previousPrinterId) {
          return {
            ...p,
            status: "idle" as const,
            currentOrderId: undefined,
            currentOrderNo: undefined,
            progress: 0,
          };
        }
        return p;
      }),
    }));
  },

  advanceToCleaning: (orderId, cleaningStationId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    const station = state.cleaningStations.find((s) => s.id === cleaningStationId);
    if (!order || !station) return;

    const previousPrinterId = order.assignedPrinterId;

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cleaning" as OrderStatus,
              assignedCleaningId: cleaningStationId,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...o.timeline,
                {
                  status: "cleaning",
                  statusLabel: "清洗中",
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator: "系统",
                  remark: `打印完成，转入 ${station.name} 酒精清洗`,
                },
              ],
            }
          : o
      ),
      printers: state.printers.map((p) => {
        if (p.id === previousPrinterId) {
          return {
            ...p,
            status: "idle" as const,
            currentOrderId: undefined,
            currentOrderNo: undefined,
            progress: 100,
          };
        }
        return p;
      }),
      cleaningStations: state.cleaningStations.map((s) =>
        s.id === cleaningStationId
          ? {
              ...s,
              status: "cleaning" as const,
              orderId,
              orderNo: order.orderNo,
              cleaningTime: 900,
              remainingTime: 900,
              alcoholConcentration: Math.max(s.alcoholConcentration, 90),
            }
          : s
      ),
    }));
  },

  advanceToCuring: (orderId, curingStationId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    const station = state.curingStations.find((s) => s.id === curingStationId);
    if (!order || !station) return;

    const previousCleaningId = order.assignedCleaningId;

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "curing" as OrderStatus,
              assignedCuringId: curingStationId,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...o.timeline,
                {
                  status: "curing",
                  statusLabel: "固化中",
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator: "系统",
                  remark: `清洗完成，转入 ${station.name} UV固化`,
                },
              ],
            }
          : o
      ),
      cleaningStations: state.cleaningStations.map((s) => {
        if (s.id === previousCleaningId) {
          return {
            ...s,
            status: "idle" as const,
            orderId: undefined,
            orderNo: undefined,
            remainingTime: 0,
          };
        }
        return s;
      }),
      curingStations: state.curingStations.map((s) =>
        s.id === curingStationId
          ? {
              ...s,
              status: "curing" as const,
              orderId,
              orderNo: order.orderNo,
              curingTime: 2400,
              remainingTime: 2400,
              uvIntensity: 80,
              temperature: 60,
              rotationSpeed: 6,
            }
          : s
      ),
    }));
  },

  advanceSimple: (orderId, nextStatus) => {
    const statusLabels: Record<OrderStatus, string> = {
      pending: "待审核",
      reviewed: "已审核",
      layout: "排版中",
      printing: "打印中",
      cleaning: "清洗中",
      curing: "固化中",
      support: "去支撑",
      qc: "质检中",
      shipping: "发货中",
      completed: "已完成",
    };

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...o.timeline,
                {
                  status: nextStatus,
                  statusLabel: statusLabels[nextStatus],
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator: "系统",
                  remark: `推进至${statusLabels[nextStatus]}`,
                },
              ],
            }
          : o
      ),
    }));
  },

  refillResin: (printerId, amountLiters) => {
    set((state) => ({
      printers: state.printers.map((p) =>
        p.id === printerId
          ? { ...p, resinLevel: Math.min(100, p.resinLevel + amountLiters * 10) }
          : p
      ),
    }));
  },

  changeResin: (printerId, resinId) => {
    const resin = get().resins.find((r) => r.id === resinId);
    if (!resin) return;

    set((state) => ({
      printers: state.printers.map((p) =>
        p.id === printerId
          ? {
              ...p,
              resinType: resin.type,
              resinColor: resin.color,
              resinLevel: 100,
              exposureTime: resin.recommendedExposure,
            }
          : p
      ),
      resins: state.resins.map((r) =>
        r.id === resinId ? { ...r, stock: Math.max(0, r.stock - 1) } : r
      ),
    }));
  },

  updateResinStock: (resinId, delta) => {
    set((state) => ({
      resins: state.resins.map((r) =>
        r.id === resinId ? { ...r, stock: Math.max(0, r.stock + delta) } : r
      ),
    }));
  },

  reworkOrder: (orderId, reason) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentReworkCount = order.reworkCount || 0;
    const newReworkCount = currentReworkCount + 1;

    const releasePrinterId = order.assignedPrinterId;
    const releaseCleaningId = order.assignedCleaningId;
    const releaseCuringId = order.assignedCuringId;

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "layout" as OrderStatus,
              reworkCount: newReworkCount,
              assignedPrinterId: undefined,
              assignedCleaningId: undefined,
              assignedCuringId: undefined,
              qcResult: undefined,
              updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              timeline: [
                ...o.timeline,
                {
                  status: "layout",
                  statusLabel: "排版中",
                  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                  operator: "系统",
                  remark: `质检不合格退回返修（第${newReworkCount}次），原因：${reason}`,
                },
              ],
            }
          : o
      ),
      printers: state.printers.map((p) => {
        if (p.id === releasePrinterId) {
          return { ...p, status: "idle" as const, currentOrderId: undefined, currentOrderNo: undefined, progress: 0 };
        }
        return p;
      }),
      cleaningStations: state.cleaningStations.map((s) => {
        if (s.id === releaseCleaningId) {
          return { ...s, status: "idle" as const, orderId: undefined, orderNo: undefined, remainingTime: 0 };
        }
        return s;
      }),
      curingStations: state.curingStations.map((s) => {
        if (s.id === releaseCuringId) {
          return { ...s, status: "idle" as const, orderId: undefined, orderNo: undefined, remainingTime: 0 };
        }
        return s;
      }),
    }));
  },

  addReview: (orderId, rating, comment) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              review: {
                rating,
                comment,
                reviewedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              },
            }
          : o
      ),
    }));
  },

  updatePrinter: (printerId, updates) => {
    set((state) => ({
      printers: state.printers.map((p) =>
        p.id === printerId ? { ...p, ...updates } : p
      ),
    }));
  },
}));
