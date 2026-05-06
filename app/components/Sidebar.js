"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Calendar, ListTodo, Settings, Megaphone, Users, Bell, Plus, CheckCircle2, Circle, X, FilePlus, LogOut } from 'lucide-react';
import { useReminders } from '../context/ReminderContext';
import { useTeam } from '../context/TeamContext';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const { reminders, addReminder, toggleReminder, deleteReminder } = useReminders();
    const { currentUser, logout } = useTeam();
    const [newReminderText, setNewReminderText] = useState('');

    const isActive = (path) => pathname === path;
    const userRole = currentUser?.roleType || 'editor';

    const navItems = [
        { href: '/', icon: LayoutDashboard, label: 'Pipeline', roles: ['super_admin'] },
        { href: '/directory', icon: Briefcase, label: 'Active Clients', roles: ['super_admin', 'admin', 'editor'] },
        { href: '/team', icon: Users, label: 'Team', roles: ['super_admin'] },
        { href: '/tasks', icon: ListTodo, label: 'Tasks', roles: ['super_admin', 'admin', 'editor'] },
        { href: '/requests', icon: FilePlus, label: 'Requests', roles: ['super_admin', 'admin'] },
        { href: '/campaigns', icon: Megaphone, label: 'Campaigns', roles: ['super_admin', 'admin'] },
        { href: '/today', icon: Calendar, label: 'Today', roles: ['super_admin', 'admin', 'editor'] },
    ].filter(item => item.roles.includes(userRole));

    const handleAddReminder = (e) => {
        if (e.key === 'Enter' && newReminderText.trim()) {
            addReminder(newReminderText.trim());
            setNewReminderText('');
        }
    };

    return (
        <aside style={{ width: '280px', background: '#ffffff', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px', height: '100vh', overflow: 'hidden' }}>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://www.thesuper30.ai/assets/super30-new-logo-qQg26tml.png" alt="Super30 Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', padding: '0 12px' }}>MAIN MENU</div>
                {navItems.map(item => (
                    <Link href={item.href} key={item.href}>
                        <div style={{
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: isActive(item.href) ? 'var(--accent-primary)' : '#666',
                            background: isActive(item.href) ? '#fffbeb' : 'transparent',
                            borderRadius: '10px',
                            fontWeight: isActive(item.href) ? '700' : '500',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}>
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    </Link>
                ))}

                {/* Reminders Section */}
                <div style={{ marginTop: '32px', padding: '0 12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>REMINDERS</span>
                        <Bell size={12} />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <Plus size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Quick reminder..."
                            value={newReminderText}
                            onChange={e => setNewReminderText(e.target.value)}
                            onKeyDown={handleAddReminder}
                            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.85rem', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {reminders.map(rem => (
                            <div key={rem.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', group: 'true' }}>
                                <div onClick={() => toggleReminder(rem.id)} style={{ cursor: 'pointer', color: rem.isDone ? '#10b981' : '#ddd' }}>
                                    {rem.isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.85rem', color: rem.isDone ? '#aaa' : '#333', textDecoration: rem.isDone ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {rem.text}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#bbb' }}>{rem.time}</div>
                                </div>
                                <X size={14} onClick={() => deleteReminder(rem.id)} style={{ cursor: 'pointer', color: '#eee', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <Link href="/settings">
                        <div style={{
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: isActive('/settings') ? 'var(--accent-primary)' : '#666',
                            background: isActive('/settings') ? '#fffbeb' : 'transparent',
                            borderRadius: '10px',
                            fontWeight: isActive('/settings') ? '700' : '500',
                            cursor: 'pointer',
                            marginBottom: '4px'
                        }}>
                            <Settings size={18} />
                            <span>Settings</span>
                        </div>
                    </Link>
                    <div onClick={logout} style={{
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#ef4444',
                        background: 'transparent',
                        borderRadius: '10px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
