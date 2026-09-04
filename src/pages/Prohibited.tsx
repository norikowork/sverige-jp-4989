import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const Prohibited = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">禁止されている投稿内容</h1>
        <p className="text-sm text-gray-500 mb-8">最終改定日: 2026年9月4日</p>

        <Card>
          <CardContent className="pt-6 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <p>
                Sverige.JP（以下「本サービス」）を安心してご利用いただくため、以下に該当する投稿・出品・勧誘は禁止しています。
                本サービスはスウェーデンにお住まいの方を主な対象としているため、スウェーデンの法律・規制を基準にしています。
                違反する投稿は、事前の通知なく削除される場合があります。詳しくは
                <Link to="/terms" className="text-blue-600 hover:underline">利用規約</Link>
                もあわせてご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. 武器・弾薬</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>銃器・その部品、エアガン・BB弾銃、スタンガン、クロスボウなどの武器類</li>
                <li>弾薬、火薬、花火、爆発物、実弾・空包、リロード用資材</li>
                <li>ナイフ等についても、スウェーデンの武器法（vapenlagen）で所持・携帯が規制されている物は投稿できません</li>
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                スウェーデンでは銃器の譲渡・売買には警察（Polisen）発行の許可証（vapenlicens）と正式な名義変更手続きが必要です。個人間の掲示板での売買はできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. 医薬品・違法薬物</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>処方薬・市販薬・医療機器の販売（薬局以外での医薬品の譲渡・販売は違法です）</li>
                <li>麻薬・向精神薬などの規制薬物、大麻関連製品（CBD製品を含め、含有量によって規制対象です）</li>
                <li>それらの使用・入手を助長する内容の投稿</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. お酒・タバコ</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>アルコール飲料（アルコール度数3.5%を超えるものはSystembolaget（国営酒販店）の独占販売品目のため、個人間売買・譲渡は違法です）</li>
                <li>タバコ・電子タバコ・ニコチン製品の販売（正式な販売許可が必要です）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. 児童の保護・性的な内容</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>売春・性的サービスの勧誘・仲介・広告</li>
                <li>未成年者を危険にさらす、または性的に搾取する内容（児童ポルノを含む）は一切禁止し、発見次第、当局に通報します</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. 動物</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>ペットの販売広告（保護犬・保護猫の里親探しなど、対価を目的としない譲渡は対象外です）</li>
                <li>動物の部位、種畜サービスの広告</li>
                <li>絶滅危惧種・保護対象種の動植物、およびその加工品</li>
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                スウェーデンでは犬・猫の譲渡にJordbruksverket（スウェーデン農業庁）のマイクロチップ登録・ワクチン証明が必要な場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. 盗品・違法な物品</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>盗難品、シリアル番号が削除・改ざんされた物品</li>
                <li>侵入・盗難用の道具</li>
                <li>その他、所持・売買自体が法律で禁止されている物品</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. 偽造品・海賊版</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>ブランド品の偽造品・模倣品（レプリカ）</li>
                <li>海賊版のソフトウェア・映像・音楽など、著作権を侵害する物品</li>
                <li>非武装化されていない軍関連物品</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. 個人情報・政府発行書類</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>本人の同意なく、他人の個人番号（personnummer）・住所・電話番号などの個人情報を含む投稿</li>
                <li>IDカード、運転免許証、警察・行政関連の記章、出生証明書などの政府発行書類の売買</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. 詐欺的・誤解を招く投稿</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>虚偽・誇大・誤解を招く内容の投稿</li>
                <li>おとり広告（表示と異なる商品・条件に誘導する行為）</li>
                <li>検索結果を操作する目的での無関係なキーワードの詰め込み</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. ネズミ講・マルチ商法・ギャンブル</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>ネズミ講、マルチ商法（MLM）、その他の不当な勧誘スキーム</li>
                <li>宝くじ・懸賞券、スロットマシンなど賭博に関連する物品・サービス</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. スパム・重複投稿</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>同一内容の重複投稿、カテゴリーを偽った投稿</li>
                <li>本サービスと無関係な宣伝、アフィリエイト・ネットワークビジネスの勧誘</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. 危険物・衛生に関わる物品</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>リコール対象の製品、危険物・有害物質</li>
                <li>未消毒の寝具・衣類など、衛生上のリスクがある中古品</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">違反した投稿を見つけたら</h2>
              <p>
                上記に該当すると思われる投稿を見つけた場合は、投稿詳細ページの「⚠ スパムを報告」ボタンからご報告ください。
                管理者が内容を確認し、投稿の削除やアカウントの利用停止などの対応を行います。安全なご利用のための一般的な注意点は
                <Link to="/safety" className="text-blue-600 hover:underline">「安全にご利用いただくために」</Link>
                のページもご覧ください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Prohibited;
