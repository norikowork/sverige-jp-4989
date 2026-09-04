import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-sm text-gray-500 mb-8">最終改定日: 2026年9月4日</p>

        <Card>
          <CardContent className="pt-6 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <p>
                この利用規約（以下「本規約」）は、Sverige.JP（以下「本サービス」）の利用条件を定めるものです。
                本サービスは、スウェーデンにお住まいの日本人・日本語コミュニティのための
                クラシファイド（売ります買います・仕事探し・住居・イベント・サービス）と
                フォーラム（情報・掲示板）を提供する、非商業的なコミュニティサイトです。
                本サービスに登録・投稿・閲覧など、いかなる形で本サービスを利用した場合も、
                利用者は本規約に同意したものとみなされます。本規約に同意いただけない場合は、
                本サービスのご利用をお控えください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. サービスの内容</h2>
              <p>
                本サービスは、利用者同士が情報をやり取りする「場」を提供するものであり、
                個々の投稿内容や取引・やり取りの当事者にはなりません。本サービスは投稿を
                事前に審査・保証するものではなく、投稿されたクラシファイドやフォーラムの
                内容について責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. アカウント登録</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>本サービスの一部機能（投稿・メッセージ送信など）の利用にはアカウント登録が必要です。</li>
                <li>登録情報は正確かつ最新の内容としてください。</li>
                <li>1人につき1アカウントの登録を原則とします。他人になりすましてのアカウント作成は禁止します。</li>
                <li>アカウント（メールアドレス・パスワード）の管理は利用者自身の責任で行ってください。第三者による不正利用が判明した場合は速やかに運営にご連絡ください。</li>
                <li>18歳未満の方、または居住国の法律で成人とみなされない方は、本サービスにアカウント登録できません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. 利用許諾（ライセンス）</h2>
              <p>
                運営は、利用者に対し、本サービスを個人的・非商業的な目的で利用するための、
                限定的・撤回可能・非独占的なライセンスを許諾します。本サービス上のコンテンツ
                （自分自身の投稿を除く）を無断で複製・再配布・営利目的で利用すること、
                本サービスを許可なく他サイトにフレーム表示すること、自動化ツール・
                スクレイピングによる情報収集は禁止します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. 禁止事項</h2>
              <p className="mb-2">本サービスの利用にあたり、以下の行為を禁止します。</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>法令、公序良俗に違反する行為、または違反するおそれのある行為</li>
                <li>盗品・違法薬物・武器・偽造品など、違法な物品・サービスの売買や勧誘</li>
                <li>詐欺、なりすまし、虚偽の情報を含む投稿（詐欺の手口は「安全にご利用いただくために」ページもご参照ください）</li>
                <li>他の利用者や第三者に対する嫌がらせ、脅迫、誹謗中傷、差別的表現</li>
                <li>他人の個人情報（住所・電話番号・メールアドレス等）を本人の同意なく投稿する行為</li>
                <li>スパム行為、無関係な広告の大量投稿、同一内容の重複投稿</li>
                <li>本サービスまたは第三者の知的財産権、肖像権、プライバシーを侵害する行為</li>
                <li>マルチ商法、ねずみ講、その他不当な勧誘行為</li>
                <li>本サービスのシステムに過度な負荷をかける行為、不正アクセス、リバースエンジニアリング、自動化ツールによるスクレイピング等</li>
                <li>アカウントの売買・譲渡、スパム報告機能の濫用</li>
                <li>未成年者に不適切なコンテンツの投稿</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. 投稿コンテンツについて</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>投稿内容（テキスト・画像等）の権利は投稿者本人に帰属しますが、投稿者は本サービス上でその内容を表示・配信するために必要な範囲のライセンスを運営に許諾するものとします。</li>
                <li>投稿内容の正確性・適法性・安全性について、投稿者自身が全責任を負います。</li>
                <li>運営は、本規約に違反すると判断した投稿・アカウントについて、事前の通知なく削除・停止できるものとします。モデレーションに関する判断は運営の裁量によります。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. 取引に関する注意（免責事項）</h2>
              <p className="mb-2">
                本サービスは利用者同士が直接やり取りする「場」の提供のみを行っており、
                投稿内容の真偽、取引の安全性、相手方の身元について保証するものではありません。
                取引・面会・連絡は、必ずご自身の判断と責任のもとで行ってください。
                安全にご利用いただくための具体的な注意点は
                <Link to="/safety" className="text-blue-600 hover:underline">「安全にご利用いただくために」</Link>
                のページにまとめています。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>本サービスは、利用者間の取引・連絡・約束の履行について一切の責任を負いません。</li>
                <li>不審な投稿やユーザーを見つけた場合は、投稿詳細ページの「スパムを報告」機能または運営へのお問い合わせよりご連絡ください。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. 保証の否認・責任の制限</h2>
              <p>
                本サービスは「現状有姿（AS IS）」で提供され、明示・黙示を問わずいかなる保証も
                行いません（特定目的への適合性、正確性、中断のないこと、安全性等を含みますが
                これに限られません）。法令上許容される最大限の範囲において、運営は本サービスの
                利用または利用不能により生じたいかなる損害（直接損害・間接損害・逸失利益・
                利用者間のトラブルによる損害等を含む）についても責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. アカウントの停止・削除</h2>
              <p>
                運営は、利用者が本規約に違反した場合、またはその他運営が必要と判断した場合、
                事前の通知なく当該利用者のアカウントを一時停止または削除できるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. 本規約の変更</h2>
              <p>
                運営は、必要に応じて本規約を変更できるものとします。変更後の規約は、本ページに
                掲載した時点から効力を生じるものとします。重要な変更を行う場合は、本サービス上で
                お知らせするよう努めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. 準拠法</h2>
              <p>
                本規約の解釈にあたっては、スウェーデン王国の法令を準拠法とします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. お問い合わせ</h2>
              <p>
                本規約に関するご質問は、
                <a href="mailto:support@sverige.jp" className="text-blue-600 hover:underline">support@sverige.jp</a>
                までご連絡ください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
