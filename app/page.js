"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Icons
const Icons = {
  Logo: () => (
    <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
      <span className="text-xl font-black text-white">H</span>
    </div>
  ),
  Single: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
      <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <path d="M3 18h18" />
    </svg>
  ),
  Double: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
      <path d="M2 17h20" />
      <path d="M7 10v4" />
      <path d="M17 10v4" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Card: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};

export default function LandingPage() {
  const { data: session } = useSession();
  
  // Room and Booking states
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Filter States
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Booking Form States
  const [customerName, setCustomerName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const today = new Date().toISOString().split("T")[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(threeDaysLater);
  
  // Success modal state
  const [successBooking, setSuccessBooking] = useState(null);

  // Fetch rooms on mount
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map(r => ({
          id: r.roomNumber,
          type: r.roomType,
          status: r.status,
          price: r.price,
          _id: r._id
        })).sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setRooms(mapped);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Calculate nights and total price
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const handleOpenBookingModal = (room) => {
    setSelectedRoom(room);
    setCustomerName("");
    setIdCard("");
    setPhoneNumber("");
    setCheckInDate(today);
    setCheckOutDate(threeDaysLater);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !idCard || !phoneNumber || !checkInDate || !checkOutDate || !selectedRoom) {
      alert("Please fill in all details.");
      return;
    }

    try {
      setBookingLoading(true);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: selectedRoom.id,
          customerName,
          idCard,
          phoneNumber,
          checkInDate,
          checkOutDate,
          status: "Paid"
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessBooking({
          roomNumber: selectedRoom.id,
          customerName,
          checkInDate,
          checkOutDate,
          totalPrice,
          nights
        });
        setSelectedRoom(null);
        fetchRooms(); // refresh room grid
      } else {
        alert(data.error || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to submit booking. Check your connection.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtered rooms list
  const filteredRooms = rooms.filter(room => {
    // Type Filter
    if (typeFilter !== "All" && room.type !== typeFilter) return false;
    // Status Filter
    if (showAvailableOnly && room.status !== "Available") return false;
    if (!showAvailableOnly && statusFilter !== "All" && room.status !== statusFilter) return false;
    return true;
  });

  const availableCount = rooms.filter(r => r.status === "Available").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
      
      {/* Premium Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/40 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Icons.Logo />
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 group-hover:from-white group-hover:to-indigo-300 transition-all">
              Grand Stay
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {session ? (
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 w-full flex flex-col items-center text-center">
        <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-in fade-in duration-1000">
          Luxury Living Redefined
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 max-w-4xl leading-tight">
          Find Your Perfect <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-600">
            Premium Sanctuary
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Experience state-of-the-art boutique rooms tailored for your ultimate relaxation and premium comfort. Book your stay seamlessly today.
        </p>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-3xl p-6 shadow-xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Total Rooms</p>
            <p className="text-3xl font-black text-white">{loading ? "..." : rooms.length}</p>
          </div>
          <div className="text-center border-l border-slate-800/80">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Available Now</p>
            <p className="text-3xl font-black text-emerald-400">{loading ? "..." : availableCount}</p>
          </div>
          <div className="text-center border-l border-slate-800/80">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Boutique Types</p>
            <p className="text-3xl font-black text-indigo-400">Single & Double</p>
          </div>
          <div className="text-center border-l border-slate-800/80">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Starting Price</p>
            <p className="text-3xl font-black text-purple-400">Rs 2,500</p>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <main className="max-w-7xl mx-auto px-6 pb-24 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-900 pb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Explore Our Suites</h2>
            <p className="text-slate-500 text-sm">Select from our verified luxury inventory and book instantly.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filters */}
            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              {["All", "Single", "Double"].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    typeFilter === type
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Availability Checkbox toggle */}
            <label className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">Show Available Only</span>
            </label>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Loading Luxury Suites...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-slate-900 rounded-[2.5rem] flex flex-col items-center gap-4">
            <div className="text-4xl">🚪</div>
            <h3 className="text-xl font-bold text-slate-400">No rooms match your filters</h3>
            <p className="text-slate-600 text-sm max-w-xs mx-auto">Try clearing your filters or changing search criteria to view our inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRooms.map(room => (
              <div 
                key={room.id}
                className="bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 rounded-[2rem] p-5 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 group"
              >
                {/* Room card header: Image representation / Icon */}
                <div className="aspect-video w-full rounded-2xl bg-linear-to-br from-slate-950 to-slate-900 border border-slate-900 flex items-center justify-center mb-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>
                  {room.type === "Single" ? <Icons.Single /> : <Icons.Double />}
                  <span className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg text-slate-400">
                    Room #{room.id}
                  </span>
                  
                  {/* Status Indicator Badge */}
                  <span className={`absolute top-3 right-3 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md border ${
                    room.status === "Available"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : room.status === "Booked"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {room.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {room.type} Suite
                </h3>
                <p className="text-slate-500 text-xs font-bold mb-6">Fully furnished luxury suite</p>

                <div className="mt-auto pt-4 border-t border-slate-900/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Price</span>
                    <span className="text-lg font-black text-slate-100">Rs {room.price.toLocaleString()} <span className="text-xs font-medium text-slate-500">/ night</span></span>
                  </div>

                  <button
                    onClick={() => handleOpenBookingModal(room)}
                    disabled={room.status !== "Available"}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                      room.status === "Available"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                        : "bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {room.status === "Available" ? "Book Now" : room.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Premium Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedRoom(null)}></div>
          
          {/* Modal Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedRoom(null)} 
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <Icons.Close />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg mb-2 inline-block">
                Suite Booking
              </span>
              <h3 className="text-3xl font-black text-white tracking-tight">Book Room #{selectedRoom.id}</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedRoom.type} Suite — Rs {selectedRoom.price.toLocaleString()} per night</p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Customer Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.User /></span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">ID Card / CNIC</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.Card /></span>
                    <input
                      type="text"
                      required
                      value={idCard}
                      onChange={(e) => setIdCard(e.target.value)}
                      placeholder="e.g. 12345-6789012-3"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icons.Phone /></span>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 03001234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Check-in Date</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Calendar /></span>
                    <input
                      type="date"
                      required
                      min={today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Check-out Date</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Calendar /></span>
                    <input
                      type="date"
                      required
                      min={checkInDate || today}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Cost Estimator card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex justify-between items-center mt-2">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">Total Nights</span>
                  <span className="font-extrabold text-white text-sm">{nights} {nights === 1 ? "Night" : "Nights"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-slate-500 block">Total Cost</span>
                  <span className="font-black text-emerald-400 text-lg">Rs {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-850 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSuccessBooking(null)}></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <Icons.Check />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">Booking Confirmed!</h3>
            <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest text-emerald-400">Suite Booked Successfully</p>
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 my-6 text-left space-y-3">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 text-xs">Room Number</span>
                <span className="text-white font-extrabold text-xs">Room #{successBooking.roomNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 text-xs">Guest Name</span>
                <span className="text-white font-extrabold text-xs">{successBooking.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 text-xs">Dates</span>
                <span className="text-white font-extrabold text-xs">{successBooking.checkInDate} to {successBooking.checkOutDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Paid</span>
                <span className="text-emerald-400 font-black text-xs">Rs {successBooking.totalPrice.toLocaleString()} ({successBooking.nights} {successBooking.nights === 1 ? "night" : "nights"})</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessBooking(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-600">
        <p>© 2026 Grand Stay Hotel Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
