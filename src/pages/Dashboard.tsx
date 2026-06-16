import { useState, useMemo } from "react";
import {
  ClipboardList,
  Printer,
  Beaker,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Calendar,
  Activity,
  Gauge,
  Star,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useFactoryStore } from "../store/useFactoryStore";
import {
  StatCard,
  ProgressBar,
  PrinterStatusBadge,
  OrderStatusBadge,
  CircularProgress,
} from "../components/StatusBadges";
import type { Order } from "../types";
import { cn } from "../lib/utils";

const COLORS = {
  blue: "#0EA5E9",
  amber: "#F59E0B",
  green: "#22C55E",
  purple: "#A855F7",
};

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-sm p-3 shadow-card">
        <p className="text-xs font-mono text-dark-400 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-sm font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function PrintersPanel() {
  const printers = useFactoryStore((s) => s.printers);

  return (
    <div className="card-industrial p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-dark-50">
          打印设备状态
        </h3>
        <span className="text-xs font-mono text-dark-500">
          {printers.filter((p) => p.status === "printing").length}/{printers.length} 运行中
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {printers.map((printer) => (
          <div
            key={printer.id}
            className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm hover:border-industrial-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-display font-semibold text-dark-100">
                  {printer.name}
                </p>
                <p className="text-xs font-mono text-dark-500">{printer.model}</p>
              </div>
              <PrinterStatusBadge status={printer.status} />
            </div>
            {printer.status === "printing" && (
              <>
                <p className="text-xs font-mono text-industrial-400 mb-2">
                  {printer.currentOrderNo}
                </p>
                <div className="mb-2">
                  <ProgressBar value={printer.progress} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-dark-500">层：</span>
                    <span className="text-dark-200">
                      {printer.currentLayer}/{printer.totalLayers}
                    </span>
                  </div>
                  <div>
                    <span className="text-dark-500">温度：</span>
                    <span className="text-amber-400">{printer.temperature}°C</span>
                  </div>
                </div>
              </>
            )}
            {printer.status === "idle" && (
              <div className="flex items-center gap-2 text-sm text-dark-500">
                <CheckCircle2 className="w-4 h-4" />
                设备就绪，等待任务
              </div>
            )}
            {printer.status === "paused" && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                打印已暂停
              </div>
            )}
            {printer.status === "maintenance" && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4" />
                设备维护中
              </div>
            )}
            {printer.status !== "maintenance" && (
              <div className="mt-3 pt-3 border-t border-dark-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-dark-500">树脂液位</span>
                  <span
                    className={`font-mono font-medium ${
                      printer.resinLevel < 30 ? "text-red-400" : "text-dark-200"
                    }`}
                  >
                    {printer.resinLevel}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    value={printer.resinLevel}
                    color={printer.resinLevel < 30 ? "red" : "blue"}
                    height="h-1.5"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrders() {
  const orders = useFactoryStore((s) => s.orders).slice(0, 5);

  return (
    <div className="card-industrial">
      <div className="flex items-center justify-between p-5 border-b border-dark-700">
        <h3 className="font-display font-semibold text-lg text-dark-50">
          最近订单
        </h3>
        <button className="text-xs font-display text-industrial-400 hover:text-industrial-300 transition-colors">
          查看全部 →
        </button>
      </div>
      <table className="table-industrial">
        <thead>
          <tr>
            <th>订单号</th>
            <th>客户</th>
            <th>材料</th>
            <th>金额</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: Order) => (
            <tr key={order.id} className="cursor-pointer">
              <td className="font-mono text-industrial-400">{order.orderNo}</td>
              <td className="font-display">{order.customerName}</td>
              <td className="text-dark-400">{order.materialType}</td>
              <td className="font-mono text-amber-400">¥{order.totalPrice}</td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseTimestamp(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

function CapacityDashboard() {
  const orders = useFactoryStore((s) => s.orders);
  const printers = useFactoryStore((s) => s.printers);
  const cleaningStations = useFactoryStore((s) => s.cleaningStations);
  const curingStations = useFactoryStore((s) => s.curingStations);
  const dailyStats = useFactoryStore((s) => s.dailyStats);
  const toggleUrgent = useFactoryStore((s) => s.toggleUrgent);

  const [selectedDate, setSelectedDate] = useState("2026-06-17");
  const [activeTab, setActiveTab] = useState<"realtime" | "schedule">("realtime");
  const todayStr = "2026-06-17";
  const isToday = selectedDate === todayStr;
  const shortDate = selectedDate.slice(5);

  const TIMELINE_START_HOUR = 9;
  const TIMELINE_END_HOUR = 24;
  const TIMELINE_TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60;

  const stats = useMemo(() => {
    const dateOrders = orders.filter((o) =>
      o.timeline.some((t) => t.timestamp.startsWith(selectedDate))
    );

    if (isToday) {
      const printerStats = printers.map((p) => {
        const printerOrders = orders.filter((o) => {
          const assignedMatch = o.assignedPrinterId === p.id;
          const remarkMatch = o.timeline.some(
            (t) => t.status === "printing" && t.remark.includes(p.name)
          );
          return assignedMatch || remarkMatch;
        });

        const totalPrints = printerOrders.length;
        const reworkCountSum = printerOrders.reduce((sum, o) => sum + (o.reworkCount || 0), 0);
        const failedQcCount = printerOrders.filter((o) => o.qcResult?.passed === false).length;
        const totalFailures = reworkCountSum + failedQcCount;
        const successRate = totalPrints > 0
          ? Math.round(100 * (totalPrints - totalFailures) / totalPrints)
          : totalPrints === 0 && p.status !== "maintenance"
          ? 100
          : 0;

        let uptimeMinutes = 0;
        if (p.status === "printing") {
          uptimeMinutes = p.elapsedTime > 0 ? p.elapsedTime : Math.round(p.printDuration * (p.progress / 100));
        } else if (p.status === "paused") {
          uptimeMinutes = p.elapsedTime || 0;
        } else if (p.status === "idle") {
          uptimeMinutes = p.printDuration || 0;
        }
        const uptimeHours = (uptimeMinutes / 60).toFixed(1);

        let resinLiters = 0;
        printerOrders.forEach((o) => {
          const totalVolume = o.modelFiles.reduce((sum, f) => sum + (f.volume || 0), 0);
          const layerFactor = o.layerHeight <= 0.025 ? 1.3 : o.layerHeight <= 0.05 ? 1.0 : 0.75;
          resinLiters += (totalVolume / 1000) * layerFactor * (o.quantity || 1);
        });
        if (p.status === "printing") {
          resinLiters += p.progress > 0 ? (100 - p.resinLevel) * 0.02 : 0;
        }
        const resinConsumed = resinLiters.toFixed(1);

        return {
          id: p.id,
          name: p.name,
          model: p.model,
          status: p.status,
          uptimeHours,
          totalPrints,
          completedPrints: printerOrders.filter((o) =>
            ["cleaning", "curing", "support", "qc", "shipping", "completed"].includes(o.status)
          ).length,
          successRate,
          resinConsumed,
        };
      });

      const cleaningDeltas: number[] = [];
      const curingDeltas: number[] = [];

      dateOrders.forEach((o) => {
        const cleaningStart = o.timeline.find((t) => t.status === "cleaning");
        const curingStart = o.timeline.find((t) => t.status === "curing");
        const supportStart = o.timeline.find((t) => t.status === "support");

        if (cleaningStart && curingStart) {
          const delta = (parseTimestamp(curingStart.timestamp) - parseTimestamp(cleaningStart.timestamp)) / 60000;
          if (delta > 0 && delta < 1440) cleaningDeltas.push(delta);
        }
        if (curingStart && supportStart) {
          const delta = (parseTimestamp(supportStart.timestamp) - parseTimestamp(curingStart.timestamp)) / 60000;
          if (delta > 0 && delta < 1440) curingDeltas.push(delta);
        }
      });

      const cleaningTurnaround = cleaningDeltas.length > 0
        ? Math.round(cleaningDeltas.reduce((a, b) => a + b, 0) / cleaningDeltas.length)
        : dateOrders.some((o) => o.timeline.some((t) => t.status === "cleaning"))
        ? 20
        : 0;
      const curingTurnaround = curingDeltas.length > 0
        ? Math.round(curingDeltas.reduce((a, b) => a + b, 0) / curingDeltas.length)
        : dateOrders.some((o) => o.timeline.some((t) => t.status === "curing"))
        ? 40
        : 0;

      return {
        printerStats,
        cleaningTurnaround,
        curingTurnaround,
        activeCleaners: cleaningStations.filter((s) => s.status === "cleaning").length,
        activeCurers: curingStations.filter((s) => s.status === "curing").length,
        source: "realtime" as const,
      };
    } else {
      const dayStat = dailyStats.find((d) => d.date === shortDate);
      const printingHours = dayStat?.printingHours || 0;
      const resinUsed = dayStat?.resinUsed || 0;
      const completedCount = dayStat?.ordersCompleted || 0;

      const nonMaintenancePrinters = printers.filter((p) => p.status !== "maintenance");
      const activePrinterCount = nonMaintenancePrinters.length;

      const datePrintingOrders = orders.filter((o) =>
        o.timeline.some((t) => t.timestamp.startsWith(selectedDate) && t.status === "printing")
      );
      const printerOrderDistribution: Record<string, number> = {};
      nonMaintenancePrinters.forEach((p) => {
        printerOrderDistribution[p.id] = 0;
      });
      datePrintingOrders.forEach((o) => {
        if (o.assignedPrinterId && printerOrderDistribution[o.assignedPrinterId] !== undefined) {
          printerOrderDistribution[o.assignedPrinterId] += 1;
        }
      });

      const totalPrintsByPrinter = Object.values(printerOrderDistribution).reduce((a, b) => a + b, 0);
      const hasOrderDistribution = totalPrintsByPrinter > 0;

      let allocatedPrintingHours = 0;
      let allocatedResin = 0;

      const printerStats = printers.map((p, idx) => {
        if (p.status === "maintenance") {
          return {
            id: p.id,
            name: p.name,
            model: p.model,
            status: p.status,
            uptimeHours: "0.0",
            totalPrints: 0,
            completedPrints: 0,
            successRate: 0,
            resinConsumed: "0.0",
          };
        }

        let uptime: string;
        let resin: string;
        let allocatedOrders: number;

        if (hasOrderDistribution) {
          const orderCount = printerOrderDistribution[p.id] || 0;
          const weight = orderCount / totalPrintsByPrinter;
          uptime = (printingHours * weight).toFixed(1);
          resin = (resinUsed * weight).toFixed(1);
          allocatedOrders = orderCount;
        } else {
          const evenShare = 1 / activePrinterCount;
          const rawUptime = printingHours * evenShare;
          const rawResin = resinUsed * evenShare;
          
          if (idx === nonMaintenancePrinters.length - 1) {
            uptime = (printingHours - allocatedPrintingHours).toFixed(1);
            resin = (resinUsed - allocatedResin).toFixed(1);
          } else {
            uptime = rawUptime.toFixed(1);
            resin = rawResin.toFixed(1);
          }
          allocatedPrintingHours += parseFloat(uptime);
          allocatedResin += parseFloat(resin);
          allocatedOrders = Math.max(1, Math.round(completedCount * evenShare));
        }

        const datePrinterOrders = datePrintingOrders.filter((o) => o.assignedPrinterId === p.id);
        const histReworkCountSum = datePrinterOrders.reduce((sum, o) => sum + (o.reworkCount || 0), 0);
        const histFailedQcCount = datePrinterOrders.filter((o) => o.qcResult?.passed === false).length;
        const histTotalFailures = histReworkCountSum + histFailedQcCount;
        const succRate = datePrinterOrders.length > 0
          ? Math.max(0, Math.round(100 * (datePrinterOrders.length - histTotalFailures) / datePrinterOrders.length))
          : allocatedOrders > 0
          ? Math.max(70, Math.round(95 - (allocatedOrders * 3) % 20))
          : 0;

        return {
          id: p.id,
          name: p.name,
          model: p.model,
          status: p.status,
          uptimeHours: uptime,
          totalPrints: allocatedOrders,
          completedPrints: allocatedOrders,
          successRate: succRate,
          resinConsumed: resin,
        };
      });

      const histCleaningDeltas: number[] = [];
      const histCuringDeltas: number[] = [];

      dateOrders.forEach((o) => {
        const cleaningStart = o.timeline.find((t) => t.status === "cleaning" && t.timestamp.startsWith(selectedDate));
        const curingStart = o.timeline.find((t) => t.status === "curing" && t.timestamp.startsWith(selectedDate));
        const supportStart = o.timeline.find((t) => t.status === "support" && t.timestamp.startsWith(selectedDate));

        if (cleaningStart && curingStart) {
          const delta = (parseTimestamp(curingStart.timestamp) - parseTimestamp(cleaningStart.timestamp)) / 60000;
          if (delta > 0 && delta < 1440) histCleaningDeltas.push(delta);
        }
        if (curingStart && supportStart) {
          const delta = (parseTimestamp(supportStart.timestamp) - parseTimestamp(curingStart.timestamp)) / 60000;
          if (delta > 0 && delta < 1440) histCuringDeltas.push(delta);
        }
      });

      let cleaningTurnaround: number;
      let curingTurnaround: number;

      if (histCleaningDeltas.length > 0) {
        cleaningTurnaround = Math.round(histCleaningDeltas.reduce((a, b) => a + b, 0) / histCleaningDeltas.length);
      } else if (completedCount > 0) {
        cleaningTurnaround = Math.max(15, Math.round(15 + completedCount * 0.5));
      } else {
        cleaningTurnaround = dailyStats.some((d) => d.date === shortDate && d.ordersCompleted > 0) ? 20 : 0;
      }

      if (histCuringDeltas.length > 0) {
        curingTurnaround = Math.round(histCuringDeltas.reduce((a, b) => a + b, 0) / histCuringDeltas.length);
      } else if (completedCount > 0) {
        curingTurnaround = Math.max(30, Math.round(35 + completedCount * 0.8));
      } else {
        curingTurnaround = dailyStats.some((d) => d.date === shortDate && d.ordersCompleted > 0) ? 40 : 0;
      }

      return {
        printerStats,
        cleaningTurnaround,
        curingTurnaround,
        activeCleaners: 0,
        activeCurers: 0,
        source: "history" as const,
      };
    }
  }, [isToday, orders, printers, cleaningStations, curingStations, dailyStats, selectedDate, shortDate]);

  const scheduleData = useMemo(() => {
    const getOrderStartTime = (order: Order, stationType: "printer" | "cleaning" | "curing"): number | null => {
      const statusMap = {
        printer: "printing",
        cleaning: "cleaning",
        curing: "curing",
      };
      const timelineEntry = order.timeline.find((t) => t.status === statusMap[stationType]);
      if (!timelineEntry) return null;

      const timestamp = parseTimestamp(timelineEntry.timestamp);
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const startMinutes = TIMELINE_START_HOUR * 60;

      if (totalMinutes < startMinutes || totalMinutes >= TIMELINE_END_HOUR * 60) {
        return null;
      }
      return totalMinutes - startMinutes;
    };

    const getOrderDuration = (order: Order, stationType: "printer" | "cleaning" | "curing"): number => {
      if (!order.estimatedDuration) return 60;
      const durationMap = {
        printer: order.estimatedDuration.printing / 60,
        cleaning: order.estimatedDuration.cleaning / 60,
        curing: order.estimatedDuration.curing / 60,
      };
      return Math.min(durationMap[stationType], TIMELINE_TOTAL_MINUTES);
    };

    interface ScheduleBlock {
      orderId: string;
      orderNo: string;
      customerName: string;
      isUrgent: boolean;
      startMinutes: number;
      durationMinutes: number;
      startTimeStr: string;
      endTimeStr: string;
      status: Order["status"];
    }

    const buildSchedule = <T extends { id: string; name: string; status: string }>(
      stations: T[],
      idField: "assignedPrinterId" | "assignedCleaningId" | "assignedCuringId",
      stationType: "printer" | "cleaning" | "curing"
    ) => {
      return stations.map((station) => {
        const stationOrders = orders.filter((o) => o[idField] === station.id);
        const blocks: ScheduleBlock[] = [];

        stationOrders.forEach((order) => {
          const startMinutes = getOrderStartTime(order, stationType);
          if (startMinutes === null) return;

          const durationMinutes = getOrderDuration(order, stationType);
          const actualEnd = Math.min(startMinutes + durationMinutes, TIMELINE_TOTAL_MINUTES);
          const actualDuration = actualEnd - startMinutes;

          if (actualDuration <= 0) return;

          const startHour = TIMELINE_START_HOUR + Math.floor(startMinutes / 60);
          const startMin = startMinutes % 60;
          const endHour = TIMELINE_START_HOUR + Math.floor(actualEnd / 60);
          const endMin = actualEnd % 60;

          blocks.push({
            orderId: order.id,
            orderNo: order.orderNo,
            customerName: order.customerName,
            isUrgent: !!order.isUrgent,
            startMinutes,
            durationMinutes: actualDuration,
            startTimeStr: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
            endTimeStr: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
            status: order.status,
          });
        });

        blocks.sort((a, b) => a.startMinutes - b.startMinutes);

        return {
          ...station,
          blocks,
          isRunning: blocks.length > 0 && station.status !== "idle" && station.status !== "maintenance",
        };
      });
    };

    return {
      printers: buildSchedule(printers, "assignedPrinterId", "printer"),
      cleaningStations: buildSchedule(cleaningStations, "assignedCleaningId", "cleaning"),
      curingStations: buildSchedule(curingStations, "assignedCuringId", "curing"),
    };
  }, [orders, printers, cleaningStations, curingStations]);

  const timeMarkers = useMemo(() => {
    const markers: { hour: number; label: string }[] = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h += 3) {
      markers.push({ hour: h, label: `${String(h).padStart(2, "0")}:00` });
    }
    return markers;
  }, []);

  const getBlockColor = (status: Order["status"], isUrgent: boolean) => {
    if (isUrgent) return "bg-red-500/30";
    const colorMap: Record<string, string> = {
      printing: "bg-industrial-500/40",
      cleaning: "bg-cyan-500/40",
      curing: "bg-purple-500/40",
      support: "bg-amber-500/40",
      qc: "bg-orange-500/40",
      completed: "bg-green-500/40",
      pending: "bg-dark-500/40",
      layout: "bg-blue-500/40",
    };
    return colorMap[status] || "bg-dark-500/40";
  };

  const renderRealtimeView = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {stats.printerStats.map((ps) => (
          <div
            key={ps.id}
            className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-display font-semibold text-dark-100">{ps.name}</p>
                <p className="text-xs font-mono text-dark-500">{ps.model}</p>
              </div>
              <PrinterStatusBadge status={ps.status} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] font-mono text-dark-500 uppercase">开机时长</p>
                <p className="font-mono font-bold text-industrial-400">{ps.uptimeHours}h</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-dark-500 uppercase">打印成功率</p>
                <p className={cn(
                  "font-mono font-bold",
                  ps.successRate >= 90 ? "text-green-400" : ps.successRate >= 70 ? "text-amber-400" : "text-red-400"
                )}>
                  {ps.successRate}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-dark-500 uppercase">树脂消耗</p>
                <p className="font-mono font-bold text-amber-400">{ps.resinConsumed}L</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-dark-500 uppercase">完成打印</p>
                <p className="font-mono font-bold text-dark-200">{ps.completedPrints}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm text-center">
          <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <p className="text-[10px] font-mono text-dark-500 uppercase">清洗平均周转</p>
          <p className="font-mono font-bold text-lg text-cyan-400">
            {stats.cleaningTurnaround > 0 ? `${stats.cleaningTurnaround} min` : "—"}
          </p>
        </div>
        <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm text-center">
          <Activity className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] font-mono text-dark-500 uppercase">固化平均周转</p>
          <p className="font-mono font-bold text-lg text-purple-400">
            {stats.curingTurnaround > 0 ? `${stats.curingTurnaround} min` : "—"}
          </p>
        </div>
        <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm text-center">
          <Clock className="w-5 h-5 text-industrial-400 mx-auto mb-2" />
          <p className="text-[10px] font-mono text-dark-500 uppercase">运行中清洗工位</p>
          <p className="font-mono font-bold text-lg text-industrial-400">{stats.activeCleaners}</p>
        </div>
        <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm text-center">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] font-mono text-dark-500 uppercase">运行中固化工位</p>
          <p className="font-mono font-bold text-lg text-purple-400">{stats.activeCurers}</p>
        </div>
      </div>
    </>
  );

  const renderScheduleView = () => {
    interface ScheduleRowProps {
      name: string;
      status: string;
      isRunning: boolean;
      blocks: any[];
      stationType: "printer" | "cleaning" | "curing";
    }

    const ScheduleRow = ({ name, status, isRunning, blocks, stationType }: ScheduleRowProps) => (
      <div className="flex items-stretch border-b border-dark-700 last:border-b-0">
        <div className="w-28 flex-shrink-0 p-3 border-r border-dark-700 bg-dark-900/30">
          <div className="flex items-center justify-between">
            <p className="font-display font-medium text-dark-100 text-sm">{name}</p>
            <div className="flex items-center gap-1">
              {isRunning ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  运行
                </span>
              ) : status === "maintenance" ? (
                <span className="text-[10px] font-mono text-red-400">维护</span>
              ) : (
                <span className="text-[10px] font-mono text-dark-500">空闲</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 relative h-14 bg-dark-900/50">
          {timeMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 border-l border-dark-700/50"
              style={{ left: `${((marker.hour - TIMELINE_START_HOUR) / (TIMELINE_END_HOUR - TIMELINE_START_HOUR)) * 100}%` }}
            />
          ))}
          {blocks.map((block, idx) => (
            <div
              key={`${block.orderId}-${idx}`}
              className={cn(
                "absolute top-1.5 bottom-1.5 rounded-sm cursor-pointer transition-all hover:brightness-125 group",
                getBlockColor(block.status, block.isUrgent),
                block.isUrgent && "ring-2 ring-red-500 animate-pulse"
              )}
              style={{
                left: `${(block.startMinutes / TIMELINE_TOTAL_MINUTES) * 100}%`,
                width: `${(block.durationMinutes / TIMELINE_TOTAL_MINUTES) * 100}%`,
              }}
            >
              <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-dark-800 border border-dark-600 rounded-sm p-2 shadow-lg whitespace-nowrap">
                  <p className="font-mono text-xs text-industrial-400">{block.orderNo}</p>
                  <p className="text-xs text-dark-200">{block.customerName}</p>
                  <p className="text-[10px] font-mono text-dark-500">
                    {block.startTimeStr} - {block.endTimeStr}
                  </p>
                  <p className="text-[10px] font-mono text-dark-500">
                    时长 {Math.round(block.durationMinutes)} 分钟
                  </p>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-600" />
              </div>
              <div className="h-full flex items-center px-1 overflow-hidden">
                <span className="text-[10px] font-mono text-dark-100 truncate">
                  {block.orderNo.slice(-4)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="w-16 flex-shrink-0 p-3 border-l border-dark-700 bg-dark-900/30 flex items-center justify-center">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={blocks.some((b) => b.isUrgent)}
              onChange={(e) => {
                const block = blocks.find((b) => b.isUrgent) || blocks[0];
                if (block) {
                  toggleUrgent(block.orderId);
                }
              }}
              className="w-3.5 h-3.5 rounded-sm border-dark-600 bg-dark-800 text-red-500 focus:ring-red-500 focus:ring-offset-0"
            />
            <Zap className={cn(
              "w-3.5 h-3.5",
              blocks.some((b) => b.isUrgent) ? "text-red-400" : "text-dark-600"
            )} />
          </label>
        </div>
      </div>
    );

    return (
      <div className="border border-dark-700 rounded-sm overflow-hidden">
        <div className="flex items-stretch bg-dark-800 border-b border-dark-700">
          <div className="w-28 flex-shrink-0 p-2 border-r border-dark-700">
            <p className="text-[10px] font-mono text-dark-500 uppercase">设备</p>
          </div>
          <div className="flex-1 relative h-8">
            {timeMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 flex items-center justify-center"
                style={{
                  left: `${((marker.hour - TIMELINE_START_HOUR) / (TIMELINE_END_HOUR - TIMELINE_START_HOUR)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="text-[10px] font-mono text-dark-500">{marker.label}</span>
              </div>
            ))}
          </div>
          <div className="w-16 flex-shrink-0 p-2 border-l border-dark-700 text-center">
            <p className="text-[10px] font-mono text-dark-500 uppercase">加急</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="px-3 py-1.5 bg-dark-800/50 border-b border-dark-700">
            <p className="text-xs font-display font-medium text-industrial-400">
              打印机 ({printers.length}台)
            </p>
          </div>
          {scheduleData.printers.map((p) => (
            <ScheduleRow
              key={p.id}
              name={p.name}
              status={p.status}
              isRunning={p.isRunning}
              blocks={p.blocks}
              stationType="printer"
            />
          ))}
        </div>

        <div className="mb-2">
          <div className="px-3 py-1.5 bg-dark-800/50 border-y border-dark-700">
            <p className="text-xs font-display font-medium text-cyan-400">
              清洗工位 ({cleaningStations.length}台)
            </p>
          </div>
          {scheduleData.cleaningStations.map((s) => (
            <ScheduleRow
              key={s.id}
              name={s.name}
              status={s.status}
              isRunning={s.isRunning}
              blocks={s.blocks}
              stationType="cleaning"
            />
          ))}
        </div>

        <div>
          <div className="px-3 py-1.5 bg-dark-800/50 border-y border-dark-700">
            <p className="text-xs font-display font-medium text-purple-400">
              固化工位 ({curingStations.length}台)
            </p>
          </div>
          {scheduleData.curingStations.map((s) => (
            <ScheduleRow
              key={s.id}
              name={s.name}
              status={s.status}
              isRunning={s.isRunning}
              blocks={s.blocks}
              stationType="curing"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card-industrial p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-industrial-400" />
          <h3 className="font-display font-semibold text-lg text-dark-50">
            实时产能看板
          </h3>
          {isToday && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-green-500/15 text-green-400 rounded-sm border border-green-500/30">
              LIVE
            </span>
          )}
          <div className="flex items-center bg-dark-800 border border-dark-700 rounded-sm p-0.5">
            <button
              onClick={() => setActiveTab("realtime")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded-sm transition-colors",
                activeTab === "realtime"
                  ? "bg-industrial-500/20 text-industrial-400"
                  : "text-dark-400 hover:text-dark-200"
              )}
            >
              实时数据
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "px-3 py-1 text-xs font-mono rounded-sm transition-colors",
                activeTab === "schedule"
                  ? "bg-industrial-500/20 text-industrial-400"
                  : "text-dark-400 hover:text-dark-200"
              )}
            >
              生产排程
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dark-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-industrial text-xs py-1.5 px-2"
          />
        </div>
      </div>

      {activeTab === "realtime" ? renderRealtimeView() : renderScheduleView()}
    </div>
  );
}

export default function Dashboard() {
  const orders = useFactoryStore((s) => s.orders);
  const printers = useFactoryStore((s) => s.printers);
  const dailyStats = useFactoryStore((s) => s.dailyStats);
  const resins = useFactoryStore((s) => s.resins);

  const todayOrders = orders.filter((o) =>
    o.createdAt.startsWith("2026-06-17")
  ).length;
  const printingOrders = orders.filter((o) => o.status === "printing").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const reviewedOrders = orders.filter((o) => o.review);
  const avgRating = reviewedOrders.length > 0
    ? (reviewedOrders.reduce((sum, o) => sum + (o.review?.rating || 0), 0) / reviewedOrders.length).toFixed(1)
    : "—";

  const resinLow = resins.filter((r) => r.stock < 3).length;
  const activePrinters = printers.filter((p) => p.status === "printing").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">
            工厂控制中心
          </h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            实时监控生产状态，全流程可视化管理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-dark-300">实时数据</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          icon={ClipboardList}
          label="今日订单"
          value={todayOrders}
          subValue={`共 ${orders.length} 个活跃订单`}
          trend="↑ 12% 较昨日"
          color="blue"
        />
        <StatCard
          icon={Printer}
          label="打印任务"
          value={`${activePrinters}/${printers.length}`}
          subValue={`${printingOrders} 个订单打印中`}
          trend="设备利用率 72%"
          color="green"
        />
        <StatCard
          icon={CheckCircle2}
          label="已完成订单"
          value={completedOrders}
          subValue={`营收 ¥${totalRevenue.toLocaleString()}`}
          trend="↑ 8% 较上周"
          color="amber"
        />
        <StatCard
          icon={Beaker}
          label="树脂库存"
          value={resins.length}
          subValue={`${resinLow} 种库存偏低`}
          trend={resinLow > 0 ? "⚠ 需补货" : "库存充足"}
          color={resinLow > 0 ? "red" : "blue"}
        />
        <StatCard
          icon={Star}
          label="本月平均评分"
          value={avgRating}
          subValue={`${reviewedOrders.length} 条评价`}
          trend={avgRating !== "—" && parseFloat(avgRating) >= 4 ? "好评如潮" : ""}
          color="amber"
        />
      </div>

      <PrintersPanel />

      <CapacityDashboard />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card-industrial p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-dark-50">
              近7日生产数据
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-industrial-500 rounded-sm" />
                新增订单
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
                完成订单
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  fontFamily="'IBM Plex Mono', monospace"
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  fontFamily="'IBM Plex Mono', monospace"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(14,165,233,0.05)" }} />
                <Bar
                  dataKey="ordersReceived"
                  name="新增订单"
                  fill={COLORS.blue}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="ordersCompleted"
                  name="完成订单"
                  fill={COLORS.green}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-industrial p-5">
          <h3 className="font-display font-semibold text-lg text-dark-50 mb-4">
            树脂用量趋势 (L)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  fontFamily="'IBM Plex Mono', monospace"
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  fontFamily="'IBM Plex Mono', monospace"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="resinUsed"
                  name="树脂用量"
                  stroke={COLORS.amber}
                  strokeWidth={2.5}
                  dot={{ fill: COLORS.amber, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: COLORS.amber }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrders />

        <div className="card-industrial p-5">
          <h3 className="font-display font-semibold text-lg text-dark-50 mb-4">
            生产进度总览
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <CircularProgress
                value={(printingOrders / orders.length) * 100}
                size={72}
                color={COLORS.blue}
              />
              <div className="flex-1">
                <p className="font-display font-semibold text-dark-100">打印中</p>
                <p className="text-sm font-mono text-dark-500">
                  {printingOrders} 个订单正在打印
                </p>
                <p className="text-xs font-mono text-industrial-400 mt-1">
                  占比 {Math.round((printingOrders / orders.length) * 100)}%
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-dark-700">
              {[
                { label: "待审核", count: orders.filter((o) => o.status === "pending").length, color: "text-amber-400" },
                { label: "排版中", count: orders.filter((o) => o.status === "layout").length, color: "text-purple-400" },
                { label: "清洗固化", count: orders.filter((o) => ["cleaning", "curing"].includes(o.status)).length, color: "text-cyan-400" },
                { label: "去支撑质检", count: orders.filter((o) => ["support", "qc"].includes(o.status)).length, color: "text-orange-400" },
                { label: "发货中", count: orders.filter((o) => o.status === "shipping").length, color: "text-green-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-sm font-display text-dark-300">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-sm font-mono font-medium ${item.color}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
