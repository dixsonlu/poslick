import React from "react";
import { TrendingUp } from "lucide-react";

const dailyData = [
  { day: "Mon", sales: 1820 },
  { day: "Tue", sales: 2150 },
  { day: "Wed", sales: 1950 },
  { day: "Thu", sales: 2480 },
  { day: "Fri", sales: 3100 },
  { day: "Sat", sales: 3650 },
  { day: "Sun", sales: 2847 },
];

const topItems = [
  { name: "Bak Kut Teh (Pork Ribs)", qty: 42, revenue: "$231.00" },
  { name: "Premium Pork Ribs Soup", qty: 35, revenue: "$245.00" },
  { name: "Braised Pig Trotters", qty: 68, revenue: "$170.00" },
  { name: "Sliced Fish Soup", qty: 12, revenue: "$456.00" },
  { name: "You Tiao (Set of 2)", qty: 38, revenue: "$247.00" },
];

const maxSales = Math.max(...dailyData.map(d => d.sales));

const AdminSales: React.FC = () => (
  <div className="p-7">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Sales Report</h1>
      <p className="text-[13px] text-muted-foreground mt-1">This week's performance</p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: "Total Revenue", value: "$17,997", change: "+8.3%", stripe: "bg-status-green" },
        { label: "Orders", value: "312", change: "+5.1%", stripe: "bg-primary" },
        { label: "Avg Order Value", value: "$57.68", change: "+3.0%", stripe: "bg-status-amber" },
      ].map(s => (
        <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
          <div className={`kpi-stripe ${s.stripe}`} />
          <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
          <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none mb-2">{s.value}</div>
          <span className="status-badge bg-status-green-light text-status-green">
            <TrendingUp className="h-3 w-3" />
            {s.change}
          </span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4">
      {/* Chart */}
      <div className="uniweb-card p-5">
        <div className="text-sm font-semibold text-foreground mb-4">Daily Sales</div>
        <div className="flex items-end gap-3 h-40">
          {dailyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-mono">${d.sales}</span>
              <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${(d.sales / maxSales) * 100}%` }}>
                <div className="w-full h-full bg-primary rounded-t-md" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div className="uniweb-card p-5">
        <div className="text-sm font-semibold text-foreground mb-4">Top Items</div>
        <div className="space-y-3">
          {topItems.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                i === 0 ? "bg-primary text-primary-foreground" : i < 3 ? "bg-foreground text-background" : "bg-accent text-muted-foreground"
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 text-[13px] font-medium text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.qty} sold</span>
              <span className="text-[13px] font-semibold text-foreground font-mono">{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminSales;
