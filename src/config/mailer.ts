import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true para puerto 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  try {
    console.log('📡 Verificando conexión SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    const info = await transporter.sendMail({
      from: `"Paramq Admin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('📤 Email enviado:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};
