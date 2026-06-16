import { useState, useEffect } from "react";
import {
  Droplets,
  Sun,
  Play,
  Pause,
  Square,
  Thermometer,
  Clock,
  AlertTriangle,
  Activity,
  Beaker,
  RotateCw,
  Timer,
  Gauge,
} from "lucide-react";
import { useFactoryStore } from "../store/useFactoryStore";
import {
  StationStatusBadge,
  ProgressBar,
  CircularProgress,
  OrderStatusBadge,
} from "../components/StatusBadges";
import { cn } from "../lib/utils";

export default function CleaningCuring() {
  const cleaningStations = useFactoryStore((s) => s.cleaningStations);
  const curingStations = useFactoryStore((s) => s.curingStations);
  const orders = useFactoryStore((s) => s.orders);
  const updateCleaningStation = useFactoryStore((s) => s.updateCleaningStation);
  const updateCuringStation = useFactoryStore((s) => s.updateCuringStation);
  const advanceSimple = useFactoryStore((s) => s.advanceSimple);
  const store = useFactoryStore;

  const [selectedTab, setSelectedTab] = useState<"cleaning" | "curing">("cleaning");
  const [cleaningParams, setCleaningParams] = useState({
    cleaningTime: 900,
    ultrasonic: true,
    temperature: 26,
  });
  const [curingParams, setCuringParams] = useState({
    curingTime: 2400,
    uvIntensity: 80,
    temperature: 60,
    rotationSpeed: 6,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const state = store.getState();

      state.cleaningStations.forEach((s) => {
        if (s.status === "cleaning" && s.remainingTime > 0) {
          if (s.remainingTime - 1 === 0) {
            const idleCuring = state.curingStations.find((cs) => cs.status === "idle");
            if (idleCuring && s.orderId) {
              const st = store.getState();
              const order = st.orders.find((o) => o.id === s.orderId);
              if (order && order.status === "cleaning") {
                store.getState().advanceToCuring(s.orderId, idleCuring.id);
              }
            } else {
              updateCleaningStation(s.id, { remainingTime: 0, status: "completed" });
            }
          } else {
            updateCleaningStation(s.id, { remainingTime: s.remainingTime - 1 });
          }
        } else if (s.status === "completed" && s.orderId) {
          const st = store.getState();
          const idleCuring = st.curingStations.find((cs) => cs.status === "idle");
          if (idleCuring) {
            const order = st.orders.find((o) => o.id === s.orderId);
            if (order && order.status === "cleaning") {
              store.getState().advanceToCuring(s.orderId, idleCuring.id);
            }
          }
        }
      });

      state.curingStations.forEach((s) => {
        if (s.status === "curing" && s.remainingTime > 0) {
          if (s.remainingTime - 1 === 0) {
            updateCuringStation(s.id, { remainingTime: 0, status: "idle", orderId: undefined, orderNo: undefined });
            if (s.orderId) {
              const currentState = store.getState();
              const order = currentState.orders.find((o) => o.id === s.orderId);
              if (order && order.status === "curing") {
                store.getState().advanceFromCuringToSupport(s.orderId);
              }
            }
          } else {
            updateCuringStation(s.id, { remainingTime: s.remainingTime - 1 });
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [store, updateCleaningStation, updateCuringStation, advanceSimple]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">清洗固化</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            酒精清洗工位管理、UV二次固化参数控制
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "清洗工位",
            value: cleaningStations.length,
            active: cleaningStations.filter((s) => s.status === "cleaning").length,
            color: "text-cyan-400",
            icon: Droplets,
          },
          {
            label: "固化工位",
            value: curingStations.length,
            active: curingStations.filter((s) => s.status === "curing").length,
            color: "text-purple-400",
            icon: Sun,
          },
          {
            label: "待清洗",
            value: orders.filter((o) => o.status === "printing").length,
            active: 0,
            color: "text-amber-400",
            icon: Beaker,
          },
          {
            label: "今日完成",
            value: 12,
            active: 0,
            color: "text-green-400",
            icon: Activity,
          },
        ].map((item) => (
          <div key={item.label} className="card-industrial p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-dark-500">{item.label}</p>
                <p className={cn("text-2xl font-display font-bold mt-1", item.color)}>
                  {item.value}
                  {item.active > 0 && (
                    <span className="text-sm font-mono text-dark-500 ml-2">
                      ({item.active} 运行中)
                    </span>
                  )}
                </p>
              </div>
              <div className={cn("p-2 bg-dark-900 rounded-sm border border-dark-700", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-industrial">
        <div className="flex border-b border-dark-700">
          {[
            { key: "cleaning", label: "酒精清洗", icon: Droplets },
            { key: "curing", label: "UV固化", icon: Sun },
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

        <div className="p-5">
          {selectedTab === "cleaning" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {cleaningStations.map((station) => {
                const isRunning = station.status === "cleaning";
                const progress =
                  station.cleaningTime > 0
                    ? ((station.cleaningTime - station.remainingTime) / station.cleaningTime) * 100
                    : 0;
                const order = orders.find((o) => o.id === station.orderId);

                return (
                  <div
                    key={station.id}
                    className="p-5 bg-dark-900/50 border border-dark-700 rounded-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-dark-100">
                          {station.name}
                        </h3>
                        <p className="text-xs font-mono text-dark-500">超声波清洗机</p>
                      </div>
                      <StationStatusBadge status={station.status} />
                    </div>

                    {order && (
                      <div className="mb-4 p-3 bg-dark-800/50 rounded-sm border border-dark-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-industrial-400">
                            {order.orderNo}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm font-display text-dark-300 truncate">
                          {order.customerName}
                        </p>
                        {station.basketId && (
                          <p className="text-xs font-mono text-dark-500 mt-1">
                            清洗篮: {station.basketId}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-center mb-4">
                      <CircularProgress
                        value={progress}
                        size={120}
                        strokeWidth={8}
                        color={isRunning ? "#06B6D4" : "#64748B"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-dark-800/50 rounded-sm">
                        <div className="flex items-center gap-1.5 text-dark-500 mb-1">
                          <Timer className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-display uppercase tracking-wider">
                            剩余时间
                          </span>
                        </div>
                        <p
                          className={cn(
                            "font-mono font-bold text-lg",
                            isRunning ? "text-cyan-400" : "text-dark-400"
                          )}
                        >
                          {formatTime(station.remainingTime)}
                        </p>
                      </div>
                      <div className="p-3 bg-dark-800/50 rounded-sm">
                        <div className="flex items-center gap-1.5 text-dark-500 mb-1">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-display uppercase tracking-wider">
                            温度
                          </span>
                        </div>
                        <p className="font-mono font-bold text-lg text-amber-400">
                          {station.temperature}°C
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-display text-dark-400 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5" />
                          酒精浓度
                        </span>
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold",
                            station.alcoholConcentration < 85
                              ? "text-red-400"
                              : "text-green-400"
                          )}
                        >
                          {station.alcoholConcentration}%
                        </span>
                      </div>
                      <ProgressBar
                        value={station.alcoholConcentration}
                        color={station.alcoholConcentration < 85 ? "red" : "green"}
                        height="h-1.5"
                      />
                      {station.alcoholConcentration < 85 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          浓度偏低，请更换酒精
                        </div>
                      )}

                      {station.status === "completed" && station.orderId && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-sm px-2 py-1.5">
                          <Clock className="w-3 h-3 animate-pulse" />
                          清洗完成，等待空闲固化工位...
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {station.status === "idle" && (
                        <button className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5" />
                          开始清洗
                        </button>
                      )}
                      {isRunning && (
                        <button className="btn-warning text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Pause className="w-3.5 h-3.5" />
                          暂停
                        </button>
                      )}
                      {station.status !== "idle" && (
                        <button className="btn-danger text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Square className="w-3.5 h-3.5" />
                          停止
                        </button>
                      )}
                      {station.status === "completed" && (
                        <button className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5" />
                          取出工件
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="card-industrial p-5 lg:col-span-1">
                <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-industrial-400" />
                  清洗参数
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">清洗时间</label>
                      <span className="text-xs font-mono text-industrial-400">
                        {Math.floor(cleaningParams.cleaningTime / 60)} 分钟
                      </span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="1800"
                      step="60"
                      value={cleaningParams.cleaningTime}
                      onChange={(e) =>
                        setCleaningParams({
                          ...cleaningParams,
                          cleaningTime: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">目标温度</label>
                      <span className="text-xs font-mono text-amber-400">
                        {cleaningParams.temperature}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="40"
                      step="1"
                      value={cleaningParams.temperature}
                      onChange={(e) =>
                        setCleaningParams({
                          ...cleaningParams,
                          temperature: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-display text-dark-300">超声波振动</span>
                    <button
                      onClick={() =>
                        setCleaningParams({
                          ...cleaningParams,
                          ultrasonic: !cleaningParams.ultrasonic,
                        })
                      }
                      className={cn(
                        "w-11 h-6 rounded-sm relative transition-colors",
                        cleaningParams.ultrasonic ? "bg-cyan-500" : "bg-dark-700"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-sm transition-all",
                          cleaningParams.ultrasonic ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>
                  </div>
                  <button className="btn-primary w-full">应用参数</button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "curing" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {curingStations.map((station) => {
                const isRunning = station.status === "curing";
                const progress =
                  station.curingTime > 0
                    ? ((station.curingTime - station.remainingTime) / station.curingTime) * 100
                    : 0;
                const order = orders.find((o) => o.id === station.orderId);

                return (
                  <div
                    key={station.id}
                    className="p-5 bg-dark-900/50 border border-dark-700 rounded-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-dark-100">
                          {station.name}
                        </h3>
                        <p className="text-xs font-mono text-dark-500">UV LED固化箱</p>
                      </div>
                      <StationStatusBadge status={station.status} />
                    </div>

                    {order && (
                      <div className="mb-4 p-3 bg-dark-800/50 rounded-sm border border-dark-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-industrial-400">
                            {order.orderNo}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm font-display text-dark-300 truncate">
                          {order.customerName}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center mb-4">
                      <CircularProgress
                        value={progress}
                        size={120}
                        strokeWidth={8}
                        color={isRunning ? "#A855F7" : "#64748B"}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="p-2.5 bg-dark-800/50 rounded-sm text-center">
                        <div className="flex items-center justify-center gap-1 text-dark-500 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-display uppercase">剩余</span>
                        </div>
                        <p
                          className={cn(
                            "font-mono font-bold",
                            isRunning ? "text-purple-400" : "text-dark-400"
                          )}
                        >
                          {formatTime(station.remainingTime)}
                        </p>
                      </div>
                      <div className="p-2.5 bg-dark-800/50 rounded-sm text-center">
                        <div className="flex items-center justify-center gap-1 text-dark-500 mb-1">
                          <Sun className="w-3 h-3" />
                          <span className="text-[9px] font-display uppercase">UV</span>
                        </div>
                        <p className="font-mono font-bold text-purple-400">
                          {station.uvIntensity}%
                        </p>
                      </div>
                      <div className="p-2.5 bg-dark-800/50 rounded-sm text-center">
                        <div className="flex items-center justify-center gap-1 text-dark-500 mb-1">
                          <Thermometer className="w-3 h-3" />
                          <span className="text-[9px] font-display uppercase">温度</span>
                        </div>
                        <p className="font-mono font-bold text-amber-400">
                          {station.temperature}°C
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 p-2.5 bg-dark-800/50 rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display text-dark-400 flex items-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5" />
                          转盘转速
                        </span>
                        <span className="text-xs font-mono text-dark-200">
                          {station.rotationSpeed} RPM
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {station.status === "idle" && (
                        <button className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5" />
                          开始固化
                        </button>
                      )}
                      {isRunning && (
                        <button className="btn-warning text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Pause className="w-3.5 h-3.5" />
                          暂停
                        </button>
                      )}
                      {station.status !== "idle" && (
                        <button className="btn-danger text-sm flex-1 flex items-center justify-center gap-1.5">
                          <Square className="w-3.5 h-3.5" />
                          停止
                        </button>
                      )}
                      {station.status === "completed" && (
                        <button className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5" />
                          取出工件
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="card-industrial p-5 lg:col-span-1">
                <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  固化参数
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">固化时间</label>
                      <span className="text-xs font-mono text-purple-400">
                        {Math.floor(curingParams.curingTime / 60)} 分钟
                      </span>
                    </div>
                    <input
                      type="range"
                      min="600"
                      max="3600"
                      step="120"
                      value={curingParams.curingTime}
                      onChange={(e) =>
                        setCuringParams({
                          ...curingParams,
                          curingTime: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">UV强度</label>
                      <span className="text-xs font-mono text-purple-400">
                        {curingParams.uvIntensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={curingParams.uvIntensity}
                      onChange={(e) =>
                        setCuringParams({
                          ...curingParams,
                          uvIntensity: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">固化温度</label>
                      <span className="text-xs font-mono text-amber-400">
                        {curingParams.temperature}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      step="5"
                      value={curingParams.temperature}
                      onChange={(e) =>
                        setCuringParams({
                          ...curingParams,
                          temperature: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="label-industrial mb-0">转盘转速</label>
                      <span className="text-xs font-mono text-industrial-400">
                        {curingParams.rotationSpeed} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={curingParams.rotationSpeed}
                      onChange={(e) =>
                        setCuringParams({
                          ...curingParams,
                          rotationSpeed: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <button className="btn-primary w-full">应用参数</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
