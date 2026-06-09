import Category from '../models/Category.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ isDefault: -1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const category = await Category.create({
      name,
      icon: icon || 'tag',
      color: color || '#6366f1',
      isDefault: false,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default category' });
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
