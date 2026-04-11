import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ThumbsUp, Loader2, Search, Send, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Discussion = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', subject: '', visibility: 'public' });
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/discussion');
        setPosts(data);
      } catch { toast.error('Failed to load posts'); }
      finally { setLoading(false); }
    })();
  }, []);

  const addPost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/discussion', form);
      setPosts(prev => [data, ...prev]);
      setForm({ title: '', content: '', subject: '', visibility: 'public' });
      setShowAdd(false);
      toast.success('Question posted! 💬');
    } catch { toast.error('Failed to post'); }
  };

  const upvote = async (postId) => {
    try {
      const { data } = await api.put(`/discussion/${postId}/upvote`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, upvotes: data.upvotes } : p));
    } catch { /* silent */ }
  };

  const addReply = async (postId) => {
    const content = replyInputs[postId]?.trim();
    if (!content) return;
    try {
      const { data } = await api.post(`/discussion/${postId}/reply`, { content });
      setPosts(prev => prev.map(p => p._id === postId ? data : p));
      setReplyInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Reply posted!');
    } catch { toast.error('Failed to post reply'); }
  };

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary-400" /> Discussion Forum
          </h1>
          <p className="text-slate-400 text-sm">Peer Q&A — Ask, answer, upvote</p>
        </div>
        <motion.button onClick={() => setShowAdd(!showAdd)} className="btn-primary"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Plus className="w-4 h-4" /> Ask Question
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="glass-input pl-10" placeholder="Search questions..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Ask the Community</h3>
            <form onSubmit={addPost} className="space-y-3">
              <input className="glass-input" placeholder="Question title *" required
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="glass-input" placeholder="Subject (optional)"
                value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              <textarea rows={3} className="glass-input resize-none" placeholder="Describe your question..."  required
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              
              <div className="flex items-center gap-4 py-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visibility:</p>
                <div className="flex gap-2">
                  {['private', 'public'].map(v => (
                    <button 
                      key={v}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, visibility: v }))}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all ${
                        form.visibility === v 
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400' 
                        : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Post Question</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => upvote(post._id)}
                    className="p-2 rounded-xl hover:text-primary-400 text-slate-500 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-semibold">{post.upvotes || 0}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.subject && <span className="badge-primary text-xs">{post.subject}</span>}
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${
                        post.visibility === 'public' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>
                      {post.visibility || 'public'}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold">{post.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{post.author?.name || 'Anonymous'}</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <button onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300 ml-auto">
                      {post.replies?.length || 0} replies
                      {expandedPost === post._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Replies */}
                  <AnimatePresence>
                    {expandedPost === post._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3">
                        {post.replies?.map((r, j) => (
                          <div key={j} className="p-3 rounded-xl ml-2 text-sm"
                            style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '2px solid rgba(99,102,241,0.4)' }}>
                            <p className="text-slate-300">{r.content}</p>
                            <p className="text-xs text-slate-500 mt-1">{r.author?.name}</p>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <input
                            value={replyInputs[post._id] || ''}
                            onChange={e => setReplyInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className="glass-input text-sm flex-1 !py-2"
                          />
                          <button onClick={() => addReply(post._id)} className="btn-primary !px-3 !py-2">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MessageSquare className="w-14 h-14 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No discussions yet. Start the conversation!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discussion;
