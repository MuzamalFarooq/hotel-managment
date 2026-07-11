const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Parse .env.local
let dbUri = '';
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/^MONGODB_URI=(.*)$/m);
    if (match && match[1]) {
      dbUri = match[1].trim();
    }
  }
} catch (e) {
  console.error("Could not read .env.local file:", e);
}

if (!dbUri) {
  dbUri = 'mongodb://localhost:27017/hotel_management';
}

console.log("Connecting to Database:", dbUri);

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: String,
  phone: String,
  role: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  image: String,
}, { timestamps: true });

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["Available", "Booked", "Maintenance"], default: "Available" },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

async function seed() {
  try {
    await mongoose.connect(dbUri);
    console.log("Connected successfully to MongoDB.");

    // Seed General Manager
    const username = "muzamalfarooq";
    const password = "muzamal123";
    const hashedPassword = bcrypt.hashSync(password, 10);

    const existingGM = await Staff.findOne({ username });
    if (existingGM) {
      existingGM.password = hashedPassword;
      existingGM.role = "General Manager";
      existingGM.status = "Active";
      await existingGM.save();
      console.log(`Updated existing General Manager: ${username}`);
    } else {
      await Staff.create({
        name: "Muzamal Farooq",
        username,
        password: hashedPassword,
        email: "muzamal@grandstay.com",
        phone: "03001234567",
        role: "General Manager",
        status: "Active",
        image: "https://i.pravatar.cc/150?u=muzamal"
      });
      console.log(`Created new General Manager: ${username}`);
    }

    // Seed Initial Rooms if there are none
    const roomCount = await Room.countDocuments({});
    if (roomCount === 0) {
      console.log("No rooms found in database. Seeding default 40 rooms...");
      const roomsToCreate = [];
      // 1-20: Single (Price: 2500)
      for (let i = 1; i <= 20; i++) {
        roomsToCreate.push({
          roomNumber: i.toString(),
          roomType: "Single",
          price: 2500,
          status: "Available"
        });
      }
      // 21-40: Double (Price: 4500)
      for (let i = 21; i <= 40; i++) {
        roomsToCreate.push({
          roomNumber: i.toString(),
          roomType: "Double",
          price: 4500,
          status: "Available"
        });
      }
      await Room.insertMany(roomsToCreate);
      console.log("Successfully seeded 40 rooms.");
    } else {
      console.log(`Found ${roomCount} existing rooms in database. Skipping room seeding.`);
    }

    console.log("Seeding process completed successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seed();
