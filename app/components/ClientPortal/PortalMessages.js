"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';
import { useMessages } from '../../context/MessageContext';
import { usePortalAuth } from '../../context/PortalAuthContext';

export default function PortalMessages({ contextId, contextType }) {
    const { getMessagesByContext, sendMessage } = useMessages();
    const { user } = usePortalAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const contextMessages = getMessagesByContext(contextId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [contextMessages]);

    const isAgencySide = contextType === 'Client';
    const currentName = isAgencySide ? 'Agency Support' : (user?.name || 'Anonymous');
    const currentRole = isAgencySide ? 'Agency' : (user?.role || 'Client');

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage(
            contextId,
            newMessage,
            currentName,
            currentRole
        );
        setNewMessage('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
                {contextMessages.length > 0 ? contextMessages.map(msg => {
                    const isMe = msg.senderName === currentName;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '16px',
                                background: isMe ? 'black' : '#f3f4f6',
                                color: isMe ? 'white' : '#1a1a1a',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                borderBottomRightRadius: isMe ? '4px' : '16px',
                                borderBottomLeftRadius: isMe ? '16px' : '4px'
                            }}>
                                {msg.text}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '700', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.senderName} ({msg.senderRole})
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem', textAlign: 'center' }}>
                        No messages yet for this {contextType}.<br />Start the coordination here.
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <input
                    placeholder="Type a message..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', padding: '4px 8px' }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'black', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

