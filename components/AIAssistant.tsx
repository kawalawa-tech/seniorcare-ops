import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants.tsx';
import { getGeminiResponse } from '../services/gemini.ts';
import { TaskCategory, TaskPriority, RecurringFrequency } from '../types.ts';

interface AIAssistantProps {
  onAddTask: (task: any) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '您好！我是善頤護老 (Senior Care) 的營運助手。我可以協助您查詢院舍規章、提取 WhatsApp 事項，或搜尋官網最新消息。請問今天有什麼可以幫您？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const renderContent = (content: string) => {
    // 簡單的 Markdown 連結解析器 [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = content.split('\n');
    
    return parts.map((line, i) => {
      let elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // 加入連結前的文字
        elements.push(line.substring(lastIndex, match.index));
        // 加入連結元素
        elements.push(
          <a 
            key={`${i}-${match.index}`}
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700 font-bold mx-1"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      elements.push(line.substring(lastIndex));

      return (
        <p key={i} className={`mb-2 last:mb-0 ${line.startsWith('-') || line.startsWith('*') ? 'pl-4' : ''}`}>
          {elements}
        </p>
      );
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    const isTaskInput = (userMsg.includes('事項') || userMsg.includes('新增') || userMsg.includes('建立')) && userMsg.length > 5;
    const response = await getGeminiResponse(userMsg, isTaskInput ? 'extract' : 'chat');

    if (isTaskInput && response.trim().startsWith('{')) {
      try {
        const taskData = JSON.parse(response);
        onAddTask({
          title: taskData.title || 'AI 事項',
          location: taskData.location || '心薈',
          assignees: taskData.assignees || ['Chris'],
          status: '待處理',
          priority: taskData.priority || TaskPriority.NORMAL,
          category: taskData.category || TaskCategory.ADMIN,
          recurring: taskData.isRecurring ? RecurringFrequency.MONTHLY : RecurringFrequency.NONE,
          deadline: taskData.deadline || new Date().toISOString().split('T')[0],
          description: taskData.description || '由 AI 助手自動提取。',
        });
        setMessages(prev => [...prev, { role: 'ai', content: `✅ 已成功建立事項：**${taskData.title}**。\n\n我已將其指派給 ${taskData.assignees?.join(', ') || '相關人員'}，並設定為 ${taskData.priority || '一般'} 優先。` }]);
      } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', content: response }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    }
    
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-[95vw] sm:w-[450px] h-[650px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500">
          <div className="p-7 bg-[#1e293b] text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316] opacity-10 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                <ICONS.AI className="w-7 h-7 text-[#f97316]" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">Ops Assistant</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Web Search Connected</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors relative z-10">
              <ICONS.Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-[#f97316] text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {renderContent(m.content)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#f97316] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#f97316] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#f97316] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  placeholder="詢問規章或貼上事項訊息..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-2 focus:ring-[#f97316] shadow-inner transition-all group-hover:bg-white"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="w-14 h-14 flex items-center justify-center bg-[#f97316] text-white rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-90 disabled:opacity-50"
              >
                <ICONS.Search className="w-6 h-6 rotate-90" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-300 font-bold mt-4 uppercase tracking-[0.2em]">Powered by Gemini 3 Pro • Real-time Grounding</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:rotate-6 ${isOpen ? 'bg-white text-[#1e293b] scale-90 border-4 border-slate-100' : 'bg-[#f97316] text-white hover:scale-110 shadow-orange-300'}`}
      >
        <ICONS.AI className="w-8 h-8" />
      </button>
    </div>
  );
};

export default AIAssistant;