import type { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination';
import { errorResponse, successResponse } from '../utils/response';
import { Subscription } from '../models/Subscription';
import { Op } from 'sequelize';

export const getPlans = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    const subscription = await Subscription.findOne({ where: { userId: user.id } });
    if (subscription && subscription.status === 'active') {
      // only shows over than planId
      const plans = await Plan.findAll({
        where: { id: { [Op.gt]: subscription.planId } },
        order: [['id', 'ASC']],
      });
      return successResponse({ res, message: 'Planes obtenidos correctamente', data: plans });
    } else {
      if (!user.is_demo) {
        const plans = await Plan.findAll({
          order: [['id', 'ASC']],
        });

        return successResponse({ res, message: 'Planes obtenidos correctamente', data: plans });
      } else {
        const plans = await Plan.findAll({
          where: { is_demo: false },
          order: [['id', 'ASC']],
        });

        return successResponse({ res, message: 'Planes obtenidos correctamente', data: plans });
      }
    }
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener planes', error });
  }
};
