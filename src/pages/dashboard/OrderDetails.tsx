import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer as PrinterIcon, CheckCircle, Trash2, FileText, Image, File, Clock, Copy, Palette, Maximize, BookOpen, StickyNote, DollarSign, AlertTriangle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import * as ordersService from '@/services/orders.service';
import { useSettings } from '@/hooks/useSettings';
import { formatDate, formatFileSize, formatPrice, getFileExtension, isImageFile, isPdfFile } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/utils/constants';
import type { Order } from '@/types/order';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersService.getOrderById(id);
        if (!data) throw new Error('Order not found');
        setOrder(data);
        
        if (data.file_path) {
          const url = await ordersService.getFileDownloadUrl(data.file_path);
          setSignedUrl(url);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    try {
      setIsUpdating(true);
      await ordersService.updateOrderStatus(order.id, newStatus as any);
      
      if (newStatus === 'done' && settings?.auto_delete_hours) {
        toast.info(`Order will be auto-deleted in ${settings.auto_delete_hours} hours`);
      }
      
      setOrder({ ...order, status: newStatus as any });
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!order) return;
    
    try {
      setIsDeleting(true);
      await ordersService.deleteOrderFile(order.id, order.file_path);
      toast.success('File deleted from storage');
      setOrder({ ...order, file_path: 'deleted', file_size: 0 });
      setSignedUrl(null);
    } catch (err) {
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDownload = () => {
    if (signedUrl && order?.file_path !== 'deleted') {
      window.open(signedUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[600px] bg-white/5 border border-white/10 rounded-2xl"></div>
          <div className="space-y-6">
            <div className="h-64 bg-white/5 border border-white/10 rounded-2xl"></div>
            <div className="h-32 bg-white/5 border border-white/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center mt-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-white/50 mb-6">{error || "The order you're looking for doesn't exist or has been deleted."}</p>
        <button 
          onClick={() => navigate('/orders')}
          className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors backdrop-blur-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </button>
      </div>
    );
  }

  const isImage = isImageFile(order.file_name);
  const isPdf = isPdfFile(order.file_name);
  const ext = getFileExtension(order.file_name);
  const statusConfig = ORDER_STATUSES.find(s => s.value === order.status) || ORDER_STATUSES[0];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      case 'printing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
      case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white font-mono tracking-wider">
                {order.order_number}
              </h1>
              <span className="text-sm text-white/60 flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                {order.customer_name || 'Guest Customer'}
              </span>
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border self-start mt-1 ${getStatusBadgeColor(order.status)}`}>
              {statusConfig?.label || order.status}
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          <Clock className="w-4 h-4 mr-1.5" />
          {formatDate(order.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center space-x-3 truncate">
                {isImage ? <Image className="w-5 h-5 text-indigo-400 flex-shrink-0" /> : 
                 isPdf ? <FileText className="w-5 h-5 text-rose-400 flex-shrink-0" /> : 
                 <File className="w-5 h-5 text-white/50 flex-shrink-0" />}
                <span className="font-medium text-white truncate" title={order.file_name}>
                  {order.file_name}
                </span>
              </div>
              <span className="text-sm text-white/50 whitespace-nowrap ml-4 font-medium">
                {formatFileSize(order.file_size)}
              </span>
            </div>
            
            <div className="bg-black/20 min-h-[400px] flex items-center justify-center p-4 relative flex-1">
              {order.file_path === 'deleted' ? (
                <div className="flex flex-col items-center text-white/50 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white/70 text-lg">File Deleted</p>
                    <p className="text-sm mt-1">No preview available. This file was removed to free up storage space.</p>
                  </div>
                </div>
              ) : signedUrl ? (
                isImage ? (
                  <img src={signedUrl} alt="Preview" className="max-w-full max-h-[600px] object-contain shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-lg border border-white/10" />
                ) : isPdf ? (
                  <iframe src={`${signedUrl}#toolbar=0`} className="w-full h-[600px] bg-white/90 rounded-lg shadow-sm border border-white/10" title="PDF Preview" />
                ) : (
                  <div className="flex flex-col items-center text-white/50 space-y-4">
                    <File className="w-16 h-16 text-white/20" />
                    <div className="text-center">
                      <p className="font-medium text-white/70">No preview available</p>
                      <p className="text-sm">Download the .{ext} file to view it</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center text-white/50 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p>Loading preview...</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Notes Section */}
          {order.notes && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-sm">
              <h3 className="flex items-center text-sm font-medium text-white mb-3">
                <StickyNote className="w-4 h-4 mr-2 text-white/50" />
                Customer Notes
              </h3>
              <p className="text-white/70 text-sm whitespace-pre-wrap bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6">
          {/* Print Options */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Print Options</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center text-white/50">
                  <Copy className="w-4 h-4 mr-2" />
                  <span className="text-sm">Copies</span>
                </div>
                <span className="font-medium text-white">{order.copies}</span>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center text-white/50">
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="text-sm">Color Mode</span>
                </div>
                <span className="font-medium text-white capitalize">{order.color_mode}</span>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center text-white/50">
                  <Maximize className="w-4 h-4 mr-2" />
                  <span className="text-sm">Paper Size</span>
                </div>
                <span className="font-medium text-white">{order.paper_size}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white/50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">Print Side</span>
                </div>
                <span className="font-medium text-white capitalize">{order.print_side.replace('-', ' ')}</span>
              </div>
            </div>

            {settings?.pricing_enabled && order.estimated_price !== undefined && (
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col space-y-1">
                <span className="text-sm text-white/50">Estimated Price</span>
                <span className="text-2xl font-bold text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-1 text-indigo-400" />
                  {formatPrice(order.estimated_price || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-medium text-white mb-3">Actions</h3>
            
            <button 
              onClick={handleDownload}
              disabled={!signedUrl}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </button>
            
            {order.status === 'pending' && (
              <button 
                onClick={() => handleStatusChange('printing')}
                disabled={isUpdating}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 text-sm font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PrinterIcon className="w-4 h-4 mr-2" />}
                Mark as Printing
              </button>
            )}
            
            {order.status === 'printing' && (
              <button 
                onClick={() => handleStatusChange('done')}
                disabled={isUpdating}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-400 text-sm font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Mark as Done
              </button>
            )}
            
            <div className="pt-4 mt-2 border-t border-white/10">
              <button 
                onClick={() => setShowDeleteModal(true)}
                disabled={order.file_path === 'deleted'}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-xl transition-colors shadow-[0_0_10px_rgba(244,63,94,0.1)]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {order.file_path === 'deleted' ? 'File Deleted' : 'Free Storage (Delete File)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Delete File</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-white/50 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-center text-white/80 mb-2">
                Are you sure you want to delete the file for order #{order.order_number}?
              </p>
              <p className="text-center text-sm text-white/50">
                This action cannot be undone. The order record will remain, but the physical file will be removed to free up storage space.
              </p>
            </div>
            <div className="flex items-center justify-end p-4 gap-3 bg-white/5 border-t border-white/10">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteFile}
                disabled={isDeleting}
                className="flex items-center justify-center px-4 py-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
