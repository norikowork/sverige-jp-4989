import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, User, Mail, Phone, Send, Image as ImageIcon, MessageSquare, Home, Shield, ChevronLeft, ChevronRight, ChevronDown, Briefcase, Building, TrendingUp, Package, Share2, Link2, Linkedin, Facebook, AlertCircle, CheckCircle, Wrench, Clock, ShoppingBag, Star, Search, Plus, Truck, ExternalLink, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import WorldClock from '@/components/WorldClock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import SingleLocationMap from '@/components/SingleLocationMap';
import db from '@/lib/shared/kliv-database';
import auth from '@/lib/shared/kliv-auth';
import functions from '@/lib/shared/kliv-functions';
import content from '@/lib/shared/kliv-content';
import { checkIsAdmin } from '@/lib/isAdmin';
import { useToast } from '@/hooks/use-toast';
import { getMessageLimit } from '@/constants/plans';
import { resolveAuthorName } from '@/lib/utils/authorHelpers';
import { toAsciiFile } from '@/lib/asciiFilename';
import { compressImage, ABUSE_MAX_BYTES } from '@/lib/imageCompression';
import { SERVICE_SUBCATEGORY_GROUPS } from '@/constants/serviceSubcategories';

const BuyIcon = ({ className }: { className?: string }) => (
  <span className={className}>🛍️</span>
);

const JobIcon = ({ className }: { className?: string }) => (
  <span className={className}>🧳</span>
);

const HusIcon = ({ className }: { className?: string }) => (
  <img src="/content/templates/hus.png" alt="住居" className={`${className} object-contain scale-[1.4375]`} />
);

const EventIcon = ({ className }: { className?: string }) => (
  <span className={className}>📢</span>
);

const ServiceIcon = ({ className }: { className?: string }) => (
  <span className={className}>🈂️</span>
);

const BulletinIcon = ({ className }: { className?: string }) => (
  <span className={className}>📌</span>
);

