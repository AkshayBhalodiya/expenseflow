import EMI from '../models/EMI.js';
import { emiSchema } from '../utils/validators.js';
import { logActivity } from '../utils/helpers.js';

export async function getEMIs(req, res, next) {
  try {
    const filter = { userId: req.user._id };
    if (req.query.active !== undefined) filter.isActive = req.query.active === 'true';
    const emis = await EMI.find(filter).sort({ nextDueDate: 1 });
    res.json({ success: true, data: emis });
  } catch (error) {
    next(error);
  }
}

export async function getEMIDashboard(req, res, next) {
  try {
    const emis = await EMI.find({ userId: req.user._id, isActive: true });
    const totalLoanAmount = emis.reduce((s, e) => s + e.totalAmount, 0);
    const totalPaid = emis.reduce((s, e) => s + e.paidInstallments * e.emiAmount, 0);
    const remainingBalance = emis.reduce((s, e) => s + e.remainingBalance, 0);
    const upcoming = emis.sort((a, b) => a.nextDueDate - b.nextDueDate)[0];

    res.json({
      success: true,
      data: {
        totalLoanAmount,
        totalPaid,
        remainingBalance,
        upcomingEmi: upcoming ? { loanName: upcoming.loanName, amount: upcoming.emiAmount, dueDate: upcoming.nextDueDate } : null,
        activeLoans: emis.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEMI(req, res, next) {
  try {
    const data = emiSchema.parse(req.body);
    const emi = await EMI.create({
      ...data,
      userId: req.user._id,
      paidInstallments: 0,
      remainingBalance: data.totalAmount,
      nextDueDate: data.startDate,
    });
    await logActivity(req.user._id, 'create', 'EMI', emi._id, {}, req.ip);
    res.status(201).json({ success: true, data: emi });
  } catch (error) {
    next(error);
  }
}

export async function updateEMI(req, res, next) {
  try {
    const data = emiSchema.partial().parse(req.body);
    const emi = await EMI.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      data,
      { new: true }
    );
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });
    res.json({ success: true, data: emi });
  } catch (error) {
    next(error);
  }
}

export async function payEMI(req, res, next) {
  try {
    const emi = await EMI.findOne({ _id: req.params.id, userId: req.user._id });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });

    emi.paidInstallments += 1;
    emi.remainingBalance = Math.max(0, emi.remainingBalance - emi.emiAmount);
    const nextDue = new Date(emi.nextDueDate);
    nextDue.setMonth(nextDue.getMonth() + 1);
    emi.nextDueDate = nextDue;

    if (emi.paidInstallments >= emi.totalInstallments) {
      emi.isActive = false;
      emi.remainingBalance = 0;
    }

    await emi.save();
    res.json({ success: true, data: emi });
  } catch (error) {
    next(error);
  }
}

export async function deleteEMI(req, res, next) {
  try {
    const emi = await EMI.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });
    res.json({ success: true, message: 'EMI deleted' });
  } catch (error) {
    next(error);
  }
}
