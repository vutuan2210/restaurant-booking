import Reservation from "../models/reservation.model.js";
import Table from "../models/table.model.js";
import Invoice from "../models/invoice.model.js";
import Menu from "../models/menu.model.js";
import User from "../models/user.model.js";

/**
 * 1. Tạo reservation (ONLINE hoặc DIRECT)
 * CLIENT đăng nhập sẽ tự động lấy thông tin từ user
 */
export const createReservation = async (req, res) => {
  try {
    let {
      restaurant,
      customerName,
      customerPhone,
      customerEmail,
      tables,
      menuItems,
      expectedCheckinTime,
      createdBy,
    } = req.body;

    // Nếu là CLIENT đăng nhập, lấy thông tin từ user
    let userId = null;
    if (req.user && req.user.role === "CLIENT") {
      const user = await User.findById(req.user.id);
      if (user) {
        userId = user._id;
        customerName = customerName || user.fullName;
        customerPhone = customerPhone || user.phone;
        customerEmail = customerEmail || user.email;
      }
    }

    // Kiểm tra bàn tồn tại
    const tableDocs = await Table.find({ _id: { $in: tables } });

    if (tableDocs.length !== tables.length) {
      return res.status(400).json({ message: "Invalid table(s)" });
    }

    // Atomic: chỉ update bàn đang AVAILABLE, tránh race condition
    const updated = await Table.updateMany(
      { _id: { $in: tables }, status: "AVAILABLE" },
      { status: "BOOKED" }
    );

    if (updated.modifiedCount !== tables.length) {
      return res.status(409).json({ message: "One or more tables are no longer available" });
    }

    const reservation = await Reservation.create({
      restaurant,
      customerName,
      customerPhone,
      customerEmail,
      user: userId,  // Reference to user if CLIENT
      tables,
      menuItems,
      expectedCheckinTime,
      createdBy: createdBy || (req.user?.role === "CLIENT" ? "ONLINE" : "DIRECT"),
      status: "PENDING",
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 2. Lấy tất cả reservation
 */
export const getReservations = async (req, res) => {
  try {
    // Build filter: STAFF/ADMIN can only see reservations from their restaurant
    const filter = req.restaurantFilter || {};
    
    // If user has a restaurant (STAFF or ADMIN with assigned restaurant), filter by it
    if (req.user?.restaurant) {
      filter.restaurant = req.user.restaurant;
    }
    
    const reservations = await Reservation.find(filter)
      .populate("tables")
      .populate("menuItems.menuItem");

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 3. Lấy chi tiết 1 reservation
 */
export const getReservationById = async (req, res) => {
  try {
    // Build filter: STAFF/ADMIN can only see reservation from their restaurant
    const filter = { _id: req.params.id };
    
    // STAFF and ADMIN can only see their restaurant's reservations
    if (req.user?.restaurant) {
      filter.restaurant = req.user.restaurant;
    }
    
    const reservation = await Reservation.findOne(filter)
      .populate("tables")
      .populate("menuItems.menuItem");

    if (!reservation)
      return res.status(404).json({ message: "Not found" });

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 4. Checkin
 */
export const checkinReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation)
      return res.status(404).json({ message: "Not found" });

    if (reservation.status !== "PENDING") {
      return res.status(400).json({ message: "Cannot checkin" });
    }

    reservation.status = "CHECKED_IN";
    reservation.checkinTime = new Date();
    await reservation.save();

    await Table.updateMany(
      { _id: { $in: reservation.tables } },
      { status: "OCCUPIED" }
    );

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 5. Checkout reservation — auto-generates invoice if not yet created
 */
export const checkoutReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("menuItems.menuItem");

    if (!reservation)
      return res.status(404).json({ message: "Not found" });

    if (reservation.status !== "CHECKED_IN") {
      return res.status(400).json({ message: "Cannot checkout: reservation is not checked in" });
    }

    // Auto-generate invoice if not yet created
    let invoice = await Invoice.findOne({ reservation: req.params.id });
    if (!invoice) {
      const items = [];
      let totalAmount = 0;
      for (const item of reservation.menuItems) {
        if (item.menuItem) {
          const itemTotal = item.menuItem.price * item.quantity;
          const discountAmount = itemTotal * (item.menuItem.discountPercent || 0) / 100;
          const finalItemTotal = itemTotal - discountAmount;
          items.push({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            discountPercent: item.menuItem.discountPercent || 0,
            total: finalItemTotal,
          });
          totalAmount += finalItemTotal;
        }
      }
      invoice = await Invoice.create({
        reservation: req.params.id,
        payerName: reservation.customerName,
        payerPhone: reservation.customerPhone,
        payerEmail: reservation.customerEmail,
        items,
        discount: 0,
        totalAmount,
        paymentMethod: "CASH",
      });
    }

    // Require invoice to be PAID before checkout
    if (invoice.paymentStatus !== "PAID") {
      return res.status(400).json({
        message: "Cannot checkout: invoice has not been paid",
        invoiceId: invoice._id,
        paymentStatus: invoice.paymentStatus
      });
    }

    reservation.status = "COMPLETED";
    reservation.checkoutTime = new Date();
    await reservation.save();

    await Table.updateMany(
      { _id: { $in: reservation.tables } },
      { status: "AVAILABLE" }
    );

    const populatedInvoice = await Invoice.findById(invoice._id).populate("reservation");
    res.json({ reservation, invoice: populatedInvoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 6. Hủy reservation
 */
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation)
      return res.status(404).json({ message: "Not found" });

    if (reservation.status !== "PENDING") {
      return res.status(400).json({
        message: `Cannot cancel reservation with status: ${reservation.status}`
      });
    }

    reservation.status = "CANCELLED";
    await reservation.save();

    await Table.updateMany(
      { _id: { $in: reservation.tables } },
      { status: "AVAILABLE" }
    );

    res.json({ message: "Reservation cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};