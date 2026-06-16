import { useState } from "react";
import { Search, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import { cn } from "../lib/utils";
import type { OrderStatus, Order } from "../types";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "待审核" },
  { key: "reviewed", label: "已审核" },
  { key: "layout", label: "排版中" },
  { key: "printing", label: "打印中" },
  { key: "cleaning", label: "清洗中" },
  { key: "support", label: "去支撑" },
  { key: "qc", label: "质检中" },
  { key: "shipping", label: "发货中" },
  { key: "completed", label: "已完成" },
];

const STEP_INDEX: Record<OrderStatus, number> = Object.fromEntries(
  STEPS.map((s, i) => [s.key, i])
) as Record<OrderStatus, number>;

const MOCK_ETA: Record<OrderStatus, string> = {
  pending: "预计 2 小时内审核",
  reviewed: "预计 1 小时内开始排版",
  layout: "预计 30 分钟完成排版",
  printing: "预计 4 小时完成打印",
  cleaning: "预计 30 分钟完成清洗",
  support: "预计 1 小时完成去支撑",
  qc: "预计 45 分钟完成质检",
  shipping: "预计 1-3 天送达",
  completed: "已送达",
};

export default function CustomerPortal() {
  const orders = useFactoryStore((s) => s.orders);
  const [keyword, setKeyword] = useState("");

  const filtered = orders.filter((o) => {
    if (!keyword.trim()) return true;
    const kw = keyword.trim().toLowerCase();
    return (
      o.orderNo.toLowerCase().includes(kw) ||
      o.customerName.toLowerCase().includes(kw)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">
            接单大厅
          </h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            实时查看订单生产进度与物流状态
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-dark-500">
            共 {filtered.length} 笔订单
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          className="input-industrial pl-9 w-full max-w-md"
          placeholder="搜索订单号或客户名称..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card-industrial p-12 text-center">
          <Package className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="font-display text-dark-400">未找到匹配的订单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const currentIdx = STEP_INDEX[order.status];

  return (
    <div className="card-industrial p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-dark-50 text-lg">
              {order.orderNo}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-sm text-xs font-mono font-medium",
                order.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : order.status === "shipping"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-industrial-500/15 text-industrial-400"
              )}
            >
              {STEPS[currentIdx].label}
            </span>
          </div>
          <p className="text-sm font-mono text-dark-400">
            {order.customerName}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xl font-display font-bold text-amber-400">
            ¥{order.totalPrice.toLocaleString()}
          </p>
          <p className="text-xs font-mono text-dark-500">
            {order.materialType} · {order.materialColor}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center relative z-10"
                style={{ width: `${100 / STEPS.length}%` }}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-emerald-400 border-emerald-400"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20"
                      : "bg-dark-800 border-dark-600"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-mono mt-1.5 text-center leading-tight whitespace-nowrap",
                    isCompleted
                      ? "text-emerald-400"
                      : isCurrent
                      ? "text-blue-400"
                      : "text-dark-600"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-[5px] left-0 right-0 h-[2px] bg-dark-700 -z-0">
          <div
            className={cn(
              "h-full transition-all",
              currentIdx === 0
                ? "bg-transparent"
                : "bg-emerald-400/60"
            )}
            style={{
              width: `${(currentIdx / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Clock className="w-3.5 h-3.5 text-dark-500" />
        <span className="text-xs font-mono text-dark-400">
          {MOCK_ETA[order.status]}
        </span>
      </div>

      {(order.status === "shipping" || order.status === "completed") &&
        order.shippingInfo && (
          <div className="mt-2 p-3 bg-dark-900 border border-dark-700 rounded-sm space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-display font-medium text-dark-100">
                物流信息
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-dark-500">承运商</span>
                <span className="text-dark-200">
                  {order.shippingInfo.carrier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">运单号</span>
                <span className="text-dark-200">
                  {order.shippingInfo.trackingNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">发货时间</span>
                <span className="text-dark-200">
                  {order.shippingInfo.shippedAt}
                </span>
              </div>
              {order.shippingInfo.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-dark-500">签收时间</span>
                  <span className="text-emerald-400">
                    {order.shippingInfo.deliveredAt}
                  </span>
                </div>
              )}
            </div>
            {order.status === "completed" && (
              <div className="flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400">
                  已签收
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
