import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../middleware/auth.js';
import {
  generateToken,
  hashToken,
  sendEmail,
  logActivity,
} from '../utils/helpers.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileSchema,
} from '../utils/validators.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const verificationToken = generateToken();
    const user = await User.create({
      ...data,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Hi ${user.name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();

    await logActivity(user._id, 'login', 'User', user._id, {}, req.ip);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          currency: user.currency,
          theme: user.theme,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, env.jwtRefreshSecret);
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.some((t) => t.token === token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      await user.save();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link has been sent' });
    }

    const resetToken = generateToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    const response = {
      success: true,
      message: 'If this email is registered, a password reset link has been sent.',
    };

    if (process.env.NODE_ENV !== 'production') {
      if (emailResult.previewUrl) response.previewUrl = emailResult.previewUrl;
      if (!emailResult.sent) response.devResetUrl = resetUrl;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res) {
  res.json({ success: true, data: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const data = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, data, { new: true }).select('-password -refreshTokens');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: `/uploads/${req.file.filename}` },
      { new: true }
    ).select('-password -refreshTokens');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
