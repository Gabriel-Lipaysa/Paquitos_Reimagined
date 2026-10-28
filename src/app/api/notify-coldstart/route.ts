import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { sendColdStartAlertEmail } from '@/lib/email';

// Simple in-memory rate limiting to prevent spamming notification emails
const lastAlertTimeMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const now = Date.now();

    // 30 seconds cooldown per IP address
    const lastTime = lastAlertTimeMap.get(ip) || 0;
    const isRateLimited = now - lastTime < 30 * 1000;

    let dbWarmUpSuccess = false;
    let dbErrorMessage: string | null = null;

    // Actively attempt to wake up Aiven database connection pool
    try {
      await pool.query('SELECT 1 FROM products LIMIT 1');
      dbWarmUpSuccess = true;
    } catch (dbErr: any) {
      dbErrorMessage = dbErr?.message || 'Database still waking up';
      console.warn('[COLD_START_PING] Database wake-up query error:', dbErrorMessage);
    }

    if (!isRateLimited) {
      lastAlertTimeMap.set(ip, now);

      // Clean up map entries older than 5 minutes
      if (lastAlertTimeMap.size > 200) {
        lastAlertTimeMap.forEach((timestamp, key) => {
          if (now - timestamp > 300 * 1000) {
            lastAlertTimeMap.delete(key);
          }
        });
      }

      // Send alert email asynchronously
      sendColdStartAlertEmail({
        visitorIp: ip,
        userAgent,
        page: body.page || '/menu',
        timestamp: new Date().toLocaleString(),
        reason: body.reason || (dbWarmUpSuccess ? 'Customer prompted wake-up' : dbErrorMessage || 'Aiven DB connection delay'),
      }).catch((e) => console.error('[COLD_START_PING] Email dispatch error:', e));

      // Optional webhook notification (Discord / Slack / Telegram)
      const webhookUrl = process.env.COLDSTART_WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **Paquito's Pizza Cold Start Alert**\nA customer is attempting to browse **${body.page || '/menu'}** while cloud services are cold-starting. Ping dispatched! (IP: ${ip})`,
          }),
        }).catch((e) => console.error('[COLD_START_PING] Webhook error:', e));
      }
    }

    return NextResponse.json({
      status: 'success',
      message: dbWarmUpSuccess
        ? 'Store owner notified! Database is now awake and ready.'
        : 'Store owner notified! A wake-up ping was dispatched to the server.',
      dbWarmUpSuccess,
    });
  } catch (error: any) {
    console.error('Error in notify-coldstart route:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
