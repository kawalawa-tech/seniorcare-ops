
export enum TaskStatus {
  PENDING = '待處理',
  IN_PROGRESS = '跟進中',
  COMPLETED = '已完成',
  STUCK = '卡住'
}

export enum TaskPriority {
  EMERGENCY = '緊急',
  NORMAL = '一般',
  LOW = '低度'
}

export enum TaskCategory {
  MAINTENANCE = '維修',
  HR = 'HR',
  ADMIN = '行政',
  PROCUREMENT = '採購',
  NURSING = '護理品質',
  SAFETY = '消防/安全'
}

export enum RecurringFrequency {
  NONE = '單次',
  DAILY = '每日',
  WEEKLY = '每週',
  MONTHLY = '每月',
  QUARTERLY = '每季',
  YEARLY = '每年'
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  location: string;
  assignees: string[];
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  recurring: RecurringFrequency;
  deadline: string;
  description: string;
  attachmentUrl?: string;
  logs: AuditLog[];
}

export interface OperationalNote {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

export interface ImportantDocument {
  id: string;
  title: string;
  category: '守則' | '通訊錄' | '表格' | '政策';
  description: string;
  url: string;
  updatedAt: string;
}

export type SyncProvider = 'google' | 'github';

export interface SyncSettings {
  provider: SyncProvider;
  isEnabled: boolean;
  lastSynced: string | null;
  // Google specific
  scriptUrl: string;
  // GitHub specific
  githubToken: string;
  gistId: string;
}

export type ViewType = 'Table' | 'Kanban' | 'Calendar' | 'Analytics' | 'Notes' | 'Docs';

export const LOCATIONS = ['心薈', '康薈', '福群', '萬基', '大華', '總部營運'];
export const ASSIGNEES = ['Chris', 'Gavin', 'Jannel'];
