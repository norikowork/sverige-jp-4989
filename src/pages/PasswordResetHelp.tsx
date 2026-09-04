import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, MailWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const PasswordResetHelp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/help" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          使い方ガイド・FAQに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">パスワードを忘れた場合</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <KeyRound className="w-6 h-6 mr-2 text-blue-600" />
              パスワードの再設定方法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700 leading-relaxed">
              <li>ログイン画面を開き、「パスワードをお忘れですか？」をクリックします</li>
              <li>登録しているメールアドレスを入力して送信すると、リセットコードがメールで届きます</li>
              <li>届いたリセットコードと、新しく設定したいパスワードを画面に入力します</li>
              <li>「パスワードをリセット」を押すと完了です。以前と同じパスワードは再利用できません</li>
              <li>設定した新しいパスワードで、あらためてログインしてください</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MailWarning className="w-6 h-6 mr-2 text-orange-600" />
              メールが届かない場合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>迷惑メール（スパム）フォルダに振り分けられていないかご確認ください</li>
              <li>入力したメールアドレスに誤りがないかご確認のうえ、もう一度お試しください</li>
              <li>
                それでも解決しない場合は、
                <a href="mailto:support@sverige.jp" className="text-blue-600 hover:underline">support@sverige.jp</a>
                までご連絡ください
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PasswordResetHelp;
