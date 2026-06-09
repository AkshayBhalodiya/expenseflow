import Category from '../models/Category.js';

export const DEFAULT_CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Fuel', 'Rent', 'Electricity',
  'Internet', 'Mobile', 'Entertainment', 'Education', 'Medical', 'Others',
];

export async function seedDefaultCategories() {
  for (const name of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { name },
      { name, isDefault: true, icon: 'tag', color: '#6366f1' },
      { upsert: true, new: true }
    );
  }
}
