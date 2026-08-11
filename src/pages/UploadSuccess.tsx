import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Printer, Copy, Check, Store, Clock, Sparkles } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface LocationState {
  shopName?: string;
  submittedAt?: string;
  fileName?: string;
  copies?: number;
  totalPrice?: number;
  colorMode?: string;
  paperSize?: string;
}

export default function UploadSuccess() {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;

  const [copied, setCopied] = useState(false);
  const [submissionDate] = useState<string>(() => {
    return state?.submittedAt || new Date().toISOString();
  });

  const displayOrderNumber = orderNumber ? orderNumber.toUpperCase() : 'PRT-1001';
  const shopName = state?.shopName || 'Print Shop Terminal';
  const formattedDate = formatDate(submissionDate);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(displayOrderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitAnother = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background ambient light */}
      <div className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes draw-check {
          0% {
            stroke-dashoffset: 100;
            transform: scale(0.5) rotate(-15deg);
            opacity: 0;
          }
          60% {
            stroke-dashoffset: 0;
            transform: scale(1.15) rotate(5deg);
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-draw-check {
          animation: draw-check 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10 text-white relative">
          
          {/* Header & Animated Checkmark Section */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-draw-check">
                <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 stroke-[2.5]" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transmission Successful</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Order Confirmed
            </h1>
          </div>

          <div className="space-y-6 mt-8 animate-in fade-in duration-700 delay-300 fill-mode-both">
            {/* Order Number Highlighted Badge */}
            <div className="relative group bg-black/40 border border-white/10 rounded-2xl p-6 text-center transition-all hover:border-indigo-500/30 hover:bg-white/5">
              <span className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                Tracking ID
              </span>
              <div className="flex items-center justify-center gap-4">
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-widest font-mono">
                  {displayOrderNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-2.5 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-medium px-4 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  Copied to clipboard
                </span>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4 text-sm backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-white/50 font-medium">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>Terminal</span>
                </div>
                <span className="font-semibold text-white/90">
                  {shopName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-white/50 font-medium">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Timestamp</span>
                </div>
                <span className="font-semibold text-white/90 font-mono text-xs">
                  {formattedDate}
                </span>
              </div>

              {state?.fileName && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/50 font-medium">
                    <Printer className="w-4 h-4 text-indigo-400" />
                    <span>Payload</span>
                  </div>
                  <span className="font-semibold text-white/90 truncate max-w-[200px]">
                    {state.fileName} <span className="text-white/40 font-mono ml-1">x{state.copies || 1}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Main Instruction Callout */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-indigo-200 text-sm font-medium flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-indigo-500/20 blur-[30px] pointer-events-none" />
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl shrink-0 mt-0.5 relative z-10">
                <Store className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="leading-relaxed relative z-10 pt-1">
                Your files have been securely transmitted to the print queue. Please show your Tracking ID to the shop operator.
              </p>
            </div>

            {/* Navigation Actions */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmitAnother}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Terminal</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
