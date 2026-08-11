import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Fingerprint, Lock, ChevronRight, Loader2, ScanFace } from 'lucide-react';

export default function Login() {
  const [printifyId, setPrintifyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [step, setStep] = useState(1); // 1 for ID, 2 for Password

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printifyId) {
      triggerShake();
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ printifyId, password });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setStep(1);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative selection:bg-white/20 text-white font-sans">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes orb1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, -10vh) scale(1.2); }
          66% { transform: translate(-10vw, 10vh) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes orb2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-10vw, 10vh) scale(1.1); }
          66% { transform: translate(10vw, -10vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-orb1 { animation: orb1 20s ease-in-out infinite; }
        .animate-orb2 { animation: orb2 25s ease-in-out infinite reverse; }
        .glass-pill {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Cinematic Animated Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-orb1 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-fuchsia-600/20 rounded-full blur-[100px] mix-blend-screen animate-orb2 pointer-events-none" />

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-sm px-6 transition-all duration-500 ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* Spatial Avatar / Icon */}
        <div className="w-24 h-24 rounded-full glass-pill flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {step === 1 ? (
            <ScanFace className="w-10 h-10 text-white/80" strokeWidth={1.5} />
          ) : (
            <Lock className="w-10 h-10 text-white/80" strokeWidth={1.5} />
          )}
        </div>

        <h1 className="text-2xl font-medium tracking-tight mb-2 text-white/90">
          {step === 1 ? 'Enter Printify ID' : 'Enter Password'}
        </h1>
        <p className="text-sm text-white/40 mb-10 text-center">
          {step === 1 ? 'Secure shop owner terminal' : `Authenticating as ${printifyId}`}
        </p>

        {error && (
          <div className="w-full text-center text-red-400 text-sm mb-6 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Spatial Input Pill */}
        <form 
          onSubmit={step === 1 ? handleNext : handleSubmit} 
          className="w-full relative group"
        >
          <div className="glass-pill rounded-[2rem] p-2 flex items-center shadow-2xl shadow-black/50 transition-all duration-300 focus-within:bg-white/5 focus-within:border-white/20">
            
            <input
              type={step === 1 ? "text" : "password"}
              value={step === 1 ? printifyId : password}
              onChange={(e) => step === 1 ? setPrintifyId(e.target.value) : setPassword(e.target.value)}
              placeholder={step === 1 ? "ID..." : "Password..."}
              autoFocus
              disabled={isLoading}
              style={{ boxShadow: 'none' }}
              className="flex-1 bg-transparent border-transparent focus:border-transparent focus:ring-0 focus:ring-offset-0 !outline-none !ring-0 !shadow-none text-white px-6 py-3 placeholder:text-white/30 text-lg font-medium w-full"
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : step === 1 ? (
                <ChevronRight className="w-6 h-6" />
              ) : (
                <Fingerprint className="w-6 h-6" />
              )}
            </button>
          </div>
        </form>
        
        {step === 2 && (
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="mt-8 text-sm text-white/40 hover:text-white/80 transition-colors"
          >
            Change ID
          </button>
        )}
      </div>

      {/* OS Status Bar at bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center text-[10px] tracking-[0.2em] text-white/30 uppercase font-mono">
        <span className="flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          Network Secured
        </span>
      </div>
    </div>
  );
}
