import React from 'react';
import { 
  Heart, MessageSquare, Bookmark, Share2, 
  MoreHorizontal, Sparkles, User, Clock,
  FileText, ThumbsUp, BookOpen 
} from 'lucide-react';
import { motion } from 'framer-motion';

const NoteCard = ({ note, onLike, onBookmark, onCommentClick }) => {
  const { 
    title, content, description, user, author, uploadedBy, 
    subject, tags, likes, upvotes, views, 
    isAiEnhanced, aiSummary, createdAt, link, category, visibility 
  } = note;

  const displayUser = user || author || uploadedBy;
  const displayContent = description || content;
  const isMaterial = !!link;
  const isDiscussion = upvotes !== undefined;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeIcon = () => {
    if (isDiscussion) return <MessageSquare className="w-5 h-5 text-amber-400" />;
    if (isMaterial) return <BookOpen className="w-5 h-5 text-purple-400" />;
    return <FileText className="w-5 h-5 text-primary-400" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Header: User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/20 ${
              isDiscussion ? 'bg-amber-500/20' : isMaterial ? 'bg-purple-500/20' : 'bg-cyan-500/20'
            }`}>
              {displayUser?.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm leading-tight">{displayUser?.name || 'Student'}</h4>
              <div className="flex items-center text-white/50 text-[10px] space-x-2">
                <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-1" /> {formatDate(createdAt)}</span>
                <span>•</span>
                <span className="bg-white/5 px-2 py-0.5 rounded-full">{subject || category || 'General'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {visibility && (
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                visibility === 'public' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500'
              }`}>
                {visibility}
              </span>
            )}
            <button className="text-white/40 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <button 
          onClick={() => onCommentClick(note)}
          className="text-left space-y-2 flex-1 group/content cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="group-hover/content:text-cyan-400 transition-colors">
              {typeIcon()}
            </div>
            <h3 className="text-white text-lg font-bold line-clamp-2 group-hover/content:text-cyan-400 transition-colors">{title}</h3>
          </div>
          <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">
            {isAiEnhanced && aiSummary ? aiSummary : displayContent}
          </p>
        </button>

        {/* Tags / Meta */}
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              #{tag}
            </span>
          ))}
          {isAiEnhanced && (
            <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center shadow-[0_0_10px_0_rgba(168,85,247,0.2)]">
              <Sparkles className="w-3 h-3 mr-1" /> AI Enhanced
            </span>
          )}
        </div>

        {/* Actions bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onLike(note._id)}
              className="flex items-center space-x-1.5 text-white/60 hover:text-red-400 transition-colors group"
            >
              {isDiscussion ? (
                <ThumbsUp className={`w-5 h-5 ${upvotes > 0 ? 'text-amber-400 fill-amber-400/20' : ''}`} />
              ) : (
                <Heart className={`w-5 h-5 ${likes?.length > 0 ? 'fill-red-400 text-red-400' : 'group-hover:fill-red-400/20'}`} />
              )}
              <span className="text-xs font-medium">{isDiscussion ? upvotes : (likes?.length || 0)}</span>
            </button>
            <button 
              onClick={() => onCommentClick(note._id)}
              className="flex items-center space-x-1.5 text-white/60 hover:text-cyan-400 transition-colors"
            >
              <MessageSquare className="w-5 h-5 group-hover:fill-cyan-400/20" />
              <span className="text-xs font-medium">{isDiscussion ? 'Answer' : 'Chat'}</span>
            </button>
          </div>
          
          {isMaterial && link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary !px-3 !py-1.5 !text-[10px] flex items-center gap-1">
              <Share2 className="w-3 h-3" /> Open Resource
            </a>
          ) : (
            <button 
              onClick={() => onBookmark(note._id)}
              className="text-white/60 hover:text-blue-400 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
