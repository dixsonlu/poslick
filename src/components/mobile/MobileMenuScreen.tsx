import React, { useState } from "react";
import { ArrowLeft, Search, Star, Plus, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuItems, categories, modifierGroups, type Table, type ServiceMode, type OrderItem, type MenuItem } from "@/data/mock-data";
import { MobileModifierSheet } from "@/components/mobile/MobileModifierSheet";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  table: Table;
  serviceMode: ServiceMode;
  orderItems: OrderItem[];
  onAddItem: (menuItemId: string, modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => void;
  onReview: () => void;
  onBack: () => void;
  total: number;
  itemCount: number;
}

export const MobileMenuScreen: React.FC<Props> = ({ table, serviceMode, orderItems, onAddItem, onReview, onBack, total, itemCount }) => {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  const filtered = menuItems.filter(i => {
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.nameZh?.includes(q);
    }
    if (category === "All") return true;
    if (category === "Popular") return i.popular;
    return i.category === category;
  });

  const getItemQty = (id: string) => orderItems.filter(i => i.menuItemId === id).reduce((s, i) => s + i.quantity, 0);
  const getItemName = (item: MenuItem) => lang === "zh" && item.nameZh ? item.nameZh : item.name;

  const handleItemTap = (item: MenuItem) => {
    if (!item.available) return;
    if (item.modifierGroups?.length || item.isCombo) {
      setModifierItem(item);
    } else {
      onAddItem(item.id, []);
    }
  };

  const getComboDisplay = (item: MenuItem) => {
    if (!item.isCombo) return null;
    if (item.comboIncludes?.length) return item.comboIncludes.join(" · ");
    if (item.comboGroups) return item.comboGroups.map(g => lang === "zh" && g.nameZh ? g.nameZh : g.name).join(" + ");
    return null;
  };

  const categoryLabel = (cat: string) => {
    const key = cat.toLowerCase().replace(/ /g, "_");
    const translated = t(key);
    return translated !== key ? translated : cat;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-card border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground tracking-tight">{t("tables")} {table.number}</h1>
            <p className="text-[11px] text-muted-foreground capitalize">{t(serviceMode.replace("-", "_"))}</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_menu")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Categories — flex wrap */}
      <div className="flex flex-wrap gap-2 px-4 py-3 shrink-0">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setSearch(""); }}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
              category === c && !search
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border-1.5 border-border"
            )}
          >
            {categoryLabel(c)}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map(item => {
            const qty = getItemQty(item.id);
            const comboDisplay = getComboDisplay(item);
            return (
              <button
                key={item.id}
                onClick={() => handleItemTap(item)}
                disabled={!item.available}
                className={cn(
                  "relative rounded-xl border-1.5 transition-all active:scale-[0.98] overflow-hidden text-left",
                  item.available
                    ? "bg-card border-border hover:border-primary/30"
                    : "bg-accent border-border/50 opacity-60"
                )}
              >
                <div className="w-full aspect-[4/3] overflow-hidden bg-accent relative flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-center" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl opacity-30">🍽</span>
                    </div>
                  )}
                </div>
                {item.isCombo && (
                  <span className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                    item.isFlexCombo ? "bg-status-amber/90" : "bg-primary/90"
                  )}>
                    {item.isFlexCombo ? <Zap className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
                    {item.isFlexCombo ? (lang === "zh" ? "自选" : "FLEX") : (lang === "zh" ? "套餐" : "COMBO")}
                  </span>
                )}
                {qty > 0 && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-md bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {qty}
                  </span>
                )}
                <div className="p-2.5">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-[13px] text-foreground line-clamp-1">{getItemName(item)}</span>
                    {item.popular && <Star className="h-3 w-3 text-status-amber fill-status-amber shrink-0" />}
                  </div>
                  {lang === "en" && item.nameZh && (
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{item.nameZh}</div>
                  )}
                  {comboDisplay && (
                    <div className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{comboDisplay}</div>
                  )}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[13px] font-semibold text-primary font-mono">${item.price.toFixed(2)}</span>
                    {!item.available && <span className="text-[10px] text-destructive font-semibold">{t("sold_out")}</span>}
                    {item.available && (
                      <div className="w-6 h-6 rounded-md bg-status-blue-light flex items-center justify-center">
                        <Plus className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button variant="pay" size="xl" className="w-full rounded-lg" onClick={onReview}>
            {t("review_order")} · {itemCount} {t("items")} · ${total.toFixed(2)}
          </Button>
        </div>
      )}

      {modifierItem && (
        <MobileModifierSheet
          item={modifierItem}
          groups={modifierGroups.filter(g => modifierItem.modifierGroups?.includes(g.id))}
          onConfirm={(mods, notes, comboItems) => { onAddItem(modifierItem.id, mods, notes, comboItems); setModifierItem(null); }}
          onCancel={() => setModifierItem(null)}
        />
      )}
    </div>
  );
};
