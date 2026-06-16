import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Upload,
  Save,
  Send,
  X,
  File,
  User,
  Phone,
  Mail,
  MapPin,
  Layers,
  Box,
  DollarSign,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFactoryStore } from "../store/useFactoryStore";

const materialOptions = [
  { value: "标准光敏树脂", label: "标准光敏树脂", colors: ["白色", "灰色", "黑色"] },
  { value: "高韧性光敏树脂", label: "高韧性光敏树脂", colors: ["透明", "黑色"] },
  { value: "生物相容性树脂", label: "生物相容性树脂", colors: ["肤色"] },
  { value: "耐高温树脂", label: "耐高温树脂", colors: ["黄色"] },
];

const layerHeightOptions = [0.025, 0.05, 0.1];

export default function OrderCreate() {
  const navigate = useNavigate();
  const addOrder = useFactoryStore((s) => s.addOrder);
  const resins = useFactoryStore((s) => s.resins);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    materialType: "标准光敏树脂",
    materialColor: "白色",
    layerHeight: 0.05,
    quantity: 1,
    remark: "",
    isUrgent: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [materialDropdown, setMaterialDropdown] = useState(false);

  const currentMaterial = materialOptions.find((m) => m.value === formData.materialType);

  const unitPrice = useMemo(() => {
    if (uploadedFiles.length === 0) return 0;
    const basePrice = resins.find((r) => r.type === formData.materialType)?.pricePerUnit || 480;
    const layerMultiplier = formData.layerHeight === 0.025 ? 2 : formData.layerHeight === 0.05 ? 1.5 : 1;
    const fileVolume = uploadedFiles.reduce((sum, f) => sum + f.size, 0) / 100000;
    const price = Math.round((basePrice * layerMultiplier * fileVolume) / 1000);
    return Math.max(price, 100);
  }, [uploadedFiles, formData.materialType, formData.layerHeight, resins]);

  const layerMultiplier = formData.layerHeight === 0.025 ? 2 : formData.layerHeight === 0.05 ? 1.5 : 1;
  const totalPrice = unitPrice * formData.quantity * (formData.isUrgent ? 1.3 : 1);

  const handleSubmit = (submitType: "save" | "submit") => {
    if (submitType === "submit" && unitPrice === 0) {
      alert("请先上传模型文件以生成报价");
      return;
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const orderNo = `SLA${now.replace(/[-: ]/g, "").slice(0, 12)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNo,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      modelFiles: uploadedFiles.map((f, i) => ({
        id: `mdl-new-${i}`,
        name: f.name,
        size: f.size,
        url: "",
        dimensions: { x: 100, y: 100, z: 100 },
        volume: 100,
        hasSupports: false,
      })),
      materialType: formData.materialType,
      materialColor: formData.materialColor,
      layerHeight: formData.layerHeight,
      quantity: formData.quantity,
      unitPrice,
      totalPrice: Math.round(totalPrice),
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
      remark: formData.remark,
      timeline: [
        {
          status: "pending",
          statusLabel: "待审核",
          timestamp: now,
          operator: submitType === "submit" ? "系统" : "草稿",
          remark: submitType === "submit" ? "客户提交订单" : "订单草稿已创建",
        },
      ],
    };

    addOrder(newOrder);
    navigate("/orders");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((f) => ({ name: f.name, size: f.size }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

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
            <h1 className="text-2xl font-display font-bold text-dark-50">新建订单</h1>
            <p className="text-sm font-mono text-dark-500 mt-1">
              录入客户信息和打印参数，创建新的3D打印订单
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSubmit("save")} className="btn-secondary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存草稿
          </button>
          <button onClick={() => handleSubmit("submit")} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            提交审核
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-industrial p-5">
            <h2 className="font-display font-semibold text-lg text-dark-50 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-industrial-400" />
              客户信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-industrial">客户名称 *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input-industrial pl-9"
                    placeholder="请输入公司/个人名称"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label-industrial">联系电话 *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    className="input-industrial pl-9"
                    placeholder="请输入联系电话"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label-industrial">电子邮箱</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    className="input-industrial pl-9"
                    placeholder="请输入邮箱地址"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label-industrial">收货地址</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-dark-500 absolute left-3 top-3" />
                  <textarea
                    className="input-industrial pl-9 py-2.5 min-h-[60px] resize-none"
                    placeholder="请输入详细收货地址"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-industrial p-5">
            <h2 className="font-display font-semibold text-lg text-dark-50 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-industrial-400" />
              模型文件
            </h2>
            <label className="block border-2 border-dashed border-dark-700 rounded-sm p-8 text-center hover:border-industrial-500/50 transition-colors cursor-pointer group">
              <input
                type="file"
                multiple
                accept=".stl,.obj,.3mf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-dark-500 mx-auto mb-3 group-hover:text-industrial-400 transition-colors" />
              <p className="font-display font-medium text-dark-200 mb-1">
                点击或拖拽文件到此处上传
              </p>
              <p className="text-xs font-mono text-dark-500">
                支持 STL / OBJ / 3MF 格式，单个文件不超过 200MB
              </p>
            </label>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-dark-900 border border-dark-700 rounded-sm"
                  >
                    <div className="w-9 h-9 bg-industrial-500/15 rounded-sm flex items-center justify-center">
                      <File className="w-4 h-4 text-industrial-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm text-dark-100">{file.name}</p>
                      <p className="text-xs font-mono text-dark-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 rounded-sm hover:bg-dark-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-dark-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-industrial p-5">
            <h2 className="font-display font-semibold text-lg text-dark-50 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-industrial-400" />
              打印参数
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="label-industrial">树脂材料 *</label>
                <button
                  onClick={() => setMaterialDropdown(!materialDropdown)}
                  className="input-industrial flex items-center justify-between text-left"
                >
                  <span>{formData.materialType}</span>
                  <ChevronDown className="w-4 h-4 text-dark-500" />
                </button>
                {materialDropdown && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-dark-800 border border-dark-700 rounded-sm shadow-card">
                    {materialOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            materialType: opt.value,
                            materialColor: opt.colors[0],
                          });
                          setMaterialDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-display hover:bg-dark-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="label-industrial">材料颜色 *</label>
                <select
                  className="input-industrial"
                  value={formData.materialColor}
                  onChange={(e) => setFormData({ ...formData, materialColor: e.target.value })}
                >
                  {currentMaterial?.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-industrial">层厚 (mm) *</label>
                <div className="flex gap-2">
                  {layerHeightOptions.map((lh) => (
                    <button
                      key={lh}
                      onClick={() => setFormData({ ...formData, layerHeight: lh })}
                      className={`flex-1 py-2 text-sm font-mono rounded-sm border transition-all ${
                        formData.layerHeight === lh
                          ? "bg-industrial-500/20 border-industrial-500 text-industrial-400"
                          : "bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-600"
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-industrial">打印数量 *</label>
                <input
                  type="number"
                  min="1"
                  className="input-industrial"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer select-none py-2">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-industrial-500 focus:ring-industrial-500 focus:ring-offset-0"
                  />
                  <span className="text-sm font-display text-dark-200">加急订单 (+30%加急费)</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="label-industrial">备注说明</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-dark-500 absolute left-3 top-3" />
                  <textarea
                    className="input-industrial pl-9 py-2.5 min-h-[80px] resize-none"
                    placeholder="特殊要求、表面处理、交货时间等说明"
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-industrial p-5 sticky top-20">
            <h2 className="font-display font-semibold text-lg text-dark-50 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              报价预览
            </h2>
            <div className="space-y-3 border-t border-dark-700 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400 font-mono">材料单价</span>
                <span className="font-mono text-dark-200">¥{unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400 font-mono">打印数量</span>
                <span className="font-mono text-dark-200">x{formData.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400 font-mono">层厚系数</span>
                <span className="font-mono text-dark-200">
                  x{layerMultiplier.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400 font-mono">文件数</span>
                <span className="font-mono text-dark-200">{uploadedFiles.length} 个</span>
              </div>
              {formData.isUrgent && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-400 font-mono">加急费用 (30%)</span>
                  <span className="font-mono text-amber-400">¥{Math.round(unitPrice * formData.quantity * 0.3).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-dark-700">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-dark-100">订单总计</span>
                  <span className="text-2xl font-display font-bold text-amber-400">
                    ¥{Math.round(totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm">
              <p className="text-xs font-mono text-amber-400 leading-relaxed">
                ⚠ 报价为系统估算，最终价格以人工审核确认为准。加急订单需额外收取30%加急费。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
