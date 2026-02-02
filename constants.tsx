
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trello, 
  Calendar, 
  PieChart, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  MoreVertical,
  AlertTriangle,
  Clock,
  User,
  Filter,
  Download,
  Upload,
  Bot,
  Library,
  Wand2,
  Trash2,
  Edit2,
  ExternalLink,
  Phone,
  LayoutGrid,
  Cloud,
  CloudOff,
  RefreshCw,
  Link,
  Github
} from 'lucide-react';

export const ICONS = {
  Dashboard: LayoutDashboard,
  Tasks: CheckSquare,
  Kanban: Trello,
  Calendar: Calendar,
  Analytics: PieChart,
  Notes: FileText,
  Settings: Settings,
  Plus: Plus,
  Search: Search,
  Bell: Bell,
  More: MoreVertical,
  Warning: AlertTriangle,
  Clock: Clock,
  User: User,
  Filter: Filter,
  Download: Download,
  Upload: Upload,
  AI: Bot,
  Docs: Library,
  Magic: Wand2,
  Trash: Trash2,
  Edit: Edit2,
  External: ExternalLink,
  Phone: Phone,
  Grid: LayoutGrid,
  Cloud: Cloud,
  CloudOff: CloudOff,
  Refresh: RefreshCw,
  Link: Link,
  Github: Github
};

export const STATUS_COLORS = {
  '待處理': 'bg-slate-50 text-slate-600 border-slate-200',
  '跟進中': 'bg-orange-50 text-orange-700 border-orange-200',
  '已完成': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '卡住': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const PRIORITY_COLORS = {
  '緊急': 'text-rose-600 font-bold',
  '一般': 'text-orange-600',
  '低度': 'text-slate-500',
};

export const BRAND_COLORS = {
  slate: '#1e293b',
  orange: '#f97316',
  surface: '#f8fafc',
};

export const LOCATION_STYLE: Record<string, string> = {
  '心薈': 'bg-pink-50 text-pink-600 border-pink-100',
  '康薈': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  '福群': 'bg-orange-50 text-orange-600 border-orange-100',
  '萬基': 'bg-amber-50 text-amber-600 border-amber-100',
  '大華': 'bg-rose-50 text-rose-600 border-rose-100',
  '總部營運': 'bg-slate-100 text-slate-600 border-slate-200',
};
