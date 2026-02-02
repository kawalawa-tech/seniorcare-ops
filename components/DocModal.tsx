
import React from 'react';
import { ImportantDocument } from '../types';
import { ICONS } from '../constants';

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc?: ImportantDocument | null;
  onAdd: (doc: Omit<ImportantDocument, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ImportantDocument>) => void;
}

const DocModal: React.FC<DocModalProps> = ({ isOpen, onClose, doc, onAdd, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black brand-blue-text">{doc ? '編輯文件' : '新增重要文件'}</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Document Repository Management</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 transition-colors">×</button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          const docData = {
            title: formData.get('title') as string,
            category: formData.get('category') as any,
            description: formData.get('description') as string,
            url: formData.get('url') as string,
            updatedAt: new Date().toISOString().split('T')[0]
          };

          if (doc) {
            onUpdate(doc.id, docData);
          } else {
            onAdd(docData);
          }
          onClose();
        }} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">文件名稱</label>
              <input name="title" defaultValue={doc?.title} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#005ca8] outline-none font-bold text-slate-700" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">類別</label>
              <select name="category" defaultValue={doc?.category || '守則'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                {['守則', '通訊錄', '表格', '政策'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">連結網址 (Google Drive/PDF)</label>
              <input name="url" defaultValue={doc?.url} placeholder="https://..." required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#005ca8] outline-none font-bold text-slate-700" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">簡短描述</label>
              <textarea name="description" defaultValue={doc?.description} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none font-medium text-slate-700" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors">取消</button>
             <button type="submit" className="flex-1 py-4 brand-blue-bg text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all">
                {doc ? '儲存變更' : '新增文件'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocModal;
