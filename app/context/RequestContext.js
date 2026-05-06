"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTasks } from './TaskContext';
import { useTeam } from './TeamContext';
import { useClients } from './ClientContext';

const RequestContext = createContext();

const mapRequest = (r) => ({
    ...r,
    clientId: r.client_id,
    createdAt: r.created_at
});

const unmapRequest = (r) => {
    const out = { ...r };
    if (r.clientId !== undefined) out.client_id = r.clientId;
    if (r.createdAt !== undefined) out.created_at = r.createdAt;
    delete out.clientId;
    delete out.createdAt;
    return out;
};

export function RequestProvider({ children }) {
    const { addTask } = useTasks();
    const { members } = useTeam();
    const { getClientById } = useClients();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        fetchRequests();

        const channel = supabase
            .channel('public:requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setRequests(prev => [...prev, mapRequest(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setRequests(prev => prev.map(r => r.id === payload.new.id ? mapRequest(payload.new) : r));
                } else if (payload.eventType === 'DELETE') {
                    setRequests(prev => prev.filter(r => r.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setRequests(data.map(mapRequest));
        }
        setIsLoading(false);
    };

    const addRequest = async (requestData) => {
        const dbRequest = unmapRequest(requestData);
        const { data, error } = await supabase
            .from('requests')
            .insert([{
                ...dbRequest,
                status: 'Pending',
                created_at: new Date()
            }])
            .select();

        if (error) {
            console.error('Error adding request:', error);
            return null;
        }
        return mapRequest(data[0]);
    };

    const updateRequest = async (requestId, updates) => {
        // Optimistic update
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r));

        const dbUpdates = unmapRequest(updates);
        const { error } = await supabase
            .from('requests')
            .update(dbUpdates)
            .eq('id', requestId);

        if (error) {
            console.error('Error updating request:', error);
            fetchRequests();
        }
    };

    const approveRequest = async (requestId, agencyMemberId) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const member = members.find(m => m.id === agencyMemberId);
        if (!member) return;

        const client = getClientById(request.clientId);

        // Create Agency Task
        await addTask({
            title: request.title,
            clientId: request.clientId,
            clientName: client ? client.name : 'Unknown Client',
            status: 'todo',
            priority: request.priority || 'medium',
            assignee: member.name,
            assigneeId: member.id,
            taskType: request.type || 'New Work',
            notes: request.details,
            dueDate: new Date().toISOString().split('T')[0]
        });

        // Update Request Status
        await updateRequest(requestId, { status: 'Approved' });
    };

    const rejectRequest = async (requestId, reason) => {
        await updateRequest(requestId, { status: 'Rejected', rejectionReason: reason });
    };

    const getClientRequests = (clientId) => {
        return requests.filter(r => r.clientId === clientId);
    };

    return (
        <RequestContext.Provider value={{
            requests,
            isLoading,
            addRequest,
            updateRequest,
            approveRequest,
            rejectRequest,
            getClientRequests
        }}>
            {children}
        </RequestContext.Provider>
    );
}

export function useRequests() {
    const context = useContext(RequestContext);
    if (!context) {
        return {
            requests: [],
            isLoading: true,
            addRequest: () => {},
            updateRequest: () => {},
            approveRequest: () => {},
            rejectRequest: () => {},
            getClientRequests: () => []
        };
    }
    return context;
}
