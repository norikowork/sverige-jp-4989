// Sweden.JP - Stockholm Japanese Community - Main index page
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Search, Plus, User, Briefcase, ShoppingBag, Home, Phone, Wrench, Shield, Image as ImageIcon, ArrowRight, Music, Trophy, Palette, Users, GraduationCap, Star, ChevronLeft, ChevronRight, List, Grid3X3, MapPin, MessageSquare, Heart, Handshake, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import db from '@/lib/shared/kliv-database';
import auth from '@/lib/shared/kliv-auth';
import { AuthModal } from '@/components/AuthModal';
import { PostModal } from '@/components/PostModal';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
// Leafletは重いため、初回表示時は読み込まずMapタブを開いた時だけ読み込む
const MapView = lazy(() => import('@/components/MapView'));
import { statusLabels } from '@/constants/postLabels';
import { SERVICE_SUBCATEGORY_GROUPS, SERVICE_SUBCATEGORY_EMOJI } from '@/constants/serviceSubcategories';
import { EVENT_SUBCATEGORIES, EVENT_SUBCATEGORY_EMOJI } from '@/constants/eventSubcategories';
import { FOR_SALE_SUBCATEGORIES, FOR_SALE_SUBCATEGORY_EMOJI } from '@/constants/forSaleSubcategories';

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

// エリア(県)別フィルター用の表示名マッピング
const countyNameMap: Record<string, string> = {
  'Stockholm': 'ストックホルム',
  'Uppsala': 'ウプサラ',
  'Södermanland': 'セーデルマンランド',
  'Östergötland': 'エステルイェータランド',
  'Jönköping': 'ヨンシェーピング',
  'Kronoberg': 'クルノベリ',
  'Kalmar': 'カルマル',
  'Gotland': 'ゴットランド',
  'Blekinge': 'ブレキンゲ',
  'Skåne': 'スコーネ',
  'Halland': 'ハッランド',
  'Västra Götaland': 'ヴェストラ・イェータランド',
  'Värmland': 'ヴェルムランド',
  'Örebro': 'エーレブルー',
  'Västmanland': 'ヴェストマンランド',
  'Dalarna': 'ダーラナ',
  'Gävleborg': 'イェヴレボリ',
  'Västernorrland': 'ヴェステルノールランド',
  'Jämtland': 'イェムトランド',
  'Västerbotten': 'ヴェステルボッテン',
  'Norrbotten': 'ノールボッテン',
  'Other': 'スウェーデン以外'
};

const getCountyNameWithKatakana = (county: string) => {
  return countyNameMap[county] ? `${county} (${countyNameMap[county]})` : county;
};

// エリア別フィルターを表示するカテゴリー
const AREA_FILTER_CATEGORIES = ['cat-for-sale', 'cat-job-seeking', 'cat-housing', 'cat-events', 'cat-services'];

// 売ります/あげますのコンディションフィルターの選択肢
const CONDITION_FILTER_OPTIONS = [
  { value: 'new', label: '新品' },
  { value: 'like_new', label: 'ほぼ新品' },
  { value: 'excellent', label: '非常に良い' },
  { value: 'good', label: '良い' },
  { value: 'fair', label: '可' },
  { value: 'junk', label: 'ジャンク' },
];

