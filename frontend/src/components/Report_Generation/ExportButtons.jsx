// src/components/ExportButtons.jsx
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { useEffect, useState } from 'react';
const ExportButtons = ({ selectedEvent }) => {
  const [uploadedHeaderLogos, setUploadedHeaderLogos] = useState({});
   const [error, setError] = useState('');
   const [eventReportLogos, setEventReportLogos] = useState({});
useEffect(() => {
  const fetchHeaders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/uploaded-headers', {
        withCredentials: true,
      });

      const headerMap = {};
      res.data.forEach((header) => {
        if (header.key) {
          console.log('📦 Received Header Key:', header.key);  // ← Add this
          headerMap[header.key] = header.logoUrl;
        }
      });

      console.log('📦 Final Uploaded Header Logos Map:', headerMap);  // ← Add this
      setUploadedHeaderLogos(headerMap);
    } catch (err) {
      console.error('Error fetching header logos:', err);
    }
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

     
      setEventReportLogos(logoData);
      
    } catch (err) {
      setError(err.message || 'Failed to load events');
      
    }
  };

  fetchEvents();
}, []);

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

  if (!selectedEvent) return null;

  const F = v => (v || 'N/A').toString();

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

const getImageFormat = (base64) => {
  if (base64.includes('image/png')) return 'PNG';
  if (base64.includes('image/webp')) return 'WEBP';
  return 'JPEG';
};

 