const categoryIcons = {
  'cat-for-sale': BuyIcon,
  'cat-job-seeking': JobIcon,
  'cat-housing': HusIcon,
  'cat-events': EventIcon,
  'cat-services': ServiceIcon,
  'cat-bulletin': BulletinIcon
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [postPhotos, setPostPhotos] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [allPosts, setAllPosts] = useState([]);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const [contactMethod, setContactMethod] = useState('dm'); // 連絡方法: 'dm' または 'email'
  const [showMessageButton, setShowMessageButton] = useState(false); // メッセージを見るボタン表示用
  const [unreadCount, setUnreadCount] = useState(0);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [isSpamReportModalOpen, setIsSpamReportModalOpen] = useState(false);
  const [spamReason, setSpamReason] = useState('');
  const [isSubmittingSpam, setIsSubmittingSpam] = useState(false);
  const [spamReportError, setSpamReportError] = useState('');
  const [spamReportSuccess, setSpamReportSuccess] = useState('');

  const conditionLabels = {
    'new': '新品',
    'like_new': 'ほぼ新品',
    'excellent': '非常に良い',
    'good': '良い',
    'fair': '可',
    'junk': 'ジャンク'
  };

  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'like_new': 'bg-emerald-100 text-emerald-800',
    'excellent': 'bg-teal-100 text-teal-800',
    'good': 'bg-blue-100 text-blue-800',
    'fair': 'bg-yellow-100 text-yellow-800',
    'junk': 'bg-red-100 text-red-800'
  };

  const shippingMethodLabels = {
    'included': '送料込み',
    'buyer_pays': '送料買い手持ち',
    'meetup': '会って受け渡し'
  };

  const employmentTypeLabels = {
    'full-time': 'フルタイム',
    'part-time': 'パートタイム',
    'contract': 'コントラクト（契約）',
    'internship': 'インターン',
    'other': 'その他'
  };

  const experienceLevelLabels = {
    'entry': '初級',
    'mid': '中級',
    'senior': 'シニア',
    'any': '経験問わず'
  };

  // 価格表示を整形する（「無料」の場合はSEKを付けない、価格に既にSEKが
  // 含まれている場合は二重に付けない）
  const formatPrice = (price: string) => {
    if (price === '無料' || price === '0') {
      return '無料';
    }
    return /sek/i.test(price) ? price : `${price} SEK`;
  };

  const roomsLabels = {
    'studio': 'ワンルーム',
    '1k': '1K',
    '1dk': '1DK',
    '1ldk': '1LDK',
    '2k': '2K',
    '2dk': '2DK',
    '2ldk': '2LDK',
    '3k': '3K以上',
    'shared': 'シェアハウス'
  };

  const loadAllPosts = async () => {
    try {
      const postsData = await db.query('posts', {
        _deleted: 'eq.0',
        is_hidden: 'eq.0',
        status: 'neq.removed'
      }, { orderBy: '_created_at', orderDirection: 'desc' });
      setAllPosts(postsData || []);
    } catch (error) {
      console.error('Error loading all posts:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const locationsData = await db.query('locations', { _deleted: 'eq.0' });
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await db.query('categories', { _deleted: 'eq.0' });
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const subcategoriesData = await db.query('subcategories', { _deleted: 'eq.0' });
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadPost = async () => {
    try {
      const postsData = await db.query('posts', {
        _row_id: `eq.${postId}`,
        _deleted: 'eq.0',
        status: 'neq.removed'
      });

      if (postsData && postsData.length > 0) {
        const postData = postsData[0];

        // Get user profile information
        let userProfile = null;

        if (postData._created_by) {
          try {
            // First try to get user profile
            const profilesData = await db.query('user_profiles', {
              user_uuid: `eq.${postData._created_by}`,
              _deleted: 'eq.0'
            });

            if (profilesData && profilesData.length > 0) {
              userProfile = profilesData[0];

              console.log('👤 User profile found:', {
                user_uuid: postData._created_by,
                display_name: userProfile.display_name,
                contact_pref: userProfile.contact_pref
              });

              setUserProfiles(prev => ({
                ...prev,
                [postData._created_by]: {
                  ...userProfile,
                  contact_pref: userProfile.contact_pref || 'email'
                }
              }));
            } else {
              console.log('⚠️ User profile not found for:', postData._created_by);
            }
          } catch (e) {
            console.warn('Error fetching user profile for post:', postData._row_id, e);
          }
        }

        // 投稿者名を解決
        const userName = await resolveAuthorName(postData._created_by);

        // Parse images JSON for the post
        let images = [];
        if (postData.images) {
          try {
            if (typeof postData.images === 'string') {
              images = JSON.parse(postData.images);
            } else if (Array.isArray(postData.images)) {
              images = postData.images;
            }
            // Ensure images is an array
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            console.warn('Error parsing images:', e);
            images = [];
          }
        }

        const postWithImages = {
          ...postData,
          images,
          userName,
          userProfile
        };

        console.log('📄 Post loaded with user profile:', {
          postId: postWithImages._row_id,
          postTitle: postWithImages.title,
          createdBy: postWithImages._created_by,
          createdByType: typeof postWithImages._created_by,
          userName: postWithImages.userName,
          hasUserProfile: !!postWithImages.userProfile
        });

        console.log('👤 投稿作成者情報:', {
          _created_by: postData._created_by,
          _created_byType: typeof postData._created_by
        });

        setPost(postWithImages);

        // サービス投稿の場合、他のユーザーが投稿した写真も読み込む
        if (postData.post_type === 'service' || (postData.category_uuid || postData.category) === 'cat-services') {
          loadPostPhotos(postData._row_id);
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPostPhotos = async (postRowId: number) => {
    try {
      const photos = await db.query('post_photos', {
        post_id: `eq.${postRowId}`,
        order: '_created_at.asc'
      });
      setPostPhotos(photos || []);
    } catch (error) {
      console.error('Error loading post photos:', error);
    }
  };

  // サービス投稿に、ログイン中のユーザーが写真を投稿できるようにする
  // (投稿者本人の画像とあわせて最大5枚まで。それぞれ「〜さん投稿」として表示する)
  const handlePhotoContribution = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !post || !user) return;

    const totalPhotos = (post.images?.length || 0) + postPhotos.length;
    if (totalPhotos >= 5) {
      toast({ title: '画像は最大5枚までです', variant: 'destructive' });
      return;
    }

    if (file.size > ABUSE_MAX_BYTES) {
      toast({
        title: 'ファイルサイズが大きすぎます',
        description: `${file.name}は${(file.size / (1024 * 1024)).toFixed(1)}MBです。25MBまでのファイルをご利用ください。`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImage(file);
      const result = await content.uploadFile(toAsciiFile(compressed, 'post-photo'), '/content/uploads/');

      let imageUrl = null;
      if (result && result.contentUrl) {
        imageUrl = result.contentUrl;
      } else if (result && result.url) {
        imageUrl = result.url;
      } else if (result && result.fileUrl) {
        imageUrl = result.fileUrl;
      } else if (result && result.path) {
        imageUrl = result.path;
      } else if (result && typeof result === 'string') {
        imageUrl = result;
      } else if (result && result.data && result.data.contentUrl) {
        imageUrl = result.data.contentUrl;
      } else if (result && result.data && result.data.url) {
        imageUrl = result.data.url;
      } else if (result && result.data && result.data.path) {
        imageUrl = result.data.path;
      }

      if (!imageUrl) {
        throw new Error('アップロード結果からURLを取得できませんでした');
      }

      const uploaderName = await resolveAuthorName(user.userUuid);

      await db.insert('post_photos', {
        post_id: post._row_id,
        image_url: imageUrl,
        uploader_uuid: user.userUuid,
        uploader_name: uploaderName
      });

      toast({ title: '写真を投稿しました' });
      await loadPostPhotos(post._row_id);
    } catch (error: any) {
      console.error('Error uploading post photo:', error);
      toast({
        title: 'アップロードに失敗しました',
        description: error?.message || 'もう一度お試しください',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const currentUser = await auth.getUser();
      console.log('🔐 checkAuthStatus結果:', {
        currentUser: currentUser,
        userUuid: currentUser?.userUuid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified
      });
      setUser(currentUser);
      if (currentUser) {
        const profiles = await db.query('user_profiles', {
          user_uuid: `eq.${currentUser.userUuid}`
        });
        if (profiles.length > 0) {
          setCurrentUserProfile(profiles[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    loadPost();
    loadAllPosts();
    loadLocations();
    loadCategories();
    loadSubcategories();
    checkAuthStatus();
  }, [postId]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      console.log('👮 checkAdminが実行されました - user:', {
        user: user,
        userUuid: user?.userUuid
      });
      if (user) {
        const adminStatus = await checkIsAdmin(user);
        console.log('👮 adminStatus:', adminStatus);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  // Load unread message count
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

// Reset contact error/success when modal closes
useEffect(() => {
  if (!isContactModalOpen) {
    setContactError('');
    setContactSuccess('');
  }
}, [isContactModalOpen]);

  // Set Open Graph meta tags for Facebook sharing
  useEffect(() => {
    if (post) {
      // Get first image URL
      let firstImageUrl = '';
      if (post.images && Array.isArray(post.images) && post.images.length > 0) {
        firstImageUrl = post.images[0];
      }
      
      // Fallback to default image if no images
      if (!firstImageUrl) {
        firstImageUrl = '/content/templates/sverigejplogo.png';
      }
      
      // Ensure image URL is absolute
      if (firstImageUrl.startsWith('/')) {
        firstImageUrl = window.location.origin + firstImageUrl;
      }
      
      // Add cache buster to image URL to prevent Facebook caching
      const cacheBuster = Date.now();
      const imageUrlWithCache = `${firstImageUrl}?v=${cacheBuster}`;
      
      console.log('📸 Setting og:image to:', imageUrlWithCache);
      
      // Update or create meta tags
      const updateMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      const pageUrl = window.location.href;
      const title = post.title || 'Sverige.JP - スウェーデン日本コミュニティ';
      const description = post.description ? post.description.substring(0, 200) : '';
      
      // Set Open Graph tags
      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:image', imageUrlWithCache);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:alt', title);
      updateMetaTag('og:url', pageUrl);
      updateMetaTag('og:type', 'article');
      updateMetaTag('og:site_name', 'Sverige.JP - スウェーデン日本コミュニティ');
      updateMetaTag('og:locale', 'ja_JP');
      
      // Also set twitter card
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:image', imageUrlWithCache);
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      
      console.log('✅ Open Graph meta tags updated:', {
        'og:title': title,
        'og:image': imageUrlWithCache,
        'og:url': pageUrl
      });
      
      // Update document title as well
      document.title = `Sverige.JP - ${title}`;
    }
  }, [post]);

  useEffect(() => {
    if (allPosts.length > 0 && post) {
      const categoryPosts = allPosts.filter(p => p.category_uuid === post.category_uuid);
      const currentIndex = categoryPosts.findIndex(p => p._row_id === post._row_id);
      if (currentIndex > 0) {
        setPreviousPost(categoryPosts[currentIndex - 1]);
      } else {
        setPreviousPost(null);
      }
      if (currentIndex >= 0 && currentIndex < categoryPosts.length - 1) {
        setNextPost(categoryPosts[currentIndex + 1]);
      } else {
        setNextPost(null);
      }
    }
  }, [allPosts, post]);

  const getLocationName = (locationId) => {
    const location = locations.find(l => l.uuid === locationId);
    return location ? location.name_en || location.name_ja : 'Ej angivet';
  };

  const getLocationData = (locationId) => {
    return locations.find(l => l.uuid === locationId);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.uuid === categoryId);
    return category ? category.name_ja || category.name_en : 'Ej angivet';
  };

  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(s => s.uuid === subcategoryId);
    return subcategory ? subcategory.name_ja : '';
  };

  // サービス投稿(食べる/遊ぶ/暮らす)のグループ名を、サブカテゴリー名から逆引きする
  const getServiceGroupName = (subcategoryId) => {
    const subcategoryName = getSubcategoryName(subcategoryId);
    if (!subcategoryName) return '';
    const group = SERVICE_SUBCATEGORY_GROUPS.find(g => g.items.includes(subcategoryName));
    return group ? group.label : '';
  };

  // Calendar functions
  // 展示会など終了日(event_end_date)があるイベントは、カレンダーに登録する日を以下のルールで決める:
  // - まだ始まっていない(開始日が未来) → 開始日をそのまま登録
  // - 開催中(開始日は過去だがevent_end_dateはまだ先) → 今日の日付を登録(「これから行く」用のリマインダー)
  // - 終了日がない単発イベント → 開始日をそのまま登録(従来通り)
  const getEffectiveCalendarDate = (eventDate) => {
    if (!post.event_end_date) return eventDate;
    const rawEndDate = typeof post.event_end_date === 'number'
      ? new Date(post.event_end_date * 1000)
      : new Date(post.event_end_date);
    const now = new Date();
    if (eventDate < now && rawEndDate > now) {
      return now;
    }
    return eventDate;
  };

  const generateICS = () => {
    if (!post.event_date && !post.event_date_readable) return null;

    // Parse the event date - try different formats
    let eventDate;
    if (post.event_date) {
      // If it's a Unix timestamp (seconds)
      if (typeof post.event_date === 'number') {
        eventDate = new Date(post.event_date * 1000);
      } else if (typeof post.event_date === 'string') {
        // If it's an ISO string or datetime-local format
        eventDate = new Date(post.event_date);
      }
    }

    if (!eventDate || isNaN(eventDate.getTime())) {
      console.warn('Invalid event date:', post.event_date);
      return null;
    }

    // Format dates for ICS
    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    };

    // Escape text for ICS
    const escapeText = (text) => {
      if (!text) return '';
      return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    };

    // 展示会など終了日(event_end_date)があるイベントは、カレンダーには「これから行く日」を登録する:
    // まだ始まっていなければ開始日、すでに開催中(始まっているがまだ終わっていない)なら今日の日付にする
    const calendarDate = getEffectiveCalendarDate(eventDate);
    const endDate = new Date(calendarDate.getTime() + 2 * 60 * 60 * 1000);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sverige.JP//SverigeJP Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${post._row_id}@sverige.jp`,
      `DTSTART:${formatDate(calendarDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${escapeText(post.title)}`,
      `DESCRIPTION:${escapeText(post.description)}`,
      post.event_location ? `LOCATION:${escapeText(post.event_location)}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICS();
    if (!icsContent) {
      toast({
        title: "エラー",
        description: "イベントの日時情報が正しくありません",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${post.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "カレンダーに追加",
      description: "ICSファイルをダウンロードしました"
    });
  };

  const getGoogleCalendarUrl = () => {
    if (!post.event_date) return null;

    let eventDate;
    if (typeof post.event_date === 'number') {
      eventDate = new Date(post.event_date * 1000);
    } else if (typeof post.event_date === 'string') {
      eventDate = new Date(post.event_date);
    }

    if (!eventDate || isNaN(eventDate.getTime())) return null;

    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // 展示会など終了日(event_end_date)があるイベントも、カレンダーには「これから行く日」を登録する:
    // まだ始まっていなければ開始日、すでに開催中(始まっているがまだ終わっていない)なら今日の日付にする
    const calendarDate = getEffectiveCalendarDate(eventDate);
    const endDate = new Date(calendarDate.getTime() + 2 * 60 * 60 * 1000);
    const datesParam = `${formatGoogleDate(calendarDate)}/${formatGoogleDate(endDate)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: post.title || '',
      dates: datesParam,
      details: post.description || '',
      location: post.event_location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = (type) => {
    if (type === 'google') {
      const url = getGoogleCalendarUrl();
      if (url) {
        window.open(url, '_blank');
      }
    } else if (type === 'ics') {
      downloadICS();
    }
  };

  // Share functionality
  const handleShare = async (platform) => {
    // シェア用のURLはEdge Function(share-post)経由にする。
    // LINE/Facebook等のリンクプレビューはJavaScriptを実行しないため、
    // 通常の/post/:idのURLだとReact側で書き換えたog:imageが見えず、
    // 固定ロゴしか表示されない。share-postはボットにはog:image付きの
    // HTMLを、人間には/post/:idへのリダイレクトを返す。
    const url = post?._row_id
      ? `${window.location.origin}/api/v2/function/share-post?id=${post._row_id}`
      : window.location.href;
    const title = post?.title || 'Sverige.JP - スウェーデン日本コミュニティ';
    const text = post?.description || '';

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "コピー完了",
            description: "URLをクリップボードにコピーしました",
          });
        } catch (error) {
          console.error('Failed to copy:', error);
          toast({
            title: "エラー",
            description: "URLのコピーに失敗しました",
            variant: "destructive"
          });
        }
        break;

      case 'line':
        // LINEの外部共有ウィジェット(social-plugins.line.me)は、PC・モバイル
        // 共に「LINEアプリで開きますか?」の確認が失敗して何も送れないことが
        // あったため、URLをコピーしてLINEに直接貼り付けてもらう方式にする
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "URLをコピーしました",
            description: "LINEのトーク画面に貼り付けて送ってください",
          });
        } catch (error) {
          console.error('Failed to copy:', error);
          toast({
            title: "エラー",
            description: "URLのコピーに失敗しました",
            variant: "destructive"
          });
        }
        break;

      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
        break;

      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
        break;

      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank');
        break;

      default:
        break;
    }
  };



  const handleContactClick = async () => {
    const currentUser = await auth.getUser();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // モーダルを開くときにエラー・成功メッセージをリセット
    setContactError('');
    setContactSuccess('');
    setIsContactModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    checkAuthStatus();
    setIsContactModalOpen(true);
  };

  const handleContactSubmit = async () => {
    if (!contactMessage.trim()) {
      toast({
        title: "エラー",
        description: "メッセージを入力してください",
        variant: "destructive"
      });
      return;
    }

    // エラー・成功メッセージをクリア
    setContactError('');
    setContactSuccess('');

    if (contactMethod === 'dm') {
      await handleDirectMessageSubmit();
    } else {
      await handleEmailSubmit();
    }
  };

  // サイト内メッセージ(DM)で送信
  const handleDirectMessageSubmit = async () => {
    const currentUser = await auth.getUser();
    if (!currentUser || !currentUser.userUuid) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive"
      });
      return;
    }

    const me = currentUser.userUuid;
    const other = post._created_by;

    // 投稿者UUIDチェック
    if (!other) {
      setContactError('この投稿には連絡先が設定されていません');
      toast({
        title: "エラー",
        description: "この投稿には連絡先が設定されていません",
        variant: "destructive"
      });
      return;
    }

    // 自分自身の投稿には連絡不可
    if (me === other) {
      toast({
        title: "エラー",
        description: "自分の投稿には連絡できません",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 送信者のプロフィールを取得
      const profiles = await db.query('user_profiles', {
        user_uuid: `eq.${me}`,
        _deleted: 'eq.0'
      });

      const profile = profiles[0];
      const fromName = profile?.display_name || currentUser.firstName || 'ユーザー';

      // 上限チェック
      const [sentMessages, receivedMessages] = await Promise.all([
        db.query('messages', { from_uuid: `eq.${me}`, _deleted: 'eq.0' }),
        db.query('messages', { to_uuid: `eq.${me}`, _deleted: 'eq.0' })
      ]);

      const allMessages = [...sentMessages, ...receivedMessages];
      const uniqueMessages = Array.from(
        new Map(allMessages.map(msg => [msg._row_id, msg])).values()
      );

      // プランは本人が書き換えられない member_status から読む(行が無ければ無料プラン)
      const statusRows = await db.query('member_status', { user_uuid: `eq.${me}` });
      const limit = getMessageLimit(statusRows[0]);

      if (uniqueMessages.length >= limit) {
        const limitText = limit === Infinity ? '無制限' : `${limit}通`;
        toast({
          title: "送信できません",
          description: `メッセージが上限に達しています。受信箱で古い会話を削除するか、有料プラン(月30kr・近日対応)をご利用ください。`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // conversation_keyを生成
      const sortedUuids = [me, other].sort();
      const conversation_key = `${post._row_id}:${sortedUuids.join('_')}`;

      // メッセージを送信
      try {
        await db.insert('messages', {
          post_id: post._row_id,
          post_title: post.title,
          conversation_key,
          from_uuid: me,
          from_name: fromName,
          to_uuid: other,
          body: contactMessage,
          is_read: 0,
          _deleted: 0
        });

        console.log('✅ Direct message sent successfully');

        setContactSuccess('メッセージを送信しました。返信は『メッセージ』画面で確認できます。');
        toast({
          title: "送信完了",
          description: "メッセージを送信しました。返信は『メッセージ』画面で確認できます。",
        });

        setIsContactModalOpen(false);
        setContactMessage('');
        setIsSubmitting(false);

        // 「メッセージを見る」ボタンで遷移できるようにする
        // ユーザーがクリックしたら遷移するためのstateをセット
        setShowMessageButton(true);
      } catch (insertError) {
        console.error('❌ Message insert error:', insertError);
        setContactError('保存に失敗しました: ' + (insertError.message || insertError));
        toast({
          title: "エラー",
          description: '保存に失敗しました: ' + (insertError.message || insertError),
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // 受信者への通知メール。宛先のアドレスはサーバーが受信者のアカウントから決める。
      try {
        const notificationResult = await functions.post('send-message-notification', {
          toUuid: other
        });
        console.log('✅ Message notification sent:', notificationResult);
      } catch (notificationError) {
        console.error('❌ Message notification error:', notificationError);
        // 通知のエラーはメッセージ送信自体の成功に影響しない
      }

      toast({
        title: "送信完了",
        description: "メッセージを送信しました。返信は『メッセージ』画面で確認できます。",
      });

      setIsContactModalOpen(false);
      setContactMessage('');
      setIsSubmitting(false);

      // 「メッセージを見る」ボタンで遷移できるようにする
      // ユーザーがクリックしたら遷移するためのstateをセット
      setShowMessageButton(true);

    } catch (error) {
      console.error('Error sending direct message:', error);
      setContactError('送信に失敗しました: ' + (error.message || error));
      toast({
        title: "エラー",
        description: error.message || "送信に失敗しました",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // メールで送信（既存の処理）
  const handleEmailSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentUser = await auth.getUser();
      if (!currentUser) {
        setIsSubmitting(false);
        setContactError('ログインが必要です');
        toast({
          title: "エラー",
          description: "ログインが必要です",
          variant: "destructive"
        });
        return;
      }

      console.log('📧 Starting contact submission process:', post._row_id);

      // 宛先(投稿者)と差出人(自分)のアドレスはサーバーがアカウントから決める
      try {
        const result = await functions.post('send-contact-email', {
          postId: post._row_id,
          message: contactMessage
        });

        console.log('✅ Edge function result:', result);

        if (result && result.success) {
          setContactSuccess('投稿者に問い合わせメールを送信しました');
          toast({
            title: "送信完了",
            description: "投稿者に問い合わせメールを送信しました",
          });
          setIsContactModalOpen(false);
          setContactMessage('');
        } else {
          throw new Error(result?.error || '送信に失敗しました');
        }
      } catch (functionError) {
        console.error('❌ Function call error:', functionError);
        setContactError('送信に失敗しました: ' + (functionError.message || functionError));
        throw new Error(functionError.message || 'Edge Functionの呼び出しに失敗しました');
      }

    } catch (error) {
      console.error('Error sending contact:', error);
      setContactError('送信に失敗しました: ' + (error.message || error));
      toast({
        title: "エラー",
        description: error.message || "送信に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // スパム報告ハンドラー
  const handleSpamReportClick = async () => {
    console.log('🚨 handleSpamReportClickが呼び出されました');
    const currentUser = await auth.getUser();
    console.log('🚨 handleSpamReportClick - currentUser:', {
      currentUser: currentUser,
      userUuid: currentUser?.userUuid,
      postCreatedBy: post?._created_by,
      isOwnPost: currentUser?.userUuid === post?._created_by
    });

    if (!currentUser) {
      console.log('🚨 ユーザー未ログイン - 認証モーダルを開きます');
      setIsAuthModalOpen(true);
      return;
    }
    // 自分の投稿には報告ボタンを出さない
    if (currentUser.userUuid === post._created_by) {
      console.log('🚨 自分の投稿なので報告できません');
      toast({
        title: "エラー",
        description: "自分の投稿は報告できません",
        variant: "destructive"
      });
      return;
    }
    console.log('🚨 スパム報告モーダルを開きます');
    setSpamReportError('');
    setSpamReportSuccess('');
    setSpamReason('');
    setIsSpamReportModalOpen(true);
  };

  const handleSpamReportSubmit = async () => {
    const currentUser = await auth.getUser();
    if (!currentUser || !currentUser.userUuid) {
      setSpamReportError('ログインが必要です');
      return;
    }

    // 二重報告チェック
    try {
      const existingReports = await db.query('spam_reports', {
        post_id: `eq.${post._row_id}`,
        reporter_uuid: `eq.${currentUser.userUuid}`,
        status: 'eq.pending'
      });

      if (existingReports && existingReports.length > 0) {
        setSpamReportError('すでに報告済みです');
        toast({
          title: "報告済み",
          description: "この投稿は既に報告されています",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking existing reports:', error);
    }

    // ユーザープロフィール取得
    let reporterName = currentUser.displayName || currentUser.email || '匿名ユーザー';
    try {
      const profiles = await db.query('user_profiles', {
        user_uuid: `eq.${currentUser.userUuid}`,
        _deleted: 'eq.0'
      });
      if (profiles && profiles.length > 0) {
        reporterName = profiles[0].display_name || reporterName;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }

    setIsSubmittingSpam(true);
    try {
      await db.insert('spam_reports', {
        post_id: post._row_id,
        post_title: post.title,
        reporter_uuid: currentUser.userUuid,
        reporter_name: reporterName,
        reason: spamReason.trim(),
        status: 'pending',
        _deleted: 0
      });

      setSpamReportSuccess('報告ありがとうございます。管理者が確認します');
      toast({
        title: "報告完了",
        description: "報告ありがとうございます。管理者が確認します",
      });
      setIsSpamReportModalOpen(false);
      setSpamReason('');
    } catch (error) {
      console.error('Error submitting spam report:', error);
      setSpamReportError('報告の送信に失敗しました');
      toast({
        title: "エラー",
        description: "報告の送信に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingSpam(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthModalOpen(true);
    setAuthModalTab('login');
  };

  const handleRegister = () => {
    setIsAuthModalOpen(true);
    setAuthModalTab('register');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Stockholm'
    });
  };

  // 説明文内の **テキスト** を太字で表示する(簡易的なMarkdown風記法)。
  // 元のタイトル(翻訳前の英語/スウェーデン語)を説明文の先頭に太字で
  // 残す運用のために追加。
  const renderDescriptionWithBold = (text: string) => {
    if (!text) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleNavigateToPost = (postId) => {
    if (postId) {
      navigate(`/post/${postId}`);
      window.scrollTo(0, 0);
    }
  };

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, go to home
      navigate('/');
    }
  };

  const handleCategoryChange = (categoryId) => {
    // 掲示板カテゴリーの場合はフォーラムページに遷移(トップページと同じ挙動)
    if (categoryId === 'cat-bulletin') {
      navigate('/forum');
      return;
    }
    navigate(categoryId ? `/?category=${categoryId}` : '/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">投稿が見つかりません</h2>
          <Button onClick={() => navigate('/')}>ホームに戻る</Button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering PostDetail:', {
    post: post,
    user: user,
    userUuid: user?.userUuid,
    postCreatedBy: post?._created_by,
    shouldShowSpamButton: user && user.userUuid && user.userUuid !== post?._created_by
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-base sm:text-xl font-bold text-gray-900 hidden sm:block">Sverige.JP</h1>
                <h1 className="text-base font-bold text-gray-900 sm:hidden">Sverige.JP</h1>
                <p className="text-xs text-gray-600 hidden md:block">スウェーデン日本コミュニティ</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <WorldClock className="hidden md:flex flex-shrink-0" />
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" className="h-8 px-2 relative" onClick={() => navigate('/messages')}>
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
                        {currentUserProfile?.profile_photo_url ? (
                          <img
                            src={currentUserProfile.profile_photo_url}
                            alt="プロフィール画像"
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400 bg-gray-100 rounded-full p-1 flex-shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[80px] sm:max-w-[150px]">
                          {user.firstName || user.email?.split('@')[0]}
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
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleLogin}>
                    ログイン
                  </Button>
                  <Button size="sm" className="h-8 text-xs px-2" onClick={handleRegister}>
                    新規登録
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* World Clock - mobile only, full width bar below header */}
      <div className="md:hidden bg-gray-100 border-b px-4 py-2">
        <WorldClock className="flex justify-center gap-3 text-xs" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="キーワードで投稿を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
              <Search className="w-4 h-4 mr-2" />
              検索
            </Button>
          </div>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            新規投稿
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCategoryChange('')}
            className="border-2 bg-white hover:bg-gray-50"
          >
            全て
          </Button>
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.uuid] || Home;
            return (
              <Button
                key={category.uuid}
                variant="outline"
                size="sm"
                onClick={() => handleCategoryChange(category.uuid)}
                className="border-2 bg-white hover:bg-gray-50"
                style={{ borderColor: category.color, borderWidth: '2px' }}
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {category.name_ja}
              </Button>
            );
          })}
        </div>

        {/* Breadcrumb */}
        {post && (
          <div className="flex items-center flex-wrap gap-1 text-sm text-gray-500 mb-4 min-w-0 overflow-hidden">
            <Link to="/" className="hover:text-blue-600 hover:underline flex-shrink-0">
              ホーム
            </Link>
            {post.category_uuid && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <Link
                  to={`/?category=${post.category_uuid}`}
                  className={`flex-shrink-0 ${post.subcategory_uuid ? 'hover:text-blue-600 hover:underline' : 'text-gray-900 font-medium'}`}
                >
                  {getCategoryName(post.category_uuid)}
                </Link>
              </>
            )}
            {post.subcategory_uuid && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <Link
                  to={`/?category=${post.category_uuid}&subcategory=${post.subcategory_uuid}`}
                  className="hover:text-blue-600 hover:underline flex-shrink-0"
                >
                  {getSubcategoryName(post.subcategory_uuid)}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate min-w-0">{post.title}</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 lg:mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <CardTitle className="text-xl sm:text-2xl flex-1">{post.title}</CardTitle>
                      <span className="text-xs text-gray-400 font-mono">#{post._row_id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {post.condition && (
                        <Badge
                          variant="secondary"
                          className={conditionColors[post.condition] || 'bg-gray-100 text-gray-800'}
                        >
                          {conditionLabels[post.condition] || post.condition}
                        </Badge>
                      )}
                      {post.shipping_method && (
                        <Badge variant="outline" className="border-blue-400 text-blue-700">
                          {shippingMethodLabels[post.shipping_method] || post.shipping_method}
                        </Badge>
                      )}
                      {post.category_uuid && (
                        <Link to={`/?category=${post.category_uuid}`}>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700 hover:bg-green-50 cursor-pointer"
                          >
                            {getCategoryName(post.category_uuid)}
                          </Badge>
                        </Link>
                      )}
                      {post.category_uuid === 'cat-services' && post.subcategory_uuid && getServiceGroupName(post.subcategory_uuid) && (
                        <Link to={`/?category=${post.category_uuid}`}>
                          <Badge
                            variant="outline"
                            className="border-green-400 text-green-600 hover:bg-green-50 cursor-pointer"
                          >
                            {getServiceGroupName(post.subcategory_uuid)}
                          </Badge>
                        </Link>
                      )}
                      {post.subcategory_uuid && (
                        <Link to={`/?category=${post.category_uuid}&subcategory=${post.subcategory_uuid}`}>
                          <Badge
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50 cursor-pointer"
                          >
                            {getSubcategoryName(post.subcategory_uuid)}
                          </Badge>
                        </Link>
                      )}
                      {post.post_type === 'free' && !['cat-services', 'cat-job-seeking', 'cat-housing'].includes(post.category_uuid) && post.price && (
                        <span className="text-green-600 font-semibold text-base sm:text-lg">
                          {formatPrice(post.price)}
                        </span>
                      )}
                      {post.post_type === 'event' && post.event_date_readable && (
                        <span className="text-purple-600 font-semibold text-base sm:text-lg bg-purple-50 px-3 py-1 rounded-full">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          {post.event_date_readable}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Share Buttons */}
                  {/* LINEは外部連携が不安定なため、確認が取れるまで一旦非表示にしています */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-2"
                    >
                      <Link2 className="w-4 h-4" />
                      URLコピー
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border-gray-400 text-gray-900"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                      </svg>
                    </Button>
                    {/* Facebookシェアが正常に動作していないため、修正できるまで一旦非表示にしています */}
                    {false && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </Button>
                    )}
                  </div>

                </div>

                {/* Navigation Posts */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToPost(previousPost?._row_id)}
                    disabled={!previousPost}
                    className="flex items-center gap-2 text-sm flex-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">
                      {previousPost ? previousPost.title : '前の投稿'}
                    </span>
                  </Button>
                  <div className="px-2 text-xs text-gray-500">
                    {(() => {
                      const categoryPosts = allPosts.filter(p => p?.category_uuid === post.category_uuid);
                      return `${categoryPosts.findIndex(p => p?._row_id === post._row_id) + 1} / ${categoryPosts.length}`;
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToPost(nextPost?._row_id)}
                    disabled={!nextPost}
                    className="flex items-center gap-2 text-sm flex-1"
                  >
                    <span className="truncate max-w-[120px]">
                      {nextPost ? nextPost.title : '次の投稿'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {/* サービス投稿の場合、投稿者本人の画像 + 他ユーザーが投稿した写真をまとめて1つのギャラリーにする */}
                {(() => {
                  const isServicePost = post.post_type === 'service' || post.category_uuid === 'cat-services';
                  const combinedPhotos = [
                    ...((post.images || []).map((url: string) => ({ url, uploaderName: null as string | null }))),
                    ...(isServicePost
                      ? postPhotos.map((p: any) => ({ url: p.image_url, uploaderName: p.uploader_name || null }))
                      : [])
                  ];
                  const selectedPhoto = combinedPhotos[selectedImageIndex] || combinedPhotos[0];

                  return (
                    <>
                      {/* Main Image - 50% size on mobile, larger on PC */}
                      <div className="mb-6">
                        <div className="relative mx-auto w-1/2 md:w-3/4">
                          <img
                            src={selectedPhoto ? selectedPhoto.url : '/content/templates/sverige_blank.png'}
                            alt={post.title}
                            className="w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => combinedPhotos.length > 0 && setIsImageLightboxOpen(true)}
                          />
                          {combinedPhotos.length > 1 && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs sm:text-sm">
                              {selectedImageIndex + 1} / {combinedPhotos.length}
                            </div>
                          )}
                        </div>
                        {selectedPhoto?.uploaderName && (
                          <p className="text-center text-xs text-gray-500 mt-2">
                            {selectedPhoto.uploaderName}さん投稿
                          </p>
                        )}
                      </div>

                      {/* Thumbnail Gallery */}
                      {combinedPhotos.length > 1 && (
                        <div className="mb-6">
                          <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            画像一覧（クリックして選択）
                          </h3>
                          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {combinedPhotos.map((photo, index) => (
                              <div
                                key={index}
                                className={`relative aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 ${
                                  selectedImageIndex === index ? 'border-blue-500' : ''
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                              >
                                <img
                                  src={photo.url}
                                  alt={`画像 ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* サービス投稿への写真投稿(ログイン中のみ、最大5枚まで) */}
                      {isServicePost && user && (
                        <div className="mb-6">
                          {combinedPhotos.length < 5 ? (
                            <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors">
                              <ImageIcon className="w-4 h-4" />
                              {isUploadingPhoto ? 'アップロード中...' : 'あなたの撮影した写真を投稿しよう！'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingPhoto}
                                onChange={handlePhotoContribution}
                              />
                            </label>
                          ) : (
                            <p className="text-xs text-gray-500">画像は最大5枚までです</p>
                          )}
                        </div>
                      )}

                      {/* Image Lightbox - クリックで拡大表示、複数枚なら前後矢印で切り替え */}
                      {isImageLightboxOpen && combinedPhotos.length > 0 && (
                        <div
                          className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4"
                          onClick={() => setIsImageLightboxOpen(false)}
                        >
                          <button
                            type="button"
                            aria-label="閉じる"
                            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsImageLightboxOpen(false);
                            }}
                          >
                            <X className="w-6 h-6" />
                          </button>

                          {combinedPhotos.length > 1 && (
                            <button
                              type="button"
                              aria-label="前の画像"
                              className="absolute left-2 sm:left-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev - 1 + combinedPhotos.length) % combinedPhotos.length);
                              }}
                            >
                              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                          )}

                          <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <img
                              src={selectedPhoto ? selectedPhoto.url : ''}
                              alt={post.title}
                              className="max-w-full max-h-[85vh] object-contain"
                            />
                            {selectedPhoto?.uploaderName && (
                              <p className="text-white text-sm">{selectedPhoto.uploaderName}さん投稿</p>
                            )}
                          </div>

                          {combinedPhotos.length > 1 && (
                            <button
                              type="button"
                              aria-label="次の画像"
                              className="absolute right-2 sm:right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev + 1) % combinedPhotos.length);
                              }}
                            >
                              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                            </button>
                          )}

                          {combinedPhotos.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded text-sm">
                              {selectedImageIndex + 1} / {combinedPhotos.length}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Event Information - Only show for events */}
                {post.post_type === 'event' && (
                  <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center text-purple-800">
                      <Calendar className="w-5 h-5 mr-2" />
                      イベント情報
                    </h3>
                    <div className="space-y-3">
                      {post.event_date_readable && (
                        <div className="flex items-center text-purple-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">開催日:</span>
                          <span className="ml-2">{post.event_date_readable}</span>
                        </div>
                      )}
                      
                      {post.event_location && (
                        <div className="flex items-center text-purple-700">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">場所:</span>
                          <span className="ml-2">{post.event_location}</span>
                        </div>
                      )}

                      {post.event_fee && (
                        <div className="flex items-center text-purple-700">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span className="font-medium">参加費:</span>
                          <span className="ml-2">{post.event_fee}</span>
                        </div>
                      )}

                      {post.event_url && (
                        <div className="flex items-center text-purple-700">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          <span className="font-medium">公式サイト:</span>
                          <a
                            href={post.event_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-purple-700 underline hover:text-purple-900"
                          >
                            詳細を見る
                          </a>
                        </div>
                      )}

                      {post.ticket_url && (
                        <div className="flex items-center text-purple-700">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          <span className="font-medium">チケット購入:</span>
                          <a
                            href={post.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-purple-700 underline hover:text-purple-900"
                          >
                            チケットを見る
                          </a>
                        </div>
                      )}

                      {post.phone && (
                        <div className="flex items-center text-purple-700">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="font-medium">電話番号:</span>
                          <span className="ml-2">{post.phone}</span>
                        </div>
                      )}

                      {/* Calendar Add Buttons */}
                      <div className="pt-3 border-t border-purple-200">
                        <p className="text-sm font-medium text-purple-800 mb-2">カレンダーに追加:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleAddToCalendar('google')}
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-gray-50 border-purple-300 text-purple-700"
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google カレンダー
                          </Button>
                          <Button
                            onClick={() => handleAddToCalendar('ics')}
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-gray-50 border-purple-300 text-purple-700"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            ICS ファイル
                          </Button>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          ※ ICSファイルはAppleカレンダー、Outlook、その他カレンダーアプリで使用できます
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">詳細</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{renderDescriptionWithBold(post.description)}</p>
                  </div>
                </div>

                {/* Shipping / Tracking Info */}
                {post.category_uuid === 'cat-for-sale' && post.tracking_number && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center text-blue-900">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      配送状況
                    </h3>
                    <p className="text-sm text-blue-900 mb-2">
                      PostNordで発送済みです。追跡番号: <span className="font-mono">{post.tracking_number}</span>
                    </p>
                    <a
                      href={`https://tracking.postnord.com/se/?id=${encodeURIComponent(post.tracking_number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-700 hover:underline font-medium"
                    >
                      PostNordで追跡する
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                )}

                {/* Product Information */}
                {(post.brand || post.model_name || post.size_dimensions) && (
                  <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      商品情報
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {post.brand && (
                        <div>
                          <span className="font-medium text-gray-700">ブランド:</span>
                          <p className="text-gray-900">{post.brand}</p>
                        </div>
                      )}
                      {post.model_name && (
                        <div>
                          <span className="font-medium text-gray-700">モデル名/番号:</span>
                          <p className="text-gray-900">{post.model_name}</p>
                        </div>
                      )}
                      {post.size_dimensions && (
                        <div>
                          <span className="font-medium text-gray-700">サイズ/寸法:</span>
                          <p className="text-gray-900">{post.size_dimensions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Information - Only show for job postings */}
                {(post.company_name || post.company_url || post.company_contact || post.salary || post.employment_type || post.experience_level || post.work_location) && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center text-blue-800">
                      <Briefcase className="w-5 h-5 mr-2" />
                      求人情報
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {post.company_name && (
                        <div className="flex items-start text-blue-700">
                          <Building className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">会社名:</span>
                            <p className="text-blue-900 mt-0.5">{post.company_name}</p>
                          </div>
                        </div>
                      )}
                      {post.company_url && (
                        <div className="flex items-start text-blue-700">
                          <ExternalLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">会社の公式サイト:</span>
                            <p className="mt-0.5">
                              <a
                                href={post.company_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-900 underline hover:text-blue-700"
                              >
                                {post.company_url}
                              </a>
                            </p>
                          </div>
                        </div>
                      )}
                      {post.company_contact && (
                        <div className="flex items-start text-blue-700">
                          <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">会社の連絡先:</span>
                            <p className="text-blue-900 mt-0.5">{post.company_contact}</p>
                          </div>
                        </div>
                      )}
                      {post.salary && (
                        <div className="flex items-start text-blue-700">
                          <DollarSign className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">給与:</span>
                            <p className="text-blue-900 mt-0.5">{post.salary}</p>
                          </div>
                        </div>
                      )}
                      {post.employment_type && (
                        <div className="flex items-start text-blue-700">
                          <Briefcase className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">就業形態:</span>
                            <p className="text-blue-900 mt-0.5">{employmentTypeLabels[post.employment_type] || post.employment_type}</p>
                          </div>
                        </div>
                      )}
                      {post.experience_level && (
                        <div className="flex items-start text-blue-700">
                          <TrendingUp className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">経験:</span>
                            <p className="text-blue-900 mt-0.5">{experienceLevelLabels[post.experience_level] || post.experience_level}</p>
                          </div>
                        </div>
                      )}
                      {post.work_location && (
                        <div className="flex items-start text-blue-700 sm:col-span-2">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">勤務地:</span>
                            <p className="text-blue-900 mt-0.5">{post.work_location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Housing Information - Only show for housing postings */}
                {(post.rent || post.rooms || post.area_sqm || post.available_date) && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center text-green-800">
                      <Home className="w-5 h-5 mr-2" />
                      住居詳細情報
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {post.rent && (
                        <div className="flex items-start text-green-700">
                          <DollarSign className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">家賃:</span>
                            <p className="text-green-900 mt-0.5">{post.rent}</p>
                          </div>
                        </div>
                      )}
                      {post.rooms && (
                        <div className="flex items-start text-green-700">
                          <Home className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">部屋数/タイプ:</span>
                            <p className="text-green-900 mt-0.5">{roomsLabels[post.rooms] || post.rooms}</p>
                          </div>
                        </div>
                      )}
                      {post.area_sqm && (
                        <div className="flex items-start text-green-700">
                          <Package className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">広さ:</span>
                            <p className="text-green-900 mt-0.5">{post.area_sqm.includes('㎡') ? post.area_sqm : `${post.area_sqm}㎡`}</p>
                          </div>
                        </div>
                      )}
                      {post.available_date && (
                        <div className="flex items-start text-green-700">
                          <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">入居可能日:</span>
                            <p className="text-green-900 mt-0.5">{post.available_date}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Information - Only show for service postings */}
                {(post.service_fee || post.service_area || post.availability || post.service_url || post.ticket_url || post.tour_url || ((post.post_type === 'service' || post.category_uuid === 'cat-services') && post.phone)) && (
                  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center text-orange-800">
                      <Wrench className="w-5 h-5 mr-2" />
                      サービス詳細情報
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {post.street && (
                        <div className="flex items-start text-orange-700 sm:col-span-2">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">住所:</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${post.street}${(post.postal_code || post.zip_code) ? ', ' + (post.postal_code || post.zip_code) : ''}${post.location_uuid ? ' ' + getLocationName(post.location_uuid) : ''}, Sweden`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-orange-900 mt-0.5 underline hover:text-orange-700"
                            >
                              {post.street}
                              {(post.postal_code || post.zip_code) ? `, ${post.postal_code || post.zip_code}` : ''}
                              {post.location_uuid ? ` ${getLocationName(post.location_uuid)}` : ''}
                            </a>
                          </div>
                        </div>
                      )}
                      {post.service_fee && (
                        <div className="flex items-start text-orange-700">
                          <DollarSign className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">サービス料金:</span>
                            <p className="text-orange-900 mt-0.5">{post.service_fee}</p>
                          </div>
                        </div>
                      )}
                      {post.service_area && (
                        <div className="flex items-start text-orange-700">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">サービス提供エリア:</span>
                            <p className="text-orange-900 mt-0.5">{post.service_area}</p>
                          </div>
                        </div>
                      )}
                      {(post.post_type === 'service' || post.category_uuid === 'cat-services') && post.phone && (
                        <div className="flex items-start text-orange-700">
                          <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">電話番号:</span>
                            <p className="text-orange-900 mt-0.5">{post.phone}</p>
                          </div>
                        </div>
                      )}
                      {post.availability && (
                        <div className="flex items-start text-orange-700 sm:col-span-2">
                          <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">対応可能時間:</span>
                            <p className="text-orange-900 mt-0.5">{post.availability}</p>
                          </div>
                        </div>
                      )}
                      {post.service_url && (
                        <div className="flex items-start text-orange-700 sm:col-span-2">
                          <ExternalLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">公式サイト:</span>
                            <a
                              href={post.service_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-orange-700 underline hover:text-orange-900"
                            >
                              詳細を見る
                            </a>
                          </div>
                        </div>
                      )}
                      {post.ticket_url && (
                        <div className="flex items-start text-orange-700 sm:col-span-2">
                          <ExternalLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">チケット購入:</span>
                            <a
                              href={post.ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-orange-700 underline hover:text-orange-900"
                            >
                              チケットを見る
                            </a>
                          </div>
                        </div>
                      )}
                      {post.tour_url && (
                        <div className="flex items-start text-orange-700 sm:col-span-2">
                          <ExternalLink className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">ガイド付きツアー:</span>
                            <a
                              href={post.tour_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-orange-700 underline hover:text-orange-900"
                            >
                              ツアーを見る
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* User Information */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {post.userProfile?.profile_photo_url ? (
                        <img 
                          src={post.userProfile.profile_photo_url}
                          alt={post.userName || 'プロフィール写真'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {post.userName || 'SverigeJP スタッフ'}
                        </span>
                        {post.userProfile?.username && (
                          <span className="text-sm text-gray-500">@{post.userProfile.username}</span>
                        )}
                      </div>
                      {post.userProfile?.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{post.userProfile.bio}</p>
                      )}
                      {post.userProfile?.location && (
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {post.userProfile.location}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-8 sm:gap-y-3 text-sm pt-4 border-t">
                    <div className="flex items-start text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        <span className="text-gray-500">投稿日:</span> {formatDate(post._created_at)}
                      </span>
                    </div>
                    {post.category_uuid && (
                      <div className="flex items-start text-gray-600">
                        <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          <span className="text-gray-500">カテゴリ:</span>{' '}
                          <Link
                            to={`/?category=${post.category_uuid}`}
                            className="text-blue-600 hover:underline"
                          >
                            {getCategoryName(post.category_uuid)}
                          </Link>
                          {post.subcategory_uuid && (
                            <span className="text-gray-900 font-medium">
                              {' > '}{getSubcategoryName(post.subcategory_uuid)}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {post.location_uuid && (
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          <span className="text-gray-500">場所:</span> {getLocationName(post.location_uuid)}
                        </span>
                      </div>
                    )}
                    {post.street && (
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          <span className="text-gray-500">住所:</span> {post.street}
                        </span>
                      </div>
                    )}
                    {(post.postal_code || post.zip_code) && (
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          <span className="text-gray-500">郵便番号:</span> {post.postal_code || post.zip_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="xl:col-span-1 space-y-4">
            {/* Map Card */}
            {post.location_uuid && (
              <Card>
                <CardContent className="p-0">
                  <div className="w-full" style={{ height: '300px' }}>
                    <SingleLocationMap
                      locationName={getLocationName(post.location_uuid)}
                      latitude={post.latitude ?? getLocationData(post.location_uuid)?.latitude}
                      longitude={post.longitude ?? getLocationData(post.location_uuid)?.longitude}
                      className="w-full h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Contact Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  問い合わせ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    この投稿に興味がありますか？下のボタンから<span className="font-bold text-blue-600">{post.userName || 'SverigeJP スタッフ'}</span>さんに問い合わせてください。
                  </p>
                  {/* 自分の投稿の場合は連絡ボタンを非表示 */}
                  {user && user.userUuid === post._created_by ? (
                    <div className="text-sm text-gray-500 italic">
                      自分の投稿には連絡できません
                    </div>
                  ) : (
                    <Button 
                      onClick={handleContactClick}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      問い合わせる
                    </Button>
                  )}
                  {/* スパム報告ボタン（ログイン済みで自分の投稿ではない場合のみ表示） */}
                  {(() => {
                    const isLoggedIn = !!user;
                    const hasUserUuid = !!user?.userUuid;
                    const isNotOwnPost = user?.userUuid !== post?._created_by;
                    const shouldShow = isLoggedIn && hasUserUuid && isNotOwnPost;

                    console.log('🔍 スパム報告ボタン表示条件チェック:', {
                      isLoggedIn,
                      hasUserUuid,
                      isNotOwnPost,
                      shouldShow,
                      user: user,
                      userUuid: user?.userUuid,
                      postCreatedBy: post?._created_by,
                      postCreatedByType: typeof post?._created_by,
                      userUuidType: typeof user?.userUuid
                    });

                    // デバッグ: 条件が満たされない理由
                    if (!shouldShow) {
                      if (!isLoggedIn) {
                        console.log('⚠️ スパム報告ボタン非表示: ユーザー未ログイン');
                      } else if (!hasUserUuid) {
                        console.log('⚠️ スパム報告ボタン非表示: userUuidなし');
                      } else if (!isNotOwnPost) {
                        console.log('⚠️ スパム報告ボタン非表示: 自分の投稿');
                      }
                    }

                    return shouldShow;
                  })() && (
                    <Button
                      onClick={handleSpamReportClick}
                      variant="outline"
                      className="w-full mt-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                      size="sm"
                    >
                      ⚠ スパムを報告
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>投稿者に問い合わせる</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 送信方法の選択 */}
            <div>
              <Label>送信方法</Label>
              <RadioGroup value={contactMethod} onValueChange={setContactMethod} className="mt-2">
                <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <RadioGroupItem value="dm" id="dm" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="dm" className="cursor-pointer font-medium text-gray-900">
                      サイト内メッセージで送る（おすすめ）
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      メールアドレスは相手に知られません
                    </p>
                  </div>
                </div>
                {post.userProfile?.contact_pref !== 'dm_only' && (
                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <RadioGroupItem value="email" id="email" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="email" className="cursor-pointer font-medium text-gray-900">
                        メールで連絡する
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        あなたのメールアドレスが相手に伝わります
                      </p>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* メッセージ入力欄 */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-1">
                <Label htmlFor="message">メッセージ</Label>
                {post.category_uuid === 'cat-for-sale' && (
                  <span className="text-xs text-blue-600">
                    お互い、気持ちよく会話をして楽しいクラシファイドにしましょう。商談成立後は忘れず投稿を商談終了、または削除してください。
                  </span>
                )}
              </div>
              <Textarea
                id="message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="この投稿について質問やメッセージを入力してください..."
                rows={5}
              />
            </div>

            {/* エラー・成功メッセージ表示 */}
            {contactError && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{contactError}</AlertDescription>
              </Alert>
            )}
            {contactSuccess && (
              <Alert className="my-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{contactSuccess}</AlertDescription>
              </Alert>
            )}

            {/* メッセージを見るボタン（DM送信成功後に表示） */}
            {showMessageButton && (
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/messages')}
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  メッセージを見る
                </Button>
              </div>
            )}

            {/* 送信ボタン */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsContactModalOpen(false);
                  setShowMessageButton(false);
                  setContactError('');
                  setContactSuccess('');
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleContactSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spam Report Modal */}
      <Dialog open={isSpamReportModalOpen} onOpenChange={setIsSpamReportModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>⚠ スパムを報告</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              この投稿をスパムとして報告します。報告理由を入力してください（任意）。
            </p>

            {/* 理由入力欄 */}
            <div>
              <Label htmlFor="spamReason">報告理由（任意）</Label>
              <Textarea
                id="spamReason"
                value={spamReason}
                onChange={(e) => setSpamReason(e.target.value)}
                placeholder="スパムの理由や詳細を入力してください..."
                rows={4}
              />
            </div>

            {/* エラー・成功メッセージ表示 */}
            {spamReportError && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{spamReportError}</AlertDescription>
              </Alert>
            )}
            {spamReportSuccess && (
              <Alert className="my-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{spamReportSuccess}</AlertDescription>
              </Alert>
            )}

            {/* 送信ボタン */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSpamReportModalOpen(false);
                  setSpamReason('');
                  setSpamReportError('');
                  setSpamReportSuccess('');
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSpamReportSubmit}
                disabled={isSubmittingSpam}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmittingSpam ? '送信中...' : '報告する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        onAuthSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  );
};

export default PostDetail;