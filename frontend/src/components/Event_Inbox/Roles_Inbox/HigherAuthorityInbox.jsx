import React, { useState, useEffect, useMemo } from 'react'
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
  FaUser,
} from 'react-icons/fa'
import axios from 'axios'

axios.defaults.withCredentials = true

const userRole = 'hod' // Hardcoded for this demo

const isFormComplete = (data) => {
  return (
    data?.eventInfo?.title &&
    data?.eventInfo?.startDate &&
    // remove or relax venue requirement
    Object.keys(data?.agenda || {}).length > 0 &&
    // optional chaining for budget check
    (data?.financialPlanning?.budget || data?.financialPlanning?.estimatedCost) &&
    // allow meals/travels arrays instead of foodArrangements
    (Array.isArray(data?.foodTransport?.meals) || Array.isArray(data?.foodTransport?.refreshments)) &&
    Array.isArray(data?.checklist) &&
    data.checklist.length >= 0
  )
}

// Helper function to safely parse JSON strings
const tryParse = (field, fallback = {}) => {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field || fallback;
  } catch {
    return fallback;
  }
};

const HigherAuthorityInbox = () => {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showApprovePopup, setShowApprovePopup] = useState(false)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Updated endpoint to match your backend route
        const res = await axios.get("http://localhost:5000/api/events/by-user");
        
        console.log('Raw API response:', res.data); // Debug log
        
        const submittedEvents = res.data.map(ev => {
          console.log('Processing event:', ev); // Debug log
          
          return {
            id: ev.event_id, // Use event_id from backend
            status: ev.status,
            approvals: tryParse(ev.approvals, {}),
            creatorRole: ev.creator_role || 'Unknown', // Add fallback
            creatorEmail: ev.creator_email || 'Unknown', // Add fallback
            eventData: {
              eventInfo: tryParse(ev.eventinfo, {}),
              agenda: tryParse(ev.agenda, {}),
              financialPlanning: tryParse(ev.financialplanning, {}),
              foodTransport: tryParse(ev.foodandtransport, {}),
              checklist: tryParse(ev.checklist, []),
              reviews: tryParse(ev.reviews, {})
            }
          }
        });
        
        console.log('Processed events:', submittedEvents); // Debug log
        setEvents(submittedEvents);
        
      } catch (err) {
        console.error("Error fetching events for approval:", err);
        setError("Failed to fetch events. Please try again.");
      } finally {
        setLoading(false)
      }
    };
    
    fetchEvents();
  }, []);

  const getStatusAndColor = (ev) => {
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
      const approvalsPending = Object.values(ev.approvals || {}).some(v => v === false)
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

    return { label: ev.status, color: 'text-gray-800', icon: null }
  }

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      
      const { label } = getStatusAndColor(ev)
      const statusMatches = statusFilter === 'all' ? true : label.toLowerCase() === statusFilter
      const title = ev.eventData.eventInfo?.title || ''
      
      const searchMatches = title.toLowerCase().includes(searchTerm.toLowerCase())
      return statusMatches && searchMatches
      
    })
  }, [events, statusFilter, searchTerm])
