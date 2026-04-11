import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2, Brain, Sparkles, Loader2, Search } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import SmartAIView from '../components/SmartAIView';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1">Notes</h1>
          <p className="text-slate-400 text-sm">{notes.length} notes saved</p>
        </div>
        <motion.button onClick={() => setShowAdd(!showAdd)} className="btn-primary"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Plus className="w-4 h-4" /> New Note
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="glass-input pl-10" placeholder="Search notes..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">📝 New Note</h3>
              <button 
                onClick={enhanceNote}
                disabled={isEnhancing}
                className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.3 h-3.3" />}
                AI Enhance
              </button>
            </div>
            {enhancedPreview && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20">
                <SmartAIView data={enhancedPreview} />
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={applyEnhancement} className="btn-primary !bg-purple-600 !py-2 text-xs">Apply This Enhancement</button>
                  <button type="button" onClick={() => setEnhancedPreview(null)} className="btn-ghost !py-2 text-xs">Dismiss</button>
                </div>
              </motion.div>
            )}
            <form onSubmit={addNote} className="space-y-3">
              <input className="glass-input" placeholder="Title *" required
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="glass-input" placeholder="Subject (optional)"
                value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              <textarea rows={5} className="glass-input resize-none" placeholder="Write your notes here..." required
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
                {form.visibility === 'public' && (
                  <p className="text-[10px] text-amber-400 italic">Requires moderation before showing in feed</p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Save Note</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((note, i) => (
              <motion.div key={note._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 flex flex-col group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      <h3 className="text-white font-semibold text-sm">{note.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        note.visibility === 'public' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        {note.visibility}
                      </span>
                      {note.visibility === 'public' && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          note.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                          note.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {note.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteNote(note._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {note.subject && <span className="badge-primary text-xs self-start mb-2">{note.subject}</span>}
                <p className="text-slate-400 text-sm leading-relaxed flex-1 line-clamp-4">{note.content}</p>

                <AnimatePresence>
                  {(summaries[note._id] || summaryLoading[note._id] || summaryError[note._id]) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="mt-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <SmartAIView 
                        data={summaries[note._id]} 
                        loading={summaryLoading[note._id]} 
                        error={summaryError[note._id]} 
                        onAction={() => summarizeNote(note)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => summarizeNote(note)} disabled={summaryLoading[note._id]}
                    className="btn-ghost text-xs flex-1 gap-1.5 hover:bg-primary-500/10">
                    {summaryLoading[note._id]
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Brain className="w-3.5 h-3.5 text-primary-400" />}
                    Smart Summary
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase">Last edited: {new Date(note.updatedAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <FileText className="w-14 h-14 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No notes yet. Create your first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
