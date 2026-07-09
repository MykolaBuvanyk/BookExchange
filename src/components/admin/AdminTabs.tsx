import { Button } from "@/components/ui";

export type AdminTab = "users" | "books";

type AdminTabsProps = {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
};

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="flex gap-3 border-y border-white/20 py-4">
      <Button
        variant={activeTab === "users" ? "solid" : "outline"}
        onClick={() => onTabChange("users")}
      >
        Users
      </Button>
      <Button
        variant={activeTab === "books" ? "solid" : "outline"}
        onClick={() => onTabChange("books")}
      >
        Books
      </Button>
    </div>
  );
}
