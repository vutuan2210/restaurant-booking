import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";

/**
 * Get all employees (filtered by restaurant)
 */
export const getEmployees = async (req, res) => {
  try {
    const filter = req.restaurantFilter || {};
    const employees = await Employee.find(filter)
      .populate("user", "username email phone isActive")
      .populate("restaurant", "name");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single employee by ID
 */
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("user", "username email phone isActive")
      .populate("restaurant", "name");
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create new employee (creates User account + Employee record)
 */
export const createEmployee = async (req, res) => {
  try {
    const { employeeCode, fullName, gender, username, password, email, phone, restaurant } = req.body;

    // Validate required fields
    if (!employeeCode || !fullName || !gender || !username || !password || !restaurant) {
      return res.status(400).json({ 
        message: "Missing required fields: employeeCode, fullName, gender, username, password, restaurant" 
      });
    }

    // Check if employeeCode already exists
    const existingEmployeeCode = await Employee.findOne({ employeeCode });
    if (existingEmployeeCode) {
      return res.status(400).json({ message: "Employee code already exists" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User first
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "STAFF",
      restaurant,
      fullName,
      email,
      phone
    });

    // Create Employee record linked to User
    const employee = await Employee.create({
      user: user._id,
      restaurant,
      employeeCode,
      fullName,
      gender
    });

    // Populate the response
    const populatedEmployee = await Employee.findById(employee._id)
      .populate("user", "username email phone")
      .populate("restaurant", "name");

    res.status(201).json(populatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update employee
 */
export const updateEmployee = async (req, res) => {
  try {
    const { fullName, gender, email, phone } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update employee fields
    if (fullName) employee.fullName = fullName;
    if (gender) employee.gender = gender;
    await employee.save();

    // Update associated user fields
    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(employee.user, userUpdate);
    }

    // Populate and return
    const updatedEmployee = await Employee.findById(employee._id)
      .populate("user", "username email phone")
      .populate("restaurant", "name");

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete employee (and associated user account)
 */
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get the user ID before deleting
    const userId = employee.user;

    // Delete employee record
    await Employee.findByIdAndDelete(req.params.id);

    // Delete associated user account
    await User.findByIdAndDelete(userId);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
