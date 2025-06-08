// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ksrLogo from "../../assets/ksr-logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  const [activeTab, setActiveTab] = useState(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleNavigate = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const activeStyle = "bg-orange-400 text-white rounded-md px-3 py-1 shadow-lg";

  return (
    <nav className="bg-[#2e2c2cc7] text-white px-8 py-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between">
      {/* Logo + Title */}
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <img src={ksrLogo} alt="KSR Logo" className="h-14 w-14 rounded-full" />
        <div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-wide">
            K.S.R. Institutions
          </h1>
          <p className="text-lg text-gray-300">Faculty & Admin Panel</p>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-wrap gap-8 text-xl font-semibold justify-center sm:justify-start">
        {[
          { label: "Create Event", path: "/create-event" },
          { label: "Report Generation", path: "/report-generation" },
          { label: "Event Logs", path: "/event-logs" },
          { label: "Inbox", path: "/faculty-inbox" },
          {label: "Inbox", path:"/higherauthority-inbox"}
        ].map(({ label, path }) => (
          <li key={path}>
            <button
              onClick={() => handleNavigate(path)}
              className={`transition duration-200 px-3 py-2 rounded-md ${
                activeTab === path
                  ? activeStyle
                  : "hover:bg-orange-600 hover:text-white"
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Profile Section */}
      <div className="flex items-center gap-6 mt-5 sm:mt-0">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium">{email}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
        <div className="h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold uppercase text-lg shadow-md">
          {email?.charAt(0)}
        </div>
        <button
          onClick={handleLogout}
          className="ml-3 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md transition duration-200 shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
