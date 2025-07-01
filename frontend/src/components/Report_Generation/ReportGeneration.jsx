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
      
        const key = `${college}`;
        headerMap[key] = header.logoUrl;
      });
      setUploadedHeaderLogos(headerMap);
    };

    fetchHeaders();
  }, []);
useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/by-user', {
        withCredentials: true
      });

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

        const budget = e.financialPlanning?.budget || [];
        const estimatedSum = budget.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        );

        const actualItemsRaw = e.report?.expenses?.actualItems || {};
        const actualItems = {};
        let actualSum = 0;

        Object.entries(actualItemsRaw).forEach(([particular, item]) => {
          const amount = parseFloat(item.actualAmount) || 0;
          actualSum += amount;

          actualItems[particular] = {
            actualAmount: amount,
            remark: item.remark || ''
          };
        });

        expenseData[id] = {
          estimated: isNaN(parseFloat(e.report?.expenses?.estimated))
            ? estimatedSum.toFixed(2)
            : parseFloat(e.report.expenses.estimated).toFixed(2),
          actual: actualSum.toFixed(2),
          actualItems
        };

        imageData[id] = e.report?.images || [];
         e.eventData = {
    ...e.eventData,
    tasks: e.eventData?.tasks || [],  // or fetch tasks separately if needed
    eventInfo: {
      ...e.eventData?.eventInfo,
      selectedCoordinators: e.eventData?.eventInfo?.selectedCoordinators || []
    }
  };
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
    return 'JPEG';
  };

  const renderLogo = async (doc, logoUrl) => {
    if (!logoUrl) {
      console.warn('🚫 No logo URL found for header');
      return;
    }

    try {
      const base64Logo = logoUrl.startsWith('data:') ? logoUrl : await getBase64ImageFromUrl(logoUrl);

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
  useEffect(() => {
  if (!selectedEvent) return;

  const id = selectedEvent.eventId;
  const actualItems = expenses[id]?.actualItems || {};

  const autoTotal = Object.values(actualItems).reduce(
    (sum, item) => sum + (parseFloat(item.actualAmount) || 0),
    0
  );

  setExpenses(prev => ({
    ...prev,
    [id]: {
      ...prev[id],
      actual: autoTotal.toFixed(2)
    }
  }));
}, [expenses[selectedEvent?.eventId]?.actualItems]);

const generateCircularReport = async (event) => {
  const doc = new jsPDF();
  const id = event.eventId;
  const info = event?.eventData?.eventInfo || {};

  const key = `${(info.selectedCollege || '').trim().toLowerCase()}`;
  const logoUrl = eventReportLogos[id] || uploadedHeaderLogos[key];

  const marginX = 20;
  let y = 20;

  await renderLogo(doc, logoUrl);
  y = 45;



// Circular Date (top right corner - after logo)
const savedCircularDate = event?.report?.circularDate;
const circularDate = savedCircularDate
  ? new Date(savedCircularDate).toLocaleDateString('en-GB')
  : new Date().toLocaleDateString('en-GB');

doc.setFont('times', 'italic');
doc.setFontSize(11);
doc.text(`Circular Date: ${circularDate}`, doc.internal.pageSize.width - marginX, y, {
  align: 'right'
});
  y += 15;
  doc.setFont('times', 'bold');
  doc.text('Event Circular Report', 105, y, { align: 'center' });

  y += 10;
  doc.setFont('times', 'normal');

  // Event basic info
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: false,
      textColor: 0,
      halign: 'left',
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontStyle: 'normal',
      fillColor: false,
      textColor: 0,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
     columnStyles: {
    0: { cellWidth: 85 }, // Column 1 (Field / Incharge / Date)
    1: { cellWidth: 85 }  // Column 2 (Details / Names / From Time)
  },
    head: [['Field', 'Details']],
    body: [
      ['Event Title', info.title || 'N/A'],
      ['Organising Department', info.selectedDepartment || 'N/A'],
      ['Venue / Mode / Type', `${info.venue || 'N/A'} , ${info.mode || 'N/A'} , ${info.type || 'N/A'}`],
      ['Start Date - End Date', `${event.startDate || 'N/A'} - ${event.endDate || 'N/A'}`],
      ['Registration Form', formLinks[id] || 'N/A'],
      ['Feedback Form', feedbackLinks[id] || 'N/A']
    ]
  });

  

  // Coordinators section
  const leadCoordinator = event.faculty_name || 'Not Assigned';
  const facultyCoordinators = Array.isArray(info.facultyCoordinators)
    ? info.facultyCoordinators.join(', ')
    : 'Not Assigned';

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: false,
      textColor: 0,
      halign: 'left',
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontStyle: 'normal',
      fillColor: false,
      textColor: 0,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
     columnStyles: {
    0: { cellWidth: 85 }, // Column 1 (Field / Incharge / Date)
    1: { cellWidth: 85 }  // Column 2 (Details / Names / From Time)
  },
    head: [['Incharge', 'Names']],
    body: [
      ['Lead Coordinator', leadCoordinator],
      ['Faculty Coordinators', facultyCoordinators]
    ]
  });
