"use client";

import { createContext, useContext, useState, useEffect } from "react";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "Receptionist", image: "" });

  useEffect(() => {
    fetchStaff();
  }, []);

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

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name) return;

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newStaff.name,
          role: newStaff.role,
          image: newStaff.image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff(); // Refresh staff list from DB
        setNewStaff({ name: "", role: "Receptionist", image: "" });
        setIsStaffModalOpen(false);
      } else {
        alert(data.error || "Failed to add staff");
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to connect to server");
    }
  };

  const value = {
    staff,
    isStaffModalOpen,
    setIsStaffModalOpen,
    newStaff,
    setNewStaff,
    handleAddStaff
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
