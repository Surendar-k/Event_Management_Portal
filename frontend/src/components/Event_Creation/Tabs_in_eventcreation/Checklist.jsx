import React, { useState } from "react";

const allTasks = {
  online: [
    "Event Agenda",
    "Guest Invitations & Confirmation",
    "Participation Notification & Communication",
    "Website & Social Media Pre-Event Updates",
    "Photography & Videography Coverage",
    "Event Report Preparation & Submission",
    "Website and Social Media Post-Event Updates",
    "Certificate for Guest & Participants / Feedback From The Participants",
  ],
  offline: [
    "Event Agenda",
    "Guest Invitations & Confirmation",
    "Participation Notification & Communication",
    "Newspaper Engagement (Event Column)",
    "Flex Banner Design & Installation",
    "Signage & Directional Boards Placement",
    "Hall Setup & Technical Requirements",
    "Floral Arrangements, Mementos, Shawl, Return Gifts",
    "Reception Desk & Welcome Setup",
    "Tree Plantation Ceremony",
    "Guest Reception At Campus",
    "Lift Coordinator Assigned",
    "Guest Book Signing & 2-Min Video Byte",
    "Photography & Videography Coverage",
    "Event Report Preparation & Submission",
    "Website and Social Media Post-Event Updates",
    "Certificate for Guest & Participants / Feedback From The Participants",
  ],
};

const EventChecklist = () => {
  const [eventType, setEventType] = useState("");
  const [activeTasks, setActiveTasks] = useState([]);
  const [showAddTasks, setShowAddTasks] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const addTask = (task) => {
    if (!activeTasks.some((t) => t.activity === task)) {
      setActiveTasks([
        ...activeTasks,
        { activity: task, inCharge: "", date: "", remarks: "" },
      ]);
    }
  };

  const removeTask = (activity) => {
    setActiveTasks(activeTasks.filter((t) => t.activity !== activity));
  };

  const handleChange = (index, field, value) => {
    const updated = [...activeTasks];
    updated[index][field] = value;
    setActiveTasks(updated);
  };

  const filteredTasks =
    eventType && allTasks[eventType]
      ? allTasks[eventType].filter(
          (task) =>
            task.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !activeTasks.some((t) => t.activity === task)
        )
      : [];

  // Save handler (replace with your actual save logic)
  const handleSave = () => {
    console.log("Saving tasks:", activeTasks);
    alert("Tasks saved! Check console for output.");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-300 pb-3">
        Event Checklist
      </h2>

      <div className="mb-6 flex items-center space-x-4">
        <label
          htmlFor="eventType"
          className="font-semibold text-gray-800 text-lg min-w-[130px]"
        >
          Select Event Type:
        </label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setActiveTasks([]); // reset when event type changes
            setShowAddTasks(false);
            setSearchTerm("");
          }}
          className="border border-gray-400 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          <option value="">-- Choose --</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {eventType && (
        <>
          <button
            className="mb-6 inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-md transition"
            onClick={() => setShowAddTasks(true)}
          >
            + Add Tasks
          </button>

          {showAddTasks && (
            <div className="border border-gray-400 p-5 rounded-lg shadow-md max-w-xl mx-auto mb-10">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-400 rounded-md px-4 py-2 w-full mr-4 focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
                <button
                  className="text-gray-700 font-semibold hover:text-gray-900 transition"
                  onClick={() => setShowAddTasks(false)}
                  aria-label="Close Add Tasks"
                >
                  ✕
                </button>
              </div>

              <div
                style={{ maxHeight: 240, overflowY: "auto" }}
                className="border border-gray-300 rounded-md p-3"
              >
                {filteredTasks.length ? (
                  filteredTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3 mb-2 rounded cursor-pointer hover:bg-gray-200 text-gray-900"
                      onClick={() => addTask(task)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") addTask(task);
                      }}
                    >
                      {task}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-10">
                    No tasks found or all added
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTasks.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full border-collapse table-auto">
                  <thead className="bg-gray-200 text-gray-900">
                    <tr>
                      <th className="border border-gray-400 px-4 py-3 text-left text-sm font-semibold">
                        S.NO
                      </th>
                      <th className="border border-gray-400 px-4 py-3 text-left text-sm font-semibold">
                        ACTIVITY
                      </th>
                      <th className="border border-gray-400 px-4 py-3 text-left text-sm font-semibold">
                        IN-CHARGE
                      </th>
                      <th className="border border-gray-400 px-4 py-3 text-left text-sm font-semibold">
                        DATE
                      </th>
                      <th className="border border-gray-400 px-4 py-3 text-left text-sm font-semibold">
                        REMARKS
                      </th>
                      <th className="border border-gray-400 px-4 py-3 text-center text-sm font-semibold">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTasks.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-4 py-3 text-gray-800 text-sm text-center">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 text-sm">
                          {item.activity}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={item.inCharge}
                            onChange={(e) =>
                              handleChange(index, "inCharge", e.target.value)
                            }
                            placeholder="In-charge"
                            className="border border-gray-400 rounded-md px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              handleChange(index, "date", e.target.value)
                            }
                            className="border border-gray-400 rounded-md px-3 py-1 w-full max-w-[140px] mx-auto block focus:outline-none focus:ring-2 focus:ring-gray-600"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) =>
                              handleChange(index, "remarks", e.target.value)
                            }
                            placeholder="Remarks"
                            className="border border-gray-400 rounded-md px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            className="text-red-600 hover:text-red-800 font-semibold transition"
                            onClick={() => removeTask(item.activity)}
                            aria-label={`Remove task ${item.activity}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right mt-6">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-700 italic text-center">
              No tasks added yet. Click <strong>+ Add Tasks</strong> to start.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default EventChecklist;
