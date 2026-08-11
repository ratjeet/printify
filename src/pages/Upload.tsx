import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Image as ImageIcon, File as FileIcon, Loader2, X, Plus, Minus, Info, User } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { uploadFile, calculateEstimatedPrice } from '@/services/upload.service';
import { createOrder } from '@/services/orders.service';
import { validateFile, validateCopies, sanitizeInput } from '@/utils/validators';
import { formatFileSize, formatPrice, getFileExtension } from '@/utils/formatters';
import { PAPER_SIZES } from '@/utils/constants';
import type { ColorMode, PrintSide, PaperSize } from '@/types/order';

export default function Upload() {
  const navigate = useNavigate();
  
  // Shop Info State
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [isShopLoading, setIsShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Print Options
  const [customerName, setCustomerName] = useState('');
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [printSide, setPrintSide] = useState<PrintSide>('single');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accepted file types
  const acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
  const acceptedTypesLabel = 'PDF, DOC, DOCX, JPG, JPEG, PNG';

  useEffect(() => {
    async function fetchShopInfo() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Settings not found');
        
        setShopInfo(data);
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setShopError(err.message || 'Failed to load shop details');
      } finally {
        setIsShopLoading(false);
      }
    }
    
    fetchShopInfo();
  }, []);

  useEffect(() => {
    if (shopInfo?.pricing_enabled && file) {
      const calcPrice = async () => {
        try {
          const price = await calculateEstimatedPrice(
            copies,
            colorMode,
            printSide,
            shopInfo.bw_price || 0,
            shopInfo.color_price || 0
          );
          setEstimatedPrice(price);
        } catch (err) {
          console.error('Failed to calculate price', err);
        }
      };
      calcPrice();
    } else {
      setEstimatedPrice(null);
    }
  }, [file, copies, colorMode, paperSize, printSide, shopInfo]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    
    // Global limit of 50MB
    const maxMB = 50;
    if (selectedFile.size > maxMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxMB}MB limit for this print shop.`);
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid && !selectedFile.size) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!file) {
      setError('Please select a file to print');
      return;
    }

    if (!validateCopies(copies).valid) {
      setError('Invalid number of copies');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload File
      const uploadedFile = await uploadFile(file);
      
      // 2. Create Order
      const order = await createOrder({
        customer_name: sanitizeInput(customerName),
        file_name: file.name,
        file_path: uploadedFile.path,
        file_size: file.size,
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        print_side: printSide,
        notes: sanitizeInput(notes),
        estimated_price: estimatedPrice || undefined,
      });
      
      navigate(`/upload/success/${order.order_number}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = getFileExtension(fileName).toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <ImageIcon className="w-8 h-8 text-indigo-400" />;
    if (['pdf'].includes(ext)) return <FileText className="w-8 h-8 text-red-400" />;
    if (['doc', 'docx'].includes(ext)) return <FileText className="w-8 h-8 text-blue-400" />;
    return <FileIcon className="w-8 h-8 text-white/50" />;
  };

  if (isShopLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-white/50 font-mono text-sm mt-4 tracking-widest uppercase">Initializing Portal...</p>
      </div>
    );
  }

  if (shopError || !shopInfo) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Portal Unavailable</h1>
        <p className="text-white/60 font-medium max-w-md">{shopError || 'The requested print shop could not be found or is currently inactive.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans relative flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500/30">
      {/* Background ambient light */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Header Info */}
      <div className="w-full max-w-2xl mb-8 text-center space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-xl mb-2">
          {shopInfo.logo_url ? (
            <img src={shopInfo.logo_url} alt="Shop Logo" className="h-16 w-auto rounded-xl object-contain bg-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <UploadIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {shopInfo.shop_name || 'Print Shop Terminal'}
        </h1>
        <p className="text-white/60 text-sm max-w-sm mx-auto">
          {shopInfo.welcome_message 
            ? shopInfo.welcome_message 
            : 'Securely transfer documents to the print queue.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          
          {/* Customer Name Input (Always visible) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/70 mb-2">Your Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
                  : 'border-white/10 bg-white/5 hover:border-indigo-400/50 hover:bg-white/10'
                }
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept={acceptedTypes.join(',')}
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`p-5 rounded-2xl transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-indigo-400' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                  <UploadIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white tracking-wide">
                    Tap to select or drop a file
                  </p>
                  <p className="text-xs text-white/40 mt-2 font-mono">
                    {acceptedTypesLabel} • MAX 50MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Selected File Card */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-center p-3 rounded-xl bg-black/40 border border-white/5">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-semibold text-white truncate tracking-wide">
                    {file.name}
                  </p>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="relative z-10 p-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Copies */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">
                      Copies
                    </label>
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden p-1">
                      <button
                        type="button"
                        onClick={() => setCopies(Math.max(1, copies - 1))}
                        className="p-3 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={copies}
                        onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                        className="w-full p-2 text-center bg-transparent text-white font-mono text-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCopies(Math.min(999, copies + 1))}
                        className="p-3 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Paper Size */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">
                      Paper Format
                    </label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                      className="w-full p-3.5 border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium cursor-pointer"
                    >
                      {PAPER_SIZES.map(item => (
                        <option key={item.value} value={item.value} className="bg-gray-900">{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Mode (Toggles) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/70">
                    Color Mode
                  </label>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setColorMode('bw')}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                        colorMode === 'bw' 
                          ? 'bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10' 
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Black & White
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode('color')}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                        colorMode === 'color' 
                          ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-indigo-500/30' 
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Color
                    </button>
                  </div>
                </div>

                {/* Print Side (Toggles) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/70">
                    Print Layout
                  </label>
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setPrintSide('single')}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                        printSide === 'single' 
                          ? 'bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10' 
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Single Sided
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintSide('double')}
                      className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                        printSide === 'double' 
                          ? 'bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10' 
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Double Sided
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/70">
                    Special Instructions
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes for the shop..."
                    rows={2}
                    className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-white/20"
                  />
                </div>
                
                {/* Price Estimation */}
                {shopInfo?.pricing_enabled && estimatedPrice !== null && (
                  <div className="bg-indigo-500/10 rounded-2xl p-5 flex items-center justify-between border border-indigo-500/20 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-indigo-500/10 blur-[50px] pointer-events-none" />
                    <span className="text-indigo-200/70 font-medium tracking-wide">Estimated Total</span>
                    <span className="text-2xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatPrice(estimatedPrice)}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold tracking-wide rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0b] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading & Queueing...
                    </>
                  ) : (
                    'Transmit to Terminal'
                  )}
                </button>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
