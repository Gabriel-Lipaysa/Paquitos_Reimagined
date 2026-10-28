import nodemailer from 'nodemailer';
import { env } from '@/server/env';

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: Number(env.email.port) || 587,
  secure: Number(env.email.port) === 465,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
  tls: {
    // Avoids certificate validation issues on macOS/local dev environments
    rejectUnauthorized: false,
  },
});

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  if (!env.email.user || !env.email.pass || !data.customerEmail) {
    return false;
  }

  const itemsHtml = data.items
    .map((item) => `<li><strong>${item.name}</strong> x ${item.quantity} - ₱${Number(item.price).toFixed(2)}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #008C3B; text-align: center;">${env.email.fromName} - Order Confirmation</h2>
      <p>Hi <strong>${data.customerName}</strong>,</p>
      <p>Thank you for your order! Your delicious pizza is being prepared.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order #${data.orderId}</h3>
        <ul>${itemsHtml}</ul>
        <p style="font-size: 16px; font-weight: bold; color: #008C3B;">Total Price: ₱${Number(data.totalPrice).toFixed(2)}</p>
      </div>
      
      <p>If you have any questions, please reply to this email.</p>
      <p>Best regards,<br><strong>${env.email.fromName} Team</strong></p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${env.email.fromName}" <${env.email.user}>`,
      to: data.customerEmail,
      subject: `Order #${data.orderId} Confirmation - ${env.email.fromName}`,
      html,
    });
    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order email:', error);
    return false;
  }
}

export interface ColdStartAlertData {
  visitorIp?: string;
  userAgent?: string;
  page?: string;
  timestamp?: string;
  reason?: string;
}

export async function sendColdStartAlertEmail(data: ColdStartAlertData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || env.email.user;
  if (!adminEmail || !env.email.pass) {
    console.log('[COLD_START_ALERT] (Logged to console, SMTP not configured):', data);
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #dc2626; margin-top: 0;">⚡ Paquito's Pizza: Visitor Cold Start Alert</h2>
      <p style="font-size: 15px; color: #334155;">
        A customer is currently visiting your website (<strong>${data.page || '/menu'}</strong>) while cloud services (Aiven Database / Cloudinary) are waking up or experiencing cold start latency.
      </p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 14px; line-height: 1.6;">
        <p style="margin: 4px 0;"><strong>Page Visited:</strong> ${data.page || '/menu'}</p>
        <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${data.timestamp || new Date().toLocaleString()}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${data.reason || 'Database (Aiven Cloud) or Cloudinary Cold Start'}</p>
        ${data.visitorIp ? `<p style="margin: 4px 0;"><strong>Visitor IP:</strong> ${data.visitorIp}</p>` : ''}
        ${data.userAgent ? `<p style="margin: 4px 0;"><strong>Device / Browser:</strong> ${data.userAgent}</p>` : ''}
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; color: #166534; font-size: 13px;">
        💡 <em>Action taken:</em> The server sent a database warm-up query to wake up the Aiven MySQL connection pool.
      </div>

      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
        Paquito's Pizza Automated Health Monitor
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${env.email.fromName} Alerts" <${env.email.user}>`,
      to: adminEmail,
      subject: `🚨 [Paquito's Pizza] Customer Waiting - Service Cold Start Ping!`,
      html,
    });
    console.log(`[COLD_START_ALERT] Notification email dispatched to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('[COLD_START_ALERT] Error sending alert email:', error);
    return false;
  }
}
