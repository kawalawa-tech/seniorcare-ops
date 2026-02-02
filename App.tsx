
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

  const localLastUpdated = useRef<string>(safeStorage.getItem('seniorcare_last_updated') || new Date().toISOString());

  const saveAndTouch = useCallback((type: 'tasks' | 'notes' | 'docs', data: any) => {
    const timestamp = new Date().toISOString();
    localLastUpdated.current = timestamp;
    safeStorage.setItem('seniorcare_last_updated', timestamp);
    
    if (type === 'tasks') { setTasks(data); safeStorage.setItem('seniorcare_tasks', JSON.stringify(data)); }
    if (type === 'notes') { setNotes(data); safeStorage.setItem('seniorcare_notes', JSON.stringify(data)); }
    if (type === 'docs') { setDocs(data); safeStorage.setItem('seniorcare_docs', JSON.stringify(data)); }
  }, []);

  const performSmartSync = useCallback(async (isAutoPull = false) => {
    const gid = sanitizeGistId(syncSettings.gistId);
    
    if (!syncSettings.isEnabled || !syncSettings.githubToken) return;

    const isValidFormat = /^[a-f0-9]{20,32}$/i.test(gid);

    if (!isValidFormat) {
      if (!isAutoPull && gid) {
        if (syncSettings.gistId.startsWith('ghp_')) {
          alert("錯誤：您填入的是 Token 而非 Gist ID。請確保 Token 已正確填入，此欄位應填入 20-32 位代碼。");
        } else {
          alert("Gist ID 格式不正確。請輸入 20 或 32 位的字母數字編號。");
        }
        return;
      }
      if (isAutoPull || !gid) {
        if (!isAutoPull) {
            // 手動觸發且 gid 為空，代表想建立新 Gist
        } else {
            return; // 自動拉取但沒 ID 則直接返回
        }
      }
    }
    
    setIsSyncing(true);
    setSyncStatusText(isAutoPull ? 'Checking...' : 'Syncing...');

    try {
      const cloudData = gid && isValidFormat ? await fetchFromGitHub(syncSettings.githubToken, gid) : null;
      
      if (cloudData && cloudData.lastUpdated) {
        const cloudTime = new Date(cloudData.lastUpdated).getTime();
        const localTime = new Date(localLastUpdated.current).getTime();

        if (cloudTime > localTime) {
          if (cloudData.tasks) { setTasks(cloudData.tasks); safeStorage.setItem('seniorcare_tasks', JSON.stringify(cloudData.tasks)); }
          if (cloudData.notes) { setNotes(cloudData.notes); safeStorage.setItem('seniorcare_notes', JSON.stringify(cloudData.notes)); }
          if (cloudData.docs) { setDocs(cloudData.docs); safeStorage.setItem('seniorcare_docs', JSON.stringify(cloudData.docs)); }
          localLastUpdated.current = cloudData.lastUpdated;
          safeStorage.setItem('seniorcare_last_updated', cloudData.lastUpdated);
          setSyncSettings(prev => ({ ...prev, lastSynced: new Date().toISOString() }));
          setIsSyncing(false);
          setSyncStatusText('Cloud Live');
          return;
        }
      }

      if (!isAutoPull) {
        const dataToSync = { 
          tasks, 
          notes, 
          docs, 
          lastUpdated: localLastUpdated.current 
        };
        const result = await syncToGitHub(syncSettings.githubToken, gid, dataToSync);
        if (result.success) {
          const newGistId = result.gistId || gid;
          setSyncSettings(prev => {
            const next = { ...prev, gistId: newGistId, lastSynced: new Date().toISOString() };
            safeStorage.setItem('seniorcare_sync_settings', JSON.stringify(next));
            return next;
          });
          if (!isAutoPull) alert("同步成功！" + (gid ? "" : "\n系統已自動為您建立並填入新 Gist ID。"));
        } else if (!isAutoPull) {
          alert(result.message || "同步失敗");
        }
      }
    } catch (err) {
      console.error("Smart Sync Error", err);
    }

    setIsSyncing(false);
    setSyncStatusText('Cloud Live');
  }, [syncSettings, tasks, notes, docs]);

  useEffect(() => {
    const initSync = async () => {
      const gid = sanitizeGistId(syncSettings.gistId);
      if (syncSettings.isEnabled && /^[a-f0-9]{20,32}$/i.test(gid)) {
        await performSmartSync(true);
      }
    };
    initSync();
  }, []);

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

  const isGistIdValid = useMemo(() => {
    const gid = sanitizeGistId(syncSettings.gistId);
    return /^[a-f0-9]{20,32}$/i.test(gid);
  }, [syncSettings.gistId]);

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
                  <span className="text-xs font-black text-blue-700 uppercase tracking-tight">操作提示</span>
                </div>
                <ul className="text-[11px] text-blue-600 leading-relaxed font-medium list-disc pl-4 space-y-1">
                  <li><strong>建立新空間：</strong>將下方 Gist ID 留空，直接點擊「立即上傳」。</li>
                  <li><strong>跨裝置同步：</strong>在其他裝置填入同一個 Token 與同一個 Gist ID。</li>
                </ul>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gist ID (雲端編號)</label>
                  <a href="https://gist.github.com" target="_blank" className="text-[9px] font-black text-brand-orange uppercase hover:underline">我的 Gists</a>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="留空以建立新備份空間" 
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm transition-all ${isGistIdValid ? 'border-emerald-300 bg-emerald-50/30 ring-emerald-100' : syncSettings.gistId.startsWith('ghp_') ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                    value={syncSettings.gistId}
                    onChange={(e) => setSyncSettings(prev => ({ ...prev, gistId: e.target.value }))}
                  />
                  {isGistIdValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                      <ICONS.Refresh className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase">格式正確</span>
                    </div>
                  )}
                </div>
                {syncSettings.gistId.startsWith('ghp_') && (
                  <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                    <ICONS.Warning className="w-3 h-3" />
                    注意：這似乎是 Token 而非 ID。請將 Token 設定在程式內部。
                  </p>
                )}
                <p className="text-[9px] text-slate-400 mt-2 font-medium">※ Gist ID 為 20 或 32 位的字母數字編號（例如 4f284f...）。</p>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div>
                  <p className="font-black text-sm text-slate-700">自動雲端備份</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Real-time sync enabled</p>
                </div>
                <button onClick={() => setSyncSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))} className={`w-14 h-8 rounded-full transition-all relative ${syncSettings.isEnabled ? 'bg-slate-900' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${syncSettings.isEnabled ? 'left-7 shadow-lg' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button onClick={() => performSmartSync(true)} disabled={isSyncing} className={`flex-1 flex items-center justify-center gap-2 py-4 font-black rounded-2xl transition-all ${isGistIdValid ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <ICONS.Refresh className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 下載更新
                </button>
                <button onClick={() => performSmartSync(false)} disabled={isSyncing} className="flex-1 flex items-center justify-center gap-2 py-4 text-white font-black rounded-2xl shadow-xl bg-brand-orange shadow-orange-100 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
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
