import {useState} from 'react'
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEnvelopeOpenText,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaCommentDots
} from 'react-icons/fa'

const sampleEvents = [
  {
    id: 'event1',
    creatorRole: 'faculty',
    creatorEmail: 'faculty1@school.edu',
    status: 'submitted',
    approvals: {
      hod: false,
      principal: false,
      cso: false
    },
    reviews: {
      hod: null,
      principal: null,
      cso: null
    },
    eventData: {
      eventInfo: {
        title: 'AI Seminar',
        date: '2025-07-20',
        location: 'Auditorium',
        description: 'A seminar on Artificial Intelligence by industry experts.'
      }
    }
  },
  {
    id: 'event2',
    creatorRole: 'faculty',
    creatorEmail: 'faculty2@school.edu',
    status: 'submitted',
    approvals: {
      hod: true,
      principal: false,
      cso: false
    },
    reviews: {
      hod: 'Looks good to me.',
      principal: null,
      cso: null
    },
    eventData: {
      eventInfo: {
        title: 'Robotics Workshop',
        date: '2025-07-22',
        location: 'Lab 1',
        description: 'Hands-on robotics workshop for beginners.'
      }
    }
  }
]

const HigherAuthorityInbox = () => {
  // Hardcoded userRole for this static demo
  const userRole = 'hod'

  const [events, setEvents] = useState(sampleEvents)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showApprovePopup, setShowApprovePopup] = useState(false)
  const [showReviewPopup, setShowReviewPopup] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  const pendingEvents = events.filter(
    ev =>
      ev.creatorRole === 'faculty' &&
      ev.approvals &&
      Object.prototype.hasOwnProperty.call(ev.approvals, userRole) &&
      ev.approvals[userRole] === false
  )

  const openApprovePopup = ev => {
    setSelectedEvent(ev)
    setShowApprovePopup(true)
  }

  const openReviewPopup = ev => {
    setSelectedEvent(ev)
    setReviewMessage('')
    setShowReviewPopup(true)
  }

  const closePopups = () => {
    setSelectedEvent(null)
    setShowApprovePopup(false)
    setShowReviewPopup(false)
  }

  const handleApprove = approved => {
    if (!selectedEvent) return
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            approvals: {
              ...ev.approvals,
              [userRole]: approved ? true : 'rejected'
            },
            reviews: {
              ...ev.reviews,
              [userRole]: approved
                ? null
                : `Rejected by ${userRole.toUpperCase()}`
            }
          }
        }
        return ev
      })
    )
    closePopups()
  }

  const handleSendReview = () => {
    if (!selectedEvent) return
    if (reviewMessage.trim() === '') {
      alert('Please enter a review message')
      return
    }
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            reviews: {
              ...ev.reviews,
              [userRole]: reviewMessage.trim()
            },
            approvals: {
              ...ev.approvals,
              [userRole]: false
            }
          }
        }
        return ev
      })
    )
    closePopups()
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
        {userRole.toUpperCase()} Inbox
      </h1>

      {pendingEvents.length === 0 ? (
        <p className='text-center text-lg text-gray-600 italic'>
          No pending events.
        </p>
      ) : (
        <div className='space-y-10'>
          {pendingEvents.map(ev => {
            const approvalStatus = ev.approvals?.[userRole]
            return (
              <div
                key={ev.id}
                className='rounded-xl border border-gray-300 bg-white p-8 shadow-lg'
                style={{boxShadow: '0 6px 15px rgba(0,0,0,0.1)'}}
              >
                <h2 className='mb-3 flex items-center gap-3 text-3xl font-bold text-indigo-900'>
                  <FaEnvelopeOpenText />
                  {ev.eventData?.eventInfo?.title || 'Untitled Event'}
                </h2>

                <div className='mb-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700'>
                  <div className='flex items-center gap-1'>
                    <FaUserCircle className='text-gray-500' />
                    Created by {ev.creatorRole.toUpperCase()} &nbsp;|&nbsp;{' '}
                    {ev.creatorEmail}
                  </div>
                </div>

                <div className='mb-5 flex flex-wrap gap-6 text-base text-gray-700'>
                  <div className='flex items-center gap-2'>
                    <FaCalendarAlt className='text-indigo-600' />
                    <span>
                      <strong>Date:</strong>{' '}
                      {ev.eventData?.eventInfo?.date || 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-indigo-600' />
                    <span>
                      <strong>Location:</strong>{' '}
                      {ev.eventData?.eventInfo?.location || 'N/A'}
                    </span>
                  </div>
                </div>

                <p className='mb-6 border-l-4 border-indigo-400 pl-4 leading-relaxed text-gray-800 italic'>
                  {ev.eventData?.eventInfo?.description || 'No description'}
                </p>

                <p className='mb-4 font-semibold'>
                  Status:{' '}
                  {approvalStatus === true ? (
                    <span className='flex items-center gap-2 font-semibold text-green-700'>
                      <FaCheckCircle /> Approved
                    </span>
                  ) : approvalStatus === false ? (
                    <span className='flex items-center gap-2 font-semibold text-yellow-700'>
                      <FaTimesCircle /> Pending
                    </span>
                  ) : approvalStatus === 'rejected' ? (
                    <span className='flex items-center gap-2 font-semibold text-red-700'>
                      <FaTimesCircle /> Rejected
                    </span>
                  ) : (
                    <span className='text-gray-600'>N/A</span>
                  )}
                </p>

                <p className='mb-6 flex items-center gap-2 font-medium text-gray-700'>
                  <FaCommentDots />
                  Your Review:{' '}
                  <span className='font-normal text-gray-500 italic'>
                    {ev.reviews?.[userRole] || 'No review yet.'}
                  </span>
                </p>

                <div className='flex flex-wrap gap-6'>
                  <button
                    onClick={() => openApprovePopup(ev)}
                    className='flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-white shadow-md transition-shadow hover:bg-green-800'
                    title='Approve or Reject'
                  >
                    <FaCheckCircle size={20} />
                    Approve
                  </button>

                  <button
                    onClick={() => openReviewPopup(ev)}
                    className='flex items-center gap-2 rounded-lg bg-indigo-700 px-6 py-3 text-white shadow-md transition-shadow hover:bg-indigo-800'
                    title='Send Review'
                  >
                    <FaEdit size={20} />
                    Review
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approve Popup */}
      {showApprovePopup && selectedEvent && (
        <div className='bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black px-4'>
          <div
            className='w-full max-w-md rounded-xl bg-white p-8 shadow-xl'
            style={{borderTop: '6px solid #22c55e'}}
          >
            <h3 className='mb-4 text-2xl font-bold text-gray-900'>
              Approve "{selectedEvent.eventData?.eventInfo?.title}"
            </h3>
            <p className='mb-6 text-lg text-gray-700'>
              Do you want to approve this event?
            </p>
            <div className='flex justify-end gap-5'>
              <button
                onClick={() => handleApprove(true)}
                className='rounded-lg bg-green-600 px-5 py-2 text-white shadow-md transition-shadow hover:bg-green-700'
              >
                Yes
              </button>
              <button
                onClick={() => handleApprove(false)}
                className='rounded-lg bg-red-600 px-5 py-2 text-white shadow-md transition-shadow hover:bg-red-700'
              >
                No
              </button>
              <button
                onClick={closePopups}
                className='rounded-lg border border-gray-300 px-5 py-2 transition hover:bg-gray-100'
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
              Send Review for "{selectedEvent.eventData?.eventInfo?.title}"
            </h3>
            <textarea
              value={reviewMessage}
              onChange={e => setReviewMessage(e.target.value)}
              placeholder='Enter your message...'
              className='mb-6 w-full resize-none rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-indigo-600 focus:outline-none'
              rows={6}
            />
            <div className='flex justify-end gap-5'>
              <button
                onClick={handleSendReview}
                className='rounded-lg bg-indigo-700 px-6 py-2 text-white shadow-md transition-shadow hover:bg-indigo-800'
              >
                Send
              </button>
              <button
                onClick={closePopups}
                className='rounded-lg border border-gray-300 px-6 py-2 transition hover:bg-gray-100'
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
