import { useDebounce } from "@/hooks/useDebounce";
import { Input, Spinner } from "@heroui/react";
import { ChangeEvent, useCallback, useState } from "react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  debounceMs?: number;
}

export function SearchInput({
  onSearch,
  placeholder = "Search...",
  isLoading = false,
  debounceMs = 300
}: SearchInputProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useDebounce(onSearch, debounceMs);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
