import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useSettings } from '@/hooks/useSettings';

import { Download, Printer, QrCode as QrCodeIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCodePage() {
  const { settings, isLoading } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  
  const uploadUrl = `${window.location.origin}/upload`;
  const themeColor = settings?.theme_color || '#818cf8';
  const shopName = settings?.shop_name || 'Printify Shop';

  useEffect(() => {
    generateQRCode();
  }, [themeColor]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, uploadUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
      }
    } catch (err) {
      console.error('Error generating QR code', err);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${shopName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = async () => {
    try {
      const svg = await QRCode.toString(uploadUrl, {
        type: 'svg',
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${shopName.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating SVG', err);
      toast.error('Failed to download SVG');
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    if (!canvasRef.current) return;
    const qrDataUrl = canvasRef.current.toDataURL('image/png');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${shopName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              text-align: center;
              padding: 2rem;
              border: 2px dashed #ccc;
              border-radius: 1rem;
            }
            img {
              max-width: 400px;
              width: 100%;
              height: auto;
            }
            h1 {
              margin-top: 1.5rem;
              color: #111827;
              font-size: 1.5rem;
            }
            p {
              color: #4b5563;
              margin-top: 0.5rem;
            }
            @media print {
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrDataUrl}" alt="QR Code for ${shopName}" />
            <h1>${shopName}</h1>
            <p>Scan to upload files for printing</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCodeIcon className="h-6 w-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Store QR Code
        </h1>
        <p className="text-white/70 mt-1">
          Customers can scan this QR code to upload files directly to your print queue.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* QR Code Preview Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
          <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] flex flex-col items-center">
            <div className="relative">
              <canvas ref={canvasRef} className="rounded-lg max-w-full" />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              )}
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900 text-center">{shopName}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">Scan to send files</p>
            
            <div className="w-full flex items-center bg-gray-50 rounded-lg border border-gray-200 p-2 overflow-hidden group">
              <input 
                type="text" 
                readOnly 
                value={uploadUrl} 
                className="w-full bg-transparent text-xs text-gray-600 font-mono outline-none truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadUrl);
                  toast.success('Link copied to clipboard!');
                }}
                className="ml-2 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Copy link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex-1 p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Share your QR Code</h3>
            <p className="text-sm text-white/70 mb-6">
              Download and print this QR code to display it in your shop. Make sure it's placed somewhere easily visible to customers.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadPNG}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium border border-indigo-500/30 rounded-lg transition-all focus:ring-4 focus:ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            
            <button
              onClick={downloadSVG}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 rounded-lg transition-all focus:ring-4 focus:ring-white/10"
            >
              <Download className="h-4 w-4" />
              Download SVG
            </button>
            
            <button
              onClick={printQRCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 rounded-lg transition-all focus:ring-4 focus:ring-white/10"
            >
              <Printer className="h-4 w-4" />
              Print Directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
