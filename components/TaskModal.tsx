
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskCategory, RecurringFrequency, LOCATIONS, ASSIGNEES } from '../types';
import { ICONS } from '../constants';
import { getGeminiResponse } from '../services/gemini';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (task: any) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onUpdateTask, onAddTask }) => {
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!isOpen) return null;

  const handleAiFill = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const result = await getGeminiResponse(`請從這段文字提取營運事項細節：${aiInput}`, 'extract');
    setIsAiLoading(false);
    
    try {
      const data = JSON.parse(result);
      const form = document.querySelector('#task-form') as HTMLFormElement;
      if (form && data) {
        if (data.title) (form.elements.namedItem('title') as HTMLInputElement).value = data.title;
        if (data.location) (form.elements.namedItem('location') as HTMLSelectElement).value = data.location;
        if (data.deadline) (form.elements.namedItem('deadline') as HTMLInputElement).value = data.deadline;
        if (data.description) (form.elements.namedItem('description') as HTMLTextAreaElement).value = data.description;
        if (data.priority) (form.elements.namedItem('priority') as HTMLSelectElement).value = data.priority;
        if (data.category) (form.elements.namedItem('category') as HTMLSelectElement).value = data.category;
        
        if (data.assignees && Array.isArray(data.assignees)) {
            const checkboxes = form.querySelectorAll('input[name="assignees"]');
            checkboxes.forEach((cb: any) => {
                cb.checked = data.assignees.includes(cb.value);
            });
        }
      }
      setAiInput('');
    } catch (e) {
      console.error("AI parse error", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-[#1e293b]">{task ? '更新營運事項' : '新增營運事項'}</h3>
            <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">Ops Management Portal</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors">×</button>
        </div>
        
        <div className="px-8 pt-6">
           <div className="p-5 bg-orange-50/50 border border-orange-200/50 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center shadow-lg">
                  <ICONS.Magic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest">AI 智慧填表助手</span>
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="貼上文字，如：下週三心薈需要緊急維修..." 
                  className="flex-1 text-sm px-5 py-3 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#f97316] shadow-inner font-bold"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={handleAiFill}
                  disabled={isAiLoading}
                  className="px-6 py-3 bg-[#1e293b] text-white text-sm font-black rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-md"
                >
                  {isAiLoading ? '分析中...' : '自動填寫'}
                </button>
              </div>
           </div>
        </div>

        <form id="task-form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const selectedAssignees = Array.from(formData.getAll('assignees')) as string[];
          
          const taskData = {
            title: formData.get('title') as string,
            location: formData.get('location') as string,
            assignees: selectedAssignees,
            status: (formData.get('status') || TaskStatus.PENDING) as TaskStatus,
            priority: formData.get('priority') as TaskPriority,
            category: formData.get('category') as TaskCategory,
            recurring: formData.get('recurring') as RecurringFrequency,
            deadline: formData.get('deadline') as string,
            description: formData.get('description') as string,
          };

          if (task) {
            onUpdateTask(task.id, taskData);
          } else {
            onAddTask(taskData);
          }
          onClose();
        }} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">事項標題</label>
              <input name="title" defaultValue={task?.title} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#f97316] outline-none font-bold text-slate-700" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">院舍地點</label>
              <select name="location" defaultValue={task?.location || '心薈'} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">類別</label>
              <select name="category" defaultValue={task?.category || TaskCategory.ADMIN} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">優先等級</label>
              <select name="priority" defaultValue={task?.priority || TaskPriority.NORMAL} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">截止日期</label>
              <input type="date" name="deadline" defaultValue={task?.deadline || new Date().toISOString().split('T')[0]} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#f97316] outline-none font-bold text-slate-700" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">指派負責人</label>
              <div className="grid grid-cols-3 gap-3">
                {ASSIGNEES.map(a => (
                  <label key={a} className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-[#f97316] has-[:checked]:bg-orange-50 has-[:checked]:border-[#f97316] has-[:checked]:shadow-sm transition-all">
                    <input 
                      type="checkbox" 
                      name="assignees" 
                      value={a} 
                      defaultChecked={task?.assignees.includes(a)}
                      className="hidden" 
                    />
                    <span className="text-xs font-black text-[#1e293b]">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">事項詳情</label>
              <textarea name="description" defaultValue={task?.description} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none font-medium text-slate-700" placeholder="補充說明..." />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors">取消</button>
             <button type="submit" className="flex-1 py-4 bg-[#f97316] text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:opacity-90 active:scale-95 transition-all">
                {task ? '確認更新' : '立即建立'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
