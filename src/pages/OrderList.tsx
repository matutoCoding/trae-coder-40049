import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  FileText,
  Phone,
  Mail,
  Package,
  Calendar,
  User,
  Clock,
  DollarSign,
  Layers,
  Box,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFactoryStore } from "../store/useFactoryStore";
import { OrderStatusBadge } from "../components/StatusBadges";
import type { Order, OrderStatus } from "../types";
import { cn } from "../lib/utils";

const statusFilters: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待审核" },
  { value: "reviewed", label: "已审核" },
  { value: "layout", label: "排版中" },
  { value: "printing", label: "打印中" },
  { value: "cleaning", label: "清洗中" },
  { value: "curing", label: "固化中" },
  { value: "support", label: "去支撑" },
  { value: "qc", label: "质检中" },
  { value: "shipping", label: "发货中" },
  { value: "completed", label: "已完成" },
];

export default function OrderList() {
  const navigate = useNavigate();
  const orders = useFactoryStore((s) => s.orders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    printing: orders.filter((o) => o.status === "printing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">在线接单</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            管理客户订单，审核报价，跟踪全流程进度
          </p>
        </div>
        <button
          onClick={() => navigate("/orders/new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建订单
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "订单总数", value: stats.total, color: "text-industrial-400", icon: FileText },
          { label: "待审核", value: stats.pending, color: "text-amber-400", icon: Clock },
          { label: "打印中", value: stats.printing, color: "text-green-400", icon: Box },
          { label: "已完成", value: stats.completed, color: "text-dark-300", icon: Package },
        ].map((item) => (
          <div key={item.label} className="card-industrial p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 bg-dark-900 rounded-sm border border-dark-700", item.color)}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono text-dark-500">{item.label}</p>
                <p className={cn("text-2xl font-display font-bold", item.color)}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-industrial">
        <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-display rounded-sm border transition-all",
                  statusFilter === filter.value
                    ? "bg-industrial-500/20 text-industrial-400 border-industrial-500/50"
                    : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-600 hover:text-dark-200"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索订单号、客户名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-industrial pl-9"
              />
            </div>
            <button className="btn-secondary flex items-center gap-1.5">
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <button className="btn-secondary flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-industrial">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" className="rounded-sm border-dark-600 bg-dark-900" />
                </th>
                <th>订单号</th>
                <th>客户信息</th>
                <th>模型数量</th>
                <th>材料</th>
                <th>数量</th>
                <th>金额</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: Order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded-sm border-dark-600 bg-dark-900" />
                  </td>
                  <td>
                    <span className="font-mono text-industrial-400 font-medium">
                      {order.orderNo}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p className="font-display font-medium text-dark-100">
                        {order.customerName}
                      </p>
                      <p className="text-xs font-mono text-dark-500">
                        {order.customerPhone}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-dark-300">
                      {order.modelFiles.length} 个文件
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-dark-300">{order.materialType}</span>
                    <span className="text-xs text-dark-500 ml-1">({order.materialColor})</span>
                  </td>
                  <td>
                    <span className="font-mono text-dark-300">x{order.quantity}</span>
                  </td>
                  <td>
                    <span className="font-mono font-semibold text-amber-400">
                      ¥{order.totalPrice.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-dark-500">
                      {order.createdAt}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <OrderStatusBadge status={order.status} />
                      {(order.reworkCount || 0) >= 2 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-red-500/15 text-red-400 rounded-sm border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          高风险
                        </span>
                      )}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="text-industrial-400 hover:text-industrial-300 text-sm font-display flex items-center gap-1">
                      详情
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-dark-700 flex items-center justify-between">
          <p className="text-xs font-mono text-dark-500">
            共 {filteredOrders.length} 条记录
          </p>
          <div className="flex gap-1">
            {["上一页", "1", "2", "3", "下一页"].map((page, idx) => (
              <button
                key={idx}
                className={cn(
                  "px-3 py-1 text-xs font-mono rounded-sm border transition-all",
                  page === "1"
                    ? "bg-industrial-500/20 text-industrial-400 border-industrial-500/50"
                    : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-600"
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
