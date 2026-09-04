import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Fish, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const ScamsIdentifying = () => {
  const links = [
    {
      to: '/scams/phishing',
      icon: Fish,
      title: 'フィッシング詐欺について',
      description: 'ログイン情報や個人情報を盗もうとする手口とは'
    },
    {
      to: '/scams/email-examples',
      icon: Mail,
      title: '詐欺メールの実例',
      description: '実際に報告された詐欺メールのパターンと危険信号'
    },
    {
      to: '/scams/phone-examples',
      icon: Phone,
      title: '詐欺電話・SMSの実例',
      description: '電話やSMSを使った詐欺のパターンと危険信号'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺についてに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺を見分けるには</h1>
        <p className="text-gray-600 mb-8">
          詐欺かどうか、その場では判断しづらいことがあります。実際に報告された詐欺の実例を知っておくことで、
          同じような手口に気づきやすくなります。以下から、手口ごとの詳しい実例をご覧いただけます。
        </p>

        <div className="space-y-4">
          {links.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all">
                <CardContent className="py-5 flex items-center gap-4">
                  <item.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsIdentifying;
