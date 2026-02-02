
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskCategory, RecurringFrequency, LOCATIONS, ASSIGNEES } from '../types';
import { ICONS, STATUS_COLORS, PRIORITY_COLORS, BRAND_COLORS, LOCATION_STYLE } from '../constants';
import TaskModal from './TaskModal';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (task: any) => void;
  onDeleteTask: (id: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask, onAddTask, onDeleteTask }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; task?: Task | null }>({ isOpen: false });
  const today = new Date().toISOString().split('T')[0];

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div 
      className={`p-5 rounded-3xl border bg-white shadow-sm mb-4 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer border-slate-100 ${task.status !== TaskStatus.COMPLETED && task.deadline < today ? 'border-red-200 bg-red-50/20' : ''}`}
      onClick={() => setModalState({ isOpen: true, task })}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${LOCATION_STYLE[task.location] || 'bg-slate-50 text-slate-500'}`}>
          {task.location}
        </span>
        <span className={`text-[10px] px-3 py-1 rounded-full border font-bold ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
      </div>
      <h3 className="font-bold text-slate-800 mb-3 text-lg leading-snug">{task.title}</h3>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex -space-x-2.5">
          {task.assignees.map((a, i) => (
            <div key={i} title={a} className="w-8 h-8 rounded-full brand-blue-bg border-2 border-white flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm">
              {a[0]}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <ICONS.Clock className="w-4 h-4 text-slate-400" />
          {task.deadline}
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <span className={`text-xs font-bold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}優先</span>
        <div className="flex gap-2 relative z-30">
          <button 
            type="button"
            onClick={(e) => { 
              e.stopPropagation(); 
              onDeleteTask(task.id); 
            }} 
            className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center rounded-xl"
            title="刪除"
          >
             <ICONS.Trash className="w-4 h-4 pointer-events-none" />
          </button>
          <div className="p-2.5 bg-slate-50 rounded-xl group hover:brand-green-bg transition-colors flex items-center justify-center">
             <ICONS.Edit className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold brand-blue-text tracking-tight uppercase">營運管理看板</h2>
          <p className="text-slate-500 font-medium">各院舍即時事項進度與人力分配</p>
        </div>
        <button 
          type="button"
          onClick={() => setModalState({ isOpen: true, task: null })}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 brand-green-bg text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          <ICONS.Plus className="w-5 h-5 pointer-events-none" />
          <span>新增營運事項</span>
        </button>
      </div>

      <div className="md:hidden">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>

      <div className="hidden md:block overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">院舍</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">事項詳情</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">負責團隊</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">進度狀態</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">截止日</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map(task => {
              const isOverdue = task.status !== TaskStatus.COMPLETED && task.deadline < today;

              return (
                <tr key={task.id} className={`group hover:bg-[#fcfdfa] transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-6">
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${LOCATION_STYLE[task.location] || 'bg-slate-50 text-slate-500'}`}>
                      {task.location}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 group-hover:brand-blue-text transition-colors">{task.title}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{task.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center -space-x-2.5">
                      {task.assignees.map((a, i) => (
                        <div key={i} title={a} className="w-8 h-8 rounded-full brand-blue-bg border-2 border-white flex items-center justify-center text-[8px] text-white font-bold uppercase shadow-sm">
                          {a[0]}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black border tracking-wider ${STATUS_COLORS[task.status]}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{task.deadline}</span>
                      {task.recurring !== RecurringFrequency.NONE && (
                        <span className="text-[10px] font-bold text-[#88bc4c] flex items-center gap-1 mt-1">
                          <ICONS.Clock className="w-3 h-3" />
                          {task.recurring}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 relative z-30">
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onDeleteTask(task.id); 
                        }}
                        className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center group/del"
                        title="刪除"
                      >
                        <ICONS.Trash className="w-4 h-4 pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalState({ isOpen: true, task });
                        }}
                        className="p-3 bg-slate-50 text-slate-400 hover:brand-green-bg hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                        title="編輯"
                      >
                        <ICONS.Edit className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TaskModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false })} 
        task={modalState.task} 
        onUpdateTask={onUpdateTask} 
        onAddTask={onAddTask} 
      />
    </div>
  );
};

export default TaskBoard;
