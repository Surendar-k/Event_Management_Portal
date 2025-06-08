import React, { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEnvelopeOpenText,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaCommentDots,
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
];

const HigherAuthorityInbox = () => {
  // Hardcoded userRole for this static demo
  const userRole = "hod";

  const [events, setEvents] = useState(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const pendingEvents = events.filter(
    (ev) =>
      ev.creatorRole === "faculty" &&
      ev.approvals &&
      Object.prototype.hasOwnProperty.call(ev.approvals, userRole) &&
      ev.approvals[userRole] === false
  );

  const openApprovePopup = (ev) => {
    setSelectedEvent(ev);
    setShowApprovePopup(true);
  };

  const openReviewPopup = (ev) => {
    setSelectedEvent(ev);
    setReviewMessage("");
    setShowReviewPopup(true);
  };

  const closePopups = () => {
    setSelectedEvent(null);
    setShowApprovePopup(false);
    setShowReviewPopup(false);
  };

  const handleApprove = (approved) => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            approvals: {
              ...ev.approvals,
              [userRole]: approved ? true : "rejected",
            },
            reviews: {
              ...ev.reviews,
              [userRole]: approved ? null : `Rejected by ${userRole.toUpperCase()}`,
            },
          };
        }
        return ev;
      })
    );
    closePopups();
  };

  const handleSendReview = () => {
    if (!selectedEvent) return;
    if (reviewMessage.trim() === "") {
      alert("Please enter a review message");
      return;
    }
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            reviews: {
              ...ev.reviews,
              [userRole]: reviewMessage.trim(),
            },
            approvals: {
              ...ev.approvals,
              [userRole]: false,
            },
          };
        }
        return ev;
      })
    );
    closePopups();
  };

  return (
    <div
      className="max-w-7xl mx-auto p-8 rounded-2xl min-h-screen"
      style={{ backgroundColor: "#f0eaea", color: "#1a1a1a", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h1 className="text-center text-4xl font-extrabold mb-10" style={{ color: "#333" }}>
        {userRole.toUpperCase()} Inbox
      </h1>

      {pendingEvents.length === 0 ? (
        <p className="text-center text-gray-600 text-lg italic">No pending events.</p>
      ) : (
        <div className="space-y-10">
          {pendingEvents.map((ev) => {
            const approvalStatus = ev.approvals?.[userRole];
            return (
              <div
                key={ev.id}
                className="bg-white shadow-lg rounded-xl p-8 border border-gray-300"
                style={{ boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}
              >
                <h2 className="text-3xl font-bold text-indigo-900 mb-3 flex items-center gap-3">
                  <FaEnvelopeOpenText />
                  {ev.eventData?.eventInfo?.title || "Untitled Event"}
                </h2>

                <div className="mb-4 text-gray-700 flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <FaUserCircle className="text-gray-500" />
                    Created by {ev.creatorRole.toUpperCase()} &nbsp;|&nbsp; {ev.creatorEmail}
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap gap-6 text-gray-700 text-base">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-600" />
                    <span><strong>Date:</strong> {ev.eventData?.eventInfo?.date || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <span><strong>Location:</strong> {ev.eventData?.eventInfo?.location || "N/A"}</span>
                  </div>
                </div>

                <p className="mb-6 text-gray-800 italic leading-relaxed border-l-4 border-indigo-400 pl-4">
                  {ev.eventData?.eventInfo?.description || "No description"}
                </p>

                <p className="mb-4 font-semibold">
                  Status:{" "}
                  {approvalStatus === true ? (
                    <span className="text-green-700 flex items-center gap-2 font-semibold">
                      <FaCheckCircle /> Approved
                    </span>
                  ) : approvalStatus === false ? (
                    <span className="text-yellow-700 flex items-center gap-2 font-semibold">
                      <FaTimesCircle /> Pending
                    </span>
                  ) : approvalStatus === "rejected" ? (
                    <span className="text-red-700 flex items-center gap-2 font-semibold">
                      <FaTimesCircle /> Rejected
                    </span>
                  ) : (
                    <span className="text-gray-600">N/A</span>
                  )}
                </p>

                <p className="mb-6 text-gray-700 font-medium flex items-center gap-2">
                  <FaCommentDots />
                  Your Review:{" "}
                  <span className="italic text-gray-500 font-normal">
                    {ev.reviews?.[userRole] || "No review yet."}
                  </span>
                </p>

                <div className="flex flex-wrap gap-6">
                  <button
                    onClick={() => openApprovePopup(ev)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-shadow shadow-md"
                    title="Approve or Reject"
                  >
                    <FaCheckCircle size={20} />
                    Approve
                  </button>

                  <button
                    onClick={() => openReviewPopup(ev)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-shadow shadow-md"
                    title="Send Review"
                  >
                    <FaEdit size={20} />
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Popup */}
      {showApprovePopup && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-4">
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl"
            style={{ borderTop: "6px solid #22c55e" }}
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Approve "{selectedEvent.eventData?.eventInfo?.title}"
            </h3>
            <p className="mb-6 text-gray-700 text-lg">
              Do you want to approve this event?
            </p>
            <div className="flex justify-end gap-5">
              <button
                onClick={() => handleApprove(true)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-shadow shadow-md"
              >
                Yes
              </button>
              <button
                onClick={() => handleApprove(false)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-shadow shadow-md"
              >
                No
              </button>
              <button
                onClick={closePopups}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Popup */}
      {showReviewPopup && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl" style={{ borderTop: "6px solid #4338ca" }}>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Send Review for "{selectedEvent.eventData?.eventInfo?.title}"
            </h3>
            <textarea
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              placeholder="Enter your message..."
              className="w-full p-4 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              rows={6}
            />
            <div className="flex justify-end gap-5">
              <button
                onClick={handleSendReview}
                className="px-6 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-shadow shadow-md"
              >
                Send
              </button>
              <button
                onClick={closePopups}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HigherAuthorityInbox;
