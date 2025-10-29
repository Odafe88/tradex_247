import { Outlet, Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Bitcoin, ArrowLeftRight, Users, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    getUser();
  }, []);

  const sidebarItems = [
    { path: "/dashboard", icon: TrendingUp, exact: true },
    { path: "/dashboard/reports", icon: BarChart3 },
    { path: "/dashboard/cryptocurrency", icon: Bitcoin },
    { path: "/dashboard/exchange", icon: ArrowLeftRight },
    { path: "/dashboard/community", icon: Users },
    { path: "/dashboard/settings", icon: Settings },
  ];

  const topNavItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/dashboard/reports", label: "Reports" },
    { path: "/dashboard/cryptocurrency", label: "Cryptocurrency" },
    { path: "/dashboard/exchange", label: "Exchange" },
    { path: "/dashboard/community", label: "Community" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Sidebar */}
      <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-6 space-y-6">
        <Link to="/dashboard" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-lg">
          P
        </Link>
        <div className="flex-1 flex flex-col items-center space-y-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path) && item.path !== "/dashboard";
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-border bg-card">
          <div className="px-8 py-4 flex items-center justify-between">
            <nav className="flex gap-8">
              {topNavItems.map((item) => {
                const isActive = item.path === "/dashboard" 
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "text-sm font-medium transition-colors pb-4 border-b-2",
                      isActive
                        ? "text-foreground border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">Ilona Smiluet</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold">IS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
