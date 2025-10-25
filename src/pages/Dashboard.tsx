import { useState } from "react";
import { motion } from "framer-motion";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Wallet, TrendingUp, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard/trading", label: "Trading", icon: TrendingUp },
    { path: "/dashboard/deposit", label: "Deposit", icon: Wallet },
    { path: "/dashboard/assets", label: "Assets", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gradient">
              CryptoTrade
            </Link>
            <nav className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-lg flex items-center gap-2 transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
