import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import { usePageSeo } from '@/lib/seo';

const About = () => {
  usePageSeo({
    title: '当サイトについて | Sverige.JP',
    description: 'Sverige.JPはスウェーデン在住の日本人コミュニティサイトです。サイトの目的や運営についてご紹介します。',
    path: '/about',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">当サイトについて</h1>

        <Card>
          <CardContent className="pt-6 space-y-6 text-gray-700 leading-relaxed">
            <p className="text-xl font-semibold text-gray-900">
              スウェーデンの魅力を、もっと身近に。
            </p>

            <p>
              Sverige.jpは、まだ広く知られていないスウェーデン各地の魅力を、一人でも多くの方に届けたいという思いから生まれました。
            </p>

            <p>
              美しい自然や街並みだけでなく、日々の暮らしや、そこで活動する人たちの思いも伝えていきたい。そして、スウェーデンで頑張る個人の方やお店、企業の皆さまと一緒に、この国を盛り上げていけたらと思っています。
            </p>

            <p>
              以前、アメリカのサンディエゴに暮らしていました。その時、2004年に、地域の情報サイトを立ち上げました。多くの方に支えていただき、今では約2万3千人の登録メンバー、月間14万ページビューのサイトへと育ちました。その経験を通じて感じたのは、地域の情報が、人と人との出会いやつながりを生むということです。
            </p>

            <p>
              私たちが暮らすスウェーデンでも、そんなつながりを少しずつ育んでいきたいと思っています。
            </p>

            <p>
              旅行や留学、お仕事で訪れる方には、スウェーデンを知るきっかけに。そして、ここに暮らす方には、毎日の生活に役立つ情報や、気軽に情報を交換できる場所に。
            </p>

            <p className="font-medium text-gray-900">
              「訪れてみたい」「ここで暮らせてよかった」<br />
              そんな気持ちにつながるよう、一つひとつの情報を大切に、心を込めてお届けしていきます。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
