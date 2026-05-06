"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ClientContext = createContext();

const mapClient = (c) => ({
    ...c,
    ownerId: c.owner_id,
    createdAt: c.created_at
});

const unmapClient = (c) => {
    const out = { ...c };
    if (c.ownerId !== undefined) out.owner_id = c.ownerId;
    if (c.createdAt !== undefined) out.created_at = c.createdAt;
    delete out.ownerId;
    delete out.createdAt;
    return out;
};

export function ClientProvider({ children }) {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        fetchClients();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:clients')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setClients(prev => [...prev, mapClient(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setClients(prev => prev.map(c => c.id === payload.new.id ? mapClient(payload.new) : c));
                } else if (payload.eventType === 'DELETE') {
                    setClients(prev => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchClients = async () => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setClients(data.map(mapClient));
        }
        setIsLoading(false);
    };

    const addClient = async (clientData) => {
        const dbClient = unmapClient(clientData);
        const { data, error } = await supabase
            .from('clients')
            .insert([{
                ...dbClient,
                stage: clientData.stage || 'inquiry',
                created_at: new Date()
            }])
            .select();

        if (error) {
            console.error('Error adding client:', error);
            return null;
        }
        return mapClient(data[0]);
    };

    const updateClient = async (id, updates) => {
        // Optimistic update
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        const dbUpdates = unmapClient(updates);
        const { error } = await supabase
            .from('clients')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating client:', error);
            fetchClients();
        }
    };

    const deleteClient = async (id) => {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
        }
    };

    const getClientById = (id) => clients.find(c => c.id === id);

    return (
        <ClientContext.Provider value={{
            clients,
            isLoading,
            addClient,
            updateClient,
            deleteClient,
            getClientById
        }}>
            {children}
        </ClientContext.Provider>
    );
}

export const useClients = () => {
    const context = useContext(ClientContext);
    if (!context) {
        return {
            clients: [],
            isLoading: true,
            addClient: () => {},
            updateClient: () => {},
            deleteClient: () => {},
            getClientById: () => null
        };
    }
    return context;
};
