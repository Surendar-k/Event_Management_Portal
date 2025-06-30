import React, { useState, useMemo, useEffect } from 'react'
import {FaCheckCircle,FaUniversity,FaMapMarkerAlt,FaBuilding, FaArrowLeft,FaBusAlt,FaSearch, FaBullseye, FaFlagCheckered, FaCalendarAlt, FaChalkboardTeacher, FaClipboardList, FaFilePdf, FaFileExcel, FaMoneyBill, FaUtensils, FaImages } from 'react-icons/fa';

import ExportButtons from './ExportButtons';

import axios from 'axios'

const ManageEvents = () => {
  const [events, setEvents] = useState([])


  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)



const getStatus = (event) => {
  const today = new Date();
  return new Date(event.endDate) < today ? 'completed' : 'upcoming';
};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/by-user', {
          withCredentials: true // required for session cookies
        });
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        // eslint-disable-next-line no-undef
        setError(err.response?.data?.error || 'Failed to load events');
      }
    };

    fetchEvents();
  }, []);
  const colleges = Array.from(new Set(events.map(e => e.college)))
const filteredEvents = useMemo(() => {
  return events.filter(event => {
    const title = (event?.eventData?.eventInfo?.title || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    if (search && !title.includes(search)) return false;

    const status = getStatus(event);
    if (statusFilter !== 'all' && statusFilter !== status) return false;

    const college = event?.eventData?.eventInfo?.college || '';
    if (collegeFilter && college !== collegeFilter) return false;

    const eventStartDateStr = event?.eventData?.eventInfo?.startDate;
    const eventStartDate = eventStartDateStr ? new Date(eventStartDateStr) : null;

    if (startDateFilter && eventStartDate && eventStartDate < new Date(startDateFilter)) {
      return false;
    }

    if (endDateFilter && eventStartDate && eventStartDate > new Date(endDateFilter)) {
      return false;
    }

    return true;
  });
}, [
  searchTerm,
  statusFilter,
  collegeFilter,
  startDateFilter,
  endDateFilter,
  events
]);
const handleDelete = async (eventIdToDelete) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this event?');
  if (!confirmDelete) return;

  try {
    const res = await axios.delete(`http://localhost:5000/api/events/${eventIdToDelete}`, {
      withCredentials: true, // sends session cookie
    });

    if (res.status === 200) {
      alert('✅ Event deleted successfully!');
      // remove the deleted event from state
      setEvents(prevEvents => prevEvents.filter(e =>
        e.eventId !== eventIdToDelete && e.id !== eventIdToDelete && e.event_id !== eventIdToDelete
      ));
    } else {
      alert('⚠️ Failed to delete the event.');
    }
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    alert('An error occurred while deleting the event.');
  }
};

 
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  setSelectedEvent(prev => ({
    ...prev,
    uploadedImages: [...prev.uploadedImages, ...files],
  }));
};


