import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";

const stats = [
  { label: "Today's Revenue", value: "$2,847.50", change: "+12.5%", up: true, icon: DollarSign },
  { label: "Total Orders", value: "48", change: "+8", up: true, icon: ShoppingBag },
  { label: "Unique Customers", value: "92", change: "+15", up: true, icon: Users },
  { label: "Avg Wait Time", value: "12 min", change: "-2 min", up: true, icon: Clock },
];

const recentOrders = [
  { id: "TXN-0048", table: "T3", items: 4, total: "$96.23", status: "open", time: "12:15 PM" },
  { id: "TXN-0047", table: "T2", items: 4, total: "$47.52", status: "open", time: "12:30 PM" },
  { id: "TXN-0046", table: "T8", items: 2, total: "$21.38", status: "open", time: "12:45 PM" },
  { id: "TXN-0045", table: "—", items: 3, total: "$35.20", status: "settled", time: "12:00 PM" },
  { id: "TXN-0044", table: "T5", items: 2, total: "$18.50", status: "settled", time: "11:45 AM" },
];

const AdminDashboard: React.FC = () => (
  <div className="p-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Today's overview · Song Fa Bak Kut Teh</p>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-4 gap-6 mb-8">
      {stats.map(s => (
        <div key={s.label} className="uniweb-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">{s.label}</span>
            <s.icon className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <div className="text-[28px] font-bold text-foreground tracking-tighter leading-none mb-2">{s.value}</div>
          <div className="flex items-center gap-1.5">
            {s.up ? (
              <span className="status-badge bg-status-green-light text-status-green">
                <TrendingUp className="h-3 w-3" />
                {s.change}
              </span>
            ) : (
              <span className="status-badge bg-status-red-light text-status-red">
                <TrendingDown className="h-3 w-3" />
                {s.change}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">vs last week</span>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Orders */}
    <div className="uniweb-card">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
        <span className="text-[11px] text-muted-foreground">Last 24 hours</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Order ID</th>
              <th>Table</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders.map(o => (
              <tr key={o.id} className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer">
                <td className="px-4 py-3 font-medium text-foreground font-mono text-xs">{o.id}</td>
                <td className="px-4 py-3 text-muted-foreground text-[13px]">{o.table}</td>
                <td className="px-4 py-3 text-muted-foreground text-[13px]">{o.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground font-mono text-[13px]">{o.total}</td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${
                    o.status === "open"
                      ? "bg-status-amber-light text-status-amber"
                      : "bg-status-green-light text-status-green"
                  }`}>
                    <span className={`status-dot ${o.status === "open" ? "bg-status-amber" : "bg-status-green"}`} />
                    {o.status === "open" ? "Open" : "Settled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
