"use client";

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task, isOverlay, onUpdate, onAddNext, onRemove, showClientName = true, clientName, hideClientPicker = false }) {
    const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
    const { clients } = useClients();
    const { openTask } = useTasks();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        background: 'white',
        borderBottom: '1px solid #f0f0f0',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: isDragging || isOverlay ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
        borderRadius: isDragging || isOverlay ? '6px' : '0',
        position: 'relative',
        zIndex: isDragging ? 2 : 1, // Ensure picker shows up
        cursor: task.title ? 'grab' : 'default',
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            openTask(task.id);
        } else if (e.key === 'Backspace' && task.title === '') {
            e.preventDefault();
            onRemove && onRemove(task.id);
        }
    };

    const handleClientSelect = (clientId) => {
        // Find the client name just for immediate feedback if needed, but onUpdate triggers re-render from parent
        onUpdate(task.id, { clientId });
        setIsClientPickerOpen(false);
    };

    const isCompleted = task.status === 'done';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group"
            onClick={() => !isClientPickerOpen && openTask(task.id)}
            {...attributes}
            {...listeners}
        >
            {/* Drag handle space removed; card is handle */}

            {/* Custom Checkbox - Black/Grey Style */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus = isCompleted ? 'todo' : 'done';
                    onUpdate(task.id, { status: nextStatus });
                }}
                style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: `2px solid ${isCompleted ? '#333' : '#ddd'}`,
                    background: isCompleted ? '#333' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.2s',
                    flexShrink: 0
                }}
            >
                {isCompleted && <span style={{ fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
            </div>

            {/* Editable Content */}
            <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Type a task..."
                autoFocus={task.isNew}
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    color: isCompleted ? '#aaa' : '#333',
                    background: 'transparent'
                }}
            />

            {/* Service Label Badge */}
            {task.service && (
                <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: '#6366f1',
                    background: '#e0e7ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    flexShrink: 0
                }}>
                    {task.service}
                </span>
            )}

            {/* Assignee Initial */}
            {task.assigneeInitials && (
                <div
                    title={task.assigneeName}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: task.assigneeColor || '#6366f1',
                        color: 'white',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    {task.assigneeInitials}
                </div>
            )}

            {/* Client Badge / Picker */}
            {showClientName && !hideClientPicker && (
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                    <span
                        onClick={() => setIsClientPickerOpen(!isClientPickerOpen)}
                        style={{
                            fontSize: '0.75rem',
                            color: clientName ? '#666' : '#aaa',
                            background: '#f5f5f5',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {clientName || 'Assign Client'}
                        <ChevronDown size={12} />
                    </span>

                    {/* Popover */}
                    {isClientPickerOpen && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '4px',
                            background: 'white',
                            border: '1px solid #eee',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            minWidth: '180px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {clients.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => handleClientSelect(c.id)}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f9f9f9',
                                        color: '#333'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    {c.name}
                                </div>
                            ))}
                            <div
                                onClick={() => handleClientSelect(null)}
                                style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#888', cursor: 'pointer', fontStyle: 'italic' }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                No Client
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
