
import React from 'react';
import { Task, TaskStatus, LOCATIONS, TaskCategory } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsProps {
  tasks: Task[];
}

const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  const today = new Date().toISOString().split('T')[0];

  // Data 1: Status Distribution
  const statusData = Object.values(TaskStatus).map(status => ({
    name: status,
    value: tasks.filter(t => t.status === status).length
  }));

  // Re-map colors to match the professional Slate/Orange scheme
  const COLORS = ['#94a3b8', '#f97316', '#10b981', '#f43f5e'];

  // Data 2: Location Workload
  const locationData = LOCATIONS.map(loc => ({
    name: loc,
    tasks: tasks.filter(t => t.location === loc).length,
    overdue: tasks.filter(t => t.location === loc && t.status !== TaskStatus.COMPLETED && t.deadline < today).length
  }));

  // Data 3: Category Trends
  const categoryData = Object.values(TaskCategory).map(cat => ({
    name: cat,
    count: tasks.filter(t => t.category === cat).length
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black brand-slate-text tracking-tight uppercase">營運數據分析中心</h2>
        <p className="text-slate-500 font-medium">各院舍行政效能與潛在風險即時監控</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            事項進度分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
            院舍工作負荷與逾期
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="tasks" fill="#1e293b" name="總事項" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="overdue" fill="#f43f5e" name="已逾期" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="font-black text-slate-800 mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            事項類別熱度分析
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
