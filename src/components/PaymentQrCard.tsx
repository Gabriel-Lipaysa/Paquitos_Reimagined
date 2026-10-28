'use client';

import React, { useState } from 'react';

interface PaymentQrCardProps {
  method: 'gcash' | 'bank';
  amount: number;
}

export default function PaymentQrCard({ method, amount }: PaymentQrCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField((cur) => (cur === field ? null : cur));
    }, 2000);
  };

  const isGcash = method === 'gcash';
  const gcashNumber = '0917-123-4567';
  const gcashName = "Paquito's Pizza (Gabriel L.)";

  const bankName = 'BDO Unibank';
  const bankAccountName = "Paquito's Pizza Store Inc.";
  const bankAccountNumber = '0012-3456-7890';

  return (
    <div
      style={{
        background: isGcash
          ? 'linear-gradient(145deg, #0f4c81 0%, #007dfe 100%)'
          : 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        marginTop: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Header Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              backgroundColor: '#fff',
              color: isGcash ? '#007dfe' : '#1e293b',
              fontWeight: 900,
              fontSize: '0.85rem',
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isGcash ? '📱 GCASH / QRPH' : '🏦 BANK TRANSFER (INSTAPAY)'}
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Official Store Account</span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Amount to Pay:</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fef08a' }}>
            ₱{amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* QR Code Presentation Box */}
        <div
          style={{
            backgroundColor: '#fff',
            color: '#1e293b',
            padding: '1.25rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              color: isGcash ? '#007dfe' : '#1e293b',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            {isGcash ? 'Scan to Pay with GCash' : 'Scan via QRPh Banking App'}
          </div>

          {/* Authentic Stylized QR Code SVG with Brand Focal Point */}
          <div
            style={{
              margin: '0 auto',
              width: '180px',
              height: '180px',
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 160 160"
              width="100%"
              height="100%"
              shapeRendering="crispEdges"
              style={{ display: 'block' }}
            >
              {/* Background */}
              <rect width="160" height="160" fill="#ffffff" />

              {/* QR Finder Pattern Top-Left */}
              <rect x="10" y="10" width="40" height="40" fill="#1e293b" rx="4" />
              <rect x="16" y="16" width="28" height="28" fill="#ffffff" rx="2" />
              <rect x="22" y="22" width="16" height="16" fill={isGcash ? '#007dfe' : '#1e293b'} rx="2" />

              {/* QR Finder Pattern Top-Right */}
              <rect x="110" y="10" width="40" height="40" fill="#1e293b" rx="4" />
              <rect x="116" y="16" width="28" height="28" fill="#ffffff" rx="2" />
              <rect x="122" y="22" width="16" height="16" fill={isGcash ? '#007dfe' : '#1e293b'} rx="2" />

              {/* QR Finder Pattern Bottom-Left */}
              <rect x="10" y="110" width="40" height="40" fill="#1e293b" rx="4" />
              <rect x="16" y="116" width="28" height="28" fill="#ffffff" rx="2" />
              <rect x="22" y="122" width="16" height="16" fill={isGcash ? '#007dfe' : '#1e293b'} rx="2" />

              {/* Timing & Data Matrix Module Representation */}
              <g fill="#1e293b">
                {/* Horizontal timing pattern */}
                <rect x="56" y="28" width="6" height="6" />
                <rect x="68" y="28" width="6" height="6" />
                <rect x="80" y="28" width="6" height="6" />
                <rect x="92" y="28" width="6" height="6" />
                {/* Vertical timing pattern */}
                <rect x="28" y="56" width="6" height="6" />
                <rect x="28" y="68" width="6" height="6" />
                <rect x="28" y="80" width="6" height="6" />
                <rect x="28" y="92" width="6" height="6" />

                {/* Data modules */}
                <rect x="56" y="10" width="6" height="6" />
                <rect x="68" y="16" width="6" height="6" />
                <rect x="86" y="12" width="6" height="6" />
                <rect x="62" y="40" width="6" height="6" />
                <rect x="74" y="42" width="6" height="6" />
                <rect x="92" y="44" width="6" height="6" />
                <rect x="56" y="56" width="6" height="6" />
                <rect x="80" y="56" width="6" height="6" />
                <rect x="98" y="56" width="6" height="6" />
                <rect x="110" y="56" width="6" height="6" />
                <rect x="122" y="62" width="6" height="6" />
                <rect x="134" y="56" width="6" height="6" />
                <rect x="146" y="68" width="6" height="6" />

                <rect x="10" y="62" width="6" height="6" />
                <rect x="16" y="74" width="6" height="6" />
                <rect x="40" y="68" width="6" height="6" />
                <rect x="46" y="86" width="6" height="6" />

                <rect x="110" y="80" width="6" height="6" />
                <rect x="122" y="86" width="6" height="6" />
                <rect x="134" y="80" width="6" height="6" />
                <rect x="146" y="92" width="6" height="6" />

                <rect x="56" y="98" width="6" height="6" />
                <rect x="68" y="104" width="6" height="6" />
                <rect x="80" y="98" width="6" height="6" />
                <rect x="92" y="110" width="6" height="6" />
                <rect x="104" y="104" width="6" height="6" />
                <rect x="128" y="110" width="6" height="6" />
                <rect x="140" y="122" width="6" height="6" />

                <rect x="56" y="122" width="6" height="6" />
                <rect x="68" y="134" width="6" height="6" />
                <rect x="80" y="128" width="6" height="6" />
                <rect x="92" y="140" width="6" height="6" />
                <rect x="110" y="134" width="6" height="6" />
                <rect x="128" y="140" width="6" height="6" />
                <rect x="146" y="134" width="6" height="6" />
              </g>

              {/* Center Emblem with Pizza Slice / Brand */}
              <rect x="62" y="62" width="36" height="36" fill="#ffffff" rx="6" />
              <rect x="64" y="64" width="32" height="32" fill={isGcash ? '#007dfe' : '#008C3B'} rx="4" />
              <text
                x="80"
                y="85"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                🍕
              </text>
            </svg>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
            Universal QRPh • InstaPay Compatible
          </div>
        </div>

        {/* Account Details and Quick Copy Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isGcash ? (
            <>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>GCash Account Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{gcashName}</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>GCash Mobile Number</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.5px', marginTop: '2px' }}>
                    {gcashNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(gcashNumber.replace(/-/g, ''), 'gcashNumber')}
                  style={{
                    backgroundColor: copiedField === 'gcashNumber' ? '#22c55e' : '#ffffff',
                    color: copiedField === 'gcashNumber' ? '#ffffff' : '#007dfe',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedField === 'gcashNumber' ? '✓ Copied' : 'Copy Number'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Bank Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{bankName}</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Account Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{bankAccountName}</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Account Number</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.5px', marginTop: '2px' }}>
                    {bankAccountNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankAccountNumber.replace(/-/g, ''), 'bankNumber')}
                  style={{
                    backgroundColor: copiedField === 'bankNumber' ? '#22c55e' : '#ffffff',
                    color: copiedField === 'bankNumber' ? '#ffffff' : '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedField === 'bankNumber' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </>
          )}

          {/* Transfer Instructions */}
          <div
            style={{
              fontSize: '0.78rem',
              lineHeight: '1.4',
              opacity: 0.95,
              background: 'rgba(0,0,0,0.2)',
              padding: '0.75rem',
              borderRadius: '8px',
            }}
          >
            <strong>3-Step Verification:</strong>
            <ol style={{ paddingLeft: '1.2rem', margin: '4px 0 0 0' }}>
              <li>Send exactly <strong>₱{amount.toFixed(2)}</strong> via {isGcash ? 'GCash' : 'InstaPay/PESONet'}.</li>
              <li>Take a screenshot of the completed transfer receipt.</li>
              <li>Attach the screenshot below so our team can verify and bake your pizza.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
