import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, CheckCircle2, Circle, Calendar, Brain,
  Loader2, Filter, ChevronDown, Sparkles, BookOpen, Trash2
} from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ListSkeleton } from '../components/SkeletonLoaders';

const SUBJECTS = ['Math', 'Physics', 'CS', 'Chemistry', 'English', 'Biology', 'History', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];

const priorityColor = { low: 'success', medium: 'warning', high: 'danger' };

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [aiHint, setAiHint] = useState({});
  const [hintLoading, setHintLoading] = useState({});
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', subject: '', priority: 'medium'
  });

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data);
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/assignments', form);
      setAssignments(prev => [data, ...prev]);
      setForm({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
      setShowAdd(false);
      toast.success('Assignment added! ✅');
    } catch { toast.error('Failed to add assignment'); }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const { data } = await api.put(`/assignments/${id}`, { completed: !completed });
      setAssignments(prev => prev.map(a => a._id === id ? { ...a, completed: !completed } : a));
      if (!completed) {
        toast.success('Task completed! +20 XP 🎉');
        updateUser({ xp: data.xp });
      }
    } catch { toast.error('Failed to update'); }
  };

  const deleteAssignment = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast.success('Assignment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const getAIHint = async (assignment) => {
    setHintLoading(prev => ({ ...prev, [assignment._id]: true }));
    try {
      const { data } = await api.post('/ai/assignment-hint', {
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
      });
      setAiHint(prev => ({ ...prev, [assignment._id]: data.hint }));
    } catch { toast.error('AI hint unavailable'); }
    finally { setHintLoading(prev => ({ ...prev, [assignment._id]: false })); }
  };

  const filtered = filterPriority === 'all'
    ? assignments
    : assignments.filter(a => a.priority === filterPriority);

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">Missions</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              {assignments.filter(a => !a.completed).length} active · {assignments.filter(a => a.completed).length} archived
            </p>
          </div>
          <motion.button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary !rounded-2xl !px-5 shadow-premium tap-highlight-none"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4 mr-0 md:mr-2" />
            <span className="hidden md:inline font-bold">New Mission</span>
          </motion.button>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setFilterPriority('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              filterPriority === 'all' 
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' 
              : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            All Priority
          </button>
          {PRIORITIES.map(p => (
            <button 
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filterPriority === p 
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' 
                : 'bg-white/5 border-white/5 text-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-5 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-black flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Assemble New Task
              </h3>
              <button 
                onClick={() => setShowAdd(false)}
                className="p-2 mr-[-8px] text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                className="glass-input !rounded-2xl !py-4" 
                placeholder="What needs to be done? *" 
                required
                value={form.title} 
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} 
              />
              <textarea 
                className="glass-input !rounded-2xl !py-4 resize-none" 
                placeholder="Detailed mission brief (optional)"
                rows={3}
                value={form.description} 
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Subject</label>
                  <select className="glass-input !rounded-xl !py-3.5 !px-4" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                    <option value="">Select Domain</option>
                    {SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0f0f23]">{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Deadline</label>
                  <input type="date" className="glass-input !rounded-xl !py-3 !px-4" required value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Priority</label>
                  <select className="glass-input !rounded-xl !py-3.5 !px-4" value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#0f0f23]">{p.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary !rounded-2xl !py-4 font-black">Commit Mission</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost !rounded-2xl !py-4 px-8 font-black">Abort</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment List */}
      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((a, i) => {
              const days = daysUntil(a.dueDate);
              const isOverdue = days < 0 && !a.completed;
              const isNear = days === 0 && !a.completed;

              return (
                <motion.div
                  key={a._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 group flex items-center gap-5 transition-all ${
                    a.completed ? 'opacity-40 grayscale-[0.5]' : ''
                  }`}
                >
                  {/* Status Toggle */}
                  <button 
                    onClick={() => toggleComplete(a._id, a.completed)} 
                    className="flex-shrink-0 tap-highlight-none"
                  >
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                      a.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'border-white/10 text-transparent hover:border-indigo-500/50'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h3 className={`font-black text-lg transition-all leading-tight truncate ${
                        a.completed ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-lg border ${
                          a.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                          a.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}>
                          {a.priority}
                        </span>
                        {a.subject && (
                          <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            {a.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    {!a.completed && a.description && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-1 italic">{a.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                        isOverdue ? 'text-rose-500' : isNear ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {a.dueDate ? (
                          <span>{isOverdue ? 'Overdue!' : isNear ? 'Due Today' : `Due in ${days}d`}</span>
                        ) : 'No Deadline'}
                      </div>
                      
                      {!a.completed && (
                        <button
                          onClick={() => getAIHint(a)}
                          disabled={hintLoading[a._id]}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#a855f7] hover:text-purple-300 transition-colors"
                        >
                          {hintLoading[a._id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                          AI Hint
                        </button>
                      )}
                    </div>

                    {/* AI Hint Reveal */}
                    <AnimatePresence>
                      {aiHint[a._id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-slate-400 leading-relaxed relative"
                        >
                          <div className="absolute top-[-8px] left-6 text-indigo-400">
                            <Sparkles className="w-4 h-4 fill-indigo-400" />
                          </div>
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Strategy Intelligence:</p>
                          {aiHint[a._id]}
                          <button 
                            onClick={() => setAiHint(prev => { const n={...prev}; delete n[a._id]; return n; })}
                            className="absolute top-2 right-2 p-1 text-slate-600 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteAssignment(a._id)}
                    className="md:opacity-0 group-hover:opacity-100 p-3 rounded-2xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all ml-auto self-start md:self-center"
                  >
                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-20" />
              </div>
              <p className="text-white font-black text-xl tracking-tight">Zero Active Missions</p>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">All targets have been neutralized. Ready for new objective?</p>
              <button 
                onClick={() => setShowAdd(true)}
                className="btn-primary mt-8 scale-110 !px-8"
              >
                Launch Mission
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignments;
