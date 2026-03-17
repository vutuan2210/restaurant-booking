import Table from "../models/table.model.js";

export const getTables = async (req, res) => {
  try {
    const { status } = req.query;
    // Use restaurant filter from auth middleware if available
    const filter = req.restaurantFilter || {};
    // Allow override for ADMIN
    if (req.user?.role === "ADMIN" && req.query.restaurant) {
      filter.restaurant = req.query.restaurant;
    }
    if (status) filter.status = status;
    const tables = await Table.find(filter).populate('restaurant');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('restaurant');
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    const populatedTable = await Table.findById(table._id).populate('restaurant');
    res.status(201).json(populatedTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('restaurant');
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.json({ message: "Table deleted", table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableTables = async (req, res) => {
  try {
    const { restaurant } = req.query;
    const filter = { status: "AVAILABLE" };
    if (restaurant) {
      filter.restaurant = restaurant;
    }
    const tables = await Table.find(filter).populate('restaurant');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
