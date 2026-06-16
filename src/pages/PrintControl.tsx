import { useState, useEffect } from "react";
import {
  Printer,
  Play,
  Pause,
  Square,
  Thermometer,
  Layers,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  Settings,
  AlertTriangle,
  RefreshCw,
  FileText,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import {
  PrinterStatusBadge,
  CircularProgress,
  ProgressBar,
  OrderStatusBadge,
} from "../components/StatusBadges";
import { cn } from "../lib/utils";

export default function PrintControl() {
  const printers = useFactoryStore((s) => s.printers);
  const orders = useFactoryStore((s) => s.orders);
  const updatePrinterProgress = useFactoryStore((s) => s.updatePrinterProgress);

  const [selectedPrinterId, setSelectedPrinterId] = useState(printers[0]?.id || null);
  const [params, setParams] = useState({
    exposureTime: 8.5,
    baseExposure: 30,
    liftSpeed: 1.5,
    liftHeight: 5,
  });

  const selectedPrinter = printers.find((p) => p.id === selectedPrinterId);
  const printingOrders = orders.filter((o) => o.status === "printing");

  useEffect(() => {
    if (selectedPrinter?.status === "printing") {
      const interval = setInterval(() => {
        const newProgress = Math.min(selectedPrinter.progress + 0.2, 100);
        const newLayer = Math.min(
          selectedPrinter.currentLayer + 1,
          selectedPrinter.totalLayers
        );
        updatePrinterProgress(selectedPrinter.id, newProgress, newLayer);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedPrinter, updatePrinterProgress]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const remainingTime = selectedPrinter
    ? selectedPrinter.printDuration - selectedPrinter.elapsedTime
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">光固化打印</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            打印任务管理、设备监控、曝光参数控制
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            同步设备
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            参数模板
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-industrial p-4">
            <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <Printer className="w-4 h-4 text-industrial-400" />
              设备列表
            </h3>
            <div className="space-y-2">
              {printers.map((printer) => (
                <button
                  key={printer.id}
                  onClick={() => setSelectedPrinterId(printer.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-sm border transition-all",
                    selectedPrinterId === printer.id
                      ? "bg-industrial-500/10 border-industrial-500/50"
                      : "bg-dark-900/50 border-dark-700 hover:border-dark-600"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-semibold text-dark-100">
                      {printer.name}
                    </span>
                    <PrinterStatusBadge status={printer.status} />
                  </div>
                  <p className="text-xs font-mono text-dark-500 mb-2">{printer.model}</p>
                  {printer.status === "printing" && (
                    <>
                      <p className="text-xs font-mono text-industrial-400 mb-1.5">
                        {printer.currentOrderNo}
                      </p>
                      <ProgressBar value={printer.progress} height="h-1" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card-industrial p-4">
            <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              打印队列
            </h3>
            <div className="space-y-2">
              {printingOrders.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-4">暂无打印任务</p>
              ) : (
                printingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2.5 bg-dark-900/50 border border-dark-700 rounded-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-industrial-400">
                        {order.orderNo}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-display text-dark-300 truncate">
                      {order.customerName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedPrinter && (
            <>
              <div className="card-industrial p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-display font-bold text-dark-50">
                        {selectedPrinter.name}
                      </h2>
                      <PrinterStatusBadge status={selectedPrinter.status} />
                    </div>
                    <p className="text-sm font-mono text-dark-500 mt-1">
                      {selectedPrinter.model} | 打印尺寸 {selectedPrinter.buildVolume.x}×
                      {selectedPrinter.buildVolume.y}×{selectedPrinter.buildVolume.z}mm
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedPrinter.status === "idle" && (
                      <button className="btn-primary flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        开始打印
                      </button>
                    )}
                    {selectedPrinter.status === "printing" && (
                      <button className="btn-warning flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        暂停
                      </button>
                    )}
                    {selectedPrinter.status === "paused" && (
                      <button className="btn-primary flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        继续
                      </button>
                    )}
                    {(selectedPrinter.status === "printing" ||
                      selectedPrinter.status === "paused") && (
                      <button className="btn-danger flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        停止
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <CircularProgress
                      value={selectedPrinter.progress}
                      size={160}
                      strokeWidth={10}
                      color="#0EA5E9"
                    />
                    {selectedPrinter.status === "printing" && (
                      <div className="mt-4 text-center">
                        <p className="text-xs font-mono text-dark-500 mb-1">预计剩余</p>
                        <p className="font-display font-bold text-xl text-industrial-400">
                          {formatTime(Math.max(remainingTime, 0))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div className="flex items-center gap-2 text-dark-400 mb-2">
                        <Layers className="w-4 h-4" />
                        <span className="text-xs font-display uppercase tracking-wider">
                          打印进度
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-dark-50">
                          {selectedPrinter.currentLayer.toLocaleString()}
                        </span>
                        <span className="font-mono text-sm text-dark-500">
                          / {selectedPrinter.totalLayers.toLocaleString()} 层
                        </span>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={selectedPrinter.progress} />
                      </div>
                    </div>

                    <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div className="flex items-center gap-2 text-dark-400 mb-2">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-xs font-display uppercase tracking-wider">
                          树脂温度
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-amber-400">
                          {selectedPrinter.temperature}
                        </span>
                        <span className="font-mono text-sm text-dark-500">°C</span>
                      </div>
                      <div className="mt-3 flex gap-1">
                        {[20, 25, 30, 35, 40].map((t) => (
                          <div
                            key={t}
                            className={cn(
                              "flex-1 h-1.5 rounded-sm",
                              selectedPrinter.temperature >= t
                                ? t > 35
                                  ? "bg-red-500"
                                  : t > 30
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                                : "bg-dark-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div className="flex items-center gap-2 text-dark-400 mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-display uppercase tracking-wider">
                          曝光时间
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-industrial-400">
                          {selectedPrinter.exposureTime}
                        </span>
                        <span className="font-mono text-sm text-dark-500">秒 / 层</span>
                      </div>
                      <p className="mt-3 text-xs font-mono text-dark-500">
                        层厚: {selectedPrinter.layerHeight}mm
                      </p>
                    </div>

                    <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                      <div className="flex items-center gap-2 text-dark-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-display uppercase tracking-wider">
                          打印时长
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-green-400">
                          {formatTime(selectedPrinter.elapsedTime)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-mono text-dark-500">
                        总时长: {formatTime(selectedPrinter.printDuration)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-industrial-400" />
                    打印参数
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-industrial">普通曝光 (s)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={params.exposureTime}
                        onChange={(e) =>
                          setParams({ ...params, exposureTime: parseFloat(e.target.value) })
                        }
                        className="input-industrial"
                      />
                    </div>
                    <div>
                      <label className="label-industrial">底层曝光 (s)</label>
                      <input
                        type="number"
                        step="1"
                        value={params.baseExposure}
                        onChange={(e) =>
                          setParams({ ...params, baseExposure: parseFloat(e.target.value) })
                        }
                        className="input-industrial"
                      />
                    </div>
                    <div>
                      <label className="label-industrial">抬升速度 (mm/s)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={params.liftSpeed}
                        onChange={(e) =>
                          setParams({ ...params, liftSpeed: parseFloat(e.target.value) })
                        }
                        className="input-industrial"
                      />
                    </div>
                    <div>
                      <label className="label-industrial">抬升高度 (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={params.liftHeight}
                        onChange={(e) =>
                          setParams({ ...params, liftHeight: parseFloat(e.target.value) })
                        }
                        className="input-industrial"
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dark-700 flex gap-2">
                    <button className="btn-secondary text-sm flex-1">恢复默认</button>
                    <button className="btn-primary text-sm flex-1">应用参数</button>
                  </div>
                </div>

                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-industrial-400" />
                    平台控制
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs font-mono text-dark-500 mb-1">当前高度</p>
                      <p className="text-3xl font-display font-bold text-industrial-400">
                        {selectedPrinter.platformHeight.toFixed(1)}
                        <span className="text-sm font-mono text-dark-500 ml-1">mm</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="btn-secondary w-14 h-14 flex flex-col items-center justify-center p-0">
                        <ArrowUp className="w-5 h-5" />
                        <span className="text-[10px] font-mono mt-0.5">上升</span>
                      </button>
                      <button className="btn-secondary w-14 h-14 flex flex-col items-center justify-center p-0">
                        <ArrowDown className="w-5 h-5" />
                        <span className="text-[10px] font-mono mt-0.5">下降</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="label-industrial">目标高度 (mm)</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.1" defaultValue={0} className="input-industrial flex-1" />
                      <button className="btn-primary px-4">移动</button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dark-700 flex gap-2">
                    <button className="btn-warning text-sm flex-1">
                      <ArrowUp className="w-3.5 h-3.5 inline mr-1" />
                      回原点
                    </button>
                    <button className="btn-secondary text-sm flex-1">
                      <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                      卸件位置
                    </button>
                  </div>
                </div>
              </div>

              {selectedPrinter.status === "printing" && (
                <div className="card-industrial p-5">
                  <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-industrial-400" />
                    当前任务
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-dark-900/50 border border-dark-700 rounded-sm">
                    <div className="w-14 h-14 bg-industrial-500/15 border border-industrial-500/30 rounded-sm flex items-center justify-center">
                      <FileText className="w-7 h-7 text-industrial-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-industrial-400 font-medium">
                          {selectedPrinter.currentOrderNo}
                        </span>
                        <OrderStatusBadge status="printing" />
                      </div>
                      <p className="text-sm font-display text-dark-300">
                        {orders.find((o) => o.id === selectedPrinter.currentOrderId)?.customerName}
                      </p>
                      <p className="text-xs font-mono text-dark-500 mt-1">
                        {selectedPrinter.resinType} | {selectedPrinter.resinColor} |{" "}
                        {selectedPrinter.layerHeight}mm
                      </p>
                    </div>
                    {selectedPrinter.progress > 80 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono text-amber-400">即将完成</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
