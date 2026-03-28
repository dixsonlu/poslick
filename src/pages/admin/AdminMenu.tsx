import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Image as ImageIcon, Package, Plus, Save, Search, Settings2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories, type MenuItem } from "@/data/mock-data";
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
          />
        </TabsContent>

        <TabsContent value="combos">
          <MenuEditorLayout
            items={filteredCombos}
            selectedId={selectedId}
            onSelect={openEditor}
            editorDraft={editorDraft}
            setEditorDraft={setEditorDraft}
            onSave={saveItem}
            onDelete={removeCurrent}
            isCreating={isCreating}
            activeTab={activeTab}
            categoryOptions={displayCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

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
}

const MenuEditorLayout: React.FC<MenuEditorLayoutProps> = ({
  items,
  selectedId,
  onSelect,
  editorDraft,
  setEditorDraft,
  onSave,
  onDelete,
  isCreating,
  activeTab,
  categoryOptions,
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
                    {item.isCombo ? <span className="rounded-full bg-status-blue-light px-2 py-0.5 text-primary">Combo</span> : null}
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
              {editorDraft.name || (activeTab === "combos" ? "New Combo" : "New Item")}
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
                  {(editorDraft.isCombo ? ["Combos"] : categoryOptions).map((category) => (
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

          <section className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Configuration Summary</div>
            <div className="rounded-2xl border border-border bg-accent/30 p-4 text-[12px] text-muted-foreground">
              {editorDraft.isCombo ? "Combo structure is preserved. Use this panel for commercial data, visibility, and pricing updates." : "This editor is optimized for operational updates: name, pricing, category, and POS visibility."}
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
