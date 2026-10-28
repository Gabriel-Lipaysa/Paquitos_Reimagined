'use client';

import React from 'react';
import { getImageUrl } from '@/lib/image-helper';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
  orderId: number;
  totalPrice?: number;
  customerName?: string;
  paymentStatus?: 'pending' | 'completed';
  isAdmin?: boolean;
  isVerifying?: boolean;
  onVerifyPayment?: () => void;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  receiptUrl,
  orderId,
  totalPrice,
  customerName,
  paymentStatus = 'pending',
  isAdmin = false,
  isVerifying = false,
  onVerifyPayment,
}: ReceiptModalProps) {
  if (!isOpen || !receiptUrl) return null;

  const fullImageUrl = getImageUrl(receiptUrl);
  const isPaid = paymentStatus === 'completed';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(5px)',
        padding: '1.25rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Payment Receipt Proof
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isPaid ? '#dcfce7' : '#fef3c7',
                  color: isPaid ? '#15803d' : '#92400e',
                  border: isPaid ? '1px solid #86efac' : '1px solid #fde68a',
                }}
              >
                {isPaid ? '✓ Verified Paid' : '⏳ Pending Verification'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
              Order #{orderId} {customerName ? `• ${customerName}` : ''}{' '}
              {totalPrice !== undefined ? `• ₱${Number(totalPrice).toFixed(2)}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            &times;
          </button>
        </div>

        {/* Image Preview Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            minHeight: '260px',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              maxWidth: '100%',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullImageUrl}
              alt={`Payment receipt for Order #${orderId}`}
              style={{
                maxWidth: '100%',
                maxHeight: '52vh',
                display: 'block',
                objectFit: 'contain',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/home-img-1.png';
              }}
            />
          </div>

          <a
            href={fullImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '0.85rem',
              fontSize: '0.82rem',
              color: '#0284c7',
              fontWeight: 600,
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Open Original Image in Full Screen &rarr;
          </a>
        </div>

        {/* Footer / Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isPaid ? (
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={onVerifyPayment}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {isVerifying ? 'Updating...' : 'Set as Unverified / Pending'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={onVerifyPayment}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isVerifying ? 'Verifying...' : '✓ Verify Payment & Mark Paid'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

