import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireRole(["General Manager"]);
    await dbConnect();
    const staff = await Staff.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await requireRole(["General Manager"]);
    await dbConnect();
    const body = await request.json();
    const { name, username, password, email, phone, role, status, image } = body;

    // Basic validation
    if (!name || !username || !password || !role) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields" }, { status: 400 });
    }

    // Check unique username
    const existingStaff = await Staff.findOne({ username: username.trim() });
    if (existingStaff) {
      return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate avatar if not provided
    let staffImage = image;
    if (!staffImage) {
      staffImage = `https://i.pravatar.cc/150?u=${username.trim()}`;
    }

    const staffMember = await Staff.create({
      name,
      username: username.trim(),
      password: hashedPassword,
      email,
      phone,
      role,
      status: status || "Active",
      image: staffImage
    });

    return NextResponse.json({ success: true, data: staffMember }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
