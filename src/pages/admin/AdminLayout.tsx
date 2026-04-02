import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, UtensilsCrossed, Users, Shield, Monitor, BarChart3,
  DollarSign, Settings, LogOut, Bell, Tag, Package, Map, ListOrdered, ScreenShare
} from "lucide-react";
import uniwebLogo from "@/assets/uniweb-logo.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";

const navGroups = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Menu", url: "/admin/menu", icon: UtensilsCrossed },
      { title: "Inventory", url: "/admin/inventory", icon: Package },
      { title: "Floor Plan", url: "/admin/floorplan", icon: Map },
      { title: "Queue", url: "/admin/queue", icon: ListOrdered },
      { title: "KDS Monitor", url: "/admin/kds", icon: Monitor },
      { title: "Pickup Display", url: "/admin/pickup", icon: ScreenShare },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Sales Report", url: "/admin/sales", icon: BarChart3 },
      { title: "Finance", url: "/admin/finance", icon: DollarSign },
      { title: "Promotions", url: "/admin/promotions", icon: Tag },
      { title: "CRM", url: "/admin/crm", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Staff", url: "/admin/staff", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

const AdminLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[236px] bg-card border-r border-border flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border flex items-center gap-3">
          <img src={uniwebLogo} alt="Uniweb" className="w-9 h-9 rounded-[10px] flex-shrink-0" />
          <div>
            <div className="text-[13px] font-bold tracking-tight text-foreground leading-tight">Uniweb Pte. Ltd.</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">Merchant Portal</div>
          </div>
        </div>

        {/* Merchant Strip */}
        <div className="px-5 py-3 border-b border-border">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-0.5">Current Merchant</div>
          <div className="text-xs font-semibold text-foreground leading-tight">Song Fa Bak Kut Teh</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">MID-2024-0847</div>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto pos-scrollbar">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-5" : ""}>
              <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                {group.label}
              </div>
              {group.items.map(item => {
                const active = location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url));
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/admin"}
                    className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] font-medium mb-px transition-colors duration-150 ${
                      active
                        ? "border-l-[3px] border-l-primary text-foreground font-semibold bg-transparent pl-[7px]"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    activeClassName=""
                  >
                    <item.icon className="h-[15px] w-[15px] flex-shrink-0" />
                    {item.title}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3.5 py-3.5 border-t border-border">
          <button className="flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150">
            <LogOut className="h-[15px] w-[15px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-card shadow-sm flex items-center px-7 gap-3.5 shrink-0 sticky top-0 z-50">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative p-[7px] rounded-lg hover:bg-accent transition-colors duration-150 text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-destructive rounded-full border-[1.5px] border-card" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold cursor-pointer">
              SF
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
