import crypto from 'crypto';
import { User } from '../models/User';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { sendEmail } from '../config/mailer';

export const sendPasswordResetEmail = async (user: User) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

  await PasswordResetToken.create({ token, userId: user.id, expiresAt });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Recuperación de contraseña</h2>
      <p>Hola ${user.first_name} ${user.last_name}, has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
      <a href="${resetLink}" style="
        display: inline-block;
        padding: 12px 24px;
        margin-top: 20px;
        background-color: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      ">
        Restablecer contraseña
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #555;">
        Este enlace expirará en 5 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Recuperación de contraseña',
    html,
  });
};
