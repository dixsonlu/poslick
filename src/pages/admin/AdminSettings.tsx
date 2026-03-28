import React from "react";
import { Building2, CreditCard, Globe, Bell } from "lucide-react";

const AdminSettings: React.FC = () => (
  <div className="p-7">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
      <p className="text-[13px] text-muted-foreground mt-1">Configure your outlet</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { icon: Building2, title: "Outlet Details", desc: "Business name, address, operating hours", status: "Configured" },
        { icon: CreditCard, title: "Payment Setup", desc: "Uniweb card rail, PayNow, SGQR configuration", status: "Pending KYB" },
        { icon: Globe, title: "Compliance", desc: "ACRA registration, UBO details, KYB status", status: "Under Review" },
        { icon: Bell, title: "Notifications", desc: "Alert preferences, order notifications", status: "Configured" },
      ].map(item => (
        <button key={item.title} className="uniweb-card p-5 text-left hover:border-primary/30 transition-all cursor-pointer group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-[11px] bg-status-blue-light flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-[13px]">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </div>
          <span className={`status-badge ${
            item.status === "Configured" ? "bg-status-green-light text-status-green" :
            item.status === "Under Review" ? "bg-status-amber-light text-status-amber" :
            "bg-status-blue-light text-primary"
          }`}>
            <span className={`status-dot ${
              item.status === "Configured" ? "bg-status-green" :
              item.status === "Under Review" ? "bg-status-amber" :
              "bg-primary"
            }`} />
            {item.status}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default AdminSettings;
