import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2, Brain, Sparkles, Loader2, Search, PenTool, X } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import SmartAIView from '../components/SmartAIView';
import { ListSkeleton } from '../components/SkeletonLoaders';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', content: '', subject: '', visibility: 'private' });
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});
  const [summaryError, setSummaryError] = useState({});
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPreview, setEnhancedPreview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/notes');
        setNotes(data);
      } catch { toast.error('Failed to load notes'); }
      finally { setLoading(false); }
    })();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/notes', form);
      setNotes(prev => [data, ...prev]);
      setForm({ title: '', content: '', subject: '', visibility: 'private' });
      setShowAdd(false);
      toast.success(data.visibility === 'public' ? 'Note submitted for approval! 📤' : 'Note saved! 📝');
    } catch { toast.error('Failed to save note'); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const summarizeNote = async (note) => {
    setSummaryLoading(p => ({ ...p, [note._id]: true }));
    setSummaryError(p => ({ ...p, [note._id]: null }));
    try {
      const { data } = await api.post('/ai/summarize', { text: note.content, title: note.title });
      setSummaries(p => ({ ...p, [note._id]: data }));
    } catch { 
      setSummaryError(p => ({ ...p, [note._id]: 'Failed to generate summary' }));
    }
    finally { setSummaryLoading(p => ({ ...p, [note._id]: false })); }
  };

  const enhanceNote = async () => {
    if (!form.content) return toast.error('Add some content first');
    setIsEnhancing(true);
    try {
      const { data } = await api.post('/ai/enhance-note', { text: form.content, title: form.title });
      setEnhancedPreview(data);
      toast.success('AI has enhanced your note! Review below. ✨');
    } catch { toast.error('Enhancement failed'); }
    finally { setIsEnhancing(false); }
  };

  const applyEnhancement = () => {
    if (!enhancedPreview) return;
    const fullContent = enhancedPreview.sections?.map(s => `${s.heading}\n${s.content}`).join('\n\n');
    setForm(p => ({ ...p, title: enhancedPreview.title, content: fullContent }));
    setEnhancedPreview(null);
    toast.success('Enhancement applied!');
  };

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">My Notes</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {notes.length} saved entries
          </p>
        </div>
        <motion.button 
          onClick={() => setShowAdd(!showAdd)} 
          className="btn-primary !rounded-2xl shadow-premium !px-5 tap-highlight-none"
          whileHover={{ y: -2 }} 
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4 mr-0 md:mr-2" /> 
          <span className="hidden md:inline">New Note</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input 
          className="glass-input !pl-12 !py-4 shadow-inner-light !rounded-2xl focus:ring-2 focus:ring-indigo-500/20" 
          placeholder="Search by title or subject..."
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-5 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-black flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-400" />
                Craft New Note
              </h3>
              <button 
                onClick={enhanceNote}
                disabled={isEnhancing}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#a855f7] bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-all disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Enhance
              </button>
            </div>

            <form onSubmit={addNote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="glass-input !rounded-2xl !py-4" placeholder="Compelling Title *" required
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <input className="glass-input !rounded-2xl !py-4" placeholder="Course / Subject"
                  value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <textarea rows={6} className="glass-input !rounded-2xl !py-4 resize-none" placeholder="Deep dive into your thoughts..." required
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Access Control:</p>
                <div className="flex gap-2">
                  {['private', 'public'].map(v => (
                    <button 
                      key={v}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, visibility: v }))}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        form.visibility === v 
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' 
                        : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {enhancedPreview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20"
                >
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-3">AI Enhancement Preview</p>
                  <div className="text-sm text-slate-300 leading-relaxed mb-4">
                    <SmartAIView data={enhancedPreview} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={applyEnhancement}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors"
                    >
                      Apply Enhancement
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEnhancedPreview(null)}
                      className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary !rounded-2xl !py-4 font-black text-sm uppercase tracking-wider">Archive Note</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost !rounded-2xl !py-4 px-8 font-black text-sm uppercase tracking-wider">Discard</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((note, i) => (
              <motion.div 
                key={note._id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 200, delay: i * 0.05 }} 
                className="glass-card p-6 flex flex-col group relative overflow-hidden h-full min-h-[220px]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h3 className="text-white font-black text-lg leading-tight truncate group-hover:text-indigo-400 transition-colors">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border ${
                        note.visibility === 'public' 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-slate-500/10 border-white/5 text-slate-500'
                      }`}>
                        {note.visibility}
                      </span>
                      {note.subject && (
                        <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 truncate">
                          {note.subject}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteNote(note._id)} 
                    className="md:opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4 mb-6">
                  {note.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <button 
                    onClick={() => summarizeNote(note)} 
                    disabled={summaryLoading[note._id]}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6366f1] hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {summaryLoading[note._id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Smart Summarize
                  </button>
                  <span className="text-[8px] font-mono text-slate-600 uppercase">
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Inline Summary */}
                <AnimatePresence>
                  {(summaries[note._id] || summaryLoading[note._id]) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 z-10 bg-[#0f0f23]/95 backdrop-blur-xl p-6 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          AI Summary
                        </h4>
                        <button 
                          onClick={() => setSummaries(p => { const n = {...p}; delete n[note._id]; return n; })}
                          className="p-1 rounded-lg text-slate-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar pb-4 text-slate-300 text-sm leading-relaxed">
                        {summaryLoading[note._id] ? (
                          <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Consulting AI Knowledge...</p>
                          </div>
                        ) : summaryError[note._id] ? (
                          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                              <X className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-400">{summaryError[note._id]}</p>
                            <button onClick={() => summarizeNote(note)} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2 hover:underline">Retry</button>
                          </div>
                        ) : (
                          <SmartAIView data={summaries[note._id]} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-white font-black text-xl">The Void is Empty</p>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">Start building your knowledge database by creating your first note.</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mt-8">Begin Creation</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
