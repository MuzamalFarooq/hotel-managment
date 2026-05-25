import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

export async function PUT(request, { params }) {
  try {
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
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
