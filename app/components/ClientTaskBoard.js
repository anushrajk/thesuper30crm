"use client";

import { useState } from 'react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { useTasks } from '../context/TaskContext';
import { useClients } from '../context/ClientContext';
import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';

export default function ClientTaskBoard({ clientId }) {
    const { getClientTasks, addTask, insertTaskAfter, updateTask, deleteTask, SERVICE_TYPES } = useTasks();
    const { getClientById } = useClients();
    const client = getClientById(clientId);
    
    // Only show services the client has signed up for
    const availableServices = SERVICE_TYPES.filter(type => 
        !client?.services || client.services.includes(type.id)
    );

    const [serviceTab, setServiceTab] = useState(availableServices[0]?.id || 'seo');
    
    // Filter tasks by client and then by service tab
    const allClientTasks = getClientTasks(clientId);
    const tasks = allClientTasks.filter(t => (t.service || 'seo') === serviceTab);
    
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleUpdateTask = (id, updates) => {
        updateTask(id, updates);
    };

    const handleAddNext = (currentId) => {
        const currentTask = tasks.find(t => t.id === currentId);
        insertTaskAfter(currentId, {
            title: '',
            status: currentTask ? currentTask.status : 'todo',
            clientId: clientId,
            service: serviceTab,
            isNew: true
        });
    };

    const handleRemoveTask = (id) => {
        deleteTask(id);
    };

    const handleAddFirst = (statusColumn) => {
        addTask({
            title: '',
            status: statusColumn,
            dueDate: new Date().toISOString().split('T')[0],
            clientId: clientId,
            service: serviceTab,
            isNew: true
        });
    };

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) { setActiveId(null); return; }

        const activeTask = tasks.find(t => t.id === active.id);
        const overId = over.id;

        if (activeTask && activeTask.isNew) {
            updateTask(active.id, { isNew: false });
        }

        const statusMap = {
            'ToDo': 'todo',
            'InProgress': 'in-progress',
            'Done': 'done'
        };

        const isColumn = Object.keys(statusMap).includes(overId);

        if (isColumn) {
            updateTask(active.id, { status: statusMap[overId] });
        } else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask && activeTask.status !== overTask.status) {
                updateTask(active.id, { status: overTask.status });
            }
        }
        setActiveId(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: '1000px' }}>
            {/* Service Sub-Tabs */}
            <div style={{ display: 'flex', gap: '12px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {availableServices.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setServiceTab(type.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            background: serviceTab === type.id ? 'white' : 'transparent',
                            color: serviceTab === type.id ? '#1a1a1a' : '#64748b',
                            boxShadow: serviceTab === type.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
                    <TaskColumn
                        id="ToDo"
                        title="To Do"
                        tasks={tasks.filter(t => t.status === 'todo')}
                        onUpdate={handleUpdateTask}
                        onAddNext={handleAddNext}
                        onRemove={handleRemoveTask}
                        onAddFirst={() => handleAddFirst('todo')}
                        className="flex-1"
                        hideClientPicker={true}
                    />

                    <TaskColumn
                        id="InProgress"
                        title="In Progress"
                        tasks={tasks.filter(t => t.status === 'in-progress')}
                        onUpdate={handleUpdateTask}
                        onAddNext={handleAddNext}
                        onRemove={handleRemoveTask}
                        onAddFirst={() => handleAddFirst('in-progress')}
                        className="flex-1"
                        hideClientPicker={true}
                    />

                    <TaskColumn
                        id="Done"
                        title="Done"
                        tasks={tasks.filter(t => t.status === 'done')}
                        onUpdate={handleUpdateTask}
                        onAddNext={handleAddNext}
                        onRemove={handleRemoveTask}
                        onAddFirst={() => handleAddFirst('done')}
                        className="flex-1"
                        hideClientPicker={true}
                    />
                </div>

                <DragOverlay>
                    {activeId ? <TaskCard task={allClientTasks.find(t => t.id === activeId)} isOverlay showClientName={false} hideClientPicker={true} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

