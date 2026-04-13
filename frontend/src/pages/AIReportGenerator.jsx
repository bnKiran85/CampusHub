import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Brain, Download, RefreshCw, 
  Target, TrendingUp, AlertTriangle, Lightbulb,
  ChevronRight, Calendar, Sparkles, History
} from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AIReportGenerator = () => {
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/reports');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch report history');
    }
  };

  const generateReport = async () => {
    if (!subject) return toast.error('Please specify a subject/topic');
    setLoading(true);
    try {
      const res = await api.post('/ai/report', { subject });
      setReport(res.data);
      toast.success('Professional Report Generated!');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#07071c'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${subject}_AI_Report.pdf`);
  };

  const radarData = report ? [
    { subject: 'Consistency', A: report.dataSnapshot.streak * 10, fullMark: 100 },
    { subject: 'Documentation', A: Math.min(report.dataSnapshot.noteCount * 10, 100), fullMark: 100 },
    { subject: 'Reliability', A: (report.dataSnapshot.completedAssignments / (report.dataSnapshot.assignmentCount || 1)) * 100, fullMark: 100 },
    { subject: 'Experience', A: Math.min(report.dataSnapshot.xp / 50, 100), fullMark: 100 },
    { subject: 'Accuracy', A: report.performanceScore, fullMark: 100 },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="section-title mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-400" /> AI Performance Report
          </h1>
          <p className="text-slate-400 max-w-xl">
            Get a professional, data-driven analysis of your academic performance powered by CampusHub AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="glass-btn px-4 py-2 flex items-center gap-2 text-slate-300"
          >
            <History className="w-4 h-4" /> {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
      </div>

      {/* Input Section */}
      {!report && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center space-y-6 border-primary-500/20"
        >
          <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto border border-primary-500/20">
            <Brain className="w-10 h-10 text-primary-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Target Your Analysis</h2>
            <p className="text-slate-400 text-sm italic">"Select a subject or specific topic you want to analyze your progress in."</p>
          </div>
          <div className="max-w-md mx-auto flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Data Structures, Modern Physics..."
              className="glass-input flex-1 px-4 py-3 text-white outline-none"
            />
            <button 
              onClick={generateReport}
              disabled={loading}
              className="primary-btn px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              {loading ? 'Analyzing...' : 'Generate'}
            </button>
          </div>
        </motion.div>
      )}

      {/* History Sidebar/Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {history.map((h) => (
                <div 
                  key={h._id} 
                  onClick={() => { setReport(h); setSubject(h.subject); setShowHistory(false); }}
                  className="glass-card p-4 cursor-pointer hover:border-primary-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary-400 text-xs font-bold uppercase tracking-wider">{h.subject}</span>
                    <span className="text-slate-500 text-[10px]">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white font-semibold text-sm line-clamp-1">{h.summary}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-slate-300">{h.performanceScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="col-span-full text-center py-10 text-slate-500">No reports generated yet.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setReport(null)} className="glass-btn px-4 py-2 text-sm text-slate-400">
              <RefreshCw className="w-4 h-4 mr-2 inline" /> New Analysis
            </button>
            <button onClick={downloadPDF} className="primary-btn px-4 py-2 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <motion.div 
            ref={reportRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="report-container bg-[#07071c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Report Banner */}
            <div className="p-8 md:p-12 text-white relative overflow-hidden" 
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))' }}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="w-40 h-40" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2 bg-primary-500/20 w-fit px-3 py-1 rounded-full border border-primary-500/30">
                    <Sparkles className="w-3 h-3 text-primary-400" />
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Performance Analysis</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black">{subject}</h1>
                  <p className="text-slate-400 text-lg leading-relaxed">{report.summary}</p>
                </div>
                <div className="stat-card bg-white/5 backdrop-blur-xl border-white/10 p-6 min-w-[200px] text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Index Score</p>
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                    {report.performanceScore}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Scale: 0 - 100</p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analysis Visual */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" /> Competency Profile
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Student"
                          dataKey="A"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SWOT Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Key Strengths
                    </h3>
                    <div className="space-y-2">
                      {report.strengths.map((s, i) => (
                        <div key={i} className="flex gap-3 text-sm text-slate-300 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                          <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Growth Areas
                    </h3>
                    <div className="space-y-2">
                      {report.weaknesses.map((w, i) => (
                        <div key={i} className="flex gap-3 text-sm text-slate-300 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                          <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Plan Section */}
              <div className="space-y-6">
                <div className="glass-card p-6 border-primary-500/20 bg-primary-500/5">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-400" /> Optimized Study Plan
                  </h3>
                  <div className="space-y-6">
                    {report.studyPlan.map((day, i) => (
                      <div key={i} className="relative pl-6 border-l border-white/10 pb-4 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <h4 className="text-white font-bold text-sm mb-2">{day.day}</h4>
                        <ul className="space-y-1">
                          {day.tasks.map((task, ti) => (
                            <li key={ti} className="text-slate-400 text-xs flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-slate-600" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 border-emerald-500/20">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-emerald-400" /> Pro Recommendations
                  </h3>
                  <div className="space-y-3">
                    {report.recommendations.map((r, i) => (
                      <p key={i} className="text-slate-400 text-xs leading-relaxed italic">
                        "{r}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <span>Verified by CampusHub AI Engine</span>
              <span>Report ID: {report._id.substring(0, 8)}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIReportGenerator;
