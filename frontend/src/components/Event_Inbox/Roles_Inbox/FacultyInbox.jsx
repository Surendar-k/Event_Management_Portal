import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEnvelopeOpenText,
  FaTrashAlt,
} from "react-icons/fa";

const sampleEvents = [
  {
    id: "event1",
    creatorRole: "faculty",
    creatorEmail: "faculty1@school.edu",
    status: "submitted",
    approvals: {
      hod: false,
      principal: false,
      cso: false,
    },
    reviews: {
      hod: null,
      principal: null,
      cso: null,
    },
    eventData: {
      eventInfo: {
        title: "AI Seminar",
        date: "2025-07-20",
        location: "Auditorium",
        description: "A seminar on Artificial Intelligence by industry experts.",
      },
    },
  },
  {
    id: "event2",
    creatorRole: "faculty",
    creatorEmail: "faculty2@school.edu",
    status: "submitted",
    approvals: {
      hod: true,
      principal: false,
      cso: false,
    },
    reviews: {
      hod: "Looks good to me.",
      principal: null,
      cso: null,
    },
    eventData: {
      eventInfo: {
        title: "Robotics Workshop",
        date: "2025-07-22",
        location: "Lab 1",
        description: "Hands-on robotics workshop for beginners.",
      },
    },
  },
  {
    id: "event3",
    creatorRole: "hod",
    creatorEmail: "hod1@school.edu",
    status: "submitted",
    approvals: {
      principal: false,
      cso: false,
    },
    reviews: {
      principal: null,
      cso: null,
    },
    eventData: {
      eventInfo: {
        title: "Data Science Workshop",
        date: "2025-07-25",
        location: "Lab 3",
        description: "A workshop focused on Data Science techniques and tools.",
      },
    },
  },
  {
    id: "event4",
    creatorRole: "principal",
    creatorEmail: "principal@school.edu",
    status: "submitted",
    approvals: {
      cso: false,
    },
    reviews: {
      cso: null,
    },
    eventData: {
      eventInfo: {
        title: "Annual Day",
        date: "2025-08-15",
        location: "Main Hall",
        description: "School annual day celebration with performances and awards.",
      },
    },
  },
  {
    id: "event5",
    creatorRole: "faculty",
    creatorEmail: "faculty3@school.edu",
    status: "submitted",
    approvals: {
      hod: "rejected",
      principal: false,
      cso: false,
    },
    reviews: {
      hod: "The event schedule clashes with exams. Please reschedule.",
      principal: null,
      cso: null,
    },
    eventData: {
      eventInfo: {
        title: "Math Olympiad",
        date: "2025-07-30",
        location: "Room 101",
        description: "Inter-school math competition for high school students.",
      },
    },
  },
];

const approvalStatusIcon = (status) => {
  switch (status) {
    case true:
      return <FaCheckCircle className="text-green-600 text-xl" title="Approved" />;
    case false:
      return <FaClock className="text-yellow-500 text-xl" title="Pending" />;
    case "rejected":
      return <FaTimesCircle className="text-red-500 text-xl" title="Rejected" />;
    default:
      return <FaEnvelopeOpenText className="text-gray-400 text-xl" title="No Status" />;
  }
};

const approvalStatusText = (status) => {
  if (status === true) return "Approved";
  if (status === false) return "Pending";
  if (status === "rejected") return "Rejected";
  return "N/A";
};

const eventColors = [
  "bg-blue-50",
  "bg-yellow-50",
  "bg-green-50",
  "bg-pink-50",
  "bg-purple-50",
  "bg-orange-50",
];

const FacultyInbox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState(sampleEvents); // state to track events


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

  const filteredEvents = events.filter((ev) =>
    ev.eventData.eventInfo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen rounded-2xl">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-gray-800 tracking-wide">
        Event Inbox
      </h1>

      <div className="mb-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by event name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No events found.</p>
      ) : (
        <div className="space-y-10">
          {filteredEvents.map((ev, index) => (
            <div
              key={ev.id}
              className={`rounded-xl p-8 border border-gray-300 shadow-lg hover:shadow-2xl transition duration-300 ${eventColors[index % eventColors.length]}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <FaCalendarAlt className="text-3xl text-indigo-600" />
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      {ev.eventData.eventInfo.title}
                    </h2>
                    <p className="text-sm text-gray-600 capitalize">
                      Created by {ev.creatorRole} &nbsp;|&nbsp; {ev.creatorEmail}
                    </p>
                  </div>
                </div>
                <button
                    onClick={() => openModal(ev.id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete this event"
                >
                  <FaTrashAlt className="text-2xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span> {ev.eventData.eventInfo.date}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Location:</span> {ev.eventData.eventInfo.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 italic">{ev.eventData.eventInfo.description}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">Approvals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {Object.entries(ev.approvals).map(([role, status]) => (
                  <div
                    key={role}
                    className="flex items-center space-x-3 p-4 border rounded-lg shadow-sm bg-white"
                  >
                    {approvalStatusIcon(status)}
                    <div>
                      <p className="font-semibold capitalize text-gray-900">{role}</p>
                      <p
                        className={`${
                          status === true
                            ? "text-green-600"
                            : status === false
                            ? "text-yellow-600"
                            : status === "rejected"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {approvalStatusText(status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">Review Comments</h3>
              <div className="space-y-3">
                {Object.entries(ev.reviews).some(([comment]) => comment) ? (
                  Object.entries(ev.reviews).map(([role, comment]) =>
                    comment ? (
                      <div
                        key={role}
                        className="bg-indigo-100 rounded-md p-4 border-l-4 border-indigo-500"
                      >
                        <p className="font-semibold capitalize mb-1">{role} says:</p>
                        <p className="italic text-gray-800">"{comment}"</p>
                      </div>
                    ) : null
                  )
                ) : (
                  <p className="text-gray-500 italic">No review comments yet.</p>
                )}
              </div>
            </div>
          ))}
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

    </div>
  );
};

export default FacultyInbox;
