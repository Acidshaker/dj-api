import type { Request, Response } from 'express';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { errorResponse, successResponse } from '../utils/response';
import { createStripeSession } from '../services/generatePaymentSession';
import { EventMusic } from '../models/EventMusic';
import { Mention } from '../models/Mention';
import { Music } from '../models/Music';
import { broadcastEventMusic } from '../app';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const initiateMusicRequest = async (req: Request, res: Response) => {
  try {
    const {
      applicant,
      eventId,
      type,
      description,
      tip,
      name,
      author,
      album_logo,
      spotify_url,
      duration,
      paymentMethod,
    } = req.body;

    if (!eventId || !type || tip == null || !paymentMethod) {
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
    if (paymentMethod === 'cash') {
      const last = await EventMusic.findOne({
        where: { eventId },
        order: [['application_number', 'DESC']],
      });
      const application_number = last ? last.application_number + 1 : 1;
      const eventMusic = await EventMusic.create({
        applicant: applicant || 'Cliente anónimo',
        type,
        description,
        tip: tip,
        application_date: new Date(),
        application_number: application_number,
        eventId,
        is_paid: tip ? false : true,
        is_played: false,
        stripeSessionId: null,
        payment_method: 'cash',
      });

      if (type === 'mention') {
        await Mention.create({
          text: description || '',
          eventMusicId: eventMusic.id,
        });
      }

      if (type === 'song') {
        await Music.create({
          name: name || 'Canción sin nombre',
          author: author || 'Desconocido',
          album_logo: album_logo || '',
          duration: duration || '00:00',
          spotify_url: spotify_url || '',
          eventMusicId: eventMusic.id,
        });
      }

      broadcastEventMusic({
        id: eventMusic.id,
        applicant: eventMusic.applicant,
        type: eventMusic.type,
        tip: eventMusic.tip,
        application_number: eventMusic.application_number,
        eventId: eventMusic.eventId,
        url: `${frontendUrl}/events/${eventMusic.eventId}`,
      });

      return successResponse({ res, message: 'Solicitud creada', data: eventMusic });
    }
    if (!user || !user.stripeAccountId) {
      return errorResponse({
        res,
        status: 400,
        message: 'El usuario del evento no tiene Stripe configurado',
      });
    }

    const sessionUrl = await createStripeSession({
      applicant: applicant || 'cliente anónimo',
      eventId,
      type,
      description,
      tip,
      stripeAccountId: user.stripeAccountId,
      name,
      author,
      album_logo,
      spotify_url,
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

export const completeEventMusic = async (req: Request, res: Response) => {
  const { eventMusicId, isPaid } = req.body;
  try {
    const eventMusic = await EventMusic.findOne({
      where: { id: eventMusicId },
    });
    if (!eventMusic) {
      return errorResponse({
        res,
        status: 404,
        message: 'Solicitud no encontrada o ya completada',
      });
    }

    eventMusic.is_played = true;
    if (!eventMusic.is_paid && isPaid) {
      eventMusic.is_paid = true;
    }
    await eventMusic.save();

    return successResponse({ res, message: 'Solicitud musical completada correctamente' });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al completar solicitud musical',
      error,
    });
  }
};

export const changeToPaidEventMusic = async (req: Request, res: Response) => {
  const { eventMusicId } = req.body;
  try {
    const eventMusic = await EventMusic.findOne({
      where: { id: eventMusicId },
    });
    if (!eventMusic) {
      return errorResponse({
        res,
        status: 404,
        message: 'Solicitud no encontrada o ya completada',
      });
    }

    eventMusic.is_paid = true;
    await eventMusic.save();

    return successResponse({ res, message: 'Solicitud musical completada correctamente' });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al completar solicitud musical',
      error,
    });
  }
};

export const getEventMusicBySession = async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ message: 'Falta el session_id' });
  }

  try {
    const eventMusic = await EventMusic.findOne({
      where: { stripeSessionId: session_id },
      include: { model: Event, as: 'event', attributes: ['qr_url', 'name'] },
    });
    if (!eventMusic) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: eventMusic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener la solicitud' });
  }
};
