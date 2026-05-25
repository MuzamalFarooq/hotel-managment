import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";

export async function GET() {
  try {
    await dbConnect();
    const staff = await Staff.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Generate avatar if not provided
    if (!body.image) {
      body.image = `https://i.pravatar.cc/150?u=${body.name.replace(/\s+/g, '')}`;
    }

    const staffMember = await Staff.create(body);
    return NextResponse.json({ success: true, data: staffMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
