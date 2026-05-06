"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TaskContext = createContext();

const mapTask = (t) => ({
    ...t,
    clientId: t.client_id,
    assigneeId: t.assignee_id,
    dueDate: t.due_date,
    completionDate: t.completion_date,
    createdAt: t.created_at
});

const unmapTask = (t) => {
    const out = { ...t };
    if (t.clientId !== undefined) out.client_id = t.clientId;
    if (t.assigneeId !== undefined) out.assignee_id = t.assigneeId;
    if (t.dueDate !== undefined) out.due_date = t.dueDate;
    if (t.completionDate !== undefined) out.completion_date = t.completionDate;
    if (t.createdAt !== undefined) out.created_at = t.createdAt;
    
    // Remove the camelCase ones to avoid double data
    delete out.clientId;
    delete out.assigneeId;
    delete out.dueDate;
    delete out.completionDate;
    delete out.createdAt;
    return out;
};

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        fetchTasks();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, mapTask(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? mapTask(payload.new) : t));
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setTasks(data.map(mapTask));
        }
        setIsLoading(false);
    };

    // Data Accessors
    const getAllTasks = () => tasks;
    const getClientTasks = (clientId) => tasks.filter(t => t.clientId === clientId);
    const getTodayTasks = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return tasks.filter(task => {
            if (task.status === 'done') return task.dueDate === todayStr;
            return task.dueDate <= todayStr;
        });
    };

    const getSelectedTask = () => tasks.find(t => t.id === selectedTaskId);

    // Actions
    const addTask = async (taskData) => {
        const dbTask = unmapTask(taskData);
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                ...dbTask,
                status: taskData.status || 'todo',
                priority: taskData.priority || 'medium',
                created_at: new Date()
            }])
            .select();

        if (error) {
            console.error('Error adding task:', error);
            return null;
        }

        return mapTask(data[0]);
    };

    const updateTask = async (taskId, updates) => {
        // Optimistic update
        const mappedUpdates = updates; // they are already camelCase from UI
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...mappedUpdates } : t));

        const dbUpdates = unmapTask(updates);
        const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', taskId);

        if (error) {
            console.error('Error updating task:', error);
            fetchTasks();
        }
    };

    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
        }
    };

    const addNotification = (title, message, type = 'info', userId = null) => {
        const newNotif = {
            id: Date.now(),
            title,
            message,
            type,
            userId,
            read: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const openTask = (id) => setSelectedTaskId(id);
    const closeTask = () => setSelectedTaskId(null);

    const SERVICE_TYPES = [
        { id: 'seo', label: 'SEO' },
        { id: 'smo', label: 'SMO' },
        { id: 'pm', label: 'PM' },
        { id: 'content', label: 'Content' },
        { id: 'design', label: 'Design' },
        { id: 'dev', label: 'Dev' },
        { id: 'other', label: 'Other' }
    ];

    return (
        <TaskContext.Provider value={{
            tasks,
            isLoading,
            selectedTaskId,
            openTask,
            closeTask,
            getSelectedTask,
            getAllTasks,
            getClientTasks,
            getTodayTasks,
            addTask,
            updateTask,
            deleteTask,
            SERVICE_TYPES,
            notifications,
            addNotification,
            markAllNotificationsRead
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        return {
            tasks: [],
            isLoading: true,
            selectedTaskId: null,
            openTask: () => { },
            closeTask: () => { },
            getSelectedTask: () => null,
            getAllTasks: () => [],
            getClientTasks: () => [],
            getTodayTasks: () => [],
            addTask: () => ({ id: 'temp' }),
            updateTask: () => { },
            deleteTask: () => { },
            SERVICE_TYPES: []
        };
    }
    return context;
}
