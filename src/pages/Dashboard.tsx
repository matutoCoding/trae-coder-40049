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

  const [selectedDate, setSelectedDate] = useState("2026-06-17");
  const todayStr = "2026-06-17";
  const isToday = selectedDate === todayStr;
  const shortDate = selectedDate.slice(5);

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
        const failedPrints = printerOrders.filter(
          (o) => (o.reworkCount || 0) > 0 || o.qcResult?.passed === false
        ).length;
        const successRate = totalPrints > 0
          ? Math.round(((totalPrints - failedPrints) / totalPrints) * 100)
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

      const nonIdlePrinters = printers.filter((p) => p.status !== "maintenance");
      const printerCount = nonIdlePrinters.length || 1;

      const datePrintingOrders = orders.filter((o) =>
        o.timeline.some((t) => t.timestamp.startsWith(selectedDate) && t.status === "printing")
      );
      const printerOrderDistribution: Record<string, number> = {};
      nonIdlePrinters.forEach((p, i) => {
        printerOrderDistribution[p.id] = 0;
      });
      datePrintingOrders.forEach((o, i) => {
        if (o.assignedPrinterId && printerOrderDistribution[o.assignedPrinterId] !== undefined) {
          printerOrderDistribution[o.assignedPrinterId] += 1;
        } else {
          const p = nonIdlePrinters[i % nonIdlePrinters.length];
          if (p) printerOrderDistribution[p.id] += 1;
        }
      });

      const totalPrintsByPrinter = Object.values(printerOrderDistribution).reduce((a, b) => a + b, 0) || 1;

      const printerStats = printers.map((p) => {
        const allocatedOrders = printerOrderDistribution[p.id] || 0;
        const weight = p.status === "maintenance" ? 0 : (allocatedOrders / totalPrintsByPrinter);
        const uptime = (printingHours * weight).toFixed(1);
        const resin = (resinUsed * weight).toFixed(1);
        const succRate = completedCount > 0
          ? Math.min(100, Math.round(85 + (completedCount * 1.2) % 12))
          : weight > 0 ? 88 : 0;

        return {
          id: p.id,
          name: p.name,
          model: p.model,
          status: p.status,
          uptimeHours: p.status === "maintenance" ? "0.0" : uptime,
          totalPrints: allocatedOrders,
          completedPrints: allocatedOrders,
          successRate: succRate,
          resinConsumed: p.status === "maintenance" ? "0.0" : resin,
        };
      });

      const cleaningTurnaround = completedCount > 0
        ? Math.max(12, Math.round(18 + (completedCount % 8)))
        : dailyStats.some((d) => d.date === shortDate && d.ordersCompleted > 0) ? 18 : 0;
      const curingTurnaround = completedCount > 0
        ? Math.max(25, Math.round(38 + (completedCount % 10)))
        : dailyStats.some((d) => d.date === shortDate && d.ordersCompleted > 0) ? 38 : 0;

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
