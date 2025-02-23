import { ProviderCard } from "@/components/ProviderCard";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { Proof, searchService } from "@/services/search.service";
import { getProviderIcon } from "@/utils/provider";
import { addToast } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

interface SearchResult {
  id: string;
  proofs: Proof[];
}

function SearchComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResult(null);
      return;
    }

    try {
      setIsLoading(true);
      const searchResult = await searchService.searchWallets(query);

      if (!searchResult) {
        addToast({
          title: 'Not Found',
          description: 'No wallet found with this address',
          color: 'warning',
          timeout: 3000,
        });
        return;
      }

      if (searchResult.proofs.length === 0) {
        addToast({
          title: 'No Proofs',
          description: 'This wallet has no verified providers',
          color: 'default',
          timeout: 3000,
        });
      }

      setResult(searchResult);
    } catch (error) {
      console.error("Search error:", error);
      addToast({
        title: 'Error',
        description: 'Failed to search wallet. Please try again.',
        color: 'danger',
        timeout: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-3xl font-semibold text-white mb-8">
        Search by wallet
      </h2>

      <div className="flex flex-col gap-6">
        <div className="max-w-xl">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Enter wallet address"
            isLoading={isLoading}
            debounceMs={500}
          />
        </div>

        {result && result.proofs.length > 0 && (
          <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
            {result.proofs.map((proof) => (
              <ProviderCard
                key={proof.proof_identifier}
                provider={{
                  id: proof.provider,
                  name: proof.provider,
                  icon: getProviderIcon(proof.provider),
                  isVerified: true,
                  domain: proof.provider.toLowerCase() + '.com',
                  link: `https://${proof.provider.toLowerCase()}.com`,
                  value: proof.username || proof.email
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
