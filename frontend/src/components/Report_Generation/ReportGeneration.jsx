import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FaChevronRight,
  FaFilePdf,
  FaSave,
  FaTimes,
  FaCalendarAlt
} from 'react-icons/fa';


const ReportGeneration = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [formLinks, setFormLinks] = useState({});
  const [feedbackLinks, setFeedbackLinks] = useState({});
  const [circularTexts, setCircularTexts] = useState({});
  const [expenses, setExpenses] = useState({});
  const [images, setImages] = useState({});
  const [uploadedHeaderLogos, setUploadedHeaderLogos] = useState({});
  const [eventReportLogos, setEventReportLogos] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('circular');
useEffect(() => {
  const fetchHeaders = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/uploaded-headers', {
      withCredentials: true
    });
    const headerMap = {};
    res.data.forEach(header => {
      const college = (header.college_name || '').trim().toLowerCase();
      const dept = (header.department || '').trim().toLowerCase();
      const key = `${college}_${dept}`;
      headerMap[key] = header.logoUrl;
    });
    setUploadedHeaderLogos(headerMap);
  };

  fetchHeaders();
}, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/api/events/by-user',
          { withCredentials: true }
        );
        

        const formData = {},
          feedbackData = {},
          circularData = {},
          expenseData = {},
          imageData = {},
          logoData = {};

        res.data.forEach((e) => {
          const id = e.eventId || e.event_id;
          formData[id] = e.report?.googleForm || '';
          feedbackData[id] = e.report?.feedbackForm || '';
          circularData[id] = e.report?.circularText || '';
          logoData[id] = e.report?.headerLogo || '';

          const budget = e.financialplanning?.budget || [];
          const estimatedSum = budget.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
          );

          const actual = e.report?.expenses?.actual || '';

          expenseData[id] = {
            estimated:
              e.report?.expenses?.estimated || estimatedSum.toString(),
            actual
          };

          imageData[id] = e.report?.images || [];
        });

        setFormLinks(formData);
        setFeedbackLinks(feedbackData);
        setCircularTexts(circularData);
        setExpenses(expenseData);
        setImages(imageData);
        setEventReportLogos(logoData);
        setEvents(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load events');
      }
    };

    fetchEvents();
  }, []);