console.log("Filtered Events:", filteredEvents)
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

  const handleApprove = async (approved) => {
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

      await axios.put(`http://localhost:5000/api/events/${selectedEvent.id}`, updatedEventData)

      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id
        ? {
            ...ev,
            approvals: { ...ev.approvals, [userRole]: approved },
            eventData: {
              ...ev.eventData,
              reviews: {
                ...ev.eventData.reviews,
                [userRole]: approved ? null : `Rejected by ${userRole.toUpperCase()}`
              }
            }
          } : ev))
      
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

      await axios.put(`http://localhost:5000/api/events/${selectedEvent.id}`, updatedEventData)

      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id
        ? {
            ...ev,
            eventData: {
              ...ev.eventData,
              reviews: {
                ...ev.eventData.reviews,
                [userRole]: reviewMessage.trim()
              }
            },
            approvals: { ...ev.approvals, [userRole]: false }
          } : ev))
      
      closePopups()
    } catch (err) {
      console.error('Error sending review:', err)
      alert('Failed to send review. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'>
        <div className="text-center py-12">
          <FaClock className="mx-auto text-6xl text-gray-300 mb-4 animate-spin" />
          <p className="text-xl text-gray-500">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'>
        <div className="text-center py-12">
          <FaTimesCircle className="mx-auto text-6xl text-red-300 mb-4" />
          <p className="text-xl text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'
    style={{
        background:
          'linear-gradient(135deg, #f0eaea 0%, #fff 50%, #f0eaea 100%)',
        borderColor: '#ddd'
      }}>
      <h1 className='mb-8 text-center text-4xl font-extrabold'
        style={{color: '#575757', textShadow: '1px 1px 2px rgba(87,87,87,0.2)'}}>Higher Authority Inbox</h1>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          className="border border-gray-300 p-3 rounded-lg flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 p-3 rounded-lg min-w-48"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending approval">Pending Approval</option>
          <option value="approval sent">Approval Sent</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {!filteredEvents.length ===0? (
        <div className="text-center py-12">
          <FaEnvelopeOpenText className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">
            {events.length === 0 ? "No events found matching your criteria." : "No events match your current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
         {filteredEvents.map((ev, index) => {
  const { label, color } = getStatusAndColor(ev);
 const { title,startDate, venue, description } = ev.eventData?.eventInfo || {};

  const approvalStatus = ev.approvals?.[userRole];

  return (
    <div key={ev.id || `event-${index}`} className='rounded-xl border border-gray-300 bg-white p-8 shadow-lg'

                style={{boxShadow: '0 6px 15px rgba(0,0,0,0.1)'}}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className='mb-3 flex items-center gap-3 text-3xl font-bold text-indigo-900'>
                       <FaEnvelopeOpenText />
                      {title || 'Untitled Event'}
                    </h2>
                    
                    <div className='mb-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700'>
                      <div className='flex items-center gap-1'>
                        <FaUserCircle className='text-gray-500' />
                        Created by {ev.creatorRole} | {ev.creatorEmail}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                    {label}
                  </span>
                </div>

                <div className='mb-5 flex flex-wrap gap-6 text-base text-gray-700'>
                  <div className='flex items-center gap-2'>
                   <FaCalendarAlt className='text-indigo-600' />
                    <span><strong>Date:</strong> {startDate || 'TBD'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                     <FaMapMarkerAlt className='text-indigo-600' />
                    <span><strong>Venue:</strong> {venue || 'TBD'}</span>
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
                  <FaCommentDots className="mr-2 text-purple-500 mt-1" />
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
          <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl'
            style={{borderTop: '6px solid #22c55e'}}
          >
            <h3 className='mb-4 text-2xl font-bold text-gray-900'>
              <FaCheckCircle className="inline mr-2 text-green-500" />
              Approve Event
            </h3>
            <p className="text-gray-600 mb-6">
              "{selectedEvent.eventData.eventInfo?.title || 'Untitled Event'}"
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handleApprove(true)} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaCheckCircle />
                Approve
              </button>
              <button 
                onClick={() => handleApprove(false)} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaTimesCircle />
                Reject
              </button>
              <button 
                onClick={closePopups} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl'
            style={{borderTop: '6px solid #4338ca'}}>
            <h3 className='mb-4 text-2xl font-bold text-gray-900'>
              <FaCommentDots className="inline mr-2 text-blue-500" /> 
              Send Review
            </h3>
            <p className="text-gray-600 mb-4">
              "{selectedEvent.eventData.eventInfo?.title || 'Untitled Event'}"
            </p>
            <textarea
              value={reviewMessage}
              onChange={e => setReviewMessage(e.target.value)}
              placeholder="Enter your review comments..."
              className='mb-6 w-full resize-none rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-indigo-600 focus:outline-none'
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleSendReview} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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