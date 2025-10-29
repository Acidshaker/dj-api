import type { Request, Response } from 'express';
import { Group } from '../models/Group';
import { EventPackage } from '../models/EventPackage';
import { Event } from '../models/Event';
import { errorResponse, successResponse } from '../utils/response';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination';
import { Op } from 'sequelize';
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, packageIds } = req.body;
    const { id } = req.user;

    const exist = await Group.findOne({ where: { name, userId: id } });
    if (exist) {
      return errorResponse({ res, status: 400, message: 'Ya existe un grupo con ese nombre' });
    }

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return errorResponse({ res, status: 400, message: 'Debes enviar al menos un paquete' });
    }

    if (packageIds.length > 5) {
      return errorResponse({
        res,
        status: 400,
        message: 'Un grupo no puede tener más de 5 paquetes',
      });
    }

    const group = await Group.create({ name, userId: id });
    await group.addEventPackages(packageIds);

    return successResponse({ res, message: 'Grupo creado correctamente', data: group });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al crear grupo', error });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, packageIds } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      return errorResponse({ res, status: 404, message: 'Grupo no encontrado' });
    }

    if (packageIds && packageIds.length > 5) {
      return errorResponse({
        res,
        status: 400,
        message: 'Un grupo no puede tener más de 5 paquetes',
      });
    }

    if (name) group.name = name;
    await group.save();

    if (packageIds) {
      await group.setEventPackages(packageIds); // reemplaza los existentes
    }

    return successResponse({ res, message: 'Grupo actualizado correctamente', data: group });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al actualizar grupo', error });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id, {
      include: [{ model: EventPackage, as: 'eventPackages' }],
    });

    if (!group) {
      return errorResponse({ res, status: 404, message: 'Grupo no encontrado' });
    }

    const raw = group.toJSON();
    const response = {
      ...raw,
      packages: raw.eventPackages, // ← si está presente
    };

    return successResponse({ res, message: 'Grupo obtenido correctamente', data: response });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener grupo', error });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { search, is_active } = req.query;
    const { id } = req.user;

    const filters: Record<string, any> = {
      userId: id,
    };

    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    if (search) {
      filters.name = { [Op.iLike]: `%${search}%` };
    }

    const totalCount = await Group.count({ where: filters });

    const packages = await Group.findAll({
      where: filters,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: EventPackage, as: 'eventPackages' }],
    });

    const response = formatPaginatedResponse({ rows: packages, count: totalCount }, page, limit);
    return successResponse({ res, message: 'Grupos obtenidos correctamente', data: response });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener paquetes', error });
  }
};

export const softDeleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await Group.findOne({ where: { id, userId: req.user.id, is_active: true } });
    if (!group) {
      return errorResponse({ res, status: 404, message: 'Grupo no encontrado o ya inactivo' });
    }

    const eventWithGroup = await Event.findOne({
      where: {
        groupId: id,
        is_active: true,
        status: {
          [Op.or]: ['active', 'not_started'],
        },
      },
    });
    if (eventWithGroup) {
      return errorResponse({
        res,
        status: 400,
        message: 'Tienes un evento sin finalizar asociado con este grupo',
      });
    }

    group.is_active = false;
    await group.save();

    return successResponse({ res, message: 'Grupo eliminado correctamente', data: group });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al eliminar grupo', error });
  }
};

export const reactivateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await Group.findOne({
      where: { id, userId: req.user.id, is_active: false },
    });

    if (!group) {
      return errorResponse({
        res,
        status: 404,
        message: 'Grupo no encontrado o ya activo',
      });
    }

    const exist = await Group.findOne({
      where: { name: group.name, userId: req.user.id, is_active: true },
    });

    if (exist) {
      return errorResponse({
        res,
        status: 400,
        message: 'Ya existe un grupo con ese nombre',
      });
    }

    const inactivePackages = await EventPackage.findAll({
      include: {
        model: Group,
        as: 'groups',
        where: { id: group.id },
        through: { attributes: [] },
      },
      where: { is_active: false },
    });

    if (inactivePackages.length > 0) {
      return errorResponse({
        res,
        status: 400,
        message:
          'Este grupo tiene paquetes de evento inactivos asociados. Reactiva o desvincula esos paquetes antes de continuar.',
      });
    }

    group.is_active = true;
    await group.save();

    return successResponse({
      res,
      message: 'Grupo reactivado correctamente',
      data: group,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al reactivar grupo',
      error,
    });
  }
};
