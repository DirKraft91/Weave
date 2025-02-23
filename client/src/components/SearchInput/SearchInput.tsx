import { useDebounce } from "@/hooks/useDebounce";
import { Button, Input, Spinner } from "@heroui/react";
import { ChangeEvent, useCallback, useState } from "react";
import { IoClose } from "react-icons/io5";

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

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && !isLoading && (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={handleClear}
            className="min-w-8 w-8 h-8"
          >
            <IoClose className="w-4 h-4" />
          </Button>
        )}
        {isLoading && <Spinner size="sm" />}
      </div>
    </div>
  );
}
