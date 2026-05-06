"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TASKS } from '../data/tasks';

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    
    // Initialize tasks from localStorage or fall back to mock data
    const [tasks, setTasks] = useState(() => {
        let initialTasks = INITIAL_TASKS;
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('molten_tasks');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Migrate legacy fields to 'notes'
                    return parsed.map(t => ({
                        ...t,
                        notes: t.notes || (t.description ? `${t.description}${t.remarks ? `\n\nRemarks: ${t.remarks}` : ''}` : t.remarks || '')
                    }));
                }
            } catch (error) {
                console.error('Error parsing task data from localStorage:', error);
            }
        }
        return initialTasks.map(t => ({
            ...t,
            notes: t.notes || (t.description ? `${t.description}${t.remarks ? `\n\nRemarks: ${t.remarks}` : ''}` : t.remarks || '')
        }));
    });

    // Persist to localStorage whenever tasks change
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'molten_tasks' && e.newValue) {
                try {
                    setTasks(JSON.parse(e.newValue));
                } catch (error) {
                    console.error('Error parsing updated task data from storage event:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('molten_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Data Accessors

    // Get all tasks (useful for debug or admin)
    const getAllTasks = () => tasks;

    // Get tasks for a specific client
    const getClientTasks = (clientId) => {
        return tasks.filter(task => task.clientId === clientId);
    };

    // Get "Today's" tasks
    // Logic: Due Date is Today OR Status is 'in-progress' (optional) OR manually flagged
    // For this agency model: We show everything "To Do" or "In Progress" that is due today or overdue, 
    // OR any task specifically moved to "Today" status in a Kanban flow if we implement that.
    // However, the prompt says "Drag-and-drop enabled... Only tasks scheduled for today appear here".
    // AND "Today's Focus" has columns: To Do, In Progress, Done.
    // So "Today's Focus" is a VIEW of tasks that are relevant for today.

    // We will treat "Today" as tasks that match the date OR are manually set to show in Today view.
    // For simplicity V1: We filter by a 'isToday' flag or date match.
    // But the prompt implies "Today's Focus" is a specific board.
    // Let's assume we filter by dueDate === today OR status changes made today.

    // Actually, looking at the previous 'Today' page, it had 'Today', 'Waiting', 'Done' columns.
    // The master prompt says 'To Do', 'In Progress', 'Done'.
    // Let's stick to the Master Prompt columns for the "Today Board".

    const getTodayTasks = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return tasks.filter(task => {
            // Task is for today if:
            // 1. Due date is today
            // 2. OR it was explicitly added to Today's pile (we might need a flag for this)
            // 3. Status is 'in-progress' usually implies it's being worked on.

            // For now, let's include anything with dueDate <= todayStr AND status != 'done'
            // PLUS anything recently marked done today.
            if (task.status === 'done') {
                // Ideally filter done tasks to show only those completed today, but for now show all done today
                return task.dueDate === todayStr;
            }
            return task.dueDate <= todayStr;
        });
    };

    // Actions

    const addNotification = (title, message, type = 'info', userId = null) => {
        const newNotif = {
            id: Date.now(),
            title,
            message,
            type,
            userId, // Targeted notification
            read: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const addTask = (taskData) => {
        const newTask = {
            id: `t-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'todo', // Default
            priority: 'medium', // Default
            ...taskData
        };
        setTasks(prev => [...prev, newTask]);

        // Notify if assigned to someone
        if (newTask.assigneeId) {
            addNotification('New Task Assigned', `Task: ${newTask.title}`, 'task', newTask.assigneeId);
        }

        return newTask;
    };

    const insertTaskAfter = (precedingTaskId, taskData) => {
        const newTask = {
            id: `t-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'todo',
            priority: 'medium',
            ...taskData
        };
        setTasks(prev => {
            const index = prev.findIndex(t => t.id === precedingTaskId);
            if (index === -1) return [...prev, newTask];
            const newTasks = [...prev];
            newTasks.splice(index + 1, 0, newTask);
            return newTasks;
        });
        return newTask;
    };

    const updateTask = (taskId, updates) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    const deleteTask = (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // ... existing initialization ...

    const openTask = (id) => setSelectedTaskId(id);
    const closeTask = () => setSelectedTaskId(null);

    // Data Accessors include getSelectedTask
    const getSelectedTask = () => tasks.find(t => t.id === selectedTaskId);

    const SERVICE_TYPES = [
        { id: 'seo', label: 'SEO' },
        { id: 'smo', label: 'SMO' },
        { id: 'pm', label: 'PM' },
        { id: 'content', label: 'Content' },
        { id: 'design', label: 'Design' },
        { id: 'dev', label: 'Dev' },
        { id: 'other', label: 'Other' }
    ];

    const value = {
        tasks,
        selectedTaskId,
        openTask,
        closeTask,
        getSelectedTask,
        getAllTasks,
        getClientTasks,
        getTodayTasks,
        addTask,
        insertTaskAfter,
        updateTask,
        deleteTask,
        SERVICE_TYPES,
        notifications,
        addNotification,
        markAllNotificationsRead
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        return {
            tasks: [],
            selectedTaskId: null,
            openTask: () => { },
            closeTask: () => { },
            getSelectedTask: () => null,
            getAllTasks: () => [],
            getClientTasks: () => [],
            getTodayTasks: () => [],
            addTask: () => ({ id: 'temp' }),
            insertTaskAfter: () => ({ id: 'temp' }),
            updateTask: () => { },
            deleteTask: () => { },
            SERVICE_TYPES: []
        };
    }
    return context;
}