const getBase64ImageFromUrl = async (imageUrl) => {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) {
      console.warn(`❌ Could not fetch image: ${res.status} ${res.statusText}`);
      return '';
    }
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('⚠️ Failed to fetch image URL:', imageUrl, err);
    return '';
  }
};


  const openModal = (event) => {
    setSelectedEvent(event);
    setActiveTab('circular');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const getImageFormat = (base64) => {
    if (base64.includes('image/png')) return 'PNG';
    if (base64.includes('image/webp')) return 'WEBP';
    return 'JPEG'; // default fallback
  };

const renderLogo = async (doc, logoUrl) => {
  if (!logoUrl) {
    console.warn('🚫 No logo URL found for header');
    return;
  }

  try {
    const base64Logo = logoUrl.startsWith('data:')
      ? logoUrl
      : await getBase64ImageFromUrl(logoUrl);

    if (!base64Logo || base64Logo.length < 100) {
      console.warn('❌ Failed to convert or load logo:', logoUrl);
      return;
    }

    const format = getImageFormat(base64Logo);
    doc.addImage(base64Logo, format, 15, 10, 180, 30);
    console.log('✅ Header logo rendered');
    
  } catch (err) {
    console.error('❌ Error rendering header logo:', err);
  }
};


 const generateCircularReport = async (event) => {
  const doc = new jsPDF();
  const id = event.eventId;
  const info = event?.eventData?.eventInfo || {};

  const key = `${(info.selectedCollege || '').trim().toLowerCase()}_${(info.selectedDepartment || '').trim().toLowerCase()}`;
  const logoUrl = eventReportLogos[id] || uploadedHeaderLogos[key];

  console.log("📄 eventInfo:", info);
  console.log("📌 Key Used:", key);
  console.log("🖼️ Header Logo URL:", logoUrl);
  console.log("📌 EventReportLogos[id]:", eventReportLogos[id]);
  console.log("📌 uploadedHeaderLogos[key]:", uploadedHeaderLogos[key]);
  console.log("🧩 Full event object:", event);
  console.log("🧩 eventData:", event.eventData);
console.log("🔍 UploadedHeaderLogos keys:", Object.keys(uploadedHeaderLogos));
console.log("📌 Looking for key:", key);

  await renderLogo(doc, logoUrl);

  doc.setFontSize(14);
  doc.text(info.selectedCollege || 'College Name', 105, 45, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Event Circular Report', 14, 60);

  autoTable(doc, {
    startY: 70,
    head: [['Field', 'Value']],
    body: [
      ['Event Title', info.title || 'N/A'],
      ['Mode', info.mode || 'N/A'],
      ['Type', info.type || 'N/A'],
      ['Venue', info.venue || 'N/A'],
      ['Start Date', event.startDate || 'N/A'],
      ['End Date', event.endDate || 'N/A'],
      ['Department', info.selectedDepartment || 'N/A']
    ]
  });

  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  const circularContent = doc.splitTextToSize(
    circularTexts[id] || 'No content provided.',
    180
  );
  doc.text('Circular Content:', 14, y);
  doc.text(circularContent, 14, y + 8);
  y += 8 + circularContent.length * 5;

  doc.text('Google Form: ' + (formLinks[id] || 'N/A'), 14, y + 8);
  doc.text('Feedback Form: ' + (feedbackLinks[id] || 'N/A'), 14, y + 16);

  doc.save(`circular_${id}.pdf`);
};


const generateReportCompletion = async (event) => {
  const doc = new jsPDF();
  const id = event.eventId;
  const info = event.eventData?.eventInfo || {};

  // 🔁 Normalize key like in circular report
  const key = `${(info.selectedCollege || '').trim().toLowerCase()}_${(info.selectedDepartment || '').trim().toLowerCase()}`;
  const logoUrl = eventReportLogos[id] || uploadedHeaderLogos[key];

  // 🔍 Helpful debug logs
  console.log("📄 [ReportCompletion] eventInfo:", info);
  console.log("📌 [ReportCompletion] Key Used:", key);
  console.log("🖼️ [ReportCompletion] Header Logo URL:", logoUrl);
  console.log("🔍 UploadedHeaderLogos keys:", Object.keys(uploadedHeaderLogos));

  await renderLogo(doc, logoUrl);

  doc.setFontSize(14);
  doc.text(info.selectedCollege || 'College Name', 105, 45, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Event Report Completion', 14, 60);

  autoTable(doc, {
    startY: 70,
    head: [['Field', 'Value']],
    body: [
      ['Title', info.title || 'N/A'],
      ['Type', info.type || 'N/A'],
      ['Venue', info.venue || 'N/A'],
      ['Start Date', event.startDate || 'N/A'],
      ['End Date', event.endDate || 'N/A']
    ]
  });

  let y = doc.lastAutoTable.finalY + 10;
  const exp = expenses[id] || {};
  doc.setFontSize(12);
  doc.text(`Estimated Expense: ₹${exp.estimated || 'N/A'}`, 14, y);
  doc.text(`Actual Expense: ₹${exp.actual || 'N/A'}`, 14, y + 8);

  const imgData = images[id] || [];
  if (imgData.length > 0) {
    let imgY = y + 20;
    doc.text('Photographs:', 14, imgY);
    imgY += 8;

    imgData.forEach((img, i) => {
      const x = 14 + ((i % 3) * 60);
      const rowY = imgY + Math.floor(i / 3) * 50;
      doc.addImage(img, 'JPEG', x, rowY, 50, 40);
    });
  } else {
    doc.text('No images uploaded.', 14, y + 30);
  }

  doc.save(`report_completion_${id}.pdf`);
};

  const saveReportData = async () => {
    const id = selectedEvent.eventId;
    try {
      await axios.put(
        `http://localhost:5000/api/events/${id}/report`,
        {
          report: {
            googleForm: formLinks[id],
            feedbackForm: feedbackLinks[id],
            circularText: circularTexts[id],
            expenses: expenses[id],
            images: images[id] || [],
            headerLogo: eventReportLogos[id] || ''
          }
        },
        { withCredentials: true }
      );
      alert('✅ Report saved');
    } catch {
      alert('❌ Failed to save');
    }
  };
return (
  <div className="p-8 bg-gradient-to-br from-gray-100 to-white min-h-screen font-sans">
    <h2 className="text-4xl font-bold text-center text-gray-800 mb-10 tracking-wide">
      📁 Manage Event Reports
    </h2>

    {error && <p className="text-center text-red-600 font-medium">{error}</p>}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((ev) => {
        const id = ev.eventId || ev.event_id;
        const title = ev.eventData?.eventInfo?.title || `Event #${id}`;
        const startDate = ev.startDate || 'N/A';
        const endDate = ev.endDate || 'N/A';

        return (
          <div
            key={id}
            className="transition-all duration-300 bg-white p-6 rounded-xl shadow-md hover:shadow-xl border hover:border-blue-500 cursor-pointer group"
            onClick={() => openModal(ev)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg text-gray-800 group-hover:text-blue-600">
                📌 {title}
              </span>
              <FaChevronRight className="text-gray-500 group-hover:text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">
              <FaCalendarAlt className="inline mr-1 text-blue-500" />
              {startDate} → {endDate}
            </p>
          </div>
        );
      })}
    </div>

    {/* Modal */}
    {modalOpen && selectedEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start py-12 z-50 animate-fadeIn">
        <div className="bg-white w-full max-w-4xl p-10 rounded-3xl relative shadow-2xl overflow-y-auto max-h-[92vh] border border-blue-100">
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl"
            onClick={closeModal}
          >
            <FaTimes />
          </button>

          {/* Modal Header */}
          <h3 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
            📝 Edit Report –{' '}
            <span className="text-blue-600">
              {selectedEvent.eventData?.eventInfo?.title}
            </span>
          </h3>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8 space-x-4">
            <button
              onClick={() => setActiveTab('circular')}
              className={`relative px-4 py-2 text-lg font-semibold transition ${
                activeTab === 'circular'
                  ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              📝 Circular
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`relative px-4 py-2 text-lg font-semibold transition ${
                activeTab === 'report'
                  ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-green-600'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              📋 Report Completion
            </button>
          </div>

          {/* --- Circular Tab --- */}
          {activeTab === 'circular' && (
            <div className="space-y-5">
              <textarea
                placeholder="Write circular content..."
                rows={5}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={circularTexts[selectedEvent.eventId] || ''}
                onChange={(e) =>
                  setCircularTexts({
                    ...circularTexts,
                    [selectedEvent.eventId]: e.target.value,
                  })
                }
              />
              <input
                placeholder="Google Form Link"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formLinks[selectedEvent.eventId] || ''}
                onChange={(e) =>
                  setFormLinks({
                    ...formLinks,
                    [selectedEvent.eventId]: e.target.value,
                  })
                }
              />
              <input
                placeholder="Feedback Form Link"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={feedbackLinks[selectedEvent.eventId] || ''}
                onChange={(e) =>
                  setFeedbackLinks({
                    ...feedbackLinks,
                    [selectedEvent.eventId]: e.target.value,
                  })
                }
              />
              {/* Header Preview */}
              {(() => {
                const info = selectedEvent.eventData?.eventInfo || {};
                const key = `${info.college_name}_${info.department}`;
                const logo =
                  eventReportLogos[selectedEvent.eventId] ||
                  uploadedHeaderLogos[key];
                return logo ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Header Preview:</p>
                    <img
                      src={logo}
                      alt="Header Logo Preview"
                      className="w-40 h-auto rounded border"
                    />
                  </div>
                ) : null;
              })()}

              <button
                onClick={() => generateCircularReport(selectedEvent)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl shadow-md transition-all"
              >
                <FaFilePdf className="inline mr-2" />
                Download Circular PDF
              </button>
            </div>
          )}

          {/* --- Report Completion Tab --- */}
          {activeTab === 'report' && (
            <div className="space-y-5">
              <input
                type="number"
                placeholder="Estimated Expense"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={expenses[selectedEvent.eventId]?.estimated || ''}
                onChange={(e) =>
                  setExpenses({
                    ...expenses,
                    [selectedEvent.eventId]: {
                      ...expenses[selectedEvent.eventId],
                      estimated: e.target.value,
                    },
                  })
                }
              />
              <input
                type="number"
                placeholder="Actual Expense"
                className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={expenses[selectedEvent.eventId]?.actual || ''}
                onChange={(e) =>
                  setExpenses({
                    ...expenses,
                    [selectedEvent.eventId]: {
                      ...expenses[selectedEvent.eventId],
                      actual: e.target.value,
                    },
                  })
                }
              />

              
              {/* Uploaded Images */}
              {(images[selectedEvent.eventId] || []).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">
                    Uploaded Images
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {images[selectedEvent.eventId].map((img, i) => (
                      <div
                        key={i}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all"
                      >
                        <img
                          src={img}
                          alt={`Upload ${i + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => generateReportCompletion(selectedEvent)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-xl shadow-md transition-all"
              >
                <FaFilePdf className="inline mr-2" />
                Download Report PDF
              </button>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveReportData}
            className="mt-10 w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
          >
            <FaSave className="inline mr-2" />
            Save Report
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default ReportGeneration;
