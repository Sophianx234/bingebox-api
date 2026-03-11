import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const data = await resend.emails.send({
      from: 'Binge Box <onboarding@resend.dev>', // After domain verification, use your own domain
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email failed to send:', error);
    return { success: false, error };
  }
};