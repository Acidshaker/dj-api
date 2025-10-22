import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/response';
import { User } from '../models/User';
import { Role } from '../models/Role';
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: {
        exclude: ['password', 'is_superuser', 'roleId', 'username'],
      },
    });

    if (!user) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado' });
    }

    // Convertimos el resultado a JSON y ajustamos el formato del rol
    const userData = user.toJSON();
    const roleName = userData.role?.name || null;
    delete userData.role;
    return successResponse({
      res,
      message: 'Perfil obtenido exitosamente',
      data: {
        ...userData,
        role: roleName,
      },
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'No se ha podido obtener el perfil',
      error,
    });
  }
};

export const updateUserName = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;
    const { first_name, last_name } = req.body;

    const user = await User.findByPk(id);
    if (!user || !user.is_active) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado o inactivo' });
    }

    user.first_name = first_name ?? user.first_name;
    user.last_name = last_name ?? user.last_name;
    await user.save();

    return successResponse({ res, message: 'Nombre actualizado correctamente', data: user });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al actualizar nombre', error });
  }
};

export const softDeleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;

    const user = await User.findByPk(id);
    if (!user || !user.is_active) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado o ya inactivo' });
    }

    user.is_active = false;
    await user.save();

    return successResponse({ res, message: 'Usuario desactivado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al desactivar usuario', error });
  }
};
