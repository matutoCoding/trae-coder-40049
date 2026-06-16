import type { OrderStatus, PrinterStatus, StationStatus } from "../types";
import { cn } from "../lib/utils";

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: "待审核",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  reviewed: {
    label: "已审核",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    dotColor: "bg-blue-500",
  },
  layout: {
    label: "排版中",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    dotColor: "bg-purple-500",
  },
  printing: {
    label: "打印中",
    className: "bg-industrial-500/15 text-industrial-400 border border-industrial-500/30",
    dotColor: "bg-industrial-500 animate-pulse",
  },
  cleaning: {
    label: "清洗中",
    className: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    dotColor: "bg-cyan-500",
  },
  support: {
    label: "去支撑",
    className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    dotColor: "bg-orange-500",
  },
  qc: {
    label: "质检中",
    className: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
    dotColor: "bg-pink-500",
  },
  shipping: {
    label: "发货中",
    className: "bg-green-500/15 text-green-400 border border-green-500/30",
    dotColor: "bg-green-500",
  },
  completed: {
    label: "已完成",
    className: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
    dotColor: "bg-gray-500",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status];
  return (
    <span className={cn("badge-status", config.className)}>
      <span className={cn("status-dot", config.dotColor)} />
      {config.label}
    </span>
  );
}

const printerStatusConfig: Record<
  PrinterStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: "空闲",
    className: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
    dotColor: "bg-gray-500",
  },
  printing: {
    label: "打印中",
    className: "bg-industrial-500/15 text-industrial-400 border border-industrial-500/30",
    dotColor: "bg-industrial-500 animate-pulse",
  },
  paused: {
    label: "暂停",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    dotColor: "bg-amber-500",
  },
  maintenance: {
    label: "维护中",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
    dotColor: "bg-red-500",
  },
};

export function PrinterStatusBadge({ status }: { status: PrinterStatus }) {
  const config = printerStatusConfig[status];
  return (
    <span className={cn("badge-status", config.className)}>
      <span className={cn("status-dot", config.dotColor)} />
      {config.label}
    </span>
  );
}

const stationStatusConfig: Record<
  StationStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: "空闲",
    className: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
    dotColor: "bg-gray-500",
  },
  cleaning: {
    label: "清洗中",
    className: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    dotColor: "bg-cyan-500 animate-pulse",
  },
  curing: {
    label: "固化中",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    dotColor: "bg-purple-500 animate-pulse",
  },
  completed: {
    label: "已完成",
    className: "bg-green-500/15 text-green-400 border border-green-500/30",
    dotColor: "bg-green-500",
  },
};

export function StationStatusBadge({ status }: { status: StationStatus }) {
  const config = stationStatusConfig[status];
  return (
    <span className={cn("badge-status", config.className)}>
      <span className={cn("status-dot", config.dotColor)} />
      {config.label}
    </span>
  );
}

export function ProgressBar({
  value,
  color = "blue",
  height = "h-2",
}: {
  value: number;
  color?: "blue" | "amber" | "green" | "red";
  height?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-industrial-600 to-industrial-400",
    amber: "from-amber-600 to-amber-400",
    green: "from-green-600 to-green-400",
    red: "from-red-600 to-red-400",
  };

  return (
    <div className={cn("w-full bg-dark-700 rounded-sm overflow-hidden", height)}>
      <div
        className={cn(
          "h-full bg-gradient-to-r transition-all duration-500",
          colorClasses[color]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = "#0EA5E9",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#334155"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <text
        x={size / 2}
        y={size / 2}
        className="rotate-90 origin-center"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#E2E8F0"
        fontSize={size * 0.22}
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="600"
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  color?: "blue" | "amber" | "green" | "red";
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-industrial-500/15 text-industrial-400 border-industrial-500/30 hover:shadow-glow-blue",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:shadow-glow-amber",
    green: "bg-green-500/15 text-green-400 border-green-500/30 hover:shadow-glow-green",
    red: "bg-red-500/15 text-red-400 border-red-500/30 hover:shadow-glow-red",
  };

  return (
    <div
      className={cn(
        "card-industrial p-5 border transition-all duration-300",
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-display font-medium uppercase tracking-wider text-dark-400">
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-dark-50 mt-2">
            {value}
          </p>
          {subValue && (
            <p className="text-sm font-mono text-dark-500 mt-1">{subValue}</p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-sm flex items-center justify-center border",
            colorClasses[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-dark-700">
          <span className="text-xs font-mono text-green-400">{trend}</span>
        </div>
      )}
    </div>
  );
}
