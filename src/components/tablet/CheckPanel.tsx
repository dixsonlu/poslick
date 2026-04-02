import React, { useState } from "react";
import { Minus, Plus, Trash2, Users, UtensilsCrossed, Tag, Percent, UserCheck, Split, X, ChevronDown, ChevronUp, Gift, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Order, type Table } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface CheckPanelProps {
  order: Order | null;
  table?: Table;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPay: () => void;
}

// Mock promo/discount data
const availablePromos = [
  { code: "LUNCH20", label: "Lunch 20% Off", type: "percentage" as const, value: 20, minSpend: 30 },
  { code: "SAVE5", label: "$5 Off", type: "fixed" as const, value: 5, minSpend: 20 },
  { code: "NEWUSER", label: "New Customer 15%", type: "percentage" as const, value: 15, minSpend: 0 },
];

const discountPresets = [
  { label: "10%", value: 10, type: "percentage" as const },
  { label: "20%", value: 20, type: "percentage" as const },
  { label: "$5", value: 5, type: "fixed" as const },
  { label: "$10", value: 10, type: "fixed" as const },
];

// Mock member coupons & points
const memberCoupons = [
  { id: "mc1", label: "$5 Off (Birthday)", code: "BDAY5", type: "fixed" as const, value: 5, expiresAt: "2026-04-30" },
  { id: "mc2", label: "15% Off Next Visit", code: "LOYAL15", type: "percentage" as const, value: 15, expiresAt: "2026-05-15" },
];

interface MemberInfo {
  name: string;
  phone: string;
  tier: string;
  points: number;
  coupons: typeof memberCoupons;
}

const mockMember: MemberInfo = {
  name: "Tan Wei Ming",
  phone: "+65 9123 4567",
  tier: "Gold",
  points: 1250,
  coupons: memberCoupons,
};

