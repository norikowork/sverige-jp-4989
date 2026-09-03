import { Link } from 'react-router-dom';
import { ArrowLeft, Users, ShieldAlert, Mail, Phone, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';

const Safety = () => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">安全にご利用いただくために</h1>
        <p className="text-gray-600 mb-8">
          本サービスの利用者の多くは誠実な方々ですが、インターネット上のやり取りには
          一定の注意が必要です。以下のポイントを参考に、安全にご利用ください。
        </p>

        {/* 対面での取引 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              対面での取引について
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li>待ち合わせは、警察署の前やショッピングセンターなど、人目のある公共の場所を選びましょう。</li>
              <li>できれば一人ではなく、友人・家族と一緒に、または明るい時間帯に会うようにしましょう。</li>
              <li>誰と、いつ、どこで会うかを、事前に信頼できる人に伝えておきましょう。</li>
              <li>支払いの前に、商品の状態を必ず自分の目で確認しましょう（電化製品は動作確認を）。</li>
              <li>少しでも不安や違和感を覚えたら、その場を離れる・取引を中止する判断を優先してください。</li>
              <li>自宅の住所を直接伝えるのは避け、詳細住所を投稿にも表示しないようにしましょう（投稿フォームの「詳細住所を表示する」はオプションです）。</li>
            </ul>
          </CardContent>
        </Card>

        {/* 詐欺にご注意ください */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldAlert className="w-6 h-6 mr-2 text-red-600" />
              詐欺にご注意ください
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">よくある詐欺の手口には、次のようなものがあります。</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
              <li><span className="font-medium">前払い・海外送金の要求：</span>会う前に銀行振込や送金アプリでの前払いを求められた場合は要注意です。</li>
              <li><span className="font-medium">過払い（オーバーペイメント）：</span>約束した金額より多く支払われ、「差額を返金してほしい」と言われるケース。後で元の支払い自体が無効（不渡り等）になることがあります。</li>
              <li><span className="font-medium">海外・代理人を名乗る取引：</span>「今は海外にいる」「代理人に受け取らせる」など、直接会えない理由をつけて発送や送金を急がせる相手には注意しましょう。</li>
              <li><span className="font-medium">住居・賃貸の詐欺：</span>内見前の入金要求、相場より極端に安い家賃、鍵の受け渡しを郵送で済ませようとする話は危険信号です。</li>
              <li><span className="font-medium">求人詐欺：</span>採用前に研修費・登録料の支払いを求める、個人番号（personnummer）や銀行口座情報を早い段階で要求する求人には注意してください。</li>
              <li><span className="font-medium">「うますぎる話」：</span>相場より大幅に安い、条件が良すぎる投稿は詐欺の可能性を疑いましょう。</li>
            </ul>
            <p className="text-gray-700 mt-3">
              個人番号（personnummer）、クレジットカード情報、ワンタイムパスワードなどを
              見知らぬ相手に伝えないでください。取引は、実際に会って商品を確認した後の
              現金または銀行振込を基本にすることをおすすめします。
            </p>
          </CardContent>
        </Card>

        {/* 迷惑行為への対処 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Flag className="w-6 h-6 mr-2 text-orange-600" />
              迷惑行為への対処
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="flex items-center font-semibold text-gray-900 mb-2">
                <Mail className="w-5 h-5 mr-2 text-gray-500" />
                メールによる迷惑行為
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>しつこい連絡や不快なメールが届いても、返信はせず、内容を保存（スクリーンショット等）しておきましょう。</li>
                <li>プロフィールの「連絡の受け取り方」で「メールを隠す」を選ぶと、相手にメールアドレスが伝わらず、サイト内メッセージのみでのやり取りになります。すでに連絡先を知られてしまった場合も、今後の投稿では設定を見直すことをおすすめします。</li>
                <li>迷惑行為が続く場合は、該当のやり取り・投稿を添えて<a href="mailto:support@sverige.jp" className="text-blue-600 hover:underline">support@sverige.jp</a>までご連絡ください。運営がアカウントの利用停止を検討します。</li>
              </ul>
            </div>

            <div>
              <h3 className="flex items-center font-semibold text-gray-900 mb-2">
                <Phone className="w-5 h-5 mr-2 text-gray-500" />
                電話による迷惑行為
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>電話番号は、本当に信頼できると判断するまでは伝えないようにしましょう。連絡方法は「メール」または「サイト内メッセージ」を優先することをおすすめします。</li>
                <li>迷惑電話・迷惑SMSを受けた場合は、お使いの電話の着信拒否設定でその番号をブロックし、日時と内容を記録しておきましょう。</li>
                <li>脅迫的な内容や繰り返しの迷惑行為がある場合は、<a href="mailto:support@sverige.jp" className="text-blue-600 hover:underline">support@sverige.jp</a>までご連絡ください。身の危険を感じる場合は、下記の警察への通報も検討してください。</li>
              </ul>
            </div>

            <div>
              <h3 className="flex items-center font-semibold text-gray-900 mb-2">
                <Flag className="w-5 h-5 mr-2 text-gray-500" />
                詐欺の報告
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>詐欺と思われる投稿・ユーザーを見つけたら、投稿詳細ページの「⚠ スパムを報告」ボタンからご報告ください。管理者が内容を確認し、投稿の非表示やアカウントの利用停止などの対応を行います。</li>
                <li>すでに金銭的な被害を受けた、または身の危険を感じる場合は、本サービスへの報告に加えて、スウェーデン警察（Polisen）にもご相談ください。緊急時は112、緊急でない被害の届け出は114 14、またはpolisen.seのオンライン届け出をご利用いただけます。</li>
                <li>本サービスは利用者間の取引の当事者ではないため、金銭トラブルの解決や返金を仲介することはできません。少しでも不審に感じたら、支払い前に立ち止まって確認することが一番の防止策です。</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500">
          本ページの内容は一般的な注意喚起であり、すべての被害を防止できるものではありません。
          詳しい利用条件は<Link to="/terms" className="text-blue-600 hover:underline">利用規約</Link>、
          個人情報の取り扱いは<Link to="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
          をご覧ください。
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default Safety;
