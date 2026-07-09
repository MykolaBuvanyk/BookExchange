"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export type SelectDropdownOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SelectDropdownProps<TValue extends string> = {
  label: string;
  options: Array<SelectDropdownOption<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  showLabel?: boolean;
};

export function SelectDropdown<TValue extends string>({
  label,
  options,
  value,
  onChange,
  className,
  showLabel = true,
}: SelectDropdownProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  function handleSelect(nextValue: TValue) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={cn("relative w-full", className)}>
      {showLabel ? <Label>{label}</Label> : null}
      <button
        aria-label={label}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-md border border-white bg-black px-3 text-left text-sm font-medium text-white transition-colors hover:bg-white hover:!text-black",
          showLabel && "mt-2",
        )}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          size={18}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-md border border-white bg-black shadow-2xl shadow-black">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-white text-black"
                    : "text-white hover:bg-white hover:!text-black",
                )}
                key={option.value}
                onClick={() => handleSelect(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
