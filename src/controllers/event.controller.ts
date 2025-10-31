import type { Request, Response } from 'express';
import { Event } from '../models/Event';
import { CompanyData } from '../models/CompanyData';
import { EventMusic } from '../models/EventMusic';
import { errorResponse, successResponse } from '../utils/response';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination';
import { Op, WhereOptions } from 'sequelize';
import { EventPackage } from '../models/EventPackage';
import { Group } from '../models/Group';
import { Mention } from '../models/Mention';
import { Music } from '../models/Music';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { checkSubscription } from '../services/checkSubscription';

export const generateFolio = async (req: Request, res: Response) => {
  const { id } = req.user;
  const fourNumbers = (value: number) => value.toString().padStart(4, '0');
  try {
    const events = await Event.findAll({ where: { userId: id } });
    const folio = `EVENTO-${fourNumbers(events.length + 1)}`;
    return successResponse({ res, message: 'Folio generado correctamente', data: folio });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al generar folio', error });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { folio, name, date, groupId, companyDataId } = req.body;

    const user = await User.findByPk(req.user.id);
    console.log(user);
    if (!user || !user.is_active) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado o inactivo' });
    }

    // validar suscripcion del usuario
    if (user.subscription_status === 'expired' || user.subscription_status === 'none') {
      0;
      return errorResponse({ res, status: 403, message: 'Usuario sin suscripción activa' });
    }

    // Validar folio duplicado
    const exist = await Event.findOne({ where: { folio, userId: req.user.id } });
    if (exist) {
      return errorResponse({ res, status: 400, message: 'Ya existe un evento con ese folio' });
    }

    // Validar grupo
    const group = await Group.findOne({ where: { id: groupId, userId: req.user.id } });
    if (!group) {
      return errorResponse({
        res,
        status: 400,
        message: 'Grupo no válido o no pertenece al usuario',
      });
    }

    // Validar empresa si se envía
    let validCompanyDataId: string | null = null;
    if (companyDataId) {
      const company = await CompanyData.findOne({
        where: { id: companyDataId, userId: req.user.id, is_active: true },
      });
      validCompanyDataId = company ? companyDataId : null;
    }

    // Crear evento
    const event = await Event.create({
      folio,
      name,
      date,
      groupId,
      companyDataId: validCompanyDataId,
      userId: req.user.id,
      status: 'not_started',
      is_active: true,
    });

    const subscription = await Subscription.findOne({
      where: { userId: req.user.id },
    });

    if (
      user.events_remaining &&
      user.events_remaining > 0 &&
      subscription &&
      subscription.events_remaining
    ) {
      user.events_remaining = user.events_remaining - 1;
      subscription.events_remaining = subscription.events_remaining - 1;
      if (user.events_remaining === 0) {
        user.subscription_status = 'expired';
        subscription.status = 'expired';
      }
      await subscription.save();
      await user.save();
    }

    event.qr_url = `${process.env.FRONTEND_URL}/client/event/${event.id}`;
    await event.save();

    return successResponse({ res, message: 'Evento creado correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al crear evento', error });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, name, companyDataId, groupId } = req.body;

    const event = await Event.findOne({ where: { id, userId: req.user.id, is_active: true } });
    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado o inactivo' });
    }

    if (companyDataId) {
      const company = await CompanyData.findOne({
        where: { id: companyDataId, userId: req.user.id, is_active: true },
      });
      event.companyDataId = company ? companyDataId : null;
    }

    if (groupId) {
      console.log(groupId);
      const group = await Group.findOne({ where: { id: groupId, userId: req.user.id } });
      if (!group) {
        return errorResponse({
          res,
          status: 400,
          message: 'Grupo no válido o no pertenece al usuario',
        });
      }
      event.groupId = groupId;
    }

    event.date = date ?? event.date;
    event.name = name ?? event.name;
    await event.save();

    return successResponse({ res, message: 'Evento actualizado correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al actualizar evento', error });
  }
};

export const getUserEvents = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { month, year, status, search, is_active } = req.query;

    const filters: any = { userId: req.user.id };
    if (status) filters.status = status;
    if (search) filters.name = { [Op.iLike]: `%${search}%` };
    if (month && year) {
      filters.date = {
        [Op.and]: [
          { [Op.gte]: new Date(`${year}-${month}-01`) },
          { [Op.lt]: new Date(`${year}-${Number(month) + 1}-01`) },
        ],
      };
    }

    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    const events = await Event.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['date', 'DESC']],
      include: [
        {
          model: CompanyData,
          as: 'companyData',
          attributes: ['company_name', 'logo', 'company_email', 'company_phone'],
        },
      ],
    });

    // Obtener conteo de solicitudes musicales por evento
    const resultsWithCounts = await Promise.all(
      events.rows.map(async (event: any) => {
        const count = await EventMusic.count({ where: { eventId: event.id } });
        return {
          ...event.toJSON(),
          music_requests_count: count,
        };
      })
    );

    const response = formatPaginatedResponse(
      { count: events.count, rows: resultsWithCounts },
      page,
      limit
    );

    return successResponse({
      res,
      message: 'Eventos obtenidos correctamente',
      data: response,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al obtener eventos',
      error,
    });
  }
};

