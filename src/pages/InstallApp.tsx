import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const InstallApp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">アプリのように使うには</h1>

        <Card>
          <CardContent className="pt-6 space-y-8 text-gray-700 leading-relaxed">
            <p>
              Sverige.JPはホーム画面に追加することで、アプリのようにワンタップで開けるようになります。アプリストアを経由しない、公式サイトが提供する安全な機能です。
            </p>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">iPhone(Safariブラウザ)の場合</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>画面の下にある「共有」ボタンをタップ</li>
                <li>出てきたメニューを下にスクロールする</li>
                <li>「ホーム画面に追加」をタップ</li>
                <li>右上の「追加」をタップ</li>
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Android(Chromeブラウザ)の場合</h2>
              <p>
                サイトを開くと画面下に追加の案内が表示されますので、そちらから追加できます。表示されない場合は、ブラウザ右上のメニュー（縦に3つ並んだ点）から「アプリをインストール」を選んでください。
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">PC(Chrome・Edgeなど)の場合</h2>
              <p>
                アドレスバーの右端に表示されるインストールアイコンをクリックしてください。表示されない場合は、ブラウザ右上のメニューから「インストール」を選んでください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default InstallApp;
