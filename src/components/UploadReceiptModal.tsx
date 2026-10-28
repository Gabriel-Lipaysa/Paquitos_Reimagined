'use client';

import React, { useState, useRef } from 'react';
import PaymentQrCard from './PaymentQrCard';
import { useToast } from '@/context/ToastContext';
import { Order } from '@/types/database';

interface UploadReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: (newProofUrl: string) => void;
}

export default function UploadReceiptModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}: UploadReceiptModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  if (!isOpen || !order) return null;

  const isGcash = order.method.toLowerCase().includes('gcash');
  const paymentMethod: 'gcash' | 'bank' = isGcash ? 'gcash' : 'bank';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('Image size cannot exceed 10MB.', 'error');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleClearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a screenshot or photo of your payment receipt.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('order_id', String(order.id));

      const res = await fetch('/api/orders/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Receipt uploaded successfully! Store staff will verify.', 'success');
        onSuccess(data.data.url);
        onClose();
      } else {
        showToast(data.message || 'Failed to upload receipt proof', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading receipt', 'error');
    } finally {
      setUploading(false);
    }
  };

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
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Upload Payment Proof
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
              Order #{order.id} • Total: ₱{Number(order.total_price).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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

        {/* Modal Content */}
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {/* Payment QR / Bank Details Card */}
            <PaymentQrCard method={paymentMethod} amount={Number(order.total_price)} />

            {/* File Upload Box */}
            <div style={{ marginTop: '1.25rem' }}>
              <label
                htmlFor="modal-proof-file"
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Attach Payment Screenshot / Transaction Slip
              </label>

              <input
                ref={fileInputRef}
                id="modal-proof-file"
                name="proofFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#008C3B';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📸</div>
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>
                    Click to select payment screenshot
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Supports PNG, JPG, or WEBP (Max 10MB)
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#166534',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                      {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    style={{
                      background: 'none',
                      border: '1px solid #f87171',
                      borderRadius: '6px',
                      color: '#ef4444',
                      padding: '4px 8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              disabled={uploading}
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !file || uploading ? '#94a3b8' : '#008C3B',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: !file || uploading ? 'not-allowed' : 'pointer',
                boxShadow: !file || uploading ? 'none' : '0 2px 6px rgba(0, 140, 59, 0.4)',
              }}
            >
              {uploading ? 'Uploading Receipt...' : 'Submit Payment Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

