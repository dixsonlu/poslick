import React, { useMemo, useState } from "react";
import { OrderHistoryDetail } from "@/components/tablet/history/OrderHistoryDetail";
import { OrderHistoryList } from "@/components/tablet/history/OrderHistoryList";
import type { PaidOrder } from "@/components/tablet/history/types";

interface OrderHistoryProps {
  orders: PaidOrder[];
  onClose: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onClose }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId],
  );

  if (selectedOrder) {
    return <OrderHistoryDetail order={selectedOrder} onBack={() => setSelectedId(null)} />;
  }

  return <OrderHistoryList orders={orders} onClose={onClose} onSelect={setSelectedId} />;
};

export type { PaidOrder } from "@/components/tablet/history/types";
