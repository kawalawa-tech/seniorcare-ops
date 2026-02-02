
import React from 'react';
import { Task, RecurringFrequency } from '../types';

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
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline === dateStr || t.recurring !== RecurringFrequency.NONE);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold deep-blue-text">{year}年 {month + 1}月 行事曆</h2>
          <p className="text-slate-500 text-sm">自動計算週期性任務與各院舍截止事項</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b">
          {days.map(d => (
            <div key={d} className="py-4 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {calendarDays.map((day, idx) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            const isToday = day === now.getDate();

            return (
              <div key={idx} className={`border-r border-b p-2 overflow-hidden transition-colors ${day ? 'hover:bg-slate-50 cursor-pointer' : 'bg-slate-50/30'}`}>
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-bold ${isToday ? 'bg-[#1a2b3c] text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="text-[10px] px-1.5 py-0.5 rounded truncate bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[9px] text-center text-slate-400 font-medium">
                          + 還有 {dayTasks.length - 3} 個事項
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