// Technical Session Section
const sessions = event?.eventData?.agenda?.sessions || [];

if (Array.isArray(sessions) && sessions.length > 0) {
  const sessionHeadingY = doc.lastAutoTable?.finalY + 10;

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Technical Sessions', marginX, sessionHeadingY);

  autoTable(doc, {
    startY: sessionHeadingY + 2,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: false,
      textColor: 0,
      halign: 'left',
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    bodyStyles: {
      fontStyle: 'normal',
      fillColor: false,
      textColor: 0,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
      columnStyles: {
    0: { cellWidth: 34 },
    1: { cellWidth: 34 },
    2: { cellWidth: 34 },
    3: { cellWidth: 34 },
    4: { cellWidth: 34 }
  },
    head: [['Date', 'From Time', 'To Time', 'Topic', 'Speaker']],
    body: sessions.map(session => [
      session.sessionDate || 'N/A',
      session.fromTime || 'N/A',
      session.toTime || 'N/A',
      session.topic || 'N/A',
      session.speakerName || 'N/A'
    ])
  });
}

  // Circular content section
  y = doc.lastAutoTable.finalY + 10;

  const circularContent = doc.splitTextToSize(circularTexts[id] || 'The requirements and other details are given above.', 170);

  doc.setFont('times', 'bold');
  doc.text('Circular Content:', marginX, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.text(circularContent, marginX, y);
// Signature footer section
const pageHeight = doc.internal.pageSize.height;
const footerY = pageHeight - 20; // 40 units from bottom

doc.setFont('times', 'normal');
doc.setFontSize(12);

// Signature Lines
doc.line(marginX, footerY, marginX + 50, footerY); // HoD
doc.line(85, footerY, 85 + 50, footerY); // Principal
doc.line(150, footerY, 150 + 40, footerY); // CSO

// Labels
doc.text('HoD', marginX + 15, footerY + 7);
doc.text('Principal', 85 + 10, footerY + 7);
doc.text('CSO', 150 + 10, footerY + 7);

  // Save PDF
  doc.save(`circular_${id}.pdf`);
};


const generateReportCompletion = async (event) => {
  const doc = new jsPDF();
  const id = event.eventId;
  const info = event.eventData?.eventInfo || {};

  const key = `${(info.selectedCollege || '').trim().toLowerCase()}_${(info.selectedDepartment || '').trim().toLowerCase()}`;
  const logoUrl = eventReportLogos[id] || uploadedHeaderLogos[key];

  await renderLogo(doc, logoUrl);

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text(info.selectedCollege || 'College Name', 105, 45, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.text('Event Report Completion', 105, 55, { align: 'center' });

  autoTable(doc, {
    startY: 65,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false,
      halign: 'left'
    },
    headStyles: {
      fontStyle: 'bold',
      textColor: 0
    },
    bodyStyles: {
      fontStyle: 'normal',
      textColor: 0
    },
    head: [['Field', 'Value']],
    body: [
      ['Title', info.title || 'N/A'],
      ['Type', info.type || 'N/A'],
      ['Venue / Mode / Type',
        `${info.venue || 'N/A'}, ${info.mode || 'N/A'}, ${info.type || 'N/A'}`],
      ['Start Date - End Date',
        `${event.startDate || 'Unknown'} - ${event.endDate || 'Unknown'}`]
    ]
  });

  let y = doc.lastAutoTable.finalY + 10;
  const exp = expenses[id] || {};
  const budgetItems = event.eventData?.financialPlanning?.budget || [];

  const estimatedTotal = budgetItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const calculatedActualTotal = Object.values(exp.actualItems || {}).reduce(
    (sum, item) => sum + (parseFloat(item.actualAmount) || 0),
    0
  );

  doc.setFont('times', 'bold');
  doc.text('Expense Breakdown', 20, y);

  autoTable(doc, {
    startY: y + 6,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false,
      halign: 'left'
    },
    headStyles: {
      fontStyle: 'bold',
      textColor: 0
    },
    bodyStyles: {
      fontStyle: 'normal',
      textColor: 0
    },
    head: [['Particular', 'Estimated (Rs.)', 'Actual (Rs.)']],
    body: [
      ...budgetItems.map(item => [
        item.particular || 'N/A',
        `Rs. ${parseFloat(item.amount || 0).toFixed(2)}`,
        `Rs. ${parseFloat(exp.actualItems?.[item.particular]?.actualAmount || 0).toFixed(2)}`
      ]),
      [
        { content: 'Total', colSpan: 1, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${estimatedTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${calculatedActualTotal.toFixed(2)}`, styles: { fontStyle: 'bold' } }
      ]
    ]
  });

  let lastY = doc.lastAutoTable.finalY;

  const imgData = images[id] || [];
  if (imgData.length > 0) {
    let imgY = lastY + 15;
    doc.setFont('times', 'bold');
    doc.text('Photographs', 20, imgY);
    imgY += 8;

    imgData.forEach((img, i) => {
      const x = 20 + ((i % 3) * 60);
      const rowY = imgY + Math.floor(i / 3) * 50;
      doc.addImage(img, 'JPEG', x, rowY, 50, 40);
    });
  } else {
    doc.setFont('times', 'bold');
    doc.text('Photographs', 20, lastY + 15);
    doc.setFont('times', 'normal');
    doc.text('No images uploaded.', 20, lastY + 23);
  }

  doc.save(`report_completion_${id}.pdf`);
};

  const saveReportData = async () => {
    const id = selectedEvent.eventId;
    try {
      await axios.put(`http://localhost:5000/api/events/${id}/report`, {
        report: {
          googleForm: formLinks[id],
          feedbackForm: feedbackLinks[id],
          circularText: circularTexts[id],
          expenses: expenses[id],
          images: images[id] || [],
          headerLogo: eventReportLogos[id] || ''
        }
      }, {
        withCredentials: true
      });
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
                const key = `${info.college_name}`;
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
    {/* Expense Breakdown Table */}
    <div>
      <h4 className="text-lg font-semibold mb-2 text-gray-700">
        Expense Breakdown
      </h4>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 border">Particular</th>
              <th className="p-3 border">Estimated (₹)</th>
              <th className="p-3 border">Actual (₹)</th>
              <th className="p-3 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {(selectedEvent.eventData?.financialPlanning?.budget || []).map(
              (item, idx) => {
                const particular = item.particular || `Item ${idx + 1}`;
                const est = item.amount?.toString() || '0';
                const actual = expenses[selectedEvent.eventId]?.actualItems?.[particular]?.actualAmount || '';
                const remark = expenses[selectedEvent.eventId]?.actualItems?.[particular]?.remark || '';

                return (
                  <tr key={idx} className="border-t">
                    <td className="p-3 border">{particular}</td>
                    <td className="p-3 border">₹ {est}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border px-2 py-1 rounded"
                        value={actual}
                        onChange={(e) => {
                          const updated = {
                            ...expenses[selectedEvent.eventId],
                            actualItems: {
                              ...(expenses[selectedEvent.eventId]?.actualItems || {}),
                              [particular]: {
                                actualAmount: e.target.value,
                                remark: remark
                              }
                            }
                          };
                          setExpenses((prev) => ({
                            ...prev,
                            [selectedEvent.eventId]: updated
                          }));
                        }}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={remark}
                        onChange={(e) => {
                          const updated = {
                            ...expenses[selectedEvent.eventId],
                            actualItems: {
                              ...(expenses[selectedEvent.eventId]?.actualItems || {}),
                              [particular]: {
                                actualAmount: actual,
                                remark: e.target.value
                              }
                            }
                          };
                          setExpenses((prev) => ({
                            ...prev,
                            [selectedEvent.eventId]: updated
                          }));
                        }}
                      />
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <input
  type="number"
  placeholder="Total Estimated Expense"
  className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm bg-gray-100 cursor-not-allowed"
 value={
  (
    selectedEvent?.eventData?.financialPlanning?.budget?.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    ) || 0
  ).toFixed(2)
}

  readOnly
/>


     <input
  type="number"
  placeholder="Total Actual Expense"
  className="w-full border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:outline-none bg-gray-100"
  value={expenses[selectedEvent.eventId]?.actual || ''}
  readOnly
/>


    </div>
{/* Image Upload Section */}
<div>
  <h4 className="text-lg font-semibold mb-2 text-gray-700">Upload Event Images</h4>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => ({
            ...prev,
            [selectedEvent.eventId]: [
              ...(prev[selectedEvent.eventId] || []),
              reader.result,
            ],
          }));
        };
        reader.readAsDataURL(file);
      });
    }}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0 file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
