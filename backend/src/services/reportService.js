import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import EMI from '../models/EMI.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

function getDateRange(period, startDate, endDate) {
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case 'daily':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

export async function generateReport(userId, { period, startDate, endDate, category, minAmount, maxAmount, type }) {
  const { start, end } = getDateRange(period, startDate, endDate);
  const result = { period, startDate: start, endDate: end, expenses: [], income: [], emis: [], summary: {} };

  const expenseFilter = { userId, date: { $gte: start, $lte: end } };
  if (category) expenseFilter.category = category;
  if (minAmount !== undefined || maxAmount !== undefined) {
    expenseFilter.amount = {};
    if (minAmount !== undefined) expenseFilter.amount.$gte = minAmount;
    if (maxAmount !== undefined) expenseFilter.amount.$lte = maxAmount;
  }

  if (!type || type === 'expense') {
    result.expenses = await Expense.find(expenseFilter).sort({ date: -1 });
  }
  if (!type || type === 'income') {
    result.income = await Income.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 });
  }
  if (!type || type === 'emi') {
    result.emis = await EMI.find({ userId, isActive: true });
  }

  const totalExpenses = result.expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = result.income.reduce((s, i) => s + i.amount, 0);
  const totalEmi = result.emis.reduce((s, e) => s + e.emiAmount, 0);

  result.summary = {
    totalExpenses,
    totalIncome,
    totalEmi,
    netSavings: totalIncome - totalExpenses - totalEmi,
    expenseCount: result.expenses.length,
    incomeCount: result.income.length,
  };

  return result;
}

export async function exportToCSV(report) {
  const rows = [
    ...report.expenses.map((e) => ({
      type: 'Expense',
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date.toISOString().split('T')[0],
    })),
    ...report.income.map((i) => ({
      type: 'Income',
      title: i.source,
      category: i.source,
      amount: i.amount,
      date: i.date.toISOString().split('T')[0],
    })),
  ];

  const parser = new Parser({ fields: ['type', 'title', 'category', 'amount', 'date'] });
  return parser.parse(rows);
}

export async function exportToExcel(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Expense Manager';

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Metric', 'Value']);
  summarySheet.addRow(['Total Income', report.summary.totalIncome]);
  summarySheet.addRow(['Total Expenses', report.summary.totalExpenses]);
  summarySheet.addRow(['Total EMI', report.summary.totalEmi]);
  summarySheet.addRow(['Net Savings', report.summary.netSavings]);

  const expenseSheet = workbook.addWorksheet('Expenses');
  expenseSheet.addRow(['Title', 'Category', 'Amount', 'Date', 'Payment Method']);
  report.expenses.forEach((e) => {
    expenseSheet.addRow([e.title, e.category, e.amount, e.date, e.paymentMethod]);
  });

  const incomeSheet = workbook.addWorksheet('Income');
  incomeSheet.addRow(['Source', 'Amount', 'Date', 'Notes']);
  report.income.forEach((i) => {
    incomeSheet.addRow([i.source, i.amount, i.date, i.notes]);
  });

  return workbook.xlsx.writeBuffer();
}

export function exportToPDF(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Expense Management Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Summary');
    doc.fontSize(11);
    doc.text(`Total Income: ₹${report.summary.totalIncome.toLocaleString('en-IN')}`);
    doc.text(`Total Expenses: ₹${report.summary.totalExpenses.toLocaleString('en-IN')}`);
    doc.text(`Total EMI: ₹${report.summary.totalEmi.toLocaleString('en-IN')}`);
    doc.text(`Net Savings: ₹${report.summary.netSavings.toLocaleString('en-IN')}`);
    doc.moveDown();

    doc.fontSize(14).text('Expenses');
    report.expenses.slice(0, 50).forEach((e) => {
      doc.fontSize(10).text(`${e.date.toLocaleDateString()} - ${e.title} (${e.category}): ₹${e.amount}`);
    });

    doc.end();
  });
}
