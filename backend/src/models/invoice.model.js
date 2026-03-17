// models/invoice.model.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table"
    },

    payerName: String,
    payerPhone: String,
    payerEmail: String,

    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        discountPercent: Number,
        total: Number
      }
    ],

    discount: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["CASH", "TRANSFER"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING"
    },

    paymentDate: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);