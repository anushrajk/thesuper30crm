"use client";

import { useState } from 'react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function PortalLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = usePortalAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const result = login(email, password);
        if (result.success) {
            router.push('/portal/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fcfcfc',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <img src="https://www.thesuper30.ai/assets/super30-new-logo-qQg26tml.png" alt="Super30 Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 8px 0', color: '#1a1a1a' }}>Client Portal</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Secure access to your project dashboard</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            background: 'black',
                            color: 'white',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: '#999', fontSize: '0.8rem' }}>
                    Having trouble? Contact your agency account manager.
                </p>
            </div>
        </div>
    );
}
