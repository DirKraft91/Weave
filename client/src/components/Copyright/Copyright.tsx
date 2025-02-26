import SpiderInteresting from '@/assets/spider-interesting.png';

export const Copyright = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-white">© {currentYear} Weave</p>
      <img src={SpiderInteresting} alt="Spider Interesting" className="w-8" />
    </div>
  );
};