</div>

   {(images[selectedEvent.eventId] || []).length > 0 && (
  <div>
    <h4 className="text-lg font-semibold mb-2 text-gray-700">Uploaded Images</h4>
    <div className="grid grid-cols-3 gap-4">
      {images[selectedEvent.eventId].map((img, i) => (
        <div
          key={i}
          className="relative border rounded-lg overflow-hidden shadow-sm group hover:shadow-lg transition-all"
        >
          <img
            src={img}
            alt={`Upload ${i + 1}`}
            className="w-full h-32 object-cover"
          />

          {/* Replace Button */}
          <label className="absolute top-1 left-1 bg-yellow-400 text-white text-xs px-2 py-1 rounded cursor-pointer hidden group-hover:block">
            Replace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImages((prev) => {
                    const updated = [...(prev[selectedEvent.eventId] || [])];
                    updated[i] = reader.result;
                    return {
                      ...prev,
                      [selectedEvent.eventId]: updated,
                    };
                  });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>

          {/* Delete Button */}
          <button
            onClick={() => {
              setImages((prev) => ({
                ...prev,
                [selectedEvent.eventId]: prev[selectedEvent.eventId].filter((_, idx) => idx !== i),
              }));
            }}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hidden group-hover:block"
          >
            Delete
          </button>
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
