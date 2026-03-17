import mongoose from "mongoose";
import dotenv from "dotenv";
import Table from "../models/table.model.js";
import Restaurant from "../models/restaurant.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Get all restaurants
const restaurants = await Restaurant.find();
console.log(`Found ${restaurants.length} restaurants`);

// Clear existing tables
await Table.deleteMany({});
console.log("Cleared existing tables");

const tables = [
  // Nhà hàng Biển Đông - 4 bàn
  { restaurant: restaurants[0]._id, tableNumber: 1, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[0]._id, tableNumber: 2, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[0]._id, tableNumber: 3, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[0]._id, tableNumber: 4, capacity: 6, status: "AVAILABLE" },
  
  // Lẩu Phố Cổ - 4 bàn
  { restaurant: restaurants[1]._id, tableNumber: 1, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[1]._id, tableNumber: 2, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[1]._id, tableNumber: 3, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[1]._id, tableNumber: 4, capacity: 6, status: "AVAILABLE" },
  
  // BBQ Sài Gòn - 4 bàn
  { restaurant: restaurants[2]._id, tableNumber: 1, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[2]._id, tableNumber: 2, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[2]._id, tableNumber: 3, capacity: 6, status: "AVAILABLE" },
  { restaurant: restaurants[2]._id, tableNumber: 4, capacity: 8, status: "AVAILABLE" },
  
  // Cơm Nhà 1989 - 4 bàn
  { restaurant: restaurants[3]._id, tableNumber: 1, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[3]._id, tableNumber: 2, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[3]._id, tableNumber: 3, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[3]._id, tableNumber: 4, capacity: 6, status: "AVAILABLE" },
  
  // Tokyo Sushi - 4 bàn
  { restaurant: restaurants[4]._id, tableNumber: 1, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[4]._id, tableNumber: 2, capacity: 2, status: "AVAILABLE" },
  { restaurant: restaurants[4]._id, tableNumber: 3, capacity: 4, status: "AVAILABLE" },
  { restaurant: restaurants[4]._id, tableNumber: 4, capacity: 4, status: "AVAILABLE" }
];

const result = await Table.insertMany(tables);
console.log(`Created ${result.length} tables`);

// Show table count per restaurant
for (const restaurant of restaurants) {
  const count = await Table.countDocuments({ restaurant: restaurant._id });
  const tableDetails = await Table.find({ restaurant: restaurant._id }).sort({ tableNumber: 1 });
  
  console.log(`\n${restaurant.name}: ${count} tables`);
  tableDetails.forEach(table => {
    console.log(`  Table ${table.tableNumber}: ${table.capacity} seats - ${table.status}`);
  });
}

process.exit();
