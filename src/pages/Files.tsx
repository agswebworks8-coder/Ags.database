import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import { Upload, FileText, Image, Film, File, Trash2, Download } from 'lucide-react';

export default function Files() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [files, setFiles] = useState(store.getFiles());

  const handleUpload = () => {
    const name = prompt('File name (e.g., client-logo.png):');
    if (!name) return;
    store.addFile({ name, type: name.split('.').pop() || 'file', size: Math.floor(Math.random() * 5000), url: '#' });
    setFiles(store.getFiles());
  };

  const getFileIcon = (type: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type)) return <Image size={20} className="text-purple-500" />;
    if (['mp4', 'mov', 'avi'].includes(type)) return <Film size={20} className="text-blue-500" />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(type)) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const cardClass = `rounded-xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Files & Documents</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{files.length} files uploaded</p>
        </div>
        <button onClick={handleUpload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Upload size={16} /> Upload File
        </button>
      </div>

      {files.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <File size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No files uploaded yet</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Upload client logos, documents, screenshots, and more</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => {
            const client = file.clientId ? store.getClient(file.clientId) : null;
            return (
              <div key={file.id} className={`${cardClass} flex items-center gap-3`}>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {client?.businessName || 'General'} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className={`p-1.5 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                    <Download size={14} className="text-blue-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
