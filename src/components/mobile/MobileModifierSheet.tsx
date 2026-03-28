import React, { useState } from "react";
import { X, Check, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MenuItem, type ModifierGroup, menuItems as allMenuItems } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  item: MenuItem;
  groups: ModifierGroup[];
  onConfirm: (modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => void;
  onCancel: () => void;
}

export const MobileModifierSheet: React.FC<Props> = ({ item, groups, onConfirm, onCancel }) => {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [comboSelections, setComboSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const toggle = (gId: string, oId: string, multi: boolean) => {
    setSelected(prev => {
      const cur = prev[gId] || [];
      if (multi) return { ...prev, [gId]: cur.includes(oId) ? cur.filter(x => x !== oId) : [...cur, oId] };
      return { ...prev, [gId]: [oId] };
    });
  };

  const toggleComboItem = (groupId: string, itemId: string, maxSelect: number) => {
    setComboSelections(prev => {
      const cur = prev[groupId] || [];
      if (cur.includes(itemId)) return { ...prev, [groupId]: cur.filter(id => id !== itemId) };
      if (cur.length >= maxSelect) {
        if (maxSelect === 1) return { ...prev, [groupId]: [itemId] };
        return prev;
      }
      return { ...prev, [groupId]: [...cur, itemId] };
    });
  };

  const modValid = groups.filter(g => g.required).every(g => (selected[g.id] || []).length > 0);
  const comboValid = !item.isCombo || (item.comboGroups || []).filter(g => g.required).every(g => (comboSelections[g.id] || []).length >= 1);
  const valid = modValid && comboValid;

  const handleConfirm = () => {
    const mods: { name: string; price: number }[] = [];
    Object.entries(selected).forEach(([gId, oIds]) => {
      const g = groups.find(x => x.id === gId);
      oIds.forEach(oId => { const o = g?.options.find(x => x.id === oId); if (o) mods.push({ name: o.name, price: o.price }); });
    });

    let comboItems: { name: string; groupName: string }[] | undefined;
    if (item.isCombo && item.comboGroups) {
      comboItems = [];
      item.comboGroups.forEach(cg => {
        (comboSelections[cg.id] || []).forEach(id => {
          const mi = allMenuItems.find(m => m.id === id);
          if (mi) comboItems!.push({ name: mi.name, groupName: cg.name });
        });
      });
    }

    onConfirm(mods, notes || undefined, comboItems);
  };

  const getItemName = (mi: MenuItem) => lang === "zh" && mi.nameZh ? mi.nameZh : mi.name;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 animate-fade-in" onClick={onCancel}>
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {item.isCombo && (
              <span className={cn("flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-primary-foreground", item.isFlexCombo ? "bg-status-amber" : "bg-primary")}>
                {item.isFlexCombo ? <Zap className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
              </span>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{getItemName(item)}</h3>
              <p className="text-sm text-muted-foreground font-mono">${item.price.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Combo selections */}
          {item.isCombo && item.comboGroups?.map(cg => {
            const sel = comboSelections[cg.id] || [];
            return (
              <div key={cg.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground">{lang === "zh" && cg.nameZh ? cg.nameZh : cg.name}</span>
                  <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-medium">{t("required")}</span>
                  <span className="text-[10px] text-muted-foreground">{sel.length}/{cg.maxSelect}</span>
                </div>
                <div className="space-y-1.5">
                  {cg.allowedItems.map(itemId => {
                    const mi = allMenuItems.find(m => m.id === itemId);
                    if (!mi) return null;
                    const isSel = sel.includes(itemId);
                    return (
                      <button key={itemId} onClick={() => toggleComboItem(cg.id, itemId, cg.maxSelect)}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                          isSel ? "bg-primary/10 border-primary" : "bg-card border-border")}>
                        {mi.image && <img src={mi.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                        <span className="text-sm text-foreground flex-1 text-left">{getItemName(mi)}</span>
                        {isSel && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {groups.map(g => (
            <div key={g.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">{lang === "zh" && g.nameZh ? g.nameZh : g.name}</span>
                {g.required && <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-medium">{t("required")}</span>}
              </div>
              <div className="space-y-1.5">
                {g.options.map(o => {
                  const sel = (selected[g.id] || []).includes(o.id);
                  return (
                    <button key={o.id} onClick={() => toggle(g.id, o.id, g.multiSelect)}
                      className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                        sel ? "bg-primary/10 border-primary" : "bg-card border-border")}>
                      <span className="text-sm text-foreground">{lang === "zh" && o.nameZh ? o.nameZh : o.name}</span>
                      <div className="flex items-center gap-2">
                        {o.price > 0 && <span className="text-xs text-muted-foreground">+${o.price.toFixed(2)}</span>}
                        {sel && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <span className="text-sm font-medium text-foreground mb-2 block">{t("special_notes")}</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("notes_placeholder")}
              className="w-full h-16 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground border-0 focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="pay" size="xl" className="w-full" disabled={!valid} onClick={handleConfirm}>{t("add_to_order")}</Button>
        </div>
      </div>
    </div>
  );
};
