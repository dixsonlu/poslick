import React, { useState } from "react";
import { X, Check, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MenuItem, type ModifierGroup, menuItems as allMenuItems } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface ModifierDialogProps {
  item: MenuItem;
  groups: ModifierGroup[];
  onConfirm: (modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => void;
  onCancel: () => void;
}

export const ModifierDialog: React.FC<ModifierDialogProps> = ({ item, groups, onConfirm, onCancel }) => {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [comboSelections, setComboSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const toggleOption = (groupId: string, optionId: string, multiSelect: boolean) => {
    setSelected(prev => {
      const current = prev[groupId] || [];
      if (multiSelect) {
        return { ...prev, [groupId]: current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const toggleComboItem = (groupId: string, itemId: string, maxSelect: number) => {
    setComboSelections(prev => {
      const current = prev[groupId] || [];
      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter(id => id !== itemId) };
      }
      if (current.length >= maxSelect) {
        if (maxSelect === 1) return { ...prev, [groupId]: [itemId] };
        return prev;
      }
      return { ...prev, [groupId]: [...current, itemId] };
    });
  };

  const modifierValid = groups.filter(g => g.required).every(g => (selected[g.id] || []).length > 0);
  const comboValid = !item.isCombo || (item.comboGroups || []).filter(g => g.required).every(g => {
    const sel = comboSelections[g.id] || [];
    return sel.length >= (g.maxSelect > 0 ? Math.min(g.maxSelect, 1) : 1);
  });
  const isValid = modifierValid && comboValid;

  const handleConfirm = () => {
    const modifiers: { name: string; price: number }[] = [];
    Object.entries(selected).forEach(([groupId, optionIds]) => {
      const group = groups.find(g => g.id === groupId);
      optionIds.forEach(optId => {
        const opt = group?.options.find(o => o.id === optId);
        if (opt) modifiers.push({ name: opt.name, price: opt.price });
      });
    });

    let comboItems: { name: string; groupName: string }[] | undefined;
    if (item.isCombo && item.comboGroups) {
      comboItems = [];
      item.comboGroups.forEach(cg => {
        const selectedIds = comboSelections[cg.id] || [];
        selectedIds.forEach(id => {
          const mi = allMenuItems.find(m => m.id === id);
          if (mi) comboItems!.push({ name: mi.name, groupName: cg.name });
        });
      });
    }

    onConfirm(modifiers, notes || undefined, comboItems);
  };

  const getItemName = (mi: MenuItem) => lang === "zh" && mi.nameZh ? mi.nameZh : mi.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onCancel}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 animate-slide-up border-1.5 border-border max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {item.isCombo && (
              <span className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-primary-foreground", item.isFlexCombo ? "bg-status-amber" : "bg-primary")}>
                {item.isFlexCombo ? <Zap className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
                {item.isFlexCombo ? t("flexible_combo") : t("combo")}
              </span>
            )}
            <div>
              <h3 className="font-semibold text-foreground text-[13px]">{getItemName(item)}</h3>
              <p className="text-[13px] text-primary font-semibold font-mono">${item.price.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pos-scrollbar space-y-5">
          {/* Combo selections */}
          {item.isCombo && item.comboGroups && item.comboGroups.map(cg => {
            const selectedIds = comboSelections[cg.id] || [];
            return (
              <div key={cg.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-semibold text-foreground">
                    {lang === "zh" && cg.nameZh ? cg.nameZh : cg.name}
                  </span>
                  <span className="text-[10px] font-bold text-destructive bg-status-red-light px-1.5 py-0.5 rounded">{t("required")}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedIds.length}/{cg.maxSelect}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {cg.allowedItems.map(itemId => {
                    const mi = allMenuItems.find(m => m.id === itemId);
                    if (!mi) return null;
                    const isSel = selectedIds.includes(itemId);
                    return (
                      <button
                        key={itemId}
                        onClick={() => toggleComboItem(cg.id, itemId, cg.maxSelect)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all border-1.5",
                          isSel ? "bg-status-blue-light border-primary text-foreground" : "bg-card border-border text-foreground hover:bg-accent"
                        )}
                      >
                        {mi.image && (
                          <img src={mi.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        )}
                        <span className="flex-1 text-left line-clamp-1">{getItemName(mi)}</span>
                        {isSel && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Regular modifier groups */}
          {groups.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-semibold text-foreground">
                  {lang === "zh" && group.nameZh ? group.nameZh : group.name}
                </span>
                {group.required && (
                  <span className="text-[10px] font-bold text-destructive bg-status-red-light px-1.5 py-0.5 rounded">{t("required")}</span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {group.multiSelect ? t("select_multiple") : t("select_one")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {group.options.map(opt => {
                  const isSelected = (selected[group.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group.id, opt.id, group.multiSelect)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all border-1.5",
                        isSelected
                          ? "bg-status-blue-light border-primary text-foreground"
                          : "bg-card border-border text-foreground hover:bg-accent"
                      )}
                    >
                      <span>{lang === "zh" && opt.nameZh ? opt.nameZh : opt.name}</span>
                      <span className="flex items-center gap-1">
                        {opt.price > 0 && <span className="text-[11px] text-muted-foreground font-mono">+${opt.price.toFixed(2)}</span>}
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <span className="text-[13px] font-semibold text-foreground mb-2 block">{t("special_notes")}</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t("notes_placeholder")}
              className="w-full h-16 px-3 py-2 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 resize-none transition-all"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2 shrink-0">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-lg">{t("cancel")}</Button>
          <Button onClick={handleConfirm} disabled={!isValid} className="flex-1 rounded-lg">{t("add_to_order")}</Button>
        </div>
      </div>
    </div>
  );
};
