import type { Request, Response } from 'express';
import { EventPackage } from '../models/EventPackage';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination';
import { errorResponse, successResponse } from '../utils/response';
import { Op } from 'sequelize';
import { Group } from '../models/Group';
import { GroupEventPackage } from '../models/GroupEventPackage';

export const createEventPackage = async (req: Request, res: Response) => {
  try {
    const { name, type, tip, isOptionalTip } = req.body;
    const { id } = req.user;

    const exist = await EventPackage.findOne({
      where: { name, is_active: true, userId: id },
    });

    if (exist) {
      return errorResponse({ res, status: 400, message: 'Ya existe un paquete con ese nombre' });
    }

    if (!['song', 'mention', 'both'].includes(type)) {
      return errorResponse({ res, status: 400, message: 'Tipo de paquete inválido' });
    }

    const pkg = await EventPackage.create({
      name,
      max_songs_per_user: 1,
      is_active: true,
      type,
      is_optional_tip: isOptionalTip,
      tip: isOptionalTip ? null : tip,
      userId: id,
    });

    return successResponse({ res, message: 'Paquete creado correctamente', data: pkg });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'No se pudo crear el paquete', error });
  }
};

export const updateEventPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, tip } = req.body;

    const pkg = await EventPackage.findOne({
      where: { id, is_active: true },
    });

    if (!pkg) {
      return errorResponse({ res, status: 404, message: 'Paquete no encontrado o ya inactivo' });
    }

    const duplicate = await EventPackage.findOne({
      where: { name, is_active: true, userId: pkg.userId },
    });

    if (duplicate) {
      return errorResponse({
        res,
        status: 400,
        message: 'Ya existe un paquete activo con el mismo nombre',
      });
    }

    pkg.name = name;
    pkg.type = type;
    pkg.tip = tip;
    await pkg.save();

    return successResponse({ res, message: 'Paquete actualizado correctamente', data: pkg });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al actualizar paquete', error });
  }
};
export const softDeleteEventPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pkg = await EventPackage.findOne({
      where: { id, is_active: true },
    });

    if (!pkg) {
      return errorResponse({ res, status: 404, message: 'Paquete no encontrado o ya inactivo' });
    }

    const groupWithPackage = await GroupEventPackage.findOne({
      where: { eventPackageId: id },
      include: {
        model: Group,
        as: 'group',
        where: { is_active: true },
      },
    });

    if (groupWithPackage) {
      return errorResponse({
        res,
        status: 400,
        message: 'Tienes un grupo activo asociado con este paquete',
      });
    }

    pkg.is_active = false;
    await pkg.save();

    return successResponse({ res, message: 'Paquete desactivado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al desactivar paquete', error });
  }
};

export const reactiveEventPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pkg = await EventPackage.findOne({
      where: { id, is_active: false },
    });

    if (!pkg) {
      return errorResponse({ res, status: 404, message: 'Paquete no encontrado o ya activo' });
    }

    const duplicate = await EventPackage.findOne({
      where: { name: pkg.name, is_active: true, userId: id },
    });

    if (duplicate) {
      return errorResponse({
        res,
        status: 400,
        message: 'Ya existe un paquete activo con el mismo nombre',
      });
    }

    pkg.is_active = true;
    await pkg.save();

    return successResponse({ res, message: 'Paquete reactivado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al reactivar paquete', error });
  }
};

export const getEventPackages = async (req: Request, res: Response) => {
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

    const packages = await EventPackage.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const response = formatPaginatedResponse(packages, page, limit);
    return successResponse({ res, message: 'Paquetes obtenidos correctamente', data: response });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener paquetes', error });
  }
};
