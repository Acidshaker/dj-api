import { Router } from 'express';
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { authSchema } from '../schemas/auth.schema';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario y envía correo de verificación
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       200:
 *         description: Usuario ya existe pero no ha verificado su cuenta
 *       409:
 *         description: Ya existe una cuenta verificada con ese correo
 */
router.post('/register', validateBody(authSchema.register), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token JWT
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Usuario o contraseña incorrectos
 *       403:
 *         description: Cuenta inactiva o no verificada
 *       500:
 *         description: Rol no encontrado
 */
router.post('/login', validateBody(authSchema.login), login);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicita el envío de un correo para restablecer la contraseña
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailInput'
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 *       400:
 *         description: Email faltante o inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.post(
  '/request-password-reset',
  validateBody(authSchema.requestPasswordReset),
  requestPasswordReset
);

/**
 * @swagger
 * /auth/reset-password:
 *   patch:
 *     summary: Establece una nueva contraseña usando el token de recuperación
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.patch('/reset-password', validateBody(authSchema.resetPassword), resetPassword);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verifica el correo electrónico del usuario usando el token
 *     tags:
 *       - Autenticación
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado por correo
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenvía el enlace de verificación al correo del usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailInput'
 *     responses:
 *       200:
 *         description: Enlace reenviado correctamente
 *       400:
 *         description: Email faltante
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Cuenta ya verificada
 *       500:
 *         description: Error interno
 */
router.post('/resend-verification', validateBody(authSchema.emailOnly), resendVerificationEmail);

export default router;
