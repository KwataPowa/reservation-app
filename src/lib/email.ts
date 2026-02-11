import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

function getFrom() {
  return process.env.EMAIL_FROM || 'ICUBE Resa <noreply@resend.dev>';
}

function getAppUrl() {
  return process.env.APP_URL || 'http://localhost:3000';
}

interface ReservationEmailData {
  materialName: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  purpose?: string | null;
  location?: string | null;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function baseHtml(title: string, content: string) {
  const appUrl = getAppUrl();
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f8fafc;">
      <div style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: #2566AF; padding: 20px 24px;">
          <h1 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">
            ICUBE RESA
          </h1>
        </div>
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a;">${title}</h2>
          ${content}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <a href="${appUrl}" style="display: inline-block; background: #2566AF; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Ouvrir ICUBE Resa
          </a>
        </div>
        <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            Cet email a été envoyé automatiquement par ICUBE Resa.
          </p>
        </div>
      </div>
    </div>
  `;
}

function reservationDetails(data: ReservationEmailData) {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Matériel</td>
        <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${data.materialName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Demandeur</td>
        <td style="padding: 8px 0; font-size: 14px;">${data.userName} (${data.userEmail})</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Période</td>
        <td style="padding: 8px 0; font-size: 14px;">${formatDate(data.startDate)} → ${formatDate(data.endDate)}</td>
      </tr>
      ${data.location ? `
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Lieu</td>
        <td style="padding: 8px 0; font-size: 14px;">${data.location}</td>
      </tr>` : ''}
      ${data.purpose ? `
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Motif</td>
        <td style="padding: 8px 0; font-size: 14px;">${data.purpose}</td>
      </tr>` : ''}
    </table>
  `;
}

export async function sendReservationSubmittedEmail(adminEmails: string[], data: ReservationEmailData) {
  if (!process.env.RESEND_API_KEY || adminEmails.length === 0) return;

  try {
    await getResend().emails.send({
      from: getFrom(),
      to: adminEmails,
      subject: `Nouvelle demande de réservation - ${data.materialName}`,
      html: baseHtml(
        'Nouvelle demande de réservation',
        `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Une nouvelle demande de réservation a été soumise et nécessite votre validation.
        </p>
        ${reservationDetails(data)}`
      ),
    });
  } catch (error) {
    console.error('Failed to send reservation submitted email:', error);
  }
}

export async function sendReservationApprovedEmail(userEmail: string, data: ReservationEmailData) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await getResend().emails.send({
      from: getFrom(),
      to: [userEmail],
      subject: `Réservation approuvée - ${data.materialName}`,
      html: baseHtml(
        'Votre réservation a été approuvée ✓',
        `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Bonne nouvelle ! Votre demande de réservation a été approuvée.
        </p>
        ${reservationDetails(data)}`
      ),
    });
  } catch (error) {
    console.error('Failed to send reservation approved email:', error);
  }
}

export async function sendReservationRejectedEmail(userEmail: string, data: ReservationEmailData) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await getResend().emails.send({
      from: getFrom(),
      to: [userEmail],
      subject: `Réservation refusée - ${data.materialName}`,
      html: baseHtml(
        'Votre réservation a été refusée',
        `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Votre demande de réservation a été refusée par un administrateur.
          N'hésitez pas à le contacter pour plus d'informations.
        </p>
        ${reservationDetails(data)}`
      ),
    });
  } catch (error) {
    console.error('Failed to send reservation rejected email:', error);
  }
}

export async function sendReservationCancelledEmail(adminEmails: string[], data: ReservationEmailData) {
  if (!process.env.RESEND_API_KEY || adminEmails.length === 0) return;

  try {
    await getResend().emails.send({
      from: getFrom(),
      to: adminEmails,
      subject: `Réservation annulée - ${data.materialName}`,
      html: baseHtml(
        'Réservation annulée',
        `<p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Une réservation a été annulée par l'utilisateur.
        </p>
        ${reservationDetails(data)}`
      ),
    });
  } catch (error) {
    console.error('Failed to send reservation cancelled email:', error);
  }
}
