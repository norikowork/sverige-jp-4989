import { Link } from 'react-router-dom';
import { ArrowLeft, Fish, AlertTriangle, ShieldAlert, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const ScamsPhishing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams/identifying" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺を見分けるにはに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">フィッシング詐欺について</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Fish className="w-6 h-6 mr-2 text-blue-600" />
              フィッシングとは
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              フィッシングとは、実在するサービスや組織になりすまして、ログイン情報・パスワード・
              個人情報・金融情報などを盗み取ろうとする詐欺の手口です。Sverige.JPやスウェーデンの銀行、
              配送業者などを装ったメール・SMSが典型的な手段です。
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              よくある手口
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">
              Sverige.JPやその利用者になりすました相手が、以下のようなことを求めてきます。
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>リンクをクリックしてログインするよう求める</li>
              <li>SMSやメールに届いた確認コードを伝えるよう求める</li>
              <li>外部サイトのフォームに個人情報を入力させる</li>
              <li>添付ファイルを開かせようとする</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-red-900">
              <ShieldAlert className="w-6 h-6 mr-2 text-red-600" />
              特に注意していただきたいこと
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-900 leading-relaxed">
              BankIDでの本人確認や、SMS・メールに届く確認コードを、電話・メール・SMSで尋ねてくることは、
              銀行・警察・Sverige.JPを含め、正規の組織では絶対にありません。求められた場合は、
              相手が誰であっても詐欺だと考えてください。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <RefreshCcw className="w-6 h-6 mr-2 text-purple-600" />
              個人情報を伝えてしまった場合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>すぐにSverige.JPのパスワードを変更してください（プロフィールページから変更できます）</li>
              <li>他のサービスで同じパスワードを使っている場合は、それらもあわせて変更してください</li>
              <li>該当の投稿・メッセージを「⚠ スパムを報告」で通報してください</li>
              <li>
                詳しい報告先・相談先は
                <Link to="/scams/reporting" className="text-blue-600 hover:underline">「詐欺を報告する」</Link>
                をご覧ください
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsPhishing;
