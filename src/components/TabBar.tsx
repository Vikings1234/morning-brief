"use client";

import { CATEGORIES } from "@/lib/categories";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  loadingTabs: Set<string>;
  loadedTabs: Set<string>;
}

export default function TabBar({
  activeTab,
  onTabChange,
  loadingTabs,
  loadedTabs,
}: TabBarProps) {
  return (
    <nav className="tab-bar" role="tablist">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={activeTab === cat.id}
          className={`tab-button ${activeTab === cat.id ? "active" : ""}`}
          onClick={() => onTabChange(cat.id)}
        >
          {cat.label}
          {loadingTabs.has(cat.id) && !loadedTabs.has(cat.id) && " ..."}
        </button>
      ))}
    </nav>
  );
}
