import { Router } from 'express';
import { getProfile, updateUserName, softDeleteUser } from '../controllers/user.controller';
import { validateBody } from '../middlewares/validate';
import { userSchema } from '../schemas/user.schema';
import { verifyToken } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       500:
 *         description: Error al obtener el perfil
 */
router.get('/profile', verifyToken, getProfile);

/**
 * @swagger
 * /users/{id}/update-name:
 *   patch:
 *     summary: Actualiza el nombre y apellido del usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserNameInput'
 *     responses:
 *       200:
 *         description: Nombre actualizado correctamente
 *       404:
 *         description: Usuario no encontrado o inactivo
 *       500:
 *         description: Error interno
 */
router.patch('/update-name', verifyToken, validateBody(userSchema.updateName), updateUserName);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Desactiva (soft delete) al usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       404:
 *         description: Usuario no encontrado o ya inactivo
 *       500:
 *         description: Error interno
 */
router.patch('/deactivate', verifyToken, softDeleteUser);

export default router;
