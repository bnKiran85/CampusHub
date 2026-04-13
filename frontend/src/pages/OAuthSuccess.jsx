import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // We'll adapt useAuth to handle this or just manual store

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Store token
      localStorage.setItem('token', token);
      
      // 2. We need to tell AuthContext to re-fetch profile
      // For now, simple approach: reload to trigger fetchUser in AuthContext mount
      toast.success('Successfully logged in with Google! 🎉');
      
      // Small delay for UX
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } else {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071c]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" color="primary" />
        <p className="text-slate-400 animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
