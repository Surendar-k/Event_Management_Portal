import React, { useState } from "react";

// Static approvers list
const staticApprovers = ["HOD", "CSO", "Principal"];

// Sample event data
const sampleEvents = [
  {
    id: "event1",
    creatorEmail: "sivakumar@shanmugha.edu.in",
    status: "draft",
    approvals: {},
    eventData: {
      eventInfo: { title: "AI Seminar", date: "2025-07-20", location: "Auditorium" },
      agenda: [{ time: "10:00 AM", topic: "Intro to AI" }],
      financialPlanning: { budget: 5000, expenses: [] },
      foodTravel: { foodArrangements: "Snacks", travelDetails: "" },
      checklist: ["Projector", "Seating arranged"],
    },
  },
  {
    id: "event2",
    creatorEmail: "hod.ai_ds@shanmugha.edu.in",
    status: "submitted",
    approvals: { principal: false },
    eventData: {
      eventInfo: { title: "Data Science Workshop", date: "2025-07-25", location: "Lab 3" },
      agenda: [{ time: "09:00 AM", topic: "Python Basics" }],
      financialPlanning: { budget: 7000, expenses: [] },
      foodTravel: { foodArrangements: "Lunch", travelDetails: "Bus arranged" },
      checklist: ["Laptops", "WiFi"],
    },
  },
];

// Check if form is complete
const isFormComplete = (data) => {
  if (
    !data.eventInfo.title ||
    !data.eventInfo.date ||
    !data.eventInfo.location ||
    !data.agenda?.length ||
    !data.financialPlanning.budget ||
    !data.foodTravel.foodArrangements ||
    !data.checklist?.length
  ) {
    return false;
  }
  return true;
};

const EventLogs = ({ onEditEvent }) => {
  const [events, setEvents] = useState(sampleEvents);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openApprovalPopup = (event) => {
    setSelectedEvent(event);
    setSelectedApprovers([]);
    setShowApprovalPopup(true);
  };

  const closeApprovalPopup = () => {
    setSelectedEvent(null);
    setSelectedApprovers([]);
    setShowApprovalPopup(false);
  };

  const handleRequestApproval = () => {
    if (selectedApprovers.length === 0) {
      alert("Please select at least one approver");
      return;
    }

    const updatedEvents = events.map((ev) =>
      ev.id === selectedEvent.id
        ? {
            ...ev,
            status: "submitted",
            approvals: selectedApprovers.reduce((acc, role) => {
              acc[role.toLowerCase()] = false;
              return acc;
            }, {}),
          }
        : ev
    );

    setEvents(updatedEvents);
    closeApprovalPopup();
  };

  const handleCancelApproval = (id) => {
    const updatedEvents = events.map((ev) =>
      ev.id === id ? { ...ev, status: "draft", approvals: {} } : ev
    );
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((ev) => ev.id !== id));
    }
  };

  const getFirstIncompleteTab = (data) => {
    if (!data.eventInfo.title || !data.eventInfo.date || !data.eventInfo.location) return "eventInfo";
    if (!data.agenda?.length) return "agenda";
    if (!data.financialPlanning.budget) return "financialPlanning";
    if (!data.foodTravel.foodArrangements) return "foodTravel";
    if (!data.checklist?.length) return "checklist";
    return null;
  };

  const getStatusAndColor = (ev) => {
    const formComplete = isFormComplete(ev.eventData);
    if (!formComplete) return { label: "Draft", color: "bg-yellow-100 text-yellow-800" };
    if (formComplete && ev.status === "draft")
      return { label: "Pending Approval", color: "bg-purple-100 text-purple-800" };
    if (ev.status === "submitted") {
      const approvalsPending = Object.values(ev.approvals).some((val) => val === false);
      return approvalsPending
        ? { label: "Approval Sent", color: "bg-blue-100 text-blue-800" }
        : { label: "Approved", color: "bg-green-100 text-green-800" };
    }
    return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <>
      
       <div className="max-w-7xl mx-auto p-8 rounded-xl shadow-lg bg-[#f0eaea] backdrop-blur-md border border-white/20">

          <h1 className="text-5xl font-extrabold text-gray-900 mb-12 text-center leading-tight tracking-tight">
            My Created Events
          </h1>

          {events.length === 0 ? (
            <p className="text-center text-gray-500 italic text-lg">No events created yet.</p>
          ) : (
            <section className="space-y-8">
              {events.map((ev) => {
                const incompleteTab = getFirstIncompleteTab(ev.eventData);
                const { label: status, color: statusColor } = getStatusAndColor(ev);

                return (
                  <article
                    key={ev.id}
                    className="bg-[#d7d7d7] rounded-2xl shadow-md border px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-2xl transition duration-300"

                  >
                    <div className="flex-1 w-full">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 truncate mb-2">
                        {ev.eventData.eventInfo.title || "Untitled Event"}
                      </h2>
                      <dl className="text-gray-600 text-lg space-y-1">
                        <div>
                          <dt className="inline font-semibold">Date:</dt>{" "}
                          <dd className="inline">{ev.eventData.eventInfo.date || "-"}</dd>
                        </div>
                        <div>
                          <dt className="inline font-semibold">Location:</dt>{" "}
                          <dd className="inline">{ev.eventData.eventInfo.location || "-"}</dd>
                        </div>
                      </dl>
                      <p className="mt-4">
                        <span
                          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold tracking-wide ${statusColor}`}
                        >
                          {status}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-end md:flex-col">
                      <button
                        onClick={() => onEditEvent(ev.id, incompleteTab)}
                        className="rounded-xl bg-yellow-400 px-6 py-2 text-white font-semibold hover:bg-yellow-500 transition"
                      >
                        Edit
                      </button>

                      {(status === "Draft" || status === "Pending Approval") && (
                        <button
                          onClick={() => openApprovalPopup(ev)}
                          className="rounded-xl bg-indigo-600 px-6 py-2 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                          Request Approval
                        </button>
                      )}

                      {status === "Approval Sent" && (
                        <button
                          onClick={() => handleCancelApproval(ev.id)}
                          className="rounded-xl bg-red-600 px-6 py-2 text-white font-semibold hover:bg-red-700 transition"
                        >
                          Cancel Approval
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="rounded-xl bg-gray-600 px-6 py-2 text-white font-semibold hover:bg-gray-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      

      {showApprovalPopup && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div
            className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-4">
              Request Approval
            </h3>

            <div className="mb-6 max-h-60 overflow-y-auto space-y-4">
              {staticApprovers.map((approver) => (
                <label
                  key={approver}
                  className="block text-gray-800 text-lg cursor-pointer select-none hover:bg-indigo-50 rounded-lg px-4 py-2 transition"
                >
                  <input
                    type="checkbox"
                    value={approver}
                    checked={selectedApprovers.includes(approver)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedApprovers((prev) =>
                        prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
                      );
                    }}
                    className="mr-4 w-5 h-5 align-middle"
                  />
                  {approver}
                </label>
              ))}
            </div>

            {selectedApprovers.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3 border-b pb-2">Selected Approvers:</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedApprovers.map((approver) => (
                    <li
                      key={approver}
                      className="flex justify-between items-center bg-indigo-100 text-indigo-900 px-4 py-2 rounded-lg"
                    >
                      <span className="font-medium">{approver}</span>
                      <button
                        onClick={() =>
                          setSelectedApprovers((prev) => prev.filter((a) => a !== approver))
                        }
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                        aria-label={`Remove ${approver}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeApprovalPopup}
                className="rounded-xl bg-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestApproval}
                className="rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 transition"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventLogs;
