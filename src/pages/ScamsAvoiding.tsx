import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Ban, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const ScamsAvoiding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺についてに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺を避けるために</h1>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="py-6 flex items-start gap-3">
            <ShieldCheck className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-900 font-medium">
              基本ルールはひとつだけです。「直接会って、現金で取引する」——これを守るだけで、ほとんどの詐欺は防げます。
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Ban className="w-6 h-6 mr-2 text-red-600" />
              絶対にしてはいけないこと
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>会う前にお金を支払う、または送金する</li>
              <li>Swishでの前払いを求められて応じる（特に会ったことのない相手）</li>
              <li>ギフトカード（プリペイドカード）のコードを教えるよう求められて応じる</li>
              <li>BankIDでの本人確認や、SMS・メールで届く確認コードを他人に教える</li>
              <li>個人番号（personnummer）、銀行口座番号、クレジットカード情報を見知らぬ相手に伝える</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              こんな話には要注意
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>「発送するので住所を教えてほしい」「代理の人が受け取りに行く」など、直接会わずに取引を進めようとする</li>
              <li>「絶対に安全」「保証します」など、過度に安心させようとする言葉を使う</li>
              <li>サイト内メッセージを使わず、すぐに個人のメールやLINE・WhatsAppなど別の手段に誘導しようとする</li>
              <li>確認コード（SMSやメールに届く数字）を送るよう求められる——これは例外なく詐欺です</li>
              <li>相場より大幅に安い、条件が良すぎる話</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
              安全な取引の進め方
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>やり取りは、相手にメールアドレスを知られない「サイト内メッセージ」を使う</li>
              <li>待ち合わせは、人目のある公共の場所を選ぶ</li>
              <li>支払いの前に、商品の状態を実際に自分の目で確認する</li>
              <li>少しでも不安を感じたら、取引を中止する判断を優先する</li>
            </ul>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500 mt-8">
          実際の手口を知っておきたい方は
          <Link to="/scams/identifying" className="text-blue-600 hover:underline">「詐欺を見分けるには」</Link>
          、被害に遭った・疑わしい投稿を見つけた場合は
          <Link to="/scams/reporting" className="text-blue-600 hover:underline">「詐欺を報告する」</Link>
          をご覧ください。
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsAvoiding;
