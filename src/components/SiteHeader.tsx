import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import AuthModal from '@/components/AuthModal';
import WorldClock from '@/components/WorldClock';
import auth from '@/lib/shared/kliv-auth';
import db from '@/lib/shared/kliv-database';
import { checkIsAdmin } from '@/lib/isAdmin';
import { useToast } from '@/hooks/use-toast';

const FORUM_NOTICE_KEY = 'sverige_jp_forum_notice_shown';

const SiteHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getUser();
        setUser(currentUser);
        if (currentUser) {
          const profiles = await db.query('user_profiles', {
            user_uuid: `eq.${currentUser.userUuid}`
          });
          if (profiles.length > 0) {
            setUserProfile(profiles[0]);
          }
        }
      } catch (error) {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin(user);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user && user.userUuid) {
        try {
          const unreadMessages = await db.query('messages', {
            to_uuid: `eq.${user.userUuid}`,
            is_read: 'eq.0',
            _deleted: 'eq.0'
          });

          // 自分が立てた掲示板トピックへの未読返信数も合算する
          let forumUnreadCount = 0;
          try {
            const ownTopics = await db.query('forum_topics', {
              _created_by: `eq.${user.userUuid}`
            });
            const ownTopicIds = new Set(ownTopics.map((t) => t._row_id));
            if (ownTopicIds.size > 0) {
              const unreadReplies = await db.query('forum_replies', {
                is_read: 'eq.0'
              });
              forumUnreadCount = unreadReplies.filter(
                (r) => ownTopicIds.has(r.topic_id) && r._created_by !== user.userUuid
              ).length;
            }
          } catch (error) {
            console.error('Error loading forum unread count:', error);
          }

          setUnreadCount(unreadMessages.length + forumUnreadCount);

          // ログインしているセッション中に一度だけ、掲示板の新着返信をお知らせする
          if (forumUnreadCount > 0 && !sessionStorage.getItem(FORUM_NOTICE_KEY)) {
            toast({
              title: "掲示板に新しい返信があります",
              description: `あなたが投稿したトピックに${forumUnreadCount}件の新しい返信があります。`,
            });
            sessionStorage.setItem(FORUM_NOTICE_KEY, 'true');
          }
        } catch (error) {
          console.error('Error loading unread count:', error);
        }
      } else {
        setUnreadCount(0);
      }
    };
    loadUnreadCount();
  }, [user]);

  const handleAuthSuccess = async (authUser: any) => {
    setUser(authUser);
    if (authUser) {
      try {
        const profiles = await db.query('user_profiles', {
          user_uuid: `eq.${authUser.userUuid}`
        });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src="/content/templates/sverigejplogo.png"
                alt="Sverige.JP Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0"
                style={{ width: '48px', height: '48px' }}
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Sverige.JP</h1>
                <h1 className="text-base font-bold text-gray-900 sm:hidden">Sverige.JP</h1>
                <p className="text-xs text-gray-600 hidden md:block">スウェーデン日本コミュニティ</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <WorldClock />
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" className="h-8 text-xs px-2 sm:px-3 relative" onClick={() => navigate('/messages')}>
                    <Mail className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 h-8 px-2 rounded-md hover:bg-gray-100 transition-colors">
                        {userProfile?.profile_photo_url ? (
                          <img
                            src={userProfile.profile_photo_url}
                            alt="プロフィール画像"
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400 bg-gray-100 rounded-full p-1 flex-shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-[150px]">
                          {userProfile?.display_name || user.display_name || user.firstName || user.email?.split('@')[0]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/profile')}>プロフィール</DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>管理画面</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleSignOut}>
                    ログアウト
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsAuthModalOpen(true)}>
                    ログイン
                  </Button>
                  <Button size="sm" className="h-8 text-xs px-2" onClick={() => setIsAuthModalOpen(true)}>
                    新規登録
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default SiteHeader;
