import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, "Please provide a room number"],
  },
  customerName: {
    type: String,
    required: [true, "Please provide a customer name"],
  },
  idCard: {
    type: String,
    required: [true, "Please provide an ID card number"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  checkInDate: {
    type: String,
    required: [true, "Please provide a check-in date"],
  },
  checkOutDate: {
    type: String,
    required: [true, "Please provide a check-out date"],
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Paid",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
