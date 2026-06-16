import { useState } from "react";
import {
  Beaker,
  Droplets,
  AlertTriangle,
  TrendingDown,
  Plus,
  Calendar,
  Search,
  Filter,
  Package,
  Thermometer,
  Activity,
  RefreshCw,
  ArrowDownToLine,
  X,
} from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import { ProgressBar } from "../components/StatusBadges";
import { cn } from "../lib/utils";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-600 rounded-sm shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="font-display font-semibold text-dark-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-dark-700 text-dark-400 hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

const REFILL_OPTIONS = [0.5, 1, 2, 3];

type ModalType = "refill" | "change" | "stockRefill" | "addResin" | null;

export default function ResinPrep() {
  const resins = useFactoryStore((s) => s.resins);
  const printers = useFactoryStore((s) => s.printers);
  const refillResin = useFactoryStore((s) => s.refillResin);
  const changeResin = useFactoryStore((s) => s.changeResin);
  const updateResinStock = useFactoryStore((s) => s.updateResinStock);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"inventory" | "tanks">("inventory");

  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalPrinterId, setModalPrinterId] = useState<string | null>(null);
  const [modalResinId, setModalResinId] = useState<string | null>(null);
  const [refillAmount, setRefillAmount] = useState<number>(1);
  const [stockRefillResinId, setStockRefillResinId] = useState<string | null>(null);
  const [stockRefillAmount, setStockRefillAmount] = useState<number>(1);
  const [addResinId, setAddResinId] = useState<string | null>(null);

  const closeModal = () => {
    setModalType(null);
    setModalPrinterId(null);
    setModalResinId(null);
    setRefillAmount(1);
    setStockRefillResinId(null);
    setStockRefillAmount(1);
    setAddResinId(null);
  };

  const openRefillModal = (printerId: string) => {
    setModalPrinterId(printerId);
    setRefillAmount(1);
    setModalType("refill");
  };

  const openChangeModal = (printerId: string) => {
    setModalPrinterId(printerId);
    setModalResinId(null);
    setModalType("change");
  };

  const openStockRefillModal = (resinId: string) => {
    setStockRefillResinId(resinId);
    setStockRefillAmount(1);
    setModalType("stockRefill");
  };

  const openAddResinModal = (resinId: string) => {
    setAddResinId(resinId);
    setStockRefillAmount(1);
    setModalType("addResin");
  };

  const handleRefillConfirm = () => {
    if (!modalPrinterId) return;
    refillResin(modalPrinterId, refillAmount);
    const printer = printers.find((p) => p.id === modalPrinterId);
    if (printer) {
      const matchedResin = resins.find((r) => r.type === printer.resinType);
      if (matchedResin) {
        updateResinStock(matchedResin.id, -refillAmount);
      }
    }
    closeModal();
  };

  const handleChangeConfirm = () => {
    if (!modalPrinterId || !modalResinId) return;
    changeResin(modalPrinterId, modalResinId);
    closeModal();
  };

  const handleStockRefillConfirm = () => {
    if (!stockRefillResinId) return;
    updateResinStock(stockRefillResinId, stockRefillAmount);
    closeModal();
  };

  const handleAddResinConfirm = () => {
    if (!addResinId) return;
    updateResinStock(addResinId, stockRefillAmount);
    closeModal();
  };

  const filteredResins = resins.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStock = resins.reduce((sum, r) => sum + r.stock, 0);
  const lowStockCount = resins.filter((r) => r.stock < 3).length;
  const expiringSoon = resins.filter((r) => {
    const expDate = new Date(r.expiryDate);
    const now = new Date();
    const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 90;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">树脂备料</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            树脂库存管理、槽位液位监控、备料计划安排
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            刷新状态
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增树脂
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "树脂种类",
            value: resins.length,
            unit: "种",
            color: "text-industrial-400",
            icon: Beaker,
          },
          {
            label: "库存总量",
            value: totalStock.toFixed(1),
            unit: "L",
            color: "text-green-400",
            icon: Package,
          },
          {
            label: "库存预警",
            value: lowStockCount,
            unit: "种",
            color: lowStockCount > 0 ? "text-red-400" : "text-dark-400",
            icon: AlertTriangle,
          },
          {
            label: "临期产品",
            value: expiringSoon,
            unit: "种",
            color: expiringSoon > 0 ? "text-amber-400" : "text-dark-400",
            icon: Calendar,
          },
        ].map((item) => (
          <div key={item.label} className="card-industrial p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-dark-500">{item.label}</p>
                <p className={cn("text-2xl font-display font-bold mt-1", item.color)}>
                  {item.value}
                  <span className="text-sm font-mono text-dark-500 ml-1">{item.unit}</span>
                </p>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center border border-dark-700",
                  item.color
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-industrial">
        <div className="flex border-b border-dark-700">
          {[
            { key: "inventory", label: "树脂库存", icon: Package },
            { key: "tanks", label: "设备槽位监控", icon: Droplets },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-display border-b-2 transition-all",
                selectedTab === tab.key
                  ? "text-industrial-400 border-industrial-500 bg-industrial-500/5"
                  : "text-dark-400 border-transparent hover:text-dark-200 hover:bg-dark-800/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab === "inventory" && (
          <div>
            <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索树脂名称、类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-industrial pl-9"
                />
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex items-center gap-1.5 text-sm">
                  <Filter className="w-4 h-4" />
                  筛选
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>树脂</th>
                    <th>类型</th>
                    <th>颜色</th>
                    <th>制造商</th>
                    <th>库存</th>
                    <th>有效期</th>
                    <th>单价</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResins.map((resin) => {
                    const isLowStock = resin.stock < 3;
                    const expDate = new Date(resin.expiryDate);
                    const now = new Date();
                    const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    const isExpiringSoon = diffDays < 90;

                    return (
                      <tr key={resin.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-sm border border-dark-600"
                              style={{ backgroundColor: resin.colorHex }}
                            />
                            <span className="font-display font-medium text-dark-100">
                              {resin.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-dark-300">{resin.type}</span>
                        </td>
                        <td>
                          <span className="text-dark-300">{resin.color}</span>
                        </td>
                        <td>
                          <span className="text-dark-400">{resin.manufacturer}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-24">
                              <ProgressBar
                                value={Math.min((resin.stock / 15) * 100, 100)}
                                color={isLowStock ? "red" : "green"}
                                height="h-1.5"
                              />
                            </div>
                            <span
                              className={cn(
                                "font-mono text-sm",
                                isLowStock ? "text-red-400" : "text-dark-200"
                              )}
                            >
                              {resin.stock} {resin.unit}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-dark-500" />
                            <span
                              className={cn(
                                "font-mono text-xs",
                                isExpiringSoon ? "text-amber-400" : "text-dark-300"
                              )}
                            >
                              {resin.expiryDate}
                            </span>
                            {isExpiringSoon && (
                              <span className="text-[10px] font-mono text-amber-400">
                                ({Math.round(diffDays)}天)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-amber-400">
                            ¥{resin.pricePerUnit}/{resin.unit}
                          </span>
                        </td>
                        <td>
                          {isLowStock ? (
                            <span className="badge-status bg-red-500/15 text-red-400 border-red-500/30">
                              <span className="status-dot bg-red-500 animate-pulse" />
                              库存不足
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="badge-status bg-amber-500/15 text-amber-400 border-amber-500/30">
                              <span className="status-dot bg-amber-500" />
                              临期
                            </span>
                          ) : (
                            <span className="badge-status bg-green-500/15 text-green-400 border-green-500/30">
                              <span className="status-dot bg-green-500" />
                              正常
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openStockRefillModal(resin.id)}
                              className="p-1.5 rounded-sm hover:bg-dark-700 text-dark-400 hover:text-industrial-400"
                            >
                              <ArrowDownToLine className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openAddResinModal(resin.id)}
                              className="p-1.5 rounded-sm hover:bg-dark-700 text-dark-400 hover:text-amber-400"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "tanks" && (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="p-5 bg-dark-900/50 border border-dark-700 rounded-sm hover:border-industrial-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-display font-semibold text-dark-100">
                        {printer.name}
                      </p>
                      <p className="text-xs font-mono text-dark-500">{printer.model}</p>
                    </div>
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        printer.status === "printing"
                          ? "bg-green-500 animate-pulse shadow-glow-green"
                          : printer.status === "maintenance"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      )}
                    />
                  </div>

                  {printer.status !== "maintenance" && printer.resinType ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-5 h-5 rounded-sm border border-dark-600"
                          style={{
                            backgroundColor:
                              resins.find((r) => r.type === printer.resinType)?.colorHex ||
                              "#666",
                          }}
                        />
                        <div>
                          <p className="text-sm font-display text-dark-200">
                            {printer.resinType}
                          </p>
                          <p className="text-xs font-mono text-dark-500">
                            {printer.resinColor}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-display text-dark-400 flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5" />
                            树脂液位
                          </span>
                          <span
                            className={cn(
                              "text-sm font-mono font-semibold",
                              printer.resinLevel < 30
                                ? "text-red-400"
                                : printer.resinLevel < 50
                                ? "text-amber-400"
                                : "text-green-400"
                            )}
                          >
                            {printer.resinLevel}%
                          </span>
                        </div>
                        <div className="h-16 bg-dark-800 rounded-sm border border-dark-700 relative overflow-hidden">
                          <div
                            className={cn(
                              "absolute bottom-0 left-0 right-0 transition-all duration-500",
                              printer.resinLevel < 30
                                ? "bg-gradient-to-t from-red-600 to-red-500/80"
                                : printer.resinLevel < 50
                                ? "bg-gradient-to-t from-amber-600 to-amber-500/80"
                                : "bg-gradient-to-t from-industrial-600 to-industrial-400/80"
                            )}
                            style={{ height: `${printer.resinLevel}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                          </div>
                          {[25, 50, 75].map((mark) => (
                            <div
                              key={mark}
                              className="absolute left-0 right-0 border-t border-dark-600/50 border-dashed"
                              style={{ bottom: `${mark}%` }}
                            >
                              <span className="absolute -left-1 text-[9px] font-mono text-dark-500 -translate-x-full -translate-y-1/2">
                                {mark}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dark-700">
                        <div>
                          <p className="text-xs font-mono text-dark-500 flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            温度
                          </p>
                          <p className="font-mono text-dark-200">{printer.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-dark-500 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            状态
                          </p>
                          <p className="font-mono text-dark-200 capitalize">
                            {printer.status === "idle"
                              ? "空闲"
                              : printer.status === "printing"
                              ? "打印中"
                              : printer.status === "paused"
                              ? "暂停"
                              : "维护"}
                          </p>
                        </div>
                      </div>

                      {printer.resinLevel < 30 && (
                        <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-xs font-mono text-red-400">
                            液位过低，请及时补充树脂
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openRefillModal(printer.id)}
                          className="btn-secondary text-xs flex-1 py-1.5"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />
                          补充树脂
                        </button>
                        <button
                          onClick={() => openChangeModal(printer.id)}
                          className="btn-secondary text-xs flex-1 py-1.5"
                        >
                          <TrendingDown className="w-3 h-3 inline mr-1" />
                          更换材料
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <Activity className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-sm font-display text-dark-500">
                        {printer.status === "maintenance"
                          ? "设备维护中，槽位已清空"
                          : "槽位空置，等待装料"}
                      </p>
                      <button
                        onClick={() => openChangeModal(printer.id)}
                        className="btn-primary text-xs mt-3"
                      >
                        <Plus className="w-3 h-3 inline mr-1" />
                        装入树脂
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalType === "refill"}
        onClose={closeModal}
        title="补充树脂"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-mono text-dark-400 mb-1">当前设备</p>
            <p className="font-display text-dark-200">
              {printers.find((p) => p.id === modalPrinterId)?.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-mono text-dark-400 mb-2">选择补充量</p>
            <div className="grid grid-cols-4 gap-2">
              {REFILL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setRefillAmount(opt)}
                  className={cn(
                    "py-2 rounded-sm text-sm font-mono border transition-all",
                    refillAmount === opt
                      ? "bg-industrial-500/20 border-industrial-500 text-industrial-400"
                      : "bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500"
                  )}
                >
                  {opt}L
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 text-sm">
              取消
            </button>
            <button
              onClick={handleRefillConfirm}
              className="btn-primary flex-1 text-sm"
            >
              确认补充
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === "change"}
        onClose={closeModal}
        title="更换材料"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-mono text-dark-400 mb-1">当前设备</p>
            <p className="font-display text-dark-200">
              {printers.find((p) => p.id === modalPrinterId)?.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-mono text-dark-400 mb-2">选择树脂</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {resins.map((resin) => (
                <button
                  key={resin.id}
                  onClick={() => setModalResinId(resin.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-sm border transition-all text-left",
                    modalResinId === resin.id
                      ? "bg-industrial-500/10 border-industrial-500"
                      : "bg-dark-900/50 border-dark-700 hover:border-dark-500"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-sm border border-dark-600 flex-shrink-0"
                    style={{ backgroundColor: resin.colorHex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-dark-100 truncate">
                      {resin.name}
                    </p>
                    <p className="text-xs font-mono text-dark-400">
                      {resin.type} · {resin.color}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono flex-shrink-0",
                      resin.stock < 3 ? "text-red-400" : "text-dark-300"
                    )}
                  >
                    库存: {resin.stock}{resin.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 text-sm">
              取消
            </button>
            <button
              onClick={handleChangeConfirm}
              disabled={!modalResinId}
              className={cn(
                "flex-1 text-sm",
                modalResinId ? "btn-primary" : "btn-secondary opacity-50 cursor-not-allowed"
              )}
            >
              确认更换
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === "stockRefill"}
        onClose={closeModal}
        title="补充库存"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-mono text-dark-400 mb-1">树脂</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-sm border border-dark-600"
                style={{
                  backgroundColor:
                    resins.find((r) => r.id === stockRefillResinId)?.colorHex,
                }}
              />
              <p className="font-display text-dark-200">
                {resins.find((r) => r.id === stockRefillResinId)?.name}
              </p>
            </div>
            <p className="text-xs font-mono text-dark-400 mt-1">
              当前库存: {resins.find((r) => r.id === stockRefillResinId)?.stock}
              {resins.find((r) => r.id === stockRefillResinId)?.unit}
            </p>
          </div>
          <div>
            <p className="text-sm font-mono text-dark-400 mb-2">补充数量</p>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={stockRefillAmount}
              onChange={(e) => setStockRefillAmount(Number(e.target.value))}
              className="input-industrial w-full"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 text-sm">
              取消
            </button>
            <button
              onClick={handleStockRefillConfirm}
              disabled={stockRefillAmount <= 0}
              className={cn(
                "flex-1 text-sm",
                stockRefillAmount > 0
                  ? "btn-primary"
                  : "btn-secondary opacity-50 cursor-not-allowed"
              )}
            >
              确认补充
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === "addResin"}
        onClose={closeModal}
        title="添加树脂入库"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-mono text-dark-400 mb-1">树脂</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-sm border border-dark-600"
                style={{
                  backgroundColor:
                    resins.find((r) => r.id === addResinId)?.colorHex,
                }}
              />
              <p className="font-display text-dark-200">
                {resins.find((r) => r.id === addResinId)?.name}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-mono text-dark-400 mb-2">添加数量</p>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={stockRefillAmount}
              onChange={(e) => setStockRefillAmount(Number(e.target.value))}
              className="input-industrial w-full"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="btn-secondary flex-1 text-sm">
              取消
            </button>
            <button
              onClick={handleAddResinConfirm}
              disabled={stockRefillAmount <= 0}
              className={cn(
                "flex-1 text-sm",
                stockRefillAmount > 0
                  ? "btn-primary"
                  : "btn-secondary opacity-50 cursor-not-allowed"
              )}
            >
              确认添加
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
