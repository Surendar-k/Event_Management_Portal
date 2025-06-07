import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navigation_Bar/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-500 to-white">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
