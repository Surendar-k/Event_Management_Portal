// src/components/ExportButtons.jsx
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportButtons = ({ selectedEvent }) => {
  if (!selectedEvent) return null;

  const exportToPDF = () => {
    const doc = new jsPDF();
    let currentY = 20;
    const F = v => (v || 'N/A').toString();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(F(selectedEvent.title || 'Event Report'), 14, currentY);
    currentY += 10;

    const renderTable = (title, cols, rows) => {
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${title}`, 14, currentY);
      doc.setFont('helvetica', 'normal');
      autoTable(doc, {
        startY: currentY + 6,
        head: [cols],
        body: rows,
        margin: { left: 14, right: 14 },
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      });
      currentY = (doc.lastAutoTable?.finalY || currentY + 6) + 10;
    };

    // 1. Event Info
    renderTable('Event Info', ['Field', 'Value'], [
      ['Title', F(selectedEvent.title)],
      ['College', F(selectedEvent.college)],
      ['Department', F(selectedEvent.department)],
      ['Coordinators', selectedEvent.facultyCoordinators.join ? selectedEvent.facultyCoordinators.join(', ') : F(selectedEvent.facultyCoordinators)],
      ['Start Date', `${F(selectedEvent.startDate)} `],
      ['End Date', `${F(selectedEvent.endDate)} `],
      ['Number of Days', `${F(selectedEvent.numDays)}`],
      ['Start Time', `${F(selectedEvent.startTime)}`],
      ['End Time', `${F(selectedEvent.endTime)}`],
      ['Number of Hours', ` ${F(selectedEvent.numHours)}`],
      ['Venue', `${F(selectedEvent.venue)} (${F(selectedEvent.venueType)}, ${F(selectedEvent.venueCategory)})`],
      ['Audience', F(selectedEvent.audience)],
      ['Scope', F(selectedEvent.scope)],
      ['Funding Source', F(selectedEvent.fundingSource)],
    ]);

    // 2. Participants
    if (selectedEvent.participants) {
      renderTable('Participants', ['Type', 'Count'], Object.entries(selectedEvent.participants));
    }

    // 3. Guest Services
    if (selectedEvent.guestServices) {
      renderTable('Guest Services', ['Accommodation', 'Transportation', 'Dining'], [[
        F(selectedEvent.guestServices.accommodation),
        F(selectedEvent.guestServices.transportation),
        F(selectedEvent.guestServices.dining)
      ]]);
    }

    // 4. Technical Setup
    if (selectedEvent.technicalSetup) {
      renderTable('Technical Setup', ['Type', 'Detail'],
        Object.entries(selectedEvent.technicalSetup).map(([k, v]) => [k.replace(/([A-Z])/g, ' $1'), Array.isArray(v) ? v.join(', ') : F(v)])
      );
    }

    // 5. Objectives & Outcomes
    renderTable('Objectives', ['Detail'], [[F(selectedEvent.objectives)]]);
    renderTable('Outcomes', ['Detail'], [[F(selectedEvent.outcomes)]]);

    // 6. Sessions
    if (selectedEvent.sessions?.length) {
      renderTable('Sessions', ['Date', 'From', 'To', 'Topic', 'Speaker'], selectedEvent.sessions.map(s => [
        F(s.sessionDate), F(s.fromTime), F(s.toTime), F(s.topic), F(s.speakerName)
      ]));
    }

    // 7. Financial Planning
    const fundRows = selectedEvent.financialPlanning.filter(f => f.type === 'Funding').map(f => [
      F(f.source), `₹${f.amount}`, F(f.remark || f.remarks)
    ]);
    const budgRows = selectedEvent.financialPlanning.filter(f => f.type === 'Budget').map(f => [
      F(f.particular), `₹${f.amount}`, F(f.remark || f.remarks)
    ]);
    if (fundRows.length) renderTable('Funding', ['Source', 'Amount', 'Remarks'], fundRows);
    if (budgRows.length) renderTable('Budget', ['Particular', 'Amount', 'Remarks'], budgRows);

    // 8. Food & Travel
    if (selectedEvent.foodTravel?.length) {
      renderTable('Meals', ['Date', 'Time', 'Type', 'Menu', 'Served At', 'Note'], selectedEvent.foodTravel.map(m => [
        F(m.from), F(m.time), F(m.mealType), F(m.menu), F(m.servedAt), F(m.note)
      ]));
    }

    if (selectedEvent.transportation?.length) {
      renderTable('Travel', ['Date', 'From', 'To', 'Mode', 'Remarks'], selectedEvent.transportation.map(t => [
        F(t.date), F(t.pickup), F(t.drop), F(t.mode), F(t.remarks)
      ]));
    }

    // 9. Checklist
    if (selectedEvent.checklist?.length) {
      renderTable('Checklist', ['Date', 'Activity', 'In-Charge', 'Remarks'], selectedEvent.checklist.map(c => [
        F(c.date), F(c.activity), F(c.inCharge), F(c.remarks)
      ]));
    }

    doc.save(`${selectedEvent.title || 'event'}-report.pdf`);
  };
const exportToExcel = () => {
  const wb = XLSX.utils.book_new();
  const F = v => (v || 'N/A').toString(); // Fallback formatter

  // 1. Event Info
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

  // 2. Participants
  if (selectedEvent.participants) {
    const participants = [['Type', 'Count'], ...Object.entries(selectedEvent.participants)];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(participants), 'Participants');
  }

  // 3. Guest Services
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

  // 4. Technical Setup
  if (selectedEvent.technicalSetup) {
    const techSetup = [['Type', 'Detail']];
    for (const [key, value] of Object.entries(selectedEvent.technicalSetup)) {
      techSetup.push([key.replace(/([A-Z])/g, ' $1'), Array.isArray(value) ? value.join(', ') : F(value)]);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(techSetup), 'Technical Setup');
  }

  // 5. Objectives & Outcomes
  const objectives = [['Objectives'], [F(selectedEvent.objectives)]];
  const outcomes = [['Outcomes'], [F(selectedEvent.outcomes)]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(objectives), 'Objectives');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(outcomes), 'Outcomes');

  // 6. Sessions
  if (selectedEvent.sessions?.length) {
    const sessionData = [['Date', 'From', 'To', 'Topic', 'Speaker']];
    selectedEvent.sessions.forEach(s =>
      sessionData.push([
        F(s.sessionDate), F(s.fromTime), F(s.toTime), F(s.topic), F(s.speakerName)
      ])
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sessionData), 'Sessions');
  }

  // 7. Financial Planning
  const funding = [['Source', 'Amount', 'Remarks']];
  const budget = [['Particular', 'Amount', 'Remarks']];
  selectedEvent.financialPlanning?.forEach(f => {
    const row = [F(f.source || f.particular), `₹${f.amount}`, F(f.remark || f.remarks)];
    if (f.type === 'Funding') funding.push(row);
    if (f.type === 'Budget') budget.push(row);
  });
  if (funding.length > 1) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(funding), 'Funding');
  if (budget.length > 1) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budget), 'Budget');

  // 8. Food & Travel
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

  // 9. Checklist
  if (selectedEvent.checklist?.length) {
    const checklist = [['Date', 'Activity', 'In-Charge', 'Remarks']];
    selectedEvent.checklist.forEach(c =>
      checklist.push([F(c.date), F(c.activity), F(c.inCharge), F(c.remarks)])
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(checklist), 'Checklist');
  }

  // Save as .xlsx file
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
      <button
        onClick={exportToExcel}
        className='flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700'
      >
        <FaFileExcel /> Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;
