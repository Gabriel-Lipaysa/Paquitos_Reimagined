'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface ColdStartBannerProps {
  isWakingUp?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onShowOfflineMenu?: () => void;
  showingOfflineMenu?: boolean;
}

export default function ColdStartBanner({
  isWakingUp = false,
  isError = false,
  onRetry,
  onShowOfflineMenu,
  showingOfflineMenu = false,
}: ColdStartBannerProps) {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const { showToast } = useToast();

  const handleNotifyAdmin = async () => {
    if (notified || notifying) return;

    setNotifying(true);
    try {
      const res = await fetch('/api/notify-coldstart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/menu',
          reason: 'Customer initiated cold start alert from menu page',
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNotified(true);
        showToast(
          data.message || 'Store owner (Gabriel) notified! Sent wake-up ping to server.',
          'success'
        );

        // Auto-retry in 3 seconds
        if (onRetry) {
          setTimeout(() => {
            onRetry();
          }, 3500);
        }
      } else {
        showToast(data.message || 'Failed to notify admin, please try again.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error sending cold-start notification', 'error');
    } finally {
      setNotifying(false);
    }
  };

  if (!isWakingUp && !isError) return null;

  return (
    <div
      style={{
        background: isError
          ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: isError ? '1px solid #fde68a' : '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.85rem', flex: '1 1 320px' }}>
          <div
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              padding: '6px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {isError ? '⚡' : '⏳'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: isError ? '#92400e' : '#166534',
                  margin: 0,
                }}
              >
                {isError
                  ? 'Cloud Services Starting Up (Cold Start)'
                  : 'Warming Up Server Connection...'}
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isError ? '#fee2e2' : '#fef3c7',
                  color: isError ? '#991b1b' : '#92400e',
                  border: isError ? '1px solid #fecaca' : '1px solid #fde68a',
                }}
              >
                {isError ? 'Aiven / Cloudinary Idle Spin-up' : 'Connecting to DB'}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.88rem',
                color: isError ? '#78350f' : '#15803d',
                marginTop: '6px',
                marginBottom: 0,
                lineHeight: '1.5',
                maxWidth: '650px',
              }}
            >
              {isError
                ? 'Our cloud database (Aiven Cloud) or media hosting (Cloudinary) was idle and is currently spinning up from a cold start. Tap the button below to notify Gabriel directly and send an instant wake-up query to the server.'
                : 'Free-tier cloud database instances go to sleep after periods of inactivity. Your request is waking it up now.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem',
          }}
        >
          {/* Notify Admin Button */}
          <button
            type="button"
            disabled={notifying || notified}
            onClick={handleNotifyAdmin}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: notified ? '#16a34a' : notifying ? '#f59e0b' : '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: notified || notifying ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: notified ? 'none' : '0 2px 8px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            {notified ? (
              <>✓ Gabriel Alerted (Auto-retrying...)</>
            ) : notifying ? (
              <>🔔 Sending Wake-Up Signal...</>
            ) : (
              <>🔔 Notify Me / Wake Up Server</>
            )}
          </button>

          {/* Retry Button */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔄 Retry Connection
            </button>
          )}

          {/* Offline Preview Button */}
          {onShowOfflineMenu && (
            <button
              type="button"
              onClick={onShowOfflineMenu}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #94a3b8',
                backgroundColor: showingOfflineMenu ? '#1e293b' : '#f8fafc',
                color: showingOfflineMenu ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {showingOfflineMenu ? '✓ Showing Offline Menu' : '📋 Browse Offline Menu'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
