'use client';

import React, { useState, useEffect } from 'react';
import { Sale } from '@/types/database';
import { useToast } from '@/context/ToastContext';
import { AdminTableSkeleton } from '@/components/Skeletons';

interface TopProductMetric {
  name: string;
  category: string;
  qty: number;
  revenue: number;
  percentage: number;
}

interface SalesSummary {
  totalRevenue: number;
  totalQuantity: number;
  totalTransactions: number;
  productBreakdown: Record<string, { qty: number; revenue: number; category: string }>;
  topProducts: TopProductMetric[];
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [topCount, setTopCount] = useState<number>(5);

  // Filters
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { showToast } = useToast();

  const fetchSales = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (productName) queryParams.set('product_name', productName);
      if (startDate) queryParams.set('start_date', startDate);
      if (endDate) queryParams.set('end_date', endDate);

      const res = await fetch(`/api/admin/sales?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setSales(data.data.sales || []);
        setSummary(data.data.summary || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 250);
    return () => clearTimeout(timer);
  }, [productName, startDate, endDate]);

  const resetFilters = () => {
    setProductName('');
    setStartDate('');
    setEndDate('');
  };

  // Robust CSV / Excel Export using Blob and UTF-8 BOM
  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast('No sales records to export.', 'warning');
      return;
    }

    const escapeCsv = (str: any) => {
      const val = str === null || str === undefined ? '' : String(str);
      return `"${val.replace(/"/g, '""')}"`;
    };

    const csvLines: string[] = [];

    // 1. Report Title & Header Summary
    csvLines.push(`"PAQUITO'S PIZZA - SALES & REVENUE ANALYTICS REPORT"`);
    csvLines.push(`"Generated On",${escapeCsv(new Date().toLocaleString())}`);
    if (startDate || endDate) {
      csvLines.push(`"Date Filter Range",${escapeCsv(`${startDate || 'Beginning'} to ${endDate || 'Present'}`)}`);
    }
    csvLines.push(`"Total Net Revenue (PHP)",${Number(summary?.totalRevenue || 0).toFixed(2)}`);
    csvLines.push(`"Total Items Sold",${summary?.totalQuantity || 0}`);
    csvLines.push(`"Total Completed Transactions",${summary?.totalTransactions || 0}`);
    csvLines.push('');

    // 2. Top Performing Products Section
    const topList = summary?.topProducts || [];
    if (topList.length > 0) {
      csvLines.push(`"TOP PERFORMING PRODUCTS (BY REVENUE)"`);
      csvLines.push(['Rank', 'Product Name', 'Category', 'Units Sold', 'Total Revenue (PHP)', 'Revenue Share (%)'].map(escapeCsv).join(','));
      topList.slice(0, 10).forEach((tp, index) => {
        csvLines.push([
          `#${index + 1}`,
          tp.name,
          tp.category || 'General',
          tp.qty,
          Number(tp.revenue).toFixed(2),
          `${tp.percentage.toFixed(1)}%`,
        ].map(escapeCsv).join(','));
      });
      csvLines.push('');
    }

    // 3. Detailed Sales Transactions Table
    csvLines.push(`"DETAILED SALES TRANSACTIONS"`);
    csvLines.push(['Sale ID', 'Date & Time', 'Product Name', 'Options / Size', 'Quantity', 'Unit Price (PHP)', 'Line Total (PHP)'].map(escapeCsv).join(','));
    sales.forEach((s) => {
      csvLines.push([
        `#${s.id}`,
        new Date(s.date).toLocaleString(),
        s.product_name || `Product #${s.product_id}`,
        s.sizeID || 'Standard',
        s.qty,
        Number(s.price).toFixed(2),
        (Number(s.price) * Number(s.qty)).toFixed(2),
      ].map(escapeCsv).join(','));
    });

    const csvString = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `paquitos_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Sales report exported to CSV / Excel!', 'success');
  };

  // Export to PDF / Print Report
  const handlePrintPDF = () => {
    if (sales.length === 0) {
      showToast('No sales records to print.', 'warning');
      return;
    }
    window.print();
  };

  const topProductsToDisplay = (summary?.topProducts || []).slice(0, topCount);

  return (
    <div>
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
          }
          nav, aside, .no-print, button, input {
            display: none !important;
          }
          .table-container, .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Page Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Sales & Revenue Analytics
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Track sales performance, executive revenue summaries, and top-selling products
          </p>
        </div>

        {/* Export Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Export to Excel / CSV - Excel Forest Green */}
          <button
            onClick={handleExportCSV}
            className="btn"
            style={{
              backgroundColor: '#107c41',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(16, 124, 65, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0d6334')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#107c41')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Export to Excel / CSV
          </button>

          {/* Export PDF / Print - Acrobat Crimson Red */}
          <button
            onClick={handlePrintPDF}
            className="btn"
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Net Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#008C3B', marginTop: '6px' }}>
            ₱{Number(summary?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items Sold</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', marginTop: '6px' }}>
            {summary?.totalQuantity || 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>units</span>
          </div>
        </div>

        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sales Transactions</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '6px' }}>
            {summary?.totalTransactions || 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>orders</span>
          </div>
        </div>
      </div>

      {/* 🏆 Top Performing Products Section */}
      <div className="print-card" style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏆 Top Performing Products</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
              Ranked by total gross revenue generated
            </p>
          </div>

          {/* Toggle Top 5 / Top 10 */}
          <div className="no-print" style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
            <button
              onClick={() => setTopCount(5)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: topCount === 5 ? '#fff' : 'transparent',
                color: topCount === 5 ? '#008C3B' : '#64748b',
                boxShadow: topCount === 5 ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Top 5
            </button>
            <button
              onClick={() => setTopCount(10)}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: topCount === 10 ? '#fff' : 'transparent',
                color: topCount === 10 ? '#008C3B' : '#64748b',
                boxShadow: topCount === 10 ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Top 10
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>Analyzing sales performance...</p>
        ) : topProductsToDisplay.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '1.5rem 0' }}>No product sales data recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {topProductsToDisplay.map((item, idx) => {
              const rankMedals = ['🥇', '🥈', '🥉'];
              const medal = rankMedals[idx] || `#${idx + 1}`;
              return (
                <div
                  key={item.name}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: idx === 0 ? '#f0fdf4' : idx === 1 ? '#f8fafc' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: idx < 3 ? '1.25rem' : '0.9rem', fontWeight: 800, color: '#475569' }}>
                        {medal}
                      </span>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#008C3B', backgroundColor: '#e2fbe8', padding: '2px 8px', borderRadius: '12px' }}>
                      {item.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      <strong>{item.qty}</strong> units sold
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#008C3B' }}>
                      ₱{Number(item.revenue).toFixed(2)}
                    </span>
                  </div>

                  {/* Share Progress Bar */}
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(5, item.percentage))}%`,
                        backgroundColor: idx === 0 ? '#008C3B' : idx === 1 ? '#3b82f6' : '#10b981',
                        height: '100%',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>
                    {item.percentage.toFixed(1)}% of total revenue
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="no-print" style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Filter by Product
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search product name..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={resetFilters}
          className="option-btn"
          style={{ padding: '0.75rem 1.25rem', backgroundColor: '#94a3b8' }}
        >
          Reset Filters
        </button>
      </div>

      {/* Sales Transactions Table */}
      <div className="table-container">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
          Sales Transactions ({sales.length})
        </h2>
        {loading ? (
          <AdminTableSkeleton rows={5} columns={6} />
        ) : sales.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No sales recorded for the selected period</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Size / Options</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>#{s.id}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{s.product_name || `Product #${s.product_id}`}</td>
                  <td>{s.sizeID || 'Standard'}</td>
                  <td style={{ fontWeight: 600 }}>{s.qty}</td>
                  <td>₱{Number(s.price).toFixed(2)}</td>
                  <td style={{ fontWeight: 800, color: '#008C3B' }}>
                    ₱{(Number(s.price) * Number(s.qty)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
