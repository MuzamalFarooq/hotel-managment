import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

export async function GET() {
  try {
    await dbConnect();

    // Auto-expire bookings that have passed their check-out date
    const today = new Date().toISOString().split('T')[0];
    const expiredBookings = await Booking.find({
      isCompleted: false,
      checkOutDate: { $lt: today }
    });

    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        booking.isCompleted = true;
        await booking.save();

        // Free up the room
        await Room.findOneAndUpdate(
          { roomNumber: booking.roomNumber },
          { status: "Available" }
        );
      }
    }

    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Create booking
    const booking = await Booking.create(body);

    // Update room status to "Booked"
    await Room.findOneAndUpdate(
      { roomNumber: body.roomNumber },
      { status: "Booked" }
    );

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
