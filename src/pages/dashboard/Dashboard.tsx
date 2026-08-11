import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, HardDrive, ArrowRight, FileText, Activity } from 'lucide-react';
import { useOrderStats, useOrders } from '@/hooks/useOrders';
import { useStorage } from '@/hooks/useStorage';
import { formatRelativeTime, formatFileSize, formatStoragePercentage } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/utils/constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats: orderStats, isLoading: isStatsLoading } = useOrderStats();
  const { orders, isLoading: isOrdersLoading } = useOrders();
  const { stats: storageStats, isLoading: isStorageLoading } = useStorage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white">
      
      {/* Top Section - Welcome & Live Radar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Command Center</h1>
          <div className="flex items-center gap-3">
            <p className="text-white/50 text-sm font-mono uppercase tracking-widest">Global Overview</p>
          </div>
        </div>
        
        {/* Live Radar Widget */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
          </div>
          <span className="text-xs font-mono text-emerald-400">LISTENING FOR SCANS...</span>
        </div>
      </div>

      {/* Glassmorphism Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 group hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between z-10 relative mb-4">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-white/40">TODAY</span>
          </div>
          <div className="z-10 relative">
            {isStatsLoading ? (
              <div className="h-10 w-16 bg-white/10 animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-4xl font-bold text-white tracking-tighter">{orderStats?.todayOrders || 0}</h3>
            )}
            <p className="text-indigo-400/80 text-sm mt-1">Total documents processed</p>
          </div>
          {/* Decorative glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
        </div>

        {/* Pending Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 group hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between z-10 relative mb-4">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-white/40">QUEUE</span>
          </div>
          <div className="z-10 relative">
            {isStatsLoading ? (
              <div className="h-10 w-16 bg-white/10 animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-4xl font-bold text-white tracking-tighter">{orderStats?.pendingOrders || 0}</h3>
            )}
            <p className="text-amber-400/80 text-sm mt-1">Awaiting print action</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/30 transition-colors" />
        </div>

        {/* Completed Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 group hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between z-10 relative mb-4">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-white/40">DONE</span>
          </div>
          <div className="z-10 relative">
            {isStatsLoading ? (
              <div className="h-10 w-16 bg-white/10 animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-4xl font-bold text-white tracking-tighter">{orderStats?.completedOrders || 0}</h3>
            )}
            <p className="text-emerald-400/80 text-sm mt-1">Successfully fulfilled</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/30 transition-colors" />
        </div>

        {/* Storage Used */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 group hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between z-10 relative mb-4">
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono text-white/40">STORAGE</span>
          </div>
          <div className="z-10 relative">
            {isStorageLoading ? (
              <div className="h-10 w-24 bg-white/10 animate-pulse rounded mt-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-white tracking-tighter">{formatStoragePercentage(storageStats?.totalSize, storageStats?.maxStorage)}%</h3>
              </div>
            )}
            {!isStorageLoading && (
              <p className="text-purple-400/80 text-sm mt-1 font-mono">{formatFileSize(storageStats?.totalSize)} / {formatFileSize(storageStats?.maxStorage)}</p>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/30 transition-colors" />
        </div>
      </div>

      {/* Live Order Feed */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Live Data Stream</h2>
          </div>
          <button 
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
          >
            Expand View
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </button>
        </div>

        <div className="p-0">
          {isOrdersLoading ? (
            <div className="divide-y divide-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white/5 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] mb-6">
                <Activity className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No incoming packets</h3>
              <p className="text-white/40 max-w-sm mx-auto">When customers transmit files via QR portal, they will appear in this stream instantly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 text-white/40 font-mono text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-medium">Packet ID</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium">State</th>
                    <th className="px-6 py-4 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders?.slice(0, 5).map((order: any) => {
                    const statusConfig = ORDER_STATUSES.find(s => s.value === order.status) || { 
                      value: order.status,
                      label: order.status, 
                      color: 'bg-white/10 text-white border-white/20' 
                    };
                    
                    // Convert original colors to dark theme glowing variants
                    let badgeStyles = statusConfig.color;
                    if (statusConfig.color.includes('amber') || statusConfig.color.includes('yellow')) {
                      badgeStyles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
                    } else if (statusConfig.color.includes('emerald') || statusConfig.color.includes('green')) {
                      badgeStyles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
                    } else if (statusConfig.color.includes('blue')) {
                      badgeStyles = 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
                    }
                    
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                        className="hover:bg-white/5 cursor-pointer transition-all duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl mr-4 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                              <FileText className="w-5 h-5 text-white/70 group-hover:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-bold text-white tracking-tight flex items-center gap-2">
                                #{order.order_number}
                              </p>
                              <p className="text-white/50 text-xs mt-1 truncate max-w-[200px]">{order.file_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-white/70 font-mono text-xs">SYS_GUEST</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest ${badgeStyles}`}>
                            {statusConfig.value === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-2" />}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-xs text-white/40">
                          {formatRelativeTime(order.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
