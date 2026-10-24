import { useState, useEffect } from 'react';
import { User, Settings, Trash2, Edit, Phone, Mail, Calendar, MapPin, Camera, Upload, Truck, CircleX, RotateCcw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useNavigate } from 'react-router-dom';
import auth from '@/lib/shared/kliv-auth';
import db from '@/lib/shared/kliv-database';
import content from '@/lib/shared/kliv-content';
import { toAsciiFile } from '@/lib/asciiFilename';
import { compressImage, ABUSE_MAX_BYTES } from '@/lib/imageCompression';
import { useToast } from '@/hooks/use-toast';
import { PostModal } from '@/components/PostModal';
import Footer from '@/components/Footer';
import { statusLabels, postTypeLabels } from '@/constants/postLabels';

// プロフィールの居住国の選択肢(日本人が多く住む国から)
const COUNTRY_OPTIONS = [
  'スウェーデン',
  '日本',
  'アメリカ',
  'デンマーク',
  'ノルウェー',
  'フィンランド',
  'イギリス',
  'ドイツ',
  'フランス',
  'イタリア',
  'スペイン',
  'その他',
];

// スウェーデンを選んだ場合のみ、県・市は投稿フォームと同じ構造化データ(locations)を使う。
// それ以外の国は県・市の仕組みが大きく異なるため自由入力にする。
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

// スウェーデン以外の国でも、県・州・地方レベルは選択式にする(市は自由入力)。
const REGION_OPTIONS_BY_COUNTRY: Record<string, string[]> = {
  '日本': [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ],
  'アメリカ': [
    'アラバマ州', 'アラスカ州', 'アリゾナ州', 'アーカンソー州', 'カリフォルニア州',
    'コロラド州', 'コネチカット州', 'デラウェア州', 'フロリダ州', 'ジョージア州',
    'ハワイ州', 'アイダホ州', 'イリノイ州', 'インディアナ州', 'アイオワ州',
    'カンザス州', 'ケンタッキー州', 'ルイジアナ州', 'メイン州', 'メリーランド州',
    'マサチューセッツ州', 'ミシガン州', 'ミネソタ州', 'ミシシッピ州', 'ミズーリ州',
    'モンタナ州', 'ネブラスカ州', 'ネバダ州', 'ニューハンプシャー州', 'ニュージャージー州',
    'ニューメキシコ州', 'ニューヨーク州', 'ノースカロライナ州', 'ノースダコタ州', 'オハイオ州',
    'オクラホマ州', 'オレゴン州', 'ペンシルベニア州', 'ロードアイランド州', 'サウスカロライナ州',
    'サウスダコタ州', 'テネシー州', 'テキサス州', 'ユタ州', 'バーモント州',
    'バージニア州', 'ワシントン州', 'ウェストバージニア州', 'ウィスコンシン州', 'ワイオミング州',
    'ワシントンD.C.',
  ],
  'デンマーク': [
    '首都地域(ホヴェストーデン)', 'シェラン地域', '南デンマーク地域', '中央ユラン地域', '北ユラン地域',
  ],
  'ノルウェー': [
    'オスロ', 'ロガラン', 'ヴェストラン', 'ムーレ・オ・ロムスダール', 'トロンデラーグ',
    'ノールラン', 'トロムス・オ・フィンマルク', 'インランデット', 'ヴィーケン', 'アグデル',
    'ヴェストフォル・オ・テレマルク',
  ],
  'フィンランド': [
    'ウーシマー', '南西フィンランド', 'サタクンタ', 'カンタ=ハメ', 'ピルカンマー',
    'パイヤト=ハメ', 'キュメンラークソ', '南カルヤラ', '南サヴォ', '北サヴォ',
    '北カルヤラ', '中部フィンランド', '南ポホヤンマー', 'ポホヤンマー', '中部ポホヤンマー',
    '北ポホヤンマー', 'カイヌー', 'ラップランド', 'オーランド諸島',
  ],
  'イギリス': [
    'ロンドン', 'イングランド南東部', 'イングランド南西部', 'イングランド東部', '東ミッドランズ',
    '西ミッドランズ', 'ヨークシャー・アンド・ザ・ハンバー', 'イングランド北西部', 'イングランド北東部',
    'スコットランド', 'ウェールズ', '北アイルランド',
  ],
  'ドイツ': [
    'バーデン=ヴュルテンベルク州', 'バイエルン州', 'ベルリン', 'ブランデンブルク州', 'ブレーメン',
    'ハンブルク', 'ヘッセン州', 'メクレンブルク=フォアポンメルン州', 'ニーダーザクセン州',
    'ノルトライン=ヴェストファーレン州', 'ラインラント=プファルツ州', 'ザールラント州', 'ザクセン州',
    'ザクセン=アンハルト州', 'シュレースヴィヒ=ホルシュタイン州', 'テューリンゲン州',
  ],
  'フランス': [
    'オーヴェルニュ=ローヌ=アルプ', 'ブルゴーニュ=フランシュ=コンテ', 'ブルターニュ',
    'サントル=ヴァル・ド・ロワール', 'コルシカ', 'グラン・テスト', 'オー=ド=フランス',
    'イル=ド=フランス', 'ノルマンディー', 'ヌーヴェル=アキテーヌ', 'オクシタニー',
    'ペイ・ド・ラ・ロワール', 'プロヴァンス=アルプ=コート・ダジュール',
  ],
  'イタリア': [
    'ピエモンテ', 'ヴァッレ・ダオスタ', 'リグリア', 'ロンバルディア', 'トレンティーノ=アルト・アディジェ',
    'ヴェネト', 'フリウリ=ヴェネツィア・ジュリア', 'エミリア=ロマーニャ', 'トスカーナ', 'ウンブリア',
    'マルケ', 'ラツィオ', 'アブルッツォ', 'モリーゼ', 'カンパニア', 'プーリア', 'バジリカータ',
    'カラブリア', 'シチリア', 'サルデーニャ',
  ],
  'スペイン': [
    'アンダルシア', 'アラゴン', 'アストゥリアス', 'バレアレス諸島', 'カナリア諸島', 'カンタブリア',
    'カスティーリャ・イ・レオン', 'カスティーリャ=ラ・マンチャ', 'カタルーニャ', 'エストレマドゥーラ',
    'ガリシア', 'マドリード', 'ムルシア', 'ナバラ', 'バスク', 'リオハ', 'バレンシア',
  ],
};