const employmentTypeLabels = {
  'full-time': 'フルタイム',
  'part-time': 'パートタイム',
  'contract': 'コントラクト',
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

type ViewMode = 'grid' | 'list' | 'images' | 'map';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [forumTopics, setForumTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMapPost, setSelectedMapPost] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedServiceGroup, setSelectedServiceGroup] = useState(SERVICE_SUBCATEGORY_GROUPS[0]?.label || '');
  const [selectedArea, setSelectedArea] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [priceFilterFree, setPriceFilterFree] = useState(false);
  const [priceFilterMin, setPriceFilterMin] = useState('');
  const [priceFilterMax, setPriceFilterMax] = useState('');
  const [isConditionFilterOpen, setIsConditionFilterOpen] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [userCounty, setUserCounty] = useState<string | null>(null);
  const postsPerPage = 10; // Posts per page

  useEffect(() => {
    loadData();
    checkAuth();
  }, []);

  // Read category/search from URL params on mount and when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    setSelectedCategory(categoryParam || '');
    const searchParam = searchParams.get('search');
    setSearchTerm(searchParam || '');
    const subcategoryParam = searchParams.get('subcategory');
    setSelectedSubcategory(subcategoryParam || '');
    // サービスのグループ(食べる/遊ぶ/暮らす)もURLから復元する。
    // 不正な値や未指定の場合は先頭のグループにフォールバックする
    const groupParam = searchParams.get('group');
    const matchedGroup = SERVICE_SUBCATEGORY_GROUPS.find((g) => g.label === groupParam);
    setSelectedServiceGroup(matchedGroup?.label || SERVICE_SUBCATEGORY_GROUPS[0]?.label || '');
  }, [searchParams]);

  // カテゴリーが選択されたら、サブカテゴリーごとの投稿件数を取得する
  // (絞り込み中のallPostsとは別に、常に選択中カテゴリー全体を対象に数える。
  // サブカテゴリーを持たないカテゴリーでは単に使われないだけなので、
  // どのカテゴリーでも同じ処理でよい)
  useEffect(() => {
    const loadSubcategoryCounts = async () => {
      if (!selectedCategory) {
        setSubcategoryCounts({});
        return;
      }
      try {
        let categoryPosts = await db.query('posts', {
          category_uuid: `eq.${selectedCategory}`,
          status: 'eq.active',
          _deleted: 'eq.0',
          is_hidden: 'eq.0'
        });

        if (selectedArea) {
          const locationCountyMap = new Map<string, string>();
          locations.forEach((loc: any) => locationCountyMap.set(loc.uuid, loc.county));
          categoryPosts = categoryPosts.filter((post: any) =>
            post.location_uuid && locationCountyMap.get(post.location_uuid) === selectedArea
          );
        }

        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-').map(Number);
          const startOfMonth = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
          const endOfMonth = Math.floor(new Date(year, month, 0, 23, 59, 59).getTime() / 1000);
          categoryPosts = categoryPosts.filter((post: any) => {
            if (post.post_type === 'event' && post.event_date) {
              // 終了日(event_end_date)がある長期開催イベントは、開催期間がその月と重なっていれば表示する
              const effectiveEnd = post.event_end_date || post.event_date;
              return post.event_date <= endOfMonth && effectiveEnd >= startOfMonth;
            }
            return false;
          });
        }

        const counts: Record<string, number> = {};
        categoryPosts.forEach((post: any) => {
          if (post.subcategory_uuid) {
            counts[post.subcategory_uuid] = (counts[post.subcategory_uuid] || 0) + 1;
          }
        });

        // 「無料であげます」の件数には、元のサブカテゴリーに関わらず
        // 価格が無料の投稿もすべて加算する(リスト表示側のロジックと揃える)
        if (selectedCategory === 'cat-for-sale') {
          const freeSub = subcategories.find(
            (s: any) => s.category_uuid === 'cat-for-sale' && s.name_ja === '無料であげます'
          );
          if (freeSub) {
            const extraFreeCount = categoryPosts.filter(
              (post: any) => post.subcategory_uuid !== freeSub.uuid && (post.price === '無料' || post.price === '0')
            ).length;
            if (extraFreeCount > 0) {
              counts[freeSub.uuid] = (counts[freeSub.uuid] || 0) + extraFreeCount;
            }
          }
        }

        setSubcategoryCounts(counts);
      } catch (error) {
        console.error('Error loading subcategory counts:', error);
      }
    };
    loadSubcategoryCounts();
  }, [selectedCategory, selectedArea, selectedMonth, locations]);

  // Update posts when allPosts changes (for pagination)
  // 売りますカテゴリーでは、並び替え(最新/古い/最安値/最高値)を反映する
  useEffect(() => {
    let sorted = allPosts;
    if (selectedCategory === 'cat-for-sale') {
      sorted = [...allPosts].sort((a, b) => {
        if (sortOrder === 'oldest') return a._created_at - b._created_at;
        if (sortOrder === 'price_low') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        if (sortOrder === 'price_high') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        return b._created_at - a._created_at; // newest (default)
      });
    }
    setPosts(sorted);
    setCurrentPage(1);
  }, [allPosts, sortOrder, selectedCategory]);

  // 検索語の入力が落ち着いてから(300ms)実際の検索を実行する
  // (1文字ごとに検索を実行すると、複数のリクエストが前後して結果が
  // 入れ替わりチラつく原因になっていたため)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 初回マウント時にフィルターが何も無い場合は、loadData()が既に
  // 投稿一覧を読み込み済みなので loadPosts() の二重呼び出しを避ける
  // (二重に読み込むと表示が完了するまで無駄に時間がかかっていた)
  const isFirstFilterRunRef = useRef(true);

  useEffect(() => {
    if (debouncedSearchTerm || selectedCategory || selectedMonth) {
      loadFilteredPosts();
    } else if (!isFirstFilterRunRef.current) {
      loadPosts();
    }
    isFirstFilterRunRef.current = false;
  }, [debouncedSearchTerm, selectedCategory, selectedMonth, selectedSubcategory, selectedArea, selectedServiceGroup, priceFilterFree, priceFilterMin, priceFilterMax, selectedConditions, subcategories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedMonth, selectedSubcategory, selectedArea, selectedServiceGroup, priceFilterFree, priceFilterMin, priceFilterMax, selectedConditions]);

  // Refresh posts when PostModal closes
  // (初回マウント時もisPostModalOpen=falseで発火してしまい、mount用の
  // loadData()呼び出しと重複していたため、初回は実行しないようにする)
  const isInitialPostModalRef = useRef(true);
  useEffect(() => {
    if (isInitialPostModalRef.current) {
      isInitialPostModalRef.current = false;
      return;
    }
    if (!isPostModalOpen) {
      loadData();
    }
  }, [isPostModalOpen]);

  const loadData = async () => {
    const requestId = ++loadRequestIdRef.current;
    try {
      const [categoriesData, locationsData, subcategoriesData, postsData, profilesData] = await Promise.all([
        db.query('categories', { _deleted: 'eq.0' }),
        db.query('locations', { _deleted: 'eq.0' }),
        db.query('subcategories', { _deleted: 'eq.0' }),
        db.query('posts', { status: 'eq.active', _deleted: 'eq.0', is_hidden: 'eq.0', order: '_created_at.desc' }),
        db.query('user_profiles', { _deleted: 'eq.0' })
      ]);
      
      // Try to load forum topics separately (may not exist in all environments)
      let forumTopicsData = [];
      try {
        forumTopicsData = await db.query('forum_topics', { is_hidden: 'neq.1', order: '_created_at.desc', limit: '100' });
      } catch (forumError) {
        console.warn('Forum topics table not available or error loading:', forumError);
        forumTopicsData = [];
      }
      
      setCategories(categoriesData);
      setLocations(locationsData);
      setSubcategories(subcategoriesData);
      
      // Create a Map for quick profile lookup
      const profileMap = new Map();
      profilesData.forEach(profile => {
        profileMap.set(profile.user_uuid, profile);
      });
      
      // Parse images JSON for each post and get user info from Map
      const postsWithImages = postsData.map(post => {
        let images = [];
        if (post.images) {
          try {
            if (typeof post.images === 'string') {
              images = JSON.parse(post.images);
            } else if (Array.isArray(post.images)) {
              images = post.images;
            }
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            console.warn('Error parsing images for post:', post._row_id, e);
            images = [];
          }
        }

        // Get user information from Maps (no additional DB query)
        let userName = 'SverigeJP スタッフ';
        if (post._created_by) {
          const profile = profileMap.get(post._created_by);
          if (profile && profile.display_name) {
            userName = profile.display_name;
          }
        }
        
        // Get category and location info
        const category = categoriesData.find(c => c.uuid === post.category_uuid);
        const location = locationsData.find(l => l.uuid === post.location_uuid);
        
        return {
          ...post,
          images,
          userName,
          categoryName: category?.name_ja || '未分類',
          categoryColor: category?.color || '#666',
          locationName: location?.name_en || location?.name_ja || 'Ej angivet'
        };
      });
      
      if (requestId !== loadRequestIdRef.current) return;
      setAllPosts(postsWithImages);
      setForumTopics(forumTopicsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
      
      // Load user's profile to get their county
      if (currentUser) {
        const profiles = await db.query('user_profiles', {
          user_uuid: `eq.${currentUser.userUuid}`
        });
        if (profiles.length > 0) {
          const profile = profiles[0];
          if (profile.county) {
            setUserCounty(profile.county);
          }
        }
      }
    } catch (error) {
      // Not authenticated
    }
  };

  const handleAuthSuccess = async (authUser: any) => {
    setUser(authUser);
    loadData(); // Reload data to show user-specific content
  };

  const handlePostCreated = () => {
    loadData(); // Reload posts to include the new one
  };

  const handleCategoryChange = (categoryUuid: string) => {
    // 掲示板カテゴリーの場合はフォーラムページに遷移
    if (categoryUuid === 'cat-bulletin') {
      navigate('/forum');
      return;
    }
    setSelectedCategory(categoryUuid);
    // カテゴリーを切り替えたらサブカテゴリー・エリアの絞り込みはリセットする
    setSelectedSubcategory('');
    setSelectedArea('');
    // Update URL params
    if (categoryUuid) {
      setSearchParams({ category: categoryUuid });
    } else {
      setSearchParams({});
    }
    
    // イベントカテゴリーが選択されたら月選択をセット
    if (categoryUuid === 'cat-events') {
      // 月選択が空なら今月をセット
      if (!selectedMonth) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
      }
    } else {
      // イベントカテゴリー以外が選択されたら月選択をクリア
      setSelectedMonth('');
    }
  };

  const handleSubcategoryChange = (subcategoryUuid: string) => {
    // 同じサブカテゴリーをもう一度押したら選択解除
    const newSubcategory = selectedSubcategory === subcategoryUuid ? '' : subcategoryUuid;
    setSelectedSubcategory(newSubcategory);
    const params: Record<string, string> = { category: selectedCategory };
    if (newSubcategory) {
      params.subcategory = newSubcategory;
    }
    // サービスの場合は選択中のグループ(食べる/遊ぶ/暮らす)もURLに保持しないと、
    // サブカテゴリーを押した瞬間に先頭のグループへ戻ってしまう
    if (selectedCategory === 'cat-services' && selectedServiceGroup) {
      params.group = selectedServiceGroup;
    }
    setSearchParams(params);
  };

  const handleNewPost = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      // 投稿タイプ選択モーダルを開く
      setIsPostModalOpen(true);
    }
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    // 月を選択したらカテゴリー選択をクリア（イベントのみ表示）
    setSelectedCategory('cat-events');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get posts for current page
  const getCurrentPagePosts = () => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return posts.slice(startIndex, endIndex);
  };

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = getCurrentPagePosts();

  // ページ番号ボタンは3つまでの範囲をスライドして表示する
  const pageWindowSize = 3;
  const pageWindowEnd = Math.min(totalPages, Math.max(currentPage + 1, pageWindowSize));
  const pageWindowStart = Math.max(1, pageWindowEnd - pageWindowSize + 1);
  const visiblePageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, i) => pageWindowStart + i
  );

  // loadPosts/loadFilteredPostsは他ページからの遷移直後などに続けて呼ばれることがあり、
  // 後から呼ばれたリクエストより先に古いリクエストの結果が返ってくると、
  // 正しい絞り込み結果が古い結果で上書きされてしまう。リクエストごとに番号を振り、
  // 自分より新しいリクエストが発生していたら結果を反映しないようにする。
  const loadRequestIdRef = useRef(0);

  const loadFilteredPosts = async () => {
    const requestId = ++loadRequestIdRef.current;
    setPostsLoading(true);
    try {
      const filters: Record<string, string> = { status: 'eq.active', _deleted: 'eq.0', is_hidden: 'eq.0', order: '_created_at.desc' };
      
      if (selectedCategory) {
        filters.category_uuid = `eq.${selectedCategory}`;
      }
      // 「無料であげます」は、元のサブカテゴリーに関わらず価格が無料の投稿も
      // 含めて表示したいため、通常のサブカテゴリー完全一致フィルターは使わない
      const freeForSaleSub = selectedCategory === 'cat-for-sale'
        ? subcategories.find((s: any) => s.category_uuid === 'cat-for-sale' && s.name_ja === '無料であげます')
        : null;
      const isFreeForSaleTileSelected = !!freeForSaleSub && selectedSubcategory === freeForSaleSub.uuid;
      if (selectedSubcategory && !isFreeForSaleTileSelected) {
        filters.subcategory_uuid = `eq.${selectedSubcategory}`;
      }

      let postsData = await db.query('posts', filters);

      // 「無料であげます」選択時: サブカテゴリーが「無料であげます」の投稿に加えて、
      // 価格が無料(price === '無料' または '0')の投稿を、元のサブカテゴリーに関わらず含める
      if (isFreeForSaleTileSelected) {
        postsData = postsData.filter((post: any) =>
          post.subcategory_uuid === freeForSaleSub.uuid || post.price === '無料' || post.price === '0'
        );
      }

      // 売ります/あげますの価格フィルター(無料のみ、または最小〜最大の範囲)
      if (selectedCategory === 'cat-for-sale' && (priceFilterFree || priceFilterMin || priceFilterMax)) {
        postsData = postsData.filter((post: any) => {
          const priceNum = post.price === '無料' ? 0 : (parseFloat(post.price) || 0);
          if (priceFilterFree) {
            return priceNum === 0;
          }
          if (priceFilterMin && priceNum < parseFloat(priceFilterMin)) return false;
          if (priceFilterMax && priceNum > parseFloat(priceFilterMax)) return false;
          return true;
        });
      }

      // 売ります/あげますのコンディションフィルター(複数選択可)
      if (selectedCategory === 'cat-for-sale' && selectedConditions.length > 0) {
        postsData = postsData.filter((post: any) => selectedConditions.includes(post.condition));
      }

      // サービスでグループ(食べる/遊ぶ/暮らす)を選んでいて、個別サブカテゴリーは
      // まだ選択していない場合、そのグループに属するサブカテゴリーの投稿だけに絞り込む。
      // ただしsubcategoriesがまだ読み込まれていない場合(直接このURLに来た直後など)は、
      // 絞り込むと投稿が0件になってしまうため、読み込み完了まで絞り込みを行わない
      if (selectedCategory === 'cat-services' && !selectedSubcategory && selectedServiceGroup && subcategories.length > 0) {
        const group = SERVICE_SUBCATEGORY_GROUPS.find((g) => g.label === selectedServiceGroup);
        if (group) {
          const groupSubcategoryUuids = new Set(
            subcategories
              .filter((s: any) => s.category_uuid === 'cat-services' && group.items.includes(s.name_ja))
              .map((s: any) => s.uuid)
          );
          postsData = postsData.filter((post: any) => groupSubcategoryUuids.has(post.subcategory_uuid));
        }
      }

      // 月別フィルターの適用
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        const startOfMonth = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
        const endOfMonth = Math.floor(new Date(year, month, 0, 23, 59, 59).getTime() / 1000);
        
        postsData = postsData.filter(post => {
          if (post.post_type === 'event' && post.event_date) {
            // 終了日(event_end_date)がある長期開催イベントは、開催期間がその月と重なっていれば表示する
            const effectiveEnd = post.event_end_date || post.event_date;
            return post.event_date <= endOfMonth && effectiveEnd >= startOfMonth;
          }
          // 月選択がある場合はイベント以外の投稿は表示しない
          return false;
        });
      }
      
      // 古いイベントを表示から除外（1ヶ月前より古いイベントは非表示）
      const now = new Date();
      const oneMonthAgo = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime() / 1000);
      postsData = postsData.filter(post => {
        if (post.post_type === 'event' && post.event_date) {
          // 終了日があれば、終了日が1ヶ月以上前でない限り表示を続ける
          const effectiveEnd = post.event_end_date || post.event_date;
          return effectiveEnd >= oneMonthAgo;
        }
        return true; // イベント以外は常に表示
      });

      // エリア(県)別フィルターの適用
      // posts自体にはcountyが保存されていないため、locationsから
      // location_uuid -> county のマップを作って突き合わせる
      if (selectedArea) {
        const locationCountyMap = new Map<string, string>();
        locations.forEach((loc: any) => locationCountyMap.set(loc.uuid, loc.county));
        postsData = postsData.filter(post =>
          post.location_uuid && locationCountyMap.get(post.location_uuid) === selectedArea
        );
      }

      // ユーザー情報を一括取得してMapで引けるようにする
      // (投稿1件ごとに問い合わせると、投稿数が多い時に大きく遅くなるため)
      const profilesData = await db.query('user_profiles', { _deleted: 'eq.0' });
      const profileMap = new Map();
      profilesData.forEach((profile: any) => profileMap.set(profile.user_uuid, profile));

      // Parse images JSON for each post
      const postsWithImages = postsData.map(post => {
        let images = [];
        if (post.images) {
          try {
            if (typeof post.images === 'string') {
              images = JSON.parse(post.images);
            } else if (Array.isArray(post.images)) {
              images = post.images;
            }
            // Ensure images is an array
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            console.warn('Error parsing images for post:', post._row_id, e);
            images = [];

          }
        }

        // Get user information from Maps (no additional DB query per post)
        let userName = 'SverigeJP スタッフ';
        if (post._created_by) {
          const profile = profileMap.get(post._created_by);
          if (profile && profile.display_name) {
            userName = profile.display_name;
          }
        }

        // Get category and location info from state
        const category = categories.find(c => c.uuid === post.category_uuid);
        const location = locations.find(l => l.uuid === post.location_uuid);

        return {
          ...post,
          images,
          userName,
          categoryName: category?.name_ja || '未分類',
          categoryColor: category?.color || '#666',
          locationName: location?.name_en || location?.name_ja || 'Ej angivet'
        };
      });
      
      // Client-side search for title/description
      const filteredPosts = debouncedSearchTerm
        ? postsWithImages.filter(post =>
            post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
        : postsWithImages;
      
      if (requestId !== loadRequestIdRef.current) return;
      setAllPosts(filteredPosts);
      setPostsLoading(false);
    } catch (error) {
      console.error('Error loading filtered posts:', error);
      if (requestId === loadRequestIdRef.current) setPostsLoading(false);
    }
  };

  const loadPosts = async () => {
    const requestId = ++loadRequestIdRef.current;
    setPostsLoading(true);
    try {
      const postsData = await db.query('posts', { status: 'eq.active', _deleted: 'eq.0', is_hidden: 'eq.0', order: '_created_at.desc' });

      // ユーザー情報を一括取得してMapで引けるようにする
      // (投稿1件ごとに問い合わせると、投稿数が多い時に大きく遅くなるため)
      const profilesData = await db.query('user_profiles', { _deleted: 'eq.0' });
      const profileMap = new Map();
      profilesData.forEach((profile: any) => profileMap.set(profile.user_uuid, profile));

      // Parse images JSON for each post
      const postsWithImages = postsData.map(post => {
        let images = [];
        if (post.images) {
          try {
            if (typeof post.images === 'string') {
              images = JSON.parse(post.images);
            } else if (Array.isArray(post.images)) {
              images = post.images;
            }
            // Ensure images is an array
            if (!Array.isArray(images)) {
              images = [];
            }
          } catch (e) {
            console.warn('Error parsing images for post:', post._row_id, e);
            images = [];
          }
        }

        // Get user information from Maps (no additional DB query per post)
        let userName = 'SverigeJP スタッフ';
        if (post._created_by) {
          const profile = profileMap.get(post._created_by);
          if (profile && profile.display_name) {
            userName = profile.display_name;
          }
        }

        // Get category and location info from state
        const category = categories.find(c => c.uuid === post.category_uuid);
        const location = locations.find(l => l.uuid === post.location_uuid);

        return {
          ...post,
          images,
          userName,
          categoryName: category?.name_ja || '未分類',
          categoryColor: category?.color || '#666',
          locationName: location?.name_en || location?.name_ja || 'Ej angivet'
        };
      });
      
      // 古いイベントを表示から除外（1ヶ月前より古いイベントは非表示）
      const now = new Date();
      const oneMonthAgo = Math.floor(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime() / 1000);
      const postsFiltered = postsWithImages.filter(post => {
        if (post.post_type === 'event' && post.event_date) {
          // 終了日があれば、終了日が1ヶ月以上前でない限り表示を続ける
          const effectiveEnd = post.event_end_date || post.event_date;
          return effectiveEnd >= oneMonthAgo;
        }
        return true; // イベント以外は常に表示
      });
      
      if (requestId !== loadRequestIdRef.current) return;
      setAllPosts(postsFiltered);
      setPostsLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      if (requestId === loadRequestIdRef.current) setPostsLoading(false);
    }
  };

  const getCategoryName = (categoryUuid) => {
    const category = categories.find(c => c.uuid === categoryUuid);
    return category ? category.name_ja : '未分類';
  };

  const getSubcategoryName = (subcategoryUuid) => {
    const subcategory = subcategories.find(s => s.uuid === subcategoryUuid);
    return subcategory ? subcategory.name_ja : '';
  };

  const getLocationName = (locationId) => {
    const location = locations.find(l => l.uuid === locationId);
    return location ? location.name_en || location.name_ja : 'Ej angivet';
  };

  const getCategoryColor = (categoryUuid) => {
    const category = categories.find(c => c.uuid === categoryUuid);
    return category ? category.color : '#666';
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

  const formatDateShort = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Stockholm',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    return `${month}/${day}`;
  };

  // 開始月より後の月を見ている場合は「前月から継続中のイベント」として扱う。
  // 月別フィルター選択中はその月を基準に、未選択(ホーム画面)の場合は今月を基準にする。
  const isContinuingEvent = (post) => {
    if (!post.event_date) return false;
    const getYearMonth = (date: Date) => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: '2-digit'
      }).formatToParts(date);
      return {
        year: Number(parts.find(p => p.type === 'year')?.value),
        month: Number(parts.find(p => p.type === 'month')?.value)
      };
    };
    const reference = selectedMonth
      ? { year: Number(selectedMonth.split('-')[0]), month: Number(selectedMonth.split('-')[1]) }
      : getYearMonth(new Date());
    const eventStart = getYearMonth(new Date(post.event_date * 1000));
    const startedBeforeReference = eventStart.year < reference.year || (eventStart.year === reference.year && eventStart.month < reference.month);
    if (!startedBeforeReference) return false;
    if (!selectedMonth) {
      // ホーム画面では月フィルターが無いため、まだ終わっていないイベントのみ「継続」とする
      const effectiveEnd = post.event_end_date || post.event_date;
      return effectiveEnd >= Math.floor(Date.now() / 1000);
    }
    return true;
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    // 先月(-1) から6ヶ月先(+6) まで動的に生成
    for (let i = -1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      options.push({ 
        value: `${y}-${m.toString().padStart(2, '0')}`, 
        label: `${y}年${m}月` 
      });
    }
    
    return options;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              <Button type="button" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                <Search className="w-4 h-4 mr-2" />
                検索
              </Button>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNewPost}>
              <Plus className="w-4 h-4 mr-2" />
              新規投稿
            </Button>
          </div>

          {/* Categories and View Toggle */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('')}
              className={selectedCategory === '' ? 'text-white border-2' : 'border-2 bg-white hover:bg-gray-50'}
            >
              全て
            </Button>
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.uuid] || Home;
              return (
                <Button
                  key={category.uuid}
                  variant={selectedCategory === category.uuid ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.uuid)}
                  className={selectedCategory === category.uuid ? 'text-white border-2' : 'border-2 bg-white hover:bg-gray-50'}
                  style={{
                    backgroundColor: selectedCategory === category.uuid ? category.color : undefined,
                    borderColor: category.color,
                    borderWidth: '2px'
                  }}
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  {category.name_ja}
                </Button>
              );
            })}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center flex-wrap gap-1 text-sm text-gray-500 mb-4">
            <button onClick={() => handleCategoryChange('')} className="hover:text-blue-600 hover:underline">
              ホーム
            </button>
            {selectedCategory && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <button
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className={selectedSubcategory ? 'hover:text-blue-600 hover:underline' : 'text-gray-900 font-medium'}
                >
                  {getCategoryName(selectedCategory)}
                </button>
              </>
            )}
            {selectedSubcategory && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{getSubcategoryName(selectedSubcategory)}</span>
              </>
            )}
          </div>

          {/* Area Filter + View Mode Toggle (same row) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {AREA_FILTER_CATEGORIES.includes(selectedCategory) && (
                <>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">エリア別：</label>
                    <Select value={selectedArea} onValueChange={(value) => setSelectedArea(value === 'all' ? '' : value)}>
                      <SelectTrigger className="flex-1 md:w-64">
                        <SelectValue placeholder="すべてのエリア" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのエリア</SelectItem>
                        {Array.from(new Set(locations.map((loc: any) => loc.county)))
                          .filter(Boolean)
                          .sort((a: any, b: any) => {
                            if (a === 'Other') return 1;
                            if (b === 'Other') return -1;
                            if (a === 'Stockholm') return -1;
                            if (b === 'Stockholm') return 1;
                            if (a === 'Västra Götaland') return -1;
                            if (b === 'Västra Götaland') return 1;
                            return a.localeCompare(b);
                          })
                          .map((county: any) => (
                            <SelectItem key={county} value={county}>
                              {getCountyNameWithKatakana(county)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* モバイル用サブカテゴリーPulldown - エリア別のすぐ次に表示 */}
                  {(selectedCategory === 'cat-services' || selectedCategory === 'cat-for-sale' || selectedCategory === 'cat-events') && (
                    <div className="md:hidden w-full flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">カテゴリ：</label>
                      <Select
                        value={selectedSubcategory || 'all'}
                        onValueChange={(value) => handleSubcategoryChange(value === 'all' ? '' : value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="サブカテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {selectedCategory === 'cat-for-sale' ? '📦' : selectedCategory === 'cat-events' ? '📅' : '🔸'} すべて
                          </SelectItem>
                          {selectedCategory === 'cat-services' &&
                            SERVICE_SUBCATEGORY_GROUPS.find((g) => g.label === selectedServiceGroup)?.items.map((itemName) => {
                              const sub = subcategories.find(
                                (s: any) => s.category_uuid === 'cat-services' && s.name_ja === itemName
                              );
                              if (!sub) return null;
                              const count = subcategoryCounts[sub.uuid] || 0;
                              return (
                                <SelectItem key={sub.uuid} value={sub.uuid}>
                                  {SERVICE_SUBCATEGORY_EMOJI[itemName] || '🔸'} {itemName} ({count})
                                </SelectItem>
                              );
                            })}
                          {selectedCategory === 'cat-for-sale' &&
                            FOR_SALE_SUBCATEGORIES.map((itemName) => {
                              const sub = subcategories.find(
                                (s: any) => s.category_uuid === 'cat-for-sale' && s.name_ja === itemName
                              );
                              if (!sub) return null;
                              const count = subcategoryCounts[sub.uuid] || 0;
                              return (
                                <SelectItem key={sub.uuid} value={sub.uuid}>
                                  {FOR_SALE_SUBCATEGORY_EMOJI[itemName] || '🔸'} {itemName} ({count})
                                </SelectItem>
                              );
                            })}
                          {selectedCategory === 'cat-events' &&
                            EVENT_SUBCATEGORIES.map((itemName) => {
                              const sub = subcategories.find(
                                (s: any) => s.category_uuid === 'cat-events' && s.name_ja === itemName
                              );
                              if (!sub) return null;
                              const count = subcategoryCounts[sub.uuid] || 0;
                              return (
                                <SelectItem key={sub.uuid} value={sub.uuid}>
                                  {EVENT_SUBCATEGORY_EMOJI[itemName] || '🔸'} {itemName} ({count})
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedCategory === 'cat-for-sale' && (
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">最新投稿</SelectItem>
                        <SelectItem value="oldest">古い投稿</SelectItem>
                        <SelectItem value="price_low">最安値</SelectItem>
                        <SelectItem value="price_high">最高値</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <div className="flex gap-2">
                  {selectedCategory === 'cat-for-sale' && (
                    <Popover open={isPriceFilterOpen} onOpenChange={(open) => {
                      setIsPriceFilterOpen(open);
                      if (open) setIsConditionFilterOpen(false);
                    }}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`px-3 py-2 rounded-md border text-sm font-medium ${
                            priceFilterFree || priceFilterMin || priceFilterMax
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          価格
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-sm">価格で絞り込み</span>
                          <button type="button" onClick={() => setIsPriceFilterOpen(false)}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={priceFilterFree}
                            onChange={(e) => setPriceFilterFree(e.target.checked)}
                            className="w-4 h-4"
                          />
                          無料のみ
                        </label>
                        <div className={`flex items-center gap-2 mb-4 ${priceFilterFree ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-gray-500 text-sm">SEK</span>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="min"
                              value={priceFilterMin}
                              disabled={priceFilterFree}
                              onChange={(e) => setPriceFilterMin(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <span className="text-gray-400">〜</span>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-gray-500 text-sm">SEK</span>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="max"
                              value={priceFilterMax}
                              disabled={priceFilterFree}
                              onChange={(e) => setPriceFilterMax(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => setIsPriceFilterOpen(false)}
                        >
                          適用
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                  {selectedCategory === 'cat-for-sale' && (
                    <Popover open={isConditionFilterOpen} onOpenChange={(open) => {
                      setIsConditionFilterOpen(open);
                      if (open) setIsPriceFilterOpen(false);
                    }}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`px-3 py-2 rounded-md border text-sm font-medium ${
                            selectedConditions.length > 0
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          コンディション
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-sm">コンディションで絞り込み</span>
                          <button type="button" onClick={() => setIsConditionFilterOpen(false)}>
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {CONDITION_FILTER_OPTIONS.map((option) => {
                            const isActive = selectedConditions.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSelectedConditions((prev) =>
                                    isActive
                                      ? prev.filter((v) => v !== option.value)
                                      : [...prev, option.value]
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                  isActive
                                    ? 'border-blue-500 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => setIsConditionFilterOpen(false)}
                        >
                          適用
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                  </div>
                </>
              )}
            </div>
            <div className="inline-flex rounded-md border overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                リスト
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 flex items-center gap-1 text-sm border-l ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                カード
              </button>
              <button
                onClick={() => setViewMode('images')}
                className={`px-3 py-2 flex items-center gap-1 text-sm border-l ${
                  viewMode === 'images' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                画像のみ
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 flex items-center gap-1 text-sm border-l ${
                  viewMode === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        </div>

        {/* ハロウィンイベントバナー */}
        <Link to="/?category=cat-events&subcategory=sub-events-other" className="block mb-6">
          <img
            src="/content/uploads/helloween.jpg"
            alt="ハロウィンイベント"
            className="w-full md:w-1/2 rounded-lg"
          />
        </Link>

        {/* Month Filter for Events - Only show when events category is selected */}
        {selectedCategory === 'cat-events' && (
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">イベント月別：</label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Subcategory Grid for Services - Only show when services category is selected */}
        {selectedCategory === 'cat-services' && (
          <div className="mb-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900">
              <p>🇯🇵 のマークは、日本人または日系人、日系企業が経営・関係しているサービスを表しています。</p>
              <p className="mt-1">日本語対応のサービス、オススメのサービスをご存知でしたら、ぜひ support@sverige.jp までご情報をお寄せください。</p>
            </div>
            <div className="flex gap-2 mb-4">
              {SERVICE_SUBCATEGORY_GROUPS.map((group) => (
                <button
                  key={group.label}
                  onClick={() => setSelectedServiceGroup(group.label)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    selectedServiceGroup === group.label
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            {SERVICE_SUBCATEGORY_GROUPS.filter((group) => group.label === selectedServiceGroup).map((group) => (
              <div key={group.label} className="mb-6">
                <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {group.items.map((itemName) => {
                    const sub = subcategories.find(
                      (s: any) => s.category_uuid === 'cat-services' && s.name_ja === itemName
                    );
                    if (!sub) return null;
                    const isActive = selectedSubcategory === sub.uuid;
                    const count = subcategoryCounts[sub.uuid] || 0;
                    return (
                      <button
                        key={sub.uuid}
                        onClick={() => handleSubcategoryChange(sub.uuid)}
                        className={`p-2.5 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <span className="text-2xl mb-1">{SERVICE_SUBCATEGORY_EMOJI[itemName] || '🔸'}</span>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="font-medium text-gray-700 line-clamp-1">{itemName}</span>
                            <span className="text-gray-500 whitespace-nowrap">({count})</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subcategory Grid for For-Sale - Only show when for-sale category is selected */}
        {selectedCategory === 'cat-for-sale' && (
          <div className="mb-6">
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-2">
              <button
                onClick={() => handleSubcategoryChange('')}
                className={`p-2.5 rounded-lg border-2 transition-all ${
                  !selectedSubcategory
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">📦</span>
                  <span className="font-medium text-gray-700 text-xs">すべて</span>
                </div>
              </button>
              {FOR_SALE_SUBCATEGORIES.map((itemName) => {
                const sub = subcategories.find(
                  (s: any) => s.category_uuid === 'cat-for-sale' && s.name_ja === itemName
                );
                if (!sub) return null;
                const isActive = selectedSubcategory === sub.uuid;
                const count = subcategoryCounts[sub.uuid] || 0;
                return (
                  <button
                    key={sub.uuid}
                    onClick={() => handleSubcategoryChange(sub.uuid)}
                    className={`p-2.5 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-2xl mb-1">{FOR_SALE_SUBCATEGORY_EMOJI[itemName] || '🔸'}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium text-gray-700 line-clamp-1">{itemName}</span>
                        <span className="text-gray-500 whitespace-nowrap">({count})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subcategory Grid for Events - Only show when events category is selected */}
        {selectedCategory === 'cat-events' && (
          <div className="mb-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900">
              🇯🇵 のマークは、日本人または日系人、日系企業が関係しているイベントです。
            </div>
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-2">
              {EVENT_SUBCATEGORIES.map((itemName) => {
                const sub = subcategories.find(
                  (s: any) => s.category_uuid === 'cat-events' && s.name_ja === itemName
                );
                if (!sub) return null;
                const isActive = selectedSubcategory === sub.uuid;
                const count = subcategoryCounts[sub.uuid] || 0;
                return (
                  <button
                    key={sub.uuid}
                    onClick={() => handleSubcategoryChange(sub.uuid)}
                    className={`p-2.5 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-2xl mb-1">{EVENT_SUBCATEGORY_EMOJI[itemName] || '🔸'}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium text-gray-700 line-clamp-1">{itemName}</span>
                        <span className="text-gray-500 whitespace-nowrap">({count})</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Display based on View Mode */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <Card key={post._row_id} className="hover:shadow-lg transition-shadow min-w-0">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <CardTitle className="text-lg line-clamp-2 break-words">
                        <Link to={`/post/${post._row_id}`} className="hover:text-blue-600 transition-colors">
                          {post.post_type === 'event' && isContinuingEvent(post) && '（前月継続）'}
                          {post.title}
                        </Link>
                      </CardTitle>
                      {/* Date and Price row */}
                      {post.post_type === 'event' && post.event_date_readable && (
                        <div className="mt-2 text-xs min-w-0">
                          <span className="font-semibold text-purple-600 truncate block">
                            📅 {post.event_date_readable}{isContinuingEvent(post) && '（前月継続）'}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {post.post_type !== 'service' && post.category_uuid !== 'cat-services' && (
                          <span>{formatDate(post._created_at)}</span>
                        )}
                        {post.category_uuid === 'cat-job-seeking' && post.employment_type && (
                          <span className="font-semibold text-blue-600">
                            {employmentTypeLabels[post.employment_type] || post.employment_type}
                          </span>
                        )}
                        {post.post_type === 'free' && !['cat-services', 'cat-job-seeking', 'cat-housing'].includes(post.category_uuid) && post.price && (
                          <span className="font-semibold text-green-600">
                            {formatPrice(post.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                      {/* Images */}
                      <div className="mb-4">
                        <div className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden">
                          <img 
                                src={
                                  post.images && Array.isArray(post.images) && post.images.length > 0 && post.images[0]
                                    ? post.images[0] 
                                    : '/content/templates/sverige_blank.png'
                                }
                            alt="投稿画像"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== '/content/templates/sverige_blank.png') {
                                target.src = '/content/templates/sverige_blank.png';
                              }
                            }}
                          />
                          {post.images && Array.isArray(post.images) && post.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                              {post.images.length}枚の画像
                            </div>
                          )}
                        </div>
                      </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                    {post.description}
                  </p>
                  {post.category_uuid && (
                    <button
                      onClick={() => {
                        setSelectedCategory(post.category_uuid);
                        setSearchParams({ category: post.category_uuid });
                      }}
                      className="flex items-center text-xs text-blue-600 mb-2 hover:underline"
                    >
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(post.category_uuid)}
                      </Badge>
                      {post.subcategory_uuid && (
                        <span className="ml-2 text-gray-700">
                          {' > '}{getSubcategoryName(post.subcategory_uuid)}
                        </span>
                      )}
                    </button>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <User className="w-3 h-3 mr-1" />
                    {post.userName || 'SverigeJP スタッフ'}
                  </div>
                  {post.location_uuid && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <Home className="w-3 h-3 mr-1" />
                      {getLocationName(post.location_uuid)}
                    </div>
                  )}
                  {(post.postal_code || post.zip_code) && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.postal_code || post.zip_code}
                    </div>
                  )}
                  {post.brand && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <span className="font-medium">ブランド:</span> {post.brand}
                    </div>
                  )}
                  {post.model_name && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <span className="font-medium">モデル:</span> {post.model_name}
                    </div>
                  )}
                  {post.size_dimensions && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <span className="font-medium">サイズ:</span> {post.size_dimensions}
                    </div>
                  )}
                  {post.company_name && (
                    <div className="flex items-center mb-2 text-xs text-gray-500">
                      <span className="font-medium">会社:</span> {post.company_name}
                    </div>
                  )}
                  {post.salary && (
                    <div className="flex items-center mb-2 text-xs text-green-600">
                      <span className="font-medium text-gray-700">給料:</span> {post.salary}
                    </div>
                  )}
                  {/* Employment type and experience level */}
                  <div className="flex gap-2 text-xs text-gray-600 mb-2">
                    {post.employment_type && (
                      <span>
                        {employmentTypeLabels[post.employment_type] || post.employment_type}
                      </span>
                    )}
                    {post.experience_level && (
                      <span>
                        {experienceLevelLabels[post.experience_level] || post.experience_level}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link to={`/post/${post._row_id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full"
                      >
                        詳細を見る
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : selectedCategory === '' && !searchTerm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories
                  .filter(cat => cat._deleted !== 1)
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((category) => {
                    // Special handling for bulletin board category - use forum_topics instead of posts
                    const isBulletinBoard = category.uuid === 'cat-bulletin';
                    const isEventsBoard = category.uuid === 'cat-events';
                    const isServicesBoard = category.uuid === 'cat-services';
                    const isForSaleBoard = category.uuid === 'cat-for-sale';
                    let categoryItems;
                    if (isBulletinBoard) {
                      categoryItems = forumTopics.slice(0, 8);
                    } else if (isEventsBoard) {
                      // イベントお知らせは投稿日ではなく、今日以降のイベント開催日順(近い順)で表示する
                      const now = new Date();
                      const startOfToday = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
                      categoryItems = allPosts
                        .filter(post =>
                          post.category_uuid === category.uuid &&
                          post.status === 'active' &&
                          post.event_date &&
                          // 終了日があるイベント(展示会など)は、まだ終わっていなければ表示する
                          (post.event_end_date || post.event_date) >= startOfToday
                        )
                        .sort((a, b) => {
                          // 前月から継続中のイベントは後回しにする
                          const aContinuing = isContinuingEvent(a);
                          const bContinuing = isContinuingEvent(b);
                          if (aContinuing !== bContinuing) {
                            return aContinuing ? 1 : -1;
                          }
                          return a.event_date - b.event_date;
                        })
                        .slice(0, 8);
                    } else {
                      categoryItems = allPosts
                        .filter(post => post.category_uuid === category.uuid && post.status === 'active')
                        .sort((a, b) => b._created_at - a._created_at)
                        .slice(0, 8);
                    }
                    
                    const CategoryIcon = categoryIcons[category.uuid] || List;
                    
                    return (
                      <div key={category.uuid} className="bg-white rounded-lg border">
                        {/* Category Header */}
                        <div className="border-b p-3">
                          {isBulletinBoard ? (
                            <Link to="/forum" className="block">
                              <div className="flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors rounded p-1 -m-1 cursor-pointer">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CategoryIcon className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} />
                                  <h2 className="text-base font-semibold hover:text-blue-600 transition-colors truncate">{category.name_ja}</h2>
                                </div>
                                {categoryItems.length > 0 && (
                                  <span className="text-blue-600 text-xs flex items-center gap-1 flex-shrink-0">
                                    もっと見る
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleCategoryChange(category.uuid)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors rounded p-1 -m-1 cursor-pointer">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CategoryIcon className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} />
                                  <h2 className="text-base font-semibold hover:text-blue-600 transition-colors truncate">{category.name_ja}</h2>
                                </div>
                                {categoryItems.length > 0 && (
                                  <span className="text-blue-600 text-xs flex items-center gap-1 flex-shrink-0">
                                    もっと見る
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </button>
                          )}
                        </div>
                        
                        {/* Category Posts/Topics */}
                        <div className="p-3">
                          {categoryItems.length === 0 ? (
                            <p className="text-gray-500 text-xs py-2">投稿がありません</p>
                          ) : (
                            <div className="space-y-0">
                              {categoryItems.map((item, index) => (
                                <Link
                                  key={item._row_id}
                                  to={isBulletinBoard ? `/forum/${item._row_id}` : `/post/${item._row_id}`}
                                  className={`block hover:bg-gray-50 transition-colors ${
                                    index < categoryItems.length - 1 ? 'border-b border-dotted border-gray-200' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2 py-1.5 px-1 min-w-0">
                                    {!isServicesBoard && (
                                      <span className={`text-xs text-gray-500 whitespace-nowrap flex-shrink-0 ${isEventsBoard ? '' : 'w-12'}`}>
                                        {formatDateShort(isEventsBoard && item.event_date ? item.event_date : item._created_at)}
                                      </span>
                                    )}
                                    {isEventsBoard && item.subcategory_uuid && (
                                      <span
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedCategory('cat-events');
                                          setSelectedSubcategory(item.subcategory_uuid);
                                          setSelectedArea('');
                                          setSearchParams({ category: 'cat-events', subcategory: item.subcategory_uuid });
                                        }}
                                        className="text-base flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                        title={getSubcategoryName(item.subcategory_uuid)}
                                      >
                                        {EVENT_SUBCATEGORY_EMOJI[getSubcategoryName(item.subcategory_uuid)] || '🔸'}
                                      </span>
                                    )}
                                    {isServicesBoard && item.subcategory_uuid && (
                                      <span
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedCategory('cat-services');
                                          setSelectedSubcategory(item.subcategory_uuid);
                                          setSelectedArea('');
                                          setSearchParams({ category: 'cat-services', subcategory: item.subcategory_uuid });
                                        }}
                                        className="text-base flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                        title={getSubcategoryName(item.subcategory_uuid)}
                                      >
                                        {SERVICE_SUBCATEGORY_EMOJI[getSubcategoryName(item.subcategory_uuid)] || '🔸'}
                                      </span>
                                    )}
                                    {isForSaleBoard && item.subcategory_uuid && (
                                      <span
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedCategory('cat-for-sale');
                                          setSelectedSubcategory(item.subcategory_uuid);
                                          setSelectedArea('');
                                          setSearchParams({ category: 'cat-for-sale', subcategory: item.subcategory_uuid });
                                        }}
                                        className="text-base flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                        title={getSubcategoryName(item.subcategory_uuid)}
                                      >
                                        {FOR_SALE_SUBCATEGORY_EMOJI[getSubcategoryName(item.subcategory_uuid)] || '🔸'}
                                      </span>
                                    )}
                                    <span className="text-xs truncate flex-1 min-w-0 leading-tight">
                                      {isEventsBoard && isContinuingEvent(item) && '（前月継続）'}
                                      {item.title}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* Traditional list view - for search results or specific category */
              <div className="space-y-3">
                {currentPosts.map((post) => (
                  <Card key={post._row_id} className="hover:shadow-lg transition-shadow min-w-0">
                    <CardContent className="p-3">
                        {/* Image + Content + Action row */}
                        <div className="flex gap-3 items-start">
                            {/* Thumbnail */}
                            <div className="flex-shrink-0">
                              <Link to={`/post/${post._row_id}`}>
                                <div className="w-20 h-20 rounded overflow-hidden bg-gray-100">
                                  <img
                                    src={
                                      post.images && Array.isArray(post.images) && post.images.length > 0 && post.images[0]
                                        ? post.images[0]
                                        : '/content/templates/sverige_blank.png'
                                    }
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== '/content/templates/sverige_blank.png') {
                                        target.src = '/content/templates/sverige_blank.png';
                                      }
                                    }}
                                  />
                                </div>
                              </Link>
                            </div>
                            {/* Area / Title / Date & Price / Description */}
                            <div className="flex-1 min-w-0">
                              {post.location_uuid && (
                                <p className="text-xs text-gray-500 truncate mb-0.5">
                                  {getLocationName(post.location_uuid)}
                                </p>
                              )}
                              <Link to={`/post/${post._row_id}`} className="block w-full overflow-hidden">
                                <h3 className="text-base font-semibold line-clamp-2 break-words hover:text-blue-600 transition-colors cursor-pointer">{post.post_type === 'event' && isContinuingEvent(post) && '（前月継続）'}{post.title}</h3>
                              </Link>
                              {post.post_type === 'event' && post.event_date_readable && (
                                <div className="mt-1 text-xs min-w-0">
                                  <span className="font-semibold text-purple-600 truncate block">
                                    📅 {post.event_date_readable}{isContinuingEvent(post) && '（前月継続）'}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                {post.post_type !== 'service' && post.category_uuid !== 'cat-services' && (
                                  <span>{formatDate(post._created_at)}</span>
                                )}
                                {post.category_uuid === 'cat-job-seeking' && post.employment_type && (
                                  <span className="font-semibold text-blue-600">
                                    {employmentTypeLabels[post.employment_type] || post.employment_type}
                                  </span>
                                )}
                                {post.post_type === 'free' && !['cat-services', 'cat-job-seeking', 'cat-housing'].includes(post.category_uuid) && post.price && (
                                  <span className="font-semibold text-green-600">
                                    {formatPrice(post.price)}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                                {post.description}
                              </p>
                            </div>
                            {/* Action */}
                            <div className="flex items-center flex-shrink-0">
                              <Link to={`/post/${post._row_id}`}>
                                <Button variant="outline" size="sm">
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                        </div>
                        {/* Tags */}
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            {post.category_uuid && (
                              <button
                                onClick={() => {
                                  setSelectedCategory(post.category_uuid);
                                  setSearchParams({ category: post.category_uuid });
                                }}
                                className="flex items-center text-blue-700 hover:underline"
                              >
                                <span className="font-medium">{getCategoryName(post.category_uuid)}</span>
                                {post.subcategory_uuid && (
                                  <span className="ml-1">
                                    {' > '}{getSubcategoryName(post.subcategory_uuid)}
                                  </span>
                                )}
                              </button>
                            )}
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {post.userName || 'SverigeJP スタッフ'}
                            </span>
                            {post.location_uuid && (
                              <span className="flex items-center">
                                <Home className="w-3 h-3 mr-1" />
                                {getLocationName(post.location_uuid)}
                              </span>
                            )}
                            {(post.postal_code || post.zip_code) && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {post.postal_code || post.zip_code}
                              </span>
                            )}
                            {post.brand && (
                              <span className="flex items-center">
                                <span className="font-medium">ブランド:</span> {post.brand}
                              </span>
                            )}
                            {post.model_name && (
                              <span className="flex items-center">
                                <span className="font-medium">モデル:</span> {post.model_name}
                              </span>
                            )}
                            {post.size_dimensions && (
                              <span className="flex items-center">
                                <span className="font-medium">サイズ:</span> {post.size_dimensions}
                              </span>
                            )}
                            {post.company_name && (
                              <span className="flex items-center">
                                <span className="font-medium">会社:</span> {post.company_name}
                              </span>
                            )}
                            {post.salary && (
                              <span className="flex items-center font-semibold text-green-600">
                                <span className="font-medium text-gray-700">給料:</span> {post.salary}
                              </span>
                            )}
                            {post.employment_type && (
                              <span className="flex items-center">
                                <span className="font-medium">形態:</span> {employmentTypeLabels[post.employment_type] || post.employment_type}
                              </span>
                            )}
                            {post.experience_level && (
                              <span className="flex items-center">
                                <span className="font-medium">経験:</span> {experienceLevelLabels[post.experience_level] || post.experience_level}
                              </span>
                            )}
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Images Only View */}
        {viewMode === 'images' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentPosts.map((post) => (
              <Link key={post._row_id} to={`/post/${post._row_id}`}>
                <div className="flex flex-col gap-1 hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square rounded overflow-hidden bg-gray-100 group">
                    <img 
                      src={
                        post.images && Array.isArray(post.images) && post.images.length > 0 && post.images[0]
                          ? post.images[0]
                          : '/content/templates/sverige_blank.png'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/content/templates/sverige_blank.png') {
                          target.src = '/content/templates/sverige_blank.png';
                        }
                      }}
                    />
                    {post.images && post.images.length > 1 && (
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-xs">
                        {post.images.length}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(post._created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Map View - Shows location dots on map */}
        {viewMode === 'map' && (
          <div className="space-y-4">
            {allPosts.filter(p => p.location_uuid).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">地図表示できる投稿がありません</h3>
                <p className="text-gray-500">場所を指定した投稿のみ地図に表示されます</p>
              </div>
            ) : (
              <>
                {/* Real Map using Leaflet */}
                <MapView 
                  posts={allPosts}
                  locations={locations}
                  onPostClick={(postId) => setSelectedMapPost(postId)}
                  selectedPostId={selectedMapPost}
                  getCategoryName={getCategoryName}
                  getCategoryColor={getCategoryColor}
                  getLocationName={getLocationName}
                  formatDate={formatDate}
                  userCounty={userCounty}
                />

                {/* Location Legend */}
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-2 text-sm">📍 場所一覧（最大50件）</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {allPosts.filter(p => p.location_uuid).slice(0, 50).map((post, index) => (
                      <button
                        key={post._row_id}
                        onClick={() => setSelectedMapPost(post._row_id)}
                        className={`
                          text-left p-2 rounded border text-sm transition-all
                          ${selectedMapPost === post._row_id 
                            ? 'bg-blue-100 border-blue-500' 
                            : 'bg-gray-50 hover:bg-gray-100'
                          }
                        `}
                      >
                        <div className="font-medium line-clamp-1">{post.title}</div>
                        <div className="text-xs text-gray-500">{getLocationName(post.location_uuid)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!postsLoading && posts.length === 0 && !(selectedCategory === '' && !searchTerm) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">投稿が見つかりません</h3>
            <p className="text-gray-500">検索条件を変えてみてください</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !(selectedCategory === '' && !searchTerm) && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              前へ
            </Button>
            
            <div className="flex space-x-1">
              {visiblePageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Auth and Post Modals */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onPostCreated={handlePostCreated}
          user={user}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;