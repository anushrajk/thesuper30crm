"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Filter, TrendingUp, DollarSign, Calendar, Megaphone, Trash2 } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import Link from 'next/link';
import { useCampaigns } from '../context/CampaignContext';
import { CAMPAIGN_STATUSES } from '../data/campaigns';
import CampaignModal from '../components/CampaignModal';
import ActionMenu from '../components/ActionMenu';
import { Eye } from 'lucide-react';

export default function CampaignsPage() {
    const { campaigns, addCampaign, deleteCampaign } = useCampaigns();
    const { clients } = useClients();
    const [filterClient, setFilterClient] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredCampaigns = campaigns.filter(campaign => {
        if (filterClient !== 'all' && campaign.clientId !== filterClient) return false;
        if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: '#dcfce7', text: '#16a34a' };
            case 'draft': return { bg: '#f3f4f6', text: '#6b7280' };
            case 'paused': return { bg: '#fef3c7', text: '#d97706' };
            case 'completed': return { bg: '#dbeafe', text: '#2563eb' };
            default: return { bg: '#f3f4f6', text: '#6b7280' };
        }
    };

    const handleSaveCampaign = (data) => {
        addCampaign(data);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8f9fa', overflow: 'hidden' }}>
                <header style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)', background: 'white' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Campaigns</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{filteredCampaigns.length} campaigns</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: 'black', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> New Campaign
                    </button>
                </header>

                {/* Filters */}
                <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'white' }}>
                    <Filter size={18} color="#666" />
                    <select
                        value={filterClient}
                        onChange={(e) => setFilterClient(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    >
                        <option value="all">All Clients</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    >
                        <option value="all">All Statuses</option>
                        {CAMPAIGN_STATUSES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {/* Campaign Grid */}
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {filteredCampaigns.map(campaign => {
                            const statusStyle = getStatusColor(campaign.status);
                            return (
                                <Link href={`/campaigns/${campaign.id}`} key={campaign.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid #eee',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <span style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {campaign.status}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {campaign.category === 'seo' && <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>SEO</span>}
                                                    {campaign.category === 'performance' && <span style={{ background: '#f0fdf4', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>PERFORMANCE</span>}
                                                    {campaign.category === 'both' && <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>MIXED</span>}
                                                </div>
                                                <ActionMenu
                                                    actions={[
                                                        {
                                                            label: 'View Details',
                                                            icon: <Eye size={14} />,
                                                            onClick: () => window.location.href = `/campaigns/${campaign.id}`
                                                        },
                                                        {
                                                            label: 'Delete Campaign',
                                                            icon: <Trash2 size={14} />,
                                                            onClick: (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (confirm(`Delete ${campaign.name}?`)) deleteCampaign(campaign.id);
                                                            },
                                                            danger: true
                                                        }
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>{campaign.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>{campaign.clientName || clients.find(c => c.id === campaign.clientId)?.name}</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <DollarSign size={16} color="#888" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{campaign.budget}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={16} color="#888" />
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{campaign.endDate || 'Ongoing'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {filteredCampaigns.length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                            <Megaphone size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>No campaigns found matching your filters.</p>
                        </div>
                    )}
                </div>
            </main>

            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCampaign}
            />
        </div>
    );
}

