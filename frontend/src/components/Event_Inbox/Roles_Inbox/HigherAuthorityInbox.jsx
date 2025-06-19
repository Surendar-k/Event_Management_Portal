import React, { useState, useEffect,useMemo } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEnvelopeOpenText,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaCommentDots,
  FaPaperPlane,
  FaClock,
  FaUserCheck,
  FaClipboardList,
  FaUser,FaArrowLeft,FaChalkboardTeacher,FaBullseye,FaFlagCheckered,FaMoneyBill,FaUtensils,FaBusAlt
} from 'react-icons/fa';
import axios from 'axios';
import ExportButtons from '../../Report_Generation/ExportButtons';
axios.defaults.withCredentials = true;

// ✅ Checks if event form is complete
const isFormComplete = data => {
  return (
    data?.eventInfo?.title &&
    data?.eventInfo?.startDate &&
    Object.keys(data?.agenda || {}).length > 0 &&
    (data?.financialPlanning?.budget || data?.financialPlanning?.estimatedCost) &&
    (Array.isArray(data?.foodTransport?.meals) || Array.isArray(data?.foodTransport?.refreshments)) &&
    Array.isArray(data?.checklist)
  );
};

// ✅ Safe JSON parse helper
const tryParse = (field, fallback = {}) => {
  try {
    if (typeof field === 'string' && field.trim() !== '') {
      return JSON.parse(field);
    }
    return field !== undefined && field !== null ? field : fallback;
  } catch {
    return fallback;
  }
};

