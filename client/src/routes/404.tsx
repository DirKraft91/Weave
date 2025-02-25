import SpiderSad from '@/assets/spider-sad.png';
import SpiderWebImage from '@/assets/web.png';
import { createFileRoute, Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute left-0 top-24">
        <img src={SpiderWebImage} alt="Spider web" />
      </div>
      <div className="absolute right-14 bottom-24">
        <img src={SpiderSad} alt="Sad spider" />
      </div>

      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-white">404</h1>
        <div className="mt-4">
          <p className="text-3xl font-bold text-white">
            Ooops... page not found
          </p>
          <Link
            to="/"
            className="inline-block mt-8 px-12 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-2xl transition-colors duration-200 text-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});
