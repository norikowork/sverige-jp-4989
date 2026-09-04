import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Search, Flag, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const Scams = () => {
  const links = [
    {
      to: '/scams/avoiding',
      icon: ShieldAlert,
      title: '詐欺を避けるために',
      description: '被害に遭わないための基本ルールと、してはいけないこと'
    },
    {
      to: '/scams/identifying',
      icon: Search,
      title: '詐欺を見分けるには',
      description: '実際のメール・電話・フィッシングの実例で手口を知る'
    },
    {
      to: '/scams/reporting',
      icon: Flag,
      title: '詐欺を報告する',
      description: '被害に遭った、または疑わしい投稿を見つけたときの連絡先'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺について</h1>
        <p className="text-gray-600 mb-8">
          Sverige.JPの利用者の多くは誠実な方々ですが、まれにSverige.JPやその利用者になりすまして、
          お金・物品・個人情報をだまし取ろうとする人が紛れ込むことがあります。
          以下のページで、詐欺を避ける・見分ける・報告するための情報をまとめています。
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

        <p className="text-sm text-gray-500 mt-8">
          対面での取引や個人情報の扱いなど、一般的な注意点は
          <Link to="/safety" className="text-blue-600 hover:underline">「安全にご利用いただくために」</Link>
          のページもあわせてご覧ください。
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Scams;
