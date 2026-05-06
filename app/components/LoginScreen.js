"use client";

import React, { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LoginScreen() {
    const { sendOtp, verifyOtp } = useTeam();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await sendOtp(email);
        if (result.success) {
            setStep('otp');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await verifyOtp(email, otp);
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px 14px 44px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        boxSizing: 'border-box'
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            width: '100vw', 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Background Orbs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />

            <div style={{
                width: '100%',
                maxWidth: '440px',
                padding: '48px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <img src="https://www.thesuper30.ai/assets/super30-new-logo-qQg26tml.png" alt="Super30 Logo" style={{ height: '52px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Agency OS</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                        {step === 'email' ? 'Enter your email to receive a login code' : `We've sent a code to ${email}`}
                    </p>
                </div>

                <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {error && (
                        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5', fontSize: '0.9rem' }}>
                            <ShieldCheck size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'email' ? (
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} color="#94a3b8" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                                required
                            />
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} color="#94a3b8" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ ...inputStyle, textAlign: 'center', paddingLeft: '16px', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: '800' }}
                                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                                required
                                maxLength={6}
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '16px',
                            background: isLoading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px -3px rgba(99, 102, 241, 0.4)',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {isLoading ? (step === 'email' ? 'Sending code...' : 'Verifying...') : (step === 'email' ? 'Continue' : 'Sign In')}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>

                    {step === 'otp' && (
                        <button 
                            type="button"
                            onClick={() => setStep('email')}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}
                        >
                            Change email address
                        </button>
                    )}
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                        <ShieldCheck size={14} />
                        <span>Secure, passwordless authentication</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
