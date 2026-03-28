import React, { useState } from "react";
import { Search, Phone, Mail, Star } from "lucide-react";
import { customers } from "@/data/mock-data";

const tierStyles: Record<string, string> = {
  bronze: "bg-status-amber-light text-status-amber",
  silver: "bg-accent text-muted-foreground",
  gold: "bg-status-amber-light text-status-amber",
  platinum: "bg-status-blue-light text-primary",
};

const AdminCRM: React.FC = () => {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer Management</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{filtered.length} customers</p>
      </div>

      <div className="relative w-64 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="uniweb-card p-5 hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-foreground">{c.name}</h3>
              <span className={`status-badge capitalize ${tierStyles[c.tier]}`}>{c.tier}</span>
            </div>
            <div className="space-y-1.5 text-[13px] text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 flex-shrink-0" />{c.phone}</div>
              {c.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 flex-shrink-0" />{c.email}</div>}
            </div>
            <div className="flex gap-4 mt-4 pt-3 border-t border-border text-[13px]">
              <div><span className="font-semibold text-foreground">{c.visits}</span> <span className="text-muted-foreground">visits</span></div>
              <div><span className="font-semibold text-foreground">{c.points}</span> <span className="text-muted-foreground">points</span></div>
              <div className="text-muted-foreground ml-auto text-[11px] font-mono">Last: {c.lastVisit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCRM;
