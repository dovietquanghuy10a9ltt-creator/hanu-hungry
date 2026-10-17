import nodemailer from "nodemailer";

export interface ContactEmailPayload {
  name: string;
  email: string;
  message: string;
  userId?: string;
}

const DESTINATION_EMAIL = "hanuhungry.mcr@gmail.com";

export async function sendContactNotificationEmail(payload: ContactEmailPayload): Promise<boolean> {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(
      `[contact-mailer] Missing SMTP credentials (GMAIL_USER/GMAIL_APP_PASSWORD or SMTP_USER/SMTP_PASS). ` +
      `Contact message saved to Supabase, but email to ${DESTINATION_EMAIL} was not dispatched.`
    );
    return false;
  }

  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const sendTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #fffdfa;">
        <div style="border-bottom: 2px solid #b52a34; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #b52a34; margin: 0; font-size: 22px; font-weight: 800;">Hanu Hungry · Tin nhắn góp ý mới</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 6px 0 0;">Có một lời nhắn mới được gửi qua biểu mẫu liên hệ trực tuyến.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #4b5563; font-weight: bold; width: 140px; font-size: 14px;">Họ tên:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${escapeHtml(payload.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4b5563; font-weight: bold; font-size: 14px;">Email liên hệ:</td>
            <td style="padding: 8px 0; color: #b52a34; font-size: 15px;"><a href="mailto:${escapeHtml(payload.email)}" style="color: #b52a34; text-decoration: underline;">${escapeHtml(payload.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4b5563; font-weight: bold; font-size: 14px;">Thời gian gửi:</td>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">${sendTime}</td>
          </tr>
        </table>

        <div style="margin-top: 16px;">
          <p style="color: #4b5563; font-weight: bold; font-size: 14px; margin-bottom: 8px;">Nội dung lời nhắn:</p>
          <div style="background-color: #f9f6f0; border-left: 4px solid #b52a34; padding: 16px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">${escapeHtml(payload.message)}</div>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
          <p style="margin: 0;">Email này được gửi tự động từ hệ thống Hanu Hungry.</p>
          <p style="margin: 4px 0 0;">Bạn có thể bấm trả lời (Reply) trực tiếp email này để phản hồi sinh viên.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Hanu Hungry" <${user}>`,
      to: DESTINATION_EMAIL,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: `[Hanu Hungry] Lời nhắn trực tuyến mới từ ${payload.name}`,
      text: `Họ tên: ${payload.name}\nEmail: ${payload.email}\nThời gian: ${sendTime}\n\nNội dung:\n${payload.message}`,
      html: htmlContent,
    });

    console.log(`[contact-mailer] Notification email successfully sent to ${DESTINATION_EMAIL}`);
    return true;
  } catch (error) {
    console.error(`[contact-mailer] Failed to send email to ${DESTINATION_EMAIL}:`, error);
    return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
