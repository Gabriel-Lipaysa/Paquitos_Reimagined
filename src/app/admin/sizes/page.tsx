'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminSizesRedirectPage() {
  return (
    <div style={{ maxWidth: '650px', margin: '4rem auto', textAlign: 'center', backgroundColor: '#fff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#008C3B', fontSize: '1.8rem', fontWeight: 900 }}>
        ✓
      </div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
        Universal Product Customizations Active
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        Sizes, bottle volumes, spice levels, and portions are now managed directly inside each product in the Product Catalog. This allows customized options tailored for Drinks, Meals, Burgers, and Pizzas without rigid size tables.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/admin/products" className="btn">
          Go to Product Catalog &rarr;
        </Link>
        <Link href="/admin/categories" className="option-btn">
          Manage Categories
        </Link>
      </div>
    </div>
  );
}
