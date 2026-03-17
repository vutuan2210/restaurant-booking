import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import Employee from "../models/employee.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Clean up existing employees and staff users
await Employee.deleteMany({});
await User.deleteMany({ role: "STAFF" });

// Get all restaurants
const restaurants = await Restaurant.find();
if (restaurants.length === 0) {
  console.log("No restaurants found. Please run restaurant.seed.js first.");
  process.exit();
}

const employeeData = [];

// Generate 5 employees for each restaurant
for (const restaurant of restaurants) {
  const genders = ["MALE", "FEMALE", "OTHER", "MALE", "FEMALE"];
  const positions = ["Phục vụ", "Đầu bếp", "Thu ngân", "Phụ bếp", "Bảo vệ"];
  
  for (let i = 1; i <= 5; i++) {
    const username = `${restaurant.name.replace(/\s+/g, "").toLowerCase()}_${i}`;
    const fullName = `Nhân viên ${positions[i-1]} ${i}`;
    
    // Create User account
    const hashedPassword = await bcrypt.hash("123456", 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "STAFF",
      restaurant: restaurant._id,
      fullName,
      email: `${username}@${restaurant.name.replace(/\s+/g, "").toLowerCase()}.com`,
      phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`
    });

    // Create Employee record
    employeeData.push({
      user: user._id,
      restaurant: restaurant._id,
      employeeCode: `NV${restaurant._id.toString().slice(-4)}${i.toString().padStart(2, '0')}`,
      fullName,
      gender: genders[i-1]
    });
  }
}

await Employee.insertMany(employeeData);

console.log(`Seeded ${employeeData.length} employees (5 per restaurant) successfully`);
process.exit();
