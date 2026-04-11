import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import api from '../api/axiosInstance';

const AiAssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Study Assistant. Ask me anything about your subjects, assignments, or study strategies!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: input.trim() });
      
      // If AI failed structure but provided fallback
      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.summary || '⚠️ AI is currently adjusting its response format. Please try again soon.'
        }]);
        return;
      }

      const assistantMsg = { 
        role: 'assistant', 
        content: data.summary || data.title || 'Insight generated',
        structured: {
          title: data.title,
          points: data.points,
          examples: data.examples,
          tip: data.tip
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err.response?.data?.message || '⚠️ Sorry, I encountered a connection error. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: msg
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #6366f1, #34d399)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: open ? '0 0 30px rgba(99,102,241,0.8)' : '0 0 20px rgba(99,102,241,0.4)' }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl flex flex-col overflow-hidden"
            style={{
              height: '520px',
              background: 'rgba(15, 15, 40, 0.95)',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3"
              style={{ background: 'rgba(99,102,241,0.15)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #34d399)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">CampusHub AI Tutor</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm shadow-indigo-500/20 shadow-lg'
                        : 'text-slate-200 rounded-bl-sm'
                    }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {msg.structured ? (
                      <div className="space-y-3">
                        {msg.structured.title && (
                          <p className="font-bold text-primary-400 border-b border-white/5 pb-1">
                            {msg.structured.title}
                          </p>
                        )}
                        <p>{msg.content}</p>
                        
                        {msg.structured.points?.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Points</p>
                            <ul className="space-y-1">
                              {msg.structured.points.map((p, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-primary-500">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structured.examples?.length > 0 && (
                          <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs font-semibold text-emerald-400 mb-1">💡 Example</p>
                            <p className="text-xs text-slate-300 italic">{msg.structured.examples[0]}</p>
                          </div>
                        )}
                        
                        {msg.structured.tip && (
                          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <p className="text-xs font-semibold text-amber-400 mb-0.5">🧠 Study Tip</p>
                            <p className="text-xs text-slate-300">{msg.structured.tip}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    <span className="text-slate-400 text-xs">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/8">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistantChat;
