import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const examples = [
  {
    title: '例1: 海外赴任を理由にした格安販売',
    body:
      '「会社の辞令で来月から海外赴任になり、急いで手放したい」として、相場よりかなり安い価格（新車同然のバイクを8,000 SEKなど）でバイクや家電を出品。連絡すると「配送業者に発送を頼むので、住所と前払いをお願いします」と言われる。',
    flags: [
      '（元）軍人・駐在員・宣教師など、確認しづらい「立場」を名乗る',
      '「急いでいる」ことを理由に判断を急がせる',
      '相場より明らかに安い価格',
      '直接会わず、発送のみで済ませようとする'
    ]
  },
  {
    title: '例2: 離婚・事情があるための格安販売＋偽の決済保護',
    body:
      '「離婚することになり、急いで車を手放したい」として格安で出品。「安全のため、有名な決済サービスの『買い手保護』を使いましょう」と、本物そっくりの偽サイトへのリンクを送ってくる。',
    flags: [
      '同情を誘う個人的な事情の説明',
      '実在するサービス名を騙った「安全な決済」の提案',
      'サイト内メッセージ以外の外部サイトでのやり取りへの誘導',
      '発送のみで、直接会うことを避けようとする'
    ]
  },
  {
    title: '例3: 海外からのベビーシッター・お手伝い依頼',
    body:
      '海外在住を名乗る相手から「子どものベビーシッターをお願いしたい。前払いで小切手（またはチェック風の書類）を送るので、一部を差し引いて残りを送金してほしい」という依頼が届く。',
    flags: [
      '感情に訴える詳しい身の上話',
      '依頼内容が曖昧なまま話が進む',
      '直接会えない距離であることを理由にする',
      '入金前に何らかの形で送金・返金を求められる'
    ]
  },
  {
    title: '例4: 過払い（オーバーペイメント）詐欺',
    body:
      '商品（例: 8,000 SEKの自転車）に対して「間違えて多く払ってしまった」として、実際より多い金額（例: 40,000 SEK）が振り込まれたように見せかけ、「差額をSwishまたは銀行振込で返金してほしい」と言われる。後になって、最初の入金自体が無効（不正な小切手・取消可能な送金など）だったことが判明する。',
    flags: [
      '実際の価格より明らかに多い金額を送ったと主張する',
      '差額の返金をSwishや銀行振込で急いで求める',
      '入金の「確認」を待たずに返金を急がせる',
      '個人番号（personnummer）や口座情報を追加で求めてくる'
    ]
  }
];

const ScamsEmailExamples = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams/identifying" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺を見分けるにはに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺メールの実例</h1>
        <p className="text-gray-600 mb-8">
          Sverige.JPのメッセージ機能や問い合わせメールを通じて報告された詐欺の典型的なパターンを、
          わかりやすく再構成してご紹介します。似たようなメールを受け取った場合は、返信せず、
          <Link to="/scams/reporting" className="text-blue-600 hover:underline">こちらの手順</Link>
          でご報告ください。
        </p>

        <div className="space-y-6">
          {examples.map((example) => (
            <Card key={example.title}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
                  {example.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4 bg-gray-50 border rounded-md p-4">
                  {example.body}
                </p>
                <p className="flex items-center font-medium text-gray-900 mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                  危険信号
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {example.flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsEmailExamples;
