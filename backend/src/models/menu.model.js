import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false
    },

    code: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["FOOD", "DRINK"],
      required: true
    },

    description: String,

    unit: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    discountPercent: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Menu", menuSchema);