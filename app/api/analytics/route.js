import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";

export async function GET() {
  try {
    await dbConnect();

    const bookings = await Booking.find({}).lean();
    const rooms = await Room.find({}).lean();

    // Build a price lookup from room number
    const priceMap = {};
    rooms.forEach((room) => {
      priceMap[room.roomNumber] = room.price || 0;
    });

    // Helper: calculate nights between two date strings
    const calcNights = (checkIn, checkOut) => {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    };

    // Overall totals
    let totalBookings = bookings.length;
    let totalRevenue = 0;
    let completedBookings = 0;
    let activeBookings = 0;

    // Group by day, month, year
    const byDay = {};
    const byMonth = {};
    const byYear = {};

    bookings.forEach((b) => {
      const nights = calcNights(b.checkInDate, b.checkOutDate);
      const roomPrice = priceMap[b.roomNumber] || 0;
      const revenue = nights * roomPrice;
      totalRevenue += revenue;

      if (b.isCompleted) completedBookings++;
      else activeBookings++;

      // Use checkInDate as the booking date for grouping
      const dateStr = b.checkInDate; // e.g. "2026-05-10"
      const [year, month, day] = dateStr.split("-");

      const dayKey = dateStr;
      const monthKey = `${year}-${month}`;
      const yearKey = year;

      // Determine price tier
      let tier = "low"; // < 3000
      if (roomPrice >= 3000 && roomPrice <= 5000) tier = "medium"; // 3000 - 5000
      else if (roomPrice > 5000) tier = "high"; // > 5000

      // By Day
      if (!byDay[dayKey]) byDay[dayKey] = { date: dayKey, bookings: 0, revenue: 0, tiers: { low: 0, medium: 0, high: 0 } };
      byDay[dayKey].bookings += 1;
      byDay[dayKey].revenue += revenue;
      byDay[dayKey].tiers[tier] += 1;

      // By Month
      if (!byMonth[monthKey]) byMonth[monthKey] = { date: monthKey, bookings: 0, revenue: 0, tiers: { low: 0, medium: 0, high: 0 } };
      byMonth[monthKey].bookings += 1;
      byMonth[monthKey].revenue += revenue;
      byMonth[monthKey].tiers[tier] += 1;

      // By Year
      if (!byYear[yearKey]) byYear[yearKey] = { date: yearKey, bookings: 0, revenue: 0, tiers: { low: 0, medium: 0, high: 0 } };
      byYear[yearKey].bookings += 1;
      byYear[yearKey].revenue += revenue;
      byYear[yearKey].tiers[tier] += 1;
    });

    // Sort and convert to arrays
    const dailyData = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
    const monthlyData = Object.values(byMonth).sort((a, b) => a.date.localeCompare(b.date));
    const yearlyData = Object.values(byYear).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        completedBookings,
        activeBookings,
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter((r) => r.status === "Booked").length,
        dailyData,
        monthlyData,
        yearlyData,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
