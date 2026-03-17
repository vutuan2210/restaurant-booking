import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/restaurant.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const restaurants = [
  {
    name: "Nhà hàng Biển Đông",
    address: "Hà Nội",
    openTime: "08:00",
    closeTime: "22:00",
    description: "Hải sản tươi sống",
    images: []
  },
  {
    name: "Lẩu Phố Cổ",
    address: "Hà Nội",
    openTime: "09:00",
    closeTime: "23:00",
    description: "Lẩu bò, lẩu gà đặc sản",
    images: []
  },
  {
    name: "BBQ Sài Gòn",
    address: "TP.HCM",
    openTime: "10:00",
    closeTime: "23:00",
    description: "Đồ nướng than hoa",
    images: []
  },
  {
    name: "Cơm Nhà 1989",
    address: "Đà Nẵng",
    openTime: "07:00",
    closeTime: "21:00",
    description: "Cơm gia đình truyền thống",
    images: []
  },
  {
    name: "Tokyo Sushi",
    address: "Hà Nội",
    openTime: "10:00",
    closeTime: "22:30",
    description: "Ẩm thực Nhật Bản",
    images: []
  }
];

await Restaurant.insertMany(restaurants);

console.log("Seeded restaurants successfully");
process.exit();