# Restaurant Reservation System - Complete Features Documentation

## 1. Restaurant Management (Quản lý nhà hàng)

### API Endpoints:
- `GET /api/restaurants` - Lấy danh sách tất cả nhà hàng
- `GET /api/restaurants/:id` - Lấy chi tiết nhà hàng
- `POST /api/restaurants` - Tạo nhà hàng mới
- `PUT /api/restaurants/:id` - Cập nhật thông tin nhà hàng
- `DELETE /api/restaurants/:id` - Xóa nhà hàng

### Data Model:
```json
{
  "name": "Nhà hàng Biển Đông",
  "address": "Hà Nội",
  "openTime": "08:00",
  "closeTime": "22:00",
  "description": "Hải sản tươi sống",
  "images": []
}
```

---

## 2. Menu Management (Quản lý thực đơn) ĐANG THỪA THẺ MÀ KHÔNG THUỘC NHÀ HÀNG NÀO 

### API Endpoints:
- `GET /api/menus` - Lấy danh sách món ăn
- `POST /api/menus` - Thêm món ăn mới
- `PUT /api/menus/:itemId` - Cập nhật món ăn
- `DELETE /api/menus/:itemId` - Xóa món ăn

### Data Model:
```json
{
  "name": "Cá Hấp Nước Mắm",
  "price": 250000,
  "description": "Cá tươi hấp với nước mắm đặc biệt",
  "category": "Hải sản",
  "image": "url/to/image",
  "restaurant": "restaurant_id"
}
```

---

## 3. Table Management (Quản lý bàn)

### API Endpoints:
- `GET /api/tables` - Lấy danh sách bàn (có filter theo restaurant)
- `GET /api/tables/available` - Lấy bàn trống
- `GET /api/tables/:id` - Lấy chi tiết bàn
- `POST /api/tables` - Tạo bàn mới
- `PUT /api/tables/:id` - Cập nhật thông tin bàn
- `DELETE /api/tables/:id` - Xóa bàn

### Data Model:
```json
{
  "restaurant": "restaurant_id",
  "tableNumber": 1,
  "capacity": 4,
  "status": "AVAILABLE" // AVAILABLE, BOOKED, OCCUPIED
}
```

### Query Parameters:
- `?restaurant=<restaurant_id>` - Lọc bàn theo nhà hàng

---

## 4. Reservation Management (Quản lý đặt bàn)

### API Endpoints:
- `POST /api/reservations` - Tạo đặt bàn mới
- `GET /api/reservations` - Lấy danh sách đặt bàn
- `GET /api/reservations/:id` - Lấy chi tiết đặt bàn
- `PUT /api/reservations/:id/checkin` - Checkin khách hàng
- `PUT /api/reservations/:id/cancel` - Hủy đặt bàn

### Data Model:
```json
{
  "restaurant": "restaurant_id",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "tables": ["table_id_1", "table_id_2"],
  "menuItems": [
    {
      "menuItem": "menu_item_id",
      "quantity": 2
    }
  ],
  "expectedCheckinTime": "2026-03-05T18:00:00.000Z",
  "createdBy": "ONLINE", // ONLINE, DIRECT
  "status": "PENDING" // PENDING, CHECKED_IN, COMPLETED, CANCELLED, EXPIRED
}
```

### Reservation Logic:
1. **Tạo đặt bàn:**
   - Kiểm tra bàn tồn tại
   - Kiểm tra bàn đang AVAILABLE
   - Tạo reservation với status PENDING
   - Cập nhật bàn status → BOOKED

2. **Checkin:**
   - Chỉ checkin khi status = PENDING
   - Cập nhật reservation status → CHECKED_IN
   - Set checkinTime = current time
   - Cập nhật bàn status → OCCUPIED

3. **Hủy đặt bàn:**
   - Cập nhật reservation status → CANCELLED
   - Cập nhật bàn status → AVAILABLE

---

## 5. Automated Features (Tính năng tự động)

### 5.1 Auto-Cancel Job
**Mục đích:** Tự động hủy các đặt bàn quá giờ

**Logic:**
- Chạy mỗi 1 phút (`*/1 * * * *`)
- Tìm các reservation với:
  - `status = PENDING`
  - `expectedCheckinTime < now - 15 minutes`
- Thực hiện:
  - Cập nhật reservation status → CANCELLED
  - Cập nhật bàn status → AVAILABLE
  - Log: `Auto cancelled: {reservation_id}`

**Chi tiết:**
```javascript
// Sau 15 phút từ thời gian checkin dự kiến mà không checkin
// thì hệ thống tự động hủy và trả bàn về trạng thái AVAILABLE
const expiredTime = new Date(now.getTime() - 15 * 60 * 1000);
```

---

## 6. Database Relationships

### Models:
1. **Restaurant** - Thông tin nhà hàng
2. **Menu** - Thực đơn (thuộc restaurant)
3. **Table** - Bàn (thuộc restaurant)
4. **Reservation** - Đặt bàn (liên kết restaurant, tables, menuItems)

### Relationships:
- Restaurant → Tables (1-n)
- Restaurant → Menu (1-n)
- Reservation → Restaurant (n-1)
- Reservation → Tables (n-n)
- Reservation → MenuItems (n-n)

---

## 7. Error Handling & Validation

### Common Errors:
- 404: Resource not found
- 400: Invalid input (table not available, invalid ID)
- 500: Server error

### Validations:
- Table phải tồn tại và AVAILABLE khi đặt
- Reservation chỉ checkin khi status = PENDING
- ObjectId validation cho tất cả ID
- Required fields validation

---

## 8. Usage Examples

### Tạo đặt bàn hoàn chỉnh:
```bash
# 1. Lấy nhà hàng
GET /api/restaurants

# 2. Lấy bàn trống của nhà hàng
GET /api/tables/available?restaurant=restaurant_id

# 3. Tạo đặt bàn
POST /api/reservations
{
  "restaurant": "restaurant_id",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "tables": ["table_id"],
  "menuItems": [],
  "expectedCheckinTime": "2026-03-05T18:00:00.000Z",
  "createdBy": "ONLINE"
}

# 4. Checkin sau khi khách đến
PUT /api/reservations/reservation_id/checkin

# 5. Nếu không checkin sau 15 phút, hệ thống tự động hủy
```

---

## 9. Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Scheduling:** node-cron
- **Environment:** ES6 Modules
- **Real-time:** Auto-cancel job runs every minute

---

## 10. Deployment Notes

- Server runs on port 5000 (configurable via PORT env)
- MongoDB connection via MONGO_URI env
- Auto-cancel job starts automatically with app
- All endpoints support CORS for frontend integration