const HigherAuthorityInbox = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
console.log('Executing for role:', userRole)
  useEffect(() => {
    const fetchUserRoleAndEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get user role from session
        const sessionRes = await axios.get('http://localhost:5000/api/session');
        const role = sessionRes.data?.user?.role;
        if (!role) throw new Error('User role not found in session');
        setUserRole(role);

        // 2. Get events that need approval by this role
        const res = await axios.get('http://localhost:5000/api/with-approvals');
       

        const submittedEvents = res.data.map(ev => ({
          id: ev.id,
          status: ev.status,
          approvals: tryParse(ev.approvals, {}),
          creatorRole: ev.creatorRole || 'Unknown',
          creatorEmail: ev.creatorEmail || 'Unknown',
          faculty_name:ev.faculty_name ||"Unknown",
          eventData: {
            eventInfo: tryParse(ev.eventData?.eventInfo, {}),
            agenda: tryParse(ev.eventData?.agenda, {}),
            financialPlanning: tryParse(ev.eventData?.financialPlanning, {}),
            foodTransport: tryParse(ev.eventData?.foodTransport, {}),
            checklist: tryParse(ev.eventData?.checklist, []),
            reviews: tryParse(ev.eventData?.reviews, {})
          }
        }));

        setEvents(submittedEvents);
      } catch (err) {
        console.error('Error fetching session or events:', err);
        setError('Session expired or events failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndEvents();
  }, []);
 
  const getStatusAndColor = ev => {
    const formComplete = isFormComplete(ev.eventData)

    if (!formComplete) {
      return {
        label: 'Draft',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FaClock className='mr-1' />
      }
    }

    if (formComplete && ev.status === 'draft') {
      return {
        label: 'Pending Approval',
        color: 'text-purple-800',
        icon: <FaClipboardList className='mr-1' />
      }
    }

    if (ev.status === 'submitted') {
      const approvalsPending = Object.values(ev.approvals || {}).some(
        v => v === false
      )
      return approvalsPending
        ? {
            label: 'Approval Sent',
            color: 'text-blue-800',
            icon: <FaPaperPlane className='mr-1' />
          }
        : {
            label: 'Approved',
            color: 'text-green-800',
            icon: <FaUserCheck className='mr-1' />
          }
    }

    return {label: ev.status, color: 'text-gray-800', icon: null}
  }


  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const {label} = getStatusAndColor(ev)
      const statusMatches =
        statusFilter === 'all' ? true : label.toLowerCase() === statusFilter
      const title = ev.eventData.eventInfo?.title || ''
      console.log(title)

      const searchMatches = title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return statusMatches && searchMatches
    })
  }, [events, statusFilter, searchTerm])
  console.log('Filtered Events:', filteredEvents)

  const openApprovePopup = ev => {
    setSelectedEvent(ev)
    setShowApprovePopup(true)
  }

  const openReviewPopup = ev => {
    setSelectedEvent(ev)
    setShowReviewPopup(true)
    setReviewMessage(ev.eventData.reviews?.[userRole] || '')
  }

  const closePopups = () => {
    setSelectedEvent(null)
    setShowApprovePopup(false)
    setShowReviewPopup(false)
    setReviewMessage('')
  }

  const handleApprove = async approved => {
    if (!selectedEvent) return

    try {
      const updatedEventData = {
        eventinfo: selectedEvent.eventData.eventInfo,
        agenda: selectedEvent.eventData.agenda,
        financialplanning: selectedEvent.eventData.financialPlanning,
        foodandtransport: selectedEvent.eventData.foodTransport,
        checklist: selectedEvent.eventData.checklist,
        status: selectedEvent.status,
        approvals: {
          ...selectedEvent.approvals,
          [userRole]: approved
        },
        reviews: {
          ...selectedEvent.eventData.reviews,
          [userRole]: approved ? null : `Rejected by ${userRole.toUpperCase()}`
        },
        event_id: selectedEvent.id
      }

      await axios.put(
        `http://localhost:5000/api/events/${selectedEvent.id}`,
        updatedEventData
      )

      setEvents(prev =>
        prev.map(ev =>
          ev.id === selectedEvent.id
            ? {
                ...ev,
                approvals: {...ev.approvals, [userRole]: approved},
                eventData: {
                  ...ev.eventData,
                  reviews: {
                    ...ev.eventData.reviews,
                    [userRole]: approved
                      ? null
                      : `Rejected by ${userRole.toUpperCase()}`
                  }
                }
              }
            : ev
        )
      )

      closePopups()
    } catch (err) {
      console.error('Error updating approval:', err)
      alert('Failed to update approval. Please try again.')
    }
  }

  const handleSendReview = async () => {
    if (!selectedEvent) return
    if (reviewMessage.trim() === '') {
      alert('Please enter a review message')
      return
    }

    try {
      const updatedEventData = {
        eventinfo: selectedEvent.eventData.eventInfo,
        agenda: selectedEvent.eventData.agenda,
        financialplanning: selectedEvent.eventData.financialPlanning,
        foodandtransport: selectedEvent.eventData.foodTransport,
        checklist: selectedEvent.eventData.checklist,
        status: selectedEvent.status,
        approvals: {
          ...selectedEvent.approvals,
          [userRole]: false
        },
        reviews: {
          ...selectedEvent.eventData.reviews,
          [userRole]: reviewMessage.trim()
        },
        event_id: selectedEvent.id
      }

      await axios.put(
        `http://localhost:5000/api/events/${selectedEvent.id}`,
        updatedEventData
      )

      setEvents(prev =>
        prev.map(ev =>
          ev.id === selectedEvent.id
            ? {
                ...ev,
                eventData: {
                  ...ev.eventData,
                  reviews: {
                    ...ev.eventData.reviews,
                    [userRole]: reviewMessage.trim()
                  }
                },
                approvals: {...ev.approvals, [userRole]: false}
              }
            : ev
        )
      )

      closePopups()
    } catch (err) {
      console.error('Error sending review:', err)
      alert('Failed to send review. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'>
        <div className='py-12 text-center'>
          <FaClock className='mx-auto mb-4 animate-spin text-6xl text-gray-300' />
          <p className='text-xl text-gray-500'>Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'>
        <div className='py-12 text-center'>
          <FaTimesCircle className='mx-auto mb-4 text-6xl text-red-300' />
          <p className='text-xl text-red-500'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
const getStatus = (event) => {
  const today = new Date();
  return new Date(event.endDate) < today ? 'completed' : 'upcoming';
};
if (selectedEvent && !showApprovePopup && !showReviewPopup) {
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
        {selectedEvent.title || 'Untitled Event'} Full Details
      </h1>

      {/* You can either copy-paste the Section components from ReportGeneration.jsx here
          OR break out the detailed report view into a reusable <EventDetails /> component. */}

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
      
    </div>
  );
}

  return (
    <div
      className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'
      style={{
        background:
          'linear-gradient(135deg, #f0eaea 0%, #fff 50%, #f0eaea 100%)',
        borderColor: '#ddd'
      }}
    >
      <h1
        className='mb-8 text-center text-4xl font-extrabold'
        style={{color: '#575757', textShadow: '1px 1px 2px rgba(87,87,87,0.2)'}}
      >
        Higher Authority Inbox
      </h1>

      <div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row'>
        <input
          type='text'
          placeholder='Search by title...'
          className='flex-1 rounded-lg border border-gray-300 p-3'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className='min-w-48 rounded-lg border border-gray-300 p-3'
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value='all'>All Statuses</option>
          <option value='draft'>Draft</option>
          <option value='pending approval'>Pending Approval</option>
          <option value='approval sent'>Approval Sent</option>
          <option value='approved'>Approved</option>
        </select>
      </div>

      {!filteredEvents.length === 0 ? (
        <div className='py-12 text-center'>
          <FaEnvelopeOpenText className='mx-auto mb-4 text-6xl text-gray-300' />
          <p className='text-xl text-gray-500'>
            {events.length === 0
              ? 'No events found matching your criteria.'
              : 'No events match your current filters.'}
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {filteredEvents.map((ev, index) => {
            const {label, color} = getStatusAndColor(ev)
            const {title, startDate, venue,venueType} =
              ev.eventData?.eventInfo || {}
               const description = ev.eventData?.agenda?.objectives || '';

            const approvalStatus = ev.approvals?.[userRole]
            //FIXME: fix the DB default for pending
            return (
              <div
                key={ev.id || `event-${index}`}
                className='rounded-xl border border-gray-300 bg-white p-8 shadow-lg'
                style={{boxShadow: '0 6px 15px rgba(0,0,0,0.1)'}}
              >
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <h2 className='mb-3 flex items-center gap-3 text-3xl font-bold text-indigo-900'>
                      <FaEnvelopeOpenText />
                      {title || 'Untitled Event'}
                    </h2>

                    <div className='mb-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <FaUserCircle className='text-gray-500' />
                        Created by {ev.creatorRole} | {ev.faculty_name}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${color}`}
                  >
                    {label}
                  </span>
                </div>

                <div className='mb-5 flex flex-wrap gap-6 text-base text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaCalendarAlt className='text-indigo-600' />
                    <span>
                      <strong>Date:</strong> {startDate || 'TBD'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-indigo-600' />
                    <span>
                      <strong>Venue:</strong> {venue || 'TBD'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-indigo-600' />
                    <span>
                      <strong>VenueType:</strong> {venueType || 'TBD'}
                    </span>
                  </div>
                </div>

                <p className='mb-6 border-l-4 border-indigo-400 pl-4 leading-relaxed text-gray-800 italic'>
                  {description || 'No description'}
                </p>

                <div className='mb-4 flex items-center gap-2'>
                  <span className='font-semibold'>Approval Status:</span>
                  {approvalStatus === true ? (
                    <span className='flex items-center gap-2 font-semibold text-green-700'>
                      <FaCheckCircle /> Approved
                    </span>
                  ) : approvalStatus === false ? (
                    <span className='flex items-center gap-2 font-semibold text-red-700'>
                      <FaTimesCircle /> Rejected
                    </span>
                  ) : (
                    <span className='flex items-center gap-2 font-semibold text-yellow-700'>
                      <FaClock /> Pending Review
                    </span>
                  )}
                </div>

                <div className='mb-6 flex items-start gap-2 font-medium text-gray-700'>
                  <FaCommentDots className='mt-1 mr-2 text-purple-500' />
                  <div>
                    <strong>Your Review:</strong>
                    <span className='ml-2 font-normal text-gray-500 italic'>
                      {ev.eventData.reviews?.[userRole] || 'No review yet'}
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-4'>
                  <button
                    onClick={() => openApprovePopup(ev)}
                    className='flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-white shadow-md transition-all hover:bg-green-800 hover:shadow-lg'
                  >
                    <FaCheckCircle size={18} />
                    Approve / Reject
                  </button>
                  <button
                    onClick={() => openReviewPopup(ev)}
                    className='flex items-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-white shadow-md transition-all hover:bg-indigo-800 hover:shadow-lg'
                  >
                    <FaEdit size={18} />
                    Add / Edit Review
                  </button>
                  <button
  onClick={() => setSelectedEvent({
    ...ev,
    ...ev.eventData?.eventInfo,
    ...ev.eventData?.agenda,
    checklist: ev.eventData?.checklist || [],
    uploadedImages: ev.eventData?.uploadedImages || [],
    financialPlanning: [
      ...(ev.eventData?.financialPlanning?.funding?.map(f => ({ ...f, type: 'Funding' })) || []),
      ...(ev.eventData?.financialPlanning?.budget?.map(b => ({ ...b, type: 'Budget' })) || [])
    ],
    foodTravel: ev.eventData?.foodTransport?.meals || [],
    transportation: ev.eventData?.foodTransport?.travels || [],
    guestServices: ev.eventData?.guestServices || {},
    speakers: ev.eventData?.eventInfo?.speakers || [],
    college: ev.eventData?.eventInfo?.selectedCollege || '',
    department: ev.eventData?.eventInfo?.selectedDepartment || '',
    facultyCoordinators: ev.eventData?.eventInfo?.selectedCoordinators?.join(', ') || '',
  })}
  className='flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg'
>
  <FaClipboardList />
  View Details
</button>

                  
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approval Popup */}
      {showApprovePopup && selectedEvent && (
        <div className='bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black px-4'>
          <div
            className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl'
            style={{borderTop: '6px solid #22c55e'}}
          >
            <h3 className='mb-4 text-2xl font-bold text-gray-900'>
              <FaCheckCircle className='mr-2 inline text-green-500' />
              Approve Event
            </h3>
            <p className='mb-6 text-gray-600'>
              "{selectedEvent.eventData.eventInfo?.title || 'Untitled Event'}"
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => handleApprove(true)}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
              >
                <FaCheckCircle />
                Approve
              </button>
              <button
                onClick={() => handleApprove(false)}
                className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
              >
                <FaTimesCircle />
                Reject
              </button>
              <button
                onClick={closePopups}
                className='rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Popup */}
      {showReviewPopup && selectedEvent && (
        <div className='bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black px-4'>
          <div
            className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl'
            style={{borderTop: '6px solid #4338ca'}}
          >
            <h3 className='mb-4 text-2xl font-bold text-gray-900'>
              <FaCommentDots className='mr-2 inline text-blue-500' />
              Send Review
            </h3>
            <p className='mb-4 text-gray-600'>
              "{selectedEvent.eventData.eventInfo?.title || 'Untitled Event'}"
            </p>
            <textarea
              value={reviewMessage}
              onChange={e => setReviewMessage(e.target.value)}
              placeholder='Enter your review comments...'
              className='mb-6 w-full resize-none rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-indigo-600 focus:outline-none'
              rows={4}
            />
            <div className='flex justify-end space-x-3'>
              <button
                onClick={handleSendReview}
                className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
              >
                <FaPaperPlane />
                Send Review
              </button>
              <button
                onClick={closePopups}
                className='rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// Reusable Section Component
const Section = ({ title, children, icon }) => (
  <div className='mb-10 border-b pb-4'>
    <h2 className='mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3 text-2xl font-semibold text-blue-900'>
      {icon} {title}
    </h2>
    {children}
  </div>
);

// Reusable Item Component
const Item = ({ label, value }) => (
  <div className='flex flex-col space-y-1 text-sm'>
    <span className='font-medium text-gray-500'>{label}</span>
    <span className='text-gray-900'>{value}</span>
  </div>
);

export default HigherAuthorityInbox
