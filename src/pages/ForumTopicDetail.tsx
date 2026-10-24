import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, Clock, User, Reply, Loader2, Send, Trash2, Pencil, ShoppingBag, Home, Star, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import AuthModal from '@/components/AuthModal';
import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';
import functions from '@/lib/shared/kliv-functions.js';
import { checkIsAdmin } from '@/lib/isAdmin';
import { resolveAuthorName } from '@/lib/utils/authorHelpers';
import { FORUM_CATEGORIES } from '@/constants/forumCategories';
import { toast } from 'sonner';

interface ForumTopic {
  _row_id: number;
  title: string;
  body: string;
  category: string;
  _created_at: number;
  _created_by: string;
  user_name?: string;
}

interface ForumReply {
  _row_id: number;
  topic_id: number;
  body: string;
  _created_at: number;
  _created_by: string;
  user_name?: string;
}

// トップページ/投稿詳細ページ/掲示板一覧と共通の投稿カテゴリータブ用アイコン
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

const postCategoryIcons = {
  'cat-for-sale': BuyIcon,
  'cat-job-seeking': JobIcon,
  'cat-housing': HusIcon,
  'cat-events': EventIcon,
  'cat-services': ServiceIcon,
  'cat-bulletin': BulletinIcon
};

export default function ForumTopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [postCategories, setPostCategories] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicTitle, setEditTopicTitle] = useState('');
  const [editTopicBody, setEditTopicBody] = useState('');
  const [editTopicCategory, setEditTopicCategory] = useState('');
  const [isSavingTopic, setIsSavingTopic] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyBody, setEditReplyBody] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);

  useEffect(() => {
    loadTopic();
    loadReplies();
    loadUser();
    loadPostCategories();
  }, [id]);

  useEffect(() => {
    if (topic) {
      document.title = `Sverige.JP - ${topic.title}`;
    }
  }, [topic]);

  useEffect(() => {
    // 非同期に管理者判定を行う
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin(user);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    // 自分が立てたトピックを開いたら、そのトピックへの返信を既読にする
    const markRepliesAsRead = async () => {
      if (!topic || !user || topic._created_by !== user.userUuid) return;
      try {
        // 他人が書いた返信の更新はRLSで直接できないため、管理者用Edge Functionと
        // 同じ考え方の専用Edge Function(呼び出し元がトピック所有者か検証した上で
        // 特権クライアントで更新)を経由する
        await functions.post('mark-topic-replies-read', {
          topicId: topic._row_id
        });
      } catch (error) {
        console.error('Failed to mark replies as read:', error);
      }
    };
    markRepliesAsRead();
  }, [topic, user]);

  const loadUser = async () => {
    const currentUser = await auth.getUser();
    setUser(currentUser);
  };

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
  };

  const loadPostCategories = async () => {
    try {
      const data = await db.query('categories', { _deleted: 'eq.0' });
      setPostCategories(data || []);
    } catch (error) {
      console.error('Failed to load post categories:', error);
    }
  };

  const handlePostCategoryChange = (categoryId: string) => {
    if (categoryId === 'cat-bulletin') {
      navigate('/forum');
      return;
    }
    navigate(categoryId ? `/?category=${categoryId}` : '/');
  };

  const loadTopic = async () => {
    if (!id) return;
    try {
      const data = await db.get('forum_topics', parseInt(id));
      if (data) {
        const authorName = await resolveAuthorName(data._created_by);
        setTopic({ ...data, user_name: authorName });
      } else {
        toast.error('トピックが見つかりません');
        navigate('/forum');
      }
    } catch (error) {
      console.error('Failed to load topic:', error);
      toast.error('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    if (!id) return;
    try {
      const topicId = parseInt(id);
      const data = await db.query('forum_replies', {
        topic_id: `eq.${topicId}`,
        order: '_created_at.asc',
      });
      console.log('Loaded replies for topic', topicId, ':', data);
      const profiles = await db.query('user_profiles', { _deleted: 'eq.0' });
      const repliesWithNames = await Promise.all(
        (data || []).map(async (reply: ForumReply) => ({
          ...reply,
          user_name: await resolveAuthorName(reply._created_by, profiles),
        }))
      );
      setReplies(repliesWithNames);
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyBody.trim()) {
      toast.error('返信内容を入力してください');
      return;
    }

    if (!user) {
      toast.error('返信するにはログインしてください');
      return;
    }
    // メール確認チェック：未承認ユーザーは投稿できない
    if (!user.emailVerified || user.emailVerified === false) {
      toast.error('メール確認が必要です。メール確認が完了していないため返信できません。確認メールのリンクをクリックして承認してください。（迷惑メールフォルダもご確認ください）');
      return;
    }

    setIsSubmitting(true);
    try {
      const topicId = parseInt(id!);
      await db.insert('forum_replies', {
        topic_id: topicId,
        body: replyBody.trim(),
      });
      
      toast.success('返信を投稿しました！');
      setReplyBody('');
      loadReplies();
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!user) return;
    
    if (!confirm('この返信を削除しますか？')) {
      return;
    }

    try {
      await db.delete('forum_replies', { _row_id: `eq.${replyId}` });
      toast.success('返信を削除しました');
      loadReplies();
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleDeleteTopic = async () => {
    if (!user) return;
    
    if (!confirm('このトピックを削除しますか？すべての返信も削除されます。')) {
      return;
    }

    try {
      await db.delete('forum_topics', { _row_id: `eq.${topic!._row_id}` });
      toast.success('トピックを削除しました');
      navigate('/forum');
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleStartEditTopic = () => {
    if (!topic) return;
    setEditTopicTitle(topic.title);
    setEditTopicBody(topic.body);
    setEditTopicCategory(topic.category);
    setIsEditingTopic(true);
  };

  const handleCancelEditTopic = () => {
    setIsEditingTopic(false);
  };

  const handleSaveTopic = async () => {
    if (!topic) return;
    if (!editTopicTitle.trim() || !editTopicBody.trim() || !editTopicCategory) {
      toast.error('すべての項目を入力してください');
      return;
    }

    setIsSavingTopic(true);
    try {
      await db.update(
        'forum_topics',
        { _row_id: `eq.${topic._row_id}` },
        {
          title: editTopicTitle.trim(),
          body: editTopicBody.trim(),
          category: editTopicCategory,
        }
      );
      toast.success('トピックを更新しました');
      setIsEditingTopic(false);
      loadTopic();
    } catch (error) {
      console.error('Failed to update topic:', error);
      toast.error('更新に失敗しました');
    } finally {
      setIsSavingTopic(false);
    }
  };

  const handleStartEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply._row_id);
    setEditReplyBody(reply.body);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
  };

  const handleSaveReply = async (replyId: number) => {
    if (!editReplyBody.trim()) {
      toast.error('返信内容を入力してください');
      return;
    }

    setIsSavingReply(true);
    try {
      await db.update(
        'forum_replies',
        { _row_id: `eq.${replyId}` },
        { body: editReplyBody.trim() }
      );
      toast.success('返信を更新しました');
      setEditingReplyId(null);
      loadReplies();
    } catch (error) {
      console.error('Failed to update reply:', error);
      toast.error('更新に失敗しました');
    } finally {
      setIsSavingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p>トピックが見つかりません</p>
                <Link to="/forum">
                  <Button className="mt-4">情報・掲示板に戻る</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePostCategoryChange('')}
            className="border-2 bg-white hover:bg-gray-50"
          >
            全て
          </Button>
          {postCategories.map((category) => {
            const IconComponent = postCategoryIcons[category.uuid] || Home;
            return (
              <Button
                key={category.uuid}
                variant="outline"
                size="sm"
                onClick={() => handlePostCategoryChange(category.uuid)}
                className="border-2 bg-white hover:bg-gray-50"
                style={{ borderColor: category.color, borderWidth: '2px' }}
              >
                <IconComponent className="w-4 h-4 mr-1" />
                {category.name_ja}
              </Button>
            );
          })}
        </div>

        {/* Back Button */}
        <Link to="/forum">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            情報・掲示板に戻る
          </Button>
        </Link>

        {/* Topic */}
        <Card className="mb-6">
          {isEditingTopic ? (
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="edit-topic-category">カテゴリ</Label>
                <Select value={editTopicCategory} onValueChange={setEditTopicCategory}>
                  <SelectTrigger id="edit-topic-category">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORUM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-topic-title">タイトル</Label>
                <Input
                  id="edit-topic-title"
                  value={editTopicTitle}
                  onChange={(e) => setEditTopicTitle(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="edit-topic-body">本文</Label>
                <Textarea
                  id="edit-topic-body"
                  value={editTopicBody}
                  onChange={(e) => setEditTopicBody(e.target.value)}
                  rows={8}
                  maxLength={5000}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveTopic} disabled={isSavingTopic}>
                  {isSavingTopic ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存'
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancelEditTopic} disabled={isSavingTopic}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{topic.category}</Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{topic.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 text-sm flex-wrap">
                      <span className="flex items-center font-medium text-gray-700">
                        <User className="w-4 h-4 mr-1" />
                        {topic.user_name || '不明'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(topic._created_at * 1000), {
                          addSuffix: true
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  {user && topic._created_by === user.userUuid && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEditTopic}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteTopic}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap break-words">
                  {topic.body}
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Replies Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Reply className="w-5 h-5 mr-2" />
            返信 ({replies.length})
          </h2>

          {/* Reply Form */}
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">返信を投稿</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <div>
                    <Label htmlFor="reply">返信内容</Label>
                    <Textarea
                      id="reply"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="返信を入力してください..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !replyBody.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        投稿中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        返信を投稿
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <p>
                  返信するには
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-blue-600 hover:underline font-medium mx-1"
                  >
                    ログイン
                  </button>
                  してください
                </p>
              </CardContent>
            </Card>
          )}

          {/* Replies List */}
          {replies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>まだ返信がありません。最初の返信を投稿してください！</p>
              </CardContent>
            </Card>
          ) : (
            replies.map((reply) => (
              <Card key={reply._row_id}>
                <CardContent className="pt-6">
                  {editingReplyId === reply._row_id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editReplyBody}
                        onChange={(e) => setEditReplyBody(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveReply(reply._row_id)}
                          disabled={isSavingReply}
                        >
                          {isSavingReply ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              保存中...
                            </>
                          ) : (
                            '保存'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditReply}
                          disabled={isSavingReply}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center font-medium text-gray-700">
                            <User className="w-4 h-4 mr-1" />
                            {reply.user_name || '不明'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDistanceToNow(new Date(reply._created_at * 1000), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                        <div className="prose max-w-none whitespace-pre-wrap break-words">
                          {reply.body}
                        </div>
                      </div>
                      {user && reply._created_by === user.userUuid && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEditReply(reply)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReply(reply._row_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <Footer />
    </div>
  );
}
