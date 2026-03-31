import React from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staffMembers } from "@/data/mock-data";

const roleStyles: Record<string, { badge: string; label: string }> = {
  server: { badge: "bg-status-blue-light text-primary", label: "Server" },
  cashier: { badge: "bg-status-amber-light text-status-amber", label: "Cashier" },
  manager: { badge: "bg-primary text-primary-foreground", label: "Manager" },
  kitchen: { badge: "bg-status-green-light text-status-green", label: "Kitchen" },
};

const AdminStaff: React.FC = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Staff & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">{staffMembers.length} team members</p>
      </div>
      <Button className="rounded-lg shadow-sm"><Plus className="h-4 w-4 mr-1.5" />Add Staff</Button>
    </div>

    <div className="uniweb-card">
      <table className="w-full">
        <thead className="table-header">
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {staffMembers.map(s => {
            const style = roleStyles[s.role] || roleStyles.server;
            return (
              <tr key={s.id} className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer">
                <td className="px-4 py-3 font-medium text-foreground text-[13px]">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${style.badge}`}>{style.label}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-[13px]">
                  {s.role === "manager" ? "Full access" : s.role === "cashier" ? "POS, refunds" : s.role === "kitchen" ? "KDS only" : "POS, tables"}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors duration-150">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminStaff;
