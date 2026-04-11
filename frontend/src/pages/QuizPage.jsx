import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, ChevronRight } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const QuizPage = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const { data } = await api.post('/ai/quiz', { topic, difficulty, count: Math.min(count, 10) });
      if (data.error) {
        toast.error(data.summary || 'Failed to generate a valid quiz structure.');
      } else {
        setQuiz(data.questions);
      }
    } catch (err) { 
      const msg = err.response?.data?.message || 'Quiz generation failed. Check your API key or connection.';
      toast.error(msg); 
    }
    finally { setLoading(false); }
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < quiz.length) {
      toast.error('Please answer all questions first!');
      return;
    }
    let s = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.correctIndex) s++; });
    setScore(s);
    setSubmitted(true);
    const pct = Math.round((s / quiz.length) * 100);
    toast.success(`Quiz complete! ${pct}% 🎯`);
    // Award XP
    api.post('/ai/quiz-xp', { score: s, total: quiz.length }).catch(() => {});
  };

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const difficultyColor = { easy: 'success', medium: 'warning', hard: 'danger' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="section-title mb-1 flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary-400" /> AI Quiz Generator
        </h1>
        <p className="text-slate-400 text-sm">Generate smart MCQ quizzes from any topic using AI</p>
      </div>

      {/* Generator Form */}
      {!quiz && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Topic / Subject</label>
              <input className="glass-input" placeholder="e.g., Photosynthesis, World War II, Recursion in Python..."
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateQuiz()} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        difficulty === d ? `badge-${difficultyColor[d]}` : 'btn-ghost text-slate-400'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Questions: {count}</label>
                <input type="range" min={3} max={10} value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full accent-indigo-500" />
              </div>
            </div>
            <motion.button onClick={generateQuiz} disabled={loading} className="btn-primary w-full"
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Quiz...</>
                : <><Sparkles className="w-4 h-4" /> Generate Quiz</>}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {submitted && quiz && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 text-center"
          style={{ background: score / quiz.length >= 0.7 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
          <Trophy className={`w-12 h-12 mx-auto mb-3 ${score / quiz.length >= 0.7 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <h2 className="text-2xl font-bold text-white">{score} / {quiz.length}</h2>
          <p className="text-slate-300 mt-1">
            {Math.round((score / quiz.length) * 100)}% · {score / quiz.length >= 0.7 ? '🎉 Great job!' : '📚 Keep practicing!'}
          </p>
          <button onClick={resetQuiz} className="btn-ghost mt-4 mx-auto">
            <RotateCcw className="w-4 h-4" /> Try Another Quiz
          </button>
        </motion.div>
      )}

      {/* Questions */}
      {quiz && (
        <div className="space-y-4">
          <AnimatePresence>
            {quiz.map((q, qIdx) => (
              <motion.div key={qIdx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.08 }} className="glass-card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    {qIdx + 1}
                  </span>
                  <p className="text-white font-medium leading-relaxed">{q.question}</p>
                </div>
                <div className="space-y-2 ml-10">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx;
                    const isCorrect = q.correctIndex === oIdx;
                    let bgStyle = 'rgba(255,255,255,0.04)';
                    let borderColor = 'rgba(255,255,255,0.08)';
                    if (submitted) {
                      if (isCorrect) { bgStyle = 'rgba(16,185,129,0.15)'; borderColor = 'rgba(16,185,129,0.4)'; }
                      else if (isSelected && !isCorrect) { bgStyle = 'rgba(239,68,68,0.12)'; borderColor = 'rgba(239,68,68,0.3)'; }
                    } else if (isSelected) {
                      bgStyle = 'rgba(99,102,241,0.15)'; borderColor = 'rgba(99,102,241,0.4)';
                    }
                    return (
                      <button key={oIdx} onClick={() => selectAnswer(qIdx, oIdx)}
                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-300 transition-all flex items-center justify-between"
                        style={{ background: bgStyle, border: `1px solid ${borderColor}` }}
                        disabled={submitted}>
                        <span>{opt}</span>
                        {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="ml-10 mt-3 p-3 rounded-xl text-xs text-slate-300"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    💡 {q.explanation}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {!submitted && (
            <motion.button onClick={submitQuiz} className="btn-primary w-full"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Submit Quiz <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
