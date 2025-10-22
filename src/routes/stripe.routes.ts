import { Router } from 'express';
import {
  createStripeAccount,
  generateStripeOnboardingLink,
  updateStripeVerificationStatus,
} from '../controllers/stripe.controller';
import { verifyToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { stripeSchema } from '../schemas/stripe.schema';

const router = Router();

/**
 * @swagger
 * /stripe/account:
 *   post:
 *     summary: Crea una cuenta Stripe Express y redirige al onboarding
 *     tags:
 *       - Stripe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta Stripe creada o existente, redirigiendo al onboarding
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeOnboardingLinkResponse'
 *       500:
 *         description: Error al crear cuenta Stripe
 */
router.post('/stripe/account', verifyToken, createStripeAccount);

/**
 * @swagger
 * /stripe/onboarding-link:
 *   get:
 *     summary: Genera un nuevo enlace de onboarding para actualizar datos en Stripe
 *     tags:
 *       - Stripe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enlace de onboarding generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeOnboardingLinkResponse'
 *       400:
 *         description: El usuario no tiene cuenta Stripe aún
 *       500:
 *         description: Error al generar el enlace
 */
router.get('/stripe/onboarding-link', verifyToken, generateStripeOnboardingLink);

/**
 * @swagger
 * /stripe/verify:
 *   patch:
 *     summary: Verifica si la cuenta Stripe del usuario está lista para recibir pagos
 *     tags:
 *       - Stripe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de verificación actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeVerificationResponse'
 *       400:
 *         description: El usuario no tiene cuenta Stripe
 *       500:
 *         description: Error al verificar la cuenta
 */

router.patch('/stripe/verify', verifyToken, updateStripeVerificationStatus);

export default router;
