import React, { useState } from 'react';
import { Upload, Image, FileText, File as FileIcon } from 'lucide-react';
import { getFiles, addFile } from '../lib/store';

export default function FilesPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [files, setFiles] = useState(getFiles());
  const upload = () => { const name = prompt('File name:'); if (!name) return; addFile({ name, type: name.split('.').pop() || 'file', size: Math.floor(Math.random() * 5000), url: '#' }); setFiles(getFiles()); };
  const getIcon = (t: string) => { if (['jpg', 'png', 'gif', 'svg'].includes(t)) return <Image size={20} className="text-purple-500" />; if (['pdf', 'doc'].includes(t)) return <FileText size={20} className="text-red-500" />; return <FileIcon size={20} className="text-gray-500" />; };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Files</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{files.length} files</p></div>
        <button onClick={upload} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Upload size={16} />Upload</button>
      </div>
      {files.length === 0 ? <div className={`text-center py-16 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No files</p></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(f => (
            <div key={f.id} className={`rounded-xl p-4 border flex items-center gap-3 ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-3 rounded-lg ${dk ? 'bg-slate-700' : 'bg-gray-100'}`}>{getIcon(f.type)}</div>
              <div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${dk ? 'text-white' : 'text-gray-900'}`}>{f.name}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{(f.size / 1024).toFixed(1)} KB</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
