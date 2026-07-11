import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await dbConnect();
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    return NextResponse.json({ success: true, data: rooms });
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
    await requireRole(["General Manager", "Receptionist"]);
    await dbConnect();
    const body = await request.json();

    // Validate if room already exists
    const existingRoom = await Room.findOne({ roomNumber: body.roomNumber });
    if (existingRoom) {
      return NextResponse.json({ success: false, error: "Room number already exists" }, { status: 400 });
    }

    const room = await Room.create(body);
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await requireRole(["General Manager", "Receptionist", "Housekeeping"]);
    await dbConnect();
    const body = await request.json();
    const { roomNumber, status } = body;

    if (!roomNumber || !status) {
      return NextResponse.json({ success: false, error: "Room number and status are required" }, { status: 400 });
    }

    const room = await Room.findOneAndUpdate(
      { roomNumber },
      { status },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
