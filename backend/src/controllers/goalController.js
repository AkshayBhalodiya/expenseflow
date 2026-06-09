import Goal from '../models/Goal.js';
import { goalSchema } from '../utils/validators.js';

export async function getGoals(req, res, next) {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const enriched = goals.map((g) => ({
      ...g.toObject(),
      progress: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

export async function createGoal(req, res, next) {
  try {
    const data = goalSchema.parse(req.body);
    const goal = await Goal.create({ ...data, userId: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(req, res, next) {
  try {
    const data = goalSchema.partial().parse(req.body);
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
}

export async function addToGoal(req, res, next) {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
}
