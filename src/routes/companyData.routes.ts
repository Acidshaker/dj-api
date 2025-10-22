import { Router } from 'express';
import {
  getUserCompanyData,
  createCompanyData,
  updateCompanyData,
  softDeleteCompanyData,
} from '../controllers/companyData.controller';
import { validateBody } from '../middlewares/validate';
import { verifyToken } from '../middlewares/auth';
import { companyDataSchema } from '../schemas/companyData.schema';
import { upload } from '../config/multer';

const router = Router();

/**
 * @swagger
 * /company-data:
 *   get:
 *     summary: Obtiene los datos de empresa del usuario autenticado con paginación y filtros
 *     tags:
 *       - Datos de Empresa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre de empresa
 *     responses:
 *       200:
 *         description: Datos obtenidos correctamente
 *       500:
 *         description: Error interno
 */
router.get('/', getUserCompanyData);

/**
 * @swagger
 * /company-data:
 *   post:
 *     summary: Crea un nuevo registro de empresa
 *     tags:
 *       - Datos de Empresa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyDataInput'
 *     responses:
 *       200:
 *         description: Empresa creada correctamente
 *       400:
 *         description: Logo requerido
 *       500:
 *         description: Error interno
 */
router.post('/', upload.single('logo'), validateBody(companyDataSchema.create), createCompanyData);

/**
 * @swagger
 * /company-data/{id}:
 *   patch:
 *     summary: Actualiza los datos de empresa y opcionalmente reemplaza el logo
 *     tags:
 *       - Datos de Empresa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro de empresa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyDataInput'
 *     responses:
 *       200:
 *         description: Empresa actualizada correctamente
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno
 */
router.patch(
  '/:id',
  upload.single('logo'),
  validateBody(companyDataSchema.update),
  updateCompanyData
);

/**
 * @swagger
 * /company-data/{id}/deactivate:
 *   patch:
 *     summary: Desactiva (soft delete) un registro de empresa
 *     tags:
 *       - Datos de Empresa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro de empresa
 *     responses:
 *       200:
 *         description: Empresa desactivada correctamente
 *       404:
 *         description: Empresa no encontrada o ya inactiva
 *       500:
 *         description: Error interno
 */
router.patch('/:id/deactivate', softDeleteCompanyData);

export default router;
