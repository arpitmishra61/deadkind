import nodemailer from "nodemailer";

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

export async function sendMail({ to, subject, html }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[mailer] Gmail env vars not set — skipping email to", to);
    return;
  }
  const transporter = getTransporter();
  return transporter.sendMail({
    from: `"Dead'Kind" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