const categoryIcons = {
  'cat-for-sale': '🛍️',
  'cat-wanted': '🔍',
  'cat-job-offering': '💼',
  'cat-job-seeking': '👤',
  'cat-services': '🔧',
  'cat-housing': '🏠',
  'cat-events': '📅'
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  // 電話番号は本人と管理者だけが読める member_contacts に保存する(user_profiles は誰でも読めるため)
  const [contactPhone, setContactPhone] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');
  const [userForumTopics, setUserForumTopics] = useState([]);
  const [deletingForumTopic, setDeletingForumTopic] = useState(null);
  const [userForumReplies, setUserForumReplies] = useState([]);
  const [deletingForumReply, setDeletingForumReply] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: '',
    phone: '',
    country: 'スウェーデン',
    county: '',
    city: '',
    contact_pref: 'email'
  });
  const [locations, setLocations] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [trackingPost, setTrackingPost] = useState(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [togglingPost, setTogglingPost] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await auth.getUser();
      if (!currentUser) {
        toast({
          title: "ログインが必要です",
          description: "プロフィールを見るにはログインしてください。",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      setUser(currentUser);
      
      // Load locations for county dropdown
      const locationsData = await db.query('locations', { _deleted: 'eq.0' });
      setLocations(locationsData);
      
      // Load user profile
      const profiles = await db.query('user_profiles', { 
        user_uuid: `eq.${currentUser.userUuid}` 
      });
      
      const contacts = await db.query('member_contacts', { _created_by: `eq.${currentUser.userUuid}` });
      const phone = typeof contacts[0]?.phone === 'string' ? contacts[0].phone : '';
      setContactPhone(phone);
      setEditForm(prev => ({ ...prev, phone }));

      if (profiles.length > 0) {
        const profile = profiles[0];
        setUserProfile(profile);
        setEditForm({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          phone,
          country: profile.country || 'スウェーデン',
          county: profile.county || '',
          city: profile.city || '',
          contact_pref: profile.contact_pref || 'email'
        });
      }
      
      // 登録日は Kliv アカウントの作成日、無ければプロフィールの作成日
      setUserCreatedAt(currentUser.createdOn ?? (profiles.length > 0 ? profiles[0]._created_at : null));
      
      // Load user posts
      const posts = await db.query('posts', { 
        _created_by: `eq.${currentUser.userUuid}`,
        status: 'neq.removed'
      });
      
      // Filter out any invalid posts and parse images
      const validPosts = posts.filter(post => post && post._row_id);
      const postsWithImages = validPosts.map(post => {
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
        return { ...post, images };
      });
      
      setUserPosts(postsWithImages.sort((a, b) => b._created_at - a._created_at));

      // Load user's own forum topics
      try {
        const forumTopics = await db.query('forum_topics', {
          _created_by: `eq.${currentUser.userUuid}`,
          order: '_created_at.desc'
        });
        setUserForumTopics(forumTopics || []);
      } catch (error) {
        console.error('Error loading forum topics:', error);
      }

      // Load user's own forum replies (他人が立てたトピックへの返信も含む)
      try {
        const forumReplies = await db.query('forum_replies', {
          _created_by: `eq.${currentUser.userUuid}`,
          order: '_created_at.desc'
        });
        const topicIds = Array.from(new Set((forumReplies || []).map((reply: any) => reply.topic_id)));
        const topicsById: Record<number, any> = {};
        await Promise.all(topicIds.map(async (topicId) => {
          try {
            const topicData = await db.get('forum_topics', topicId);
            if (topicData) topicsById[topicId] = topicData;
          } catch (error) {
            console.error('Error loading topic for reply:', error);
          }
        }));
        setUserForumReplies(
          (forumReplies || []).map((reply: any) => ({
            ...reply,
            topic_title: topicsById[reply.topic_id]?.title || '(削除されたトピック)'
          }))
        );
      } catch (error) {
        console.error('Error loading forum replies:', error);
      }

      // Load unread message count
      try {
        const unreadMessages = await db.query('messages', {
          to_uuid: `eq.${currentUser.userUuid}`,
          is_read: 'eq.0',
          _deleted: 'eq.0'
        });
        setUnreadCount(unreadMessages.length);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const trimmedDisplayName = editForm.display_name.trim();

      if (trimmedDisplayName) {
        const existingProfiles = await db.query('user_profiles', {
          display_name: `eq.${trimmedDisplayName}`
        });
        const isDuplicate = existingProfiles.some(
          (p) => p.user_uuid !== user.userUuid
        );
        if (isDuplicate) {
          toast({
            title: "この表示名は既に使われています",
            description: "別の表示名を入力してください",
            variant: "destructive"
          });
          return;
        }
      }

      console.log('Saving profile with editForm:', editForm);
      const now = Math.floor(Date.now() / 1000);
      const { phone, ...publicFields } = editForm;

      if (userProfile) {
        console.log('Updating existing profile:', userProfile);
        await db.update('user_profiles',
          { user_uuid: `eq.${user.userUuid}` },
          {
            ...publicFields,
            last_active: now,
            _updated_at: now
          }
        );
        console.log('Profile updated successfully');
      } else {
        console.log('Creating new profile');
        await db.insert('user_profiles', {
          user_uuid: user.userUuid,
          ...publicFields,
          last_active: now
        });
        console.log('Profile created successfully');
      }

      // 電話番号は本人の member_contacts 行(1会員1行)に保存する
      const contacts = await db.query('member_contacts', { _created_by: `eq.${user.userUuid}` });
      if (contacts.length === 0) {
        await db.insert('member_contacts', { phone });
      } else if ((contacts[0].phone || '') !== phone) {
        await db.update('member_contacts', { _row_id: `eq.${contacts[0]._row_id}` }, { phone });
      }
      setContactPhone(phone);

      // データベースから最新のプロフィール情報を再取得
      console.log('Fetching updated profile from database...');
      const updatedProfiles = await db.query('user_profiles', {
        user_uuid: `eq.${user.userUuid}`
      });

      console.log('Updated profiles fetched:', updatedProfiles);

      if (updatedProfiles.length > 0) {
        const updatedProfile = updatedProfiles[0];
        console.log('Setting userProfile to:', updatedProfile);
        setUserProfile(updatedProfile);
        // editFormも最新の状態に更新
        setEditForm({
          display_name: updatedProfile.display_name || '',
          bio: updatedProfile.bio || '',
          location: updatedProfile.location || '',
          phone,
          country: updatedProfile.country || 'スウェーデン',
          county: updatedProfile.county || '',
          city: updatedProfile.city || '',
          contact_pref: updatedProfile.contact_pref || 'email'
        });
      }

      setIsEditing(false);

      toast({
        title: "プロフィール更新",
        description: "プロフィールが更新されました",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 画像ファイルチェック
    if (!file.type.startsWith('image/')) {
      toast({
        title: "ファイル形式エラー",
        description: "画像ファイルを選択してください",
        variant: "destructive"
      });
      event.target.value = ''; // ファイル選択をリセット
      return;
    }

    // ファイルサイズチェック（iPhone撮影そのままなど明らかに大きすぎるものだけ弾く）
    if (file.size > ABUSE_MAX_BYTES) {
      toast({
        title: "ファイルサイズ超過",
        description: `${(file.size / (1024 * 1024)).toFixed(1)}MBです。25MBまでのファイルをご利用ください。`,
        variant: "destructive"
      });
      event.target.value = ''; // ファイル選択をリセット
      return;
    }

    try {
      setProfilePhotoUploading(true);

      // iPhone撮影の写真などサイズが大きい画像は、アップロード前にブラウザ側で自動的に圧縮する
      const compressedFile = await compressImage(file);

      // 日本語・スペース入りのファイル名でも安全なASCII名で保存する
      const result = await content.uploadFile(toAsciiFile(compressedFile, 'profile'), '/content/profile-photos/');
      const photoUrl = result.path || result.contentUrl || result.url || result.fileUrl;

      // プロフィールを更新
      const now = Math.floor(Date.now() / 1000);
      if (userProfile) {
        await db.update('user_profiles',
          { user_uuid: `eq.${user.userUuid}` },
          {
            profile_photo_url: photoUrl,
            last_active: now,
            _updated_at: now,
            contact_pref: editForm.contact_pref
          }
        );
      } else {
        await db.insert('user_profiles', {
          user_uuid: user.userUuid,
          profile_photo_url: photoUrl,
          last_active: now
        });
      }

      const updatedProfiles = await db.query('user_profiles', {
        user_uuid: `eq.${user.userUuid}`
      });

      if (updatedProfiles.length > 0) {
        setUserProfile(updatedProfiles[0]);
      }

      toast({
        title: "プロフィール写真更新",
        description: "プロフィール写真が更新されました",
      });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "エラー",
        description: "プロフィール写真のアップロードに失敗しました: " + error.message,
        variant: "destructive"
      });
    } finally {
      setProfilePhotoUploading(false);
      event.target.value = ''; // ファイル選択をリセット
    }
  };

  const handleDeleteProfilePhoto = async () => {
    if (!window.confirm('プロフィール写真を削除しますか？')) {
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000);

      // ファイルシステムから画像ファイルを削除
      if (userProfile?.profile_photo_url) {
        try {
          // URLからファイルパスを抽出
          const photoUrl = userProfile.profile_photo_url;
          const urlParts = photoUrl.split('/content/');
          if (urlParts.length > 1) {
            const filePath = '/content/' + urlParts[1];
            await content.deleteFile(filePath);
          }
        } catch (fileError) {
          // File deletion failed - continue with DB cleanup
          // ファイルの削除に失敗しても続行（データベース参照は削除する）
        }
      }

      // データベースの参照を削除
      await db.update('user_profiles',
        { user_uuid: `eq.${user.userUuid}` },
        {
          profile_photo_url: null,
          last_active: now,
          _updated_at: now
        }
      );

      setUserProfile(prev => ({
        ...prev,
        profile_photo_url: null
      }));

      toast({
        title: "プロフィール写真削除",
        description: "プロフィール写真が削除されました",
      });
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      toast({
        title: "エラー",
        description: "プロフィール写真の削除に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postUuid) => {
    if (!window.confirm('本当にこの投稿を削除しますか？')) {
      return;
    }
    
    try {
      setDeletingPost(postUuid);
      
      // Soft delete the post
      await db.update('posts',
        { _row_id: `eq.${postUuid}` },
        { status: 'removed' }
      );
      
      setUserPosts(prev => prev.filter(post => post._row_id !== postUuid));
      
      toast({
        title: "投稿削除",
        description: "投稿が削除されました",
      });
      
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "エラー",
        description: "投稿の削除に失敗しました",
        variant: "destructive"
      });
    } finally {
      setDeletingPost(null);
    }
  };

  const handleDeleteForumTopic = async (topicId) => {
    if (!window.confirm('このトピックを削除しますか？すべての返信も削除されます。')) {
      return;
    }

    try {
      setDeletingForumTopic(topicId);
      await db.delete('forum_topics', { _row_id: `eq.${topicId}` });
      setUserForumTopics(prev => prev.filter(topic => topic._row_id !== topicId));
      toast({
        title: "トピック削除",
        description: "トピックが削除されました",
      });
    } catch (error) {
      console.error('Error deleting forum topic:', error);
      toast({
        title: "エラー",
        description: "トピックの削除に失敗しました",
        variant: "destructive"
      });
    } finally {
      setDeletingForumTopic(null);
    }
  };

  const handleDeleteForumReply = async (replyId) => {
    if (!window.confirm('この返信を削除しますか？')) {
      return;
    }

    try {
      setDeletingForumReply(replyId);
      await db.delete('forum_replies', { _row_id: `eq.${replyId}` });
      setUserForumReplies(prev => prev.filter(reply => reply._row_id !== replyId));
      toast({
        title: "返信削除",
        description: "返信が削除されました",
      });
    } catch (error) {
      console.error('Error deleting forum reply:', error);
      toast({
        title: "エラー",
        description: "返信の削除に失敗しました",
        variant: "destructive"
      });
    } finally {
      setDeletingForumReply(null);
    }
  };

  const handleOpenTracking = (post) => {
    setTrackingPost(post);
    setTrackingNumberInput(post.tracking_number || '');
  };

  const handleSaveTracking = async () => {
    if (!trackingPost) return;

    try {
      setSavingTracking(true);

      await db.update('posts',
        { _row_id: `eq.${trackingPost._row_id}` },
        { tracking_number: trackingNumberInput.trim() }
      );

      setUserPosts(prev => prev.map(post =>
        post._row_id === trackingPost._row_id
          ? { ...post, tracking_number: trackingNumberInput.trim() }
          : post
      ));

      toast({
        title: "配送情報を保存しました",
        description: "追跡番号が投稿詳細ページに表示されます",
      });

      setTrackingPost(null);
    } catch (error) {
      console.error('Error saving tracking number:', error);
      toast({
        title: "エラー",
        description: "配送情報の保存に失敗しました",
        variant: "destructive"
      });
    } finally {
      setSavingTracking(false);
    }
  };

  const handleToggleSold = async (post) => {
    const newStatus = post.status === 'sold' ? 'active' : 'sold';

    try {
      setTogglingPost(post._row_id);

      await db.update('posts',
        { _row_id: `eq.${post._row_id}` },
        { status: newStatus }
      );

      setUserPosts(prev => prev.map(p =>
        p._row_id === post._row_id ? { ...p, status: newStatus } : p
      ));

      toast({
        title: newStatus === 'sold' ? "投稿を終了しました" : "投稿を再開しました",
        description: newStatus === 'sold' ? "一覧には表示されなくなります" : "一覧に再度表示されます",
      });
    } catch (error) {
      console.error('Error toggling post status:', error);
      toast({
        title: "エラー",
        description: "ステータスの変更に失敗しました",
        variant: "destructive"
      });
    } finally {
      setTogglingPost(null);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  const handlePostUpdated = async (updatedPost?: any) => {
    console.log('handlePostUpdated called with:', updatedPost);
    setIsPostModalOpen(false);
    setEditingPost(null);
    
    // Refresh posts from server to ensure data consistency
    try {
      if (user) {
        console.log('Refreshing posts for user:', user.userUuid);
        const posts = await db.query('posts', { 
          _created_by: `eq.${user.userUuid}`,
          status: 'neq.removed'
        });
        
        console.log('Posts refreshed:', posts.length, 'posts');
        
        // Filter out any invalid posts and parse images
        const validPosts = posts.filter(post => post && post._row_id);
        const postsWithImages = validPosts.map(post => {
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
          return { ...post, images };
        });
        
        console.log('Setting user posts:', postsWithImages.length, 'posts');
        setUserPosts(postsWithImages.sort((a, b) => b._created_at - a._created_at));
      }
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
    
    toast({
      title: "投稿更新",
      description: "投稿が更新されました",
    });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    // Clear previous messages
    setPasswordError('');
    setPasswordSuccess('');
    
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    // Validation: check if passwords match
    if (newPassword !== confirmPassword) {
      const errorMsg = '新しいパスワードと確認パスワードが一致しません';
      setPasswordError(errorMsg);
      toast({
        title: "エラー",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    // Validation: password strength (8+ chars, letters and numbers)
    if (newPassword.length < 8) {
      const errorMsg = '新しいパスワードは8文字以上である必要があります';
      setPasswordError(errorMsg);
      toast({
        title: "エラー",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      const errorMsg = '新しいパスワードは文字と数字の両方を含む必要があります';
      setPasswordError(errorMsg);
      toast({
        title: "エラー",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Verify current password by attempting to sign in
      try {
        await auth.signIn(user.email, currentPassword);
      } catch (signInError) {
        console.error('Current password verification failed:', signInError);
        const errorMsg = '現在のパスワードが正しくありません';
        setPasswordError(errorMsg);
        toast({
          title: "エラー",
          description: errorMsg,
          variant: "destructive"
        });
        return;
      }
      
      // Update password
      await auth.updateUser({ password: newPassword });
      
      // Success
      const successMsg = 'パスワードを変更しました';
      setPasswordSuccess(successMsg);
      toast({
        title: "成功",
        description: successMsg,
      });
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMsg = 'パスワードの変更に失敗しました。しばらく待ってから再試行してください。';
      setPasswordError(errorMsg);
      toast({
        title: "エラー",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ja-JP', { timeZone: 'Europe/Stockholm' }) + ' ' + date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Stockholm'
    });
  };

  const getCategoryName = (categoryUuid) => {
    // This would normally come from categories data
    const categories = {
      'cat-for-sale': '売ります/あげます',
      'cat-wanted': '探しています',
      'cat-job-offering': '仕事募集',
      'cat-job-seeking': '仕事探し',
      'cat-services': 'サービス',
      'cat-housing': '住居',
      'cat-events': 'イベントお知らせ'
    };
    return categories[categoryUuid] || '';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'sold': 'bg-blue-100 text-blue-800',
      'draft': 'bg-purple-100 text-purple-800',
      'expired': 'bg-yellow-100 text-yellow-800',
      'flagged': 'bg-red-100 text-red-800',
      'removed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

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
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="relative" onClick={() => navigate('/messages')}>
                    <Mail className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    ログアウト
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                    ホームに戻る
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">プロフィール設定</TabsTrigger>
            <TabsTrigger value="posts">投稿管理</TabsTrigger>
            <TabsTrigger value="forum">掲示板管理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>基本情報</span>
                    </CardTitle>
                    <CardDescription>
                      {user.email}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Edit className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    {isEditing ? 'キャンセル' : '編集'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* プロフィール写真セクション */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                      {userProfile?.profile_photo_url ? (
                        <img
                          src={userProfile.profile_photo_url}
                          alt="プロフィール写真"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute bottom-4 right-0 flex space-x-2">
                        <Label 
                          htmlFor="profile-photo-upload" 
                          className="cursor-pointer bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4 text-gray-600" />
                          <Input
                            id="profile-photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            disabled={profilePhotoUploading}
                            className="hidden"
                          />
                        </Label>
                        {userProfile?.profile_photo_url && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-full p-2 h-auto w-auto"
                            onClick={handleDeleteProfilePhoto}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {profilePhotoUploading && (
                    <p className="text-sm text-blue-600">アップロード中...</p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      プロフィール写真（1MBまで）
                    </p>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    {(!userProfile?.display_name || userProfile?.display_name === '未設定' || !userProfile?.bio || userProfile?.bio === '未設定') && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        編集を押して、表示名と自己紹介文を入れよう！
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">表示名</label>
                      <p className="text-lg">{userProfile?.display_name || '未設定'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">自己紹介</label>
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {userProfile?.bio || '未設定'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          電話番号
                        </label>
                        <p>{contactPhone || '未設定'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          国
                        </label>
                        <p>{userProfile?.country || '未設定'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          県
                        </label>
                        <p>{userProfile?.county || '未設定'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          市
                        </label>
                        <p>{userProfile?.city || '未設定'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        連絡の受け取り方
                      </label>
                      <p>
                        {userProfile?.contact_pref === 'dm_only' ? (
                          <span>サイト内メッセージのみ（メール非公開）</span>
                        ) : (
                          <span>メールで受け取る（おすすめ）</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        詳細住所
                      </label>
                      <p>{userProfile?.location || '未設定'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                    <div>
                      <Label htmlFor="display_name">表示名</Label>
                      <Input
                        id="display_name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="表示名"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">自己紹介</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="自己紹介を入力してください"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="070-123-4567"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="country">国</Label>
                        <Select
                          value={editForm.country}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, country: value, county: '', city: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="国を選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="county">県</Label>
                        {editForm.country === 'スウェーデン' ? (
                          <Select
                            value={editForm.county}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, county: value, city: '' }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="県を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set(locations.map((loc: any) => loc.county)))
                                .sort((a, b) => {
                                  if (a === 'Other') return 1;
                                  if (b === 'Other') return -1;
                                  if (a === 'Stockholm') return -1;
                                  if (b === 'Stockholm') return 1;
                                  if (a === 'Västra Götaland') return -1;
                                  if (b === 'Västra Götaland') return 1;
                                  return a.localeCompare(b);
                                })
                                .map((county) => (
                                  <SelectItem key={county} value={county}>
                                    {getCountyNameWithKatakana(county)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : REGION_OPTIONS_BY_COUNTRY[editForm.country] ? (
                          <Select
                            value={editForm.county}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, county: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="県を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {REGION_OPTIONS_BY_COUNTRY[editForm.country].map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="county"
                            value={editForm.county}
                            onChange={(e) => setEditForm(prev => ({ ...prev, county: e.target.value }))}
                            placeholder="例：地域名を入力してください"
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">市</Label>
                        {editForm.country === 'スウェーデン' ? (
                          <Select
                            value={editForm.city}
                            onValueChange={(value) => setEditForm(prev => ({ ...prev, city: value }))}
                            disabled={!editForm.county}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={editForm.county ? '市町村を選択してください' : '先に県を選択してください'} />
                            </SelectTrigger>
                            <SelectContent>
                              {locations
                                .filter((loc: any) => loc.county === editForm.county)
                                .sort((a: any, b: any) => (a.name_en || a.name_ja).localeCompare(b.name_en || b.name_ja))
                                .map((loc: any) => (
                                  <SelectItem key={loc.uuid || loc._row_id} value={loc.name_ja || loc.name_en}>
                                    {loc.name_ja || loc.name_en}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="city"
                            value={editForm.city}
                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="例：渋谷区、ロサンゼルス"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contact_pref">連絡の受け取り方</Label>
                      <Select 
                        value={editForm.contact_pref} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, contact_pref: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="連絡の受け取り方を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">
                            <div className="flex flex-col">
                              <span className="font-medium">メールで受け取る（おすすめ）</span>
                              <span className="text-xs text-gray-500">あなたの投稿への連絡を、サイト内メッセージとメールの両方で受け取れます</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dm_only">
                            <div className="flex flex-col">
                              <span className="font-medium">メールを隠す（サイト内メッセージのみ）</span>
                              <span className="text-xs text-gray-500">メールアドレスを相手に知られず、サイト内メッセージだけで連絡を受け取ります。信用できたら相手に個別でメールアドレスを伝えられます</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">詳細住所</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="地区や通りなど"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">保存</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>アカウント設定</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">登録日</p>
                        <p className="text-sm text-gray-600">
                          {userCreatedAt ? formatDate(userCreatedAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        variant="destructive" 
                        onClick={() => auth.signOut().then(() => navigate('/'))}
                      >
                        ログアウト
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Password Change Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>パスワード変更</span>
                </CardTitle>
                <CardDescription>
                  セキュリティのため、定期的にパスワードを変更することをお勧めします
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
                  {/* Error/Success Alert */}
                  {passwordError && (
                    <Alert className="bg-red-50 border-red-200 text-red-800">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  {passwordSuccess && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <AlertDescription>{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="現在のパスワードを入力"
                      disabled={changingPassword}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="新しいパスワードを入力"
                      disabled={changingPassword}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      8文字以上で、文字と数字の両方を含める必要があります
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="新しいパスワードを再入力"
                      disabled={changingPassword}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    {changingPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    変更する
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">投稿した広告</h2>
              <Button onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }}>
                新規投稿
              </Button>
            </div>

            <Select value={postCategoryFilter} onValueChange={setPostCategoryFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="カテゴリーで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="cat-for-sale">売ります/あげます</SelectItem>
                <SelectItem value="cat-job-seeking">仕事探し</SelectItem>
                <SelectItem value="cat-housing">住居</SelectItem>
                <SelectItem value="cat-events">イベントお知らせ</SelectItem>
                <SelectItem value="cat-services">サービス</SelectItem>
              </SelectContent>
            </Select>
            
            {userPosts.filter(post => post && post._row_id && (postCategoryFilter === 'all' || post.category_uuid === postCategoryFilter)).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">投稿はありません</h3>
                    <p className="text-gray-500 mb-4">最初の投稿を作成しましょう</p>
                    <Button onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }}>
                      投稿する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPosts.filter(post => post && post._row_id && (postCategoryFilter === 'all' || post.category_uuid === postCategoryFilter)).map((post) => (
                  <Card key={post._row_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="secondary" className="mr-2">
                              {categoryIcons[post.category_uuid]} {getCategoryName(post.category_uuid)}
                            </Badge>
                            <Badge variant="secondary" className="mr-2 text-gray-600">
                              {postTypeLabels[post.post_type]}
                            </Badge>
                            <Badge className={getStatusColor(post.status)}>
                              {statusLabels[post.status] ?? post.status}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(post._created_at)}
                            </span>
                            {post.price && (
                              <span className="font-semibold text-green-600">{post.price}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPost(post)}
                          >
                            詳細
                          </Button>
                          {post.category_uuid === 'cat-for-sale' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTracking(post)}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              {post.tracking_number ? '配送情報を編集' : '配送情報を入力'}
                            </Button>
                          )}
                          {(post.status === 'active' || post.status === 'sold') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSold(post)}
                              disabled={togglingPost === post._row_id}
                            >
                              {post.status === 'sold' ? (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  再開する
                                </>
                              ) : (
                                <>
                                  <CircleX className="w-4 h-4 mr-1" />
                                  {(post.category_uuid || post.category) === 'cat-for-sale' ? '商談終了' : '投稿を終了'}
                                </>
                              )}
                            </Button>
                          )}
                          {(post.status === 'active' || post.status === 'draft') && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                編集
                              </Button>
                            </>
                          )}
                          {(post.status === 'active' || post.status === 'draft') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePost(post._row_id)}
                              disabled={deletingPost === post._row_id}
                            >
                              {deletingPost === post._row_id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forum" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">投稿したトピック</h2>
              <Link to="/forum">
                <Button>新しいトピックを作成</Button>
              </Link>
            </div>

            {userForumTopics.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">トピックはありません</h3>
                    <p className="text-gray-500 mb-4">情報・掲示板に最初のトピックを作成しましょう</p>
                    <Link to="/forum">
                      <Button>トピックを作成</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userForumTopics.map((topic) => (
                  <Card key={topic._row_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{topic.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="mr-2">{topic.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
                        {topic.body}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(topic._created_at)}
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/forum/${topic._row_id}`}>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              編集
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteForumTopic(topic._row_id)}
                            disabled={deletingForumTopic === topic._row_id}
                          >
                            {deletingForumTopic === topic._row_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-bold pt-4">投稿した返信</h2>

            {userForumReplies.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>まだ返信はありません</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userForumReplies.map((reply) => (
                  <Card key={reply._row_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardDescription>
                        返信先: <span className="font-medium text-gray-700">{reply.topic_title}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
                        {reply.body}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(reply._created_at)}
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/forum/${reply.topic_id}`}>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              編集
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteForumReply(reply._row_id)}
                            disabled={deletingForumReply === reply._row_id}
                          >
                            {deletingForumReply === reply._row_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Post Detail Modal */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>投稿詳細</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPost.title}</h3>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="secondary">
                      {categoryIcons[selectedPost.category_uuid]} {getCategoryName(selectedPost.category_uuid)}
                    </Badge>
                    <Badge variant="secondary" className="text-gray-600">
                      {postTypeLabels[selectedPost.post_type]}
                    </Badge>
                    <Badge className={getStatusColor(selectedPost.status)}>
                      {statusLabels[selectedPost.status] ?? selectedPost.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">詳細説明</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedPost.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPost.price && (
                    <div>
                      <h4 className="font-medium mb-1">価格</h4>
                      <p className="text-green-600 font-semibold">{selectedPost.price}</p>
                    </div>
                  )}
                  {selectedPost.location && (
                    <div>
                      <h4 className="font-medium mb-1">場所</h4>
                      <p>{selectedPost.location}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-1">連絡方法</h4>
                    <p>
                      {selectedPost.contact_method === 'email' ? 'メール' : 
                       selectedPost.contact_method === 'phone' ? '電話' : 
                       selectedPost.contact_method === 'dm' ? 'Sverige.jpのメール' : '両方'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">連絡先</h4>
                    <p>{selectedPost.email}</p>
                    {selectedPost.phone && <p>{selectedPost.phone}</p>}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 pt-4 border-t">
                  投稿日時: {formatDate(selectedPost._created_at)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Post Modal for editing */}
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingPost(null);
          }}
          onPostCreated={handlePostUpdated}
          user={user}
          editingPost={editingPost}
        />

        {/* Tracking Number Dialog */}
        <Dialog open={!!trackingPost} onOpenChange={() => setTrackingPost(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                配送情報
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                PostNordで発送した際の追跡番号を入力してください。投稿詳細ページに表示され、
                購入者が配送状況を確認できるようになります。
              </p>
              <div>
                <Label htmlFor="tracking-number">PostNord 追跡番号</Label>
                <Input
                  id="tracking-number"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="例: 1234567890123"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTrackingPost(null)}>
                  キャンセル
                </Button>
                <Button onClick={handleSaveTracking} disabled={savingTracking}>
                  {savingTracking ? '保存中...' : '保存する'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;