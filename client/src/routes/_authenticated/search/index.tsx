import SpiderInteresting from '@/assets/spider-interesting.png';
import SpiderSad from '@/assets/spider-sad.png';
import { ProviderCard } from "@/components/ProviderCard";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { Proof, searchService } from "@/services/search.service";
import { getProviderIcon } from "@/utils/provider";
import { addToast } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

function SearchComponent() {
  const [searchResults, setSearchResults] = useState<Proof[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNotFound(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchService.search(query);
      setSearchResults(results?.proofs || []);
      setNotFound(results?.proofs.length === 0);
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search',
        color: 'danger',
        timeout: 3000,
      });
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-3xl font-semibold text-white mb-8">
        Search by wallet
      </h2>

      <div className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Enter wallet address"
            isLoading={isSearching}
            debounceMs={500}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((proof, index) => (
              <ProviderCard
                key={index}
                provider={{
                  id: proof.proof_identifier,
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

        <div className="relative flex flex-col items-center justify-center gap-8 mt-4">
          <span className={`text-3xl font-bold self-start transition-opacity duration-300 ${notFound ? 'opacity-100' : 'opacity-0'}`}>
            Not Found
          </span>

          <div className="relative">
            {notFound ? (
              <img
                src={SpiderSad}
                alt="Sad spider"
              />
            ) : (
              <img
                src={SpiderInteresting}
                alt="Interesting spider"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
