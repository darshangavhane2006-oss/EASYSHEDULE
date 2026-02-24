import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  Briefcase, 
  FolderKanban, 
  BarChart3, 
  Timer, 
  MessageSquare,
  Bell,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';

// --- Types ---
type View = 'dashboard' | 'tasks' | 'lectures' | 'internship' | 'projects' | 'analytics' | 'focus' | 'ai';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  due_date: string;
}

interface Lecture {
  id: number;
  subject: string;
  topic: string;
  attendance_status: string;
  date: string;
  completed: boolean;
}

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-brand-primary/10 text-brand-primary" 
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
    )}
  >
    <Icon size={20} className={cn("shrink-0", active ? "text-brand-primary" : "group-hover:text-zinc-100")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary"
      />
    )}
  </button>
);

const Card = ({ children, className, title, subtitle, icon: Icon }: any) => (
  <div className={cn("glass-card rounded-2xl p-5", className)}>
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="text-lg font-semibold font-display tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {Icon && <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400"><Icon size={18} /></div>}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <Card className="relative overflow-hidden group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
        <h2 className="text-2xl font-bold font-display">{value}</h2>
        {trend && (
          <p className={cn("text-xs mt-2 flex items-center gap-1", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
            <TrendingUp size={12} className={trend < 0 ? "rotate-180" : ""} />
            {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} />
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
  </Card>
);

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, lecturesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/lectures')
        ]);
        const tasksData = await tasksRes.json();
        const lecturesData = await lecturesRes.json();
        setTasks(tasksData);
        setLectures(lecturesData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      setTasks(prev => [{ ...taskData, id: data.id }, ...prev]);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Add task error:", error);
    }
  };

  const handleAddLecture = async (lectureData: any) => {
    try {
      await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lectureData)
      });
      const res = await fetch('/api/lectures');
      const data = await res.json();
      setLectures(data);
      setIsLectureModalOpen(false);
    } catch (error) {
      console.error("Add lecture error:", error);
    }
  };

  const handleMarkAttendance = async (id: number, status: string) => {
    try {
      await fetch(`/api/lectures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_status: status })
      });
      setLectures(lectures.map(l => l.id === id ? { ...l, attendance_status: status } : l));
    } catch (error) {
      console.error("Attendance error:", error);
    }
  };

  const handleFocusSessionComplete = async (duration: number, type: string) => {
    try {
      await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, type })
      });
    } catch (error) {
      console.error("Focus session save error:", error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} lectures={lectures} />;
      case 'tasks':
        return <TaskManager tasks={tasks} setTasks={setTasks} onAddTask={() => setIsTaskModalOpen(true)} />;
      case 'lectures':
        return <LectureTracker lectures={lectures} onAddLecture={() => setIsLectureModalOpen(true)} onMarkAttendance={handleMarkAttendance} />;
      case 'focus':
        return <FocusMode onSessionComplete={handleFocusSessionComplete} />;
      case 'ai':
        return <AIAssistant />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm">This module is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="border-r border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl flex flex-col z-50"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold">D</div>
              <span className="font-display font-bold text-lg tracking-tight">Darshan OS</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={CheckSquare} label="Tasks" active={activeView === 'tasks'} onClick={() => setActiveView('tasks')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={BookOpen} label="Lectures" active={activeView === 'lectures'} onClick={() => setActiveView('lectures')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Briefcase} label="Internship" active={activeView === 'internship'} onClick={() => setActiveView('internship')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={FolderKanban} label="Projects" active={activeView === 'projects'} onClick={() => setActiveView('projects')} collapsed={isSidebarCollapsed} />
          <div className="my-4 border-t border-zinc-800/50 mx-2" />
          <SidebarItem icon={BarChart3} label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Timer} label="Focus Mode" active={activeView === 'focus'} onClick={() => setActiveView('focus')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={MessageSquare} label="AI Assistant" active={activeView === 'ai'} onClick={() => setActiveView('ai')} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer", isSidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300">
              <User size={18} />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Darshan</p>
                <p className="text-xs text-zinc-500 truncate">AI & DS Student</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-bottom border-zinc-800/50 flex items-center justify-between px-8 bg-zinc-900/10 backdrop-blur-sm z-40">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-bg-dark" />
            </button>
            <div className="h-8 w-[1px] bg-zinc-800" />
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors"
            >
              <Plus size={16} />
              <span>New Action</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onAdd={handleAddTask} 
      />

      <LectureModal 
        isOpen={isLectureModalOpen} 
        onClose={() => setIsLectureModalOpen(false)} 
        onAdd={handleAddLecture} 
      />
    </div>
  );
}

// --- View Components ---

function Dashboard({ tasks, lectures }: { tasks: Task[], lectures: Lecture[] }) {
  const chartData = [
    { name: 'Mon', tasks: 4, hours: 6 },
    { name: 'Tue', tasks: 3, hours: 5 },
    { name: 'Wed', tasks: 7, hours: 8 },
    { name: 'Thu', tasks: 5, hours: 7 },
    { name: 'Fri', tasks: 8, hours: 9 },
    { name: 'Sat', tasks: 2, hours: 4 },
    { name: 'Sun', tasks: 1, hours: 2 },
  ];

  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const totalLectures = lectures.length;
  const presentLectures = lectures.filter(l => l.attendance_status === 'present').length;
  const attendanceRate = totalLectures > 0 ? Math.round((presentLectures / totalLectures) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Welcome back, Darshan</h1>
          <p className="text-zinc-500 mt-1">Here's what's happening with your productivity today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Tasks" value={tasks.length} trend={0} icon={CheckSquare} color="bg-blue-500/10 text-blue-500" />
        <StatCard label="Tasks Pending" value={pendingTasks} trend={-12} icon={Clock} color="bg-indigo-500/10 text-indigo-500" />
        <StatCard label="Tasks Completed" value={completedTasks} trend={24} icon={Award} color="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Lecture Attendance" value={`${attendanceRate}%`} trend={0} icon={BookOpen} color="bg-amber-500/10 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Productivity Overview" subtitle="Tasks completed vs Hours tracked">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#6366f1" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Upcoming Lectures" subtitle="Next 24 hours">
          <div className="space-y-4 mt-4">
            {lectures.slice(0, 3).map((lecture) => (
              <div key={lecture.id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <BookOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{lecture.subject}</p>
                  <p className="text-xs text-zinc-500 truncate">{lecture.topic}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-400">10:00 AM</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider">Live</span>
                </div>
              </div>
            ))}
            {lectures.length === 0 && <p className="text-sm text-zinc-500 text-center py-8">No lectures scheduled.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TaskManager({ tasks, setTasks, onAddTask }: { tasks: Task[], setTasks: any, onAddTask: () => void }) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-zinc-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-brand-primary' },
    { id: 'done', title: 'Completed', color: 'bg-emerald-500' },
  ];

  const updateTaskStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const isOverdue = (date: string) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    return due < today;
  };

  const isDueSoon = (date: string) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    const diff = due.getTime() - today.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Task Manager</h1>
          <p className="text-zinc-500 text-sm">Manage your assignments, projects, and daily goals.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setViewMode('kanban')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", viewMode === 'kanban' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            Kanban
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", viewMode === 'list' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => (
            <div key={col.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-400">{col.title}</h3>
                  <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                <button 
                  onClick={onAddTask}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3 min-h-[500px]">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <motion.div
                    layoutId={`task-${task.id}`}
                    key={task.id}
                    className="glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                          task.priority === 'high' ? "bg-rose-500/10 text-rose-500" :
                          task.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {task.priority}
                        </span>
                        {task.status !== 'done' && isOverdue(task.due_date) && (
                          <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">
                            <AlertCircle size={10} />
                            Overdue
                          </span>
                        )}
                        {task.status !== 'done' && isDueSoon(task.due_date) && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                            <AlertCircle size={10} />
                            Due Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {task.status !== 'done' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="p-1 text-zinc-600 hover:text-emerald-500 transition-colors"
                            title="Mark as done"
                          >
                            <CheckSquare size={14} />
                          </button>
                        )}
                        <button className="text-zinc-600 group-hover:text-zinc-400"><MoreVertical size={14} /></button>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{task.title}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Clock size={12} />
                        <span className="text-[10px]">{task.due_date || 'No date'}</span>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[8px]">D</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.status !== 'done' && isOverdue(task.due_date) && (
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider px-1.5 py-0.5 bg-rose-500/10 rounded">Overdue</span>
                        )}
                        {task.status !== 'done' && isDueSoon(task.due_date) && (
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-500/10 rounded">Due Soon</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{task.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                      task.priority === 'high' ? "bg-rose-500/10 text-rose-500" :
                      task.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{task.due_date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.status !== 'done' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          className="p-1.5 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Mark as done"
                        >
                          <CheckSquare size={16} />
                        </button>
                      )}
                      <button className="text-zinc-500 hover:text-zinc-300"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function LectureTracker({ lectures, onAddLecture, onMarkAttendance }: { lectures: Lecture[], onAddLecture: () => void, onMarkAttendance: (id: number, status: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Lecture Tracker</h1>
          <p className="text-zinc-500 text-sm">Track your attendance and syllabus progress.</p>
        </div>
        <button 
          onClick={onAddLecture}
          className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.length > 0 ? lectures.map((lecture) => (
          <Card key={lecture.id} className="group hover:border-brand-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <BookOpen size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Status</p>
                <p className={cn(
                  "text-lg font-bold",
                  lecture.attendance_status === 'present' ? "text-emerald-500" : 
                  lecture.attendance_status === 'absent' ? "text-rose-500" : "text-amber-500"
                )}>
                  {lecture.attendance_status || 'Pending'}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{lecture.subject}</h3>
            <p className="text-xs text-zinc-500 mb-4">{lecture.topic || 'No topic specified'}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Date</span>
                <span className="font-bold">{lecture.date}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
              <button 
                onClick={() => onMarkAttendance(lecture.id, 'present')}
                className={cn(
                  "flex-1 text-xs font-medium py-2 rounded-lg transition-colors",
                  lecture.attendance_status === 'present' ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
              >
                Present
              </button>
              <button 
                onClick={() => onMarkAttendance(lecture.id, 'absent')}
                className={cn(
                  "flex-1 text-xs font-medium py-2 rounded-lg transition-colors",
                  lecture.attendance_status === 'absent' ? "bg-rose-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
              >
                Absent
              </button>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>No lectures added yet.</p>
            <button onClick={onAddLecture} className="mt-4 text-brand-primary font-medium hover:underline">Add your first lecture</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LectureModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (lecture: any) => void }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ subject, topic, date });
    setSubject('');
    setTopic('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold font-display mb-6">Add New Lecture</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What's being covered?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                >
                  Add Lecture
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FocusMode({ onSessionComplete }: { onSessionComplete: (duration: number, type: string) => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
      onSessionComplete(sessionType === 'work' ? 25 : 5, sessionType);
      
      // Auto switch or alert
      if (sessionType === 'work') {
        alert("Session complete! Take a break.");
        setSessionType('break');
        setTimeLeft(5 * 60);
      } else {
        alert("Break over! Time to focus.");
        setSessionType('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-display tracking-tight mb-2">Focus Mode</h1>
        <p className="text-zinc-500">Distraction-free environment for deep work.</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            onClick={() => { setSessionType('work'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", sessionType === 'work' ? "bg-brand-primary text-white" : "bg-zinc-800 text-zinc-400")}
          >
            Work Session
          </button>
          <button 
            onClick={() => { setSessionType('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", sessionType === 'break' ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400")}
          >
            Short Break
          </button>
        </div>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="140"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={880}
            animate={{ strokeDashoffset: 880 - (880 * progress) / 100 }}
            className={sessionType === 'work' ? "text-brand-primary" : "text-emerald-500"}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold font-display tabular-nums">{formatTime(timeLeft)}</span>
          <span className="text-sm text-zinc-500 uppercase tracking-widest mt-2">
            {sessionType === 'work' ? 'Focusing' : 'Resting'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
            isActive ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-brand-primary text-white hover:bg-brand-primary/90"
          )}
        >
          {isActive ? <Timer size={32} /> : <Timer size={32} />}
        </button>
        <button 
          onClick={() => { setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60); setIsActive(false); }}
          className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <Plus size={24} className="rotate-45" />
        </button>
      </div>
    </div>
  );
}

function TaskModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (task: Omit<Task, 'id'>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      description,
      priority,
      status: 'todo',
      due_date: dueDate
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold font-display mb-6">Create New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello Darshan! I'm your Productivity OS Assistant. How can I help you optimize your schedule today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: {} })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] flex flex-col glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="font-bold font-display">AI Productivity Assistant</h2>
          <p className="text-xs text-zinc-500">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm",
              msg.role === 'user' 
                ? "bg-brand-primary text-white" 
                : "bg-zinc-800/50 text-zinc-100 border border-zinc-800"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 p-4 rounded-2xl flex gap-1">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your productivity..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button 
            onClick={handleSend}
            className="bg-brand-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
