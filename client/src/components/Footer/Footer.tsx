import { UserStats } from '@/components/UserStats';
import { proofService } from '@/services/proof.service';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  const providerStatsQuery = useQuery({
    queryKey: ['provider-stats'],
    queryFn: () => proofService.fetchProofStats(),
    refetchInterval: 30000,
  });

  const totalVerifications = useMemo(() => {
    if (!providerStatsQuery.data) return 0;

    // Sum up all verification counts across providers
    return Object.values(providerStatsQuery.data).reduce((total, count) => total + count, 0);
  }, [providerStatsQuery.data]);

  return (
    <footer className="flex gap-4 py-4 container mx-auto justify-between items-center">
      <div className="flex items-center gap-4">
        <a href="https://x.com/weavefg" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          <FaXTwitter size={20} />
        </a>
        <a href="https://github.com/DirKraft91/Weave" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          <FaGithub size={20} />
        </a>
      </div>

      <UserStats count={totalVerifications} className="ml-6" forceShow />
    </footer>
  );
};
