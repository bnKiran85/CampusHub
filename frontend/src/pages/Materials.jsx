import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Download, Trash2, Loader2, Search, Upload, Brain, X, FileText } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import SmartAIView from '../components/SmartAIView';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', subject: '', link: '', visibility: 'public' });
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [errorAI, setErrorAI] = useState(null);
  const [explainingMaterial, setExplainingMaterial] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/materials');
        setMaterials(data);
      } catch { toast.error('Failed to load materials'); }
      finally { setLoading(false); }
    })();
  }, []);

  const addMaterial = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/materials', form);
      setMaterials(prev => [data, ...prev]);
      setForm({ title: '', description: '', subject: '', link: '', visibility: 'public' });
      setShowAdd(false);
      toast.success('Material added! 📚');
    } catch { toast.error('Failed to add material'); }
  };

  const deleteMaterial = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(prev => prev.filter(m => m._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const explainWithAi = async (material) => {
    setIsExplaining(true);
    setAiExplanation(null);
    setErrorAI(null);
    setExplainingMaterial(material);
    try {
      const { data } = await api.post('/ai/explain-material', {
        title: material.title,
        content: material.description || material.title,
        type: material.category
      });
      setAiExplanation(data);
    } catch {
      setErrorAI('AI analysis failed. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon = (link) => {
    if (!link) return '📄';
    if (link.match(/\.(pdf)$/i)) return '📕';
    if (link.match(/\.(ppt|pptx)$/i)) return '📊';
    if (link.match(/youtube|youtu\.be/i)) return '🎥';
    return '🔗';
  };

  return (
    <div className="flex gap-6 relative min-h-screen">
      <div className={`flex-1 space-y-6 transition-all duration-500 ${explainingMaterial ? 'mr-[400px]' : ''}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1 flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-primary-400" /> Study Materials
            </h1>
            <p className="text-slate-400 text-sm">{materials.length} resources</p>
          </div>
          <motion.button onClick={() => setShowAdd(!showAdd)} className="btn-primary"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Plus className="w-4 h-4" /> Add Material
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="glass-input pl-10" placeholder="Search materials..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-400" /> Add Resource
              </h3>
              <form onSubmit={addMaterial} className="space-y-3">
                <input className="glass-input" placeholder="Title *" required
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <input className="glass-input" placeholder="Subject"
                  value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                <input className="glass-input" placeholder="Link (URL to PDF, slides, video...)"
                  value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
                <textarea rows={2} className="glass-input resize-none" placeholder="Description (optional)"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                
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
                  <button type="submit" className="btn-primary">Add Resource</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <motion.div key={m._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex flex-col gap-3 group cursor-default"
                whileHover={{ y: -3 }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{typeIcon(m.link)}</div>
                    {m.isVerified && (
                      <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-tighter">
                        Verified
                      </span>
                    )}
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${
                        m.visibility === 'public' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>
                      {m.visibility}
                    </span>
                  </div>
                  <button onClick={() => deleteMaterial(m._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{m.title}</h3>
                  {m.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{m.description}</p>}
                </div>
                <div className="flex items-center justify-between mt-auto gap-2">
                  {m.subject && <span className="badge-primary text-xs">{m.subject}</span>}
                  <div className="flex items-center gap-3 ml-auto">
                    <button 
                      onClick={() => explainWithAi(m)}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 transition-all"
                    >
                      <Brain className="w-3.5 h-3.5" /> Explain
                    </button>
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Open
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Explanation Panel */}
      <AnimatePresence>
        {explainingMaterial && (
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0A0A1F]/95 backdrop-blur-2xl border-l border-white/10 p-8 overflow-y-auto z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" /> AI Explainer
              </h2>
              <button 
                onClick={() => setExplainingMaterial(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Explaining Resource</p>
                <h3 className="text-white font-bold">{explainingMaterial.title}</h3>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl relative min-h-[200px]">
                <SmartAIView 
                  data={aiExplanation} 
                  loading={isExplaining} 
                  error={errorAI} 
                  onAction={() => explainWithAi(explainingMaterial)}
                />
              </div>
              
              {!isExplaining && aiExplanation && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold">Generate Quiz from this</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold">Save key topics to Notes</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Materials;
