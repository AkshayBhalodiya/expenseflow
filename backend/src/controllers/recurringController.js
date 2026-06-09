import RecurringTransaction from '../models/RecurringTransaction.js';
import { recurringSchema } from '../utils/validators.js';

export async function getRecurring(req, res, next) {
  try {
    const recurring = await RecurringTransaction.find({ userId: req.user._id }).sort({ nextRunDate: 1 });
    res.json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
}

export async function createRecurring(req, res, next) {
  try {
    const data = recurringSchema.parse(req.body);
    const recurring = await RecurringTransaction.create({
      ...data,
      userId: req.user._id,
      nextRunDate: data.startDate,
    });
    res.status(201).json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
}

export async function updateRecurring(req, res, next) {
  try {
    const data = recurringSchema.partial().parse(req.body);
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecurring(req, res, next) {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
}

export async function toggleRecurring(req, res, next) {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    recurring.isActive = !recurring.isActive;
    await recurring.save();
    res.json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
}
