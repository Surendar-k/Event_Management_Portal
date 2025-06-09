import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ksrLogo from "../../assets/ksr-logo.png";
import axios from "axios";

// Enable sending cookies on all axios requests
axios.defaults.withCredentials = true;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null); // Store fetched profile data
  const profileRef = useRef();

  // These come from localStorage but session has full user info too
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout"); // logout API
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleNavigate = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  // Toggle profile popup & fetch session user data if opening
  const toggleProfile = async () => {
    if (!showProfile) {
      try {
        // NOTE: fixed URL with double slash after http:
        const res = await axios.get("http://localhost:5000/api/session");
        setUser(res.data.user);
        setShowProfile(true);
      } catch (err) {
        console.error("Failed to fetch session user:", err);
      }
    } else {
      setShowProfile(false);
    }
  };

  // Close profile popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeStyle = "bg-orange-400 text-white rounded-md px-3 py-1 shadow-lg";

  return (
    <nav className="bg-[#2e2c2cc7] text-white px-8 py-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between relative">
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
          { label: "Inbox", path: "/higherauthority-inbox" },
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
      <div className="flex items-center gap-6 mt-5 sm:mt-0 relative">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium">{email}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>

        <div
          className="h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold uppercase text-lg shadow-md cursor-pointer"
          onClick={toggleProfile}
        >
          {email?.charAt(0)}
        </div>

        {/* Profile Popup */}
{showProfile && user && (
  <div
    ref={profileRef}
    className="absolute top-16 right-2 w-100 max-w-full bg-white text-gray-900 shadow-2xl rounded-lg p-5 z-50 border border-gray-200"
  >
    <h2 className="font-semibold text-xl mb-4 border-b pb-2 border-gray-300">
      Profile Info
    </h2>
    <div className="flex flex-col gap-3">
      {[
        { label: "Name", value: user.faculty_name },
        { label: "Designation", value: user.designation },
        { label: "Department", value: user.department },
        { label: "Institution", value: user.institution_name },
        { label: "Faculty ID", value: user.faculty_id },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-md p-2"
        >
          <span className="flex-shrink-0 font-semibold text-orange-600 w-28 sm:w-32">
            {label}:
          </span>
          <span className="break-words text-gray-800">{value}</span>
        </div>
      ))}
    </div>
  </div>
)}


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
