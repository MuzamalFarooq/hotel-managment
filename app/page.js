"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ==========================================
// LUXURY ASSETS & STATIC DATA
// ==========================================

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"; // Ritz/FourSeasons-like exterior

const AMENITY_ICONS = {
  "WiFi": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 15.25a3.5 3.5 0 013.5 0M8.5 13.5a6 6 0 017 0M6.75 11.75a8.5 8.5 0 0110.5 0M5 10a11 11 0 0114 0" />
    </svg>
  ),
  "Air Conditioning": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m14.5-6.5l-11 11m0-11l11 11" />
    </svg>
  ),
  "TV": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M5 20h14M21 8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8z" />
    </svg>
  ),
  "Mini Bar": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
    </svg>
  ),
  "Breakfast": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Parking": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7h4a3 3 0 010 6H9m0 4h3" />
    </svg>
  ),
  "Swimming Pool": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H3M21 8.5H3M21 15.5H3" />
    </svg>
  ),
  "Gym": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10h11m-11 4h11M4.5 12h15m-14-6v12m13-12v12" />
    </svg>
  ),
  "Room Service": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  "Balcony": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
};

// Metadata mapping by Room Type to populate high-end content dynamically
const ROOM_META = {
  "Single": {
    name: "Deluxe Single Sanctuary",
    description: "An elegant sanctuary featuring refined custom furnishings, a spacious work area, and state-of-the-art details tailored for a serene solo stay.",
    bed: "1 King Bed",
    size: "38 m² / 409 ft²",
    capacity: "1 Guest",
    rating: 4.8,
    reviews: 124,
    amenities: ["WiFi", "Air Conditioning", "TV", "Mini Bar", "Room Service", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  "Double": {
    name: "Grand Double Master Suite",
    description: "Experience shared luxury with panoramic views, sophisticated seating areas, and modern premium details perfect for couples or business travelers.",
    bed: "2 Queen Beds",
    size: "54 m² / 581 ft²",
    capacity: "2 Guests",
    rating: 4.9,
    reviews: 186,
    amenities: ["WiFi", "Air Conditioning", "TV", "Mini Bar", "Breakfast", "Parking", "Swimming Pool", "Gym", "Room Service", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ]
  },
  "Default": {
    name: "Signature Executive Suite",
    description: "A high-end executive accommodation with integrated lounge space, handcrafted details, and premium amenities designed for absolute comfort.",
    bed: "1 King Bed",
    size: "62 m² / 667 ft²",
    capacity: "2 Guests",
    rating: 4.9,
    reviews: 92,
    amenities: ["WiFi", "Air Conditioning", "TV", "Mini Bar", "Breakfast", "Parking", "Room Service", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
    ]
  }
};

// ==========================================
// COMPONENT: IMAGE SLIDER
// ==========================================
function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Images container */}
      <div 
        className="w-full h-full flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="min-w-full h-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={img} 
              alt={`Suite room view ${i + 1}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            {/* Dark gradient overlay for a high-end look */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Slide Controllers */}
      {images.length > 1 && (
        <>
          <button 
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
          >
            <span className="text-sm font-semibold">‹</span>
          </button>
          <button 
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
          >
            <span className="text-sm font-semibold">›</span>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === i ? "bg-[#C9A227] w-3" : "bg-white/50 hover:bg-white"
                }`}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: MAIN LANDING PAGE
// ==========================================
export default function LandingPage() {
  const { data: session } = useSession();
  const roomsSectionRef = useRef(null);

  // Scroll threshold state for transparent navbar
  const [isScrolled, setIsScrolled] = useState(false);

  // API State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Interactive filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState(5000); // Max Price Slider
  const [capacityFilter, setCapacityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bedFilter, setBedFilter] = useState("All");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("Recommended");

  // Booking & Details Modal states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailedRoom, setDetailedRoom] = useState(null);

  // Booking Form Fields
  const [customerName, setCustomerName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const [threeDaysLater] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);

  // Booking Confirmation Feedback
  const [successBooking, setSuccessBooking] = useState(null);

  // Fetch rooms on mount
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        // Map database rooms with dynamic meta properties
        const mapped = data.data.map(room => {
          const meta = ROOM_META[room.roomType] || ROOM_META["Default"];
          return {
            id: room.roomNumber,
            type: room.roomType,
            status: room.status,
            price: room.price,
            _id: room._id,
            ...meta
          };
        }).sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setRooms(mapped);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRooms();
    });

    // Scroll listener for sticky transparent navbar
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute calculated nights and pricing
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

  // Scroll to catalog section
  const handleScrollToCatalog = () => {
    roomsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle selected amenities list
  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Open booking modal
  const handleOpenBooking = (room) => {
    setSelectedRoom(room);
    setDetailedRoom(null); // Close details modal if open
    setCustomerName("");
    setIdCard("");
    setPhoneNumber("");
    setCheckInDate(today);
    setCheckOutDate(threeDaysLater);
  };

  // Submit Booking Form
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
        fetchRooms(); // refresh rooms grid
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

  // ==========================================
  // SORTING & FILTERING
  // ==========================================

  // Filter items
  const filteredRooms = rooms.filter(room => {
    // 1. Search Query (Number, Name, Type)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchNum = room.id.toString().includes(query);
      const matchName = room.name.toLowerCase().includes(query);
      const matchType = room.type.toLowerCase().includes(query);
      if (!matchNum && !matchName && !matchType) return false;
    }
    // 2. Room Type
    if (typeFilter !== "All" && room.type !== typeFilter) return false;
    // 3. Price range (Filter rooms less than or equal to current filter price)
    if (priceFilter && room.price > priceFilter) return false;
    // 4. Capacity
    if (capacityFilter !== "All" && room.capacity !== capacityFilter) return false;
    // 5. Status
    if (statusFilter !== "All" && room.status !== statusFilter) return false;
    // 6. Bed Type
    if (bedFilter !== "All" && room.bed !== bedFilter) return false;
    // 7. Amenities Checklist
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every(a => room.amenities.includes(a));
      if (!hasAll) return false;
    }
    return true;
  });

  // Sort items
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === "Lowest Price") {
      return a.price - b.price;
    }
    if (sortBy === "Highest Price") {
      return b.price - a.price;
    }
    if (sortBy === "Available First") {
      if (a.status === "Available" && b.status !== "Available") return -1;
      if (a.status !== "Available" && b.status === "Available") return 1;
      return 0;
    }
    if (sortBy === "Most Popular") {
      return b.rating - a.rating;
    }
    if (sortBy === "Newest") {
      return parseInt(b.id) - parseInt(a.id); // Newer rooms (highest room numbers first)
    }
    return 0; // Default
  });

  // Calculate dynamic stats
  const totalCount = rooms.length;
  const maxPriceInDb = rooms.length > 0 ? Math.max(...rooms.map(r => r.price)) : 10000;
  const minPriceInDb = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 1000;

  // Initialize price range filter appropriately when rooms load
  useEffect(() => {
    if (rooms.length > 0) {
      Promise.resolve().then(() => {
        setPriceFilter(maxPriceInDb);
      });
    }
  }, [rooms, maxPriceInDb]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 flex flex-col font-sans select-none antialiased relative overflow-x-hidden">
      
      {/* ==========================================
          LUXURY STICKY NAVBAR
          ========================================== */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-stone-200/80 shadow-md shadow-stone-100/50 py-3" 
            : "bg-transparent border-white/10 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Elegant Luxury Crest Icon */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isScrolled ? "bg-slate-900 text-[#C9A227]" : "bg-white/10 text-white backdrop-blur-sm"
            }`}>
              <span className="font-serif text-lg font-bold">G</span>
            </div>
            <span className={`text-lg font-serif tracking-widest uppercase transition-all ${
              isScrolled ? "text-slate-900" : "text-white"
            }`}>
              Grand Stay
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`font-semibold text-[10px] tracking-widest uppercase px-5 py-3 rounded-lg border transition-all cursor-pointer ${
                isScrolled 
                  ? "bg-[#C9A227] hover:bg-[#B18E20] border-[#C9A227] text-white shadow-lg shadow-[#C9A227]/10" 
                  : "bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              }`}
            >
              {session ? "Dashboard" : "Admin Dashboard"}
            </Link>
          </nav>
        </div>
      </header>

      {/* ==========================================
          FULL-SCREEN HERO SECTION
          ========================================== */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={HERO_BG_IMAGE} 
            alt="Grand Stay Luxury Hotel" 
            className="w-full h-full object-cover scale-105 animate-[pulse_10s_infinite]" 
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 max-w-4xl flex flex-col items-center animate-[fadeIn_1.2s_ease-out_both]">
          <span className="text-[#C9A227] text-xs font-bold uppercase tracking-[0.25em] mb-4">
            Five-Star Boutique Hotel & Suites
          </span>
          <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight mb-6 leading-tight font-light">
            Experience Luxury <br />
            <span className="italic font-normal font-serif text-[#C9A227]">Like Never Before</span>
          </h1>
          <div className="w-12 h-px bg-[#C9A227] mb-6"></div>
          <p className="text-stone-300 text-base md:text-lg max-w-2xl mb-10 leading-relaxed tracking-wide font-light">
            Book premium rooms designed with modern elegance, refined comfort, and unforgettable hospitality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleScrollToCatalog}
              className="bg-[#C9A227] hover:bg-[#B18E20] text-white font-semibold text-[10px] tracking-widest uppercase px-8 py-4 rounded-lg shadow-xl shadow-black/20 hover:-translate-y-0.5 transition-all cursor-pointer w-48"
            >
              Explore Rooms
            </button>
            <button
              onClick={handleScrollToCatalog}
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 backdrop-blur-xs font-semibold text-[10px] tracking-widest uppercase px-8 py-4 rounded-lg hover:-translate-y-0.5 transition-all cursor-pointer w-48"
            >
              Book Stay
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={handleScrollToCatalog}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white transition-all cursor-pointer group"
        >
          <span className="text-[9px] uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border border-white/30 rounded-full p-1 flex justify-center">
            <div className="w-1 h-2 bg-[#C9A227] rounded-full animate-bounce"></div>
          </div>
        </button>
      </section>

      {/* ==========================================
          ROOMS CATALOG SECTION (LIGHT THEME)
          ========================================== */}
      <section 
        id="rooms-section"
        ref={roomsSectionRef} 
        className="max-w-7xl mx-auto px-6 py-24 w-full flex-1 relative z-10"
      >
        
        {/* Header Title */}
        <div className="text-center mb-16">
          <span className="text-[#C9A227] text-xs font-bold uppercase tracking-widest block mb-2">Our Suites</span>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-slate-900 tracking-tight">
            Curated Luxury Stays
          </h2>
          <div className="w-10 h-0.5 bg-[#C9A227] mx-auto mt-4"></div>
          <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto">
            Choose from our elegant selection of premium units, fully equipped with luxury amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ==========================================
              SIDEBAR FILTER SECTION
              ========================================== */}
          <aside className="lg:col-span-1 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm shadow-stone-100 flex flex-col gap-6 h-fit sticky top-24">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-stone-100 pb-3">Filters</h3>
            </div>

            {/* 1. Search Query */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Search Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Room no, suite type..."
                  className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-2.5 pl-3 pr-8 text-xs focus:outline-none transition-all text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                  🔍
                </span>
              </div>
            </div>

            {/* 2. Room Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Suite Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-2.5 px-3 text-xs focus:outline-none transition-all text-slate-800"
              >
                <option value="All">All Types</option>
                <option value="Single">Single Suite</option>
                <option value="Double">Double Suite</option>
              </select>
            </div>

            {/* 3. Max Price Filter */}
            {rooms.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Max Price</label>
                  <span className="text-[10px] font-semibold text-stone-500">PKR {priceFilter.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={minPriceInDb}
                  max={maxPriceInDb}
                  step={500}
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="w-full accent-[#C9A227] bg-stone-100 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-bold text-stone-400">
                  <span>PKR {minPriceInDb.toLocaleString()}</span>
                  <span>PKR {maxPriceInDb.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* 4. Capacity Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Guests Capacity</label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-2.5 px-3 text-xs focus:outline-none transition-all text-slate-800"
              >
                <option value="All">Any Capacity</option>
                <option value="1 Guest">1 Guest</option>
                <option value="2 Guests">2 Guests</option>
              </select>
            </div>

            {/* 5. Bed Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Bedding</label>
              <select
                value={bedFilter}
                onChange={(e) => setBedFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-2.5 px-3 text-xs focus:outline-none transition-all text-slate-800"
              >
                <option value="All">Any Bed Type</option>
                <option value="1 King Bed">1 King Bed</option>
                <option value="2 Queen Beds">2 Queen Beds</option>
              </select>
            </div>

            {/* 6. Availability Badge */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Availability</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-2.5 px-3 text-xs focus:outline-none transition-all text-slate-800"
              >
                <option value="All">Show All Stays</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* 7. Amenities Checklist */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Amenities</label>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {Object.keys(AMENITY_ICONS).map(amenity => {
                  const checked = selectedAmenities.includes(amenity);
                  return (
                    <label 
                      key={amenity} 
                      className="flex items-center gap-2.5 py-1 text-xs text-slate-700 cursor-pointer hover:text-[#C9A227] transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="rounded border-stone-300 text-[#C9A227] focus:ring-[#C9A227] bg-stone-50 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("All");
                setPriceFilter(maxPriceInDb);
                setCapacityFilter("All");
                setStatusFilter("All");
                setBedFilter("All");
                setSelectedAmenities([]);
              }}
              className="w-full py-2.5 border border-stone-200 hover:border-slate-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:text-slate-900 transition-all cursor-pointer text-center"
            >
              Reset Filters
            </button>
          </aside>

          {/* ==========================================
              ROOMS CONTAINER
              ========================================== */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Controls Bar: Sorting & Stats */}
            <div className="bg-white border border-stone-200/80 rounded-2xl px-6 py-4 shadow-sm shadow-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500 font-medium">
                Showing <span className="font-extrabold text-slate-800">{sortedRooms.length}</span> of {totalCount} luxury units
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#C9A227] transition-all text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Lowest Price">Lowest Price</option>
                  <option value="Highest Price">Highest Price</option>
                  <option value="Available First">Available First</option>
                  <option value="Most Popular">Most Popular</option>
                  <option value="Newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Room Cards Grid */}
            {loading ? (
              <div className="py-32 text-center flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-stone-200 border-t-[#C9A227] rounded-full animate-spin"></div>
                <p className="text-[#C9A227] text-xs font-bold uppercase tracking-widest">Consulting Room Registry...</p>
              </div>
            ) : sortedRooms.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-stone-200 rounded-3xl flex flex-col items-center gap-4 bg-white shadow-sm shadow-stone-100">
                <div className="text-3xl text-stone-300">🛎️</div>
                <h3 className="text-lg font-serif text-slate-800">No Suites Match Your Selection</h3>
                <p className="text-stone-400 text-xs max-w-xs mx-auto">Please adjust your search text or clear your active filters to browse our premium catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRooms.map(room => (
                  <article 
                    key={room.id}
                    className="bg-white border border-stone-200/80 rounded-2xl flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-stone-200/50 group"
                  >
                    {/* Top half: Image slider */}
                    <div className="aspect-4/3 w-full relative overflow-hidden bg-stone-100">
                      <ImageSlider images={room.images} />

                      {/* Floating Room ID Badge */}
                      <span className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-xs text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-md text-white border border-white/10">
                        Suite {room.id}
                      </span>
                      
                      {/* Availability status badge */}
                      <span className={`absolute top-4 right-4 z-10 text-[9px] uppercase tracking-widest font-black px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 ${
                        room.status === "Available"
                          ? "bg-emerald-500/90 text-white border-emerald-500"
                          : room.status === "Booked"
                            ? "bg-rose-500/90 text-white border-rose-500"
                            : "bg-amber-500/90 text-white border-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${room.status === "Available" ? "animate-pulse" : ""}`}></span>
                        {room.status}
                      </span>
                    </div>

                    {/* Bottom half: Metadata details */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Bed / Size Row */}
                      <div className="flex gap-4 text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1">🛏️ {room.bed}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">📐 {room.size}</span>
                      </div>

                      {/* Suite Name & Type */}
                      <h4 className="font-serif text-lg font-semibold text-slate-900 mb-2 leading-snug group-hover:text-[#C9A227] transition-all">
                        {room.name}
                      </h4>

                      {/* Stars Rating Display */}
                      <div className="flex items-center gap-1 mb-4 text-xs text-amber-500">
                        <span>{"★".repeat(5)}</span>
                        <span className="text-[10px] text-stone-400 font-semibold ml-1">({room.rating})</span>
                      </div>

                      {/* Amenities Row */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {room.amenities.slice(0, 4).map(amenity => (
                          <div 
                            key={amenity}
                            title={amenity}
                            className="bg-stone-50 text-slate-700 p-1.5 rounded-md border border-stone-200/50 flex items-center justify-center hover:text-[#C9A227] hover:border-[#C9A227]/30 transition-colors"
                          >
                            {AMENITY_ICONS[amenity] || <span>✨</span>}
                          </div>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100/50 border border-stone-200/30 px-2 py-1.5 rounded-md">
                            +{room.amenities.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Pricing block */}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-stone-400 block tracking-wider">Per Night Stay</span>
                          <span className="text-base font-black text-slate-900 font-serif">
                            PKR {room.price.toLocaleString()}{" "}
                            <span className="text-[10px] font-medium text-stone-500">/ Night</span>
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailedRoom(room)}
                            className="p-2 border border-stone-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            title="View Room Details"
                          >
                            ℹ️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(room)}
                            disabled={room.status !== "Available"}
                            className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                              room.status === "Available"
                                ? "bg-[#C9A227] hover:bg-[#B18E20] text-white shadow-md shadow-[#C9A227]/10"
                                : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/50"
                            }`}
                          >
                            {room.status === "Available" ? "Book Stay" : room.status}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          LUXURY ROOM DETAILS MODAL
          ========================================== */}
      {detailedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out_both]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDetailedRoom(null)}></div>
          
          {/* Modal Container */}
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 animate-[zoomIn_0.3s_ease-out_both] flex flex-col max-h-[90vh]">
            
            {/* Header / Close */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">Luxury Suite Overview</span>
                <h3 className="font-serif text-2xl font-semibold text-slate-900 mt-1">{detailedRoom.name}</h3>
              </div>
              <button 
                onClick={() => setDetailedRoom(null)} 
                className="w-9 h-9 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-stone-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6">
              
              {/* Image Slider */}
              <div className="aspect-video w-full rounded-xl overflow-hidden relative border border-stone-200">
                <ImageSlider images={detailedRoom.images} />
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 border border-stone-200/50 p-4 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Suite Unit</span>
                  <span className="font-semibold text-slate-800 text-sm">Room #{detailedRoom.id}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Bedding Layout</span>
                  <span className="font-semibold text-slate-800 text-sm">{detailedRoom.bed}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Suite Size</span>
                  <span className="font-semibold text-slate-800 text-sm">{detailedRoom.size}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block">Max Occupancy</span>
                  <span className="font-semibold text-slate-800 text-sm">{detailedRoom.capacity}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9A227] mb-2">Description</h4>
                <p className="text-stone-600 text-sm leading-relaxed font-light">{detailedRoom.description}</p>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9A227] mb-3">Suite Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailedRoom.amenities.map(amenity => (
                    <div 
                      key={amenity}
                      className="flex items-center gap-3 p-3 bg-white border border-stone-200/80 rounded-lg text-xs font-medium text-slate-700"
                    >
                      <div className="text-[#C9A227]">{AMENITY_ICONS[amenity] || <span>✨</span>}</div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / CTA Actions */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between gap-6">
              <div>
                <span className="text-[9px] font-bold uppercase text-stone-400 block">Per Night stay</span>
                <span className="text-lg font-black text-slate-900 font-serif">PKR {detailedRoom.price.toLocaleString()}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDetailedRoom(null)}
                  className="bg-white hover:bg-stone-100 border border-stone-200 py-3 px-6 rounded-lg font-bold text-xs uppercase tracking-widest text-stone-500 hover:text-slate-900 transition-all cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenBooking(detailedRoom)}
                  disabled={detailedRoom.status !== "Available"}
                  className={`py-3 px-8 rounded-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    detailedRoom.status === "Available"
                      ? "bg-[#C9A227] hover:bg-[#B18E20] text-white shadow-lg shadow-[#C9A227]/20"
                      : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                  }`}
                >
                  Book Stay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          LUXURY BOOKING FORM MODAL
          ========================================== */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out_both]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedRoom(null)}></div>
          
          {/* Form Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-xl shadow-2xl relative z-10 animate-[zoomIn_0.3s_ease-out_both]">
            <button 
              onClick={() => setSelectedRoom(null)} 
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] border border-[#C9A227]/30 bg-[#C9A227]/10 px-3 py-1.5 rounded-md mb-2 inline-block">
                Secure Stay Reservation
              </span>
              <h3 className="text-2xl font-serif text-slate-900 tracking-tight">Book Stay #{selectedRoom.id}</h3>
              <p className="text-stone-500 text-xs mt-1">{selectedRoom.name} — PKR {selectedRoom.price.toLocaleString()} / Night</p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block mb-2">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block mb-2">ID Card / Passport</label>
                  <input
                    type="text"
                    required
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    placeholder="e.g. 12345-6789012-3"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block mb-2">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block mb-2">Check-in Date</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block mb-2">Check-out Date</label>
                  <input
                    type="date"
                    required
                    min={checkInDate || today}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#C9A227] rounded-lg py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Cost Estimator card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex justify-between items-center mt-2">
                <div>
                  <span className="text-[8px] font-bold uppercase text-stone-400 block tracking-wider">Reservation Nights</span>
                  <span className="font-extrabold text-slate-800 text-xs">{nights} {nights === 1 ? "Night" : "Nights"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold uppercase text-stone-400 block tracking-wider">Estimated Total</span>
                  <span className="font-black text-[#C9A227] text-lg font-serif">PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 bg-white hover:bg-stone-100 border border-stone-200 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest text-stone-500 hover:text-slate-900 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-[#C9A227] hover:bg-[#B18E20] disabled:opacity-50 py-3.5 rounded-lg font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-[#C9A227]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {bookingLoading ? "Connecting..." : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          LUXURY BOOKING CONFIRMATION MODAL
          ========================================== */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out_both]">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSuccessBooking(null)}></div>
          
          <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 text-center animate-[zoomIn_0.3s_ease-out_both]">
            <div className="w-16 h-16 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C9A227]/20 text-[#C9A227] text-2xl">
              ✓
            </div>

            <h3 className="text-2xl font-serif font-semibold text-slate-950 tracking-tight">Stay Confirmed</h3>
            <p className="text-[#C9A227] text-[10px] mt-1.5 uppercase font-bold tracking-widest">Grand Stay Reservation Success</p>
            
            <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-5 my-6 text-left space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-xs">Suite Unit</span>
                <span className="text-slate-900 font-bold text-xs">Room #{successBooking.roomNumber}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-xs">Guest Name</span>
                <span className="text-slate-900 font-bold text-xs">{successBooking.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-xs">Stay Period</span>
                <span className="text-slate-900 font-bold text-xs">{successBooking.checkInDate} to {successBooking.checkOutDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 text-xs">Total Charged</span>
                <span className="text-[#C9A227] font-black text-xs font-serif">PKR {successBooking.totalPrice.toLocaleString()} ({successBooking.nights} {successBooking.nights === 1 ? "night" : "nights"})</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessBooking(null)}
              className="w-full bg-[#C9A227] hover:bg-[#B18E20] py-3.5 rounded-lg font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-[#C9A227]/20 transition-all cursor-pointer"
            >
              Back to Exploration
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          LUXURY FOOTER
          ========================================== */}
      <footer className="bg-slate-950 text-stone-400 text-xs border-t border-stone-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About Column */}
          <div className="flex flex-col gap-4">
            <span className="font-serif text-lg tracking-widest uppercase text-white">Grand Stay</span>
            <p className="text-stone-400 font-light leading-relaxed">
              A premium boutique hotel designed with modern elegance, refined comfort, and unforgettable hospitality. Your exquisite escape awaits.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">Quick Links</span>
            <ul className="space-y-2.5 font-light">
              <li><button onClick={handleScrollToCatalog} className="hover:text-white transition-all cursor-pointer">Explore Suites</button></li>
              <li><button onClick={handleScrollToCatalog} className="hover:text-white transition-all cursor-pointer">Book Stay</button></li>
              <li><Link href="/dashboard" className="hover:text-white transition-all">Staff Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">Hotel Contact</span>
            <ul className="space-y-2.5 font-light">
              <li className="flex items-center gap-2">📞 <span>+92 300 1234567</span></li>
              <li className="flex items-center gap-2">📧 <span>contact@grandstay.com</span></li>
              <li className="flex items-center gap-2">📍 <span>12 Luxury Avenue, Mall Road, Lahore</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">Stay Updated</span>
            <p className="font-light">Subscribe to our newsletter for exclusive offers and announcements.</p>
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none text-xs focus:outline-none w-full px-3 py-2 text-white"
              />
              <button className="bg-[#C9A227] hover:bg-[#B18E20] text-white px-4 py-2 rounded-md font-bold uppercase text-[9px] tracking-widest transition-all cursor-pointer">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-white/5 py-8 text-center text-[10px] text-stone-600">
          <p>© 2026 Grand Stay Luxury Hotel Management System. All rights reserved.</p>
        </div>
      </footer>

      {/* Embedded Animations Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
