import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthModal from '@/components/AuthModal';
import auth from '@/lib/shared/kliv-auth';
import db from '@/lib/shared/kliv-database';
import { checkIsAdmin } from '@/lib/isAdmin';

const SiteHeader = () => {
  const navigate = useNavigate();
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
          setUnreadCount(unreadMessages.length);
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
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-[150px]">
                    {userProfile?.display_name || user.display_name || user.firstName || user.email?.split('@')[0]}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs px-2 sm:px-3" onClick={() => navigate('/profile')}>
                    <span className="hidden sm:inline">プロフィール</span>
                    <span className="sm:hidden">プロフ</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs px-2 sm:px-3 relative" onClick={() => navigate('/messages')}>
                    <Mail className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate('/admin')}>
                      <Shield className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleSignOut}>
                    <span className="hidden sm:inline">ログアウト</span>
                    <span className="sm:hidden">ログアウト</span>
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
