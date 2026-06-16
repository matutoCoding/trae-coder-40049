import { useState } from "react";
import {
  Truck,
  Package,
  MapPin,
  User,
  Phone,
  FileText,
  Search,
  ChevronDown,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Eye,
  Star,
  AlertTriangle,
  X,
} from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import { OrderStatusBadge } from "../components/StatusBadges";
import { cn } from "../lib/utils";

const carriers = [
  { value: "顺丰速运", label: "顺丰速运", logo: "SF", color: "text-black" },
  { value: "京东物流", label: "京东物流", logo: "JD", color: "text-red-500" },
  { value: "圆通速递", label: "圆通速递", logo: "YT", color: "text-purple-500" },
  { value: "中通快递", label: "中通快递", logo: "ZT", color: "text-blue-500" },
];

export default function Delivery() {
  const orders = useFactoryStore((s) => s.orders).filter((o) =>
    ["qc", "shipping", "completed"].includes(o.status)
  );
  const shipOrder = useFactoryStore((s) => s.shipOrder);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.find((o) => o.status === "qc" || o.status === "shipping")?.id || null
  );
  const [carrier, setCarrier] = useState("顺丰速运");
  const [trackingNo, setTrackingNo] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [modalCarrier, setModalCarrier] = useState("顺丰速运");
  const [modalTrackingNo, setModalTrackingNo] = useState("");

  const readyOrders = orders.filter((o) => o.status === "qc");
  const shippingOrders = orders.filter((o) => o.status === "shipping");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const generateTrackingNo = () => {
    const prefix = carrier === "顺丰速运" ? "SF" : carrier === "京东物流" ? "JD" : "YT";
    const random = Math.random().toString().slice(2, 14);
    setTrackingNo(`${prefix}${random}`);
  };

  const generateModalTrackingNo = () => {
    const prefix = modalCarrier === "顺丰速运" ? "SF" : modalCarrier === "京东物流" ? "JD" : "YT";
    const random = Math.random().toString().slice(2, 14);
    setModalTrackingNo(`${prefix}${random}`);
  };

  const handleOpenShipModal = () => {
    setModalCarrier("顺丰速运");
    setModalTrackingNo("");
    setShowShipModal(true);
  };

  const handleConfirmShip = () => {
    if (selectedOrder && modalCarrier && modalTrackingNo) {
      shipOrder(selectedOrder.id, modalCarrier, modalTrackingNo);
      setShowShipModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">成品交付</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            质检报告、包装管理、物流邮寄、客户签收归档
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "待发货", value: readyOrders.length, color: "text-green-400", icon: Package },
          { label: "运输中", value: shippingOrders.length, color: "text-industrial-400", icon: Truck },
          { label: "已签收", value: completedOrders.length, color: "text-amber-400", icon: CheckCircle2 },
          { label: "本月交付", value: 47, color: "text-purple-400", icon: FileText },
        ].map((item) => (
          <div key={item.label} className="card-industrial p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-dark-500">{item.label}</p>
                <p className={cn("text-2xl font-display font-bold mt-1", item.color)}>
                  {item.value}
                </p>
              </div>
              <div className={cn("p-2 bg-dark-900 rounded-sm border border-dark-700", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-dark-100">订单列表</h3>
            </div>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索订单号..."
                className="input-industrial pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-sm border transition-all",
                    selectedOrderId === order.id
                      ? "bg-industrial-500/10 border-industrial-500/50"
                      : "bg-dark-900/50 border-dark-700 hover:border-dark-600"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-industrial-400">
                      {order.orderNo}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm font-display text-dark-300 truncate mb-1">
                    {order.customerName}
                  </p>
                  <p className="text-xs font-mono text-amber-400">
                    ¥{order.totalPrice.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedOrder ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-industrial-400" />
                    收件人信息
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-mono text-dark-500">客户名称</p>
                        <p className="font-display text-dark-100">
                          {selectedOrder.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-mono text-dark-500">联系电话</p>
                        <p className="font-mono text-dark-200">{selectedOrder.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-mono text-dark-500">收货地址</p>
                        <p className="font-display text-dark-200">
                          {selectedOrder.customerAddress || "未填写地址，请联系客户确认"}
                        </p>
                      </div>
                    </div>
                    {!selectedOrder.customerAddress && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-mono text-amber-400">缺少收货地址</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-400" />
                    包装清单
                  </h3>
                  <div className="space-y-2 mb-4">
                    {selectedOrder.modelFiles.map((file, idx) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-sm border border-dark-700"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-industrial-500/15 rounded-sm flex items-center justify-center">
                            <span className="font-mono text-xs text-industrial-400">
                              {idx + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-display text-dark-200">{file.name}</p>
                            <p className="text-xs font-mono text-dark-500">
                              {file.dimensions.x}×{file.dimensions.y}×{file.dimensions.z}mm
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-dark-400">
                            x{selectedOrder.quantity}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-dark-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-dark-500">包装材料</span>
                      <span className="font-display text-dark-300">气泡膜 + 硬纸盒</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-dark-500">包装数量</span>
                      <span className="font-display text-dark-300">
                        {Math.ceil(selectedOrder.quantity / 5)} 盒
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-dark-500">随附文件</span>
                      <span className="font-display text-dark-300">质检报告、送货单</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-industrial p-5">
                <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-industrial-400" />
                  物流信息
                </h3>
                {selectedOrder.shippingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <p className="text-xs font-mono text-dark-500 mb-1">承运商</p>
                        <p className="font-display text-dark-100">{selectedOrder.shippingInfo.carrier}</p>
                      </div>
                      <div className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <p className="text-xs font-mono text-dark-500 mb-1">运单号</p>
                        <p className="font-mono text-industrial-400">{selectedOrder.shippingInfo.trackingNo}</p>
                      </div>
                      <div className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <p className="text-xs font-mono text-dark-500 mb-1">发货时间</p>
                        <p className="font-mono text-dark-200">{selectedOrder.shippingInfo.shippedAt}</p>
                      </div>
                    </div>
                    {selectedOrder.shippingInfo.confirmedBy && selectedOrder.shippingInfo.confirmedAt && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-sm">
                        <h4 className="font-display font-medium text-green-400 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          客户确认信息
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-mono text-dark-500">签收人</p>
                            <p className="font-display text-dark-100">{selectedOrder.shippingInfo.confirmedBy}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500">签收时间</p>
                            <p className="font-mono text-dark-200">{selectedOrder.shippingInfo.confirmedAt}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-industrial">快递公司</label>
                      <div className="grid grid-cols-2 gap-2">
                        {carriers.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setCarrier(c.value)}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-sm border transition-all text-left",
                              carrier === c.value
                                ? "bg-industrial-500/10 border-industrial-500/50"
                                : "bg-dark-900/50 border-dark-700 hover:border-dark-600"
                            )}
                          >
                            <span className={cn("font-mono font-bold text-sm", c.color)}>
                              {c.logo}
                            </span>
                            <span className="text-sm font-display text-dark-200">
                              {c.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label-industrial">运单号</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="输入或自动生成运单号"
                          value={trackingNo}
                          onChange={(e) => setTrackingNo(e.target.value)}
                          className="input-industrial flex-1"
                        />
                        <button
                          onClick={generateTrackingNo}
                          className="btn-secondary px-3"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                  <h4 className="font-display font-medium text-dark-200 mb-3">物流跟踪</h4>
                  {selectedOrder.shippingInfo ? (
                    <div className="relative pl-5">
                      <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-dark-700" />
                      {[
                        {
                          label: "订单创建",
                          time: selectedOrder.createdAt,
                          done: true,
                          active: false,
                        },
                        {
                          label: "已发货",
                          time: selectedOrder.shippingInfo.shippedAt,
                          done: true,
                          active: false,
                        },
                        {
                          label: "运输中",
                          time: "2026-06-16 20:15:00",
                          done: true,
                          active: selectedOrder.status === "shipping",
                        },
                        {
                          label: "派送中",
                          time: "预计 2026-06-17 14:00",
                          done: selectedOrder.status === "completed",
                          active: false,
                        },
                        {
                          label: "已签收",
                          time: selectedOrder.shippingInfo.deliveredAt || "待签收",
                          done: !!selectedOrder.shippingInfo.deliveredAt,
                          active: false,
                        },
                      ].map((step, idx) => (
                        <div key={idx} className="relative pb-4 last:pb-0">
                          <div
                            className={cn(
                              "absolute -left-5 top-1 w-4 h-4 rounded-full border-2 z-10",
                              step.done
                                ? "bg-green-500 border-green-500"
                                : step.active
                                ? "bg-industrial-500 border-industrial-500 animate-pulse"
                                : "bg-dark-900 border-dark-600"
                            )}
                          />
                          <div className="ml-2">
                            <p
                              className={cn(
                                "text-sm font-display",
                                step.done || step.active
                                  ? "text-dark-100"
                                  : "text-dark-500"
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-xs font-mono text-dark-500">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-sm font-display text-dark-500">
                        订单尚未发货，请填写物流信息后确认发货
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="btn-secondary flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    打印面单
                  </button>
                  <button className="btn-secondary flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    质检报告
                  </button>
                  {selectedOrder.status === "qc" && (
                    <button
                      onClick={handleOpenShipModal}
                      className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      生成运单号并发货
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    电子签收
                  </h3>
                  {showSignature ? (
                    <div className="space-y-4">
                      <div className="h-32 bg-dark-900/50 border-2 border-dashed border-dark-600 rounded-sm flex items-center justify-center">
                        <p className="text-sm font-mono text-dark-500">
                          手写签名区域（模拟）
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label-industrial">签收人</label>
                          <input
                            type="text"
                            defaultValue={selectedOrder.customerName}
                            className="input-industrial"
                          />
                        </div>
                        <div>
                          <label className="label-industrial">签收时间</label>
                          <input
                            type="text"
                            defaultValue={new Date()
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19)}
                            className="input-industrial"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSignature(false)}
                          className="btn-secondary flex-1"
                        >
                          取消
                        </button>
                        <button className="btn-primary flex-1">确认签收</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm font-mono text-dark-500 mb-3">
                        客户已收到货物？请完成签收确认
                      </p>
                      <button
                        onClick={() => setShowSignature(true)}
                        className="btn-primary"
                      >
                        <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                        客户签收
                      </button>
                    </div>
                  )}
                </div>

                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    客户评价
                  </h3>
                  {selectedOrder.status === "completed" && selectedOrder.review ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-6 h-6",
                              s <= selectedOrder.review!.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-dark-600"
                            )}
                          />
                        ))}
                        <span className="ml-2 font-mono text-sm text-dark-400">
                          {selectedOrder.review.rating}.0 分
                        </span>
                      </div>
                      <div className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <p className="text-sm font-display text-dark-200">
                          "{selectedOrder.review.comment}"
                        </p>
                        <p className="text-xs font-mono text-dark-500 mt-2 text-right">
                          — {selectedOrder.customerName} · {selectedOrder.review.reviewedAt}
                        </p>
                      </div>
                    </div>
                  ) : selectedOrder.status === "completed" ? (
                    <div className="text-center py-6">
                      <Star className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-sm font-display text-dark-500">
                        客户尚未评价
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Star className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-sm font-display text-dark-500">
                        订单完成后客户可进行评价
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-industrial p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-dark-100">订单归档</h3>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      预览单据
                    </button>
                    <button className="btn-secondary text-sm flex items-center gap-1.5">
                      <Download className="w-4 h-4" />
                      下载归档
                    </button>
                    {selectedOrder.status === "completed" && (
                      <button className="btn-primary text-sm">完成归档</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "订单单据", status: "已生成" },
                    { label: "质检报告", status: selectedOrder.qcResult ? "已生成" : "待生成" },
                    { label: "物流凭证", status: selectedOrder.shippingInfo ? "已生成" : "待生成" },
                    { label: "签收单据", status: selectedOrder.shippingInfo?.deliveredAt ? "已生成" : "待生成" },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-display text-dark-300">
                          {doc.label}
                        </span>
                        {doc.status === "已生成" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-dark-500" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs font-mono",
                          doc.status === "已生成" ? "text-green-400" : "text-dark-500"
                        )}
                      >
                        {doc.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card-industrial p-12 text-center">
              <Truck className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <p className="font-display text-lg text-dark-400">请选择订单</p>
              <p className="text-sm font-mono text-dark-600 mt-1">
                从左侧列表选择订单查看详情
              </p>
            </div>
          )}
        </div>
      </div>

      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card-industrial p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-dark-100 text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-industrial-400" />
                确认发货
              </h3>
              <button
                onClick={() => setShowShipModal(false)}
                className="p-1 hover:bg-dark-700 rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-industrial-500/10 border border-industrial-500/20 rounded-sm">
                <p className="text-xs font-mono text-dark-500">订单号</p>
                <p className="font-mono text-industrial-400">{selectedOrder.orderNo}</p>
              </div>

              <div>
                <label className="label-industrial">选择承运商</label>
                <div className="grid grid-cols-2 gap-2">
                  {carriers.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setModalCarrier(c.value)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-sm border transition-all text-left",
                        modalCarrier === c.value
                          ? "bg-industrial-500/10 border-industrial-500/50"
                          : "bg-dark-900/50 border-dark-700 hover:border-dark-600"
                      )}
                    >
                      <span className={cn("font-mono font-bold text-base", c.color)}>
                        {c.logo}
                      </span>
                      <span className="text-sm font-display text-dark-200">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-industrial">运单号</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入或点击右侧自动生成运单号"
                    value={modalTrackingNo}
                    onChange={(e) => setModalTrackingNo(e.target.value)}
                    className="input-industrial flex-1"
                  />
                  <button
                    onClick={generateModalTrackingNo}
                    className="btn-secondary px-3"
                    title="自动生成运单号"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowShipModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmShip}
                  disabled={!modalTrackingNo}
                  className={cn(
                    "btn-primary flex-1 flex items-center justify-center gap-2",
                    !modalTrackingNo && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                  确认发货
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
