import CreditCard from '../models/CreditCard.js';
import CreditCardPayment from '../models/CreditCardPayment.js';
import Expense from '../models/Expense.js';
import { creditCardSchema, creditCardPaymentSchema } from '../utils/validators.js';
import { adjustCardUsage, getCreditCardDashboard } from '../services/creditCardService.js';
import { logActivity } from '../utils/helpers.js';

export async function getCreditCards(req, res, next) {
  try {
    const cards = await CreditCard.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const enriched = cards.map((c) => ({
      ...c.toObject(),
      availableCredit: c.availableCredit,
      utilizationPercent: c.utilizationPercent,
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const data = await getCreditCardDashboard(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createCreditCard(req, res, next) {
  try {
    const data = creditCardSchema.parse(req.body);
    const card = await CreditCard.create({ ...data, userId: req.user._id, usedAmount: 0 });
    await logActivity(req.user._id, 'create', 'CreditCard', card._id, {}, req.ip);
    res.status(201).json({
      success: true,
      data: { ...card.toObject(), availableCredit: card.availableCredit, utilizationPercent: 0 },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCreditCard(req, res, next) {
  try {
    const data = creditCardSchema.partial().parse(req.body);
    const card = await CreditCard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Credit card not found' });

    if (data.creditLimit !== undefined && data.creditLimit < card.usedAmount) {
      return res.status(400).json({
        success: false,
        message: `Credit limit cannot be less than used amount (${card.usedAmount})`,
      });
    }

    Object.assign(card, data);
    await card.save();
    res.json({
      success: true,
      data: { ...card.toObject(), availableCredit: card.availableCredit, utilizationPercent: card.utilizationPercent },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCreditCard(req, res, next) {
  try {
    const card = await CreditCard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Credit card not found' });
    if (card.usedAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete card with outstanding balance. Pay bill first.',
      });
    }
    await card.deleteOne();
    res.json({ success: true, message: 'Credit card deleted' });
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req, res, next) {
  try {
    const data = creditCardPaymentSchema.parse(req.body);
    const card = await CreditCard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return res.status(404).json({ success: false, message: 'Credit card not found' });

    if (data.amount > card.usedAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed outstanding balance (${card.usedAmount})`,
      });
    }

    const payment = await CreditCardPayment.create({
      ...data,
      creditCardId: card._id,
      userId: req.user._id,
    });

    await adjustCardUsage(card._id, req.user._id, -data.amount);
    const updated = await CreditCard.findById(card._id);

    await logActivity(req.user._id, 'payment', 'CreditCard', card._id, { amount: data.amount }, req.ip);

    res.status(201).json({
      success: true,
      data: { payment, card: { ...updated.toObject(), availableCredit: updated.availableCredit } },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const payments = await CreditCardPayment.find({
      creditCardId: req.params.id,
      userId: req.user._id,
    }).sort({ paymentDate: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

export async function getCardTransactions(req, res, next) {
  try {
    const expenses = await Expense.find({
      creditCardId: req.params.id,
      userId: req.user._id,
      paymentMethod: 'card',
    }).sort({ date: -1 }).limit(50);
    res.json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
}
