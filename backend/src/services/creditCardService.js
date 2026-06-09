import CreditCard from '../models/CreditCard.js';

export async function adjustCardUsage(creditCardId, userId, delta) {
  if (!creditCardId || delta === 0) return;

  const card = await CreditCard.findOne({ _id: creditCardId, userId, isActive: true });
  if (!card) throw new Error('Credit card not found');

  card.usedAmount = Math.max(0, Math.min(card.creditLimit, card.usedAmount + delta));
  await card.save();
  return card;
}

export async function syncExpenseToCard(expense, oldExpense = null) {
  const oldCardId = oldExpense?.creditCardId?.toString();
  const newCardId = expense.creditCardId?.toString();
  const userId = expense.userId;

  if (oldCardId && (!newCardId || oldCardId !== newCardId)) {
    await adjustCardUsage(oldCardId, userId, -(oldExpense.amount));
  }

  if (newCardId && expense.paymentMethod === 'card') {
    if (!oldCardId || oldCardId !== newCardId) {
      await adjustCardUsage(newCardId, userId, expense.amount);
    } else if (oldExpense && oldExpense.amount !== expense.amount) {
      await adjustCardUsage(newCardId, userId, expense.amount - oldExpense.amount);
    }
  } else if (oldCardId && oldExpense?.paymentMethod === 'card' && expense.paymentMethod !== 'card') {
    await adjustCardUsage(oldCardId, userId, -oldExpense.amount);
  }
}

export async function removeExpenseFromCard(expense) {
  if (expense.creditCardId && expense.paymentMethod === 'card') {
    await adjustCardUsage(expense.creditCardId, expense.userId, -expense.amount);
  }
}

export async function getCreditCardDashboard(userId) {
  const cards = await CreditCard.find({ userId, isActive: true });
  const totalLimit = cards.reduce((s, c) => s + c.creditLimit, 0);
  const totalUsed = cards.reduce((s, c) => s + c.usedAmount, 0);
  const totalAvailable = totalLimit - totalUsed;
  const utilization = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  return {
    totalCards: cards.length,
    totalLimit,
    totalUsed,
    totalAvailable,
    utilization,
    cards: cards.map((c) => ({
      _id: c._id,
      cardName: c.cardName,
      bankName: c.bankName,
      lastFourDigits: c.lastFourDigits,
      creditLimit: c.creditLimit,
      usedAmount: c.usedAmount,
      availableCredit: c.availableCredit,
      utilizationPercent: c.utilizationPercent,
      paymentDueDay: c.paymentDueDay,
      color: c.color,
    })),
  };
}
