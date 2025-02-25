import GradientImage from '@/assets/gradient.svg';

export function Background() {
  return (
    <div className="z-0 absolute inset-0 h-full w-full bg-[radial-gradient(rgba(255,255,255,0.8),transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]">
      <img src={GradientImage} alt="Gradient" className="w-full h-full object-cover" />
    </div>
  );
}
