import { UserStats } from '@/components/UserStats';
import { useTotalVerifications } from '@/hooks/useApiQueries';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  const { totalVerifications } = useTotalVerifications();

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
