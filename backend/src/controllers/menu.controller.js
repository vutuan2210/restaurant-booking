import Menu from "../models/menu.model.js";

export const getMenu = async (req, res) => {
  try {
    // Use restaurant filter from auth middleware if available
    const filter = req.restaurantFilter || {};
    // Allow override for ADMIN
    if (req.user?.role === "ADMIN" && req.query.restaurant) {
      filter.restaurant = req.query.restaurant;
    }
    const items = await Menu.find(filter).populate('restaurant');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id).populate('restaurant');
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const item = await Menu.create(req.body);
    const populatedItem = await Menu.findById(item._id).populate('restaurant');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Menu.findByIdAndUpdate(itemId, req.body, { new: true }).populate('restaurant');
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Menu.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Item deleted", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
