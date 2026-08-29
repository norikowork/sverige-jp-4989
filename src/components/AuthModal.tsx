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
        // 新規作成：user_uuid, email, display_name, role: 'user', is_blocked: 0, phone: ''
        const userEmail = user.email || '';
        // KlivUser に name は無く firstName / lastName に入るため、結合して表示名にする
        const userDisplayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || '';
        
        console.log('➕ 新規プロフィール作成:', {
          user_uuid: user.userUuid,
          email: userEmail,
          display_name: userDisplayName
        });
        
        await db.insert('user_profiles', {
          user_uuid: user.userUuid,
          email: userEmail,
          display_name: userDisplayName,
          role: 'user',
          is_blocked: 0,
          phone: ''
        });
        
        console.log('✅ 新規プロフィール作成完了:', user.userUuid);
      } else {
        // 既存のプロフィールがある場合
        const profile = existingProfile[0];
        console.log('✅ 既存プロフィール発見:', profile._row_id);
        
        // emailが空または未設定の場合のみ、emailを更新（他の項目は変更しない）
        if (!profile.email || profile.email === '') {
          const userEmail = user.email || '';
          console.log('📧 email更新:', profile._row_id, userEmail);
          
          await db.update('user_profiles', { 
            _row_id: `eq.${profile._row_id}` 
          }, { 
            email: userEmail 
          });
          
          console.log('✅ email更新完了:', profile._row_id);
        }
        
        // roleやis_blockedは既存値を維持（上書きしない）
        console.log('ℹ️ 既存プロフィール維持:', {
          role: profile.role,
          is_blocked: profile.is_blocked
        });
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
      
      // ステップ4: ブロック・無効化チェック（プロフィール作成後なので必ず存在するはず）
      let isBlocked = false;
      let isInactive = false;
      try {
        const profiles = await db.query('user_profiles', {
          user_uuid: `eq.${user.userUuid}`,
          _deleted: 'eq.0'
        });
        
        const profile = profiles[0];
        if (profile && profile.is_blocked === 1) {
          console.log('🚫 アカウントブロック済み[isBlocked]:', user.userUuid);
          isBlocked = true;
        }
        
        if (profile && profile.is_active === 0) {
          console.log('🚫 アカウント無効化済み[isInactive]:', user.userUuid);
          isInactive = true;
        }
      } catch (blockCheckErr: any) {
        console.error('⚠️ ステータスチェックエラー[statusCheck]:', blockCheckErr);
        // ステータスチェックが失敗してもログインは続行
      }
      
      // ステップ5: 無効化されている場合はサインアウト
      if (isInactive) {
        try {
          await auth.signOut();
          console.log('🚪 無効化によりサインアウト[signOut]:', user.userUuid);
        } catch (signOutErr: any) {
          console.error('⚠️ サインアウトエラー[signOut]:', signOutErr);
        }
        setError('このアカウントは無効化されています。運営にお問い合わせください。');
        setIsLoading(false);
        return;
      }
      
      // ステップ6: ブロックされている場合はサインアウト
      if (isBlocked) {
        try {
          await auth.signOut();
          console.log('🚪 ブロックによりサインアウト[signOut]:', user.userUuid);
        } catch (signOutErr: any) {
          console.error('⚠️ サインアウトエラー[signOut]:', signOutErr);
        }
        setError('このアカウントは利用停止中です。運営にお問い合わせください。');
        setIsLoading(false);
        return;
      }
      
      // ステップ7: onAuthSuccessを呼ぶ（エラーになってもログインは成立）
      try {
        console.log('🎉 onAuthSuccess呼び出し[onAuthSuccess]:', user.userUuid);
        onAuthSuccess(user);
        console.log('✅ onAuthSuccess完了[onAuthSuccess]:', user.userUuid);
      } catch (authSuccessErr: any) {
        console.error('⚠️ onAuthSuccessエラー[onAuthSuccess]:', authSuccessErr);
        // onAuthSuccessがエラーでもログインは成立（UI更新が失敗しただけ）
      }
      
      // ステップ8: ダイアログを閉じる
      try {
        onClose();
        console.log('🚪 ダイアログクローズ[onClose]');
      } catch (closeErr: any) {
        console.error('⚠️ ダイアログクローズエラー[onClose]:', closeErr);
      }
      
      // ステップ9: トースト表示（エラーになっても無視）
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
      
      // ステップ1: アカウント作成（自動サインインされる）
      const user = await auth.signUp(registerEmail, registerPassword, registerName);
      console.log('✅ アカウント作成成功[signUp]:', user.userUuid, 'emailVerified:', user.emailVerified);
      
      // ステップ2: 確認メール送信
      try {
        console.log('📧 確認メール送信開始[resendActivation]:', registerEmail);
        await auth.resendActivation(registerEmail);
        console.log('✅ 確認メール送信成功[resendActivation]:', registerEmail);
      } catch (emailError: any) {
        console.error('⚠️ 確認メール送信エラー[resendActivation]:', emailError);
        // 確認メール送信が失敗しても、アカウント作成自体は成功したので続行
        // エラーログのみ記録（ユーザーには通知しない）
      }
      
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
                <Label htmlFor="register-name">お名前</Label>
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
