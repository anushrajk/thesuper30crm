"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TeamContext = createContext();

export function TeamProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial session check and listener
    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                setCurrentUser(null);
                setIsLoading(false);
            }
        });

        // Also fetch all team members for context
        fetchTeam();

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (user) => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If profile doesn't exist, we might want to create a default one
                // For now, just set basic info from auth
                setCurrentUser({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email.split('@')[0],
                    roleType: 'editor' // default
                });
            } else {
                setCurrentUser(data);
            }
        } catch (err) {
            console.error('Profile fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeam = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        
        if (!error && data) {
            setMembers(data);
        }
    };

    const sendOtp = async (email, options = {}) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
                ...options
            }
        });

        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    const verifyOtp = async (email, token) => {
        // Try 'email' type (for existing users)
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error) {
            // Try 'signup' type (for new users)
            const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup'
            });
            
            if (error2) {
                // Try 'magiclink' just in case
                const { data: data3, error: error3 } = await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: 'magiclink'
                });
                if (error3) return { success: false, error: error3.message };
            }
        }
        
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    // Database Actions
    const addMember = async (member) => {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ ...member, created_at: new Date() }])
            .select();
        
        if (!error && data) {
            setMembers(prev => [...prev, ...data]);
        }
    };

    const updateMember = async (id, updates) => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);
        
        if (!error) {
            setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
            if (currentUser?.id === id) {
                setCurrentUser(prev => ({ ...prev, ...updates }));
            }
        }
    };

    const deleteMember = async (id) => {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setMembers(prev => prev.filter(m => m.id !== id));
        }
    };

    const getMemberById = (id) => members.find(m => m.id === id);

    const getClientTeam = (clientId) => {
        return members.filter(m => m.type === 'client' && m.clientId === clientId);
    };

    const getAgencyTeam = () => {
        return members;
    };

    const getAssignableMembers = () => {
        if (!currentUser) return [];
        if (currentUser.roleType === 'super_admin') {
            return members;
        } else if (currentUser.roleType === 'admin') {
            return members.filter(m => m.id === currentUser.id || m.reportsTo === currentUser.id);
        } else {
            return [currentUser];
        }
    };

    return (
        <TeamContext.Provider value={{
            members,
            currentUser,
            isLoading,
            sendOtp,
            verifyOtp,
            logout,
            getAssignableMembers,
            addMember,
            updateMember,
            deleteMember,
            getMemberById,
            getClientTeam,
            getAgencyTeam
        }}>
            {children}
        </TeamContext.Provider>
    );
}

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        return {
            members: [],
            currentUser: null,
            login: () => { },
            logout: () => { },
            setCurrentUserId: () => {},
            getAssignableMembers: () => [],
            addMember: () => { },
            updateMember: () => { },
            deleteMember: () => { },
            getMemberById: () => null,
            getClientTeam: () => [],
            getAgencyTeam: () => []
        };
    }
    return context;
};
