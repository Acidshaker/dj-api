import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../services/auth';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { errorResponse, successResponse } from '../utils/response';
import { sendPasswordResetEmail } from '../services/sendPasswordResetEmail';
import { sendVerificationEmail } from '../services/sendVerificationEmail';
import { EmailVerificationToken } from '../models/EmailVerificationToken';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, roleId, is_superuser, first_name, last_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.is_verified) {
        return errorResponse({
          res,
          status: 409,
          message: 'Ya existe una cuenta con este correo electrónico',
        });
      }

      // ✅ Usuario no verificado: reenviar correo
      await sendVerificationEmail(existingUser);

      return errorResponse({
        res,
        status: 400,
        message:
          'Ya existe una cuenta pendiente de verificación. Se ha reenviado el enlace al correo.',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashed,
      username,
      roleId,
      is_superuser: is_superuser || false,
      stripeAccountId: null,
      isStripeVerified: false,
      subscription_status: 'none',
      subscription_end: null,
      events_remaining: 0,
      is_active: true,
      is_verified: false,
    });

    await sendVerificationEmail(user);

    return successResponse({
      res,
      status: 201,
      message: 'Usuario registrado correctamente. Revisa tu correo para activar la cuenta.',
      data: { id: user.id, email: user.email },
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 400,
      message: 'Error al registrar usuario',
      error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return errorResponse({ res, status: 401, message: 'Usuario o contraseña incorrectos' });
  }

  if (!user.is_active || !user.is_verified) {
    return errorResponse({
      res,
      status: 403,
      message: 'Tu cuenta no está activa o no ha sido verificada',
    });
  }

  const role = await Role.findByPk(user.roleId);
  if (!role) {
    return errorResponse({ res, status: 500, message: 'Rol no encontrado para el usuario' });
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: role.name,
    subscription_status: user.subscription_status,
    stripeAccountId: user.stripeAccountId || null,
    first_name: user.first_name,
    last_name: user.last_name,
  });

  return successResponse({ res, message: 'Login exitoso', data: { token } });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse({
        res,
        status: 400,
        message: 'Debes proporcionar un correo electrónico',
        fields: [{ field: 'email', message: 'Campo requerido' }],
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse({
        res,
        status: 404,
        message: 'Usuario no encontrado',
        fields: [{ field: 'email', message: 'Correo electrónica no registrado' }],
      });
    }

    await sendPasswordResetEmail(user);

    return successResponse({
      res,
      message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al procesar la solicitud de recuperación',
      error,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse({
        res,
        status: 400,
        message: 'Token y nueva contraseña son requeridos',
        fields: [
          { field: 'token', message: 'Campo requerido' },
          { field: 'newPassword', message: 'Campo requerido' },
        ],
      });
    }

    const resetToken = await PasswordResetToken.findOne({ where: { token } });

    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.is_used) {
      return errorResponse({
        res,
        status: 400,
        message: 'Token inválido, expirado o ya utilizado',
      });
    }

    const user = await User.findByPk(resetToken.userId);
    if (!user) {
      return errorResponse({
        res,
        status: 404,
        message: 'Usuario no encontrado',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    resetToken.is_used = true;
    await resetToken.save();

    return successResponse({
      res,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al restablecer la contraseña',
      error,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    console.log(token);

    if (!token || typeof token !== 'string') {
      return errorResponse({ res, status: 400, message: 'Token inválido' });
    }

    const record = await EmailVerificationToken.findOne({ where: { token } });

    if (!record || record.expiresAt < new Date() || record.is_used) {
      return errorResponse({ res, status: 400, message: 'Token expirado o ya utilizado' });
    }

    const user = await User.findByPk(record.userId);
    if (!user) {
      return errorResponse({ res, status: 404, message: 'Usuario no encontrado' });
    }

    user.is_verified = true;
    await user.save();

    record.is_used = true;
    await record.save();

    return successResponse({ res, message: 'Correo verificado correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al verificar correo', error });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse({
        res,
        status: 400,
        message: 'Debes proporcionar un correo electrónico',
        fields: [{ field: 'email', message: 'Campo requerido' }],
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse({
        res,
        status: 404,
        message: 'No existe una cuenta con ese correo',
      });
    }

    if (user.is_verified) {
      return errorResponse({
        res,
        status: 409,
        message: 'La cuenta ya ha sido verificada',
      });
    }

    await sendVerificationEmail(user);

    return successResponse({
      res,
      message: 'Se ha reenviado el enlace de verificación al correo proporcionado',
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al reenviar el enlace de verificación',
      error,
    });
  }
};
