import React, { useState } from "react";
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaUtensils,
  FaCheckCircle,
} from "react-icons/fa";

import EventInfo from "./Tabs_in_eventcreation/EventInfo";
import Agenda from "./Tabs_in_eventcreation/Agenda";
import FinancialPlanning from "./Tabs_in_eventcreation/FinancialPlanning";
import FoodTravel from "./Tabs_in_eventcreation/FoodTravel";
import Checklist from "./Tabs_in_eventcreation/Checklist";

const tabs = [
  { id: "eventInfo", label: "Event Info", icon: <FaInfoCircle size={18} /> },
  { id: "agenda", label: "Agenda", icon: <FaCalendarAlt size={18} /> },
  { id: "financialPlanning", label: "Financial Planning", icon: <FaDollarSign size={18} /> },
  { id: "foodTravel", label: "Food & Travel", icon: <FaUtensils size={18} /> },
  { id: "checklist", label: "Checklist", icon: <FaCheckCircle size={18} /> },
];

const CreateEvent = () => {
  const [activeTab, setActiveTab] = useState("eventInfo");
  const [eventId, setEventId] = useState(null);

const [eventData, setEventData] = useState({
  eventInfo: { title: "", date: "", location: "", startDate: "", endDate: "" },
  agenda: [],
  financialPlanning: { budget: "", expenses: [], startDate: "", endDate: "" },
  foodTravel: { foodArrangements: "", travelDetails: "", startDate: "", endDate: "" },
  checklist: [],
});

// Separate startDate/endDate for easy access
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");


 const updateSection = (section, data) => {
  setEventData((prev) => ({
    ...prev,
    [section]: data,
  }));

  if (section === "eventInfo") {
    // Update lifted start/end dates for all tabs
    if (data.startDate) setStartDate(data.startDate);
    if (data.endDate) setEndDate(data.endDate);
  }
};


  const renderActiveTab = () => {
    switch (activeTab) {
      case "eventInfo":
        return (
          <EventInfo
            data={eventData.eventInfo}
            onChange={(data) => updateSection("eventInfo", data)}
            setEventId={setEventId}
          />
        );
      case "agenda":
        return (
          <Agenda
            data={eventData.agenda}
            onChange={(data) => updateSection("agenda", data)}
            eventId={eventId}
            eventStartDate={startDate}   // <-- pass here
            eventEndDate={endDate}       // <-- pass here
          />
        );
      case "financialPlanning":
        return (
          <FinancialPlanning
            data={eventData.financialPlanning}
            onChange={(data) => updateSection("financialPlanning", data)}
            eventId={eventId}
          />
        );
      case "foodTravel":
        return (
          <FoodTravel
            data={eventData.foodTravel}
            onChange={(data) => updateSection("foodTravel", data)}
            eventId={eventId}
          />
        );
      case "checklist":
        return (
          <Checklist
            data={eventData.checklist}
            onChange={(data) => updateSection("checklist", data)}
            eventId={eventId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 rounded-2xl mt-10 shadow-xl border"
      style={{
        background: "linear-gradient(135deg, #f0eaea 0%, #fff 50%, #f0eaea 100%)",
        borderColor: "#ddd",
      }}
    >
      <h1 className="text-4xl font-extrabold mb-8 text-center"
        style={{ color: "#575757", textShadow: "1px 1px 2px rgba(87,87,87,0.2)" }}
      >
        Create New Event
      </h1>

      {/* Tabs Navigation */}
      <nav className="flex flex-wrap justify-center gap-6 border-b-4 pb-4 mb-10"
        role="tablist" aria-label="Event Creation Tabs"
        style={{ borderColor: "#ddd" }}
      >
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          const isDisabled = id !== "eventInfo" && !eventId;
          return (
            <button
              key={id}
              onClick={() => !isDisabled && setActiveTab(id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${id}-panel`}
              id={`${id}-tab`}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              className="flex items-center gap-3 px-6 py-3 rounded-t-xl font-semibold transition-transform duration-300 shadow-md"
              style={{
                backgroundColor: isActive ? "#575757" : "transparent",
                color: isActive ? "#fff" : "#575757",
                borderBottom: isActive ? "4px solid #ddd" : "4px solid transparent",
                boxShadow: isActive ? "0 4px 8px rgba(87,87,87,0.3)" : undefined,
                transform: isActive ? "scale(1.05)" : "none",
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <section id={`${activeTab}-panel`} role="tabpanel" aria-labelledby={`${activeTab}-tab`}
        className="p-8 rounded-xl shadow-inner min-h-[350px] border"
        style={{ backgroundColor: "#fff", borderColor: "#ddd", color: "#575757" }}
      >
        {renderActiveTab()}
      </section>
    </div>
  );
};

export default CreateEvent;
