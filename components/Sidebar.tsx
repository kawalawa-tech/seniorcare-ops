
import React, { useRef } from 'react';
import { ViewType, SyncSettings } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  notifications: { overdue: number; today: number };
  onOpenSync: () => void;
  syncSettings: SyncSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isOpen, 
  setIsOpen, 
  notifications,
  onOpenSync,
  syncSettings
}) => {
  const menuItems: { id: ViewType; icon: any; label: string; badge?: number }[] = [
    { id: 'Table', icon: ICONS.Tasks, label: '事項清單' },
    { id: 'Kanban', icon: ICONS.Kanban, label: '營運看板' },
    { id: 'Calendar', icon: ICONS.Calendar, label: '行事曆', badge: notifications.today },
    { id: 'Analytics', icon: ICONS.Analytics, label: '數據分析', badge: notifications.overdue },
    { id: 'Notes', icon: ICONS.Notes, label: '營運筆記' },
    { id: 'Docs', icon: ICONS.Docs, label: '重要文件' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 w-64 bg-[#1e293b] text-white transform transition-transform duration-300 ease-in-out z-50 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex-1">
            <div className="flex items-center gap-4 mb-10 group cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-[#f97316]">善</span>
              </div>
              <div>
                <p className="font-bold text-xl leading-tight tracking-tight">善頤護老</p>
                <p className="text-[#f97316] text-[10px] font-black uppercase tracking-widest opacity-80">OpsCentre</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setIsOpen(false); }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                      ${isActive 
                        ? 'bg-[#f97316] text-white shadow-lg shadow-orange-900/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.id === 'Analytics' ? 'bg-rose-500' : 'bg-white text-[#f97316]'} text-white`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6 space-y-3 border-t border-white/5">
             <button 
                onClick={onOpenSync}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border
                  ${syncSettings.isEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}
                `}
              >
                {syncSettings.isEnabled ? <ICONS.Cloud className="w-4 h-4" /> : <ICONS.CloudOff className="w-4 h-4" />}
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase leading-none mb-0.5">Cloud Sync</p>
                  <p className="text-[9px] opacity-60 truncate max-w-[120px]">
                    {syncSettings.isEnabled ? (syncSettings.lastSynced ? `已同步 ${syncSettings.lastSynced.split('T')[1].substr(0,5)}` : '連線中...') : '未連線'}
                  </p>
                </div>
              </button>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[9px] text-white/20 font-black tracking-[0.2em] block text-center mb-1 uppercase">Local Safe</span>
                 <div className="flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] text-white/40 font-bold">瀏覽器保護中</span>
                 </div>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
