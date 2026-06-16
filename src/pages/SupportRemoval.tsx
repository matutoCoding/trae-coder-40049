import { useState } from "react";
import {
  Wrench,
  Star,
  Ruler,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  User,
  Clock,
  FileText,
  Search,
  Edit3,
  Package,
  Eye,
  ChevronDown,
  AlertOctagon,
} from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import { OrderStatusBadge } from "../components/StatusBadges";
import { cn } from "../lib/utils";

interface QCForm {
  surfaceScore: number;
  dimensionalAccuracy: number;
  overallScore: number;
  passed: boolean | null;
  inspector: string;
  defects: string[];
  newDefect: string;
  measurements: { name: string; expected: string; actual: string; passed: boolean }[];
  workHours: number;
  operator: string;
  tools: string[];
}

const commonDefects = [
  "层纹明显",
  "表面气泡",
  "边角翘曲",
  "支撑残留",
  "尺寸偏差",
  "裂纹",
  "光泽不均",
  "缺料",
];

export default function SupportRemoval() {
  const orders = useFactoryStore((s) => s.orders).filter((o) =>
    ["support", "qc", "cleaning", "curing"].includes(o.status)
  );
  const reworkOrder = useFactoryStore((s) => s.reworkOrder);
  const advanceSimple = useFactoryStore((s) => s.advanceSimple);
  const updateOrderStatus = useFactoryStore((s) => s.updateOrderStatus);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.find((o) => o.status === "support")?.id || null
  );
  const [activeTab, setActiveTab] = useState<"removal" | "qc">("removal");
  const [reworkReason, setReworkReason] = useState("");
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [qcForm, setQcForm] = useState<QCForm>({
    surfaceScore: 4,
    dimensionalAccuracy: 4,
    overallScore: 4,
    passed: null,
    inspector: "刘质检",
    defects: [],
    newDefect: "",
    measurements: [
      { name: "总长 (X)", expected: "120.00", actual: "119.98", passed: true },
      { name: "总宽 (Y)", expected: "80.00", actual: "80.02", passed: true },
      { name: "总高 (Z)", expected: "45.00", actual: "44.95", passed: false },
    ],
    workHours: 1.5,
    operator: "陈技师",
    tools: ["斜口钳", "砂纸400目", "砂纸800目", "抛光膏"],
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">支撑去除与质检</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            支撑剥离、打磨工序、表面精度检验、质量判定
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "待去支撑", value: orders.filter((o) => o.status === "cleaning").length, color: "text-cyan-400" },
          { label: "去支撑中", value: orders.filter((o) => o.status === "support").length, color: "text-orange-400" },
          { label: "质检中", value: orders.filter((o) => o.status === "qc").length, color: "text-pink-400" },
          { label: "今日合格", value: 8, color: "text-green-400" },
        ].map((item) => (
          <div key={item.label} className="card-industrial p-4">
            <p className="text-xs font-mono text-dark-500">{item.label}</p>
            <p className={cn("text-2xl font-display font-bold mt-1", item.color)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-industrial p-4">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索订单号、客户..."
                className="input-industrial pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-6">暂无待处理订单</p>
              ) : (
                orders.map((order) => (
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
                    <p className="text-sm font-display text-dark-300 truncate">
                      {order.customerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-mono text-dark-500">
                      <Package className="w-3 h-3" />
                      {order.modelFiles.length} 件
                      <span>|</span>
                      {order.materialType.slice(0, 6)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedOrder ? (
            <>
              <div className="card-industrial p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-industrial-500/15 border border-industrial-500/30 rounded-sm flex items-center justify-center">
                      <FileText className="w-5 h-5 text-industrial-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-semibold text-dark-100">
                          {selectedOrder.orderNo}
                        </h2>
                        <OrderStatusBadge status={selectedOrder.status} />
                      </div>
                      <p className="text-sm font-mono text-dark-500">
                        {selectedOrder.customerName} | {selectedOrder.materialType} |{" "}
                        {selectedOrder.materialColor}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      查看模型
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-industrial">
                <div className="flex border-b border-dark-700">
                  {[
                    { key: "removal", label: "去支撑工序", icon: Wrench },
                    { key: "qc", label: "精度检验", icon: Ruler },
                  ].map((tab) => (
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
                  {activeTab === "removal" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div>
                          <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-industrial-400" />
                            操作人员
                          </h3>
                          <div className="relative">
                            <User className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                              value={qcForm.operator}
                              onChange={(e) =>
                                setQcForm({ ...qcForm, operator: e.target.value })
                              }
                              className="input-industrial pl-9 appearance-none pr-8"
                            >
                              <option>陈技师</option>
                              <option>王师傅</option>
                              <option>李工</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            工时记录
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="label-industrial">工作时长 (小时)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={qcForm.workHours}
                                onChange={(e) =>
                                  setQcForm({
                                    ...qcForm,
                                    workHours: parseFloat(e.target.value),
                                  })
                                }
                                className="input-industrial"
                              />
                            </div>
                            <div>
                              <label className="label-industrial">工件数量</label>
                              <input
                                type="number"
                                defaultValue={selectedOrder.quantity}
                                className="input-industrial"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-orange-400" />
                            使用工具
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {["斜口钳", "镊子", "砂纸400目", "砂纸800目", "砂纸1200目", "抛光膏", "打磨头"].map(
                              (tool) => (
                                <button
                                  key={tool}
                                  onClick={() => {
                                    const hasTool = qcForm.tools.includes(tool);
                                    setQcForm({
                                      ...qcForm,
                                      tools: hasTool
                                        ? qcForm.tools.filter((t) => t !== tool)
                                        : [...qcForm.tools, tool],
                                    });
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-display rounded-sm border transition-all",
                                    qcForm.tools.includes(tool)
                                      ? "bg-industrial-500/20 text-industrial-400 border-industrial-500/50"
                                      : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-600"
                                  )}
                                >
                                  {tool}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-industrial-400" />
                            工序备注
                          </h3>
                          <textarea
                            className="input-industrial min-h-[120px] resize-none py-2.5"
                            placeholder="记录去支撑和打磨过程中的注意事项、特殊处理要求等..."
                          />
                        </div>

                        <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                          <h4 className="font-display font-medium text-dark-200 mb-3">工序清单</h4>
                          <div className="space-y-2">
                            {[
                              { label: "粗去支撑（斜口钳）", done: true },
                              { label: "细去支撑（镊子）", done: true },
                              { label: "粗打磨（400目砂纸）", done: true },
                              { label: "细打磨（800目砂纸）", done: false },
                              { label: "抛光处理", done: false },
                              { label: "清洗吹干", done: false },
                            ].map((step, idx) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-sm border flex items-center justify-center transition-all",
                                    step.done
                                      ? "bg-green-500/20 border-green-500/50"
                                      : "border-dark-600 group-hover:border-dark-500"
                                  )}
                                >
                                  {step.done && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-sm font-display",
                                    step.done ? "text-dark-500 line-through" : "text-dark-200"
                                  )}
                                >
                                  {step.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button className="btn-secondary flex-1">保存记录</button>
                          <button className="btn-primary flex-1">完成并转入质检</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "qc" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div>
                            <h3 className="font-display font-semibold text-dark-100 mb-4">
                              质量评分
                            </h3>
                            <div className="space-y-4">
                              {[
                                { label: "表面质量", key: "surfaceScore" as const },
                                { label: "尺寸精度", key: "dimensionalAccuracy" as const },
                                { label: "综合评定", key: "overallScore" as const },
                              ].map((item) => (
                                <div
                                  key={item.key}
                                  className="flex items-center justify-between p-3 bg-dark-900/50 border border-dark-700 rounded-sm"
                                >
                                  <span className="text-sm font-display text-dark-300">
                                    {item.label}
                                  </span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <button
                                        key={s}
                                        onClick={() =>
                                          setQcForm({ ...qcForm, [item.key]: s })
                                        }
                                      >
                                        <Star
                                          className={cn(
                                            "w-5 h-5 transition-all",
                                            s <= qcForm[item.key]
                                              ? "text-amber-400 fill-amber-400"
                                              : "text-dark-600 hover:text-dark-500"
                                          )}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              缺陷记录
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {commonDefects.map((defect) => (
                                <button
                                  key={defect}
                                  onClick={() => {
                                    const has = qcForm.defects.includes(defect);
                                    setQcForm({
                                      ...qcForm,
                                      defects: has
                                        ? qcForm.defects.filter((d) => d !== defect)
                                        : [...qcForm.defects, defect],
                                    });
                                  }}
                                  className={cn(
                                    "px-2.5 py-1 text-xs font-display rounded-sm border transition-all",
                                    qcForm.defects.includes(defect)
                                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                                      : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-600"
                                  )}
                                >
                                  {defect}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="添加自定义缺陷..."
                                value={qcForm.newDefect}
                                onChange={(e) =>
                                  setQcForm({ ...qcForm, newDefect: e.target.value })
                                }
                                className="input-industrial flex-1"
                              />
                              <button
                                onClick={() => {
                                  if (qcForm.newDefect.trim()) {
                                    setQcForm({
                                      ...qcForm,
                                      defects: [...qcForm.defects, qcForm.newDefect.trim()],
                                      newDefect: "",
                                    });
                                  }
                                }}
                                className="btn-secondary px-3"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            {qcForm.defects.length > 0 && (
                              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-sm">
                                <div className="flex flex-wrap gap-2">
                                  {qcForm.defects.map((d, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-red-500/15 text-red-400 rounded-sm"
                                    >
                                      {d}
                                      <button
                                        onClick={() =>
                                          setQcForm({
                                            ...qcForm,
                                            defects: qcForm.defects.filter((_, j) => j !== i),
                                          })
                                        }
                                      >
                                        <XCircle className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                              <Ruler className="w-4 h-4 text-industrial-400" />
                              尺寸测量
                            </h3>
                            <div className="space-y-2">
                              {qcForm.measurements.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-dark-900/50 border border-dark-700 rounded-sm"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-display text-dark-200">
                                      {m.name}
                                    </span>
                                    <span
                                      className={cn(
                                        "badge-status text-[10px]",
                                        m.passed
                                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                                          : "bg-red-500/15 text-red-400 border-red-500/30"
                                      )}
                                    >
                                      {m.passed ? "合格" : "超差"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                                    <div>
                                      <span className="text-dark-500">设计值: </span>
                                      <span className="text-dark-300">{m.expected}</span>
                                    </div>
                                    <div>
                                      <span className="text-dark-500">实测值: </span>
                                      <span
                                        className={
                                          m.passed ? "text-green-400" : "text-red-400"
                                        }
                                      >
                                        {m.actual}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-dark-500">偏差: </span>
                                      <span
                                        className={
                                          m.passed ? "text-dark-300" : "text-red-400"
                                        }
                                      >
                                        {(
                                          parseFloat(m.actual) - parseFloat(m.expected)
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button className="mt-3 btn-secondary text-sm w-full flex items-center justify-center gap-1.5">
                              <Plus className="w-4 h-4" />
                              添加测量项
                            </button>
                          </div>

                          <div>
                            <label className="label-industrial">检验员</label>
                            <div className="relative">
                              <User className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                              <select
                                value={qcForm.inspector}
                                onChange={(e) =>
                                  setQcForm({ ...qcForm, inspector: e.target.value })
                                }
                                className="input-industrial pl-9 appearance-none pr-8"
                              >
                                <option>刘质检</option>
                                <option>张质检</option>
                                <option>王质检</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-dark-700">
                        <h3 className="font-display font-semibold text-dark-100 mb-4 text-center">
                          质检判定
                        </h3>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setQcForm({ ...qcForm, passed: true })}
                            className={cn(
                              "flex items-center gap-2 px-8 py-3 rounded-sm border transition-all",
                              qcForm.passed === true
                                ? "bg-green-500/20 border-green-500 text-green-400 shadow-glow-green"
                                : "bg-dark-900 border-dark-700 text-dark-300 hover:border-green-500/50 hover:text-green-400"
                            )}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-display font-semibold">合格通过</span>
                          </button>
                          <button
                            onClick={() => setQcForm({ ...qcForm, passed: false })}
                            className={cn(
                              "flex items-center gap-2 px-8 py-3 rounded-sm border transition-all",
                              qcForm.passed === false
                                ? "bg-red-500/20 border-red-500 text-red-400 shadow-glow-red"
                                : "bg-dark-900 border-dark-700 text-dark-300 hover:border-red-500/50 hover:text-red-400"
                            )}
                          >
                            <XCircle className="w-5 h-5" />
                            <span className="font-display font-semibold">不合格返修</span>
                          </button>
                        </div>

                        {qcForm.passed !== null && (
                          <div className="mt-5 flex justify-center gap-3">
                            <button className="btn-secondary">保存报告</button>
                            <button
                              onClick={() => {
                                if (!selectedOrder) return;
                                if (qcForm.passed) {
                                  advanceSimple(selectedOrder.id, "shipping");
                                  updateOrderStatus(selectedOrder.id, "shipping", "系统", "质检合格，转入成品交付");
                                } else {
                                  setShowReworkModal(true);
                                }
                              }}
                              className="btn-primary"
                            >
                              {qcForm.passed ? "转入成品交付" : "退回重新打印"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card-industrial p-12 text-center">
              <Wrench className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <p className="font-display text-lg text-dark-400">请选择待处理订单</p>
              <p className="text-sm font-mono text-dark-600 mt-1">从左侧列表选择订单开始处理</p>
            </div>
          )}
        </div>
      </div>

      {showReworkModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-600 rounded-sm p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h3 className="font-display font-semibold text-dark-50">退回返修</h3>
            </div>
            {(selectedOrder.reworkCount || 0) >= 2 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-red-400">
                  该订单已返修 {selectedOrder.reworkCount || 0} 次，属于高风险订单！
                </p>
              </div>
            )}
            <div>
              <label className="label-industrial">返修原因</label>
              <textarea
                className="input-industrial min-h-[80px] resize-none py-2.5"
                placeholder="请描述返修原因..."
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReworkModal(false); setReworkReason(""); }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!selectedOrder) return;
                  reworkOrder(selectedOrder.id, reworkReason || "质检不合格");
                  setShowReworkModal(false);
                  setReworkReason("");
                  setQcForm({ ...qcForm, passed: null });
                }}
                className="btn-primary flex-1"
              >
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
