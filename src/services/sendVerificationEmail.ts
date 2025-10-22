import { User } from '../models/User';
import { EmailVerificationToken } from '../models/EmailVerificationToken';
import { sendEmail } from '../config/mailer';
import crypto from 'crypto';

export const sendVerificationEmail = async (user: User) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await EmailVerificationToken.create({ token, userId: user.id, expiresAt });

  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Verifica tu cuenta</h2>
      <p>Hola ${user.first_name}, gracias por registrarte. Haz clic en el botón para activar tu cuenta:</p>
      <a href="${verifyLink}" style="
        display: inline-block;
        padding: 12px 24px;
        margin-top: 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      ">
        Activar cuenta
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #555;">
        Este enlace expirará en 1 hora. Si no solicitaste este registro, puedes ignorar este mensaje.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verifica tu cuenta',
    html,
  });
};
