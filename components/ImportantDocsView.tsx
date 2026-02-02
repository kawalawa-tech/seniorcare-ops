
import React, { useState } from 'react';
import { ImportantDocument } from '../types';
import { ICONS } from '../constants';
import DocModal from './DocModal';

interface ImportantDocsViewProps {
  docs: ImportantDocument[];
  onAddDoc: (doc: Omit<ImportantDocument, 'id'>) => void;
  onUpdateDoc: (id: string, updates: Partial<ImportantDocument>) => void;
  onDeleteDoc: (id: string) => void;
}

const ImportantDocsView: React.FC<ImportantDocsViewProps> = ({ docs, onAddDoc, onUpdateDoc, onDeleteDoc }) => {
  const [filter, setFilter] = useState('全部');
  const [modalState, setModalState] = useState<{ isOpen: boolean; doc?: ImportantDocument | null }>({ isOpen: false });

  const categories = ['全部', '守則', '通訊錄', '表格', '政策'];
  const filteredDocs = filter === '全部' ? docs : docs.filter(d => d.category === filter);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold brand-blue-text tracking-tight">重要文件庫</h2>
          <p className="text-slate-500 font-medium">營運必備指引、標準表格及緊急聯絡人</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[1.25rem] shadow-inner border border-slate-200/50">
            {categories.map(c => (
              <button 
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${filter === c ? 'bg-white shadow-md text-[#005ca8]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button 
            type="button"
            onClick={() => setModalState({ isOpen: true, doc: null })}
            className="flex items-center gap-2 px-6 py-3 brand-green-bg text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95"
          >
            <ICONS.Plus className="w-5 h-5 pointer-events-none" />
            <span>新增文件</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-[#f0f7e8] transition-colors shadow-inner border border-slate-100 group-hover:border-[#88bc4c]/30">
                <ICONS.Docs className="w-8 h-8 text-slate-300 group-hover:brand-green-text transition-colors pointer-events-none" />
              </div>
              <div className="flex flex-col items-end gap-2 relative z-20">
                <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-widest">{doc.category}</span>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setModalState({ isOpen: true, doc });
                    }}
                    className="p-2 bg-slate-50 text-slate-400 hover:brand-blue-text transition-colors rounded-lg flex items-center justify-center"
                    title="編輯"
                  >
                    <ICONS.Edit className="w-4 h-4 pointer-events-none" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteDoc(doc.id);
                    }}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center justify-center"
                    title="刪除"
                  >
                    <ICONS.Trash className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="font-black text-slate-800 mb-3 text-lg group-hover:brand-blue-text transition-colors">{doc.title}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3">{doc.description}</p>
            
            <div className="mt-auto">
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">更新: {doc.updatedAt}</span>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 brand-blue-bg text-white px-5 py-2.5 rounded-2xl text-xs font-black hover:opacity-90 shadow-lg shadow-blue-200 transition-all active:scale-95"
                  >
                    <ICONS.External className="w-3.5 h-3.5 pointer-events-none" />
                    立即查看
                  </a>
                </div>
            </div>
          </div>
        ))}
      </div>

      <DocModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        doc={modalState.doc}
        onAdd={onAddDoc}
        onUpdate={onUpdateDoc}
      />
    </div>
  );
};

export default ImportantDocsView;
