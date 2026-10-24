import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'sverige_jp_pwa_install_dismissed';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 1ヶ月

// ブラウザ標準の「インストール」ダイアログはロゴと名前だけの簡素な表示で、
// 初めて見るユーザーには詐欺アプリと見分けがつきにくい。そこで標準ダイアログが
// 出る前に、公式サイトであることを説明するバナーをこちらで表示してから
// 標準ダイアログを呼び出す。
const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // すでにアプリとして起動している場合は表示しない
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
    if (sessionStorage.getItem(DISMISS_KEY)) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <img
          src="/content/templates/sverigeapp.png"
          alt="Sverige.JP"
          className="w-10 h-10 rounded-lg flex-shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-gray-900">
            Sverige.JP公式アプリをホーム画面に追加しませんか？
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            sverige.jp が提供する公式サイトの機能です。アプリストアを経由しない安全な追加方法で、次回からホーム画面のアイコンからすぐにアクセスできます。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button variant="outline" onClick={handleDismiss} className="flex-1 sm:flex-initial">
            後で
          </Button>
          <Button onClick={handleInstall} className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4 mr-1" />
            追加する
          </Button>
          <button
            onClick={handleDismiss}
            className="hidden sm:block text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
