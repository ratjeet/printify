import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Printer as PrinterIcon, CheckCircle, Trash2, AlertTriangle, FileText, Image as ImageIcon, File, X, Inbox, MoreVertical } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useRealtime } from '@/hooks/useRealtime';
import { useSettings } from '@/hooks/useSettings';
import { formatDate, formatRelativeTime, getFileExtension, isImageFile } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/utils/constants';
import type { Order, OrderStatus } from '@/types/order';

export default function Orders() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  
  // Custom toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Custom delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; orderId: string | null; orderNumber: string }>({ isOpen: false, orderId: null, orderNumber: '' });
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Use hooks (assuming they are implemented as specified)
  const { orders, isLoading, fetchOrders, updateStatus, deleteOrderFile, getDownloadUrl } = useOrders();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const onNewOrder = useCallback((newOrder: Order) => {
    // Play notification sound if enabled
    if (settings?.notification_enabled) {
      if (!audioRef.current) {
        audioRef.current = new window.Audio('/notification.mp3');
      }
      audioRef.current.play().catch(console.error);
    }
    
    showToast(`New order received: ${newOrder.order_number}`, 'success');
  }, [settings?.notification_enabled, showToast]);

  // Realtime
  useRealtime(onNewOrder, undefined, undefined, settings?.notification_enabled);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateStatus(id, newStatus);
      showToast(`Order marked as ${newStatus}`);
      setOpenDropdown(null);
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteConfirm.orderId) return;
    try {
      const orderToDelete = orders.find(o => o.id === deleteConfirm.orderId);
      if (orderToDelete) {
        await deleteOrderFile(deleteConfirm.orderId, orderToDelete.file_path);
        showToast('File deleted successfully');
      }
      setDeleteConfirm({ isOpen: false, orderId: null, orderNumber: '' });
      setOpenDropdown(null);
    } catch (error) {
      showToast('Failed to delete file', 'error');
    }
  };

  const handleDownload = async (order: Order) => {
    try {
      const url = await getDownloadUrl(order.file_path);
      if (url) {
        window.open(url, '_blank');
      }
      setOpenDropdown(null);
    } catch (error) {
      showToast('Failed to download file', 'error');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      case 'printing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
      case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getFileIcon = (fileName: string) => {
    if (isImageFile(fileName)) return <ImageIcon className="w-4 h-4 text-indigo-400" />;
    const ext = getFileExtension(fileName);
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-400" />;
    return <File className="w-4 h-4 text-white/50" />;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = String(order.order_number).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl backdrop-blur-xl border shadow-lg flex items-center gap-3 transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete File</h3>
                <p className="text-sm text-white/50 mt-2">
                  Are you sure you want to delete the file for order <span className="font-medium text-white">{deleteConfirm.orderNumber}</span>? The order record will remain, but the file will be removed from storage.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, orderId: null, orderNumber: '' })}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFile}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-400 transition-colors"
                >
                  Delete File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Orders
          </h1>
          <p className="text-sm text-white/50 mt-1">Manage and track your print shop orders</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-xl"
            />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex p-1 space-x-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl min-w-max">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              statusFilter === 'ALL'
                ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                statusFilter === status.value
                  ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          // Loading Skeleton
          <div className="p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                  <div className="h-4 bg-white/10 rounded flex-1"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                  <div className="h-6 bg-white/10 rounded-full w-20"></div>
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white">No orders found</h3>
            <p className="text-sm text-white/50 mt-1 max-w-sm">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your filters or search term to find what you are looking for.'
                : 'When new orders are placed, they will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 text-white/50 border-b border-white/10 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">File</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white tracking-wider font-mono">{order.order_number}</span>
                          <span className="text-xs text-white/60 flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                            {order.customer_name || 'Guest'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/5 border border-white/10 rounded-md">
                            {getFileIcon(order.file_name)}
                          </div>
                          <span className="truncate max-w-[150px] text-white/80" title={order.file_name}>
                            {order.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white/80">{order.copies}x</span>
                            <span className="text-white/20">|</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              order.color_mode === 'color' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/10 text-white/70 border-white/20'
                            }`}>
                              {order.color_mode === 'color' ? 'Color' : 'B&W'}
                            </span>
                          </div>
                          <span className="text-white/50">{order.paper_size} • {order.print_side}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(order.status)}`}>
                          {order.status === 'pending' ? 'Pending' : order.status === 'printing' ? 'Printing' : 'Done'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        <div className="flex flex-col">
                          <span>{formatDate(order.created_at)}</span>
                          <span className="text-xs text-white/40">{formatRelativeTime(order.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === order.id ? null : order.id);
                          }}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors inline-flex"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdown === order.id && (
                          <div className="absolute right-8 top-10 w-48 bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 py-1 animate-in fade-in zoom-in-95"
                               onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                              className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-white/40" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                if (order.file_path === 'deleted') return;
                                handleDownload(order);
                              }}
                              disabled={order.file_path === 'deleted'}
                              className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="w-4 h-4 text-white/40" /> Download File
                            </button>
                            
                            {(order.status === 'pending' || order.status === 'printing') && (
                              <div className="h-px bg-white/10 my-1 mx-2"></div>
                            )}
                            
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'printing')}
                                className="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 transition-colors"
                              >
                                <PrinterIcon className="w-4 h-4 text-indigo-400" /> Mark as Printing
                              </button>
                            )}
                            {order.status === 'printing' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'done')}
                                className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-400" /> Mark as Done
                              </button>
                            )}
                            
                            <div className="h-px bg-white/10 my-1 mx-2"></div>
                            
                            <button
                              onClick={() => {
                                if (order.file_path === 'deleted') return;
                                setOpenDropdown(null);
                                setDeleteConfirm({ isOpen: true, orderId: order.id, orderNumber: order.order_number });
                              }}
                              disabled={order.file_path === 'deleted'}
                              className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" /> {order.file_path === 'deleted' ? 'File Deleted' : 'Delete File'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-white tracking-wider font-mono">{order.order_number}</span>
                      <span className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                        {order.customer_name || 'Guest'}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(order.status)}`}>
                      {order.status === 'pending' ? 'Pending' : order.status === 'printing' ? 'Printing' : 'Done'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/80 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                    {getFileIcon(order.file_name)}
                    <span className="truncate flex-1 font-medium">{order.file_name}</span>
                    <button 
                      onClick={() => handleDownload(order)}
                      disabled={order.file_path === 'deleted'}
                      className="p-1.5 text-white/50 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/50"
                      title={order.file_path === 'deleted' ? 'File Deleted' : 'Download File'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white/90">{order.copies}x</span>
                      <span className="text-white/20">•</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider border ${order.color_mode === 'color' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-white/70 bg-white/10 border-white/20'}`}>
                        {order.color_mode === 'color' ? 'COLOR' : 'B&W'}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/50">{order.paper_size}</span>
                    </div>
                    <span className="text-xs text-white/40">{formatRelativeTime(order.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="flex-1 py-2 text-xs font-medium text-white/80 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex justify-center items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'printing')}
                        className="flex-1 py-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 flex justify-center items-center gap-1.5 transition-colors"
                      >
                        <PrinterIcon className="w-3.5 h-3.5" /> Print
                      </button>
                    )}
                    {order.status === 'printing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'done')}
                        className="flex-1 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 flex justify-center items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </button>
                    )}
                    
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, orderId: order.id, orderNumber: order.order_number })}
                      disabled={order.file_path === 'deleted'}
                      className="p-2 text-white/40 border border-white/10 rounded-xl hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-white/40 disabled:hover:bg-transparent"
                      title={order.file_path === 'deleted' ? 'File Deleted' : 'Delete File'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
