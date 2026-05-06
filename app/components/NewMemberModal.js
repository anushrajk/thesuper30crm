"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function NewMemberModal({ isOpen, onClose, onAdd }) {
    const { members } = useTeam();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'SEO Specialist',
        roleType: 'editor',
        reportsTo: '',
        skills: ''
    });

    const managers = members.filter(m => m.type === 'agency' && (m.roleType === 'super_admin' || m.roleType === 'admin'));

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const memberData = {
            ...formData,
            type: 'agency',
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
            reportsTo: formData.roleType === 'editor' ? (formData.reportsTo || null) : null,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        };
        onAdd(memberData);
        setFormData({ name: '', email: '', role: 'SEO Specialist', roleType: 'editor', reportsTo: '', skills: '' });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div
                style={{
                    background: 'white',
                    width: '450px',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Add Team Member</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>FULL NAME</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                        <input
                            required
                            type="email"
                            placeholder="john@agencyos.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>JOB TITLE</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white' }}
                        >
                            <option>Account Manager</option>
                            <option>SEO Specialist</option>
                            <option>Ads Executive</option>
                            <option>Developer</option>
                            <option>Designer</option>
                            <option>Content Writer</option>
                            <option>Intern</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>SYSTEM ROLE</label>
                        <select
                            value={formData.roleType}
                            onChange={e => setFormData({ ...formData, roleType: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white' }}
                        >
                            <option value="super_admin">Super Admin — full access</option>
                            <option value="admin">Admin — manage campaigns & assign tasks</option>
                            <option value="editor">Editor — execute assigned tasks only</option>
                        </select>
                    </div>

                    {formData.roleType === 'editor' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>REPORTS TO</label>
                            <select
                                value={formData.reportsTo}
                                onChange={e => setFormData({ ...formData, reportsTo: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white' }}
                            >
                                <option value="">— No manager assigned —</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.roleType})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>SKILLS (COMMA SEPARATED)</label>
                        <input
                            type="text"
                            placeholder="e.g. SEO, Content, Strategy"
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                        />
                    </div>

                    <button type="submit" style={{
                        marginTop: '12px',
                        background: '#1a1a1a',
                        color: 'white',
                        padding: '14px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                        Add to Team
                    </button>
                </form>
            </div>
        </div>
    );
}
