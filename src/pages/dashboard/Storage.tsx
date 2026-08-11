import { useEffect } from 'react';
import { HardDrive, FileText, Image as ImageIcon, File as FileIcon, Inbox } from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import type { StorageFile } from '@/services/storage.service';
import { formatFileSize, formatDate, formatStoragePercentage, getFileExtension, isImageFile } from '@/utils/formatters';

export default function StoragePage() {
  const { stats, isLoading, refreshStats } = useStorage();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const percentage = formatStoragePercentage(stats?.totalSize || 0, stats?.maxStorage || 1);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          Storage Management
        </h1>
        <p className="text-white/70 mt-1">
          Monitor your storage usage and view recently uploaded files.
        </p>
      </div>

      {/* Storage Overview Card */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Storage Overview</h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between items-end">
              <div className="h-8 bg-white/10 rounded w-32"></div>
              <div className="h-4 bg-white/10 rounded w-24"></div>
            </div>
            <div className="h-4 bg-white/10 rounded-full w-full"></div>
            <div className="h-4 bg-white/10 rounded w-48"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatFileSize(stats?.totalSize || 0)}
                </div>
                <div className="text-sm text-white/70 mt-1">
                  used of {formatFileSize(stats?.maxStorage || 0)}
                </div>
              </div>
              <div className="text-lg font-medium text-white">
                {percentage}%
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <div 
                className="bg-indigo-500 h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>

            <p className="text-sm text-white/70">
              {stats?.totalFiles || 0} total files stored
            </p>
          </div>
        )}
      </div>

      {/* Recent Uploads List */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent Uploads</h2>
        </div>
        
        {isLoading ? (
          <div className="divide-y divide-white/10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 bg-white/10 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : !stats?.recentFiles?.length ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <h3 className="text-lg font-medium text-white">No files found</h3>
            <p className="text-white/70 mt-1 max-w-sm">
              You haven't uploaded any files yet. Files sent by customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-6 py-3 font-medium">File Name</th>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium">Uploaded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats?.recentFiles?.map((file: StorageFile) => (
                  <tr key={file.path} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                          {isImageFile(file.name) ? (
                            <ImageIcon className="h-5 w-5" />
                          ) : getFileExtension(file.name) === 'pdf' ? (
                            <FileText className="h-5 w-5" />
                          ) : (
                            <FileIcon className="h-5 w-5" />
                          )}
                        </div>
                        <span className="font-medium text-white truncate max-w-[200px] sm:max-w-sm">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {formatDate(file.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
