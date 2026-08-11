import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { IdCard, Lock, Eye, EyeOff, Copy, LogOut, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { session, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const printifyId = session?.printifyId || 'PRNT-12345-XYZ'; // Fallback if not available

  const handleCopyId = () => {
    navigator.clipboard.writeText(printifyId);
    setCopied(true);
    toast.success('Printify ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      const success = await changePassword(passwords.current, passwords.new);
      if (success) {
        toast.success('Password updated successfully');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error('Failed to update password. Please check your current password.');
      }
    } catch (error) {
      toast.error('Failed to update password. Please check your current password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto w-full space-y-8 text-white">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-white/60 mt-1">
          Manage your account settings and security preferences.
        </p>
      </div>

      {/* Account Info Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <IdCard className="h-5 w-5 text-indigo-400" />
            Account Information
          </h2>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Printify ID
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/90 font-mono font-medium tracking-wide">
                {printifyId}
              </div>
              <button
                onClick={handleCopyId}
                className="p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                title="Copy ID"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-white/50 mt-2 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
              This is your unique store identifier.
            </p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            Security
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10 placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 focus:outline-none"
                >
                  {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10 placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 focus:outline-none"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10 placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 focus:outline-none"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Password must be at least 8 characters long and contain a mix of characters.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-medium rounded-xl transition-all focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Save Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 backdrop-blur-xl rounded-2xl shadow-sm border border-red-500/20 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-red-300/80 mb-4">
            Logging out will end your current session. You will need your credentials to log back in.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] font-medium rounded-xl transition-all focus:ring-4 focus:ring-red-500/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
