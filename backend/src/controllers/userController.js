import User from '../models/User.js';
import Expense from '../models/Expense.js';
import { logActivity } from '../utils/helpers.js';

export async function getAllUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, pagination: { page: +page, limit: +limit, total } });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity(req.user._id, 'update_role', 'User', user._id, { role }, req.ip);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity(req.user._id, 'delete', 'User', user._id, {}, req.ip);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getAllExpensesAdmin(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const expenses = await Expense.find()
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ date: -1 });
    const total = await Expense.countDocuments();
    res.json({ success: true, data: expenses, pagination: { page: +page, limit: +limit, total } });
  } catch (error) {
    next(error);
  }
}

export async function exportUserData(req, res, next) {
  try {
    const userId = req.user._id;
    const [expenses, income, emis, budgets, goals] = await Promise.all([
      (await import('../models/Expense.js')).default.find({ userId }),
      (await import('../models/Income.js')).default.find({ userId }),
      (await import('../models/EMI.js')).default.find({ userId }),
      (await import('../models/Budget.js')).default.find({ userId }),
      (await import('../models/Goal.js')).default.find({ userId }),
    ]);
    res.json({ success: true, data: { expenses, income, emis, budgets, goals, exportedAt: new Date() } });
  } catch (error) {
    next(error);
  }
}

export async function getActivityHistory(req, res, next) {
  try {
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const logs = await AuditLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}
