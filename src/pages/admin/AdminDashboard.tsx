import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";

const stats = [
  { label: "Today's Revenue", value: "$2,847.50", change: "+12.5%", up: true, icon: DollarSign, stripe: "bg-status-green" },
  { label: "Total Orders", value: "48", change: "+8", up: true, icon: ShoppingBag, stripe: "bg-primary" },
  { label: "Unique Customers", value: "92", change: "+15", up: true, icon: Users, stripe: "bg-status-amber" },
  { label: "Avg Wait Time", value: "12 min", change: "-2 min", up: true, icon: Clock, stripe: "bg-status-red" },
];

const recentOrders = [
  { id: "TXN-0048", table: "T3", items: 4, total: "$96.23", status: "open", time: "12:15 PM" },
  { id: "TXN-0047", table: "T2", items: 4, total: "$47.52", status: "open", time: "12:30 PM" },
  { id: "TXN-0046", table: "T8", items: 2, total: "$21.38", status: "open", time: "12:45 PM" },
  { id: "TXN-0045", table: "—", items: 3, total: "$35.20", status: "settled", time: "12:00 PM" },
  { id: "TXN-0044", table: "T5", items: 2, total: "$18.50", status: "settled", time: "11:45 AM" },
];

const AdminDashboard: React.FC = () => (
  <div className="p-7">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
      <p className="text-[13px] text-muted-foreground mt-1">Today's overview · Song Fa Bak Kut Teh</p>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
          <div className={`kpi-stripe ${s.stripe}`} />
          <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
          <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none mb-2">{s.value}</div>
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
            <span className="text-[12px] text-muted-foreground">vs last week</span>
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
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer">
                <td className="font-medium text-foreground font-mono text-xs">{o.id}</td>
                <td className="text-muted-foreground">{o.table}</td>
                <td className="text-muted-foreground">{o.items}</td>
                <td className="font-semibold text-foreground font-mono">{o.total}</td>
                <td>
                  <span className={`status-badge ${
                    o.status === "open"
                      ? "bg-status-amber-light text-status-amber"
                      : "bg-status-green-light text-status-green"
                  }`}>
                    <span className={`status-dot ${o.status === "open" ? "bg-status-amber" : "bg-status-green"}`} />
                    {o.status === "open" ? "Open" : "Settled"}
                  </span>
                </td>
                <td className="text-muted-foreground text-xs">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