if (!selectedEvent) {
    return (
      <div className="mx-auto mt-10 max-w-8xl text-lg rounded-2xl border p-6 shadow-xl bg-gradient-to-r from-black-100 via-white to-black-100 border-gray-300">

       <h1 className='mb-10 text-center text-5xl font-extrabold tracking-tight text-gray-800'>
  Manage My Events
</h1>


        {/* Filters */}
       <div className='mb-10 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-6 shadow-md md:flex-row md:items-center'>

         <div className='flex flex-1 items-center rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white shadow-inner'>
            <FaSearch className='mr-3 text-gray-300' />
            <input
              type='text'
              placeholder='Search event title...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
               className='w-full bg-transparent text-white placeholder-gray-400 outline-none'
            />
          </div>

          <select
            className='rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white shadow-md'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value='all' className='text-white'>
              All Statuses
            </option>
            <option value='upcoming' className='text-white'>
              Upcoming
            </option>
            <option value='completed' className='text-white'>
              Completed
            </option>
          </select>

          <select
            className='mb-4 rounded border px-3 py-2 text-white bg-transparent md:mb-0'
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value)}
          >
            <option value='' className='text-black'>
              All Colleges
            </option>
            {colleges.map((col, idx) => (
  <option key={`${col}-${idx}`} value={col} className='text-black'>
    {col}
  </option>
))}

          </select>

          <div className='flex items-center gap-2 text-white'>
            <label className='text-sm font-medium' htmlFor='startDateFilter'>
              From:
            </label>
            <input
              type='date'
              id='startDateFilter'
              value={startDateFilter}
              onChange={e => setStartDateFilter(e.target.value)}
             className='rounded-md border border-gray-600 bg-white px-3 py-1 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300'
            />
          </div>

          <div className='flex items-center gap-2 text-white'>
            <label className='text-sm font-medium' htmlFor='endDateFilter'>
              To:
            </label>
            <input
              type='date'
              id='endDateFilter'
              value={endDateFilter}
              onChange={e => setEndDateFilter(e.target.value)}
             className='rounded-md border border-gray-600 bg-white px-3 py-1 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300'
            />
          </div>
        </div>

        {/* Event List */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {filteredEvents.length > 0 ? (
           filteredEvents.map((event, index) => {
  const status = getStatus(event);
 const { approvals, } = event;
              return (
                <div
                 key={event.id || index}
      onClick={() =>
  setSelectedEvent({
    ...event,
    ...event.eventData?.eventInfo,
    ...event.eventData?.additionalInfo, // if needed

    checklist: event.eventData?.checklist || [],
    uploadedImages: event.eventData?.uploadedImages || [],

    // Basic Info
    technicalSetup: event.eventData?.eventInfo?.technicalSetup || {},
    speakers: event.eventData?.eventInfo?.speakers || [],
    fundingSource: event.eventData?.eventInfo?.fundingSource || '',
    college: event.eventData?.eventInfo?.selectedCollege || '',
    department: event.eventData?.eventInfo?.selectedDepartment || '',
    facultyCoordinators: event.eventData?.eventInfo?.selectedCoordinators?.join(', ') || '',
    scope: event.eventData?.eventInfo?.scope || '',
    venue: event.eventData?.eventInfo?.venue || '',
    venueType: event.eventData?.eventInfo?.venueType || '',
    venueCategory: event.eventData?.eventInfo?.venueCategory || '',
    audience: event.eventData?.eventInfo?.audience || '',
    startDate: event.eventData?.eventInfo?.startDate || '',
    endDate: event.eventData?.eventInfo?.endDate || '',
    startTime: event.eventData?.eventInfo?.startTime || '',
    endTime: event.eventData?.eventInfo?.endTime || '',
    numDays: event.eventData?.eventInfo?.numDays || '',
    numHours: event.eventData?.eventInfo?.numHours || '',

    // Corrected paths:
    objectives: event.eventData?.agenda?.objectives || 'N/A',
    outcomes: event.eventData?.agenda?.outcomes || 'N/A',
    sessions: event.eventData?.agenda?.sessions || [],
 financialPlanning: [
  ...(event.eventData?.financialPlanning?.funding?.map(f => ({ ...f, type: 'Funding' })) || []),
  ...(event.eventData?.financialPlanning?.budget?.map(b => ({ ...b, type: 'Budget' })) || [])
],
foodTravel: event.eventData?.foodTransport?.meals || [],
transportation: event.eventData?.foodTransport?.travels || [],

  })
}


                className='group relative cursor-pointer rounded-2xl border-l-4 border-blue-600 bg-gradient-to-r from-gray-300 via-white-800 to-gray-600 border-gray-300 p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]'
                >
                  <div className="relative  mb-5">
  <h2 className='text-2xl font-bold text-blue-700 flex items-center gap-2'>
    <FaCalendarAlt className='text-blue-500' />
    {event.eventData.eventInfo?.title || 'Untitled Event'}
  </h2>

  <p
    className={`absolute right-4 top-4 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${
                status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </p>
  
</div>

                  
                  
                 <p className='flex items-center  text-gray-700'>
                    <FaBuilding className='mr-2 text-gray-600' />
                    <strong>Department:</strong>{event.eventData.eventInfo?.selectedDepartment}
                    
                  </p>
                <p className='flex items-center text-gray-700'>
                  <FaCalendarAlt className='mr-2 text-gray-600' />
                    <strong>Dates:</strong> {event.eventData.eventInfo?.startDate} → {event.eventData.eventInfo?.endDate}
                  </p>
                <p className='flex items-center  text-gray-700'>
                     <FaMapMarkerAlt className='mr-2 text-gray-600' />
                    <strong>Venue:</strong> {event.eventData.eventInfo?.venue}
                  </p>
                  
              <p className='flex items-center  text-gray-700'>
                  <FaUniversity className='mr-2' />
  <strong>College:</strong> {event.eventData.eventInfo?.selectedCollege}
</p>

{/* Approval Section */}
<div className='mt-5 border-t pt-4'>
  {/* Delete Button Below Title */}
 
  <h4 className='mb-3 flex items-center gap-2 text-base font-semibold text-gray-800'>
    <FaCheckCircle className='text-green-500' /> Approvals
  </h4>
  
  <div className='flex flex-wrap gap-2'>
    {approvals?.hod !== undefined && (
      <span
        className={`px-3 py-1 rounded-full font-semibold ${
          approvals.hod ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        HOD: {approvals.hod ? 'Approved' : 'Pending'}
      </span>
    )}
    {approvals?.principal !== undefined && (
      <span
        className={`px-3 py-1 rounded-full font-semibold ${
          approvals.principal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        Principal: {approvals.principal ? 'Approved' : 'Pending'}
      </span>
    )}
    {approvals?.cso !== undefined && (
      <span
        className={`px-3 py-1 rounded-full font-semibold ${
          approvals.cso ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        CSO: {approvals.cso ? 'Approved' : 'Pending'}
      </span>
      
    )}
    
  </div>
  
  
</div>
{/* Delete Button Below Title */}
  <div className="mt-2 flex justify-end">
    <button
       onClick={() => handleDelete(event.eventId)}
      className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
    >
      Delete
    </button>
  </div>
                </div>
              )
            })
          ) : (
            <p className='col-span-full text-center text-gray-500'>
              No events match the filter criteria.
            </p>
          )}
        </div>
        
      </div>
    )
  }
  

// Selected Event View
return (
  <div className='mx-auto max-w-6xl rounded-xl bg-gradient-to-br from-white via-blue-50 to-white p-6 shadow-xl'>
    <button
      onClick={() => setSelectedEvent(null)}
      className='mb-6 flex items-center gap-2 rounded bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200'
    >
      
      <FaArrowLeft /> Back
    </button>

    <div className='mb-6 flex justify-end gap-4'>
    <ExportButtons selectedEvent={selectedEvent} />
    </div>

    <h1 className='mb-8 text-center text-3xl font-bold text-blue-900'>
      {selectedEvent.title || 'Untitled Event'} Report
    </h1>

   <Section title='Event Details' icon={<FaCalendarAlt />}>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-xl bg-white p-6 shadow-md border border-gray-200 text-sm">
    
    {/* Group 1 */}
    <Item label='College' value={selectedEvent.college || 'N/A'} />
    <Item label='Department' value={selectedEvent.department || 'N/A'} />
    <Item label='Scope' value={selectedEvent.scope || 'N/A'} />
    
    {/* Group 2 */}
    <Item label='Venue Mode' value={selectedEvent.venueType || 'N/A'} />
    <Item label='Mode of Conduct' value={selectedEvent.venueCategory || 'N/A'} />
    <Item label='Venue' value={selectedEvent.venue || 'N/A'} />
    
    {/* Group 3 */}
    <Item label='Start Date' value={selectedEvent.startDate || 'N/A'} />
    <Item label='End Date' value={selectedEvent.endDate || 'N/A'} />
    <Item label='No. of Days' value={selectedEvent.numDays || 'N/A'} />
    
    {/* Group 4 */}
    <Item label='Start Time' value={selectedEvent.startTime || 'N/A'} />
    <Item label='End Time' value={selectedEvent.endTime || 'N/A'} />
    <Item label='No. of Hours' value={selectedEvent.numHours || 'N/A'} />
    
    {/* Group 5 */}
    <Item label='Funding Source' value={selectedEvent.fundingSource || 'N/A'} />
    <Item label='Lead Coordinator' value={selectedEvent.leadCoordinator || 'N/A'} />
    <Item label='Faculty Coordinators' value={selectedEvent.facultyCoordinators || 'N/A'} />

    {/* Status */}
    <Item
      label='Status'
      value={
        getStatus(selectedEvent) === 'completed'
          ? 'Completed'
          : 'Upcoming'
      }
    />

  </div>
</Section>





{/* Speakers */}
{Array.isArray(selectedEvent.speakers) && selectedEvent.speakers.length > 0 && (
  <Section title='Speakers' icon={<FaChalkboardTeacher />}>
    <table className='w-full table-auto border border-gray-300'>
      <thead className='bg-gray-100'>
        <tr>
          <th className='border px-4 py-2'>#</th>
          <th className='border px-4 py-2'>Name</th>
          <th className='border px-4 py-2'>Designation</th>
          <th className='border px-4 py-2'>Affiliation</th>
          <th className='border px-4 py-2'>Contact</th>
          <th className='border px-4 py-2'>Email</th>
        </tr>
      </thead>
      <tbody>
        {selectedEvent.speakers.map((s, i) => (
          <tr key={i} className='hover:bg-gray-50'>
            <td className='border px-4 py-2 text-center'>{i + 1}</td>
            <td className='border px-4 py-2'>{s.name}</td>
            <td className='border px-4 py-2'>{s.designation}</td>
            <td className='border px-4 py-2'>{s.affiliation}</td>
            <td className='border px-4 py-2'>{s.contact}</td>
            <td className='border px-4 py-2'>{s.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Section>
)}


{/* Guest Services */}
<Section title='Guest Services' icon={<FaClipboardList />}>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[
      { label: 'Accommodation', value: selectedEvent.guestServices?.accommodation },
      { label: 'Transportation', value: selectedEvent.guestServices?.transportation },
      { label: 'Dining', value: selectedEvent.guestServices?.dining }
    ].map((item, idx) => (
      <div
        key={idx}
        className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <h4 className="text-sm font-medium text-gray-500">{item.label}</h4>
        <p
          className={`mt-1 text-lg font-semibold ${
            item.value === 'Yes' ? 'text-green-600' : item.value === 'No' ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          {item.value || 'N/A'}
        </p>
      </div>
    ))}
  </div>
</Section>


    {/* Technical Setup */}
    <Section title='Technical Setup'>
      <table className='w-full table-auto border border-gray-300'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-4 py-2 text-left'>Field</th>
            <th className='border px-4 py-2 text-left'>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(selectedEvent.technicalSetup || {}).map(([key, val]) => (
            <tr key={key}>
              <td className='border px-4 py-2 font-medium'>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </td>
              <td className='border px-4 py-2'>
                {Array.isArray(val) ? val.join(', ') : String(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>

{/* Objectives & Outcomes */}
<Section title='Objectives & Outcomes'>
  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-md space-y-6 border border-gray-200">
    
    {/* Objectives Block */}
    <div className="flex items-start gap-4">
      <FaBullseye className="mt-1 h-5 w-5 text-blue-600" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Objectives</h4>
        <p className="text-gray-800 text-base leading-relaxed">
          {selectedEvent.objectives || 'Not Provided'}
        </p>
      </div>
    </div>

    {/* Outcomes Block */}
    <div className="flex items-start gap-4">
      <FaFlagCheckered className="mt-1 h-5 w-5 text-green-600" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Outcomes</h4>
        <p className="text-gray-800 text-base leading-relaxed">
          {selectedEvent.outcomes || 'Not Provided'}
        </p>
      </div>
    </div>
    
  </div>
</Section>


   {/* Sessions */}
{Array.isArray(selectedEvent.sessions) && selectedEvent.sessions.length > 0 && (
  <Section title='Sessions'>
    <table className='w-full table-auto border border-gray-300'>
      <thead className='bg-gray-100'>
        <tr>
          <th className='border px-4 py-2 text-left'>Topic</th>
          <th className='border px-4 py-2 text-left'>Speaker</th>
          <th className='border px-4 py-2 text-left'>Date</th>
          <th className='border px-4 py-2 text-left'>Time</th>
        </tr>
      </thead>
      <tbody>
        {selectedEvent.sessions.map((session, i) => (
          <tr key={i}>
            <td className='border px-4 py-2'>{session.topic}</td>
            <td className='border px-4 py-2'>{session.speakerName}</td>
            <td className='border px-4 py-2'>{session.sessionDate}</td>
            <td className='border px-4 py-2'>{`${session.fromTime} - ${session.toTime}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Section>
)}


    {/* Checklist */}
    <Section title='Checklist'>
      <table className='w-full table-auto border border-gray-300'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-4 py-2'>Activity</th>
            <th className='border px-4 py-2'>Date</th>
            <th className='border px-4 py-2'>In-Charge</th>
            <th className='border px-4 py-2'>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(selectedEvent.checklist) &&
            selectedEvent.checklist.map((task, i) => (
              <tr key={i}>
                <td className='border px-4 py-2'>{task.activity}</td>
                <td className='border px-4 py-2'>{task.date}</td>
                <td className='border px-4 py-2'>{task.inCharge}</td>
                <td className='border px-4 py-2'>{task.remarks}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Section>
{/* Financial Planning */}
{Array.isArray(selectedEvent.financialPlanning) && selectedEvent.financialPlanning.length > 0 && (
  <Section title='Financial Planning' icon={<FaMoneyBill />}>
    {/* Funding Section */}
    {selectedEvent.financialPlanning.some(fp => fp.type === 'Funding') && (
      <>
        <h3 className='mb-3 mt-6 text-xl font-semibold text-green-700'>Funding</h3>
        <div className="overflow-x-auto">
          <table className='min-w-full border border-gray-300 rounded-xl shadow-sm'>
            <thead className='bg-green-50 text-green-900'>
              <tr>
                <th className='w-1/3 border px-4 py-2 text-left'>Source</th>
                <th className='w-1/3 border px-4 py-2 text-left'>Amount</th>
                <th className='w-1/3 border px-4 py-2 text-left'>Remarks</th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {selectedEvent.financialPlanning
                .filter(fp => fp.type === 'Funding')
                .map((f, i) => (
                  <tr key={`funding-${i}`} className="hover:bg-gray-50">
                    <td className='w-1/3 border px-4 py-2'>{f.source}</td>
                    <td className='w-1/3 border px-4 py-2 text-green-700 font-medium'>₹{f.amount}</td>
                    <td className='w-1/3 border px-4 py-2'>{f.remarks || 'N/A'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    )}

    {/* Estimated Budget Section */}
    {selectedEvent.financialPlanning.some(fp => fp.type === 'Budget') && (
      <>
        <h3 className='mb-3 mt-6 text-xl font-semibold text-indigo-700'>Estimated Budget</h3>
        <div className="overflow-x-auto">
          <table className='min-w-full border border-gray-300 rounded-xl shadow-sm'>
            <thead className='bg-indigo-50 text-indigo-900'>
              <tr>
                <th className='w-1/3 border px-4 py-2 text-left'>Particular</th>
                <th className='w-1/3 border px-4 py-2 text-left'>Amount</th>
                <th className='w-1/3 border px-4 py-2 text-left'>Remark</th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {selectedEvent.financialPlanning
                .filter(fp => fp.type === 'Budget')
                .map((b, i) => (
                  <tr key={`budget-${i}`} className="hover:bg-gray-50">
                    <td className='w-1/3 border px-4 py-2'>{b.particular}</td>
                    <td className='w-1/3 border px-4 py-2 text-indigo-700 font-medium'>₹{b.amount}</td>
                    <td className='w-1/3 border px-4 py-2'>{b.remark || 'N/A'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </Section>
)}

{/* Food & Travel */}
{Array.isArray(selectedEvent.foodTravel) && selectedEvent.foodTravel.length > 0 && (
  <Section title="Food & Travel" icon={<FaUtensils />}>
    <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-md">
      <table className="min-w-full divide-y divide-gray-300 text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <tr>
            <th className="px-5 py-3 text-left">Date</th>
            <th className="px-5 py-3 text-left">Meal</th>
            <th className="px-5 py-3 text-left">Menu</th>
            <th className="px-5 py-3 text-left">Served At</th>
            <th className="px-5 py-3 text-left">Note</th>
            <th className="px-5 py-3 text-left">Category</th>
            <th className="px-5 py-3 text-left">Time</th>
            <th className="px-5 py-3 text-left">Person Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {selectedEvent.foodTravel.map((f, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3">{f.from} → {f.to}</td>
              <td className="px-5 py-3">{f.mealType}</td>
              <td className="px-5 py-3">{f.menu}</td>
              <td className="px-5 py-3">{f.servedAt}</td>
              <td className="px-5 py-3">{f.note}</td>
              <td className="px-5 py-3">{f.category}</td>
              <td className="px-5 py-3">{f.time}</td>
              <td className="px-5 py-3">{f.personCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
)}



{/* Transportation Details */}
{Array.isArray(selectedEvent.transportation) && selectedEvent.transportation.length > 0 && (
  <Section title="Transportation Details" icon={<FaBusAlt />}>
    <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-md">
      <table className="min-w-full divide-y divide-gray-300 text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <tr>
            <th className="px-5 py-3 text-left">Date</th>
            <th className="px-5 py-3 text-left">Mode</th>
            <th className="px-5 py-3 text-left">Pickup</th>
            <th className="px-5 py-3 text-left">Drop</th>
            <th className="px-5 py-3 text-left">Time</th>
            <th className="px-5 py-3 text-left">Remarks</th>
            <th className="px-5 py-3 text-left">Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {selectedEvent.transportation.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3">{t.date}</td>
              <td className="px-5 py-3">{t.mode}</td>
              <td className="px-5 py-3">{t.pickup}</td>
              <td className="px-5 py-3">{t.drop}</td>
              <td className="px-5 py-3">{t.time}</td>
              <td className="px-5 py-3">{t.remarks}</td>
              <td className="px-5 py-3">{t.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
)}

    {/* Uploaded Images */}
    <Section title='Images' icon={<FaImages />}>
      <input
        type='file'
        multiple
        accept='image/*'
        onChange={handleImageUpload}
        className='mb-4'
      />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {selectedEvent?.uploadedImages?.length > 0 ? (
  selectedEvent.uploadedImages.map((file, i) => (
    <img
      key={i}
      src={URL.createObjectURL(file)}
      alt={`Uploaded ${i + 1}`}
      className='h-44 w-full rounded-md object-cover shadow-md transition-transform duration-300 hover:scale-105'
    />
  ))
) : (
  <p className='text-gray-500'>No images uploaded yet.</p>
)}

      </div>
    </Section>
  </div>
)

}

// Reusable Components
const Section = ({ title, children, icon }) => (
  <div className='mb-10 border-b pb-4'>
    <h2 className='mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3 text-2xl font-semibold text-blue-900'>
      {icon} {title}
    </h2>
    {children}
  </div>
)

const GridTwo = ({ children }) => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>{children}</div>
)

const Card = ({ children }) => (
  <div className='mb-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>{children}</div>
  </div>
)

const Item = ({ label, value }) => (
  <div className='flex flex-col space-y-1 text-sm'>
    <span className='font-medium text-gray-500'>{label}</span>
    <span className='text-gray-900'>{value}</span>
  </div>
)

export default ManageEvents