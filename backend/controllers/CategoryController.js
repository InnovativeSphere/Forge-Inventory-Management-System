import Category from "../modals/categorySchema";

/* =========================
   CREATE CATEGORY (ADMIN)
========================= */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      isActive: true,
    });

    return res.status(201).json({
      message: "Category created",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL ACTIVE CATEGORIES
========================= */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET CATEGORY BY ID
========================= */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.query;

    const category = await Category.findById(id);
    if (!category || !category.isActive) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Get category error:", error);
    return res.status(400).json({ message: "Invalid category ID" });
  }
};

/* =========================
   UPDATE CATEGORY (ADMIN)
========================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.query;
    const update = req.body;

    if (update.name && !update.name.trim()) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      message: "Category updated",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(400).json({ message: "Invalid update data" });
  }
};

/* =========================
   DEACTIVATE CATEGORY (ADMIN)
========================= */
export const deactivateCategory = async (req, res) => {
  try {
    const { id } = req.query;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      message: "Category deactivated",
      category,
    });
  } catch (error) {
    console.error("Deactivate category error:", error);
    return res.status(400).json({ message: "Invalid category ID" });
  }
};

/* =========================
   SEARCH CATEGORIES
========================= */
export const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const categories = await Category.find({
      name: { $regex: q, $options: "i" },
      isActive: true,
    });

    return res.json(categories);
  } catch (error) {
    console.error("Search categories error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CATEGORIES + PRODUCT COUNT
========================= */
export const getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          productCount: { $size: "$products" },
        },
      },
    ]);

    return res.json(categories);
  } catch (error) {
    console.error("Category count error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
