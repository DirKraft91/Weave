import './aurora.css';

export const AuroraAnimation = () => {
  return (
    <span className="absolute top-0 left-0 w-full h-full z-2 pointer-events-none mix-blend-darken">
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} className="aurora__item"></span>
      ))}
    </span>
  );
};
