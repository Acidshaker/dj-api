import { sendEmail } from '../config/mailer';
import { User } from '../models/User';

export const sendSubscriptionCancellationEmail = async (user: User) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Suscripción cancelada</h2>
      <p>Hola ${user.first_name} ${user.last_name},</p>
      <p>Tu suscripción ha sido cancelada correctamente. Ya no se realizarán cargos futuros.</p>
      <p>Si deseas volver a contratar un plan, puedes hacerlo desde tu panel en cualquier momento.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #555;">
        Si esta cancelación fue un error o necesitas ayuda, contáctanos respondiendo a este correo.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Tu suscripción ha sido cancelada',
    html,
  });
};
