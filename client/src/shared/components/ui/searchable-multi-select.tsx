import { useState, useMemo, useCallback, memo } from "react";
import { Check, Plus, User, Building2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

export type SelectItemType = "user" | "client";

interface SearchableMultiSelectProps {
  items: string[];
  selectedItems: string[];
  onSelectionChange: (newSelection: string[]) => void;
  placeholder?: string;
  selectedLabel?: string;
  availableLabel?: string;
  emptyMessage?: string;
  itemType?: SelectItemType;
}

const SelectItemRow = memo(function SelectItemRow({
  item,
  isSelected,
  onClick,
  itemType,
  testIdPrefix,
  index,
}: {
  item: string;
  isSelected: boolean;
  onClick: () => void;
  itemType: SelectItemType;
  testIdPrefix: string;
  index?: number;
}) {
  const Icon = itemType === "user" ? User : Building2;

  if (isSelected) {
    return (
      <div
        className="mb-1 flex cursor-pointer items-center gap-2 rounded-md bg-[#2a2a2a] px-2 py-1.5 focus:outline-none focus-visible:outline-none"
        onClick={onClick}
        data-testid={`${testIdPrefix}-selected-${item}`}
        tabIndex={0}
      >
        <Check className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-foreground">{item}</span>
      </div>
    );
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-[#2a2a2a] focus:outline-none focus-visible:outline-none"
      onClick={onClick}
      data-testid={`${testIdPrefix}-${index}`}
      tabIndex={0}
    >
      <Icon className="h-4 w-4 text-gray-500" />
      <span className="flex-1 text-sm text-foreground">{item}</span>
      <Plus className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
});

export const SearchableMultiSelect = memo(function SearchableMultiSelect({
  items,
  selectedItems,
  onSelectionChange,
  placeholder = "Buscar...",
  selectedLabel = "Selecionado",
  availableLabel = "Selecione mais",
  emptyMessage = "Nenhum item encontrado",
  itemType = "user",
}: SearchableMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { selected, unselected } = useMemo(() => {
    const selectedSet = new Set(selectedItems);
    const selected = items.filter((item) => selectedSet.has(item));
    const unselected = items.filter(
      (item) => !selectedSet.has(item) && item.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return { selected, unselected };
  }, [items, selectedItems, searchQuery]);

  const handleToggleItem = useCallback(
    (item: string) => {
      const isSelected = selectedItems.includes(item);
      if (isSelected) {
        onSelectionChange(selectedItems.filter((i) => i !== item));
      } else {
        onSelectionChange([...selectedItems, item]);
      }
    },
    [selectedItems, onSelectionChange],
  );

  const testIdPrefix = itemType === "user" ? "option-filter-assignee" : "option-filter-client";

  return (
    <div className="w-full">
      <div className="border-b border-[#2a2a2a] px-3 py-2.5">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="h-auto border-0 bg-transparent p-0 text-sm text-white caret-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={(e) => e.stopPropagation()}
          data-testid={`input-filter-${itemType}-search`}
        />
      </div>

      {selected.length > 0 && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">{selectedLabel}</div>
          <div className="px-3 py-1">
            {selected.map((item) => (
              <SelectItemRow
                key={item}
                item={item}
                isSelected={true}
                onClick={() => handleToggleItem(item)}
                itemType={itemType}
                testIdPrefix={testIdPrefix}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 text-xs text-gray-500">{availableLabel}</div>

      <div className="max-h-52 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {unselected.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">{emptyMessage}</div>
        ) : (
          unselected.map((item, index) => (
            <SelectItemRow
              key={item}
              item={item}
              isSelected={false}
              onClick={() => handleToggleItem(item)}
              itemType={itemType}
              testIdPrefix={testIdPrefix}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
});
