import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Sparkles, User, MessageCircle, MoreVertical, Paperclip, Smile } from 'lucide-react';
import api from '../api/axiosInstance';

const AiAssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Greetings! I'm your AI Knowledge Core. Need help deconstructing a complex topic or strategizing your study plan?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: input.trim() });
      
      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.summary || '⚠️ Neural link interrupted. Please recalibrate your query.'
        }]);
        return;
      }

      const assistantMsg = { 
        role: 'assistant', 
        content: data.summary || data.title || 'Data synthesized',
        structured: {
          title: data.title,
          points: data.points,
          examples: data.examples,
          tip: data.tip
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err.response?.data?.message || '⚠️ Connection loss detected. Re-establishing link...';
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
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-premium bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white border border-white/20 tap-highlight-none"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MessageCircle className="w-6 h-6" />
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f0f23]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[100] sm:w-[400px] sm:h-[600px] bg-[#0c0c1e] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
          >
            {/* WhatsApp Header Style */}
            <div className="px-5 py-4 bg-[#161633] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm tracking-tight leading-none">AI Study Core</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Insight</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar bg-[#0c0c1e]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-premium relative ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-[#1a1a3a] text-slate-200 rounded-tl-none border border-white/5'
                      }`}
                    >
                      {msg.structured ? (
                        <div className="space-y-4">
                          {msg.structured.title && (
                            <div className="border-b border-white/5 pb-2 mb-2">
                              <p className="text-xs font-black uppercase tracking-widest text-indigo-300">
                                {msg.structured.title}
                              </p>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          
                          {msg.structured.points?.length > 0 && (
                            <div className="grid gap-2 mt-2">
                              {msg.structured.points.map((p, idx) => (
                                <div key={idx} className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                  <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-[11px] leading-snug">{p}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.structured.tip && (
                            <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Smile className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Tactical Tip</span>
                              </div>
                              <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">{msg.structured.tip}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 px-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a3a] px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(d => (
                        <motion.div 
                          key={d}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                          className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>

            {/* Smart Input Footer */}
            <div className="p-4 bg-[#161633] border-t border-white/5">
              <div className="flex items-center gap-3">
                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type intelligence query..."
                    className="w-full bg-[#0c0c1e] text-white text-sm px-4 py-3.5 rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-600">
                    <Smile className="w-5 h-5 hover:text-indigo-400 cursor-pointer" />
                  </div>
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex justify-center mt-3">
                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Link encrypted via CampusHub Protocol</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistantChat;
