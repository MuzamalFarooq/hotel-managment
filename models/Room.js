import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, "Please provide a room number"],
    unique: true,
  },
  roomType: {
    type: String,
    required: [true, "Please provide a room type"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },
  status: {
    type: String,
    enum: ["Available", "Booked", "Maintenance"],
    default: "Available",
  },
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
