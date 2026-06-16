import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Box,
  Layers,
  DollarSign,
  Clock,
  Calendar,
  ChevronRight,
  Send,
  CheckCircle2,
  Printer,
  Droplets,
  Sun,
  Wrench,
  Truck,
  Package,
  Star,
  AlertTriangle,
  Download,
  Eye,
  Edit3,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFactoryStore } from "../store/useFactoryStore";
import { OrderStatusBadge, ProgressBar } from "../components/StatusBadges";
import { cn } from "../lib/utils";

const processSteps = [
  { key: "pending", label: "待审核", icon: FileText },
  { key: "reviewed", label: "已审核", icon: CheckCircle2 },
  { key: "layout", label: "排版中", icon: Layers },
  { key: "printing", label: "打印中", icon: Printer },
  { key: "cleaning", label: "清洗中", icon: Droplets },
  { key: "curing", label: "固化中", icon: Sun },
  { key: "support", label: "去支撑", icon: Wrench },
  { key: "qc", label: "质检中", icon: Star },
  { key: "shipping", label: "发货中", icon: Truck },
  { key: "completed", label: "已完成", icon: Package },
];

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useFactoryStore((s) => s.getOrderById(id || ""));
  const printers = useFactoryStore((s) => s.printers);
  const cleaningStations = useFactoryStore((s) => s.cleaningStations);
  const curingStations = useFactoryStore((s) => s.curingStations);
  const advanceSimple = useFactoryStore((s) => s.advanceSimple);
  const advanceToPrinting = useFactoryStore((s) => s.advanceToPrinting);
  const advanceToCleaning = useFactoryStore((s) => s.advanceToCleaning);
  const advanceToCuring = useFactoryStore((s) => s.advanceToCuring);
  const updateOrderStatus = useFactoryStore((s) => s.updateOrderStatus);

  const [activeTab, setActiveTab] = useState<"info" | "files" | "timeline" | "messages">("info");
  const [deviceSelector, setDeviceSelector] = useState<"printer" | "cleaning" | "curing" | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  if (!order) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="font-display text-lg text-dark-200">订单不存在</p>
          <button onClick={() => navigate("/orders")} className="btn-primary mt-4">
            返回订单列表
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = processSteps.findIndex((s) => s.key === order.status);
  const assignedPrinter = printers.find((p) => p.id === order.assignedPrinterId);

  const tabs = [
    { key: "info", label: "订单信息", icon: FileText },
    { key: "files", label: "模型文件", icon: Box },
    { key: "timeline", label: "进度时间线", icon: Clock },
    { key: "messages", label: "沟通记录", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 rounded-sm hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-dark-50">
                订单详情
              </h1>
              <OrderStatusBadge status={order.status} />
              {(order.reworkCount || 0) >= 2 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-red-500/15 text-red-400 rounded-sm border border-red-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  高风险（返修{order.reworkCount}次）
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-dark-500 mt-1">
              订单号: {order.orderNo} | 创建于 {order.createdAt}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            导出单据
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Edit3 className="w-4 h-4" />
            编辑订单
          </button>
        </div>
      </div>

      <div className="card-industrial p-5">
        <h3 className="font-display font-semibold text-dark-50 mb-4">生产流程进度</h3>
        <div className="relative">
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-dark-700" />
          <div
            className="absolute top-6 left-8 h-0.5 bg-industrial-500 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (processSteps.length - 1)) * 100}%`,
              maxWidth: "calc(100% - 64px)",
            }}
          />
          <div className="grid grid-cols-10 gap-2 relative">
            {processSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-sm flex items-center justify-center border-2 z-10 transition-all",
                      isActive
                        ? "bg-industrial-500/20 border-industrial-500 text-industrial-400 shadow-glow-blue"
                        : isCompleted
                        ? "bg-green-500/15 border-green-500/50 text-green-400"
                        : "bg-dark-800 border-dark-700 text-dark-500"
                    )}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p
                    className={cn(
                      "text-xs font-display mt-2 text-center",
                      isActive
                        ? "text-industrial-400 font-medium"
                        : isCompleted
                        ? "text-dark-200"
                        : "text-dark-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card-industrial">
            <div className="flex border-b border-dark-700">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 text-sm font-display border-b-2 transition-all",
                    activeTab === tab.key
                      ? "text-industrial-400 border-industrial-500 bg-industrial-500/5"
                      : "text-dark-400 border-transparent hover:text-dark-200 hover:bg-dark-800/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-industrial-400" />
                      客户信息
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">客户名称</p>
                        <p className="font-display text-dark-100">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">联系电话</p>
                        <p className="font-mono text-dark-200 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-dark-500" />
                          {order.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">电子邮箱</p>
                        <p className="font-mono text-dark-200 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-dark-500" />
                          {order.customerEmail}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-mono text-dark-500 mb-1">收货地址</p>
                        <p className="font-display text-dark-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-dark-500" />
                          {order.customerAddress || "未填写"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-industrial-400" />
                      打印参数
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">树脂材料</p>
                        <p className="font-display text-dark-100">{order.materialType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">材料颜色</p>
                        <p className="font-display text-dark-100">{order.materialColor}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">层厚</p>
                        <p className="font-mono text-dark-100">{order.layerHeight} mm</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-dark-500 mb-1">打印数量</p>
                        <p className="font-mono text-dark-100">x{order.quantity}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      费用明细
                    </h4>
                    <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-mono text-dark-400">模型打印费</span>
                          <span className="font-mono text-dark-200">¥{order.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-mono text-dark-400">数量</span>
                          <span className="font-mono text-dark-200">x{order.quantity}</span>
                        </div>
                        <div className="pt-2.5 mt-2.5 border-t border-dark-700 flex justify-between">
                          <span className="font-display font-semibold text-dark-100">订单总额</span>
                          <span className="text-xl font-display font-bold text-amber-400">
                            ¥{order.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.remark && (
                    <div>
                      <h4 className="font-display font-semibold text-dark-100 mb-3">备注说明</h4>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-sm">
                        <p className="text-sm font-display text-amber-200/80">{order.remark}</p>
                      </div>
                    </div>
                  )}

                  {order.qcResult && (
                    <div>
                      <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-pink-400" />
                        质检报告
                      </h4>
                      <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">质检结果</p>
                            <span
                              className={cn(
                                "badge-status",
                                order.qcResult.passed
                                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                                  : "bg-red-500/15 text-red-400 border-red-500/30"
                              )}
                            >
                              <span
                                className={cn(
                                  "status-dot",
                                  order.qcResult.passed ? "bg-green-500" : "bg-red-500"
                                )}
                              />
                              {order.qcResult.passed ? "合格" : "不合格"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">检验员</p>
                            <p className="font-display text-dark-100">{order.qcResult.inspector}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">表面评分</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    "w-4 h-4",
                                    s <= order.qcResult!.surfaceScore
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-dark-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">尺寸精度</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    "w-4 h-4",
                                    s <= order.qcResult!.dimensionalAccuracy
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-dark-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {order.qcResult.defects.length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-2">缺陷记录</p>
                            <ul className="space-y-1">
                              {order.qcResult.defects.map((d, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-red-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs font-mono text-dark-500 mt-4">
                          检验时间: {order.qcResult.inspectedAt}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shippingInfo && (
                    <div>
                      <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-400" />
                        物流信息
                      </h4>
                      <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">快递公司</p>
                            <p className="font-display text-dark-100">{order.shippingInfo.carrier}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">物流单号</p>
                            <p className="font-mono text-industrial-400">{order.shippingInfo.trackingNo}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">发货时间</p>
                            <p className="font-mono text-dark-200">{order.shippingInfo.shippedAt}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-dark-500 mb-1">签收时间</p>
                            <p className="font-mono text-green-400">
                              {order.shippingInfo.deliveredAt || "运输中"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.review && (
                    <div>
                      <h4 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        客户评价
                      </h4>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-sm">
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-5 h-5",
                                s <= order.review!.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-dark-600"
                              )}
                            />
                          ))}
                          <span className="ml-2 font-mono text-sm text-amber-400">
                            {order.review.rating}.0 分
                          </span>
                        </div>
                        <p className="text-sm text-dark-200">"{order.review.comment}"</p>
                        <p className="text-xs font-mono text-dark-500 mt-2">
                          — {order.customerName} · {order.review.reviewedAt}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "files" && (
                <div className="space-y-3">
                  {order.modelFiles.map((file, idx) => (
                    <div
                      key={file.id}
                      className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm hover:border-industrial-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-industrial-500/10 rounded-sm flex items-center justify-center">
                          <Box className="w-6 h-6 text-industrial-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-display font-medium text-dark-100">{file.name}</p>
                            {file.hasSupports && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-purple-500/15 text-purple-400 rounded-sm border border-purple-500/30">
                                已生成支撑
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1 text-xs font-mono text-dark-500">
                            <span>文件大小: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>尺寸: {file.dimensions.x}×{file.dimensions.y}×{file.dimensions.z} mm</span>
                            <span>体积: {file.volume} cm³</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-sm bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-industrial-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-sm bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-industrial-400 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="relative pl-6">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-dark-700" />
                  {order.timeline.map((event, idx) => (
                    <div key={idx} className="relative pb-6 last:pb-0">
                      <div className="absolute -left-6 top-1 w-6 h-6 bg-dark-800 border-2 border-industrial-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-industrial-500 rounded-full" />
                      </div>
                      <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm ml-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-semibold text-industrial-400">
                            {event.statusLabel}
                          </span>
                          <span className="text-xs font-mono text-dark-500">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-dark-300 mb-1">{event.remark}</p>
                        <p className="text-xs font-mono text-dark-500">操作人: {event.operator}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "messages" && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="font-display text-dark-400">暂无沟通记录</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="输入消息..."
                      className="input-industrial flex-1"
                    />
                    <button className="btn-primary">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-industrial p-5">
            <h3 className="font-display font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <Printer className="w-4 h-4 text-industrial-400" />
              生产设备
            </h3>
            {assignedPrinter ? (
              <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-dark-100">
                      {assignedPrinter.name}
                    </p>
                    <p className="text-xs font-mono text-dark-500">{assignedPrinter.model}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-mono bg-industrial-500/15 text-industrial-400 rounded-sm border border-industrial-500/30">
                    {assignedPrinter.status === "printing" ? "运行中" : "空闲"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-dark-500">打印进度</span>
                      <span className="text-industrial-400">{assignedPrinter.progress}%</span>
                    </div>
                    <ProgressBar value={assignedPrinter.progress} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                    <div>
                      <span className="text-dark-500">当前层: </span>
                      <span className="text-dark-200">
                        {assignedPrinter.currentLayer}/{assignedPrinter.totalLayers}
                      </span>
                    </div>
                    <div>
                      <span className="text-dark-500">温度: </span>
                      <span className="text-amber-400">{assignedPrinter.temperature}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm text-center">
                <p className="text-sm text-dark-500">尚未分配设备</p>
                <button className="btn-secondary mt-3 text-sm w-full">
                  分配打印设备
                </button>
              </div>
            )}
          </div>

          <div className="card-industrial p-5">
            <h3 className="font-display font-semibold text-dark-50 mb-4">快速操作</h3>
            <div className="space-y-2">
              {currentStepIndex < processSteps.length - 1 && !deviceSelector && (
                <button
                  onClick={() => {
                    const nextStep = processSteps[currentStepIndex + 1];
                    if (nextStep.key === "printing") {
                      setDeviceSelector("printer");
                      setSelectedDeviceId(null);
                    } else if (nextStep.key === "cleaning") {
                      setDeviceSelector("cleaning");
                      setSelectedDeviceId(null);
                    } else if (nextStep.key === "curing") {
                      setDeviceSelector("curing");
                      setSelectedDeviceId(null);
                    } else {
                      advanceSimple(order.id, nextStep.key as any);
                    }
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  推进至: {processSteps[currentStepIndex + 1].label}
                </button>
              )}

              {deviceSelector === "printer" && (
                <div className="space-y-3">
                  <p className="text-sm font-display text-dark-200">选择空闲打印机</p>
                  {printers.filter((p) => p.status === "idle").length === 0 ? (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-sm p-3">
                      暂无空闲打印机可用
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {printers
                        .filter((p) => p.status === "idle")
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedDeviceId(p.id === selectedDeviceId ? null : p.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-sm border transition-all",
                              p.id === selectedDeviceId
                                ? "bg-industrial-500/15 border-industrial-500/50 text-industrial-400"
                                : "bg-dark-900/50 border-dark-700 text-dark-200 hover:border-industrial-500/30"
                            )}
                          >
                            <p className="font-display font-medium text-sm">{p.name}</p>
                            <p className="text-xs font-mono text-dark-500 mt-0.5">{p.model}</p>
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDeviceSelector(null); setSelectedDeviceId(null); }}
                      className="btn-secondary flex-1 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (selectedDeviceId) {
                          advanceToPrinting(order.id, selectedDeviceId);
                          setDeviceSelector(null);
                          setSelectedDeviceId(null);
                        }
                      }}
                      disabled={!selectedDeviceId}
                      className={cn(
                        "flex-1 text-sm flex items-center justify-center gap-1.5",
                        selectedDeviceId ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"
                      )}
                    >
                      确认分配
                    </button>
                  </div>
                </div>
              )}

              {deviceSelector === "cleaning" && (
                <div className="space-y-3">
                  <p className="text-sm font-display text-dark-200">选择空闲清洗工位</p>
                  {cleaningStations.filter((s) => s.status === "idle").length === 0 ? (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-sm p-3">
                      暂无空闲清洗工位可用
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {cleaningStations
                        .filter((s) => s.status === "idle")
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedDeviceId(s.id === selectedDeviceId ? null : s.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-sm border transition-all",
                              s.id === selectedDeviceId
                                ? "bg-industrial-500/15 border-industrial-500/50 text-industrial-400"
                                : "bg-dark-900/50 border-dark-700 text-dark-200 hover:border-industrial-500/30"
                            )}
                          >
                            <p className="font-display font-medium text-sm">{s.name}</p>
                            <p className="text-xs font-mono text-dark-500 mt-0.5">
                              酒精浓度: {s.alcoholConcentration}%
                            </p>
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDeviceSelector(null); setSelectedDeviceId(null); }}
                      className="btn-secondary flex-1 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (selectedDeviceId) {
                          advanceToCleaning(order.id, selectedDeviceId);
                          setDeviceSelector(null);
                          setSelectedDeviceId(null);
                        }
                      }}
                      disabled={!selectedDeviceId}
                      className={cn(
                        "flex-1 text-sm flex items-center justify-center gap-1.5",
                        selectedDeviceId ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"
                      )}
                    >
                      确认分配
                    </button>
                  </div>
                </div>
              )}

              {deviceSelector === "curing" && (
                <div className="space-y-3">
                  <p className="text-sm font-display text-dark-200">选择空闲固化工位</p>
                  {curingStations.filter((s) => s.status === "idle").length === 0 ? (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-sm p-3">
                      暂无空闲固化工位可用
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {curingStations
                        .filter((s) => s.status === "idle")
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedDeviceId(s.id === selectedDeviceId ? null : s.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-sm border transition-all",
                              s.id === selectedDeviceId
                                ? "bg-industrial-500/15 border-industrial-500/50 text-industrial-400"
                                : "bg-dark-900/50 border-dark-700 text-dark-200 hover:border-industrial-500/30"
                            )}
                          >
                            <p className="font-display font-medium text-sm">{s.name}</p>
                            <p className="text-xs font-mono text-dark-500 mt-0.5">
                              UV强度: {s.uvIntensity}% | 温度: {s.temperature}°C
                            </p>
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDeviceSelector(null); setSelectedDeviceId(null); }}
                      className="btn-secondary flex-1 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (selectedDeviceId) {
                          advanceToCuring(order.id, selectedDeviceId);
                          setDeviceSelector(null);
                          setSelectedDeviceId(null);
                        }
                      }}
                      disabled={!selectedDeviceId}
                      className={cn(
                        "flex-1 text-sm flex items-center justify-center gap-1.5",
                        selectedDeviceId ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"
                      )}
                    >
                      确认分配
                    </button>
                  </div>
                </div>
              )}

              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                预约生产
              </button>
              {order.status === "reviewed" && (
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, "layout", "系统", "已审核，发送至排版");
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  发送至排版
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
