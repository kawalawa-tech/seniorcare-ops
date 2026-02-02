import React from 'react';
import { Task, RecurringFrequency } from '../types.ts';

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getTasksForDay = (day: number) => {
    // 當前格子的日期對象
    const currentDate = new Date(year, month, day);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); // 0-6
    const dayOfMonth = currentDate.getDate();

    return tasks.filter(t => {
      // 解析任務的初始日期
      const taskDate = new Date(t.deadline);
      const taskDayOfWeek = taskDate.getDay();
      const taskDayOfMonth = taskDate.getDate();
      const taskMonth = taskDate.getMonth();

      // 精準邏輯判斷
      switch (t.recurring) {
        case RecurringFrequency.NONE:
          return t.deadline === dateStr;
        case RecurringFrequency.DAILY:
          return dateStr >= t.deadline;
        case RecurringFrequency.WEEKLY:
          return dateStr >= t.deadline && dayOfWeek === taskDayOfWeek;
        case RecurringFrequency.MONTHLY:
          return dateStr >= t.deadline && dayOfMonth === taskDayOfMonth;
        case RecurringFrequency.YEARLY:
          return dateStr >= t.deadline && dayOfMonth === taskDayOfMonth && month === taskMonth;
        default:
          return t.deadline === dateStr;
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black brand-slate-text uppercase tracking-tight">{year}年 {month + 1}月 行事曆</h2>
          <p className="text-slate-500 font-medium text-sm">自動計算週期性任務與各院舍截止事項</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {days.map(d => (
            <div key={d} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)]">
          {calendarDays.map((day, idx) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

            return (
              <div key={idx} className={`border-r border-b border-slate-100 p-3 overflow-hidden transition-colors ${day ? 'hover:bg-slate-50/50' : 'bg-slate-50/20'}`}>
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-black transition-all ${isToday ? 'bg-brand-orange text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-orange-100' : 'text-slate-400'}`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {dayTasks.slice(0, 4).map(t => (
                        <div key={t.id} className="text-[9px] px-2 py-1.5 rounded-lg truncate bg-white border border-slate-100 shadow-sm flex items-center gap-1.5 group cursor-pointer hover:border-brand-blue/30 transition-all">
                          <span className={`w-1 h-1 rounded-full flex-shrink-0 ${t.priority === '緊急' ? 'bg-rose-500' : 'bg-brand-blue'}`} />
                          <span className="font-bold text-slate-600 truncate">{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 4 && (
                        <div className="text-[8px] text-center text-slate-300 font-black uppercase tracking-tighter py-1">
                          + {dayTasks.length - 4} MORE ITEMS
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;