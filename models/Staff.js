import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    required: [true, "Please provide a role"],
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  image: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