export const CheckPanel: React.FC<CheckPanelProps> = ({ order, table, onUpdateQuantity, onRemoveItem, onPay }) => {
  const { t } = useLanguage();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<typeof availablePromos[0] | null>(null);
  const [manualDiscount, setManualDiscount] = useState<{ type: "percentage" | "fixed"; value: number } | null>(null);
  const [memberDetected, setMemberDetected] = useState(false);
  const [showPromoSection, setShowPromoSection] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [showSplit, setShowSplit] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<typeof memberCoupons[0] | null>(null);

  if (!order) {
    return (
      <div className="bg-card flex flex-col items-center justify-center h-full">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground/20 mb-3" />
        <p className="text-[13px] text-muted-foreground">{t("select_table_start")}</p>
      </div>
    );
  }

  // Points conversion: 100 points = $1
  const pointsDiscount = Math.round(pointsToRedeem / 100 * 100) / 100;

  // Calculate discount
  const calcDiscount = () => {
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") discount = order.subtotal * (appliedCoupon.value / 100);
      else discount = appliedCoupon.value;
    } else if (appliedPromo) {
      if (appliedPromo.type === "percentage") discount = order.subtotal * (appliedPromo.value / 100);
      else discount = appliedPromo.value;
    } else if (manualDiscount) {
      if (manualDiscount.type === "percentage") discount = order.subtotal * (manualDiscount.value / 100);
      else discount = manualDiscount.value;
    }
    if (memberDetected && !appliedPromo && !appliedCoupon) discount += order.subtotal * 0.05; // 5% member discount
    discount += pointsDiscount;
    return Math.min(discount, order.subtotal);
  };

  const discountAmt = Math.round(calcDiscount() * 100) / 100;
  const adjustedSubtotal = Math.round((order.subtotal - discountAmt) * 100) / 100;
  const serviceCharge = Math.round(adjustedSubtotal * 0.1 * 100) / 100;
  const gst = Math.round((adjustedSubtotal + serviceCharge) * 0.09 * 100) / 100;
  const finalTotal = Math.round((adjustedSubtotal + serviceCharge + gst) * 100) / 100;
  const splitAmount = splitCount > 1 ? Math.round(finalTotal / splitCount * 100) / 100 : finalTotal;

  const handleApplyPromo = () => {
    const found = availablePromos.find(p => p.code.toLowerCase() === promoCode.trim().toLowerCase());
    if (found) {
      if (order.subtotal < found.minSpend) {
        setPromoError(`Min. spend $${found.minSpend}`);
        return;
      }
      setAppliedPromo(found);
      setManualDiscount(null);
      setAppliedCoupon(null);
      setPromoError("");
    } else {
      setPromoError(t("invalid_promo") || "Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handleManualDiscount = (preset: typeof discountPresets[0]) => {
    if (manualDiscount?.value === preset.value && manualDiscount?.type === preset.type) {
      setManualDiscount(null);
    } else {
      setManualDiscount({ type: preset.type, value: preset.value });
      setAppliedPromo(null);
      setAppliedCoupon(null);
      setPromoCode("");
    }
  };

  const handleApplyCoupon = (coupon: typeof memberCoupons[0]) => {
    setAppliedCoupon(coupon);
    setAppliedPromo(null);
    setManualDiscount(null);
    setPromoCode("");
  };

  const maxRedeemable = Math.min(mockMember.points, Math.floor(order.subtotal * 100)); // Max points = subtotal in cents

  return (
    <div className="bg-card flex flex-col h-full">
      {/* Header */}
      <div className="h-[52px] px-4 border-b border-border flex items-center shrink-0">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="font-semibold text-foreground text-[13px]">
              {table ? `${t("tables")} ${table.number}` : `${order.serviceMode}`}
            </h3>
            <span className="text-[11px] text-muted-foreground capitalize">{order.serviceMode}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {order.guestCount}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3 space-y-1">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-[13px]">{t("no_items")}</p>
            <p className="text-[11px] mt-1">{t("add_from_menu")}</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="group flex gap-2 p-2 rounded-md hover:bg-accent transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-foreground leading-tight">{item.name}</span>
                  <span className="text-[13px] text-foreground font-semibold ml-2 shrink-0 font-mono">
                    ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {item.modifiers.map(m => m.name).join(", ")}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[11px] text-status-amber mt-0.5">📝 {item.notes}</div>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                  >
                    <Minus className="h-3 w-3 text-foreground" />
                  </button>
                  <span className="text-xs font-semibold text-foreground w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                  >
                    <Plus className="h-3 w-3 text-foreground" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all ml-auto active:scale-95"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Promo / Discount / Member / Split Section */}
      {order.items.length > 0 && (
        <div className="border-t border-border">
          {/* Action bar */}
          <div className="flex items-center gap-1 px-3 py-2">
            <button
              onClick={() => { setShowPromoSection(!showPromoSection); setShowSplit(false); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors min-h-[36px]",
                showPromoSection ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Tag className="h-3 w-3" />
              {t("promo")}
            </button>
            <button
              onClick={() => {
                setMemberDetected(!memberDetected);
                if (!memberDetected) {
                  setShowPromoSection(true);
                  setShowSplit(false);
                }
              }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors min-h-[36px]",
                memberDetected ? "bg-status-green-light text-status-green" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <UserCheck className="h-3 w-3" />
              {t("member")}
            </button>
            <button
              onClick={() => { setShowSplit(!showSplit); setShowPromoSection(false); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors min-h-[36px]",
                showSplit ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Split className="h-3 w-3" />
              {t("split_bill")}
            </button>
          </div>

          {/* Promo / Member Unified Section */}
          {showPromoSection && (
            <div className="px-3 pb-2 space-y-2">
              {/* Member info + coupons + points (shown when member is detected) */}
              {memberDetected && (
                <div className="space-y-2">
                  {/* Member card */}
                  <div className="flex items-center gap-2 bg-status-green-light rounded-lg px-3 py-2">
                    <UserCheck className="h-3.5 w-3.5 text-status-green" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-status-green">{mockMember.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-status-amber-light text-status-amber">{mockMember.tier}</span>
                      </div>
                      <span className="text-[10px] text-status-green">5% member discount</span>
                    </div>
                    <button onClick={() => { setMemberDetected(false); setPointsToRedeem(0); setAppliedCoupon(null); }} className="p-1 rounded hover:bg-status-green/10 active:scale-95">
                      <X className="h-3 w-3 text-status-green" />
                    </button>
                  </div>

                  {/* Coupons */}
                  {mockMember.coupons.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Ticket className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Coupons</span>
                      </div>
                      <div className="flex gap-1.5">
                        {mockMember.coupons.map(c => (
                          <button
                            key={c.id}
                            onClick={() => appliedCoupon?.id === c.id ? setAppliedCoupon(null) : handleApplyCoupon(c)}
                            className={cn(
                              "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-colors active:scale-95",
                              appliedCoupon?.id === c.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-foreground hover:border-primary/40"
                            )}
                          >
                            <div className="font-semibold">{c.label}</div>
                            <div className="text-[9px] opacity-70 mt-0.5">Exp: {c.expiresAt}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Points redemption */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-status-amber" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Points</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{mockMember.points.toLocaleString()} pts available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={maxRedeemable}
                        step={100}
                        value={pointsToRedeem}
                        onChange={e => setPointsToRedeem(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-primary"
                      />
                      <div className="text-right min-w-[60px]">
                        <div className="text-[11px] font-bold text-foreground font-mono">{pointsToRedeem} pts</div>
                        {pointsToRedeem > 0 && <div className="text-[9px] text-status-green font-mono">-${pointsDiscount.toFixed(2)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Applied promo */}
              {appliedPromo && (
                <div className="flex items-center justify-between bg-status-green-light rounded-lg px-3 py-2">
                  <div>
                    <span className="text-[11px] font-semibold text-status-green">{appliedPromo.label}</span>
                    <span className="text-[10px] text-status-green ml-1.5 font-mono">-{appliedPromo.type === "percentage" ? `${appliedPromo.value}%` : `$${appliedPromo.value}`}</span>
                  </div>
                  <button onClick={handleRemovePromo} className="p-1 rounded hover:bg-status-green/10 active:scale-95">
                    <X className="h-3 w-3 text-status-green" />
                  </button>
                </div>
              )}

              {/* Applied coupon badge (non-member promo section) */}
              {appliedCoupon && !memberDetected && (
                <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-[11px] font-semibold text-primary">{appliedCoupon.label}</span>
                    <span className="text-[10px] text-primary ml-1.5 font-mono">-{appliedCoupon.type === "percentage" ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`}</span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="p-1 rounded hover:bg-primary/10 active:scale-95">
                    <X className="h-3 w-3 text-primary" />
                  </button>
                </div>
              )}

              {/* Promo code input (when no coupon/promo applied) */}
              {!appliedPromo && !appliedCoupon && (
                <div className="flex gap-1.5">
                  <input
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                    placeholder={t("enter_promo_code")}
                    className="flex-1 h-9 px-3 rounded-lg bg-background border-1.5 border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                    onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                  />
                  <Button size="sm" className="h-9 px-3 text-[11px] rounded-lg" onClick={handleApplyPromo} disabled={!promoCode.trim()}>
                    {t("apply")}
                  </Button>
                </div>
              )}
              {promoError && <p className="text-[10px] text-destructive">{promoError}</p>}

              {/* Quick discount presets (when no promo/coupon applied and not member) */}
              {!appliedPromo && !appliedCoupon && !memberDetected && (
                <div className="flex gap-1.5">
                  {discountPresets.map(p => (
                    <button
                      key={`${p.type}-${p.value}`}
                      onClick={() => handleManualDiscount(p)}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-[11px] font-medium transition-colors active:scale-95",
                        manualDiscount?.value === p.value && manualDiscount?.type === p.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-foreground hover:bg-secondary"
                      )}
                    >
                      {p.type === "percentage" ? `${p.value}%` : `$${p.value}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Member badge (collapsed view when promo section not open) */}
          {memberDetected && !showPromoSection && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 bg-status-green-light rounded-lg px-3 py-2">
                <UserCheck className="h-3.5 w-3.5 text-status-green" />
                <div className="flex-1">
                  <span className="text-[11px] font-semibold text-status-green">{mockMember.name}</span>
                  <span className="text-[10px] text-status-green ml-1">· {mockMember.tier} · {pointsToRedeem > 0 ? `${pointsToRedeem}pts` : "5% OFF"}</span>
                </div>
                <button onClick={() => { setShowPromoSection(true); setShowSplit(false); }} className="p-1 rounded hover:bg-status-green/10">
                  <ChevronDown className="h-3 w-3 text-status-green" />
                </button>
              </div>
            </div>
          )}

          {/* Split bill */}
          {showSplit && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{t("split_into_n")}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setSplitCount(n)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors active:scale-95",
                        splitCount === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-secondary"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {splitCount > 1 && (
                <div className="mt-2 bg-primary/5 rounded-lg px-3 py-2 text-center">
                  <span className="text-[11px] text-muted-foreground">{t("each_pays")}</span>
                  <span className="text-[15px] font-bold text-primary font-mono ml-2">${splitAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Totals & Pay */}
      <div className="border-t border-border p-4 space-y-1.5">
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("subtotal")}</span>
          <span className="font-mono">${order.subtotal.toFixed(2)}</span>
        </div>
        {discountAmt > 0 && (
          <div className="flex justify-between text-[13px] text-status-green">
            <span>{t("discount")}</span>
            <span className="font-mono">-${discountAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("service_charge")} (10%)</span>
          <span className="font-mono">${serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("gst")}</span>
          <span className="font-mono">${gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
          <span>{t("total")}</span>
          <span className="font-mono">${finalTotal.toFixed(2)}</span>
        </div>
        {splitCount > 1 && (
          <div className="flex justify-between text-[13px] text-primary font-semibold">
            <span>{t("per_person")} ({splitCount})</span>
            <span className="font-mono">${splitAmount.toFixed(2)}</span>
          </div>
        )}
        <Button
          variant="pay"
          size="xl"
          className="w-full mt-2 rounded-lg"
          disabled={order.items.length === 0}
          onClick={onPay}
        >
          {t("pay")} ${finalTotal.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};
