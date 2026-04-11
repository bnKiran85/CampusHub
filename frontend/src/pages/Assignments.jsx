import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, CheckCircle2, Circle, Calendar, Brain,
  Loader2, Filter, ChevronDown, Sparkles, BookOpen, Trash2
} from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1">Assignments</h1>
          <p className="text-slate-400 text-sm">{assignments.filter(a => !a.completed).length} pending · {assignments.filter(a => a.completed).length} completed</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="glass-input !py-2 !px-3 text-sm w-auto"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <motion.button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" /> Add Task
          </motion.button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-400" /> New Assignment
            </h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="glass-input md:col-span-2" placeholder="Assignment title *" required
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="glass-input md:col-span-2" placeholder="Description (optional)"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <select className="glass-input" value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
              </select>
              <input type="date" className="glass-input" required value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              <select className="glass-input" value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p} className="bg-gray-900">{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
              </select>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Add Assignment</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((a, i) => {
              const days = daysUntil(a.dueDate);
              const pc = priorityColor[a.priority] || 'primary';
              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 transition-all ${a.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle */}
                    <button onClick={() => toggleComplete(a._id, a.completed)} className="mt-0.5 flex-shrink-0">
                      {a.completed
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        : <Circle className="w-6 h-6 text-slate-500 hover:text-primary-400 transition-colors" />
                      }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className={`font-semibold text-lg ${a.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {a.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`badge-${pc}`}>{a.priority}</span>
                          {a.subject && <span className="badge-primary">{a.subject}</span>}
                        </div>
                      </div>
                      {a.description && (
                        <p className="text-slate-400 text-sm mt-1">{a.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {a.dueDate ? (
                            <span className={days <= 1 && !a.completed ? 'text-red-400 font-medium' : ''}>
                              {days <= 0 && !a.completed ? 'Overdue!' : `Due in ${days}d`}
                            </span>
                          ) : 'No deadline'}
                        </div>
                        {!a.completed && (
                          <button
                            onClick={() => getAIHint(a)}
                            disabled={hintLoading[a._id]}
                            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            {hintLoading[a._id]
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Brain className="w-3 h-3" />
                            }
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
                            className="mt-3 p-3 rounded-xl text-sm text-slate-300"
                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                          >
                            <p className="text-primary-400 text-xs font-semibold mb-1">🤖 AI Hint</p>
                            {aiHint[a._id]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteAssignment(a._id)}
                      className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-60" />
              <h3 className="text-white font-semibold text-lg">No assignments found</h3>
              <p className="text-slate-400 text-sm mt-1">Add your first task to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignments;
