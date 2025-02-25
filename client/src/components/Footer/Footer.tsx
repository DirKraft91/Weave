import SpiderInteresting from '@/assets/spider-interesting.png';
import { FaGithub, FaUser, FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex gap-4 py-4 container mx-auto justify-between items-center">
      <div className="flex items-center gap-4">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          <FaXTwitter size={20} />
        </a>
        <a href="https://github.com/DirKraft91/Weave" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          <FaGithub size={20} />
        </a>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm text-white">© {currentYear} Weave</p>
        <img src={SpiderInteresting} alt="Spider Interesting" className="w-8" />
      </div>

      <div className="flex items-center gap-2 ml-6">
        <FaUser size={18} className="text-white" />
        <span className="text-sm rounded-full bg-white/10 w-6 h-6 flex items-center justify-center text-white text-small">5</span>
      </div>
    </footer>
  );
};
