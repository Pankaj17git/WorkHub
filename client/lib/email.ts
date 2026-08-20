import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail: string, otp: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"WorkHub Auth" <${smtpUser}>`,
        to: toEmail,
        subject: `Your WorkHub Verification Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4f46e5; text-align: center;">WorkHub Security</h2>
            <p style="font-size: 16px; color: #333;">Your verification OTP code is:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1f2937;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              This code will expire in 10 minutes. If you did not request this code, please ignore this email.
            </p>
          </div>
        `,
      });
      console.log(`[Email Sent Successfully] OTP ${otp} sent to ${toEmail}`);
      return { sent: true, method: "smtp" };
    } catch (err: any) {
      console.error(`[SMTP Dispatch Failed]:`, err.message);
      return {
        sent: false,
        method: "smtp_error",
        reason: "Gmail authentication failed. Please generate a 16-character App Password at https://myaccount.google.com/apppasswords",
        errorDetails: err.message,
      };
    }
  } else {
    console.log(`[Email Config Missing - Console Fallback] To: ${toEmail} | OTP Code: ${otp}`);
    return {
      sent: false,
      method: "console",
      reason: "Configure GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails",
    };
  }
}
