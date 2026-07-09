import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth-helpers";

export async function PUT(request, { params }) {
  try {
    await requireRole(["General Manager"]);
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const staffMember = await Staff.findById(id);
    if (!staffMember) {
      return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
    }

    const { name, email, phone, role, status, password } = body;

    if (name) staffMember.name = name;
    if (email !== undefined) staffMember.email = email;
    if (phone !== undefined) staffMember.phone = phone;
    if (role) staffMember.role = role;
    if (status) staffMember.status = status;

    // Handle password reset
    if (password && password.trim() !== "") {
      staffMember.password = bcrypt.hashSync(password, 10);
    }

    await staffMember.save();
    return NextResponse.json({ success: true, data: staffMember });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(["General Manager"]);
    await dbConnect();
    const { id } = await params;

    const staffMember = await Staff.findByIdAndDelete(id);
    if (!staffMember) {
      return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff member deleted successfully" });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
