"use client";

import { useState } from "react";
import { Briefcase, Trash2, Eye, Shield } from "lucide-react";
import { useTeam } from "../context/TeamContext";
import { useTasks } from "../context/TaskContext";
import ActionMenu from "./ActionMenu";

const ROLE_STYLES = {
    super_admin: { bg: '#fef3c7', color: '#92400e', label: 'Super Admin' },
    admin:       { bg: '#ede9fe', color: '#5b21b6', label: 'Admin' },
    editor:      { bg: '#f0fdf4', color: '#065f46', label: 'Editor' },
    client:      { bg: '#f1f5f9', color: '#475569', label: 'Client' },
};

export default function TeamMemberCard({ member, onClick }) {
    const { tasks } = useTasks();
    const { deleteMember, updateMember, currentUser, members } = useTeam();
    const [editingRole, setEditingRole] = useState(false);
    const [roleType, setRoleType] = useState(member.roleType || 'editor');
    const [reportsTo, setReportsTo] = useState(member.reportsTo || '');

    const isSuperAdmin = currentUser?.roleType === 'super_admin';
    const canChangeRole = isSuperAdmin && member.roleType !== 'super_admin' && member.type === 'agency';
    const managers = members.filter(m => m.type === 'agency' && m.id !== member.id && (m.roleType === 'super_admin' || m.roleType === 'admin'));

    const memberTasks = (tasks || []).filter(t => t.assigneeId === member.id);
    const activeTasks = memberTasks.filter(t => t.status !== 'done').length;
    const highPriority = memberTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;
    const completedToday = memberTasks.filter(t => {
        if (t.status !== 'done') return false;
        const today = new Date().toLocaleDateString();
        const updated = new Date(t.updatedAt || Date.now()).toLocaleDateString();
        return today === updated;
    }).length;

    const roleStyle = ROLE_STYLES[member.roleType] || ROLE_STYLES.editor;

    const handleSaveRole = (e) => {
        e.stopPropagation();
        updateMember(member.id, { roleType, reportsTo: reportsTo || null });
        setEditingRole(false);
    };

    const handleRoleBadgeClick = (e) => {
        if (!canChangeRole) return;
        e.stopPropagation();
        setEditingRole(v => !v);
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #efefef',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = member.color || '#333';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#efefef';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Color bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: member.color || '#333', opacity: 0.8 }} />

            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: member.color || '#333', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {member.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#1a1a1a' }}>{member.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={12} /> {member.role}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <ActionMenu
                        actions={[
                            { label: 'View Profile', icon: <Eye size={14} />, onClick: onClick },
                            {
                                label: 'Remove from Team',
                                icon: <Trash2 size={14} />,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Remove ${member.name} from team?`)) deleteMember(member.id);
                                },
                                danger: true
                            }
                        ]}
                    />
                </div>
            </div>

            {/* Role Badge — clickable for Super Admin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    onClick={handleRoleBadgeClick}
                    title={canChangeRole ? 'Click to change role' : undefined}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '5px 12px', borderRadius: '20px',
                        background: roleStyle.bg, color: roleStyle.color,
                        fontSize: '0.75rem', fontWeight: '800',
                        cursor: canChangeRole ? 'pointer' : 'default',
                        border: canChangeRole ? `1.5px dashed ${roleStyle.color}55` : '1.5px solid transparent',
                        transition: 'all 0.15s',
                        userSelect: 'none'
                    }}
                >
                    <Shield size={11} />
                    {ROLE_STYLES[member.roleType]?.label || member.roleType}
                    {canChangeRole && <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▾</span>}
                </div>
            </div>

            {/* Inline Role Editor — Super Admin only */}
            {editingRole && canChangeRole && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '12px', padding: '16px',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}
                >
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>CHANGE ROLE</div>
                    <select
                        value={roleType}
                        onChange={e => setRoleType(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="admin">Admin — manages campaigns & assigns tasks</option>
                        <option value="editor">Editor — executes assigned tasks only</option>
                    </select>
                    {roleType === 'editor' && (
                        <>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>REPORTS TO</div>
                            <select
                                value={reportsTo}
                                onChange={e => setReportsTo(e.target.value)}
                                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.85rem', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">— No manager assigned —</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.roleType})</option>
                                ))}
                            </select>
                        </>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleSaveRole}
                            style={{ flex: 1, padding: '8px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            Save
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setEditingRole(false); }}
                            style={{ padding: '8px 14px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(member.skills || []).map(skill => (
                    <span key={skill} style={{
                        fontSize: '0.7rem', background: '#f8f8f8', color: '#666',
                        padding: '2px 8px', borderRadius: '100px', border: '1px solid #eee'
                    }}>
                        {skill}
                    </span>
                ))}
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
                padding: '12px', background: '#fafafa', borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{activeTasks}</div>
                    <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Active</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: highPriority > 0 ? '#ef4444' : '#333' }}>{highPriority}</div>
                    <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Urgent</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>{completedToday}</div>
                    <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase' }}>Today</div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f5f5f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{
                    fontSize: '0.75rem', fontWeight: '600',
                    color: member.status === 'Active' ? '#10b981' : '#f59e0b',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {member.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#999' }}>{member.email}</span>
            </div>
        </div>
    );
}
