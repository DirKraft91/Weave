import { SearchInput } from "@/components/SearchInput/SearchInput";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

function SearchComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      console.log("Searching for:", query);
      // await searchWallets(query);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-3xl font-semibold text-white mb-8">
        Search by wallet
      </h2>

      <div className="max-w-xl">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Enter wallet address"
          isLoading={isLoading}
          debounceMs={500}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
