import {
  ClipboardList,
  Printer,
  Beaker,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
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
  Legend,
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
      </div>

      <PrintersPanel />

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
                { label: "清洗固化", count: orders.filter((o) => ["cleaning"].includes(o.status)).length, color: "text-cyan-400" },
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
