import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/response';
import { CompanyData } from '../models/CompanyData';
import { uploadCompanyLogo, deleteFileFromS3 } from '../services/s3';
import { Op } from 'sequelize';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination';

export const getUserCompanyData = async (req: Request, res: Response) => {
  try {
    // const { page, limit, offset } = getPaginationParams(req);
    // const { is_active, search } = req.query;

    // const filters: any = {
    //   userId: req.user.id,
    // };

    // // ✅ Filtro por estado
    // if (is_active !== undefined) {
    //   filters.is_active = is_active === 'true';
    // }

    // // ✅ Filtro por búsqueda
    // if (search) {
    //   filters.company_name = {
    //     [Op.iLike]: `%${search}%`, // PostgreSQL: case-insensitive
    //   };
    // }

    const companyData = await CompanyData.findOne({
      // where: filters,
      // limit,
      // offset,
      order: [['createdAt', 'DESC']],
    });

    // const response = formatPaginatedResponse(companyData, page, limit);

    return successResponse({ res, message: 'Datos de empresa obtenidos', data: companyData });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener datos de empresa', error });
  }
};

export const createCompanyData = async (req: Request, res: Response) => {
  try {
    const { company_name, company_phone, company_email } = req.body;
    const file = req.file;

    const companyData = await CompanyData.create({
      company_name,
      company_phone,
      company_email,
      userId: req.user.id,
      logo: '',
    });
    if (file) {
      const logoUrl = await uploadCompanyLogo(
        file.buffer,
        file.originalname,
        req.user.email,
        file.mimetype
      );

      companyData.logo = logoUrl;
      await companyData.save();
    }

    return successResponse({ res, message: 'Empresa registrada correctamente', data: companyData });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, status: 500, message: 'Error al crear empresa', error });
  }
};

export const updateCompanyData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { company_name, company_phone, company_email, replace_logo } = req.body;
    const file = req.file;

    const companyData = await CompanyData.findOne({
      where: { id, userId: req.user.id, is_active: true },
    });

    if (!companyData) {
      return errorResponse({ res, status: 404, message: 'Empresa no encontrada o inactiva' });
    }

    // ✅ Si se solicita reemplazo de logo
    if (replace_logo === true) {
      if (companyData.logo) {
        await deleteFileFromS3(companyData.logo);
      }

      if (file) {
        const logoUrl = await uploadCompanyLogo(
          file.buffer,
          file.originalname,
          req.user.email,
          file.mimetype
        );
        companyData.logo = logoUrl;
      } else {
        companyData.logo = null;
      }
    }

    // ✅ Actualizar campos restantes
    companyData.company_name = company_name ?? companyData.company_name;
    companyData.company_phone = company_phone ?? companyData.company_phone;
    companyData.company_email = company_email ?? companyData.company_email;

    await companyData.save();

    return successResponse({
      res,
      message: 'Empresa actualizada correctamente',
      data: companyData,
    });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al actualizar empresa', error });
  }
};

export const softDeleteCompanyData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const companyData = await CompanyData.findOne({
      where: { id, userId: req.user.id, is_active: true },
    });

    if (!companyData) {
      return errorResponse({ res, status: 404, message: 'Empresa no encontrada o ya inactiva' });
    }

    companyData.is_active = false;
    await companyData.save();

    return successResponse({ res, message: 'Empresa desactivada correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al desactivar empresa', error });
  }
};

export const reactiveCompanyData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const companyData = await CompanyData.findOne({
      where: { id, userId: req.user.id, is_active: false },
    });

    if (!companyData) {
      return errorResponse({ res, status: 404, message: 'Empresa no encontrada o ya activa' });
    }

    companyData.is_active = true;
    await companyData.save();

    return successResponse({ res, message: 'Empresa reactivada correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al reactivar empresa', error });
  }
};
