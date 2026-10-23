import { useEffect, useState } from 'react';
import { Home, Mail, Phone, MapPin, Globe, Github, Facebook, Twitter,Instagram,Linkedin, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // すでにアプリとして起動している場合は案内を表示しない
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/content/templates/sverigejplogo.png" 
                alt="Sverige.JP Logo"
                className="h-12 w-12 object-contain"
                style={{ width: '48px', height: '48px' }}
              />
              <h3 className="text-xl font-bold">Sverige.JP</h3>
            </Link>
            <p className="text-gray-300 mb-4">
              スウェーデン日本コミュニティサイト
            </p>
            <p className="text-gray-400 text-sm">
              スウェーデン在住の日本人のための情報交換プラットフォーム。イベント、求人、
              買取・販売、 housingなど生活に役立つ情報を共有しましょう。
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">リンク</h4>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    全て
                  </Link>
                </li>
                <li>
                  <Link to="/?category=cat-for-sale" className="text-gray-300 hover:text-white transition-colors">
                    売ります/あげます
                  </Link>
                </li>
                <li>
                  <Link to="/?category=cat-job-seeking" className="text-gray-300 hover:text-white transition-colors">
                    仕事探し
                  </Link>
                </li>
                <li>
                  <Link to="/?category=cat-housing" className="text-gray-300 hover:text-white transition-colors">
                    住居
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/?category=cat-events" className="text-gray-300 hover:text-white transition-colors">
                    イベントお知らせ
                  </Link>
                </li>
                <li>
                  <Link to="/?category=cat-services" className="text-gray-300 hover:text-white transition-colors">
                    サービス
                  </Link>
                </li>
                <li>
                  <Link to="/forum" className="text-gray-300 hover:text-white transition-colors">
                    情報・掲示板
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                    プロフィール
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                    使い方・FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ホーム画面への追加案内（インストール済みの場合は表示しない） */}
        {!isStandalone && (
          <div className="border-t border-gray-800 mt-8 pt-8">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">
              📱 ホーム画面に追加してアプリのように使う
            </h4>
            <div className="text-gray-400 text-xs leading-relaxed">
              <p className="font-medium text-gray-300">iPhone(Safariブラウザ)の場合：</p>
              <ol className="list-decimal list-inside space-y-0.5 mt-1">
                <li>画面の下にある「共有」ボタンをタップ</li>
                <li>出てきたメニューを下にスクロールする</li>
                <li>「ホーム画面に追加」をタップ</li>
                <li>右上の「追加」をタップ</li>
              </ol>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mt-3">
              <span className="font-medium text-gray-300">PCの場合：</span>
              アドレスバーの右端に表示されるインストールアイコンをクリックしてください。
            </p>
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Sverige.JP. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/about" className="text-gray-400 hover:text-white text-xs transition-colors">
                当サイトについて
              </Link>
              <Link to="/safety" className="text-gray-400 hover:text-white text-xs transition-colors">
                安全にご利用いただくために
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-xs transition-colors">
                プライバシー
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-xs transition-colors">
                利用規約
              </Link>
              <a href="mailto:support@sverige.jp" className="text-gray-400 hover:text-white text-xs transition-colors">
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;