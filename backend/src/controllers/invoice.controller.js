import Invoice from "../models/invoice.model.js";
import Reservation from "../models/reservation.model.js";

export const getInvoices = async (req, res) => {
  try {
    const { reservation } = req.query;
    
    // Use restaurant filter from auth middleware if available
    // Invoice is linked to reservation, which has a restaurant
    let filter = req.restaurantFilter || {};
    
    // Allow override for ADMIN
    if (req.user?.role === "ADMIN" && req.query.restaurant) {
      filter = { reservation: { $exists: true } }; // Will need to join
    }
    
    if (reservation) filter.reservation = reservation;
    
    const invoices = await Invoice.find(filter)
      .populate({
        path: 'reservation',
        populate: { path: 'restaurant' }
      })
      .sort({ createdAt: -1 });
    
    // For STAFF/ADMIN, filter by their restaurant after populate
    let result = invoices;
    if (req.user?.role !== "ADMIN" && req.user?.restaurant) {
      result = invoices.filter(inv =>
        inv.reservation?.restaurant?._id.toString() === req.user.restaurant.toString()
      );
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('reservation');
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const {
      reservation,
      payerName,
      payerPhone,
      payerEmail,
      items,
      discount,
      totalAmount,
      paymentMethod
    } = req.body;

    // Check if reservation exists and is checked in
    const reservationDoc = await Reservation.findById(reservation);
    if (!reservationDoc) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservationDoc.status !== "CHECKED_IN") {
      return res.status(400).json({ message: "Cannot create invoice for reservation that is not checked in" });
    }

    // Check if invoice already exists for this reservation
    const existingInvoice = await Invoice.findOne({ reservation });
    if (existingInvoice) {
      return res.status(400).json({ message: "Invoice already exists for this reservation" });
    }

    const invoice = await Invoice.create({
      reservation,
      payerName,
      payerPhone,
      payerEmail,
      items,
      discount: discount || 0,
      totalAmount,
      paymentMethod
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('reservation');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { paymentMethod, discount, totalAmount } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentMethod, discount, totalAmount },
      { new: true }
    ).populate('reservation');
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark invoice as PAID
 */
export const markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "PAID", paymentDate: new Date() },
      { new: true }
    ).populate('reservation');
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted", invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
