import { Link } from 'react-router-dom';
import { ArrowLeft, Flag, Shield, ShoppingBag, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const ScamsReporting = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺についてに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺を報告する</h1>
        <p className="text-gray-600 mb-8">
          詐欺と思われる投稿・メッセージを見つけた場合や、実際に被害に遭ってしまった場合は、
          落ち着いて以下の窓口に相談・報告してください。
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Flag className="w-6 h-6 mr-2 text-blue-600" />
              まずSverige.JPへ報告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>詐欺と思われる投稿は、投稿詳細ページの「⚠ スパムを報告」ボタンからご報告ください。管理者が内容を確認し、投稿の非表示やアカウントの利用停止などの対応を行います。</li>
              <li>やり取りの内容（スクリーンショット等）を添えて、<a href="mailto:support@sverige.jp" className="text-blue-600 hover:underline">support@sverige.jp</a>までご連絡いただくと、より詳しく状況を確認できます。</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-6 h-6 mr-2 text-red-600" />
              金銭的な被害や身の危険を感じる場合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-2">
              スウェーデン警察（Polisen）に相談・通報してください。
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>緊急時: <span className="font-semibold">112</span></li>
              <li>緊急でない被害の届け出: <span className="font-semibold">114 14</span></li>
              <li>オンラインでの届け出: <a href="https://polisen.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">polisen.se</a></li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShoppingBag className="w-6 h-6 mr-2 text-orange-600" />
              消費者トラブルの相談
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              商品やサービスの取引でのトラブルは、スウェーデン消費者庁（Konsumentverket）の相談窓口「Hallå konsument」（電話: 0771-525 525、
              <a href="https://www.hallakonsument.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">hallakonsument.se</a>
              ）でも相談できます。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="w-6 h-6 mr-2 text-purple-600" />
              個人情報が渡ってしまった場合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              個人番号（personnummer）やBankID関連の情報を第三者に伝えてしまった疑いがある場合は、
              速やかにご自身の銀行に連絡してBankIDや口座を凍結してもらうとともに、
              個人データ保護監督機関（IMY: Integritetsskyddsmyndigheten）への相談も検討してください。
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsReporting;
