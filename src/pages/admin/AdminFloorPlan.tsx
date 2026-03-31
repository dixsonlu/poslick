import React, { useState, useCallback, useRef } from "react";
import { Plus, Trash2, Move, RotateCw, Square, Circle, RectangleHorizontal, Eye, Save, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFloorTables, useFloorZones, moveTable, addFloorTable, removeFloorTable, updateFloorTable, type FloorTable } from "@/state/floorplan-store";

const GRID_SIZE = 8;
const CELL_SIZE = 80;

const shapeIcons = { square: Square, round: Circle, rectangle: RectangleHorizontal };

const AdminFloorPlan: React.FC = () => {
  const tables = useFloorTables();
  const zones = useFloorZones();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState("Main Hall");
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedTable = tables.find(t => t.id === selectedId);

  const handleGridClick = (x: number, y: number) => {
    if (isPreview) return;
    setSelectedId(null);
  };

  const handleAddTable = () => {
    const id = `ft-${Date.now()}`;
    const num = String(tables.length + 1);
    addFloorTable({ id, number: num, x: 0, y: 0, width: 1, height: 1, seats: 2, shape: "square", zone: activeZone });
    setSelectedId(id);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setDragId(id);

    const onMove = (ev: PointerEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((ev.clientX - rect.left) / CELL_SIZE)));
      const y = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((ev.clientY - rect.top) / CELL_SIZE)));
      moveTable(id, x, y);
    };

    const onUp = () => {
      setDragId(null);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const zoneTables = tables.filter(t => t.zone === activeZone);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Floor Plan Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">{tables.length} tables across {zones.length} zones</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isPreview ? "default" : "outline"} size="sm" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="h-4 w-4 mr-1" />{isPreview ? "Exit Preview" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => { setActiveZone(z.name); setSelectedId(null); }}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeZone === z.name ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            )}
          >
            {z.name} ({tables.filter(t => t.zone === z.name).length})
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Grid Canvas */}
        <div className="flex-1">
          <div
            ref={gridRef}
            className="relative border-[1.5px] border-border rounded-xl bg-accent/30 overflow-hidden"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
            onClick={() => setSelectedId(null)}
          >
            {/* Grid lines */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <React.Fragment key={i}>
                <div className="absolute border-r border-border/30" style={{ left: i * CELL_SIZE, top: 0, height: "100%" }} />
                <div className="absolute border-b border-border/30" style={{ top: i * CELL_SIZE, left: 0, width: "100%" }} />
              </React.Fragment>
            ))}

            {/* Tables */}
            {zoneTables.map(table => {
              const isSelected = selectedId === table.id;
              const isDragging = dragId === table.id;
              return (
                <div
                  key={table.id}
                  className={cn(
                    "absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-shadow",
                    table.shape === "round" ? "rounded-full" : "rounded-lg",
                    isSelected ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-primary/50",
                    isDragging && "opacity-80 z-20",
                    "bg-card border-[1.5px] border-border"
                  )}
                  style={{
                    left: table.x * CELL_SIZE + 4,
                    top: table.y * CELL_SIZE + 4,
                    width: table.width * CELL_SIZE - 8,
                    height: table.height * CELL_SIZE - 8,
                    transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
                  }}
                  onPointerDown={e => handlePointerDown(e, table.id)}
                  onClick={e => { e.stopPropagation(); setSelectedId(table.id); }}
                >
                  <span className="text-[13px] font-bold text-foreground">T{table.number}</span>
                  <span className="text-[10px] text-muted-foreground">{table.seats} seats</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 shrink-0 space-y-4">
          {!isPreview && (
            <Button variant="outline" className="w-full" onClick={handleAddTable}>
              <Plus className="h-4 w-4 mr-2" />Add Table
            </Button>
          )}

          {selectedTable && !isPreview && (
            <div className="uniweb-card p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Properties</div>

              <div>
                <label className="text-[11px] text-muted-foreground">Table Number</label>
                <input
                  value={selectedTable.number}
                  onChange={e => updateFloorTable(selectedTable.id, { number: e.target.value })}
                  className="w-full h-8 px-2 rounded-md border border-border text-[13px] bg-background mt-0.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Seats</label>
                <input
                  type="number"
                  value={selectedTable.seats}
                  onChange={e => updateFloorTable(selectedTable.id, { seats: parseInt(e.target.value) || 2 })}
                  className="w-full h-8 px-2 rounded-md border border-border text-[13px] bg-background mt-0.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Shape</label>
                <div className="flex gap-1 mt-1">
                  {(["square", "round", "rectangle"] as const).map(shape => {
                    const Icon = shapeIcons[shape];
                    return (
                      <button
                        key={shape}
                        onClick={() => updateFloorTable(selectedTable.id, { shape, width: shape === "rectangle" ? 2 : 1 })}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          selectedTable.shape === shape ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button variant="destructive" size="sm" className="w-full mt-2" onClick={() => { removeFloorTable(selectedTable.id); setSelectedId(null); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Remove Table
              </Button>
            </div>
          )}

          {!selectedTable && !isPreview && (
            <div className="uniweb-card p-4 text-center">
              <Grid3X3 className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">Click a table to edit properties, or drag to reposition.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFloorPlan;
