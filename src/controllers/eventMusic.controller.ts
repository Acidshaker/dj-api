import type { Request, Response } from 'express';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { errorResponse, successResponse } from '../utils/response';
import { createStripeSession } from '../services/generatePaymentSession';

export const initiateMusicRequest = async (req: Request, res: Response) => {
  try {
    const { applicant, eventId, type, description, tip, name, author, album_logo, duration } =
      req.body;

    if (!applicant || !eventId || !type || !tip) {
      return errorResponse({ res, status: 400, message: 'Faltan campos obligatorios' });
    }

    if (!['mention', 'song'].includes(type)) {
      return errorResponse({ res, status: 400, message: 'Tipo de solicitud inválido' });
    }

    const event = await Event.findOne({ where: { id: eventId, is_active: true } });
    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado o inactivo' });
    }

    const user = await User.findByPk(event.userId);
    if (!user || !user.stripeAccountId) {
      return errorResponse({
        res,
        status: 400,
        message: 'El usuario del evento no tiene Stripe configurado',
      });
    }

    const sessionUrl = await createStripeSession({
      applicant,
      eventId,
      type,
      description,
      tip,
      stripeAccountId: user.stripeAccountId,
      name,
      author,
      album_logo,
      duration,
    });

    return successResponse({ res, message: 'Sesión de pago creada', data: { url: sessionUrl } });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al iniciar solicitud musical',
      error,
    });
  }
};
