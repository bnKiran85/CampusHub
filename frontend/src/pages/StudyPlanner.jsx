import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Loader2, Clock, BookOpen, RefreshCw } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#6366f1', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const StudyPlanner = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [studyHours, setStudyHours] = useState(4);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/assignments');
        setAssignments(data.filter(a => !a.completed));
      } catch { /* silent */ }
    })();
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/study-schedule', {
        assignments: assignments.map(a => ({
          title: a.title, subject: a.subject, dueDate: a.dueDate, priority: a.priority
        })),
        studyHoursPerDay: studyHours
      });
      if (data.error) {
        toast.error('AI was unable to format a valid schedule. Try again with fewer assignments.');
      } else {
        setSchedule(data.schedule);
        toast.success('Study plan generated! 📅');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate plan. Check configuration.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title mb-1 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary-400" /> AI Study Planner
        </h1>
        <p className="text-slate-400 text-sm">Auto-generate a personalized weekly study schedule based on your assignments</p>
      </div>

      {/* Config */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <label className="text-sm text-slate-300 font-medium block mb-2">Daily Study Hours: {studyHours}h</label>
            <input type="range" min={1} max={12} value={studyHours}
              onChange={e => setStudyHours(Number(e.target.value))}
              className="w-full accent-indigo-500" />
          </div>
          <div className="text-sm text-slate-400">
            <p>{assignments.length} pending assignments detected</p>
          </div>
          <motion.button onClick={generatePlan} disabled={loading} className="btn-primary flex-shrink-0"
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> {schedule ? 'Regenerate' : 'Generate'} Plan</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Schedule Output */}
      {schedule && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {typeof schedule === 'string' ? (
            <div className="glass-card p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {schedule}
            </div>
          ) : (
            DAYS.map((day, i) => {
              const tasks = schedule[day] || schedule[day.toLowerCase()] || [];
              return tasks.length > 0 ? (
                <motion.div key={day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-6 rounded-full" style={{ background: COLORS[i] }} />
                    <h3 className="text-white font-semibold">{day}</h3>
                    <span className="text-xs text-slate-400 ml-auto">{tasks.length} session{tasks.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2 ml-5">
                    {(Array.isArray(tasks) ? tasks : [tasks]).map((task, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{typeof task === 'object' ? `${task.time || ''} — ${task.task || task.title || JSON.stringify(task)}` : task}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null;
            })
          )}
        </motion.div>
      )}

      {!schedule && !loading && (
        <div className="text-center py-16 glass-card">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No schedule yet</h3>
          <p className="text-slate-400 text-sm mt-1">Click "Generate Plan" to create your personalized study timetable</p>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
