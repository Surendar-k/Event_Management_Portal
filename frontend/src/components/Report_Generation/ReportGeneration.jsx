import React, { useState, useMemo } from "react";
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaClipboardList,
  FaUtensils,
  FaMoneyBill,
  FaImages,
  FaFilePdf,
  FaFileExcel,
  FaSearch,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ReportGeneration = () => {
  const events = [
    {
      id: 1,
      title: "AI Symposium 2025",
      institution: "RMD Engineering College",
      college: "School of Computer Science",
      department: "AI & DS",
      leadCoordinator: "Dr. Raj Kumar",
      facultyCoordinators: ["Prof. Anitha", "Prof. Karthik"],
      startDate: "2025-07-20",
      endDate: "2025-07-21",
      noOfDays: 2,
      natureOfEvent: "Symposium",
      venueType: "Auditorium",
      venue: "Main Block Auditorium",
      audience: "Students",
      scope: "National",
      fundingSource: "College Sponsored",
      speakers: [
        {
          name: "Dr. A.P. Ramesh",
          designation: "Chief Data Scientist",
          affiliation: "Infosys",
          contact: "9876543210",
          email: "ramesh@infosys.com",
        },
      ],
      estimatedParticipation: {
        students: 150,
        faculty: 20,
        total: 170,
      },
      guestServices: {
        accommodation: "Provided",
        transportation: "Not Required",
        dining: "Buffet Lunch & Tea",
      },
      technicalSetup: {
        av: "Projector + Mic",
        speakers: "2 Surround Speakers",
        ac: "Central AC",
        units: 4,
        materials: "Laptop, Clicker",
        photography: "Yes",
        videography: "Yes",
        lighting: "Standard Lighting",
        liveStream: "YouTube",
        additional: "Banner Backdrop",
      },
      objectives:
        "The event aims to bring together industry leaders and students to discuss the latest trends in Artificial Intelligence.",
      outcomes:
        "Participants gained exposure to real-world AI applications and improved networking with professionals.",
      sessionDetails: [
        {
          date: "2025-07-20",
          from: "10:00 AM",
          to: "11:30 AM",
          topic: "Ethics in AI",
          speaker: "Dr. Ramesh",
        },
        {
          date: "2025-07-21",
          from: "11:45 AM",
          to: "1:00 PM",
          topic: "Future of Machine Learning",
          speaker: "Dr. Ramesh",
        },
      ],
      financialPlanning: [
        { source: "College Fund", amount: 20000, remarks: "Stage & Setup" },
        { source: "Department Budget", amount: 10000, remarks: "Guest Gifts" },
      ],
      foodTravel: [
        {
          date: "2025-07-20",
          mealType: "Lunch",
          menu: "Rice, Curry, Sweets, Juice",
          servedAt: "Seminar Hall",
          note: "Pure Veg Only",
        },
      ],
      checklist: [
        "Event Agenda Finalized",
        "Guest Invitations Sent",
        "Flex Banners Installed",
        "AV Equipment Setup",
        "Certificates Prepared",
      ],
    },
    {
      id: 2,
      title: "ML Workshop 2024",
      institution: "XYZ Engineering College",
      college: "School of Information Technology",
      department: "Machine Learning",
      leadCoordinator: "Dr. Suresh",
      facultyCoordinators: ["Prof. Meena", "Prof. Hari"],
      startDate: "2024-05-15",
      endDate: "2024-05-16",
      noOfDays: 2,
      natureOfEvent: "Workshop",
      venueType: "Lab",
      venue: "Computer Lab 3",
      audience: "Students",
      scope: "State",
      fundingSource: "Department Budget",
      speakers: [
        {
          name: "Dr. Kavita",
          designation: "ML Specialist",
          affiliation: "Google",
          contact: "9123456780",
          email: "kavita@google.com",
        },
      ],
      estimatedParticipation: {
        students: 100,
        faculty: 15,
        total: 115,
      },
      guestServices: {
        accommodation: "Not Provided",
        transportation: "Required",
        dining: "Snacks & Tea",
      },
      technicalSetup: {
        av: "Projector",
        speakers: "Single Speaker",
        ac: "Window AC",
        units: 2,
        materials: "Laptops",
        photography: "No",
        videography: "No",
        lighting: "Normal Lighting",
        liveStream: "None",
        additional: "Whiteboard",
      },
      objectives:
        "Hands-on workshop on machine learning algorithms and practical applications.",
      outcomes:
        "Improved practical knowledge and project exposure for students.",
      sessionDetails: [
        {
          date: "2024-05-15",
          from: "09:30 AM",
          to: "12:00 PM",
          topic: "Intro to ML",
          speaker: "Dr. Kavita",
        },
        {
          date: "2024-05-16",
          from: "01:00 PM",
          to: "04:00 PM",
          topic: "ML Projects",
          speaker: "Dr. Kavita",
        },
      ],
      financialPlanning: [
        { source: "Department Budget", amount: 15000, remarks: "Materials" },
      ],
      foodTravel: [
        {
          date: "2024-05-15",
          mealType: "Tea",
          menu: "Tea, Biscuits",
          servedAt: "Lab Lobby",
          note: "N/A",
        },
      ],
      checklist: [
        "Workshop Plan Finalized",
        "Invitations Sent",
        "Equipment Checked",
        "Certificates Ready",
      ],
    },
  ];

  // Filter & search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, upcoming
  const [collegeFilter, setCollegeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Selected event state
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get today's date for status calculation
  const today = new Date();

  // Helper: determine event status
  const getStatus = (event) => {
    const endDate = new Date(event.endDate);
    return endDate < today ? "completed" : "upcoming";
  };

  // Unique colleges for filter dropdown
  const colleges = Array.from(new Set(events.map((e) => e.college)));

  // Filtered events memoized
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by search term in title (case insensitive)
      if (
        searchTerm &&
        !event.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by status
      const status = getStatus(event);
      if (statusFilter !== "all" && statusFilter !== status) {
        return false;
      }

      // Filter by college
      if (collegeFilter && event.college !== collegeFilter) {
        return false;
      }

      // Filter by date range (startDateFilter to endDateFilter)
      if (startDateFilter && new Date(event.startDate) < new Date(startDateFilter)) {
        return false;
      }
      if (endDateFilter && new Date(event.startDate) > new Date(endDateFilter)) {
        return false;
      }

      return true;
    });
  }, [searchTerm, statusFilter, collegeFilter, startDateFilter, endDateFilter, events]);

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!selectedEvent) return;
    const updatedImages = selectedEvent.uploadedImages
      ? [...selectedEvent.uploadedImages, ...files]
      : files;
    setSelectedEvent({ ...selectedEvent, uploadedImages: updatedImages });
  };

  // Convert image file to base64 for PDF embedding
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Export event report to PDF with embedded images
  const exportToPDF = async () => {
    if (!selectedEvent) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(selectedEvent.title + " Report", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Field", "Details"]],
      body: [
        ["Institution", selectedEvent.institution],
        ["Department", selectedEvent.department],
        ["Start Date", selectedEvent.startDate],
        ["End Date", selectedEvent.endDate],
        ["Venue", selectedEvent.venue],
        ["Funding", selectedEvent.fundingSource],
      ],
    });

    if (selectedEvent.uploadedImages && selectedEvent.uploadedImages.length > 0) {
      let y = doc.autoTable.previous.finalY + 10;
      doc.text("Uploaded Images:", 14, y);
      y += 5;

      for (const imgFile of selectedEvent.uploadedImages) {
        const base64 = await getBase64(imgFile);
        doc.addImage(base64, "JPEG", 14, y, 60, 45);
        y += 50;
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      }
    }

    doc.save(`${selectedEvent.title}-report.pdf`);
  };

  // Export event report to Excel with image filenames
  const exportToExcel = () => {
    if (!selectedEvent) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      {
        Title: selectedEvent.title,
        Institution: selectedEvent.institution,
        Department: selectedEvent.department,
        StartDate: selectedEvent.startDate,
        EndDate: selectedEvent.endDate,
        Venue: selectedEvent.venue,
        Funding: selectedEvent.fundingSource,
        UploadedImages: selectedEvent.uploadedImages
          ? selectedEvent.uploadedImages.map((f) => f.name).join(", ")
          : "",
      },
    ]);

    XLSX.utils.book_append_sheet(wb, ws, "Event Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `${selectedEvent.title}-report.xlsx`);
  };

  if (!selectedEvent) {
    return (
      <div  className="max-w-7xl mx-auto p-6 rounded-2xl mt-10 shadow-xl border"

      style={{
        background: "linear-gradient(135deg, #f0eaea 0%, #fff 50%, #f0eaea 100%)",
        borderColor: "#ddd",
      }}>
         <h1
        className="text-4xl font-extrabold mb-8 text-center"
        style={{ color: "#575757", textShadow: "1px 1px 2px rgba(87,87,87,0.2)" }}
      >
        Event Reports
      </h1>
        {/* Filters */}
        <div className="mb-6 p-4  rounded-lg shadow flex flex-col md:flex-row md:items-center md:gap-4"
        style={{
        background: "linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(100, 99, 99) 50%  ,rgb(164, 161, 161) 100%)",
        borderColor: "#ddd",
      }}>
          <div className="flex text-white items-center border rounded px-3 py-2 flex-1 mb-4 md:mb-0">
            <FaSearch className="text-white mr-2" />
            <input
              type="text"
              placeholder="Search event title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          <select
            className="border text-white rounded px-3 py-2 mb-4 md:mb-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="text-black">All Statuses</option>
            <option value="upcoming"className="text-black">Upcoming</option>
            <option value="completed"className="text-black">Completed</option>
          </select>

          <select
            className="border text-white  rounded px-3 py-2 mb-4 md:mb-0"
            value={collegeFilter}
      
            onChange={(e) => setCollegeFilter(e.target.value)}
          >
            <option value=""className="text-black">All Colleges</option>
            {colleges.map((col) => (
              <option key={col} value={col}className="text-black">
                {col}
              </option>
            ))}
          </select>

          <div className="flex gap-2 text-white  items-center">
            <label className="text-sm font-medium" htmlFor="startDateFilter">
              From:
            </label>
            <input
              type="date"
              id="startDateFilter"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex gap-2 text-white  items-center">
            <label className="text-sm font-medium" htmlFor="endDateFilter">
              To:
            </label>
            <input
              type="date"
              id="endDateFilter"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Event list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const status = getStatus(event);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent({ ...event, uploadedImages: [] })}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg p-5 border-l-4 cursor-pointer
                    border-blue-500 transition-all relative"
                >
                  <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
                  <p className="text-sm mb-1">
                    <strong>Department:</strong> {event.department}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Dates:</strong> {event.startDate} → {event.endDate}
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Venue:</strong> {event.venue}
                  </p>
                  <p
                    className={`inline-block text-xs font-semibold px-2 py-1 rounded ${
                      status === "completed"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {status === "completed" ? "Completed" : "Upcoming"}
                  </p>

                  <p className="text-xs mt-2 text-gray-500">
                    <strong>College:</strong> {event.college}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No events match the filter criteria.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ... The rest of the selectedEvent UI remains the same as your original with minor UI polish

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-white via-blue-50 to-white shadow-xl rounded-xl">
      <button
        onClick={() => setSelectedEvent(null)}
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2 rounded"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={exportToPDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
        >
          <FaFilePdf /> Export PDF
        </button>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <FaFileExcel /> Export Excel
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">
        {selectedEvent.title} Report
      </h1>

      <Section title="Event Details" icon={<FaCalendarAlt />}>
        <GridTwo>
          <Item label="Institution" value={selectedEvent.institution} />
          <Item label="College" value={selectedEvent.college} />
          <Item label="Department" value={selectedEvent.department} />
          <Item label="Lead Coordinator" value={selectedEvent.leadCoordinator} />
          <Item
            label="Faculty Coordinators"
            value={selectedEvent.facultyCoordinators.join(", ")}
          />
          <Item label="Start Date" value={selectedEvent.startDate} />
          <Item label="End Date" value={selectedEvent.endDate} />
          <Item label="Days" value={selectedEvent.noOfDays} />
          <Item label="Nature" value={selectedEvent.natureOfEvent} />
          <Item label="Venue Type" value={selectedEvent.venueType} />
          <Item label="Venue" value={selectedEvent.venue} />
          <Item label="Audience" value={selectedEvent.audience} />
          <Item label="Scope" value={selectedEvent.scope} />
          <Item label="Funding" value={selectedEvent.fundingSource} />
          <Item
            label="Status"
            value={
              getStatus(selectedEvent) === "completed"
                ? "Completed"
                : "Upcoming"
            }
          />
        </GridTwo>
      </Section>
<Section title="Speakers" icon={<FaChalkboardTeacher />}>
        {selectedEvent.speakers.map((s, i) => (
          <Card key={i}>
            <Item label="Name" value={s.name} />
            <Item label="Designation" value={s.designation} />
            <Item label="Affiliation" value={s.affiliation} />
            <Item label="Contact" value={s.contact} />
            <Item label="Email" value={s.email} />
          </Card>
        ))}
      </Section>

      <Section title="Guest Services" icon={<FaClipboardList />}>
        <GridTwo>
          <Item label="Accommodation" value={selectedEvent.guestServices.accommodation} />
          <Item label="Transportation" value={selectedEvent.guestServices.transportation} />
          <Item label="Dining" value={selectedEvent.guestServices.dining} />
        </GridTwo>
      </Section>

      <Section title="Technical Setup">
        {Object.entries(selectedEvent.technicalSetup).map(([key, val]) => (
          <p key={key}>
            <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {val}
          </p>
        ))}
      </Section>

      <Section title="Objectives & Outcomes">
        <p className="mb-2">
          <strong>Objectives:</strong> {selectedEvent.objectives}
        </p>
        <p>
          <strong>Outcomes:</strong> {selectedEvent.outcomes}
        </p>
      </Section>

      <Section title="Sessions">
        {selectedEvent.sessionDetails.map((s, i) => (
          <Card key={i}>
            <Item label="Date" value={s.date} />
            <Item label="From" value={s.from} />
            <Item label="To" value={s.to} />
            <Item label="Topic" value={s.topic} />
            <Item label="Speaker" value={s.speaker} />
          </Card>
        ))}
      </Section>

      <Section title="Financial Planning" icon={<FaMoneyBill />}>
        {selectedEvent.financialPlanning.map((f, i) => (
          <Card key={i}>
            <Item label="Source" value={f.source} />
            <Item label="Amount" value={`₹${f.amount}`} />
            <Item label="Remarks" value={f.remarks} />
          </Card>
        ))}
      </Section>

      <Section title="Food & Travel" icon={<FaUtensils />}>
        {selectedEvent.foodTravel.map((f, i) => (
          <Card key={i}>
            <Item label="Date" value={f.date} />
            <Item label="Meal" value={f.mealType} />
            <Item label="Menu" value={f.menu} />
            <Item label="Served At" value={f.servedAt} />
            <Item label="Note" value={f.note} />
          </Card>
        ))}
      </Section>

      <Section title="Checklist">
        <ul className="list-disc pl-6 space-y-1">
          {selectedEvent.checklist.map((task, i) => (
            <li key={i}>{task}</li>
          ))}
        </ul>
      </Section>

      <Section title="Images" icon={<FaImages />}>
        {/* Image Upload */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {selectedEvent.uploadedImages && selectedEvent.uploadedImages.length > 0 ? (
            selectedEvent.uploadedImages.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt={`Uploaded ${i + 1}`}
                className="w-full h-44 object-cover rounded-md shadow-md hover:scale-105 transition-transform duration-300"
              />
            ))
          ) : (
            <p className="text-gray-500">No images uploaded yet.</p>
          )}
        </div>
      </Section>
    </div>
  );
};

// Your reusable components Section, GridTwo, Card, Item remain unchanged

// Reusable Components
const Section = ({ title, children, icon }) => (
  <div className="mb-10 border-b pb-4">
    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-blue-900 border-l-4 border-blue-500 pl-3">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const GridTwo = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const Card = ({ children }) => (
  <div className="bg-white p-5 border border-gray-200 rounded-lg mb-4 shadow-sm">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Item = ({ label, value }) => (
  <div className="flex flex-col text-sm space-y-1">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);


export default ReportGeneration;