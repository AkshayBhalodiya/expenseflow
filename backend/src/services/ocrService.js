import Tesseract from 'tesseract.js';

export async function extractReceiptData(imagePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

    const amountMatch = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i)
      || text.match(/(?:total|amount|amt)[:\s]*([\d,]+(?:\.\d{2})?)/i)
      || text.match(/([\d,]+\.\d{2})/);

    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
      || text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})/i);

    const lines = text.split('\n').filter((l) => l.trim().length > 2);
    const shopName = lines[0]?.trim() || 'Unknown Shop';

    let amount = 0;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    let date = new Date();
    if (dateMatch) {
      const parsed = new Date(dateMatch[1]);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    return {
      shopName,
      amount,
      date,
      rawText: text,
      confidence: amount > 0 ? 'medium' : 'low',
    };
  } catch (error) {
    return {
      shopName: '',
      amount: 0,
      date: new Date(),
      rawText: '',
      confidence: 'low',
      error: error.message,
    };
  }
}
