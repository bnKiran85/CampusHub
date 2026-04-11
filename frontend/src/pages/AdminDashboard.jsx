import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Check, X, AlertCircle, FileText, FolderOpen, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [pending, setPending] = useState({ notes: [], materials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/admin/pending');
      setPending(data);
    } catch (err) {
      toast.error('Failed to load pending content');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, id, status) => {
    try {
      if (type === 'note') {
        await api.patch(`/admin/notes/${id}/status`, { status });
      } else {
        await api.patch(`/materials/${id}/verify`, { status });
      }
      toast.success(`${type} ${status}`);
      fetchPending();
    } catch (err) {
      toast.error(`Failed to ${status} ${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-cyan-400" />
              Moderation Cube
            </h1>
            <p className="text-white/50 mt-2">Approve or reject community contributions.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Notes Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <FileText className="text-cyan-400" />
              <h2 className="text-2xl font-bold">Pending Notes</h2>
              <span className="ml-auto bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold">
                {pending.notes.length}
              </span>
            </div>

            <div className="space-y-4">
              {pending.notes.map(note => (
                <motion.div 
                  key={note._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{note.title}</h3>
                      <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" /> {note.user?.name} ({note.user?.email})
                      </p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-3 bg-black/20 p-3 rounded-xl">
                    {note.content}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('note', note._id, 'approved')}
                      className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction('note', note._id, 'rejected')}
                      className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
              {!loading && pending.notes.length === 0 && (
                <div className="text-center py-10 text-white/20">
                  <Check className="w-10 h-10 mx-auto mb-2" />
                  <p>All notes moderated!</p>
                </div>
              )}
            </div>
          </section>

          {/* Materials Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <FolderOpen className="text-purple-400" />
              <h2 className="text-2xl font-bold">Community Materials</h2>
              <span className="ml-auto bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                {pending.materials.length}
              </span>
            </div>

            <div className="space-y-4">
              {pending.materials.map(material => (
                <motion.div 
                  key={material._id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{material.title}</h3>
                      <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" /> {material.uploadedBy?.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-white/10 rounded font-mono text-[10px]">{material.category}</span>
                  </div>
                  <p className="text-white/60 text-sm">{material.description}</p>
                  <a href={material.link} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs underline block">View File</a>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction('material', material._id, 'approved')}
                      className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction('material', material._id, 'rejected')}
                      className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
              {!loading && pending.materials.length === 0 && (
                <div className="text-center py-10 text-white/20">
                  <Check className="w-10 h-10 mx-auto mb-2" />
                  <p>All materials moderated!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
