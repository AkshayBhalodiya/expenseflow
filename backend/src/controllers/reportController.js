import { generateReport, exportToCSV, exportToExcel, exportToPDF } from '../services/reportService.js';

export async function getReport(req, res, next) {
  try {
    const report = await generateReport(req.user._id, req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function exportReport(req, res, next) {
  try {
    const { format = 'csv', ...filters } = req.query;
    const report = await generateReport(req.user._id, filters);

    switch (format) {
      case 'csv': {
        const csv = await exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
        return res.send(csv);
      }
      case 'excel': {
        const buffer = await exportToExcel(report);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        return res.send(buffer);
      }
      case 'pdf': {
        const buffer = await exportToPDF(report);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        return res.send(buffer);
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid format. Use csv, excel, or pdf' });
    }
  } catch (error) {
    next(error);
  }
}