const exportToPDF = async () => {
  const doc = new jsPDF();
  let currentY = 20;
  const id = selectedEvent.eventId;
  const info = selectedEvent.eventData?.eventInfo || {};
  const collegeKey = `${(info.selectedCollege || '').trim().toLowerCase()}`;
  const logoUrl = eventReportLogos[id] || uploadedHeaderLogos[collegeKey];

  console.log('🧠 Using collegeKey:', collegeKey);
  console.log('🎯 Matching logo URL:', logoUrl);

  await renderLogo(doc, logoUrl);
  currentY = 45;

 const renderTable = (title, cols, rows) => {
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text(`${title}`, 14, currentY);
  doc.setFont('times', 'normal');

  const y = currentY + 4;
  const marginX = 14;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [cols],
    body: rows,
    styles: {
      fontSize: 12,
      font: 'times',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      fillColor: false,
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: false,
      textColor: 0,
      halign: 'left',
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    bodyStyles: {
      fontStyle: 'normal',
      fillColor: false,
      textColor: 0,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
   
  });

  currentY = (doc.lastAutoTable?.finalY || currentY + 4) + 6;
};


  const F = v => (v || 'N/A').toString();

  renderTable('Event Information', ['Field', 'Value'], [
    ['Title', F(selectedEvent.title)],
    ['College', F(selectedEvent.college)],
    ['Department', F(selectedEvent.department)],
    ['Coordinators', selectedEvent.facultyCoordinators.join ? selectedEvent.facultyCoordinators.join(', ') : F(selectedEvent.facultyCoordinators)],
    ['Dates', `Start: ${F(selectedEvent.startDate)}   End: ${F(selectedEvent.endDate)}   Days: ${F(selectedEvent.numDays)}`],
    ['Timing', `From: ${F(selectedEvent.startTime)}   To: ${F(selectedEvent.endTime)}   Hours: ${F(selectedEvent.numHours)}`],
    ['Venue', `${F(selectedEvent.venue)} (${F(selectedEvent.venueType)}, ${F(selectedEvent.venueCategory)})`],
    ['Audience', F(selectedEvent.audience)],
    ['Scope', F(selectedEvent.scope)],
    ['Funding Source', F(selectedEvent.fundingSource)],
  ]);

  if (selectedEvent.participants) {
    renderTable('Participants', ['Type', 'Count'], Object.entries(selectedEvent.participants));
  }

  if (selectedEvent.guestServices) {
    renderTable('Guest Services', ['Accommodation', 'Transportation', 'Dining'], [[
      F(selectedEvent.guestServices.accommodation),
      F(selectedEvent.guestServices.transportation),
      F(selectedEvent.guestServices.dining),
    ]]);
  }

  if (selectedEvent.technicalSetup) {
    renderTable('Technical Setup', ['Type', 'Detail'],
      Object.entries(selectedEvent.technicalSetup).map(([k, v]) => [
        k.replace(/([A-Z])/g, ' $1'),
        Array.isArray(v) ? v.join(', ') : F(v),
      ])
    );
  }

  renderTable('Objectives', ['Detail'], [[F(selectedEvent.objectives)]]);
  renderTable('Outcomes', ['Detail'], [[F(selectedEvent.outcomes)]]);

  if (selectedEvent.sessions?.length) {
    renderTable('Sessions', ['Date', 'From', 'To', 'Topic', 'Speaker'], selectedEvent.sessions.map(s => [
      F(s.sessionDate), F(s.fromTime), F(s.toTime), F(s.topic), F(s.speakerName),
    ]));
  }

  const fundRows = selectedEvent.financialPlanning?.filter(f => f.type === 'Funding').map(f => [
    F(f.source), `Rs. ${f.amount}`, F(f.remark || f.remarks),
  ]) || [];

  const budgRows = selectedEvent.financialPlanning?.filter(f => f.type === 'Budget').map(f => [
    F(f.particular), `Rs. ${f.amount}`, F(f.remark || f.remarks),
  ]) || [];

  if (fundRows.length) renderTable('Funding', ['Source', 'Amount', 'Remarks'], fundRows);
  if (budgRows.length) renderTable('Budget', ['Particular', 'Amount', 'Remarks'], budgRows);

  if (selectedEvent.foodTravel?.length) {
    renderTable('Meals', ['Date', 'Time', 'Type', 'Menu', 'Served At', 'Note'], selectedEvent.foodTravel.map(m => [
      F(m.from), F(m.time), F(m.mealType), F(m.menu), F(m.servedAt), F(m.note),
    ]));
  }

  if (selectedEvent.transportation?.length) {
    renderTable('Travel', ['Date', 'From', 'To', 'Mode', 'Remarks'], selectedEvent.transportation.map(t => [
      F(t.date), F(t.pickup), F(t.drop), F(t.mode), F(t.remarks),
    ]));
  }

  if (selectedEvent.checklist?.length) {
    renderTable('Checklist', ['Date', 'Activity', 'In-Charge', 'Remarks'], selectedEvent.checklist.map(c => [
      F(c.date), F(c.activity), F(c.inCharge), F(c.remarks),
    ]));
  }

  doc.save(`${selectedEvent.title || 'event'}-report.pdf`);
};

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const eventInfo = [
      ['Field', 'Value'],
      ['Title', F(selectedEvent.title)],
      ['College', F(selectedEvent.college)],
      ['Department', F(selectedEvent.department)],
      ['Lead Coordinator', F(selectedEvent.leadCoordinator)],
      ['Faculty Coordinators', Array.isArray(selectedEvent.facultyCoordinators) ? selectedEvent.facultyCoordinators.join(', ') : F(selectedEvent.facultyCoordinators)],
      ['Start Date', F(selectedEvent.startDate)],
      ['End Date', F(selectedEvent.endDate)],
      ['Number of Days', F(selectedEvent.numDays)],
      ['Start Time', F(selectedEvent.startTime)],
      ['End Time', F(selectedEvent.endTime)],
      ['Number of Hours', F(selectedEvent.numHours)],
      ['Venue', `${F(selectedEvent.venue)} (${F(selectedEvent.venueType)}, ${F(selectedEvent.venueCategory)})`],
      ['Audience', F(selectedEvent.audience)],
      ['Scope', F(selectedEvent.scope)],
      ['Funding Source', F(selectedEvent.fundingSource)],
      ['Status', F(selectedEvent.status)],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(eventInfo), 'Event Info');

    if (selectedEvent.participants) {
      const participants = [['Type', 'Count'], ...Object.entries(selectedEvent.participants)];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(participants), 'Participants');
    }

    if (selectedEvent.guestServices) {
      const guestServices = [
        ['Accommodation', 'Transportation', 'Dining'],
        [
          F(selectedEvent.guestServices.accommodation),
          F(selectedEvent.guestServices.transportation),
          F(selectedEvent.guestServices.dining)
        ]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(guestServices), 'Guest Services');
    }

    if (selectedEvent.technicalSetup) {
      const techSetup = [['Type', 'Detail']];
      for (const [key, value] of Object.entries(selectedEvent.technicalSetup)) {
        techSetup.push([key.replace(/([A-Z])/g, ' $1'), Array.isArray(value) ? value.join(', ') : F(value)]);
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(techSetup), 'Technical Setup');
    }

    const objectives = [['Objectives'], [F(selectedEvent.objectives)]];
    const outcomes = [['Outcomes'], [F(selectedEvent.outcomes)]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(objectives), 'Objectives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(outcomes), 'Outcomes');

    if (selectedEvent.sessions?.length) {
      const sessionData = [['Date', 'From', 'To', 'Topic', 'Speaker']];
      selectedEvent.sessions.forEach(s =>
        sessionData.push([F(s.sessionDate), F(s.fromTime), F(s.toTime), F(s.topic), F(s.speakerName)])
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sessionData), 'Sessions');
    }

    const funding = [['Source', 'Amount', 'Remarks']];
    const budget = [['Particular', 'Amount', 'Remarks']];
    selectedEvent.financialPlanning?.forEach(f => {
      const row = [F(f.source || f.particular), `₹${f.amount}`, F(f.remark || f.remarks)];
      if (f.type === 'Funding') funding.push(row);
      if (f.type === 'Budget') budget.push(row);
    });
    if (funding.length > 1) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(funding), 'Funding');
    if (budget.length > 1) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budget), 'Budget');

    if (selectedEvent.foodTravel?.length) {
      const meals = [['Date', 'Time', 'Type', 'Menu', 'Served At', 'Note']];
      selectedEvent.foodTravel.forEach(m =>
        meals.push([F(m.from), F(m.time), F(m.mealType), F(m.menu), F(m.servedAt), F(m.note)])
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meals), 'Meals');
    }

    if (selectedEvent.transportation?.length) {
      const travel = [['Date', 'From', 'To', 'Mode', 'Remarks']];
      selectedEvent.transportation.forEach(t =>
        travel.push([F(t.date), F(t.pickup), F(t.drop), F(t.mode), F(t.remarks)])
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(travel), 'Travel');
    }

    if (selectedEvent.checklist?.length) {
      const checklist = [['Date', 'Activity', 'In-Charge', 'Remarks']];
      selectedEvent.checklist.forEach(c =>
        checklist.push([F(c.date), F(c.activity), F(c.inCharge), F(c.remarks)])
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(checklist), 'Checklist');
    }

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `${selectedEvent.title || 'event'}-report.xlsx`);
  };

  return (
    <div className='mb-6 flex justify-end gap-4'>
      <button
        onClick={exportToPDF}
        className='flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
      >
        <FaFilePdf /> Export PDF
      </button>
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
        onClick={exportToExcel}
        className='flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700'
      >
        <FaFileExcel /> Export Excel
      </button>
          {error && <p className="text-center text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default ExportButtons;
