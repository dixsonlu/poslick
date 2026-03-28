import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Image as ImageIcon, Package, Plus, Save, Search, Settings2, Star, Trash2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories, type MenuItem, type ComboGroup } from "@/data/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { addMenuItemToStore, deleteMenuItemFromStore, updateMenuItemInStore, useMenuItems } from "@/state/menu-store";

interface EditingItem {
  id?: string;
  name: string;
  nameZh: string;
  price: number;
  category: string;
  available: boolean;
  popular: boolean;
  description: string;
  isCombo: boolean;
  isFlexCombo: boolean;
  comboGroups: ComboGroup[];
}

const createDraft = (item?: MenuItem): EditingItem => ({
  id: item?.id,
  name: item?.name ?? "",
  nameZh: item?.nameZh ?? "",
  price: item?.price ?? 0,
  category: item?.category ?? "Mains",
  available: item?.available ?? true,
  popular: item?.popular ?? false,
  description: item?.description ?? "",
  isCombo: item?.isCombo ?? false,
  isFlexCombo: item?.isFlexCombo ?? false,
  comboGroups: item?.comboGroups ? JSON.parse(JSON.stringify(item.comboGroups)) : [],
});

const AdminMenu: React.FC = () => {
  const items = useMenuItems();
  const [activeTab, setActiveTab] = useState("items");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorDraft, setEditorDraft] = useState<EditingItem>(createDraft());
  const [isCreating, setIsCreating] = useState(false);

  const allItems = items.filter(i => !i.isCombo);
  const combos = items.filter(i => i.isCombo);
  const displayCategories = categories.filter(c => c !== "All" && c !== "Combos");

  const filteredItems = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.nameZh?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const filteredCombos = search
    ? combos.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : combos;

  const visibleItems = activeTab === "items" ? filteredItems : filteredCombos;
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (isCreating) return;
    if (selectedItem) {
      setEditorDraft(createDraft(selectedItem));
      return;
    }
    const fallback = visibleItems[0] ?? null;
    if (fallback) {
      setSelectedId(fallback.id);
      setEditorDraft(createDraft(fallback));
    }
  }, [isCreating, selectedItem, visibleItems]);

  const openCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setEditorDraft(createDraft({ category: activeTab === "combos" ? "Combos" : "Mains", isCombo: activeTab === "combos" } as MenuItem));
  };

  const openEditor = (item: MenuItem) => {
    setIsCreating(false);
    setSelectedId(item.id);
    setEditorDraft(createDraft(item));
  };

  const saveItem = () => {
    if (!editorDraft.name.trim()) return;

    const payload: Partial<MenuItem> = {
      name: editorDraft.name.trim(),
      nameZh: editorDraft.nameZh.trim() || undefined,
      description: editorDraft.description.trim() || undefined,
      price: Number(editorDraft.price) || 0,
      category: editorDraft.category,
      available: editorDraft.available,
      popular: editorDraft.popular,
      isCombo: editorDraft.isCombo,
      isFlexCombo: editorDraft.isFlexCombo,
      comboGroups: editorDraft.isCombo ? editorDraft.comboGroups : undefined,
    };

    if (isCreating) {
      addMenuItemToStore({
        id: `m-${Date.now()}`,
        available: true,
        category: editorDraft.category,
        name: editorDraft.name.trim(),
        price: Number(editorDraft.price) || 0,
        nameZh: editorDraft.nameZh.trim() || undefined,
        description: editorDraft.description.trim() || undefined,
        popular: editorDraft.popular,
        isCombo: editorDraft.isCombo,
        isFlexCombo: editorDraft.isFlexCombo,
        comboGroups: editorDraft.isCombo ? editorDraft.comboGroups : undefined,
      });
      setIsCreating(false);
      return;
    }

    if (editorDraft.id) {
      updateMenuItemInStore(editorDraft.id, payload);
    }
  };

  const removeCurrent = () => {
    if (!selectedItem) return;
    deleteMenuItemFromStore(selectedItem.id);
    setSelectedId(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Menu Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{allItems.length} items · {combos.length} combos · {displayCategories.length} categories</p>
        </div>
        <Button className="rounded-lg gap-1.5 text-[13px]" onClick={openCreate}>
          <Plus className="h-4 w-4" />Add Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="items" className="text-[13px] rounded-md">All Items</TabsTrigger>
            <TabsTrigger value="combos" className="text-[13px] rounded-md">
              <Package className="h-3.5 w-3.5 mr-1.5" />Combos
            </TabsTrigger>
          </TabsList>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <TabsContent value="items">
          <MenuEditorLayout
            items={filteredItems}
            selectedId={selectedId}
            onSelect={openEditor}
            editorDraft={editorDraft}
            setEditorDraft={setEditorDraft}
            onSave={saveItem}
            onDelete={removeCurrent}
            isCreating={isCreating}
            activeTab={activeTab}
            categoryOptions={displayCategories}
            allMenuItems={items}
          />
        </TabsContent>

        <TabsContent value="combos">
          <ComboEditorLayout
            combos={filteredCombos}
            allItems={items}
            selectedId={selectedId}
            onSelect={openEditor}
            editorDraft={editorDraft}
            setEditorDraft={setEditorDraft}
            onSave={saveItem}
            onDelete={removeCurrent}
            isCreating={isCreating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ========== Combo Editor Layout ==========
interface ComboEditorLayoutProps {
  combos: MenuItem[];
  allItems: MenuItem[];
  selectedId: string | null;
  onSelect: (item: MenuItem) => void;
  editorDraft: EditingItem;
  setEditorDraft: React.Dispatch<React.SetStateAction<EditingItem>>;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
}

const ComboEditorLayout: React.FC<ComboEditorLayoutProps> = ({
  combos, allItems, selectedId, onSelect, editorDraft, setEditorDraft, onSave, onDelete, isCreating,
}) => {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
      {/* Combo cards list */}
      <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pos-scrollbar">
        {combos.map(combo => {
          const isSelected = selectedId === combo.id && !isCreating;
          return (
            <div
              key={combo.id}
              className={cn(
                "rounded-2xl border-[1.5px] bg-card transition-all cursor-pointer",
                isSelected ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/30"
              )}
              onClick={() => onSelect(combo)}
            >
              {/* Combo header */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-accent shrink-0 border border-border">
                  {combo.image ? (
                    <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-foreground truncate">{combo.name}</span>
                    <span className={cn(
                      "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md text-primary-foreground shrink-0",
                      combo.isFlexCombo ? "bg-status-amber" : "bg-primary"
                    )}>
                      {combo.isFlexCombo ? <><Zap className="h-2.5 w-2.5" />FLEX</> : <><Package className="h-2.5 w-2.5" />COMBO</>}
                    </span>
                  </div>
                  {combo.nameZh && <div className="text-[11px] text-muted-foreground mt-0.5">{combo.nameZh}</div>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[14px] font-bold text-primary font-mono">${combo.price.toFixed(2)}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", combo.available ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground")}>
                      {combo.available ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </div>

              {/* Combo groups display */}
              {combo.comboGroups && combo.comboGroups.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-3">
                    {combo.comboGroups.map(group => {
                      const groupItems = group.allowedItems
                        .map(id => allItems.find(m => m.id === id))
                        .filter(Boolean) as MenuItem[];
                      return (
                        <div key={group.id} className="flex-1 min-w-[140px] rounded-xl border border-border bg-background p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{group.name}</span>
                            <span className="text-[9px] text-muted-foreground font-medium">
                              {group.required ? "Required" : "Optional"} / max {group.maxSelect}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {groupItems.slice(0, 4).map(mi => (
                              <div key={mi.id} className="flex items-center gap-2">
                                {mi.image && (
                                  <img src={mi.image} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                                )}
                                <span className="text-[11px] text-foreground truncate">{mi.name}</span>
                              </div>
                            ))}
                            {groupItems.length > 4 && (
                              <span className="text-[10px] text-muted-foreground">+{groupItems.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {combos.length === 0 && (
          <div className="py-12 text-center text-[13px] text-muted-foreground">No combos found.</div>
        )}
      </div>

      {/* Editor panel */}
      <ComboEditorPanel
        editorDraft={editorDraft}
        setEditorDraft={setEditorDraft}
        onSave={onSave}
        onDelete={onDelete}
        isCreating={isCreating}
        allItems={allItems}
      />
    </div>
  );
};

// ========== Combo Editor Panel with Group Management ==========
const ComboEditorPanel: React.FC<{
  editorDraft: EditingItem;
  setEditorDraft: React.Dispatch<React.SetStateAction<EditingItem>>;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  allItems: MenuItem[];
}> = ({ editorDraft, setEditorDraft, onSave, onDelete, isCreating, allItems }) => {
  const [groupItemSearch, setGroupItemSearch] = useState<Record<string, string>>({});
  const nonComboItems = allItems.filter(i => !i.isCombo);

  const addComboGroup = () => {
    setEditorDraft(prev => ({
      ...prev,
      comboGroups: [...prev.comboGroups, {
        id: `cg-${Date.now()}`,
        name: "",
        nameZh: "",
        required: true,
        allowedItems: [],
        maxSelect: 1,
      }],
    }));
  };

  const updateGroup = (groupId: string, updates: Partial<ComboGroup>) => {
    setEditorDraft(prev => ({
      ...prev,
      comboGroups: prev.comboGroups.map(g => g.id === groupId ? { ...g, ...updates } : g),
    }));
  };

  const removeGroup = (groupId: string) => {
    setEditorDraft(prev => ({
      ...prev,
      comboGroups: prev.comboGroups.filter(g => g.id !== groupId),
    }));
  };

  const toggleItemInGroup = (groupId: string, itemId: string) => {
    setEditorDraft(prev => ({
      ...prev,
      comboGroups: prev.comboGroups.map(g => {
        if (g.id !== groupId) return g;
        const has = g.allowedItems.includes(itemId);
        return { ...g, allowedItems: has ? g.allowedItems.filter(id => id !== itemId) : [...g.allowedItems, itemId] };
      }),
    }));
  };

  return (
    <div className="h-fit rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {isCreating ? "Create Combo" : "Edit Combo"}
          </div>
          <div className="mt-1 text-[16px] font-bold text-foreground">
            {editorDraft.name || "New Combo"}
          </div>
        </div>
        <Settings2 className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-5 px-5 py-5 max-h-[calc(100vh-320px)] overflow-y-auto pos-scrollbar">
        {/* Basic info */}
        <section className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Basic</div>
          <div className="space-y-3">
            <Field label="Name (EN)">
              <input value={editorDraft.name} onChange={e => setEditorDraft(prev => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary" />
            </Field>
            <Field label="Name (ZH)">
              <input value={editorDraft.nameZh} onChange={e => setEditorDraft(prev => ({ ...prev, nameZh: e.target.value }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Price ($)">
                <input type="number" step="0.50" value={editorDraft.price} onChange={e => setEditorDraft(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-mono text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Type">
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setEditorDraft(prev => ({ ...prev, isFlexCombo: false }))}
                    className={cn("flex-1 flex items-center justify-center gap-1 h-10 rounded-xl border text-[12px] font-medium transition-colors",
                      !editorDraft.isFlexCombo ? "border-primary bg-status-blue-light text-primary" : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Package className="h-3 w-3" /> Fixed
                  </button>
                  <button
                    onClick={() => setEditorDraft(prev => ({ ...prev, isFlexCombo: true }))}
                    className={cn("flex-1 flex items-center justify-center gap-1 h-10 rounded-xl border text-[12px] font-medium transition-colors",
                      editorDraft.isFlexCombo ? "border-status-amber bg-status-amber-light text-status-amber" : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Zap className="h-3 w-3" /> Flex
                  </button>
                </div>
              </Field>
            </div>
          </div>
        </section>

        {/* Visibility */}
        <section className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Visibility</div>
          <div className="space-y-2 rounded-2xl border border-border bg-background p-3">
            <ToggleRow label="Visible on POS" checked={editorDraft.available} onToggle={() => setEditorDraft(prev => ({ ...prev, available: !prev.available }))} />
            <ToggleRow label="Mark as popular" checked={editorDraft.popular} onToggle={() => setEditorDraft(prev => ({ ...prev, popular: !prev.popular }))} icon={<Star className="h-3.5 w-3.5" />} />
          </div>
        </section>

        {/* Combo Groups */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Combo Groups</div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={addComboGroup}>
              <Plus className="h-3 w-3" /> Add Group
            </Button>
          </div>

          {editorDraft.comboGroups.map((group, gi) => {
            const searchVal = groupItemSearch[group.id] || "";
            const searchedItems = searchVal
              ? nonComboItems.filter(m => m.name.toLowerCase().includes(searchVal.toLowerCase()) || m.nameZh?.toLowerCase().includes(searchVal.toLowerCase()))
              : nonComboItems.slice(0, 8);

            return (
              <div key={group.id} className="rounded-xl border border-border bg-background p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">#{gi + 1}</span>
                  <input
                    value={group.name}
                    onChange={e => updateGroup(group.id, { name: e.target.value })}
                    placeholder="Group name (EN)"
                    className="h-8 flex-1 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-primary"
                  />
                  <input
                    value={group.nameZh || ""}
                    onChange={e => updateGroup(group.id, { nameZh: e.target.value })}
                    placeholder="中文"
                    className="h-8 w-20 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-primary"
                  />
                  <button onClick={() => removeGroup(group.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <input type="checkbox" checked={group.required} onChange={() => updateGroup(group.id, { required: !group.required })} className="rounded" />
                    Required
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    Max select:
                    <input type="number" min={1} max={10} value={group.maxSelect} onChange={e => updateGroup(group.id, { maxSelect: parseInt(e.target.value) || 1 })} className="h-7 w-12 rounded-md border border-border bg-card px-1.5 text-center text-[12px] outline-none focus:border-primary" />
                  </label>
                </div>

                {/* Allowed items */}
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                    Allowed Items ({group.allowedItems.length})
                  </div>
                  {/* Selected items */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {group.allowedItems.map(itemId => {
                      const mi = allItems.find(m => m.id === itemId);
                      return (
                        <span key={itemId} className="flex items-center gap-1 bg-status-blue-light text-primary text-[10px] font-medium px-2 py-1 rounded-md">
                          {mi?.image && <img src={mi.image} alt="" className="w-4 h-4 rounded object-cover" />}
                          {mi?.name || itemId}
                          <button onClick={() => toggleItemInGroup(group.id, itemId)} className="ml-0.5 hover:text-destructive">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  {/* Item picker */}
                  <div className="relative mb-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <input
                      placeholder="Search items to add..."
                      value={searchVal}
                      onChange={e => setGroupItemSearch(prev => ({ ...prev, [group.id]: e.target.value }))}
                      className="w-full h-7 pl-7 pr-2 rounded-md border border-border bg-card text-[11px] text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto pos-scrollbar space-y-0.5">
                    {searchedItems.map(mi => {
                      const isIn = group.allowedItems.includes(mi.id);
                      return (
                        <button
                          key={mi.id}
                          onClick={() => toggleItemInGroup(group.id, mi.id)}
                          className={cn(
                            "flex items-center gap-2 w-full px-2 py-1 rounded-md text-[11px] transition-colors text-left",
                            isIn ? "bg-status-blue-light text-primary" : "hover:bg-accent text-foreground"
                          )}
                        >
                          {mi.image && <img src={mi.image} alt="" className="w-5 h-5 rounded object-cover shrink-0" />}
                          <span className="flex-1 truncate">{mi.name}</span>
                          {isIn && <Check className="h-3 w-3 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {editorDraft.comboGroups.length === 0 && (
            <div className="text-[12px] text-muted-foreground text-center py-4 rounded-xl border border-dashed border-border">
              No combo groups yet. Click "Add Group" to define selections.
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
        <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={onDelete} disabled={isCreating}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
        <Button size="sm" className="gap-1.5 text-[12px]" onClick={onSave} disabled={!editorDraft.name.trim()}>
          <Save className="h-3.5 w-3.5" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

// ========== Regular Items Editor Layout ==========
interface MenuEditorLayoutProps {
  items: MenuItem[];
  selectedId: string | null;
  onSelect: (item: MenuItem) => void;
  editorDraft: EditingItem;
  setEditorDraft: React.Dispatch<React.SetStateAction<EditingItem>>;
  onSave: () => void;
  onDelete: () => void;
  isCreating: boolean;
  activeTab: string;
  categoryOptions: string[];
  allMenuItems: MenuItem[];
}

const MenuEditorLayout: React.FC<MenuEditorLayoutProps> = ({
  items, selectedId, onSelect, editorDraft, setEditorDraft, onSave, onDelete, isCreating, activeTab, categoryOptions,
}) => {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1.8fr)_110px_110px_90px_36px] border-b border-border bg-accent/30 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Item</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span />
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-y-auto pos-scrollbar">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1.8fr)_110px_110px_90px_36px] items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/30",
                selectedId === item.id && !isCreating ? "bg-primary/5" : "",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-accent">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-foreground">{item.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {item.nameZh ? <span className="truncate">{item.nameZh}</span> : null}
                  </div>
                </div>
              </div>

              <span className="text-[12px] text-muted-foreground">{item.category}</span>
              <span className="text-[13px] font-semibold text-foreground font-mono">${item.price.toFixed(2)}</span>
              <span className={cn("w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold", item.available ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground")}>
                {item.available ? "Active" : "Hidden"}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}

          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-muted-foreground">No items found.</div>
          ) : null}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {isCreating ? "Create Menu Item" : "Edit Menu Item"}
            </div>
            <div className="mt-1 text-[16px] font-bold text-foreground">
              {editorDraft.name || "New Item"}
            </div>
          </div>
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Basic</div>
            <div className="space-y-3">
              <Field label="Name (EN)">
                <input value={editorDraft.name} onChange={(e) => setEditorDraft((prev) => ({ ...prev, name: e.target.value }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Name (ZH)">
                <input value={editorDraft.nameZh} onChange={(e) => setEditorDraft((prev) => ({ ...prev, nameZh: e.target.value }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Description">
                <textarea value={editorDraft.description} onChange={(e) => setEditorDraft((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[84px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary" />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Pricing & Placement</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Price ($)">
                <input type="number" step="0.50" value={editorDraft.price} onChange={(e) => setEditorDraft((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-mono text-foreground outline-none focus:border-primary" />
              </Field>
              <Field label="Category">
                <select value={editorDraft.category} onChange={(e) => setEditorDraft((prev) => ({ ...prev, category: e.target.value }))} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-primary">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">POS Visibility</div>
            <div className="space-y-2 rounded-2xl border border-border bg-background p-3">
              <ToggleRow label="Visible on POS" checked={editorDraft.available} onToggle={() => setEditorDraft((prev) => ({ ...prev, available: !prev.available }))} />
              <ToggleRow label="Mark as popular" checked={editorDraft.popular} onToggle={() => setEditorDraft((prev) => ({ ...prev, popular: !prev.popular }))} icon={<Star className="h-3.5 w-3.5" />} />
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={onDelete} disabled={isCreating}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" className="gap-1.5 text-[12px]" onClick={onSave} disabled={!editorDraft.name.trim()}>
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
    {children}
  </label>
);

const ToggleRow: React.FC<{ label: string; checked: boolean; onToggle: () => void; icon?: React.ReactNode }> = ({ label, checked, onToggle, icon }) => (
  <button onClick={onToggle} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent">
    <div className="flex items-center gap-2 text-[13px] text-foreground">
      {icon}
      {label}
    </div>
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", checked ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground")}>
      {checked ? "On" : "Off"}
    </span>
  </button>
);

export default AdminMenu;
