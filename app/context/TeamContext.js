"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TEAM } from '../data/team';

const TeamContext = createContext();

export function TeamProvider({ children }) {
    const [members, setMembers] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('agency_team');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Schema migration: if old data doesn't have roleType, reset to INITIAL_TEAM
                if (parsed.length > 0 && !parsed[0].roleType) {
                    return INITIAL_TEAM;
                }
                return parsed;
            }
        }
        return INITIAL_TEAM;
    });

    const [currentUserId, setCurrentUserId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('agency_auth_token') || null;
        }
        return null;
    });

    // Persistence and Cross-Tab Sync for Team Data
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'agency_team' && e.newValue) {
                setMembers(JSON.parse(e.newValue));
            }
            if (e.key === 'agency_auth_token') {
                setCurrentUserId(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('agency_team', JSON.stringify(members));
        }
    }, [members]);

    const login = (email, password) => {
        // Hardcoded generic password for all test accounts
        if (password !== 'admin123') {
            return { success: false, error: 'Invalid password. Hint: admin123' };
        }

        const member = members.find(m => m.email.toLowerCase() === email.toLowerCase());
        if (member) {
            setCurrentUserId(member.id);
            if (typeof window !== 'undefined') {
                localStorage.setItem('agency_auth_token', member.id);
            }
            return { success: true };
        }
        return { success: false, error: 'User not found' };
    };

    const logout = () => {
        setCurrentUserId(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('agency_auth_token');
        }
    };

    const addMember = (member) => {
        const newMember = {
            type: 'agency', // Default to agency
            ...member,
            id: Date.now().toString(),
            status: 'Active',
            avatar: (member.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };
        setMembers(prev => [...prev, newMember]);
    };

    const updateMember = (id, updates) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const deleteMember = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const getMemberById = (id) => members.find(m => m.id === id);

    const getClientTeam = (clientId) => {
        return members.filter(m => m.type === 'client' && m.clientId === clientId);
    };

    const getAgencyTeam = () => {
        return members.filter(m => m.type === 'agency');
    };

    const currentUser = currentUserId ? members.find(m => m.id === currentUserId) : null;

    const getAssignableMembers = () => {
        if (!currentUser) return [];
        if (currentUser.roleType === 'super_admin') {
            return members.filter(m => m.type === 'agency');
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
            login,
            logout,
            setCurrentUserId, // keep for internal testing if needed
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
