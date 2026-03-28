import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Table, type TableStatus, zones } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

const statusConfig: Record<TableStatus, { dot: string; bg: string; border: string }> = {
  available:  { dot: "bg-status-green",  bg: "bg-status-green/[0.06]",  border: "border-status-green/20" },
  reserved:   { dot: "bg-primary",       bg: "bg-primary/[0.06]",       border: "border-primary/20" },
  ordering:   { dot: "bg-status-amber",  bg: "bg-status-amber/[0.06]",  border: "border-status-amber/20" },
  ordered:    { dot: "bg-[hsl(24,80%,45%)]", bg: "bg-[hsl(24,80%,45%)]/[0.06]", border: "border-[hsl(24,80%,45%)]/20" },
  dirty:      { dot: "bg-status-red",    bg: "bg-status-red/[0.06]",    border: "border-status-red/20" },
  cleaning:   { dot: "bg-muted-foreground", bg: "bg-muted/50",          border: "border-border" },
};

interface Props {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

export const MobileTablesScreen: React.FC<Props> = ({ tables, onSelectTable }) => {
  const { t } = useLanguage();
  const [zone, setZone] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = tables.filter(tbl => {
    if (zone !== "All" && tbl.zone !== zone) return false;
    if (search && !tbl.number.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Nav Bar */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-foreground tracking-tight">{t("tables")}</h1>
          <span className="text-[11px] text-muted-foreground font-medium">Song Fa Bak Kut Teh</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_table")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Zone Filter — flex wrap */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {[t("all"), ...zones].map((z, idx) => {
          const rawZone = idx === 0 ? "All" : zones[idx - 1];
          return (
            <button
              key={rawZone}
              onClick={() => setZone(rawZone)}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
                zone === rawZone
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border-1.5 border-border"
              )}
            >
              {z}
            </button>
          );
        })}
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 pb-2">
        {(Object.keys(statusConfig) as TableStatus[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", statusConfig[s].dot)} />
            <span className="text-[10px] text-muted-foreground capitalize">{t(s)}</span>
          </div>
        ))}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(table => {
            const cfg = statusConfig[table.status];
            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table)}
                className={cn(
                  "relative p-4 rounded-xl border-[1.5px] text-left transition-all active:scale-[0.97] overflow-hidden",
                  cfg.bg, cfg.border
                )}
              >
                {/* Left status stripe */}
                <div className={cn("absolute top-0 left-0 w-1 h-full rounded-l-xl", cfg.dot)} />
                
                <div className="pl-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg font-bold text-foreground">T{table.number}</span>
                    <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span>{table.guestCount || 0}/{table.seats} {t("seats")}</span>
                  </div>
                  {table.openAmount !== undefined && table.openAmount > 0 && (
                    <div className="text-[13px] font-semibold text-foreground font-mono">${table.openAmount.toFixed(2)}</div>
                  )}
                  {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{table.elapsedMinutes}m</div>
                  )}
                  {table.server && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{table.server}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
