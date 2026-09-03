import { SalesRepository } from '../repositories/sales-repo';
import { Sale } from '../db/schema';

export interface TopProductMetric {
  name: string;
  category: string;
  qty: number;
  revenue: number;
  percentage: number;
}

export class SalesService {
  static async getSalesAnalytics(
    productName?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    sales: Sale[];
    summary: {
      totalRevenue: number;
      totalQuantity: number;
      totalTransactions: number;
      productBreakdown: Record<string, { qty: number; revenue: number; category: string }>;
      topProducts: TopProductMetric[];
    };
  }> {
    const sales = await SalesRepository.getSales(productName, startDate, endDate);

    let totalRevenue = 0;
    let totalQuantity = 0;
    const productBreakdown: Record<string, { qty: number; revenue: number; category: string }> = {};

    for (const s of sales) {
      const lineRevenue = Number(s.price) * Number(s.qty);
      totalRevenue += lineRevenue;
      totalQuantity += Number(s.qty);

      const pName = s.product_name || `Product #${s.product_id}`;
      const pCat = (s as any).product_category || 'General';
      if (!productBreakdown[pName]) {
        productBreakdown[pName] = { qty: 0, revenue: 0, category: pCat };
      }
      productBreakdown[pName].qty += Number(s.qty);
      productBreakdown[pName].revenue += lineRevenue;
    }

    const topProducts: TopProductMetric[] = Object.entries(productBreakdown)
      .map(([name, data]) => ({
        name,
        category: data.category,
        qty: data.qty,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      sales,
      summary: {
        totalRevenue,
        totalQuantity,
        totalTransactions: sales.length,
        productBreakdown,
        topProducts,
      },
    };
  }
}

