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
  FaUser
} from 'react-icons/fa';
import axios from 'axios';

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

export default HigherAuthorityInbox
