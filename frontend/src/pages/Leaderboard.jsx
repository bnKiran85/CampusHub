import { useState, useEffect, useCallback } from 'react';

import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, RefreshCw } from 'lucide-react';

import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return <span className="text-slate-400 font-bold text-sm w-5 text-center">{rank}</span>;
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeaderboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get('/auth/leaderboard');
      setUsers(data);
    } catch { 
      if (!isSilent) setUsers([]); 
    }
    finally { if (!isSilent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);


  const topThree = users.slice(0, 3);
  const rest = users.slice(3);
  const XP_PER_LEVEL = 200;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title mb-1 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-slate-400 text-sm">Top students ranked by XP earned</p>
        </div>
        <button 
          onClick={() => fetchLeaderboard()} 
          disabled={loading}
          className="glass-btn p-2 text-slate-400 hover:text-white transition-colors"
          title="Refresh rankings"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>


      {/* Podium */}
      {!loading && topThree.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-end justify-center gap-4">
          {[topThree[1], topThree[0], topThree[2]].map((u, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
            const colors = {
              1: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              2: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
              3: 'linear-gradient(135deg, #92400e, #b45309)'
            };
            return (
              <motion.div key={u?._id} className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  style={{ background: colors[actualRank] }}>
                  {u?.name?.charAt(0)}
                </div>
                <p className="text-white text-xs font-semibold text-center max-w-[70px] truncate">{u?.name}</p>
                <p className="text-xs text-slate-400">{u?.xp || 0} XP</p>
                <div className={`w-16 ${heights[actualRank]} rounded-t-xl flex items-end justify-center pb-2`}
                  style={{ background: colors[actualRank], opacity: 0.8 }}>
                  <RankIcon rank={actualRank} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Full List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-white/5 rounded w-48"></div>
            </div>
          ))
        ) : (
          users.map((u, i) => {
            const isMe = u._id === user?._id;
            const level = Math.floor((u.xp || 0) / XP_PER_LEVEL) + 1;
            return (
              <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-4 flex items-center gap-4 transition-all ${isMe ? 'ring-1 ring-primary-500/50' : ''}`}
                style={isMe ? { background: 'rgba(99,102,241,0.12)' } : {}}>
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  <RankIcon rank={i + 1} />
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: i < 3 ? 'linear-gradient(135deg, #6366f1, #34d399)' : 'rgba(99,102,241,0.3)' }}>
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold flex items-center gap-2">
                    {u.name}
                    {isMe && <span className="badge-primary text-xs">You</span>}
                  </p>
                  <p className="text-slate-400 text-xs">{u.course || 'Student'} · Level {level}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 justify-end">
                    <Star className="w-3.5 h-3.5" />
                    <span className="font-bold text-sm">{u.xp || 0}</span>
                  </div>
                  <p className="text-xs text-slate-500">XP</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-16">
          <Trophy className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No leaderboard data yet. Start earning XP!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
