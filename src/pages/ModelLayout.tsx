import { useState, useRef } from "react";
import {
  Box,
  Grid3X3,
  Move,
  RotateCw,
  Maximize2,
  Layers,
  Wand2,
  Download,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  AlignJustify,
  FileText,
  Package,
  ChevronDown,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useFactoryStore } from "../store/useFactoryStore";
import { OrderStatusBadge, ProgressBar } from "../components/StatusBadges";
import { cn } from "../lib/utils";

function ModelMesh({ position, color, scale, selected, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.9}
        metalness={0.1}
        roughness={0.5}
        emissive={selected ? color : "#000000"}
        emissiveIntensity={selected ? 0.3 : 0}
      />
      {selected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.01, 1.01, 1.01)]} />
          <lineBasicMaterial color="#0EA5E9" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

function Platform() {
  return (
    <group>
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
      </mesh>
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
    </group>
  );
}

export default function ModelLayout() {
  const orders = useFactoryStore((s) => s.orders).filter(
    (o) => o.status === "layout" || o.status === "reviewed"
  );
  const [selectedOrder, setSelectedOrder] = useState(orders[0]?.id || null);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(0);
  const [autoLayoutRunning, setAutoLayoutRunning] = useState(false);
  const [supportDensity, setSupportDensity] = useState(0.5);
  const [supportAngle, setSupportAngle] = useState(45);
  const [showSupports, setShowSupports] = useState(true);
  const [viewMode, setViewMode] = useState<"perspective" | "top" | "front" | "side">("perspective");

  const currentOrder = orders.find((o) => o.id === selectedOrder);

  const modelColors = ["#0EA5E9", "#F59E0B", "#22C55E", "#A855F7", "#EC4899"];

  const models = [
    { position: [-4, 0.75, -2], scale: [1.5, 1.5, 1], color: modelColors[0] },
    { position: [-1, 1, 1], scale: [2, 2, 1.5], color: modelColors[1] },
    { position: [3, 0.5, -1], scale: [1, 1, 0.8], color: modelColors[2] },
    { position: [1, 1.25, -3], scale: [1.2, 2.5, 1.2], color: modelColors[3] },
    { position: [4, 0.6, 3], scale: [1.2, 1.2, 1], color: modelColors[4] },
  ];

  const totalVolume = models.reduce((sum, m) => sum + m.scale[0] * m.scale[1] * m.scale[2], 0);
  const platformArea = 20 * 20;
  const usedArea = models.reduce((sum, m) => sum + m.scale[0] * m.scale[2], 0);
  const areaUtilization = (usedArea / platformArea) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">模型摆放</h1>
          <p className="text-sm font-mono text-dark-500 mt-1">
            3D可视化排版、自动摆放优化、支撑自动生成
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setAutoLayoutRunning(true);
              setTimeout(() => setAutoLayoutRunning(false), 2000);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Wand2 className={cn("w-4 h-4", autoLayoutRunning && "animate-spin")} />
            自动排版
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Layers className="w-4 h-4" />
            生成支撑
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出切片
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card-industrial p-4">
            <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-industrial-400" />
              待排版订单
            </h3>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-sm text-dark-500 text-center py-4">暂无待排版订单</p>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-sm border transition-all",
                      selectedOrder === order.id
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
                    <p className="text-sm font-display text-dark-200 truncate">
                      {order.customerName}
                    </p>
                    <div className="flex justify-between mt-1.5 text-xs font-mono text-dark-500">
                      <span>{order.modelFiles.length} 个模型</span>
                      <span>x{order.quantity}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {currentOrder && (
            <div className="card-industrial p-4">
              <h3 className="font-display font-semibold text-dark-100 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-industrial-400" />
                模型列表
              </h3>
              <div className="space-y-2">
                {currentOrder.modelFiles.map((file, idx) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedModelIndex(idx)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-sm border transition-all flex items-center gap-2.5",
                      selectedModelIndex === idx
                        ? "bg-industrial-500/10 border-industrial-500/50"
                        : "bg-dark-900/50 border-dark-700 hover:border-dark-600"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: modelColors[idx % modelColors.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display text-dark-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs font-mono text-dark-500">
                        {file.dimensions.x}×{file.dimensions.y}×{file.dimensions.z}mm
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card-industrial p-4">
            <h3 className="font-display font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              支撑参数
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display text-dark-300">显示支撑</span>
                <button
                  onClick={() => setShowSupports(!showSupports)}
                  className={cn(
                    "w-11 h-6 rounded-sm relative transition-colors",
                    showSupports ? "bg-industrial-500" : "bg-dark-700"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-sm transition-all",
                      showSupports ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-display text-dark-400">支撑密度</span>
                  <span className="text-xs font-mono text-industrial-400">
                    {Math.round(supportDensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={supportDensity}
                  onChange={(e) => setSupportDensity(parseFloat(e.target.value))}
                  className="w-full accent-industrial-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-display text-dark-400">临界支撑角</span>
                  <span className="text-xs font-mono text-industrial-400">{supportAngle}°</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={supportAngle}
                  onChange={(e) => setSupportAngle(parseInt(e.target.value))}
                  className="w-full accent-industrial-500"
                />
              </div>
              <div className="pt-3 border-t border-dark-700">
                <label className="label-industrial">支撑类型</label>
                <div className="relative">
                  <select className="input-industrial appearance-none pr-8">
                    <option>柱状支撑</option>
                    <option>树状支撑</option>
                    <option>线状支撑</option>
                    <option>面状支撑</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-dark-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card-industrial overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-900/50">
              <div className="flex gap-1">
                {[
                  { key: "perspective", label: "透视", icon: Crosshair },
                  { key: "top", label: "俯视", icon: Grid3X3 },
                  { key: "front", label: "正视", icon: AlignJustify },
                  { key: "side", label: "侧视", icon: Move },
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setViewMode(view.key as any)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-display rounded-sm flex items-center gap-1.5 transition-all",
                      viewMode === view.key
                        ? "bg-industrial-500/20 text-industrial-400"
                        : "text-dark-400 hover:text-dark-200 hover:bg-dark-800"
                    )}
                  >
                    <view.icon className="w-3.5 h-3.5" />
                    {view.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-dark-700 mx-1" />
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <Move className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-sm hover:bg-dark-800 text-dark-400 hover:text-dark-200">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-[500px] bg-[#0a0f1a] relative">
              <Canvas shadows>
                <PerspectiveCamera
                  makeDefault
                  position={viewMode === "top" ? [0, 25, 0.01] : viewMode === "front" ? [0, 5, 20] : viewMode === "side" ? [20, 5, 0] : [12, 10, 12]}
                  fov={50}
                />
                <Environment preset="city" />
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[10, 20, 10]}
                  intensity={1.2}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#88aaff" />
                <Platform />
                {models.map((model, idx) => (
                  <ModelMesh
                    key={idx}
                    position={model.position}
                    scale={model.scale}
                    color={model.color}
                    selected={selectedModelIndex === idx}
                    onClick={() => setSelectedModelIndex(idx)}
                  />
                ))}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={viewMode === "perspective"}
                  minDistance={5}
                  maxDistance={50}
                />
              </Canvas>

              {autoLayoutRunning && (
                <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 text-industrial-400 mx-auto mb-3 animate-spin" />
                    <p className="font-display font-semibold text-dark-100">正在自动排版...</p>
                    <p className="text-sm font-mono text-dark-500 mt-1">
                      优化空间利用率，计算最优摆放方案
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-dark-900/80 backdrop-blur-sm px-3 py-2 rounded-sm border border-dark-700">
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-dark-500">平台尺寸: </span>
                    <span className="text-dark-200">335×200×300mm</span>
                  </div>
                  <div>
                    <span className="text-dark-500">模型数量: </span>
                    <span className="text-industrial-400">{models.length}</span>
                  </div>
                  <div>
                    <span className="text-dark-500">体积: </span>
                    <span className="text-amber-400">{totalVolume.toFixed(1)} cm³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-industrial p-4">
              <p className="text-xs font-display text-dark-400 uppercase tracking-wider mb-1">
                面积利用率
              </p>
              <p className="text-2xl font-display font-bold text-industrial-400">
                {areaUtilization.toFixed(1)}%
              </p>
              <div className="mt-2">
                <ProgressBar value={areaUtilization} />
              </div>
            </div>
            <div className="card-industrial p-4">
              <p className="text-xs font-display text-dark-400 uppercase tracking-wider mb-1">
                打印层数
              </p>
              <p className="text-2xl font-display font-bold text-amber-400">
                {Math.round(300 / 0.05)}
              </p>
              <p className="text-xs font-mono text-dark-500 mt-1">层厚 0.05mm</p>
            </div>
            <div className="card-industrial p-4">
              <p className="text-xs font-display text-dark-400 uppercase tracking-wider mb-1">
                预计时长
              </p>
              <p className="text-2xl font-display font-bold text-green-400">8h 32m</p>
              <p className="text-xs font-mono text-dark-500 mt-1">曝光 8.5s/层</p>
            </div>
            <div className="card-industrial p-4">
              <p className="text-xs font-display text-dark-400 uppercase tracking-wider mb-1">
                树脂用量
              </p>
              <p className="text-2xl font-display font-bold text-purple-400">
                {(totalVolume * 1.2).toFixed(1)} ml
              </p>
              <p className="text-xs font-mono text-dark-500 mt-1">含支撑用量</p>
            </div>
          </div>

          <div className="card-industrial p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-dark-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-industrial-400" />
                打印参数设置
              </h3>
              <button className="btn-primary text-sm">
                <Play className="w-3.5 h-3.5 inline mr-1.5" />
                发送至打印机
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label-industrial">层厚 (mm)</label>
                <select className="input-industrial">
                  <option>0.025</option>
                  <option selected>0.05</option>
                  <option>0.1</option>
                </select>
              </div>
              <div>
                <label className="label-industrial">基础曝光 (s)</label>
                <input type="number" defaultValue={30} className="input-industrial" />
              </div>
              <div>
                <label className="label-industrial">普通曝光 (s)</label>
                <input type="number" defaultValue={8.5} className="input-industrial" />
              </div>
              <div>
                <label className="label-industrial">抬升速度 (mm/s)</label>
                <input type="number" defaultValue={1.5} className="input-industrial" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
