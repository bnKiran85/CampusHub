import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, List, HelpCircle, ArrowRight, Brain, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const SmartAIView = ({ data, loading, error, onAction }) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-4 bg-white/10 rounded w-1/3"></div>
        <div className="h-20 bg-white/5 rounded-2xl w-full"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full"></div>
          <div className="h-3 bg-white/5 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
        <Brain className="w-10 h-10 text-red-500/50 mx-auto mb-3" />
        <p className="text-red-400 text-sm font-medium">{error}</p>
        <button 
          onClick={onAction}
          className="mt-4 text-xs text-red-400/60 hover:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-bold">{data.title || 'AI Insights'}</h3>
        </div>
        {data.sections && (
          <button 
            onClick={() => {
              const text = data.sections.map(s => `## ${s.heading}\n${s.content}`).join('\n\n');
              navigator.clipboard.writeText(text);
              toast.success('Notes copied to clipboard!');
            }}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
            title="Copy all notes"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Summary Area */}
      {data.summary && (
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-cyan-500/30 rounded-full" />
          <p className="text-white/80 text-sm leading-relaxed italic">
            "{data.summary}"
          </p>
        </div>
      )}

      {/* Structured Sections (for Enhancer) */}
      {data.sections && (
        <div className="space-y-4">
          {data.sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-cyan-400 text-xs font-black uppercase tracking-wider">{section.heading}</h4>
              <p className="text-white/70 text-sm whitespace-pre-wrap pl-4 border-l border-white/5">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* List Items (for Examples, Key Concepts, Points) */}
      {(data.points || data.keyConcepts || data.keyTakeaways) && (
        <div className="grid grid-cols-1 gap-3">
          {(data.points || data.keyConcepts || data.keyTakeaways).map((point, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="text-white/80 text-sm">{point}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Questions Area */}
      {(data.importantQuestions || data.questions) && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white/30 flex items-center gap-2">
            <HelpCircle className="w-3 h-3" /> PRACTICE QUESTIONS
          </h4>
          <div className="space-y-2">
            {(data.importantQuestions || data.questions).map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors group cursor-default">
                <p className="text-white/60 text-xs group-hover:text-white transition-colors">
                  {typeof q === 'string' ? q : q.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      {(data.tip || data.encouragement) && (
        <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between gap-4">
          {data.tip && (
            <div className="flex-1">
              <p className="text-[10px] font-bold text-cyan-500 uppercase">Pro Tip</p>
              <p className="text-xs text-white/40 italic">{data.tip}</p>
            </div>
          )}
          {data.encouragement && (
            <div className="text-right">
              <p className="text-xs font-medium text-white/60">"{data.encouragement}"</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SmartAIView;
