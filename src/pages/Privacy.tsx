import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-8">最終改定日: 2026年9月3日</p>

        <Card>
          <CardContent className="pt-6 space-y-8 text-gray-700 leading-relaxed">
            <section>
              <p>
                Sverige.JP（以下「本サービス」）は、利用者の個人情報を大切に扱います。
                本プライバシーポリシーは、本サービスがどのような情報を収集し、
                どのように利用・保管・共有するかについて説明するものです。
                本サービスはスウェーデン（EU）にお住まいの方を主な対象としており、
                EU一般データ保護規則（GDPR）に配慮した運用に努めています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. 収集する情報</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>アカウント情報: メールアドレス、表示名、パスワード（暗号化して保存）</li>
                <li>プロフィール情報: 自己紹介、電話番号、居住県、プロフィール写真（任意入力）</li>
                <li>投稿情報: クラシファイド投稿、フォーラムへの投稿・返信、画像</li>
                <li>メッセージ: サイト内メッセージ機能でやり取りした内容</li>
                <li>利用状況: ログイン日時、投稿・閲覧などの操作ログ（不正利用防止等の目的）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. 情報の利用目的</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>本サービスの提供・運営・維持（アカウント管理、投稿・メッセージ機能の提供）</li>
                <li>利用者間のサイト内メッセージのやり取りを可能にするため</li>
                <li>新着メッセージ等の通知メールの送信</li>
                <li>不正利用・スパム・規約違反の防止および対応</li>
                <li>本サービスの改善、利用状況の分析</li>
                <li>お問い合わせへの対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. 情報の第三者提供</h2>
              <p className="mb-2">
                本サービスは、収集した個人情報を第三者に販売することはありません。
                以下の場合を除き、第三者へ提供することはありません。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>本サービスの運営に必要な業務委託先（メール配信、ホスティング等のサービス提供事業者）へ、業務遂行に必要な範囲で提供する場合</li>
                <li>法令に基づく開示請求があった場合</li>
                <li>利用者の生命・身体・財産の保護のために必要と判断される場合</li>
                <li>利用者本人の同意がある場合</li>
              </ul>
              <p className="mt-2">
                なお、他の利用者に対しては、投稿に表示される表示名およびプロフィールで
                公開設定にした情報のみが表示され、メールアドレスは「連絡の受け取り方」の
                設定により非公開にすることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookie等の利用</h2>
              <p>
                本サービスは、ログイン状態の維持など、サービス提供に必要な範囲でCookieや
                類似の技術を利用します。広告目的でのトラッキングは行っていません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. データの保存期間</h2>
              <p>
                個人情報は、本サービスの提供に必要な期間、または法令で定められた期間保存します。
                アカウントを削除した場合、投稿等のコンテンツは削除（非表示）されますが、
                不正利用防止等の目的で一定期間ログが残る場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. 利用者の権利（GDPRに基づく権利）</h2>
              <p className="mb-2">
                EU一般データ保護規則（GDPR）に基づき、利用者は自己の個人情報について
                以下の権利を有します。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>自己の個人情報の開示を請求する権利（アクセス権）</li>
                <li>誤った情報の訂正を請求する権利（訂正権）</li>
                <li>個人情報の削除を請求する権利（消去権）</li>
                <li>個人情報の処理の制限を請求する権利</li>
                <li>データポータビリティ（データの移行）を請求する権利</li>
                <li>個人情報の処理に異議を申し立てる権利</li>
              </ul>
              <p className="mt-2">
                これらの権利の行使をご希望の場合は、下記のお問い合わせ先までご連絡ください。
                また、本サービスの個人情報の取り扱いについてご懸念がある場合、スウェーデンの
                個人データ保護監督機関（IMY: Integritetsskyddsmyndigheten）に苦情を申し立てる
                権利もあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. 未成年者のプライバシー</h2>
              <p>
                本サービスは18歳未満の方の利用を想定しておらず、意図的に18歳未満の方から
                個人情報を収集することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. セキュリティ</h2>
              <p>
                本サービスは、個人情報の紛失・盗難・改ざん・不正アクセスを防ぐため、
                合理的な範囲でのセキュリティ対策を講じています。ただし、インターネット上の
                通信・保存において絶対的な安全性を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. 第三者サイトへのリンク</h2>
              <p>
                本サービスには第三者が運営するウェブサイトへのリンクが含まれる場合があります。
                それらのサイトにおける個人情報の取り扱いについて、本サービスは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. 本ポリシーの変更</h2>
              <p>
                本プライバシーポリシーは、必要に応じて改定することがあります。重要な変更を
                行う場合は、本サービス上でお知らせするよう努めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. お問い合わせ</h2>
              <p>
                個人情報の取り扱いに関するご質問・開示請求等は、
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

export default Privacy;