export const startEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ where: { id, userId: req.user.id, is_active: true } });
    if (!event || event.status !== 'not_started') {
      return errorResponse({ res, status: 400, message: 'Evento no válido para iniciar' });
    }

    const isAvailable = await checkSubscription(req.user);

    if (!isAvailable) {
      return errorResponse({
        res,
        status: 400,
        message: 'No tienes una suscripcion activa',
      });
    }

    const hasOtherActiveEvent = await Event.findOne({
      where: { userId: req.user.id, status: 'active' },
    });
    if (hasOtherActiveEvent) {
      return errorResponse({
        res,
        status: 400,
        message: 'No puedes tener mas de un evento activo',
      });
    }
    event.status = 'active';
    event.started_at = new Date();
    await event.save();

    return successResponse({ res, message: 'Evento iniciado correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al iniciar evento', error });
  }
};

export const finishEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  try {
    const event = await Event.findOne({ where: { id, userId: req.user.id, is_active: true } });
    if (!event || event.status !== 'active') {
      return errorResponse({ res, status: 400, message: 'Evento no válido para finalizar' });
    }

    event.status = 'finished';
    event.finished_at = new Date();
    await event.save();

    return successResponse({ res, message: 'Evento finalizado correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al finalizar evento', error });
  }
};

export const softDeleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ where: { id, userId: req.user.id, is_active: true } });
    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado o ya inactivo' });
    }

    event.is_active = false;
    await event.save();

    return successResponse({ res, message: 'Evento desactivado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al desactivar evento', error });
  }
};

export const reactivateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ where: { id, userId: req.user.id, is_active: false } });
    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado o ya activo' });
    }

    const isActiveGroup = await Group.findOne({ where: { id: event.groupId, is_active: true } });
    if (!isActiveGroup) {
      return errorResponse({ res, status: 400, message: 'Grupo asociado al evento no activo' });
    }

    event.is_active = true;
    await event.save();

    return successResponse({ res, message: 'Evento reactivado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al reactivar evento', error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: { id, userId: req.user.id, is_active: true },
      include: [
        {
          model: CompanyData,
          as: 'companyData',
          attributes: ['company_name', 'company_phone', 'company_email', 'logo'],
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name'],
        },
      ],
      attributes: {
        exclude: ['userId', 'packages', 'groupId'],
      },
    });

    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado' });
    }

    const response = {
      ...event.toJSON(),
      packages: event.group?.eventPackages || [],
    };

    return successResponse({ res, message: 'Evento obtenido correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener evento', error });
  }
};

export const getEventByIdClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: CompanyData,
          as: 'companyData',
          attributes: ['company_name', 'company_phone', 'company_email', 'logo'],
        },
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: EventPackage,
              as: 'eventPackages',
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'is_active', 'userId'],
              },
            },
          ],
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'id', 'is_active', 'userId'],
          },
        },
      ],
      attributes: {
        exclude: [
          'groupId',
          'id',
          'qr_url',
          'folio',
          'companyDataId',
          'createdAt',
          'updatedAt',
          'started_at',
          'finished_at',
          'date',
          'is_active',
        ],
      },
    });

    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado' });
    }

    return successResponse({ res, message: 'Evento obtenido correctamente', data: event });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener evento', error });
  }
};

export const getEventMusicsByEventId = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { is_played, search, eventId } = req.query;

    const event = await Event.findOne({
      where: { id: eventId, userId: req.user.id, is_active: true },
    });

    if (!event) {
      return errorResponse({ res, status: 404, message: 'Evento no encontrado o inactivo' });
    }

    // const isAvailable = await checkSubscription(req.user);

    // if (!isAvailable) {
    //   return errorResponse({
    //     res,
    //     status: 400,
    //     message: 'No tienes una suscripcion activa',
    //   });
    // }

    // Construir condiciones
    const baseConditions: any = { eventId };
    if (is_played !== undefined) {
      baseConditions.is_played = is_played === 'true';
    }

    const searchConditions =
      search && typeof search === 'string'
        ? {
            [Op.or]: [
              { '$music.name$': { [Op.iLike]: `%${search}%` } },
              { '$music.author$': { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

    const eventMusics = await EventMusic.findAndCountAll({
      where: {
        ...baseConditions,
        ...searchConditions,
      },
      include: [
        { model: Mention, as: 'mention' },
        { model: Music, as: 'music' },
      ],
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'is_active',
          'application_date',
          'description',
          'eventId',
        ],
      },
      limit,
      offset,
      order: [['application_number', 'ASC']],
    });

    const response = formatPaginatedResponse(eventMusics, page, limit);
    return successResponse({
      res,
      message: 'Solicitudes musicales obtenidas correctamente',
      data: response,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al obtener solicitudes musicales del evento',
      error,
    });
  }
};

export const getStripeAvailablePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id: id },
    });
    if (!user) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado' });
    }
    return successResponse({
      res,
      message: 'Metodo de pago obtenido correctamente',
      data: user.isStripeVerified,
    });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener metodo de pago', error });
  }
};
