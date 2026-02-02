import React, { useState } from 'react';
import { Task, TaskStatus } from '../types.ts';
import { ICONS, STATUS_COLORS, PRIORITY_COLORS, LOCATION_STYLE } from '../constants.tsx';
import TaskModal from './TaskModal.tsx';

interface DashboardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask?: (task: any) => void;
  onDeleteTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onUpdateTask, onAddTask = () => {}, onDeleteTask }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; task?: Task | null }>({ isOpen: false });
  const columns = Object.values(TaskStatus);

  return (
    <div className="h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold brand-blue-text tracking-tight uppercase">營運看板</h2>
          <p className="text-slate-500 font-medium">拖動卡片即可變更進度，點擊圖標編輯或刪除</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-280px)] overflow-x-auto pb-6 scrollbar-hide">
        {columns.map(status => (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full bg-slate-100/30 rounded-[2.5rem] border border-slate-200/50 p-6">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${status === TaskStatus.COMPLETED ? 'bg-green-500 shadow-green-500/50' : status === TaskStatus.STUCK ? 'bg-red-500 shadow-red-500/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">{status}</h3>
                <span className="text-[10px] bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-400 font-black">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {tasks.filter(t => t.status === status).map(task => (
                <div 
                  key={task.id} 
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                  onClick={(e) => {
                    const nextStatus = columns[(columns.indexOf(status) + 1) % columns.length];
                    onUpdateTask(task.id, { status: nextStatus });
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${LOCATION_STYLE[task.location] || 'bg-slate-50 text-slate-500'}`}>
                      {task.location}
                    </span>
                    <div className="flex gap-1.5 relative z-20">
                      <button 
                        type="button"
                        className="p-1.5 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteTask(task.id);
                        }}
                      >
                        <ICONS.Trash className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        className="p-1.5 bg-slate-50 rounded-xl text-slate-400 hover:brand-green-bg hover:text-white transition-all shadow-sm flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setModalState({ isOpen: true, task });
                        }}
                      >
                        <ICONS.Edit className="w-3.5 h-3.5 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug mb-4 group-hover:brand-blue-text transition-colors">{task.title}</h4>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 2).map((a, i) => (
                          <div key={i} className="w-6 h-6 rounded-full brand-blue-bg border-2 border-white flex items-center justify-center text-[8px] text-white font-black uppercase shadow-sm">
                            {a[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{task.assignees.length > 2 ? `${task.assignees[0]} +${task.assignees.length - 1}` : task.assignees.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 font-black">
                      <ICONS.Calendar className="w-3 h-3" />
                      {task.deadline.split('-').slice(1).join('/')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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

export default Dashboard;