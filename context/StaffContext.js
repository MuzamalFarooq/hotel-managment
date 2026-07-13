"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "Receptionist",
    status: "Active",
    image: ""
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const { data: session } = useSession();

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setStaff(data.data.map(member => ({
          ...member,
          id: member._id
        })));
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "General Manager") {
      Promise.resolve().then(() => {
        fetchStaff();
      });
    }
  }, [session]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.username || !newStaff.password || !newStaff.role) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStaff),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff(); // Refresh staff list from DB
        setNewStaff({
          name: "",
          username: "",
          password: "",
          email: "",
          phone: "",
          role: "Receptionist",
          status: "Active",
          image: ""
        });
        setIsStaffModalOpen(false);
      } else {
        alert(data.error || "Failed to add staff");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to connect to server");
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.name || !editingStaff.role) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch(`/api/staff/${editingStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingStaff.name,
          email: editingStaff.email,
          phone: editingStaff.phone,
          role: editingStaff.role,
          status: editingStaff.status,
          password: editingStaff.password // optional for reset
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setIsEditStaffModalOpen(false);
        setEditingStaff(null);
      } else {
        alert(data.error || "Failed to update staff");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Failed to connect to server");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setIsEditStaffModalOpen(false);
        setEditingStaff(null);
      } else {
        alert(data.error || "Failed to delete staff");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("Failed to connect to server");
    }
  };

  const value = {
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
    handleDeleteStaff,
    fetchStaff
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};
