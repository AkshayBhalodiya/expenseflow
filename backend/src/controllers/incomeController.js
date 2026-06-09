import Income from '../models/Income.js';
import { incomeSchema } from '../utils/validators.js';
import { logActivity } from '../utils/helpers.js';

export async function getIncome(req, res, next) {
  try {
    const { page = 1, limit = 20, source, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };
    if (source) filter.source = source;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const income = await Income.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ date: -1 });

    const total = await Income.countDocuments(filter);
    res.json({ success: true, data: income, pagination: { page: +page, limit: +limit, total } });
  } catch (error) {
    next(error);
  }
}

export async function createIncome(req, res, next) {
  try {
    const data = incomeSchema.parse(req.body);
    const income = await Income.create({ ...data, userId: req.user._id });
    await logActivity(req.user._id, 'create', 'Income', income._id, {}, req.ip);
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
}

export async function updateIncome(req, res, next) {
  try {
    const data = incomeSchema.partial().parse(req.body);
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!income) return res.status(404).json({ success: false, message: 'Income not found' });
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
}

export async function deleteIncome(req, res, next) {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: 'Income not found' });
    res.json({ success: true, message: 'Income deleted' });
  } catch (error) {
    next(error);
  }
}
