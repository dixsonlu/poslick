import { useSyncExternalStore } from "react";
import { menuItems as initialMenuItems, type MenuItem } from "@/data/mock-data";

type MenuListener = () => void;

let menuItemsState: MenuItem[] = [...initialMenuItems];
const listeners = new Set<MenuListener>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: MenuListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => menuItemsState;

export const useMenuItems = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const getMenuItemsSnapshot = () => menuItemsState;

export const updateMenuItemInStore = (id: string, updates: Partial<MenuItem>) => {
  menuItemsState = menuItemsState.map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );
  emitChange();
};

export const addMenuItemToStore = (item: MenuItem) => {
  menuItemsState = [...menuItemsState, item];
  emitChange();
};

export const deleteMenuItemFromStore = (id: string) => {
  menuItemsState = menuItemsState.filter((item) => item.id !== id);
  emitChange();
};