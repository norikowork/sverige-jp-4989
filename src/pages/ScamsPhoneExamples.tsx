import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

const examples = [
  {
    title: '例1: アカウント確認を装うSMS',
    body:
      '「あなたのアカウントが不正利用として報告されました。本人確認のため、このメールアドレスに返信してください。対応がない場合、アカウントは永久に削除されます」という内容のSMSやメールが届く。',
    flags: [
      'Sverige.JPは登録済みのメールアドレスをすでに把握しており、SMSでの再確認を求めることはありません',
      '「削除される」など、恐怖・焦りをあおる文言で即座の対応を迫る',
      '本文中のリンクや電話番号からの「確認」を求める'
    ]
  },
  {
    title: '例2（スウェーデン特有）: BankIDを装ったフィッシングSMS',
    body:
      '「セキュリティのため、下記リンクからBankIDで本人確認を行ってください」「口座に不審なアクセスがありました。今すぐBankIDアプリで承認してください」といったSMSが、銀行やSverige.JP、配送業者などを装って届く。リンク先は本物そっくりの偽サイト。',
    flags: [
      'BankIDでの認証や確認コードを、SMS・電話・メールで求めることは、銀行・警察・Sverige.JPを含め、正規の組織は絶対に行いません',
      '「今すぐ」「24時間以内に」など緊急性を強調する',
      'SMS内のリンクから直接ログイン・認証させようとする'
    ]
  }
];

const ScamsPhoneExamples = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/scams/identifying" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          詐欺を見分けるにはに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詐欺電話・SMSの実例</h1>
        <p className="text-gray-600 mb-8">
          電話やSMSを使った詐欺の典型的なパターンをご紹介します。特にスウェーデンではBankIDを狙った
          フィッシングSMS（いわゆる「スミッシング」）が多く報告されています。
        </p>

        <div className="space-y-6 mb-6">
          {examples.map((example) => (
            <Card key={example.title}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
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

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-green-900">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
              対処のしかた
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-green-900">
              <li>怪しいSMS・電話には返信・折り返しをしない</li>
              <li>お使いの携帯電話の迷惑メッセージ報告機能で報告する</li>
              <li>アカウントの状態を確認したい場合は、メッセージ内のリンクではなく、Sverige.JPに直接アクセスしてログインする</li>
              <li>
                不安な場合は
                <Link to="/scams/reporting" className="text-green-800 underline">こちらのページ</Link>
                の連絡先にご相談ください
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ScamsPhoneExamples;
