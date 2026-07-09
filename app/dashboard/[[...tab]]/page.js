"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useBooking } from "@/context/BookingContext";
import { useStaff } from "@/context/StaffContext";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// --- Icons (Inline SVGs) ---
const Icons = {
  Rooms: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" /><path d="M3 18h18" /></svg>
  ),
  Bookings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="m9 16 2 2 4-4" /></svg>
  ),
  Staff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /><path d="M16.2 7.8l.1-.1" /></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
  ),
  Maintenance: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
  )
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = user?.role;

  // Resolve default tab based on user role
  const getDefaultTab = (userRole) => {
    if (userRole === "Housekeeping") return "maintenance";
    return "rooms";
  };

  const currentTabParam = params?.tab?.[0];
  const activeTab = currentTabParam || getDefaultTab(role);

  const [viewedBooking, setViewedBooking] = useState(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("monthly");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Handle client-side tab authorization check
  useEffect(() => {
    if (status === "authenticated" && role && currentTabParam) {
      const allowedRoles = {
        rooms: ["General Manager", "Receptionist"],
        bookings: ["General Manager", "Receptionist"],
        history: ["General Manager", "Receptionist"],
        maintenance: ["General Manager", "Housekeeping"],
        analytics: ["General Manager"],
        staff: ["General Manager"],
      };

      const roles = allowedRoles[currentTabParam];
      if (roles && !roles.includes(role)) {
        router.push("/dashboard/unauthorized");
      }
    }
  }, [currentTabParam, role, status, router]);

  // If visiting /dashboard, redirect to the default role tab
  useEffect(() => {
    if (status === "authenticated" && role && !currentTabParam) {
      router.push(`/dashboard/${getDefaultTab(role)}`);
    }
  }, [currentTabParam, role, status, router]);

  // Fetch Analytics data
  useEffect(() => {
    if (activeTab === "analytics" && role === "General Manager") {
      setAnalyticsLoading(true);
      fetch("/api/analytics")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAnalyticsData(data.data);
        })
        .catch(console.error)
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab, role]);

  // Destructure from BookingContext
  const {
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
    totalRoomsCount
  } = useBooking();

  // Destructure from StaffContext
  const {
    staff,
    isStaffModalOpen,
    setIsStaffModalOpen,
    isEditStaffModalOpen,
    setIsEditStaffModalOpen,
    newStaff,
    setNewStaff,
    editingStaff,
    setEditingStaff,
    handleAddStaff,
    handleUpdateStaff,
    handleDeleteStaff
  } = useStaff();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStaff({ ...newStaff, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Render loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Sidebar items filtered dynamically by user role
  const allSidebarItems = [
    { id: "rooms", label: "Rooms", icon: <Icons.Rooms />, roles: ["General Manager", "Receptionist"] },
    { id: "bookings", label: "Bookings", icon: <Icons.Bookings />, roles: ["General Manager", "Receptionist"] },
    { id: "maintenance", label: "Maintenance", icon: <Icons.Maintenance />, roles: ["General Manager", "Housekeeping"] },
    { id: "history", label: "Booking History", icon: <Icons.History />, roles: ["General Manager", "Receptionist"] },
    { id: "analytics", label: "Analytics", icon: <Icons.Analytics />, roles: ["General Manager"] },
    { id: "staff", label: "Staff Members", icon: <Icons.Staff />, roles: ["General Manager"] },
  ];

  const filteredSidebarItems = allSidebarItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push(`/dashboard/${getDefaultTab(role)}`)}>
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">Grand Stay</h2>
        </div>

        {/* nav buttons */}
        <nav className="flex flex-col gap-2">
          {filteredSidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/dashboard/${item.id}`)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* login user info */}
        <div className="mt-auto bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 group hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border border-slate-600 shadow-inner">
              {user.image ? (
                <Image src={user.image} alt={user.name} width={36} height={36} className="object-cover" />
              ) : (
                <Icons.User />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate max-w-[130px]">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate max-w-[130px]">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="w-full py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">

        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-black text-white capitalize tracking-tight mb-1">{activeTab} Dashboard</h1>
            <p className="text-slate-400 text-sm">Managing your property at your fingertips.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* search bar */}
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-900/80 border border-slate-800 rounded-full py-2.5 pl-10 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-72 backdrop-blur-sm transition-all focus:w-80"
              />
            </div>

            {/* notification button */}
            <button className="relative w-11 h-11 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group">
              <Icons.Bell />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-slate-950 group-hover:scale-110 transition-transform"></span>
            </button>
          </div>
        </header>

        {/* room page stats */}
        {activeTab === "rooms" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Capacity", value: totalRoomsCount, color: "indigo", icon: "🏢" },
              { label: "Available Now", value: availableRoomsCount, color: "emerald", icon: "✅" },
              { label: "Occupied Rooms", value: totalRoomsCount - availableRoomsCount - maintenanceRoomsCount, color: "rose", icon: "🚪" },
              { label: "Under Maintenance", value: maintenanceRoomsCount, color: "amber", icon: "🔧" },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className={`absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity`}>{stat.icon}</div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-5xl font-black">{stat.value}</p>
                <div className="mt-5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`bg-${stat.color}-500 h-full transition-all duration-1000 ease-out`}
                    style={{ width: `${totalRoomsCount > 0 ? (stat.value / totalRoomsCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content Container */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-500">

          {/* rooms page */}
          {activeTab === "rooms" && (
            <div className="p-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Room Inventory</h3>
                  <p className="text-slate-500 text-sm">Visual status of all property units</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsRoomModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer">
                    <Icons.Plus />
                    Add Room
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3.5">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer relative group ${room.status === "Available"
                      ? "bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30"
                      : room.status === "Booked"
                        ? "bg-rose-500/5 border border-rose-500/10 text-rose-500/50 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
                        : "bg-amber-500/5 border border-amber-500/10 text-amber-500/50 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30"
                      }`}
                  >
                    <span className="mb-0.5 opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">{room.type}</span>
                    <span className="text-sm group-hover:scale-110 transition-transform font-black">#{room.id}</span>
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${room.status === "Available" ? "bg-emerald-500" : room.status === "Booked" ? "bg-rose-500" : "bg-amber-500"
                      }`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* booking page */}
          {activeTab === "bookings" && (
            <div className="p-0">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Active Bookings</h3>
                  <p className="text-slate-500 text-sm">Managing {bookings.length} current customer stays</p>
                </div>
                <button onClick={() => router.push("/dashboard/rooms")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer">New Booking</button>
              </div>
              {bookings.filter(b => !b.isCompleted).length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600">
                    <Icons.Bookings />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">No bookings yet</h4>
                  <p className="text-slate-600 text-sm max-w-xs">Start by selecting an available room from the inventory section to create your first booking.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <th className="px-8 py-5 border-b border-slate-800">Unit No.</th>
                      <th className="px-8 py-5 border-b border-slate-800">Customer Details</th>
                      <th className="px-8 py-5 border-b border-slate-800">Check-In Period</th>
                      <th className="px-8 py-5 border-b border-slate-800">Payment Status</th>
                      <th className="px-8 py-5 border-b border-slate-800 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {bookings.filter(b => !b.isCompleted).map((booking) => (
                      <tr key={booking.id} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-black ring-1 ring-slate-700">UNIT {booking.room}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-100 mb-0.5">{booking.customer}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">ID: REZ-00{booking.id}XB</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-bold text-slate-300">{booking.checkIn}</div>
                            <div className="w-4 h-px bg-slate-700"></div>
                            <div className="text-xs font-bold text-slate-300">{booking.checkOut}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-lg border tracking-widest ${booking.status === "Paid"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleCheckOut(booking.id)} className="px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer">Check Out</button>
                            <button onClick={() => setViewedBooking(booking)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* staff page */}
          {activeTab === "staff" && role === "General Manager" && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Staff Members</h3>
                  <p className="text-slate-500 text-sm">Managing {staff.length} active staff members</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsStaffModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer">
                    <Icons.Staff />
                    Add Staff
                  </button>
                </div>
              </div>
              {staff.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-800 rounded-3xl">
                  <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center text-slate-700">
                    <Icons.Staff />
                  </div>
                  <h4 className="text-xl font-bold text-slate-500">No staff members registered</h4>
                  <button onClick={() => setIsStaffModalOpen(true)} className="text-indigo-400 font-bold hover:text-indigo-300">Add your first employee</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {staff.map((member) => (
                    <div key={member.id} className="bg-slate-950/40 border border-slate-800/50 p-6 rounded-4xl flex flex-col items-center text-center group hover:border-indigo-500/30 hover:bg-indigo-500/2 transition-all duration-500">
                      <div className="relative mb-5">
                        <div className="absolute -inset-1.5 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="rounded-full border-4 border-slate-900 relative z-10 w-24 h-24 object-cover"
                        />
                        <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-slate-900 z-20 ${member.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                          }`}></span>
                      </div>
                      <h4 className="font-black text-lg text-white group-hover:text-indigo-300 transition-colors">{member.name}</h4>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{member.role}</p>
                      <p className="text-[10px] text-slate-600 font-medium mb-6">@{member.username}</p>
                      <div className="flex gap-2 w-full mt-auto">
                        <button
                          onClick={() => {
                            setEditingStaff({
                              id: member.id,
                              name: member.name,
                              email: member.email || "",
                              phone: member.phone || "",
                              role: member.role,
                              status: member.status,
                              password: ""
                            });
                            setIsEditStaffModalOpen(true);
                          }}
                          className="flex-1 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="flex-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* booking History page */}
          {activeTab === "history" && (
            <div className="p-0">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Booking History</h3>
                  <p className="text-slate-500 text-sm">Reviewing all past and current property stays</p>
                </div>
              </div>
              {bookings.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600">
                    <Icons.History />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">No history found</h4>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <th className="px-8 py-5 border-b border-slate-800">Unit No.</th>
                      <th className="px-8 py-5 border-b border-slate-800">Customer Details</th>
                      <th className="px-8 py-5 border-b border-slate-800">Check-In Period</th>
                      <th className="px-8 py-5 border-b border-slate-800">Booking Status</th>
                      <th className="px-8 py-5 border-b border-slate-800 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-black ring-1 ring-slate-700">UNIT {booking.room}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-100 mb-0.5">{booking.customer}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tight font-bold">ID: REZ-00{booking.id}XB</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-bold text-slate-300">{booking.checkIn}</div>
                            <div className="w-4 h-px bg-slate-700"></div>
                            <div className="text-xs font-bold text-slate-300">{booking.checkOut}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-lg border tracking-widest ${booking.isCompleted
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                            {booking.isCompleted ? "Completed" : "Active"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setViewedBooking(booking)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer">View</button>
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer">Invoice</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Analytics Page */}
          {activeTab === "analytics" && role === "General Manager" && (
            <div className="p-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Revenue & Booking Analytics</h3>
                  <p className="text-slate-500 text-sm">Insights on your property performance</p>
                </div>
                <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                  {["daily", "monthly", "yearly"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setAnalyticsPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${analyticsPeriod === period
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm font-medium">Loading analytics...</p>
                </div>
              ) : !analyticsData ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600">
                    <Icons.Analytics />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">No data available</h4>
                </div>
              ) : (() => {
                const chartData =
                  analyticsPeriod === "daily" ? analyticsData.dailyData
                    : analyticsPeriod === "monthly" ? analyticsData.monthlyData
                      : analyticsData.yearlyData;

                const maxRevenue = Math.max(...(chartData.map((d) => d.revenue) || [0]), 1);
                const maxBookings = Math.max(...(chartData.map((d) => d.bookings) || [0]), 1);
                const avgRevenue = analyticsData.totalBookings > 0 ? Math.round(analyticsData.totalRevenue / analyticsData.totalBookings) : 0;
                const occupancyRate = analyticsData.totalRooms > 0 ? Math.round((analyticsData.occupiedRooms / analyticsData.totalRooms) * 100) : 0;

                const formatLabel = (dateStr) => {
                  if (analyticsPeriod === "daily") {
                    const d = new Date(dateStr + "T00:00:00");
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                  if (analyticsPeriod === "monthly") {
                    const [y, m] = dateStr.split("-");
                    const d = new Date(Number(y), Number(m) - 1);
                    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                  }
                  return dateStr;
                };

                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
                      {[
                        { label: "Total Bookings", value: analyticsData.totalBookings, icon: "📋", color: "indigo", sub: `${analyticsData.activeBookings} active` },
                        { label: "Total Revenue", value: `Rs ${analyticsData.totalRevenue.toLocaleString()}`, icon: "💰", color: "emerald", sub: `Avg Rs ${avgRevenue.toLocaleString()}/booking` },
                        { label: "Occupancy Rate", value: `${occupancyRate}%`, icon: "📊", color: "amber", sub: `${analyticsData.occupiedRooms}/${analyticsData.totalRooms} rooms` },
                        { label: "Completed", value: analyticsData.completedBookings, icon: "✅", color: "rose", sub: `${analyticsData.activeBookings} still active` },
                      ].map((stat, i) => (
                        <div key={i} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                          <div className="absolute top-0 right-0 p-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">{stat.icon}</div>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-3xl font-black text-white">{stat.value}</p>
                          <p className="text-slate-600 text-xs font-medium mt-2">{stat.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart Area */}
                    {chartData.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 font-bold">No {analyticsPeriod} data to display yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Revenue ({analyticsPeriod})</h4>
                          <div className="flex items-end gap-2 h-56">
                            {chartData.slice(-12).map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[9px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Rs {item.revenue.toLocaleString()}</span>
                                <div className="w-full relative flex-1 flex items-end">
                                  <div
                                    className="w-full rounded-t-lg bg-linear-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-500"
                                    style={{
                                      height: `${Math.max((item.revenue / maxRevenue) * 100, 4)}%`,
                                      minHeight: "4px",
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{formatLabel(item.date)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bookings Chart */}
                        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Bookings ({analyticsPeriod})</h4>
                          <div className="flex items-end gap-2 h-56">
                            {chartData.slice(-12).map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[9px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.bookings}</span>
                                <div className="w-full relative flex-1 flex items-end">
                                  <div
                                    className="w-full rounded-t-lg bg-linear-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-500"
                                    style={{
                                      height: `${Math.max((item.bookings / maxBookings) * 100, 4)}%`,
                                      minHeight: "4px",
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{formatLabel(item.date)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detail Table */}
                    {chartData.length > 0 && (
                      <div className="mt-6 bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                              <th className="px-6 py-4 border-b border-slate-800">Period</th>
                              <th className="px-6 py-4 border-b border-slate-800">Total Bookings</th>
                              <th className="px-6 py-4 border-b border-slate-800">Total Revenue</th>
                              <th className="px-6 py-4 border-b border-slate-800">Avg Revenue / Booking</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {chartData.map((item, i) => (
                              <tr key={i} className="hover:bg-indigo-500/5 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-black ring-1 ring-slate-700">{formatLabel(item.date)}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-200">{item.bookings}</td>
                                <td className="px-6 py-4 font-bold text-emerald-400">Rs {item.revenue.toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-400">Rs {item.bookings > 0 ? Math.round(item.revenue / item.bookings).toLocaleString() : 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Maintenance Page */}
          {activeTab === "maintenance" && (
            <div className="p-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Room Maintenance</h3>
                  <p className="text-slate-500 text-sm">Rooms requiring cleaning, inspection, or repairs after checkout</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                    <span className="text-amber-400 text-xs font-black uppercase tracking-widest">{maintenanceRoomsCount} rooms pending</span>
                  </div>
                </div>
              </div>

              {rooms.filter(r => r.status === "Maintenance").length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-slate-800 rounded-3xl">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-4xl">
                    🔧
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">No rooms under maintenance</h4>
                  <p className="text-slate-600 text-sm max-w-xs">All rooms are in great shape! Rooms will appear here automatically after guest checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rooms.filter(r => r.status === "Maintenance").map((room) => (
                    <div key={room.id} className="bg-slate-950/40 border border-amber-500/20 rounded-2xl p-6 group hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-500">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl font-black group-hover:bg-amber-500/20 transition-colors">
                            {room.id}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">Room {room.id}</h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{room.type} Unit</p>
                          </div>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Maintenance
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <Icons.Maintenance />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</p>
                          <p className="text-sm font-bold text-amber-400">Awaiting inspection & cleaning</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMarkAvailable(room.id)}
                          className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          Mark Available
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Room Detail Modal / Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedRoom(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 m-2 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${selectedRoom.status === "Available" ? "bg-emerald-500/20 text-emerald-400" : selectedRoom.status === "Booked" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                {selectedRoom.id}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Room {selectedRoom.id}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{selectedRoom.type} Luxury Unit</p>
                <p className="text-blue-500 font-bold uppercase tracking-widest text-[14px]">{selectedRoom.price} RS</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-sm font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedRoom.status === "Available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : selectedRoom.status === "Booked" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                  {selectedRoom.status}
                </span>
              </div>

              {selectedRoom.status === "Available" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Guest Name</p>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter guest name..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">ID Card No.</p>
                      <input
                        type="text"
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value)}
                        placeholder="ID details"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Phone</p>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone No"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Check In</p>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Check Out</p>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-slate-800 border-dashed rounded-3xl text-center">
                  <p className="text-slate-500 text-sm font-medium">This room is currently occupied or under maintenance.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedRoom(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
              {selectedRoom.status === "Available" && (
                <button
                  onClick={handleBookRoom}
                  disabled={!customerName || !idCard || !phoneNumber || !checkInDate || !checkOutDate}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isStaffModalOpen && role === "General Manager" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsStaffModalOpen(false)}></div>
          <form onSubmit={handleAddStaff} className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-6">New Team Member</h3>

            <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('staff-image').click()}>
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-950/50 hover:border-indigo-500 transition-colors">
                    {newStaff.image ? (
                      <Image src={newStaff.image} alt="Preview" width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center">
                        <Icons.Plus />
                        <span className="text-[8px] font-black uppercase mt-1">Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors rounded-full"></div>
                </div>
                <input
                  id="staff-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Picture</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Full Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Username</label>
                <input
                  type="text"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  placeholder="e.g. alexj"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Create password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="e.g. alex@grandstay.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Phone Number</label>
                <input
                  type="text"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="e.g. +1234567890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Assign Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option>Receptionist</option>
                  <option>General Manager</option>
                  <option>Housekeeping</option>
                  <option>Security</option>
                  <option>Chef</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Account Status</label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">Add Member</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditStaffModalOpen && editingStaff && role === "General Manager" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditStaffModalOpen(false)}></div>
          <form onSubmit={handleUpdateStaff} className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Team Member</h3>

            <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Full Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Email</label>
                <input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  placeholder="e.g. alex@grandstay.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Phone Number</label>
                <input
                  type="text"
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  placeholder="e.g. +1234567890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Assign Role</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option>Receptionist</option>
                  <option>General Manager</option>
                  <option>Housekeeping</option>
                  <option>Security</option>
                  <option>Chef</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Account Status</label>
                <select
                  value={editingStaff.status}
                  onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Reset Password (leave blank if unchanged)</label>
                <input
                  type="password"
                  value={editingStaff.password}
                  onChange={(e) => setEditingStaff({ ...editingStaff, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setIsEditStaffModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsRoomModalOpen(false)}></div>
          <form onSubmit={handleAddRoom} className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-white mb-6">New Property Unit</h3>

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Room Number</label>
                <input
                  type="number"
                  value={newRoom.id}
                  onChange={(e) => setNewRoom({ ...newRoom, id: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Room Category</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option>Single</option>
                  <option>Double</option>
                  <option>4 Seats</option>
                  <option>Penthouse</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Price per Night</label>
                <input
                  type="number"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setIsRoomModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">Create Room</button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Detail Modal */}
      {viewedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewedBooking(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setViewedBooking(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">Booking Details</h3>

            <div className="space-y-6 mb-8">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Guest Name</p>
                <p className="font-bold text-slate-200 text-lg">{viewedBooking.customer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Unit Number</p>
                  <p className="font-bold text-slate-200">Room {viewedBooking.room}</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${viewedBooking.isCompleted ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                    {viewedBooking.isCompleted ? "Completed" : "Active"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ID Card Number</p>
                <p className="font-bold text-slate-200">{viewedBooking.idCard || "Not Provided"}</p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Phone Number</p>
                <p className="font-bold text-slate-200">{viewedBooking.phoneNumber || "Not Provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Check-In</p>
                  <p className="font-bold text-slate-200">{viewedBooking.checkIn}</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Check-Out</p>
                  <p className="font-bold text-slate-200">{viewedBooking.checkOut}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setViewedBooking(null)} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">Close Details</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-left {
          from { transform: translateX(-20px); }
          to { transform: translateX(0); }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-left {
          animation-name: slide-in-from-left;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
        .duration-700 {
          animation-duration: 700ms;
        }
        .duration-500 {
          animation-duration: 500ms;
        }
      `}</style>
    </div>
  );
}
