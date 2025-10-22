import { Router } from 'express';
import {
  createEvent,
  getUserEvents,
  getEventById,
  startEvent,
  finishEvent,
  updateEvent,
  generateFolio,
} from '../controllers/event.controller';
import { validateBody } from '../middlewares/validate';
import { verifyToken } from '../middlewares/auth';
import { eventSchema } from '../schemas/event.schema';

const router = Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crea un nuevo evento con paquetes musicales
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       200:
 *         description: Evento creado correctamente
 *       400:
 *         description: Validación fallida
 *       500:
 *         description: Error interno
 */
router.post('/', verifyToken, createEvent);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Actualiza un evento y sus paquetes musicales
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del evento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventInput'
 *     responses:
 *       200:
 *         description: Evento actualizado correctamente
 *       400:
 *         description: Validación fallida
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno
 */
router.patch('/:id', verifyToken, validateBody(eventSchema.update), updateEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtiene los eventos del usuario con filtros y paginación
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: ['not_started', 'active', 'finished'] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Eventos obtenidos correctamente
 *       500:
 *         description: Error interno
 */
router.get('/', verifyToken, getUserEvents);

router.get('/generate-folio', verifyToken, generateFolio);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtiene un evento por ID
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento obtenido correctamente
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /events/{id}/start:
 *   patch:
 *     summary: Inicia un evento
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento iniciado correctamente
 *       400:
 *         description: Evento no válido para iniciar
 */
router.patch('/:id/start', verifyToken, startEvent);

/**
 * @swagger
 * /events/{id}/finish:
 *   patch:
 *     summary: Finaliza un evento
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento finalizado correctamente
 *       400:
 *         description: Evento no válido para finalizar
 */
router.patch('/:id/finish', verifyToken, finishEvent);
/**
 * @swagger
 * /events/{id}/deactivate:
 *   patch:
 *     summary: Desactiva (soft delete) un evento
 *     tags:
 *       - Eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento desactivado correctamente
 *       404:
 *         description: Evento no encontrado
 */
// router.patch('/:id/deactivate', verifyToken, softDeleteCompanyData);

// /**
//  * @swagger
//  * /events/{id}/reactivate:
//  *   patch:
//  *     summary: Reactiva un evento previamente desactivado
//  *     tags:
//  *       - Eventos
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema: { type: string }
//  *     responses:
//  *       200:
//  *         description: Evento reactivado correctamente
//  *       404:
//  *         description: Evento no encontrado
//  */
// router.patch('/:id/reactivate', verifyToken, reactiveCompanyData);

export default router;
