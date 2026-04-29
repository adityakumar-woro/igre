// Resend wrapper. If RESEND_API_KEY is not set, sends are silently skipped.
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'IGRE <noreply@igre.ae>';
const resend = apiKey ? new Resend(apiKey) : null;

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload) {
  if (!resend) {
    console.info('[email] skipped (no RESEND_API_KEY):', payload.subject);
    return { ok: false, skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({ from, ...payload });
    if (error) {
      console.error('[email] send failed:', error);
      return { ok: false };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error('[email] threw:', err);
    return { ok: false };
  }
}
