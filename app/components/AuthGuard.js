"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTeam } from '../context/TeamContext';
import LoginScreen from './LoginScreen';

// Define the Route Access Matrix
const ROLE_ROUTES = {
    super_admin: ['/', '/directory', '/team', '/tasks', '/requests', '/campaigns', '/today', '/settings', '/clients', '/portal'],
    admin: ['/directory', '/tasks', '/requests', '/campaigns', '/today', '/clients', '/portal'],
    editor: ['/directory', '/tasks', '/today', '/clients', '/portal']
};

const DEFAULT_ROUTES = {
    super_admin: '/',
    admin: '/directory',
    editor: '/tasks'
};

export default function AuthGuard({ children }) {
    const { currentUser, isLoading } = useTeam();
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || isLoading || !currentUser) return;

        const role = currentUser.roleType || 'editor'; // fallback
        const allowedRoutes = ROLE_ROUTES[role] || ROLE_ROUTES['editor'];

        // Check if the user has access to the current path
        const hasAccess = allowedRoutes.some(route => {
            if (route === '/') return pathname === '/';
            return pathname.startsWith(route);
        });

        // If the current path is NOT in the allowed routes, redirect them
        if (!hasAccess) {
            router.replace(DEFAULT_ROUTES[role] || '/tasks');
        }
    }, [pathname, currentUser, isMounted, isLoading, router]);

    if (!isMounted || isLoading) {
        return (
            <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '500' }}>Initializing Workspace...</div>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginScreen />;
    }

    const role = currentUser.roleType || 'editor';
    const allowedRoutes = ROLE_ROUTES[role] || ROLE_ROUTES['editor'];
    const hasAccess = allowedRoutes.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });

    // While redirecting, we shouldn't render the forbidden children to prevent flashing restricted data
    if (!hasAccess) {
        return (
            <div style={{ height: '100vh', width: '100vw', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.2rem', fontWeight: '500' }}>
                Loading your workspace...
            </div>
        );
    }

    return <>{children}</>;
}
