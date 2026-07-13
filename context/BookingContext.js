"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const BookingContext = createContext();

const generateInitialRooms = () => {
  const rooms = [];
  // 1-20: Single
  for (let i = 1; i <= 20; i++) rooms.push({ id: i, type: "Single", status: "Available", price: 2500 });
  // 21-40: Double
  for (let i = 21; i <= 40; i++) rooms.push({ id: i, type: "Double", status: "Available", price: 4500 });
  return rooms;
};

const INITIAL_ROOMS = generateInitialRooms();

export const BookingProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const { data: session } = useSession();

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.map(booking => ({
          ...booking,
          id: booking._id,
          room: booking.roomNumber,
          customer: booking.customerName,
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          isCompleted: booking.isCompleted
        })));
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        if (data.data.length === 0) {
          // Optional: Seed initial 40 rooms if DB is empty
          const initialRooms = generateInitialRooms();
          await Promise.all(initialRooms.map(room =>
            fetch("/api/rooms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomNumber: room.id.toString(),
                roomType: room.type,
                price: room.price
              })
            })
          ));
          const retryRes = await fetch("/api/rooms");
          const retryData = await retryRes.json();
          if (retryData.success) {
            setRooms(retryData.data.map(room => ({
              id: room.roomNumber,
              type: room.roomType,
              status: room.status,
              price: room.price,
              _id: room._id
            })).sort((a, b) => parseInt(a.id) - parseInt(b.id)));
          }
          return;
        }

        const mappedRooms = data.data.map(room => ({
          id: room.roomNumber,
          type: room.roomType,
          status: room.status,
          price: room.price,
          _id: room._id
        })).sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setRooms(mappedRooms);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRooms();
    });
  }, []);

  useEffect(() => {
    if (session?.user) {
      Promise.resolve().then(() => {
        fetchRooms();
        if (session.user.role === "General Manager" || session.user.role === "Receptionist") {
          fetchBookings();
        }
      });
    }
  }, [session]);

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [threeDaysLater] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [newRoom, setNewRoom] = useState({ id: "", type: "Single", price: "" });

  const handleBookRoom = async () => {
    if (!customerName || !selectedRoom || !idCard || !phoneNumber || !checkInDate || !checkOutDate) return;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: selectedRoom.id,
          customerName: customerName,
          idCard: idCard,
          phoneNumber: phoneNumber,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          status: "Paid"
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchRooms(); // Refresh room status from DB
        await fetchBookings(); // Refresh bookings list

        setCustomerName("");
        setIdCard("");
        setPhoneNumber("");
        setCheckInDate(today);
        setCheckOutDate(threeDaysLater);
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error("Error booking room:", error);
      alert("Failed to save booking");
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
      });
      const data = await response.json();
      if (data.success) {
        await fetchRooms();
        await fetchBookings();
      }
    } catch (error) {
      console.error("Error checking out:", error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.id || !newRoom.price) return;

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: newRoom.id,
          roomType: newRoom.type,
          price: Number(newRoom.price),
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchRooms(); // Refresh rooms from DB
        setNewRoom({ id: "", type: "Single", price: "" });
        setIsRoomModalOpen(false);
      } else {
        alert(data.error || "Failed to add room");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Failed to connect to the server");
    }
  };

  const handleMarkAvailable = async (roomId) => {
    try {
      const response = await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber: roomId, status: "Available" }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchRooms();
      }
    } catch (error) {
      console.error("Error marking room available:", error);
    }
  };

  const availableRoomsCount = rooms.filter((r) => r.status === "Available").length;
  const maintenanceRoomsCount = rooms.filter((r) => r.status === "Maintenance").length;
  const totalRoomsCount = rooms.length;

  const value = {
    rooms,
    bookings,
    selectedRoom,
    setSelectedRoom,
    isRoomModalOpen,
    setIsRoomModalOpen,
    customerName,
    setCustomerName,
    idCard,
    setIdCard,
    phoneNumber,
    setPhoneNumber,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    newRoom,
    setNewRoom,
    handleBookRoom,
    handleCheckOut,
    handleAddRoom,
    handleMarkAvailable,
    availableRoomsCount,
    maintenanceRoomsCount,
    totalRoomsCount,
    today,
    threeDaysLater
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
