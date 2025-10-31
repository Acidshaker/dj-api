import { sendEmail } from '../config/mailer';
import { User } from '../models/User';
import { Plan } from '../models/Plan';

export const sendSubscriptionConfirmationEmail = async (user: User, plan: Plan) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333;">¡Suscripción confirmada!</h2>
      <p>Hola ${user.first_name} ${user.last_name},</p>
      <p>Has contratado con éxito el plan <strong>${plan.name}</strong>.</p>
      <p>Este plan incluye:</p>
      <ul>
        <li><strong>Precio:</strong> $${plan.price} MXN</li>
        <li><strong>Duración:</strong> ${!plan.days && plan.events ? 'Ilimitado' : plan.days} días</li>
        <li><strong>Eventos permitidos:</strong> ${plan.events && !plan.days ? plan.events : 'Ilimitados'}</li>
      </ul>
      <p>Tu suscripción se renovará automáticamente al finalizar el periodo.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #555;">
        Si tienes dudas o necesitas ayuda, contáctanos respondiente a este correo.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: `Confirmación de suscripción al plan ${plan.name}`,
    html,
  });
};
