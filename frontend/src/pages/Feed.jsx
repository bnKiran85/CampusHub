import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import NoteCard from '../components/NoteCard';
import CommentSidebar from '../components/CommentSidebar';
import { Search, Filter, TrendingUp, BookOpen, Users, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SmartAIView from '../components/SmartAIView';

const Feed = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('notes'); // 'notes', 'verified', 'community', 'discussions'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [semanticResult, setSemanticResult] = useState(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const [selectedContent, setSelectedContent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      let endpoint = '/notes/feed';
      if (filter === 'verified') endpoint = '/materials/verified';
      if (filter === 'community') endpoint = '/materials/community';
      if (filter === 'discussions') endpoint = '/discussion';
      
      const { data } = await api.get(endpoint);
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      let endpoint, method;
      if (filter === 'notes') {
        endpoint = `/notes/${id}/like`;
        method = 'patch';
      } else if (filter === 'discussions') {
        endpoint = `/discussion/${id}/upvote`;
        method = 'put';
      } else {
        endpoint = `/materials/${id}/like`;
        method = 'patch';
      }
      
      const { data } = await api[method](endpoint);
      
      setNotes(prev => prev.map(n => {
        if (n._id !== id) return n;
        if (filter === 'discussions') return { ...n, upvotes: data.upvotes };
        return { 
          ...n, 
          likes: data.isLiked 
            ? Array(data.likes).fill('me') // Visual hack to maintain array length
            : Array(data.likes).fill('other') 
        };
      }));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleBookmark = async (id) => {
    toast.success('Saved to bookmarks! 🔖');
    // Implement bookmark API call if needed
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchFeed();

    if (isSemanticSearch) {
      setIsSearchingAI(true);
      setSemanticResult(null);
      setSearchError(null);
      try {
        const { data } = await api.post('/ai/semantic-search', { 
          query: searchQuery,
          notes: filter === 'notes' ? notes : [],
          materials: filter !== 'notes' ? notes : []
        });
        
        setSemanticResult(data);
        const filtered = notes.filter(n => data.recommendedIds.includes(n._id));
        setNotes(filtered);
      } catch (err) {
        setSearchError('AI Search failed. Please try again.');
        toast.error('AI search failed');
      } finally {
        setIsSearchingAI(false);
      }
    } else {
      const filtered = notes.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setNotes(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Campus Feed
            </h1>
            <p className="text-white/50 text-sm mt-1">Discover what your peers are learning today.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={isSemanticSearch ? "Ask AI: 'Give me DBMS easy notes'..." : "Search notes, subjects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-24 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-white/20"
            />
            <button 
              type="button"
              onClick={() => setIsSemanticSearch(!isSemanticSearch)}
              className={`absolute right-2 top-2 bottom-2 px-3 rounded-xl flex items-center space-x-2 transition-all ${
                isSemanticSearch 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* AI Search Insights */}
        <AnimatePresence>
          {(semanticResult || isSearchingAI || searchError) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
                <SmartAIView 
                  data={semanticResult}
                  loading={isSearchingAI}
                  error={searchError}
                  onAction={handleSearch}
                />
                {!isSearchingAI && semanticResult && (
                  <button 
                    onClick={() => {
                      setSemanticResult(null);
                      fetchFeed();
                    }}
                    className="mt-4 text-xs text-white/40 hover:text-white underline"
                  >
                    Clear AI Search
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setFilter('notes')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center space-x-2 transition-all ${filter === 'notes' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Public Notes</span>
          </button>
          <button 
            onClick={() => setFilter('verified')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center space-x-2 transition-all ${filter === 'verified' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Verified Materials</span>
          </button>
          <button 
            onClick={() => setFilter('community')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center space-x-2 transition-all ${filter === 'community' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Users className="w-4 h-4" />
            <span>Student योगदान</span>
          </button>
          <button 
            onClick={() => setFilter('discussions')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center space-x-2 transition-all ${filter === 'discussions' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Campus Q&A</span>
          </button>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
              ))}
            </motion.div>
          ) : notes.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {notes.map(note => (
                <NoteCard 
                  key={note._id} 
                  note={note} 
                  onLike={() => handleLike(note._id)} 
                  onBookmark={() => handleBookmark(note._id)} 
                  onCommentClick={(n) => setSelectedContent(n)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/5 border border-dashed border-white/20 rounded-3xl"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Users className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white/80">Campus Feed is Quiet...</h3>
              <p className="text-white/40 text-sm mt-2 max-w-sm mx-auto">
                {filter === 'notes' ? "Public notes appear here once they're shared and moderated." : 
                 filter === 'discussions' ? "Be the first to start a campus-wide discussion!" :
                 "Looking for materials? Community shares appear here after academic review."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(filter === 'discussions' ? '/discussion' : filter === 'notes' ? '/notes' : '/materials')}
                className="mt-6 btn-primary !px-8"
              >
                Start Sharing
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CommentSidebar 
        isOpen={!!selectedContent} 
        onClose={() => setSelectedContent(null)}
        selectedNote={selectedContent}
      />
    </div>
  );
};

export default Feed;
