'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginUser, registerUser } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await loginUser(identifier, password);
    setSubmitting(false);

    if (res.success) {
      showToast('Logged in successfully!', 'success');
      onClose();
    } else {
      showToast(res.message || 'Login failed', 'error');
    }
  };

  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_~`\-+=;'/\\\[\]]/.test(password);
  const isPasswordValid = hasMinLength && hasSpecialChar;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }
    if (!hasSpecialChar) {
      showToast('Password must contain at least one special character (!@#$%^&*...).', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Confirm password does not match!', 'warning');
      return;
    }

    setSubmitting(true);
    const res = await registerUser(name, email, password, confirmPassword);
    setSubmitting(false);

    if (res.success) {
      showToast(`Account registered successfully for ${email}! Welcome, ${name}.`, 'success');
      onClose();
    } else {
      showToast(res.message || 'Registration failed', 'error');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
          }}
        >
          &times;
        </button>

        <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'login' ? '#008C3B' : '#777',
              borderBottom: activeTab === 'login' ? '3px solid #008C3B' : 'none',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'register' ? '#008C3B' : '#777',
              borderBottom: activeTab === 'register' ? '3px solid #008C3B' : 'none',
            }}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email or Username</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Enter email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Create password (8+ chars with special char)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Live Password Complexity Checklist */}
              {password.length > 0 && (
                <div style={{
                  marginTop: '6px',
                  padding: '8px 10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div style={{ color: hasMinLength ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span>{hasMinLength ? '✓' : '✗'}</span> At least 8 characters
                  </div>
                  <div style={{ color: hasSpecialChar ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <span>{hasSpecialChar ? '✓' : '✗'}</span> Contains special character (!@#$%^&*...)
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

