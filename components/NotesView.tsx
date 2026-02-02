import React, { useState } from 'react';
import { OperationalNote } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface NotesViewProps {
  notes: OperationalNote[];
  setNotes: React.Dispatch<React.SetStateAction<OperationalNote[]>>;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, setNotes }) => {
  const [editingNote, setEditingNote] = useState<OperationalNote | null>(null);

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    
    if (editingNote.id === 'new') {
      const newNote = { ...editingNote, id: Date.now().toString(), updatedAt: new Date().toISOString() };
      setNotes(prev => [newNote, ...prev]);
    } else {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...editingNote, updatedAt: new Date().toISOString() } : n));
    }
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold deep-blue-text">營運筆記</h2>
          <p className="text-slate-500 text-sm">內部指引、會議紀錄與重要備忘</p>
        </div>
        <button 
          onClick={() => setEditingNote({ id: 'new', title: '', category: '行政', content: '', updatedAt: '' })}
          className="flex items-center gap-2 px-6 py-2.5 deep-blue-bg text-white rounded-xl shadow-lg"
        >
          <ICONS.Plus className="w-5 h-5" />
          <span>撰寫筆記</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div 
            key={note.id} 
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setEditingNote(note)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase">{note.category}</span>
              <ICONS.More className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-3 text-lg">{note.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">{note.content}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[10px] text-slate-400">更新於: {new Date(note.updatedAt).toLocaleDateString()}</span>
              <button className="text-blue-500 text-xs font-bold hover:underline">查看詳情</button>
            </div>
          </div>
        ))}
      </div>

      {editingNote && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold deep-blue-text">{editingNote.id === 'new' ? '撰寫新筆記' : '編輯筆記'}</h3>
              <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={saveNote} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">標題</label>
                  <input 
                    value={editingNote.title}
                    onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                    required 
                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-[#1a2b3c] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">類別</label>
                  <select 
                    value={editingNote.category}
                    onChange={e => setEditingNote({ ...editingNote, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg outline-none"
                  >
                    <option>護理品質</option>
                    <option>行政</option>
                    <option>人事</option>
                    <option>財務</option>
                    <option>消防/安全</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">內容</label>
                <textarea 
                  value={editingNote.content}
                  onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={10} 
                  required
                  className="w-full px-4 py-2 bg-slate-100 border-none rounded-lg outline-none resize-none" 
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingNote(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">取消</button>
                <button type="submit" className="flex-1 py-3 deep-blue-bg text-white font-bold rounded-xl shadow-lg hover:opacity-90">儲存筆記</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;