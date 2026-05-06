"use client";

import { useState } from 'react';
import { useClients } from './context/ClientContext';
import Sidebar from './components/Sidebar';
import ClientBoard from './components/ClientBoard';
import NewClientModal from './components/NewClientModal';
import { LayoutDashboard, Users, Calendar, ListTodo, Settings } from 'lucide-react';

export default function Home() {
  const { clients, addClient, updateClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stages 1-5 are Pipeline (including Closed)
  const PIPELINE_STAGES = ['inquiry', 'requirements', 'proposal', 'closing', 'closed'];

  // Only show clients in pipeline stages
  const pipelineClients = clients.filter(c => PIPELINE_STAGES.includes(c.stage));

  // Function to handle adding a new client
  const handleAddClient = async (formData) => {
    // Transform services object to array for Supabase text[] column
    const servicesArray = Object.entries(formData.services || {})
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    await addClient({
      ...formData,
      services: servicesArray,
      stage: 'inquiry'
    });
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <header style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Sales Pipeline</h2>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              Filter by
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '10px 20px', borderRadius: '8px', background: 'black', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + New Client
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ClientBoard
            clients={pipelineClients}
            onUpdateClient={updateClient}
          />
        </div>
      </main>

      {/* Modal */}
      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleAddClient}
      />
    </div>
  );
}
