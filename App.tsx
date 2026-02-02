import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskCategory, 
  RecurringFrequency, 
  ViewType, 
  LOCATIONS, 
  ASSIGNEES,
  OperationalNote,
  ImportantDocument,
  SyncSettings
} from './types.ts';
import { ICONS } from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import TaskBoard from './components/TaskBoard.tsx';
import CalendarView from './components/CalendarView.tsx';
import Analytics from './components/Analytics.tsx';
import NotesView from './components/NotesView.tsx';
import ImportantDocsView from './components/ImportantDocsView.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import { syncToGitHub, fetchFromGitHub, sanitizeGistId } from './services/cloudStorage.ts';

const safeStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: '歡迎使用 OpsCentre',
    location: '總部營運',
    assignees: ['Chris'],
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    category: TaskCategory.ADMIN,
    recurring: RecurringFrequency.NONE,
    deadline: new Date().toISOString().split('T')[0],
    description: '請前往右下角設定雲端同步，以便在不同裝置間同步數據。',
    logs: [{ id: 'l1', user: 'System', action: 'Initialized', timestamp: new Date().toISOString() }]
  }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('Table');
  const [currentUser, setCurrentUser] = useState<string>(ASSIGNEES[0]);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = safeStorage.getItem('seniorcare_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [notes, setNotes] = useState<OperationalNote[]>(() => {
    const saved = safeStorage.getItem('seniorcare_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [docs, setDocs] = useState<ImportantDocument[]>(() => {
    const saved = safeStorage.getItem('seniorcare_docs');
    return saved ? JSON.parse(saved) : [];
  });

  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => {
    const saved = safeStorage.getItem('seniorcare_sync_settings');
    if (saved) return JSON.parse(saved);
    return { 
      provider: 'github', 
      isEnabled: true, 
      lastSynced: null, 
      scriptUrl: '', 
      githubToken: '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', 
      gistId: '' 
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('Cloud Live');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'task' | 'doc' | 'note' } | null>(null);

  // 用於追蹤本地最後更新時間
  const localLastUpdated = useRef<string>(safeStorage.getItem('seniorcare_last_updated') || new Date().toISOString());

  // 儲存數據並更新時間戳記
  const saveAndTouch = useCallback((type: 'tasks' | 'notes' | 'docs', data: any) => {
    const timestamp = new Date().toISOString();
    localLastUpdated.current = timestamp;
    safeStorage.setItem('seniorcare_last_updated', timestamp);
    
    if (type === 'tasks') { setTasks(data); safeStorage.setItem('seniorcare_tasks', JSON.stringify(data)); }
    if (type === 'notes') { setNotes(data); safeStorage.setItem('seniorcare_notes', JSON.stringify(data)); }
    if (type === 'docs') { setDocs(data); safeStorage.setItem('seniorcare_docs', JSON.stringify(data)); }
  }, []);

  // 強大同步邏輯：先下載比對，再決定是否上傳
  const performSmartSync = useCallback(async (isAutoPull = false) => {
    if (!syncSettings.isEnabled || !syncSettings.githubToken || !syncSettings.gistId) return;
    
    setIsSyncing(true);
    setSyncStatusText(isAutoPull ? 'Checking...' : 'Syncing...');

    try {
      // 1. 先嘗試獲取雲端最新數據
      const cloudData = await fetchFromGitHub(syncSettings.githubToken, syncSettings.gistId);
      
      if (cloudData && cloudData.lastUpdated) {
        const cloudTime = new Date(cloudData.lastUpdated).getTime();
        const localTime = new Date(localLastUpdated.current).getTime();

        // 2. 如果雲端比較新，則更新本地
        if (cloudTime > localTime) {
          console.log("OpsCentre: Cloud data is newer. Updating local state...");
          if (cloudData.tasks) { setTasks(cloudData.tasks); safeStorage.setItem('seniorcare_tasks', JSON.stringify(cloudData.tasks)); }
          if (cloudData.notes) { setNotes(cloudData.notes); safeStorage.setItem('seniorcare_notes', JSON.stringify(cloudData.notes)); }
          if (cloudData.docs) { setDocs(cloudData.docs); safeStorage.setItem('seniorcare_docs', JSON.stringify(cloudData.docs)); }
          localLastUpdated.current = cloudData.lastUpdated;
          safeStorage.setItem('seniorcare_last_updated', cloudData.lastUpdated);
          setSyncSettings(prev => ({ ...prev, lastSynced: new Date().toISOString() }));
          setIsSyncing(false);
          setSyncStatusText('Cloud Live');
          return; // 完成同步
        }
      }

      // 3. 如果本地比較新 (或是手動觸發)，則將本地上傳至雲端
      if (!isAutoPull) {
        const dataToSync = { 
          tasks, 
          notes, 
          docs, 
          lastUpdated: localLastUpdated.current 
        };
        const result = await syncToGitHub(syncSettings.githubToken, syncSettings.gistId, dataToSync);
        if (result.success) {
          setSyncSettings(prev => ({ 
            ...prev, 
            gistId: result.gistId || prev.gistId, 
            lastSynced: new Date().toISOString() 
          }));
        }
      }
    } catch (err) {
      console.error("Smart Sync Error", err);
    }

    setIsSyncing(false);
    setSyncStatusText('Cloud Live');
  }, [syncSettings, tasks, notes, docs]);

  // 啟動時自動拉取
  useEffect(() => {
    const initSync = async () => {
      if (syncSettings.isEnabled && syncSettings.gistId) {
        await performSmartSync(true);
      }
    };
    initSync();
  }, []);

  // 定時同步 (每 60 秒檢查一次)
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncSettings.isEnabled) performSmartSync(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [performSmartSync, syncSettings.isEnabled]);

  const notifications = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.deadline < today);
    const todayTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.deadline === today);
    return { overdue: overdue.length, today: todayTasks.length };
  }, [tasks]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8fafc]">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        notifications={notifications}
        onOpenSync={() => setShowSyncModal(true)}
        syncSettings={syncSettings}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 border-b bg-white px-4 md:px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
              <ICONS.More className="w-6 h-6 text-slate-500" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black brand-orange-text hidden md:block uppercase tracking-tighter">OpsCentre</h1>
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${syncSettings.isEnabled ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                onClick={() => setShowSyncModal(true)}
              >
                <ICONS.Github className={`w-3.5 h-3.5 ${syncSettings.isEnabled ? 'text-slate-800' : 'text-slate-300'}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${syncSettings.isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                  {syncSettings.isEnabled ? (isSyncing ? syncStatusText : 'Cloud Live') : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-full brand-orange-bg text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-sm">
                  {currentUser[0]}
                </div>
                <select className="bg-transparent text-xs font-bold outline-none cursor-pointer brand-slate-text" value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
                  {ASSIGNEES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeView === 'Table' && <TaskBoard tasks={tasks} onUpdateTask={(id, u) => saveAndTouch('tasks', tasks.map(t=>t.id===id?{...t,...u}:t))} onAddTask={(t) => saveAndTouch('tasks', [{...t, id: Math.random().toString(36).substr(2,9), logs:[]}, ...tasks])} onDeleteTask={(id) => setConfirmDelete({id, type:'task'})} />}
          {activeView === 'Kanban' && <Dashboard tasks={tasks} onUpdateTask={(id, u) => saveAndTouch('tasks', tasks.map(t=>t.id===id?{...t,...u}:t))} onDeleteTask={(id) => setConfirmDelete({id, type:'task'})} />}
          {activeView === 'Calendar' && <CalendarView tasks={tasks} />}
          {activeView === 'Analytics' && <Analytics tasks={tasks} />}
          {activeView === 'Notes' && <NotesView notes={notes} setNotes={(val) => { const next = typeof val === 'function' ? val(notes) : val; saveAndTouch('notes', next); }} />}
          {activeView === 'Docs' && <ImportantDocsView docs={docs} onAddDoc={(d) => saveAndTouch('docs', [{...d, id: Math.random().toString(36).substr(2,9)}, ...docs])} onUpdateDoc={(id, u) => saveAndTouch('docs', docs.map(d=>d.id===id?{...d,...u}:d))} onDeleteDoc={(id) => setConfirmDelete({id, type:'doc'})} />}
        </div>
      </main>

      {showSyncModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-slate-900 text-white">
                  <ICONS.Github className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black brand-slate-text">雲端同步中心</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multi-Device Synchronization</p>
                </div>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors">×</button>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <ICONS.Warning className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black text-blue-700 uppercase tracking-tight">多裝置同步要領</span>
                </div>
                <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                  請確保您的所有裝置 (電腦、手機) 都填入 **同一個** Gist ID 與 Token。系統會自動偵測並同步最新的異動。
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Gist ID (多裝置需一致)</label>
                <input 
                  type="text" 
                  placeholder="貼入 Gist 網址或 ID" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm"
                  value={syncSettings.gistId}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, gistId: e.target.value }))}
                  onBlur={(e) => setSyncSettings(prev => ({ ...prev, gistId: sanitizeGistId(e.target.value) }))}
                />
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div>
                  <p className="font-black text-sm text-slate-700">自動雲端備份</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Real-time Cloud Integration</p>
                </div>
                <button onClick={() => setSyncSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))} className={`w-14 h-8 rounded-full transition-all relative ${syncSettings.isEnabled ? 'bg-slate-900' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${syncSettings.isEnabled ? 'left-7 shadow-lg' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button onClick={() => performSmartSync(true)} disabled={isSyncing} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 disabled:opacity-50 transition-all">
                  <ICONS.Refresh className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 下載更新
                </button>
                <button onClick={() => performSmartSync(false)} disabled={isSyncing} className="flex-1 flex items-center justify-center gap-2 py-4 text-white font-black rounded-2xl shadow-xl bg-slate-900 shadow-slate-200 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
                  <ICONS.Cloud className="w-4 h-4" /> 立即上傳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-sm p-8 shadow-2xl text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
              <ICONS.Trash className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black brand-slate-text mb-2">確認刪除</h3>
            <p className="text-slate-400 font-bold text-xs mb-8">此動作將永久移除該項目。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-black text-slate-500">取消</button>
              <button onClick={() => {
                if(confirmDelete.type==='task') saveAndTouch('tasks', tasks.filter(t=>t.id!==confirmDelete.id));
                if(confirmDelete.type==='doc') saveAndTouch('docs', docs.filter(d=>d.id!==confirmDelete.id));
                if(confirmDelete.type==='note') saveAndTouch('notes', notes.filter(n=>n.id!==confirmDelete.id));
                setConfirmDelete(null);
              }} className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-black shadow-lg shadow-rose-100">刪除</button>
            </div>
          </div>
        </div>
      )}

      <AIAssistant onAddTask={(t) => saveAndTouch('tasks', [{...t, id: Math.random().toString(36).substr(2,9), logs:[]}, ...tasks])} />
    </div>
  );
};

export default App;