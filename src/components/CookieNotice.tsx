import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'sverige_jp_cookie_ack';

const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem(STORAGE_KEY);
    if (!acknowledged) {
      setIsVisible(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <Cookie className="w-6 h-6 text-yellow-400 flex-shrink-0 hidden sm:block" />
        <p className="text-sm text-gray-300 flex-1 text-center sm:text-left">
          Sverige.JPは、ログイン状態の維持などサービス提供に必要な範囲でのみCookieを使用しています。広告目的でのトラッキングは行っていません。詳しくは
          <Link to="/privacy" className="text-blue-400 hover:underline mx-1">プライバシーポリシー</Link>
          をご覧ください。
        </p>
        <Button onClick={handleAcknowledge} className="flex-shrink-0 w-full sm:w-auto">
          了解
        </Button>
      </div>
    </div>
  );
};

export default CookieNotice;
