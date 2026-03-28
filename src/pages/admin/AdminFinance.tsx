import React, { useState } from "react";
import { AlertCircle, ArrowLeft, Download, FileText, Calendar, ChevronRight, TrendingUp, TrendingDown, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tenderMix = [
  { method: "Card (Visa/MC/UPI)", amount: 342680.50, pct: 70, color: "bg-primary" },
  { method: "Alipay+", amount: 63750.00, pct: 13, color: "bg-[hsl(210,100%,55%)]" },
  { method: "WeChat Pay", amount: 53900.00, pct: 11, color: "bg-[hsl(145,60%,40%)]" },
  { method: "PayNow QR", amount: 19520.00, pct: 4, color: "bg-[hsl(265,50%,55%)]" },
  { method: "Cash", amount: 9780.00, pct: 2, color: "bg-status-amber" },
];

const settlements = [
  { id: "SF-2026-01-31", date: "31 Jan 2026", gross: "$16,234.50", fees: "$243.52", net: "$15,990.98", status: "settled" },
  { id: "SF-2026-01-30", date: "30 Jan 2026", gross: "$14,890.00", fees: "$223.35", net: "$14,666.65", status: "settled" },
  { id: "SF-2026-01-29", date: "29 Jan 2026", gross: "$15,720.30", fees: "$235.80", net: "$15,484.50", status: "settled" },
  { id: "SF-2026-01-28", date: "28 Jan 2026", gross: "$13,450.80", fees: "$201.76", net: "$13,249.04", status: "settled" },
  { id: "SF-2026-01-27", date: "27 Jan 2026", gross: "$17,120.60", fees: "$256.81", net: "$16,863.79", status: "settled" },
  { id: "SF-2026-01-26", date: "26 Jan 2026", gross: "$11,980.20", fees: "$179.70", net: "$11,800.50", status: "settled" },
  { id: "SF-2026-01-25", date: "25 Jan 2026", gross: "$14,560.00", fees: "$218.40", net: "$14,341.60", status: "pending" },
];

const exceptions = [
  { type: "Void", order: "#0041", amount: "$12.50", reason: "Customer complaint", time: "11:30 AM" },
  { type: "Refund", order: "#0038", amount: "$7.00", reason: "Wrong order", time: "10:15 AM" },
  { type: "Refund", order: "#0035", amount: "$23.80", reason: "Duplicate charge", time: "09:42 AM" },
];

// Settlement detail mock (when viewing a specific settlement)
const settlementDetail = {
  batchId: "SF-2026-01-31",
  date: "31 January 2026",
  merchant: "Song Fa Bak Kut Teh Food Pte. Ltd.",
  mid: "MID-UW-2024-0042",
  bank: "DBS Bank Singapore",
  account: "••••-••••-4821",
  model: "T+1 · Next Business Day",
  currency: "SGD",
  kpis: {
    grossVolume: 16234.50,
    totalFees: 243.52,
    netPayout: 15990.98,
    refunds: 43.30,
    txnCount: 342,
  },
  breakdown: [
    { category: "Visa", txns: 156, gross: 7280.50, fees: 116.49, net: 7164.01 },
    { category: "Mastercard", txns: 98, gross: 5120.00, fees: 81.92, net: 5038.08 },
    { category: "UnionPay", txns: 12, gross: 680.00, fees: 17.00, net: 663.00 },
    { category: "Alipay+", txns: 38, gross: 1820.00, fees: 14.56, net: 1805.44 },
    { category: "WeChat Pay", txns: 24, gross: 890.00, fees: 7.12, net: 882.88 },
    { category: "PayNow QR", txns: 14, gross: 444.00, fees: 6.43, net: 437.57 },
  ],
};

type ViewMode = "overview" | "detail";

const AdminFinance: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);

  const handleViewReport = (batchId: string) => {
    setSelectedSettlement(batchId);
    setViewMode("detail");
  };

  // --- Settlement Report Detail View ---
  if (viewMode === "detail") {
    const d = settlementDetail;
    return (
      <div className="p-7">
        <button onClick={() => setViewMode("overview")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[13px] mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Finance
        </button>

        {/* Report Header - blue banner */}
        <div className="bg-primary rounded-t-xl p-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-primary-foreground/60 uppercase tracking-widest font-semibold mb-1">Settlement Report</div>
            <div className="text-xl font-bold text-primary-foreground tracking-tight">{d.date}</div>
            <div className="text-[11px] text-primary-foreground/60 font-mono mt-1">Ref: {d.batchId}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1.5 text-[11px] bg-primary-foreground/10 text-primary-foreground border-0 hover:bg-primary-foreground/20">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button variant="secondary" size="sm" className="gap-1.5 text-[11px] bg-primary-foreground/10 text-primary-foreground border-0 hover:bg-primary-foreground/20">
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>

        {/* Merchant Info Strip */}
        <div className="grid grid-cols-3 border-x border-b border-border bg-accent/30">
          <div className="p-4 border-r border-border">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Merchant</div>
            <div className="text-[13px] font-semibold text-foreground">{d.merchant}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{d.mid}</div>
          </div>
          <div className="p-4 border-r border-border">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Settlement Bank</div>
            <div className="text-[13px] font-semibold text-foreground">{d.bank}</div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">Account {d.account}</div>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Settlement Model</div>
            <div className="text-[13px] font-semibold text-foreground">{d.model}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Currency: {d.currency}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 my-6">
          {[
            { label: "Gross Volume", value: `$${d.kpis.grossVolume.toLocaleString()}`, stripe: "bg-primary", sub: `${d.kpis.txnCount} transactions` },
            { label: "Total Fees", value: `$${d.kpis.totalFees.toFixed(2)}`, stripe: "bg-destructive", sub: `MDR ${(d.kpis.totalFees / d.kpis.grossVolume * 100).toFixed(2)}%` },
            { label: "Net Payout", value: `$${d.kpis.netPayout.toLocaleString()}`, stripe: "bg-status-green", sub: `To DBS ${d.account}` },
            { label: "Refunds", value: `$${d.kpis.refunds.toFixed(2)}`, stripe: "bg-status-amber", sub: `${(d.kpis.refunds / d.kpis.grossVolume * 100).toFixed(3)}% of GMV` },
          ].map(s => (
            <div key={s.label} className="uniweb-card relative overflow-hidden p-4">
              <div className={`kpi-stripe ${s.stripe}`} />
              <div className="section-label mt-1 mb-2">{s.label}</div>
              <div className="text-xl font-bold text-foreground tracking-tighter leading-none font-mono">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Breakdown Table */}
        <div className="uniweb-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-foreground">Payment Method Breakdown</h3>
            <span className="text-[11px] text-muted-foreground">Period: {d.date}</span>
          </div>
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Category</th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Transactions</th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Gross (SGD)</th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Fees (SGD)</th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Net (SGD)</th>
              </tr>
            </thead>
            <tbody>
              {d.breakdown.map(row => (
                <tr key={row.category} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-2.5 text-[12px] font-medium text-foreground">{row.category}</td>
                  <td className="px-5 py-2.5 text-right text-[12px] font-mono text-muted-foreground">{row.txns.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right text-[12px] font-mono text-foreground">${row.gross.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right text-[12px] font-mono text-destructive">${row.fees.toFixed(2)}</td>
                  <td className="px-5 py-2.5 text-right text-[12px] font-mono font-semibold text-status-green">${row.net.toLocaleString()}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-primary/5 border-t-2 border-primary">
                <td className="px-5 py-3 text-[12px] font-bold text-foreground">Total</td>
                <td className="px-5 py-3 text-right text-[12px] font-mono font-bold text-foreground">{d.kpis.txnCount}</td>
                <td className="px-5 py-3 text-right text-[12px] font-mono font-bold text-foreground">${d.kpis.grossVolume.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-[12px] font-mono font-bold text-destructive">${d.kpis.totalFees.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-[12px] font-mono font-bold text-status-green">${d.kpis.netPayout.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payout Confirmation */}
        <div className="grid grid-cols-2 border-2 border-primary rounded-xl overflow-hidden mb-6">
          <div className="bg-primary/5 p-6 border-r border-primary/20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Net Payout Amount</div>
            <div className="text-3xl font-bold text-foreground tracking-tighter leading-none font-mono">${d.kpis.netPayout.toLocaleString()}</div>
            <div className="text-[12px] text-muted-foreground mt-1 font-medium">{d.currency}</div>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              This is the net amount settled to your designated bank account after deduction of applicable processing fees, refunds, and chargebacks.
            </p>
          </div>
          <div className="bg-accent/20 p-6 space-y-3">
            {[
              { label: "Settlement Date", value: d.date },
              { label: "Batch Reference", value: d.batchId },
              { label: "Bank Account", value: `DBS ${d.account}` },
              { label: "Status", value: "Settled ✓" },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-baseline py-1 border-b border-border/50 last:border-0">
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                <span className="text-[11px] font-semibold text-foreground font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-accent/30 border border-border rounded-lg p-4 text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Disclaimer:</strong> This settlement report is generated by Uniweb Pte. Ltd. as the licensed payment facilitator. All amounts are in SGD. Net payout reflects gross transaction volume minus applicable Merchant Discount Rate (MDR) fees, refunds, and chargebacks. For queries contact settlements@uniweb.sg.
        </div>
      </div>
    );
  }

  // --- Overview ---
  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Finance & Reconciliation</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Settlement tracking, tender mix, and GST reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]">
            <Calendar className="h-3.5 w-3.5" /> Jan 2026
          </Button>
          <Button size="sm" className="gap-1.5 text-[12px]">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Monthly Gross", value: "$489,630.50", stripe: "bg-primary", sub: "+8.2% vs Dec", trend: "up" },
          { label: "Net Settled", value: "$481,768.40", stripe: "bg-status-green", sub: "31 batches", trend: "up" },
          { label: "Total Fees", value: "$7,862.10", stripe: "bg-destructive", sub: "MDR 1.61%", trend: "down" },
          { label: "GST Collected", value: "$40,231.45", stripe: "bg-status-amber", sub: "IRAS compliant", trend: "up" },
        ].map(s => (
          <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
            <div className={`kpi-stripe ${s.stripe}`} />
            <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
            <div className="text-[22px] font-bold text-foreground tracking-tighter leading-none font-mono">{s.value}</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1.5">
              {s.trend === "up" ? <TrendingUp className="h-3 w-3 text-status-green" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Tender Mix */}
        <div className="uniweb-card p-5">
          <div className="section-label mb-4">Payment Method Mix</div>
          <div className="space-y-3">
            {tenderMix.map(t => (
              <div key={t.method}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-foreground font-medium">{t.method}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">${t.amount.toLocaleString()} ({t.pct}%)</span>
                </div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full transition-all duration-600`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exceptions */}
        <div className="uniweb-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-3.5 w-3.5 text-status-amber" />
            <span className="section-label">Exceptions & Adjustments</span>
          </div>
          <div className="space-y-2.5">
            {exceptions.map(e => (
              <div key={e.order} className="flex items-center gap-3 p-3 rounded-lg bg-status-amber-light/50 border border-status-amber/15">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-foreground">{e.type}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{e.order}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{e.reason}</p>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold text-destructive font-mono">{e.amount}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="uniweb-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-foreground">Settlement History</h2>
          <span className="text-[11px] text-muted-foreground">T+1 · Next Business Day</span>
        </div>
        <table className="w-full">
          <thead className="bg-accent/30">
            <tr>
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Date</th>
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Batch ID</th>
              <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Gross (SGD)</th>
              <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Fees</th>
              <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Net Payout</th>
              <th className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {settlements.map(s => (
              <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-accent/20 cursor-pointer transition-colors"
                onClick={() => handleViewReport(s.id)}>
                <td className="px-5 py-3 text-[12px] text-foreground">{s.date}</td>
                <td className="px-5 py-3 text-[12px] font-mono text-muted-foreground">{s.id}</td>
                <td className="px-5 py-3 text-right text-[12px] font-semibold text-foreground font-mono">{s.gross}</td>
                <td className="px-5 py-3 text-right text-[12px] text-destructive font-mono">{s.fees}</td>
                <td className="px-5 py-3 text-right text-[12px] font-semibold text-status-green font-mono">{s.net}</td>
                <td className="px-5 py-3 text-center">
                  <span className={cn("status-badge text-[10px]",
                    s.status === "settled" ? "bg-status-green-light text-status-green" : "bg-status-amber-light text-status-amber"
                  )}>
                    <span className={cn("status-dot", s.status === "settled" ? "bg-status-green" : "bg-status-amber")} />
                    {s.status === "settled" ? "Settled" : "Pending"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors" title="View Report">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinance;
