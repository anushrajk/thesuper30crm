"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTasks } from '../context/TaskContext';
import { useTeam } from '../context/TeamContext';
import { useClients } from '../context/ClientContext';
import { TASK_STATUSES } from '../data/tasks';
import { CheckCircle2, Clock, Circle, UserPlus, AlertCircle, Plus, X, ListTodo, Filter, Bell, Search, User, Globe, Trash2, Edit2 } from 'lucide-react';
import TaskDetailPanel from '../components/TaskDetailPanel';

export default function TasksPage() {
    const { tasks, updateTask, addTask, deleteTask, SERVICE_TYPES, notifications, markAllNotificationsRead, addNotification } = useTasks();
    const { members, currentUser, getAssignableMembers } = useTeam();
    const { clients } = useClients();

    const isEditor = currentUser?.roleType === 'editor';
    const canManage = currentUser?.roleType === 'super_admin' || currentUser?.roleType === 'admin';
    const assignableMembers = getAssignableMembers();

    const [showNewTask, setShowNewTask] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [clientFilter, setClientFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');
    
    const [newTask, setNewTask] = useState({ title: '', assigneeId: '', priority: 'medium', dueDate: '', service: 'seo', notes: '', clientId: '' });
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [viewingTask, setViewingTask] = useState(null);

    const unreadCount = (notifications || []).filter(n => !n.read && (!n.userId || n.userId === currentUser?.id)).length;
    const userNotifications = (notifications || []).filter(n => !n.userId || n.userId === currentUser?.id);

    const handleCreateTask = (e) => {
        e.preventDefault();
        const member = members.find(m => m.id === newTask.assigneeId);
        
        // Auto-link to filtered client if "all" is not selected
        const targetClientId = newTask.clientId || (clientFilter !== 'all' ? clientFilter : '');
        const targetClient = clients.find(c => c.id === targetClientId);

        addTask({
            ...newTask,
            clientId: targetClientId,
            clientName: targetClient?.name || '',
            assignee: member?.name || 'Unassigned',
            status: 'todo',
        });
        setNewTask({ title: '', assigneeId: '', priority: 'medium', dueDate: '', service: 'seo', notes: '', clientId: '' });
        setShowNewTask(false);
    };

    // Filter tasks based on role and active filters
    const filteredTasks = (tasks || []).filter(task => {
        if (!currentUser) return false;
        
        // Find member assigned to this task
        const assignedMember = members.find(m => m.name.includes(task.assignee) || m.id === task.assigneeId);
        const assignedId = assignedMember ? assignedMember.id : null;

        // 1. Role-based filtering
        let isVisible = false;
        if (currentUser.roleType === 'super_admin') isVisible = true;
        else if (currentUser.roleType === 'admin') {
            if (assignedId === currentUser.id) isVisible = true;
            else {
                const reportingMember = members.find(m => m.id === assignedId);
                if (reportingMember && reportingMember.reportsTo === currentUser.id) isVisible = true;
            }
        } else {
            isVisible = assignedId === currentUser.id;
        }

        if (!isVisible) return false;

        // 2. Tab/Filter filtering
        if (clientFilter !== 'all' && task.clientId !== clientFilter) return false;
        if (memberFilter !== 'all' && assignedId !== memberFilter) return false;

        return true;
    });

    const handleAssign = (taskId, memberId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!memberId) {
            updateTask(taskId, { assignee: 'Unassigned', assigneeId: null });
            return;
        }
        const member = members.find(m => m.id === memberId);
        if (member) {
            updateTask(taskId, { assignee: member.name, assigneeId: member.id });
            addNotification('Task Assigned', `You've been assigned: ${task?.title}`, 'task', member.id);
        }
    };

    const handleUpdate = (taskId, field, value) => {
        updateTask(taskId, { [field]: value });
    };

    const handleRemoveTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
            deleteTask(taskId);
            setSelectedTasks(prev => prev.filter(id => id !== taskId));
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedTasks.length} tasks? This cannot be undone.`)) {
            selectedTasks.forEach(id => deleteTask(id));
            setSelectedTasks([]);
        }
    };

    const toggleSelect = (taskId) => {
        setSelectedTasks(prev => 
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedTasks.length === filteredTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(filteredTasks.map(t => t.id));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done': return <CheckCircle2 size={16} color="#10b981" />;
            case 'in-progress': return <Clock size={16} color="#f59e0b" />;
            case 'waiting-on-client': return <AlertCircle size={16} color="#6366f1" />;
            default: return <Circle size={16} color="#9ca3af" />;
        }
    };

    const getStatusBadge = (status) => {
        const s = TASK_STATUSES.find(x => x.id === status);
        const label = s ? s.label : status;
        let bg = '#f3f4f6', color = '#4b5563';
        if (status === 'done') { bg = '#d1fae5'; color = '#065f46'; }
        if (status === 'in-progress') { bg = '#fef3c7'; color = '#92400e'; }
        if (status === 'waiting-on-client') { bg = '#e0e7ff'; color = '#3730a3'; }

        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: bg, color: color, fontSize: '0.8rem', fontWeight: '600' }}>
                {getStatusIcon(status)}
                {label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        let bg = '#f3f4f6', color = '#4b5563';
        if (priority === 'high') { bg = '#fee2e2'; color = '#b91c1c'; }
        if (priority === 'medium') { bg = '#fef3c7'; color = '#92400e'; }
        if (priority === 'low') { bg = '#d1fae5'; color = '#065f46'; }

        return (
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', background: bg, color: color, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {priority}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc' }}>
            <Sidebar />

            {/* New Task Modal */}
            {showNewTask && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowNewTask(false)}>
                    <div style={{ background: 'white', width: '520px', borderRadius: '20px', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Assign New Task</h2>
                            <button onClick={() => setShowNewTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>TASK TITLE *</label>
                                <input required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Write 5 blog posts for TechFlow" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>ASSIGN TO *</label>
                                    <select required value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none' }}>
                                        <option value="">— Select Member —</option>
                                        {assignableMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.roleType})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>PRIORITY</label>
                                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none' }}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>DUE DATE</label>
                                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>SERVICE TYPE</label>
                                    <select 
                                        value={newTask.service} 
                                        onChange={e => setNewTask({ ...newTask, service: e.target.value })} 
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none' }}
                                    >
                                        {SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>CLIENT *</label>
                                <select required value={newTask.clientId || (clientFilter !== 'all' ? clientFilter : '')} onChange={e => setNewTask({ ...newTask, clientId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem', outline: 'none' }}>
                                    <option value="">— Select Client —</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>DESCRIPTION / NOTES</label>
                                <textarea value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })} placeholder="Task details & remarks..." rows={2} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
                            </div>
                            <button type="submit" style={{ marginTop: '8px', padding: '14px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>Assign Task</button>
                        </form>
                    </div>
                </div>
            )}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Premium Header */}
                <header style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    {/* Header Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '12px' }}>
                            <ListTodo size={24} color="#0f172a" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Mission Control</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '2px 0 0 0' }}>{filteredTasks.length} active tasks • Role: {currentUser?.roleType}</p>
                        </div>
                    </div>

                    {/* Header Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => { setShowNotifications(!showNotifications); markAllNotificationsRead(); }}
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', cursor: 'pointer', position: 'relative', display: 'flex' }}
                            >
                                <Bell size={20} color="#64748b" />
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', border: '2px solid white' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Notifications</h4>
                                        <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: '700', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Close</span>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {userNotifications.length === 0 ? (
                                            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No notifications yet</div>
                                        ) : (
                                            userNotifications.map(n => (
                                                <div key={n.id} style={{ padding: '16px', borderBottom: '1px solid #f8fafc', background: n.read ? 'white' : '#f0f7ff' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '2px' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {canManage && (
                            <button
                                onClick={() => setShowNewTask(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                <Plus size={18} /> Assign Task
                            </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentUser?.color || '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                {currentUser?.avatar}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>{currentUser?.name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentUser?.roleType?.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Filters Row */}
                {!isEditor && (
                    <div style={{ padding: '0 40px', marginTop: '24px', display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                            {/* Client Filter */}
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px' }}>
                                <Globe size={16} color="#94a3b8" />
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' }}>FILTER BY CLIENT</span>
                                    <select 
                                        value={clientFilter} 
                                        onChange={e => setClientFilter(e.target.value)}
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', width: '100%', background: 'transparent' }}
                                    >
                                        <option value="all">All Clients</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Member Filter */}
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px' }}>
                                <User size={16} color="#94a3b8" />
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em' }}>FILTER BY MEMBER</span>
                                    <select 
                                        value={memberFilter} 
                                        onChange={e => setMemberFilter(e.target.value)}
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', width: '100%', background: 'transparent' }}
                                    >
                                        <option value="all">Everyone</option>
                                        {assignableMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar Placeholder */}
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', width: '300px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input placeholder="Search tasks..." style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: '100%' }} />
                        </div>
                    </div>
                )}

                {/* Bulk Actions Bar */}
                {selectedTasks.length > 0 && canManage && (
                    <div style={{ padding: '0 40px', marginBottom: '16px' }}>
                        <div style={{ background: '#1a1a1a', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedTasks.length} tasks selected</span>
                                <button onClick={() => setSelectedTasks([])} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Clear Selection</button>
                            </div>
                            <button 
                                onClick={handleBulkDelete}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                <Trash2 size={16} /> Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Data Grid Container */}
                <div style={{ flex: 1, overflow: 'auto', padding: isEditor ? '32px 40px' : '20px 40px 32px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    {canManage && (
                                        <th style={{ padding: '16px 24px', width: '40px', borderRight: '1px solid #f1f5f9' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0} 
                                                onChange={toggleSelectAll}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                        </th>
                                    )}
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Task Detail</th>
                                    {!isEditor && <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Assigned To</th>}
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Timeline</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Priority</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Status</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid #f1f5f9' }}>Remarks</th>
                                    {canManage && <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => {
                                    const currentAssignee = members.find(m => m.id === task.assigneeId || (task.assignee && m.name.includes(task.assignee)));

                                    return (
                                        <tr key={task.id} style={{ 
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background-color 0.2s ease',
                                            background: selectedTasks.includes(task.id) ? '#f0f7ff' : 'transparent'
                                        }}>
                                            {canManage && (
                                                <td style={{ padding: '20px 24px', borderRight: '1px solid #f1f5f9' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedTasks.includes(task.id)} 
                                                        onChange={() => toggleSelect(task.id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                </td>
                                            )}
                                            {/* Task Detail */}
                                            <td style={{ padding: '20px 24px', maxWidth: '300px' }}>
                                                <div 
                                                    onClick={() => setViewingTask(task)}
                                                    style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px', cursor: 'pointer', transition: 'color 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#0f172a'}
                                                >
                                                    {task.title}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontWeight: '500' }}>{task.service || 'General'}</span>
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.notes || 'No notes'}</span>
                                                </div>
                                            </td>

                                            {/* Assigned To */}
                                            {!isEditor && (
                                                <td style={{ padding: '20px 24px' }}>
                                                    {canManage ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                                                            {currentAssignee ? (
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: currentAssignee.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                                    {currentAssignee.avatar}
                                                                </div>
                                                            ) : (
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <UserPlus size={12} />
                                                                </div>
                                                            )}
                                                            <select 
                                                                value={task.assigneeId || currentAssignee?.id || ''}
                                                                onChange={(e) => handleAssign(task.id, e.target.value)}
                                                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: '500', color: '#334155', cursor: 'pointer', appearance: 'none', paddingRight: '16px' }}
                                                            >
                                                                <option value="">Unassigned</option>
                                                                {assignableMembers.map(m => (
                                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentAssignee?.color || '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                                {currentAssignee?.avatar || '?'}
                                                            </div>
                                                            <span style={{ fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>{task.assignee || 'Unassigned'}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            )}

                                            {/* Timeline */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px' }}>DUE</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{task.dueDate || 'No Date'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px' }}>DONE</span>
                                                        <input 
                                                            type="date"
                                                            value={task.completionDate || ''}
                                                            onChange={(e) => handleUpdate(task.id, 'completionDate', e.target.value)}
                                                            style={{ padding: '2px 6px', border: '1px solid transparent', borderRadius: '4px', fontSize: '0.85rem', color: '#334155', outline: 'none', background: task.completionDate ? '#f1f5f9' : 'transparent', transition: 'border 0.2s' }}
                                                            title="Set Completion Date"
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td style={{ padding: '20px 24px' }}>
                                                {getPriorityBadge(task.priority)}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <select 
                                                    value={task.status}
                                                    onChange={(e) => handleUpdate(task.id, 'status', e.target.value)}
                                                    style={{ 
                                                        padding: '6px 0', 
                                                        border: 'none', 
                                                        background: 'transparent', 
                                                        outline: 'none', 
                                                        fontSize: '0.9rem', 
                                                        fontWeight: '600', 
                                                        color: '#0f172a',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {TASK_STATUSES.map(s => (
                                                        <option key={s.id} value={s.id}>{s.label}</option>
                                                    ))}
                                                </select>
                                                <div style={{ marginTop: '4px' }}>
                                                    {getStatusBadge(task.status)}
                                                </div>
                                            </td>

                                            {/* Remarks (Notes) */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <textarea 
                                                    value={task.notes || ''}
                                                    onChange={(e) => handleUpdate(task.id, 'notes', e.target.value)}
                                                    placeholder="Add a remark..."
                                                    rows={2}
                                                    style={{ 
                                                        width: '100%', 
                                                        minWidth: '200px',
                                                        padding: '8px 12px', 
                                                        border: '1px solid #e2e8f0', 
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        color: '#334155',
                                                        resize: 'none',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s, box-shadow 0.2s'
                                                    }}
                                                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 1px #3b82f6'; }}
                                                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                                    <button 
                                                        onClick={() => setViewingTask(task)}
                                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    {canManage && (
                                                        <button 
                                                            onClick={() => handleRemoveTask(task.id)}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredTasks.length === 0 && (
                            <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ListTodo size={32} color="#94a3b8" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600', margin: '0 0 4px 0' }}>All Caught Up</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>There are no tasks currently assigned to you or your team.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Task Detail Slide-over */}
            {viewingTask && (
                <TaskDetailPanel 
                    task={viewingTask} 
                    onClose={() => setViewingTask(null)} 
                />
            )}
        </div>
    );
}
