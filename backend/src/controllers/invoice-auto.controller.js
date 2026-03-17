import Invoice from "../models/invoice.model.js";
import Reservation from "../models/reservation.model.js";
import Menu from "../models/menu.model.js";

/**
 * Tính tiền tự động từ reservation menu items
 */
export const generateInvoice = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    // Get reservation with populated menu items
    const reservation = await Reservation.findById(reservationId)
      .populate('menuItems.menuItem');
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status !== "CHECKED_IN") {
      return res.status(400).json({ message: "Can only generate invoice for checked-in reservation" });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ reservation: reservationId });
    if (existingInvoice) {
      return res.status(400).json({ message: "Invoice already exists for this reservation" });
    }

    // Calculate items and total
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
          total: finalItemTotal
        });
        
        totalAmount += finalItemTotal;
      }
    }

    // Create invoice
    const invoice = await Invoice.create({
      reservation: reservationId,
      payerName: reservation.customerName,
      payerPhone: reservation.customerPhone,
      payerEmail: reservation.customerEmail,
      items,
      discount: 0,
      totalAmount,
      paymentMethod: "CASH" // Default, can be updated later
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('reservation');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cập nhật payment method và tính lại với discount
 */
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, discount } = req.body;
    
    const invoice = await Invoice.findById(id).populate('reservation');
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update payment method
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    // Apply discount and recalculate
    if (discount !== undefined) {
      invoice.discount = discount;
      const itemTotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
      invoice.totalAmount = Math.max(0, itemTotal - discount);
    }

    await invoice.save();

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
