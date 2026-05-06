"use client";

import { useState, use } from 'react';
import { ArrowLeft, Plus, DollarSign, ListTodo, Megaphone, Activity, Sparkles, ExternalLink, Key, Copy } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import DocumentsBrowser from '../../components/DocumentsBrowser';
import ClientTaskBoard from '../../components/ClientTaskBoard';
import NoteBoard from '../../components/NoteBoard';
import BillingBoard from '../../components/BillingBoard';
import CampaignBoard from '../../components/CampaignBoard';
import { useClients } from '../../context/ClientContext';
import { useTasks } from '../../context/TaskContext';
import { useCampaigns } from '../../context/CampaignContext';
import { useMessages } from '../../context/MessageContext';
import PortalMessages from '../../components/ClientPortal/PortalMessages';

export default function ClientControlPage({ params }) {
    const { id } = use(params);
    const { getClientById, updateClient } = useClients();
    const { tasks, addTask: createNewTask, SERVICE_TYPES } = useTasks();
    const { campaigns } = useCampaigns();

    const client = getClientById(id);
    const [activeTab, setActiveTab] = useState('Overview');

    if (!client) return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h3>Client not found</h3>
                <Link href="/">Back to Dashboard</Link>
            </div>
        </div>
    );

    const clientTasks = tasks.filter(t => t.clientId === id);
    const pendingTasksCount = clientTasks.filter(t => t.status !== 'done').length;
    const activeCampaignsCount = campaigns.filter(c => c.clientId === id && c.status === 'active').length;

    // Health Logic
    const isAtRisk = clientTasks.some(t => {
        if (t.status === 'done' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    });
    const healthStatus = isAtRisk ? 'At Risk' : (client.health || 'On Track');
    const healthColor = healthStatus === 'At Risk' ? '#ef4444' : (healthStatus === 'Needs Attention' ? '#f59e0b' : '#10b981');

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Overview Cards (Top Section) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                <div onClick={() => setActiveTab('Billing & Profit')} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '8px', color: '#10b981' }}><DollarSign size={20} /></div>
                                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'bold' }}>MONTHLY</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{client.value || '₹0'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Retainer Fee</div>
                                </div>

                                <div onClick={() => setActiveTab('Tasks')} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><ListTodo size={20} /></div>
                                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'bold' }}>PENDING</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{pendingTasksCount}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Open Tasks</div>
                                </div>

                                <div onClick={() => setActiveTab('Campaigns')} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ padding: '8px', background: '#f5f3ff', borderRadius: '8px', color: '#7c3aed' }}><Megaphone size={20} /></div>
                                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'bold' }}>ACTIVE</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>{activeCampaignsCount}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Campaigns</div>
                                </div>

                                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ padding: '8px', background: `${healthColor}15`, borderRadius: '8px', color: healthColor }}><Activity size={20} /></div>
                                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'bold' }}>STATUS</span>
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: healthColor }}>{healthStatus}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Project Health</div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Sparkles size={18} style={{ color: '#f59e0b' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>AI Executive Summary</h3>
                                </div>
                                <p style={{ lineHeight: '1.6', color: '#444' }}>
                                    {client.name} is currently in <strong>{healthStatus}</strong>.
                                    {isAtRisk ? " Overdue tasks detected in the pipeline requiring immediate manager oversight." : " No immediate risks detected, SEO & Paid Ads tracking towards targets."}
                                    Currently managing {pendingTasksCount} open items across {activeCampaignsCount} campaigns.
                                </p>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Client Services Selection */}
                            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Sparkles size={18} style={{ color: '#6366f1' }} />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>ACTIVE SERVICES</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {SERVICE_TYPES.map(service => {
                                        const isSelected = client.services?.includes(service.id);
                                        return (
                                            <div 
                                                key={service.id}
                                                onClick={() => {
                                                    const currentServices = client.services || [];
                                                    const newServices = isSelected 
                                                        ? currentServices.filter(id => id !== service.id)
                                                        : [...currentServices, service.id];
                                                    updateClient(id, { services: newServices });
                                                }}
                                                style={{ 
                                                    padding: '12px 14px', 
                                                    borderRadius: '10px', 
                                                    border: `1.5px solid ${isSelected ? '#1a1a1a' : '#f1f5f9'}`,
                                                    background: isSelected ? '#f8fafc' : 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: isSelected ? '#1a1a1a' : '#94a3b8' }}>{service.label}</span>
                                                <div style={{ 
                                                    width: '18px', 
                                                    height: '18px', 
                                                    borderRadius: '5px', 
                                                    border: `2px solid ${isSelected ? '#1a1a1a' : '#cbd5e1'}`,
                                                    background: isSelected ? '#1a1a1a' : 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '10px'
                                                }}>
                                                    {isSelected && '✓'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '16px', color: '#666' }}>PEOPLE</h3>
                                <div style={{ display: 'flex', gap: '-8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid white' }}>S</div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid white', marginLeft: '-12px' }}>M</div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', marginLeft: '-12px', background: 'white' }}>+</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Billing & Profit':
                return (
                    <BillingBoard client={client} />
                );
            case 'AI Summary':
                return (
                    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', background: '#fff9eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                            <Sparkles size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>AI Executive Summary</h3>
                        <p style={{ maxWidth: '500px', color: '#666', lineHeight: '1.6' }}>
                            Gemini is ready to summarize {client.name}'s progress.
                            <br /><br />
                            Once connected, this module will analyze {clientTasks.length} tasks and {activeCampaignsCount} active campaigns to provide real-time strategic insights and performance predictions.
                        </p>
                        <button style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'not-allowed', opacity: 0.8 }}>Coming Soon</button>
                    </div>
                );
            case 'Documents':
                return (
                    <div style={{ height: 'calc(100vh - 180px)', margin: '-24px' }}>
                        <DocumentsBrowser clientId={id} />
                    </div>
                );

            case 'Tasks':
                return (
                    <div style={{ height: 'calc(100vh - 200px)', margin: '-24px', padding: '24px', overflowX: 'auto', display: 'flex', gap: '24px' }}>
                        <ClientTaskBoard clientId={id} />
                    </div>
                );
            case 'Notes & Meetings':
                return (
                    <NoteBoard clientId={id} />
                );
            case 'Campaigns':
                return (
                    <CampaignBoard client={client} />
                );
            case 'People':
            default:
                return (
                    <div style={{ padding: '100px 40px', textAlign: 'center', color: '#888' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏗️</div>
                        <h3 style={{ fontWeight: '800', color: '#1a1a1a' }}>{activeTab} Module Coming Soon</h3>
                        <p>We're currently building out this section for the Ultra Master vision.</p>
                    </div>
                );
        }
    };

    const handleQuickAddTask = () => {
        createNewTask({
            title: 'New Task',
            clientId: id,
            status: 'todo',
            dueDate: new Date().toISOString().split('T')[0]
        });
        setActiveTab('Tasks');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fcfcfc' }}>
                {/* Header */}
                <header style={{ height: '70px', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/" style={{ padding: '8px', borderRadius: '8px', background: '#f5f5f5', color: '#666', display: 'flex' }}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>{client.name}</h2>
                            <span style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                {client.industry} • <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: healthColor }} /> {healthStatus}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.8rem'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                                <Key size={14} />
                                <span style={{ fontWeight: '700' }}>{client.portalEmail}</span>
                            </div>
                            <div style={{ width: '1px', height: '12px', background: '#cbd5e1' }} />
                            <Link
                                href="/portal/login"
                                target="_blank"
                                style={{
                                    color: '#6366f1',
                                    fontWeight: '800',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Open Portal <ExternalLink size={14} />
                            </Link>
                        </div>
                        <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #eee', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', background: 'white' }}>Health Check</button>
                        <button
                            onClick={handleQuickAddTask}
                            style={{ background: 'black', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                            + New Task
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--border)', background: 'white', padding: '0 20px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {['Overview', 'Tasks', 'People', 'Campaigns', 'Notes & Meetings', 'Documents', 'Billing & Profit', 'AI Summary'].map((tab) => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 0',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: activeTab === tab ? 'var(--accent-primary)' : '#666',
                                    borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
