import { Home, Search, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onNewPost?: () => void;
}

export default function BottomNav({ onNewPost }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handlePost = () => {
    if (onNewPost) {
      onNewPost();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex items-stretch justify-around pb-[env(safe-area-inset-bottom,0px)]">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs ${
          isHome ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <Home className="w-5 h-5" />
        ホーム
      </button>
      <button
        onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs text-gray-500"
      >
        <Search className="w-5 h-5" />
        検索
      </button>
      <button
        onClick={handlePost}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
      >
        <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </span>
        <span className="text-xs text-blue-600">投稿</span>
      </button>
      <button
        onClick={() => navigate('/profile')}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs text-gray-500"
      >
        <User className="w-5 h-5" />
        マイページ
      </button>
    </nav>
  );
}
