import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Shield, Settings, Truck, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import { usePageSeo } from '@/lib/seo';

const Help = () => {
  usePageSeo({
    title: '使い方ガイド & FAQ | Sverige.JP',
    description: 'Sverige.JPの使い方ガイドとよくある質問をまとめています。投稿方法や機能の使い方についてご案内します。',
    path: '/help',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">使い方ガイド & FAQ</h1>

        {/* Introduction Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              はじめに
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              Sverige.JP では、投稿者への連絡方法が2つあります。
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">サイト内メッセージ</p>
                  <p className="text-sm text-gray-600">
                    メールアドレスを相手に知られずにやり取りできます（おすすめ）
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">メールで連絡</p>
                  <p className="text-sm text-gray-600">
                    あなたのメールアドレスが相手に伝わります
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-6 h-6 mr-2 text-green-600" />
              安全に使うために
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              知らない相手とやり取りするときは、まず「サイト内メッセージ」を使いましょう。メールアドレスを教えずに会話でき、不安な相手には返信しない・ブロックするという選択もできます。何度かやり取りして信用できたら、メッセージ画面の「メールアドレスを伝える」ボタンで、相手にだけ自分のメールアドレスを伝えてメールに切り替えられます。
            </p>
          </CardContent>
        </Card>

        {/* Contact Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="w-6 h-6 mr-2 text-purple-600" />
              連絡の受け取り方を変える
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              自分の投稿への連絡を「メールで受け取る（初期設定）」か「メールを隠す（サイト内メッセージのみ）」かは、プロフィール画面の「連絡の受け取り方」から変更できます。メールを知られたくない場合は「メールを隠す」を選んでください。
            </p>
          </CardContent>
        </Card>

        {/* Shipping Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Truck className="w-6 h-6 mr-2 text-orange-600" />
              配送で取引する（電話・メールなしでOK）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              「売ります」カテゴリの投稿は、直接会わずにPostNordでの配送で取引することもできます。電話番号やメールアドレスを教え合う必要はありません。
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>買い手はサイト内メッセージで購入の意思と発送先住所を売り手に伝えます</li>
              <li>売り手はPostNordで商品を発送し、控えの追跡番号を受け取ります</li>
              <li>売り手はプロフィール画面の自分の投稿一覧から「配送情報を入力」を選び、追跡番号を登録します</li>
              <li>登録した追跡番号は投稿詳細ページに表示され、買い手はいつでも配送状況を確認できます</li>
            </ol>
            <p className="text-sm text-gray-500">
              ※ 発送先住所のやり取りはサイト内メッセージで行ってください（住所自体は配送に必要なため、売り手に伝わります）。代金の授受については、
              <Link to="/scams/avoiding" className="text-blue-600 hover:underline">詐欺を避けるために</Link>
              のページもあわせてご確認ください。
            </p>
          </CardContent>
        </Card>

        {/* Deal Closed / Draft Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ClipboardCheck className="w-6 h-6 mr-2 text-indigo-600" />
              商談が終わったら & 下書き保存
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-medium text-gray-900 mb-2">商談終了ボタン</p>
              <p className="text-gray-700 leading-relaxed mb-3">
                「売ります」カテゴリの投稿が売れたら、プロフィール画面の自分の投稿一覧から「商談終了」を押してください。投稿は一覧には表示されなくなりますが、削除はされず、プロフィール画面と管理画面に履歴として残ります。間違えて押してしまった場合や、もう一度出品したい場合は「再開する」でいつでも公開に戻せます。完全に投稿を消したい場合は、今まで通り削除ボタン（ゴミ箱アイコン）をお使いください。
              </p>
              <img
                src="/content/templates/deal-closed-button.png"
                alt="商談終了ボタンの画面例"
                className="rounded-lg border max-w-full sm:max-w-md"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">下書き保存ボタン</p>
              <p className="text-gray-700 leading-relaxed mb-3">
                投稿作成の途中で続きを後で書きたい時は、「下書き保存」ボタンを押してください。タイトルとカテゴリーさえ入力していれば、他の項目が未入力でも保存できます。下書きはプロフィール画面の自分の投稿一覧に「下書き」として表示され、編集して仕上げたら通常通り「更新」を押せば公開されます。
              </p>
              <img
                src="/content/templates/save-draft-button.png"
                alt="下書き保存ボタンの画面例"
                className="rounded-lg border max-w-full sm:max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">よくある質問（FAQ）</h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="q1">
                <AccordionTrigger>メールアドレスは相手に知られますか？</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    「メールを隠す」設定にすれば知られません。サイト内メッセージでやり取りでき、信用できたら自分から「メアドを伝える」で開示できます。初期設定は「メールで受け取る」で、プロフィールから変更できます。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2">
                <AccordionTrigger>サイト内メッセージはどこで読めますか？</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    上部メニューの「メッセージ」から読めます。新着があると登録メールにお知らせが届きます（相手のメールアドレスは載りません）。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3">
                <AccordionTrigger>メッセージは何通まで保存できますか？</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    無料プランは100通までです。上限に達したら、メッセージ画面で古い会話を削除してください。将来、有料プラン（月30kr）で上限を増やせる予定です。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q4">
                <AccordionTrigger>知らない人と連絡するのが不安です</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    まずサイト内メッセージを使いましょう。メールアドレスを教えずにやり取りでき、不安なら返信しない・ブロックすることもできます。信用できたらメールに切り替えられます。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5">
                <AccordionTrigger>ブロックされた人は連絡できますか？</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    いいえ。利用停止（ブロック）されたアカウントはログインも投稿もできません。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q6">
                <AccordionTrigger>連絡の受け取り方を変えるには？</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    プロフィール →「連絡の受け取り方」→「メールで受け取る」か「メールを隠す」を選んで保存してください。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q7">
                <AccordionTrigger>パスワードを忘れてしまいました</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    ログイン画面の「パスワードをお忘れですか？」から再設定できます。詳しい手順は
                    <Link to="/help/password-reset" className="text-blue-600 hover:underline">こちら</Link>
                    をご覧ください。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q8">
                <AccordionTrigger>お店（サービス）とイベントをリンクするには？</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                      自分が投稿したお店（サービスカテゴリー）に関連するイベントがある場合、イベント投稿時にそのお店を選んでリンクできます。リンクすると、お店の詳細ページに「関連イベント」、イベントの詳細ページに「このイベントのお店」が、それぞれ画像付きで自動的に表示されます。
                    </p>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>先に、お店をサービスカテゴリーで投稿しておきます</li>
                      <li>イベントを新規投稿（または編集）する時、「関連するお店（任意）」という欄が表示されるので、自分が投稿したお店の中から選びます</li>
                      <li>投稿すると、お店とイベント、両方の詳細ページにお互いへのリンクが表示されます</li>
                    </ol>
                    <p className="text-sm text-gray-500">
                      ※「関連するお店」の欄は、自分がサービスカテゴリーでお店を投稿している場合のみ表示されます。他の人が投稿したお店は選べません。
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Help;
