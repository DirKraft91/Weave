import { FaUser } from 'react-icons/fa6';

interface UserStatsProps {
  count?: number;
  className?: string;
  forceShow?: boolean;
}

export const UserStats = ({ count = 0, className = '', forceShow = false }: UserStatsProps) => {
  if (count <= 0 && !forceShow) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FaUser size={18} className="text-white" />
      <span className="text-sm rounded-full bg-white/10 w-6 h-6 flex items-center justify-center text-white text-small">
        {count}
      </span>
    </div>
  );
};
