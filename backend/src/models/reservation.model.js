// models/reservation.model.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    // Reference to user (CLIENT)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    customerName: String,
    customerPhone: String,
    customerEmail: String,

    tables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table"
      }
    ],

    menuItems: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu"
        },
        quantity: { type: Number, required: true }
      }
    ],

    expectedCheckinTime: {
      type: Date,
      required: true
    },

    checkinTime: Date,
    checkoutTime: Date,
    cancelledAt: Date,
    remindedAt: Date,

    status: {
      type: String,
      enum: ["PENDING", "CHECKED_IN", "COMPLETED", "CANCELLED", "EXPIRED"],
      default: "PENDING"
    },

    createdBy: {
      type: String,
      enum: ["ONLINE", "DIRECT"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);