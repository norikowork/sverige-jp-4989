import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import auth from '@/lib/shared/kliv-auth';
import db from '@/lib/shared/kliv-database';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  defaultTab?: string;
}

const translateAuthError = (message: string | undefined, fallback: string): string => {
  const msg = message || '';

  if (msg.includes('bad_credentials') || msg.includes('not recognized')) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }
  if (msg.includes('user_inactive') || msg.includes('organization_disabled')) {
    return 'このアカウントは利用停止中です。運営にお問い合わせください。';
  }
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
    return 'このメールアドレスは既に登録されています。ログインするか、パスワードをお忘れの場合は再設定をご利用ください。';
  }
  if (msg.includes('email_rate_limit_exceeded') || msg.includes('rate_limit')) {
    return 'リクエストの回数が多すぎます。しばらくしてから再度お試しください。';
  }
  if (msg.includes('password_too_short') || msg.includes('insufficient_password_complexity')) {
    return 'パスワードの強度が不十分です。8文字以上でより複雑なパスワードを設定してください。';
  }
  if (msg.includes('invalid_email') || msg.includes('email_address_invalid')) {
    return 'メールアドレスの形式が正しくありません。';
  }
  if (msg.includes('Network') || msg.includes('network')) {
    return '通信エラーが発生しました。ネットワーク状況を確認して再度お試しください。';
  }

  return fallback;
};

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, defaultTab }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();

  const ensureProfileExists = async (user: any) => {
    try {
      console.log('🔍 プロフィール存在チェック開始:', user.userUuid);
      
      const existingProfile = await db.query('user_profiles', {
        user_uuid: `eq.${user.userUuid}`,
        _deleted: 'eq.0'
      });
      
      console.log('👤 既存プロフィール数:', existingProfile.length);
      
      if (existingProfile.length === 0) {
        // user_profiles は誰でも読めるため、メールアドレスは入れない(表示名にも使わない)
        // KlivUser に name は無く firstName / lastName に入るため、結合して表示名にする
        const userDisplayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        
        console.log('➕ 新規プロフィール作成:', user.userUuid);
        
        await db.insert('user_profiles', {
          user_uuid: user.userUuid,
          display_name: userDisplayName
        });
        
        console.log('✅ 新規プロフィール作成完了:', user.userUuid);
      } else {
        console.log('✅ 既存プロフィール発見:', existingProfile[0]._row_id);
      }

      // メールアドレスは本人と管理者だけが読める member_contacts に保存する(1会員1行)
      if (user.email) {
        const contacts = await db.query('member_contacts', { _created_by: `eq.${user.userUuid}` });
        if (contacts.length === 0) {
          await db.insert('member_contacts', { email: user.email });
        } else if (contacts[0].email !== user.email) {
          await db.update('member_contacts', { _row_id: `eq.${contacts[0]._row_id}` }, { email: user.email });
        }
      }
      
      console.log('🎉 プロフィール処理完了:', user.userUuid);
      
    } catch (err) {
      console.error('❌ Profile ensure error:', err);
      throw err; // 呼び出し元でキャッチできるように再スロー
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsEmailNotVerified(false);
    setResendSuccess(false);

    try {
      console.log('🔐 ログイン開始:', loginEmail);
      
      // ステップ1: ログイン
      // auth.signIn() は { status, user } の入れ物を返す:
      //   - status: 'authenticated' → user にログインユーザー情報が入る
      //   - status: 'totp_required' → 認証アプリの2段階認証が必要(この時点ではセッション未発行)
      let user;
      try {
        const result = await auth.signIn(loginEmail, loginPassword);

        if (result.status === 'totp_required') {
          // 2段階認証コードの入力画面に切り替える(メールアドレスとパスワードは入力済みの値を再利用)
          console.log('🔐 2段階認証が必要[signIn]:', loginEmail);
          setTotpRequired(true);
          setTotpCode('');
          setIsLoading(false);
          return;
        }

        user = result.user;
        console.log('✅ ログイン成功[signIn]:', user.userUuid);
      } catch (signInErr: any) {
        console.error('❌ ログインエラー[signIn]:', signInErr);
        setError(translateAuthError(signInErr.message, 'ログインに失敗しました。しばらくしてから再度お試しください。'));
        setIsLoading(false);
        return;
      }

      // サインイン後の共通処理(セッション確認〜プロフィール作成〜ログイン完了)に合流
      await completeLogin(user);

    } catch (unexpectedErr: any) {
      console.error('❌ 予期しないエラー[unexpected]:', unexpectedErr);
      setError(`予期しないエラー: ${unexpectedErr.message || '不明なエラーが発生しました'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2段階認証コードの送信(signIn が totp_required を返した後に、認証コードでログインを完了する)
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user;
      // 認証アプリの6桁コード or リカバリーコードのどちらかでサインインを完了する
      const wrongCodeMessage = useRecoveryCode
        ? 'リカバリーコードが正しくないか、既に使用済みです。もう一度ご確認ください。'
        : '認証コードが正しくありません。認証アプリに表示されている6桁のコードを確認して、もう一度お試しください。';
      try {
        const result = useRecoveryCode
          ? await auth.submitRecoveryCode(loginEmail, loginPassword, recoveryCode.trim())
          : await auth.submitTotp(loginEmail, loginPassword, totpCode);

        if (result.status === 'totp_required' || !result.user) {
          console.error('❌ 2段階認証コード不正[submit2FA]:', loginEmail);
          setError(wrongCodeMessage);
          setIsLoading(false);
          return;
        }

        user = result.user;
        console.log('✅ 2段階認証ログイン成功[submit2FA]:', user.userUuid);
      } catch (totpErr: any) {
        console.error('❌ 2段階認証エラー[submit2FA]:', totpErr);
        const msg = `${totpErr?.message || ''} ${totpErr?.code || ''}`;
        if (msg.includes('rate_limit')) {
          setError('試行回数が多すぎます。しばらくしてから再度お試しください。');
        } else {
          setError(wrongCodeMessage);
        }
        setIsLoading(false);
        return;
      }

      setTotpRequired(false);
      await completeLogin(user);

    } catch (unexpectedErr: any) {
      console.error('❌ 予期しないエラー[totp]:', unexpectedErr);
      setError(`予期しないエラー: ${unexpectedErr.message || '不明なエラーが発生しました'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2段階認証コード入力から通常のログインフォームに戻る
  const handleCancelTotp = () => {
    setTotpRequired(false);
    setTotpCode('');
    setUseRecoveryCode(false);
    setRecoveryCode('');
    setError('');
  };

  // サインイン成功後の共通処理(パスワードログイン・2段階認証ログインの両方から呼ばれる)
  const completeLogin = async (user: any) => {
      // ステップ2: セッション確認 + emailVerifiedチェック（メール確認済みかどうか）
      // auth.getUser() はサインイン直後はキャッシュを返して通信しないため、
      // forceRefresh(true) で必ずサーバーにセッションを確認する。
      // セッションが確立していなければ、このまま続けると未ログイン状態での
      // DB書き込み(匿名リクエストによる403)が発生するため、ここで中断する。
      let emailVerified: boolean | undefined;
      try {
        const refreshedUser = await auth.getUser(true);
        if (!refreshedUser) {
          console.error('⚠️ セッション確認失敗[getUser]:', loginEmail);
          setError('ログインは受理されましたが、セッションの確認に失敗しました。Cookieの設定が有効になっているかご確認のうえ、再度お試しください。');
          setIsLoading(false);
          return;
        }
        emailVerified = refreshedUser.emailVerified;
        console.log('📧 サーバー確認済みセッション[emailVerified]:', user.userUuid, emailVerified);
        
        if (emailVerified === false) {
          console.log('🚫 emailVerifiedがfalseのため、サインアウト[emailVerified]:', user.userUuid);
          
          // サインアウト
          try {
            await auth.signOut();
            console.log('🚪 未承認によりサインアウト[signOut]:', user.userUuid);
          } catch (signOutErr: any) {
            console.error('⚠️ サインアウトエラー[signOut]:', signOutErr);
          }
          
          // 未承認ユーザー専用のUIを表示
          setIsEmailNotVerified(true);
          setIsLoading(false);
          return;
        }
        
        console.log('✅ emailVerifiedがtrue[emailVerified]:', user.userUuid);
        
      } catch (emailVerifiedErr: any) {
        console.error('⚠️ セッション確認エラー[getUser]:', emailVerifiedErr);
        // セッションが確認できないまま続けると未ログイン状態でのDB書き込みが発生するため中断する
        setError('ログインは受理されましたが、セッションの確認に失敗しました。再度お試しください。');
        setIsLoading(false);
        return;
      }
      
      // ステップ3: プロフィール確実に作成（onAuthSuccessの前に実行）
      try {
        console.log('👤 プロフィール作成開始[ensureProfileExists]:', user.userUuid);
        await ensureProfileExists(user);
        console.log('✅ プロフィール作成完了[ensureProfileExists]:', user.userUuid);
      } catch (profileErr: any) {
        console.error('⚠️ プロフィール作成エラー[ensureProfileExists]:', profileErr);
        // プロフィール作成が失敗してもログインは続行（ベストエフォート）
      }
      
      // ブロック・無効化されたアカウントは Kliv がサインイン自体を拒否する(管理画面の操作で enabled=false になる)
      
      // ステップ4: onAuthSuccessを呼ぶ（エラーになってもログインは成立）
      try {
        console.log('🎉 onAuthSuccess呼び出し[onAuthSuccess]:', user.userUuid);
        onAuthSuccess(user);
        console.log('✅ onAuthSuccess完了[onAuthSuccess]:', user.userUuid);
      } catch (authSuccessErr: any) {
        console.error('⚠️ onAuthSuccessエラー[onAuthSuccess]:', authSuccessErr);
        // onAuthSuccessがエラーでもログインは成立（UI更新が失敗しただけ）
      }
      
      // ステップ5: ダイアログを閉じる
      try {
        onClose();
        console.log('🚪 ダイアログクローズ[onClose]');
      } catch (closeErr: any) {
        console.error('⚠️ ダイアログクローズエラー[onClose]:', closeErr);
      }
      
      // ステップ6: トースト表示（エラーになっても無視）
      try {
        toast({
          title: "ログイン成功",
          description: "ようこそ！",
        });
        console.log('🔔 トースト表示[toast]');
      } catch (toastErr: any) {
        console.error('⚠️ トースト表示エラー[toast]:', toastErr);
      }
      
      console.log('🎉 ログインフロー完了:', user.userUuid);
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRegistrationSuccess(false);

    try {
      console.log('📝 新規登録開始:', registerEmail);

      // ブロックされたアカウントは Kliv 側に残っているため、同じメールアドレスでは再登録できない

      // ステップ0.5: 表示名(ニックネーム)の重複確認
      const trimmedRegisterName = registerName.trim();
      try {
        const sameNameProfiles = await db.query('user_profiles', {
          display_name: `eq.${trimmedRegisterName}`,
          _deleted: 'eq.0'
        });
        if (sameNameProfiles && sameNameProfiles.length > 0) {
          setError('この表示名（ニックネーム）は既に使用されています。別の表示名を入力してください。');
          setIsLoading(false);
          return;
        }
      } catch (nameCheckErr: any) {
        console.error('⚠️ 表示名重複確認エラー[user_profiles]:', nameCheckErr);
        // 重複確認自体が失敗しても登録処理は続行する
      }

      // ステップ1: アカウント作成（自動サインインされる）
      const user = await auth.signUp(registerEmail, registerPassword, trimmedRegisterName);
      console.log('✅ アカウント作成成功[signUp]:', user.userUuid, 'emailVerified:', user.emailVerified);
      // 確認メールは signUp が送る。ここで再送すると、届いたメールのリンクが無効になる。
      
      // ステップ3: サインアウト（未承認ユーザーをサイトに入れないようにする）
      try {
        console.log('🚪 サインアウト実行[signOut]:', user.userUuid);
        await auth.signOut();
        console.log('✅ サインアウト成功[signOut]:', user.userUuid);
      } catch (signOutError: any) {
        console.error('⚠️ サインアウトエラー[signOut]:', signOutError);
        // サインアウトが失敗しても続行
      }
      
      // ステップ4: 登録成功メッセージを表示
      setRegistrationSuccess(true);
      console.log('🎉 新規登録完了: 登録成功メッセージ表示');
      
    } catch (err: any) {
      console.error('❌ 新規登録エラー[signUp]:', err);
      setError(translateAuthError(err.message, '登録に失敗しました。しばらくしてから再度お試しください。'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await auth.requestPasswordReset(resetEmail);
      setResetStep(2);
      toast({
        title: "リセットコード送信",
        description: "メールにリセットコードを送信しました。",
        className: "bg-yellow-50 border-yellow-200 text-yellow-900",
      });
    } catch (err: any) {
      console.error('Password reset request error:', err);
      
      // エラーメッセージをわかりやすく整形
      let errorMessage = err.message || 'リセットコードの送信に失敗しました';
      
      if (errorMessage.includes('email_template_not_configured')) {
        errorMessage = 'メールテンプレートが設定されていません。管理者にお問い合わせください。';
      } else if (errorMessage.includes('email_rate_limit_exceeded')) {
        errorMessage = 'メール送信回数の上限を超えました。しばらくしてから再度お試しください。';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    try {
      // 認証SDKでパスワードリセット完了
      await auth.completePasswordReset(resetCode, newPassword);
      
      toast({
        title: "パスワードリセット完了",
        description: "新しいパスワードが設定されました。ログインしてください。",
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      handleClose();
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // エラーメッセージをわかりやすく整形
      let errorMessage = err.message || 'パスワードのリセットに失敗しました';
      
      if (errorMessage.includes('invalid_token')) {
        errorMessage = 'リセットコードが無効です。有効期限が切れている可能性があります。再度リセットをリクエストしてください。';
      } else if (errorMessage.includes('password_too_short')) {
        errorMessage = 'パスワードが短すぎます。最低8文字以上で入力してください。';
      } else if (errorMessage.includes('insufficient_password_complexity')) {
        errorMessage = 'パスワードが脆弱です。より複雑なパスワードを設定してください。';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterName('');
    setIsResetPassword(false);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetStep(1);
    setTotpRequired(false);
    setTotpCode('');
    setUseRecoveryCode(false);
    setRecoveryCode('');
    setError('');
    setIsEmailNotVerified(false);
    setResendSuccess(false);
    setRegistrationSuccess(false);
    onClose();
  };
  
  const handleResendActivationEmail = async () => {
    setIsResendingEmail(true);
    setResendSuccess(false);
    
    try {
      console.log('📧 確認メール再送開始[resendActivation]:', loginEmail);
      await auth.resendActivation(loginEmail);
      console.log('✅ 確認メール再送成功[resendActivation]:', loginEmail);
      
      setResendSuccess(true);
      
      toast({
        title: "確認メールを再送しました",
        description: "メールをご確認ください（迷惑メールフォルダもご確認ください）",
      });
    } catch (resendErr: any) {
      console.error('❌ 確認メール再送エラー[resendActivation]:', resendErr);
      toast({
        title: "確認メールの再送に失敗しました",
        description: resendErr.message || "もう一度お試しください",
        variant: "destructive"
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>アカウント</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab || 'login'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="register">新規登録</TabsTrigger>
          </TabsList>

          {/* Googleログインが正常に動作していないため、直るまで一旦非表示にしています */}
          {false && !totpRequired && !isResetPassword && (
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  try {
                    sessionStorage.setItem(GOOGLE_FLAG, '1');
                    auth.signInWithOAuth('google', {
                      returnTo: window.location.pathname + window.location.search,
                    }).catch((err: any) => {
                      sessionStorage.removeItem(GOOGLE_FLAG);
                      setError('Googleログインを開始できませんでした。' + (err?.message || ''));
                    });
                  } catch (err: any) {
                    setError('Googleログインを開始できませんでした。');
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
                  <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
                </svg>
                Googleでログイン
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                またはメールアドレスで
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}
          
          <TabsContent value="login">
            {totpRequired ? (
              <form onSubmit={handleTotpSubmit} className="space-y-4">
                <div className="flex items-center mb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelTotp}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    戻る
                  </Button>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">2段階認証</h3>
                  <p className="text-sm text-gray-600">
                    {loginEmail} に設定された認証アプリに表示されている6桁のコードを入力してください
                  </p>
                </div>
                {!useRecoveryCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="totp-code">認証コード</Label>
                    <Input
                      id="totp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      autoFocus
                      className="text-center text-lg tracking-[0.3em] font-mono"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="recovery-code">リカバリーコード</Label>
                    <Input
                      id="recovery-code"
                      type="text"
                      autoComplete="off"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="xxxxx-xxxxx"
                      required
                      autoFocus
                      className="text-center font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      2段階認証を設定した際に表示された10個のコードのいずれかを入力してください(各コード1回のみ使用可)
                    </p>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || (!useRecoveryCode ? totpCode.length !== 6 : recoveryCode.trim().length < 6)}
                >
                  {isLoading ? '確認中...' : '認証してログイン'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm"
                  onClick={() => {
                    setUseRecoveryCode(!useRecoveryCode);
                    setError('');
                  }}
                >
                  {useRecoveryCode ? '認証コード入力に戻る' : '認証アプリを紛失した場合はリカバリーコードでログイン'}
                </Button>
              </form>
            ) : isResetPassword ? (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsResetPassword(false);
                      setResetStep(1);
                      setError('');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    戻る
                  </Button>
                </div>

                {resetStep === 1 ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">パスワードリセット</h3>
                      <p className="text-sm text-gray-600">
                        メールアドレスを入力してリセットコードを受け取ってください
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">メールアドレス</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? '送信中...' : 'リセットコードを送信'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">新しいパスワードを設定</h3>
                      <p className="text-sm text-gray-600">
                        {resetEmail} に送信されたリセットコードを入力してください
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-code">リセットコード</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="メールに記載されたコード"
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">新しいパスワード</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="最低8文字"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">パスワードの確認</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="もう一度入力"
                        required
                        minLength={8}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? '更新中...' : 'パスワードをリセット'}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">メールアドレス</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">パスワード</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {isEmailNotVerified && (
                  <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-900">
                    <AlertDescription>
                      <div className="space-y-3">
                        <p className="font-semibold">ユーザー登録は完了していますが、まだメール確認が済んでいません。</p>
                        <p className="text-sm">登録時に送られた確認メールのリンクをクリックして承認してください。承認後にログインできます。</p>
                        
                        {!resendSuccess ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendActivationEmail}
                            disabled={isResendingEmail}
                            className="w-full"
                          >
                            {isResendingEmail ? '送信中...' : '確認メールを再送する'}
                          </Button>
                        ) : (
                          <div className="text-sm font-semibold text-green-700">
                            ✓ 確認メールを再送しました。メールをご確認ください（迷惑メールフォルダもご確認ください）
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0 h-auto text-sm"
                  onClick={() => {
                    setIsResetPassword(true);
                    setResetEmail(loginEmail);
                    setError('');
                  }}
                >
                  パスワードをお忘れですか？
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>
              </form>
            )}
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">表示名（ニックネーム）</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">メールアドレス</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">パスワード</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登録中...' : '登録'}
              </Button>
            </form>
              {registrationSuccess && (
                <Alert className="bg-green-50 border-green-200 text-green-900">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">ご登録ありがとうございます。</p>
                      <p className="text-sm">確認メールをお送りしました。メール内のリンクをクリックして承認した後、ログインしてください。</p>
                      <p className="text-xs">メールが見当たらない場合は迷惑メールフォルダもご確認ください</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
