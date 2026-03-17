import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Get all restaurants
const restaurants = await Restaurant.find();
console.log(`Found ${restaurants.length} restaurants`);

const menuItems = [
  // Nhà hàng Biển Đông - Hải sản
  { restaurant: restaurants[0]._id, code: "BD001", name: "Cá Hấp Nước Mắm", category: "FOOD", price: 280000, unit: "món", description: "Cá tươi hấp với nước mắm đặc biệt" },
  { restaurant: restaurants[0]._id, code: "BD002", name: "Tôm Hấp Xì Dầu", category: "FOOD", price: 320000, unit: "món", description: "Tôm sú tươi hấp xì dầu" },
  { restaurant: restaurants[0]._id, code: "BD003", name: "Cua Rang Me", category: "FOOD", price: 450000, unit: "món", description: "Cua biển rang me chua ngọt" },
  { restaurant: restaurants[0]._id, code: "BD004", name: "Mực Chiên Nước Mắm", category: "FOOD", price: 250000, unit: "món", description: "Mực tươi chiên nước mắm" },
  { restaurant: restaurants[0]._id, code: "BD005", name: "Sò Điệp Nướng Phô Mai", category: "FOOD", price: 180000, unit: "đĩa", description: "Sò điệp nướng phô mai" },
  { restaurant: restaurants[0]._id, code: "BD006", name: "Bia Sài Gòn", category: "DRINK", price: 25000, unit: "chai", description: "Bia tươi Sài Gòn" },
  { restaurant: restaurants[0]._id, code: "BD007", name: "Nước Cam Tươi", category: "DRINK", price: 35000, unit: "ly", description: "Nước cam ép tươi" },
  
  // Lẩu Phố Cổ - Lẩu
  { restaurant: restaurants[1]._id, code: "LP001", name: "Lẩu Bò Ba Sao", category: "FOOD", price: 550000, unit: "nồi", description: "Lẩu bò đặc sản phố cổ" },
  { restaurant: restaurants[1]._id, code: "LP002", name: "Lẩu Gà Riêng", category: "FOOD", price: 450000, unit: "nồi", description: "Lẩu gà riềng măng chua" },
  { restaurant: restaurants[1]._id, code: "LP003", name: "Thịt Bò Tái", category: "FOOD", price: 180000, unit: "đĩa", description: "Thịt bò tươi thái mỏng" },
  { restaurant: restaurants[1]._id, code: "LP004", name: "Gà Tẩm Bột", category: "FOOD", price: 150000, unit: "đĩa", description: "Gà tươi tẩm bột chiên giòn" },
  { restaurant: restaurants[1]._id, code: "LP005", name: "Măng Tươi", category: "FOOD", price: 80000, unit: "đĩa", description: "Măng tươi luộc" },
  { restaurant: restaurants[1]._id, code: "LP006", name: "Bia Hà Nội", category: "DRINK", price: 20000, unit: "chai", description: "Bia Hà Nội tươi" },
  { restaurant: restaurants[1]._id, code: "LP007", name: "Trà Tắc Kè", category: "DRINK", price: 30000, unit: "ly", description: "Trà tắc kè giải nhiệt" },
  
  // BBQ Sài Gòn - Đồ nướng
  { restaurant: restaurants[2]._id, code: "BB001", name: "Thịt Heo Nướng", category: "FOOD", price: 220000, unit: "đĩa", description: "Thịt heo ba chỉ nướng than hoa" },
  { restaurant: restaurants[2]._id, code: "BB002", name: "Bò Mỹ Nướng", category: "FOOD", price: 380000, unit: "đĩa", description: "Thịt bò Mỹ nướng tiêu xanh" },
  { restaurant: restaurants[2]._id, code: "BB003", name: "Sườn Xào Chua Ngọt", category: "FOOD", price: 180000, unit: "đĩa", description: "Sườn heo xào chua ngọt" },
  { restaurant: restaurants[2]._id, code: "BB004", name: "Rau Muống Xào Tỏi", category: "FOOD", price: 60000, unit: "đĩa", description: "Rau muống xào tỏi" },
  { restaurant: restaurants[2]._id, code: "BB005", name: "Coca Cola", category: "DRINK", price: 25000, unit: "chai", description: "Coca Cola lạnh" },
  { restaurant: restaurants[2]._id, code: "BB006", name: "Lavie", category: "DRINK", price: 15000, unit: "chai", description: "Nước khoáng Lavie" },
  { restaurant: restaurants[2]._id, code: "BB007", name: "Bánh Mì Nướng", category: "FOOD", price: 80000, unit: " ổ", description: "Bánh mì nướng vỉ, mỡ hành" },
  
  // Cơm Nhà 1989 - Cơm gia đình
  { restaurant: restaurants[3]._id, code: "CN001", name: "Cơm Trắng", category: "FOOD", price: 15000, unit: "đĩa", description: "Cơm trắng dẻo thơm" },
  { restaurant: restaurants[3]._id, code: "CN002", name: "Canh Chua Cá", category: "FOOD", price: 120000, unit: "nồi", description: "Canh chua cá lóc đồng" },
  { restaurant: restaurants[3]._id, code: "CN003", name: "Thịt Kho Trứng", category: "FOOD", price: 100000, unit: "đĩa", description: "Thịt ba chỉ kho trứng" },
  { restaurant: restaurants[3]._id, code: "CN004", name: "Rau Luộc", category: "FOOD", price: 40000, unit: "đĩa", description: "Rau củ luộc chấm mắm" },
  { restaurant: restaurants[3]._id, code: "CN005", name: "Chả Trứng", category: "FOOD", price: 80000, unit: "đĩa", description: "Chả trứng hấp" },
  { restaurant: restaurants[3]._id, code: "CN006", name: "Nước Lọc", category: "DRINK", price: 10000, unit: "chai", description: "Nước lọc tinh khiết" },
  { restaurant: restaurants[3]._id, code: "CN007", name: "Mắm Tôm", category: "DRINK", price: 20000, unit: "chai", description: "Mắm tôm đặc sản" },
  
  // Tokyo Sushi - Ẩm thực Nhật
  { restaurant: restaurants[4]._id, code: "TS001", name: "Sushi Cá Hồi", category: "FOOD", price: 180000, unit: "bát", description: "Sushi cá hồi tươi Na Uy" },
  { restaurant: restaurants[4]._id, code: "TS002", name: "Sushi Bò Nướng", category: "FOOD", price: 220000, unit: "bát", description: "Sushi bò nướng wasabi" },
  { restaurant: restaurants[4]._id, code: "TS003", name: "Sashimi Cá Tuna", category: "FOOD", price: 280000, unit: "đĩa", description: "Sashimi cá tuna tươi" },
  { restaurant: restaurants[4]._id, code: "TS004", name: "Tempura Tôm", category: "FOOD", price: 150000, unit: "đĩa", description: "Tôm tempura giòn rụm" },
  { restaurant: restaurants[4]._id, code: "TS005", name: "Ramen Bò", category: "FOOD", price: 200000, unit: "tô", description: "Ramen bò hầm miso" },
  { restaurant: restaurants[4]._id, code: "TS006", name: "Sake", category: "DRINK", price: 120000, unit: "chai", description: "Rượu sake Nhật Bản" },
  { restaurant: restaurants[4]._id, code: "TS007", name: "Trà Xanh", category: "DRINK", price: 40000, unit: "ly", description: "Trà xanh Matcha" }
];

const result = await Menu.insertMany(menuItems);
console.log(`Seeded ${result.length} menu items`);

// Show menu count per restaurant
for (const restaurant of restaurants) {
  const count = await Menu.countDocuments({ restaurant: restaurant._id });
  console.log(`${restaurant.name}: ${count} menu items`);
}

process.exit();
