import React, { useState, useEffect } from 'react';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const CommentSidebar = ({ isOpen, onClose, selectedNote }) => {
  const noteId = selectedNote?._id;
  const noteTitle = selectedNote?.title;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchComments();
    }
  }, [isOpen, noteId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/notes/${noteId}/comments`);
      setComments(data);
    } catch (err) {
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/notes/${noteId}/comments`, { content: newComment });
      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A1F] border-l border-white/10 z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0A0A1F]/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" /> Discussion
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Note Content Section */}
              {selectedNote && (
                <div className="p-6 space-y-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center p-[1px]">
                      <div className="w-full h-full bg-[#0A0A1F] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{selectedNote.user?.name || selectedNote.author?.name || 'Student'}</p>
                      <p className="text-[10px] text-white/40">{new Date(selectedNote.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white leading-tight">
                    {selectedNote.title}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {selectedNote.subject || 'General'}
                    </span>
                    {selectedNote.category && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {selectedNote.category}
                      </span>
                    )}
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedNote.content || selectedNote.description}
                    </p>
                  </div>

                  {selectedNote.aiSummary && (
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> AI Summary
                      </div>
                      <p className="text-xs text-purple-200/70 italic leading-relaxed">
                        {selectedNote.aiSummary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="p-6 space-y-6">
                <h4 className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Comments ({comments.length})</h4>
              {comments.map((comment, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={comment._id || idx} 
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    {comment.user?.avatar ? (
                      <img src={comment.user.avatar} className="w-full h-full rounded-full" alt="" />
                    ) : (
                      <User className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{comment.user?.name}</span>
                      <span className="text-[10px] text-white/20">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 shadow-sm">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
                  <MessageSquare className="w-12 h-12" />
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/[0.02]">
              <form onSubmit={handleSubmit} className="relative group">
                <input 
                  type="text" 
                  placeholder="Ask a question or share a thought..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-white/20 group-hover:border-white/20"
                />
                <button 
                  disabled={loading}
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-400 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentSidebar;
