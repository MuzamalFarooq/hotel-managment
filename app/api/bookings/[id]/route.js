import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { requireRole } from "@/lib/auth-helpers";

export async function PUT(request, { params }) {
  try {
    await requireRole(["General Manager", "Receptionist"]);
    await dbConnect();
    const { id } = await params;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Update booking to completed
    booking.isCompleted = true;
    await booking.save();

    // Update room status to "Maintenance" after checkout
    await Room.findOneAndUpdate(
      { roomNumber: booking.roomNumber },
      { status: "Maintenance" }
    );

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    const status = error.status || 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ success: false, error: error.message }, { status });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
