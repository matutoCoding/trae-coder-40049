import {
  LayoutDashboard,
  ClipboardList,
  BoxSelect,
  Beaker,
  Printer,
  Droplets,
  Wrench,
  Truck,
  Settings,
  Bell,
  Search,
  User,
  Zap,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/orders", icon: ClipboardList, label: "在线接单" },
  { to: "/layout", icon: BoxSelect, label: "模型摆放" },
  { to: "/resin", icon: Beaker, label: "树脂备料" },
  { to: "/print", icon: Printer, label: "光固化打印" },
  { to: "/cleaning", icon: Droplets, label: "清洗固化" },
  { to: "/support", icon: Wrench, label: "支撑去除" },
  { to: "/delivery", icon: Truck, label: "成品交付" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-dark-900 border-r border-dark-700 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-16 border-b border-dark-700 flex items-center px-5 gap-3">
        <div className="w-9 h-9 bg-industrial-500 rounded-sm flex items-center justify-center shadow-glow-blue">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-dark-50 leading-none">
            SLA Factory
          </h1>
          <p className="text-[10px] text-dark-500 font-mono mt-0.5 tracking-wider">
            PRINT CONTROL v2.6
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group",
                isActive
                  ? "bg-industrial-500/15 text-industrial-400 border-l-2 border-industrial-500 shadow-glow-blue/30"
                  : "text-dark-400 hover:text-dark-100 hover:bg-dark-800 border-l-2 border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-industrial-400"
                )}
              />
              <span className="font-display text-sm font-medium">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-industrial-400 rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-dark-700 p-3">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-display text-sm font-medium">系统设置</span>
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifCount] = useState(5);

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索订单、客户、模型..."
            className="w-80 pl-9 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-sm text-sm font-mono text-dark-200 placeholder-dark-500 focus:outline-none focus:border-industrial-500 focus:ring-1 focus:ring-industrial-500 transition-all"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          {searchOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-dark-800 border border-dark-700 rounded-sm shadow-card p-3 text-xs font-mono text-dark-400">
              <p>快捷键: Ctrl + K</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-glow-green" />
          <span className="text-xs font-mono text-dark-400">
            系统正常
          </span>
          <span className="text-xs font-mono text-dark-600">|</span>
          <span className="text-xs font-mono text-dark-400">
            {new Date().toLocaleDateString("zh-CN")}
          </span>
        </div>

        <button className="relative p-2 rounded-sm hover:bg-dark-800 transition-colors">
          <Bell className="w-5 h-5 text-dark-400" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-display font-bold text-dark-900 flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-dark-700" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-industrial-600 rounded-sm flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-display font-medium text-dark-100 leading-none">
              张经理
            </p>
            <p className="text-[10px] font-mono text-dark-500 mt-0.5">
              工厂管理员
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-900 text-dark-100">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
