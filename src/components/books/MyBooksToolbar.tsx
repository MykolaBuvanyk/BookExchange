import { Plus } from "lucide-react";
import { Button, SelectDropdown } from "@/components/ui";
import type { MyBooksSortOption } from "@/types";
import { myBooksSortOptions } from "@/utils/books/sortBooks";

type MyBooksToolbarProps = {
  sort: MyBooksSortOption;
  onAddBook: () => void;
  onSortChange: (sort: MyBooksSortOption) => void;
};

export function MyBooksToolbar({
  sort,
  onAddBook,
  onSortChange,
}: MyBooksToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-y border-white/20 py-4 sm:flex-row sm:items-end sm:justify-between">
      <Button className="sm:w-fit" onClick={onAddBook}>
        <Plus size={18} />
        Add new book
      </Button>

      <SelectDropdown
        className="sm:w-56"
        label="Sort"
        options={myBooksSortOptions}
        value={sort}
        onChange={onSortChange}
      />
    </div>
  );
}
