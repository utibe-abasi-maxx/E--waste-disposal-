import React, { useState, useEffect } from 'react';
import { UserProfile, CommunitySuggestion, SuggestionComment } from '../types';
import {
  createCommunitySuggestion,
  subscribeToCommunitySuggestions,
  toggleLikeSuggestion,
  addSuggestionComment,
  subscribeToSuggestionComments,
  uploadFileToStorage,
  deleteSuggestionComment,
  auth,
} from '../services/firebaseService';
import {
  MessageSquare,
  Heart,
  Send,
  Image,
  LifeBuoy,
  ShieldCheck,
  User,
  Sparkles,
  Camera,
  X,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  Recycle,
  Truck,
  Trash2,
} from 'lucide-react';

interface CommunitySuggestionsProps {
  currentUser: UserProfile;
  onClose?: () => void;
  isFullPage?: boolean;
}

export const CommunitySuggestions: React.FC<CommunitySuggestionsProps> = ({
  currentUser,
  onClose,
  isFullPage = false,
}) => {
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([]);
  const [newText, setNewText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, SuggestionComment[]>>({});
  const [error, setError] = useState('');

  // 1. Subscribe to suggestions real-time
  useEffect(() => {
    const unsub = subscribeToCommunitySuggestions((items) => {
      setSuggestions(items);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to comments of expanded post
  useEffect(() => {
    if (!expandedPostId) return;
    const unsub = subscribeToSuggestionComments(expandedPostId, (cmts) => {
      setCommentsMap((prev) => ({ ...prev, [expandedPostId]: cmts }));
    });
    return () => unsub();
  }, [expandedPostId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) {
      setError('Please type your suggestion, question, or complaint.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      let finalPhotoUrl = '';
      if (photoFile) {
        finalPhotoUrl = await uploadFileToStorage(
          'suggestions',
          `${currentUser.id}_${Date.now()}`,
          photoFile
        );
      }

      await createCommunitySuggestion({
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'Member',
        userAvatar: currentUser.avatarUrl || currentUser.profilePhotoUrl || '',
        userRole: currentUser.role,
        userLga: currentUser.lga || 'Akwa Ibom',
        content: newText.trim(),
        photoUrl: finalPhotoUrl || '',
      });

      setNewText('');
      setPhotoFile(null);
      setPhotoPreview('');
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Error creating suggestion:', err);
      setIsSubmitting(false);
      setError(err?.message || 'Could not post suggestion. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    await toggleLikeSuggestion(postId, currentUser.id);
  };

  const handleSendComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    try {
      await addSuggestionComment(postId, {
        suggestionId: postId,
        authorId: currentUser.id,
        authorName: currentUser.name || currentUser.fullName || 'Member',
        authorAvatar: currentUser.avatarUrl || currentUser.profilePhotoUrl || '',
        authorRole: currentUser.role,
        text,
      });

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteSuggestionComment(postId, commentId);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Could not delete comment. Please try again.');
    }
  };

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] ${isFullPage ? 'max-w-4xl mx-auto py-8 px-4' : 'p-4 sm:p-6'}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-md">
            <LifeBuoy className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
                Customer Care & Community Help
              </span>
              <span className="text-[11px] text-emerald-200 font-bold">Akwa Ibom State</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">
              Community Help & Suggestions
            </h1>
            <p className="text-xs text-emerald-100 max-w-xl mt-1">
              Have a complaint, suggestion, or question? Post it here for quick answers from our customer care team and recovery community.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors self-end sm:self-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Post Creation Box (Facebook-style) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-gray-200 mb-8">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">{currentUser.name || 'Member'}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
              <span className="capitalize text-emerald-700">{currentUser.role === 'agent' ? 'Recovery Agent' : 'Waste Disposer'}</span>
              <span>•</span>
              <span>{currentUser.lga || 'Akwa Ibom'} LGA</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePostSubmit} className="mt-4 space-y-3">
          <textarea
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a suggestion, complaint, or ask customer care for help in your LGA..."
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
          />

          {error && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          {Boolean(photoPreview) && (
            <div className="relative inline-block mt-2">
              <img
                src={photoPreview}
                alt="Selected"
                className="w-32 h-32 object-cover rounded-2xl border-2 border-emerald-500 shadow-md"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview('');
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{photoFile ? 'Change Photo' : 'Add Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !newText.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post to Community</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions Feed Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Community Feed & Customer Support</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {suggestions.length} posts
          </span>
        </h2>
      </div>

      {/* Feed List (Facebook style) */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No suggestions yet!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Be the first to post a suggestion, neighborhood cleanup question, or customer care complaint.
            </p>
          </div>
        ) : (
          suggestions.map((post) => {
            const hasLiked = (post.likedBy || []).includes(currentUser.id);
            const isCommentsOpen = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-400 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">{post.userName}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {post.userRole === 'agent' ? 'Recovery Agent' : 'Waste Disposer'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {post.userLga ? `${post.userLga} LGA • ` : ''}
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mt-2">
                  {post.content}
                </p>

                {/* Optional Attached Photo */}
                {Boolean(post.photoUrl) && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 max-h-80 bg-gray-50">
                    <img
                      src={post.photoUrl}
                      alt="Attachment"
                      className="w-full h-full object-cover max-h-80"
                    />
                  </div>
                )}

                {/* Like & Comment Bar */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                        hasLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{post.likeCount || 0} Like{post.likeCount === 1 ? '' : 's'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>{post.commentsCount || comments.length || 0} Comment{post.commentsCount === 1 ? '' : 's'}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section (Expandable) */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3 bg-gray-50/70 p-4 rounded-2xl">
                    <div className="space-y-2.5">
                      {comments.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-1">
                          No comments yet. Be the first to reply!
                        </p>
                      ) : (
                        comments.map((cmt) => {
                          const isAuthor = Boolean(
                            (auth.currentUser && cmt.authorId === auth.currentUser.uid) ||
                            (currentUser?.id && cmt.authorId === currentUser.id)
                          );

                          return (
                            <div key={cmt.id} className="flex items-start gap-2.5 text-xs bg-white p-3 rounded-xl border border-gray-200">
                              <img
                                src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                                alt={cmt.authorName}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900">{cmt.authorName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isAuthor && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(post.id, cmt.id)}
                                        title="Delete this comment"
                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-700 mt-1">{cmt.text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendComment(post.id);
                          }
                        }}
                        placeholder="Write a supportive reply or answer..."
                        className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendComment(post.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
