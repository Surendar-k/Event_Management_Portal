import React, { useState, useMemo } from "react";
import {
  FaEdit,
  FaPaperPlane,
  FaTimesCircle,
  FaTrashAlt,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaUserCheck,
  FaExclamationTriangle
} from "react-icons/fa";

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

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
const handleCancelApprovalClick = (event) => {
    setEventToCancel(event);
    setShowCancelConfirm(true);
  };

  // Confirm cancellation
  const confirmCancelApproval = () => {
    if (!eventToCancel) return;
    const updatedEvents = events.map((ev) =>
      ev.id === eventToCancel.id ? { ...ev, status: "draft", approvals: {} } : ev
    );
    setEvents(updatedEvents);
    setShowCancelConfirm(false);
    setEventToCancel(null);
  };

  // Cancel cancellation action
  const cancelCancelApproval = () => {
    setShowCancelConfirm(false);
    setEventToCancel(null);
  };

const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

   const openModal = (id) => {
    setSelectedEventId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEventId(null);
  };

  const confirmDelete = () => {
    setEvents(events.filter((ev) => ev.id !== selectedEventId));
    closeModal();
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
    if (!formComplete)
      return { label: "Draft", color: "bg-yellow-100 text-yellow-800", icon: <FaClock className="inline mr-2" /> };
    if (formComplete && ev.status === "draft")
      return {
        label: "Pending Approval",
        color: " text-purple-800",
        icon: <FaClipboardList className="inline mr-2" />,
      };
    if (ev.status === "submitted") {
      const approvalsPending = Object.values(ev.approvals).some((val) => val === false);
      return approvalsPending
        ? { label: "Approval Sent", color: "text-blue-800", icon: <FaPaperPlane className="inline mr-2" /> }
        : { label: "Approved", color: " text-green-800", icon: <FaUserCheck className="inline mr-2" /> };
    }
    return { label: "Unknown", color: " text-gray-800", icon: null };
  };

  // Filtered events based on status filter and search term
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const { label: statusLabel } = getStatusAndColor(ev);
      const matchesStatus =
        statusFilter === "all" ? true : statusLabel.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch = ev.eventData.eventInfo.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchTerm]);

  return (
    <>
      <div className="max-w-7xl mx-auto p-8 rounded-xl shadow-lg bg-[#f0eaea] backdrop-blur-md border border-white/20">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight tracking-tight">
          My Created Events
        </h1>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-lg font-medium"
              aria-label="Filter events by status"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending approval">Pending Approval</option>
              <option value="approval sent">Approval Sent</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search by event name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-lg font-medium w-full md:w-80"
              aria-label="Search events by name"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500 italic text-lg">No events found.</p>
        ) : (
          <section className="space-y-8">
            {filteredEvents.map((ev) => {
              const incompleteTab = getFirstIncompleteTab(ev.eventData);
              const { label: status, color: statusColor, icon: statusIcon } = getStatusAndColor(ev);

              return (
                <article
                  key={ev.id}
                  className="bg-[#d7d7d7] rounded-2xl shadow-md border px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-2xl transition duration-300"
                >
                  <div className="flex-1 w-full">
                    <h2
                      className="text-2xl md:text-3xl font-bold text-gray-800 truncate mb-2 flex items-center gap-2"
                      title={ev.eventData.eventInfo.title || "Untitled Event"}
                    >
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
                    <p className="mt-4 inline-block px-4 py-1 rounded-full text-sm font-semibold tracking-wide cursor-default select-none">
                      <span className={`${statusColor} flex items-center`}>
                        {statusIcon} {status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-end md:flex-col">
                    <button
                      onClick={() => onEditEvent(ev.id, incompleteTab)}
                      className="rounded-xl bg-yellow-400 px-6 py-2 text-white font-semibold hover:bg-yellow-500 flex items-center gap-2 transition"
                      aria-label={`Edit event ${ev.eventData.eventInfo.title}`}
                    >
                      <FaEdit /> Edit
                    </button>

                    {(status === "Draft" || status === "Pending Approval") && (
                      <button
                        onClick={() => openApprovalPopup(ev)}
                        className="rounded-xl bg-indigo-600 px-6 py-2 text-white font-semibold hover:bg-indigo-700 flex items-center gap-2 transition"
                        aria-label={`Request approval for event ${ev.eventData.eventInfo.title}`}
                      >
                        <FaPaperPlane /> Request Approval
                      </button>
                    )}

                    {status === "Approval Sent" && (
                      <button
                       onClick={() => handleCancelApprovalClick(ev)}

                        className="rounded-xl bg-red-600 px-6 py-2 text-white font-semibold hover:bg-red-700 flex items-center gap-2 transition"
                        aria-label={`Cancel approval for event ${ev.eventData.eventInfo.title}`}
                      >
                        <FaTimesCircle /> Cancel Approval
                      </button>
                    )}

                   <button
            onClick={() => openModal(ev.id)}
            className="rounded-xl bg-gray-600 px-6 py-2 text-white font-semibold hover:bg-gray-700 flex items-center gap-2 transition"
            aria-label={`Delete event ${ev.eventData.eventInfo.title}`}
          >
            <FaTrashAlt /> Delete
          </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {showApprovalPopup && selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={closeApprovalPopup}
          aria-modal="true"
          role="dialog"
          aria-labelledby="approval-popup-title"
        >
          <div
            className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl"
            style={{ borderTop: "6px solid rgb(34, 105, 197)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-4"
              
              id="approval-popup-title"
            >
              Request Approval
            </h3>

            <div className="mb-6 max-h-60 overflow-y-auto space-y-4" role="list">
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
                        prev.includes(value)
                          ? prev.filter((a) => a !== value)
                          : [...prev, value]
                      );
                    }}
                    className="mr-4 w-5 h-5 align-middle"
                  />
                  {approver}
                </label>
              ))}
            </div>

            {selectedApprovers.length > 0 && (
              <div className="mb-6"
              
              >
                <h4 className="font-semibold text-lg mb-3 border-b pb-2">Selected Approvers:</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto" role="list">
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

            <div className="flex justify-end gap-4 mt-6"
            >
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
      {/* NEW: Cancel Confirmation Popup */}
     {showCancelConfirm && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    
    onClick={cancelCancelApproval}
    aria-modal="true"
    role="dialog"
    aria-labelledby="cancel-approval-title"
  >
    <div
      className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl relative"
       style={{ borderTop: "6px solid rgb(197, 34, 34)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Warning Icon and Title */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-yellow-100 rounded-full">
          <FaExclamationTriangle className="text-yellow-600 text-3xl" />
        </div>
        <h3
          id="cancel-approval-title"
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        >
          Cancel Approval Request
        </h3>
      </div>

      {/* Confirmation Text */}
      <p className="text-gray-700 text-lg leading-relaxed mb-8">
        Are you sure you want to cancel the approval request for{" "}
        <span className="font-semibold text-gray-900">
          {eventToCancel?.eventData?.eventInfo?.title || "this event"}
        </span>
        ?
      </p>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={cancelCancelApproval}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
        >
          <span className="text-lg">❌</span> No, Keep
        </button>
        <button
          onClick={confirmCancelApproval}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          <span className="text-lg">✅</span> Yes, Cancel
        </button>
      </div>

      {/* Close icon top-right (optional) */}
      <button
        onClick={cancelCancelApproval}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-xl"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
)}

{/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div  className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl relative"
           style={{ borderTop: "6px solid rgb(197, 34, 34)" }}>
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}



    </>
  );
};

export default EventLogs;
