import React, {useState} from 'react'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEnvelopeOpenText,
  FaTrashAlt
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
  },
  {
    id: 'event3',
    creatorRole: 'hod',
    creatorEmail: 'hod1@school.edu',
    status: 'submitted',
    approvals: {
      principal: false,
      cso: false
    },
    reviews: {
      principal: null,
      cso: null
    },
    eventData: {
      eventInfo: {
        title: 'Data Science Workshop',
        date: '2025-07-25',
        location: 'Lab 3',
        description: 'A workshop focused on Data Science techniques and tools.'
      }
    }
  },
  {
    id: 'event4',
    creatorRole: 'principal',
    creatorEmail: 'principal@school.edu',
    status: 'submitted',
    approvals: {
      cso: false
    },
    reviews: {
      cso: null
    },
    eventData: {
      eventInfo: {
        title: 'Annual Day',
        date: '2025-08-15',
        location: 'Main Hall',
        description:
          'School annual day celebration with performances and awards.'
      }
    }
  },
  {
    id: 'event5',
    creatorRole: 'faculty',
    creatorEmail: 'faculty3@school.edu',
    status: 'submitted',
    approvals: {
      hod: 'rejected',
      principal: false,
      cso: false
    },
    reviews: {
      hod: 'The event schedule clashes with exams. Please reschedule.',
      principal: null,
      cso: null
    },
    eventData: {
      eventInfo: {
        title: 'Math Olympiad',
        date: '2025-07-30',
        location: 'Room 101',
        description: 'Inter-school math competition for high school students.'
      }
    }
  }
]

const approvalStatusIcon = status => {
  switch (status) {
    case true:
      return (
        <FaCheckCircle className='text-xl text-green-600' title='Approved' />
      )
    case false:
      return <FaClock className='text-xl text-yellow-500' title='Pending' />
    case 'rejected':
      return <FaTimesCircle className='text-xl text-red-500' title='Rejected' />
    default:
      return (
        <FaEnvelopeOpenText
          className='text-xl text-gray-400'
          title='No Status'
        />
      )
  }
}

const approvalStatusText = status => {
  if (status === true) return 'Approved'
  if (status === false) return 'Pending'
  if (status === 'rejected') return 'Rejected'
  return 'N/A'
}

const eventColors = [
  'bg-blue-50',
  'bg-yellow-50',
  'bg-green-50',
  'bg-pink-50',
  'bg-purple-50',
  'bg-orange-50'
]

const FacultyInbox = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [events, setEvents] = useState(sampleEvents) // state to track events

  const [showModal, setShowModal] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)

  const openModal = id => {
    setSelectedEventId(id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEventId(null)
  }

  const confirmDelete = () => {
    setEvents(events.filter(ev => ev.id !== selectedEventId))
    closeModal()
  }

  const filteredEvents = events.filter(ev =>
    ev.eventData.eventInfo.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

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
        Event Inbox
      </h1>

      <div className='mx-auto mb-10 max-w-md'>
        <input
          type='text'
          placeholder='Search by event name...'
          className='w-full rounded-lg border border-gray-300 bg-black px-4 py-2 text-white shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className='text-center text-lg text-gray-500'>No events found.</p>
      ) : (
        <div className='space-y-10'>
          {filteredEvents.map((ev, index) => (
            <div
              key={ev.id}
              className={`rounded-xl border border-gray-300 p-8 shadow-lg transition duration-300 hover:shadow-2xl ${eventColors[index % eventColors.length]}`}
            >
              <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <FaCalendarAlt className='text-3xl text-indigo-600' />
                  <div>
                    <h2 className='text-3xl font-semibold text-gray-900'>
                      {ev.eventData.eventInfo.title}
                    </h2>
                    <p className='text-sm text-gray-600 capitalize'>
                      Created by {ev.creatorRole} &nbsp;|&nbsp;{' '}
                      {ev.creatorEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(ev.id)}
                  className='text-red-600 transition hover:text-red-800'
                  title='Delete this event'
                >
                  <FaTrashAlt className='text-2xl' />
                </button>
              </div>

              <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>Date:</span>{' '}
                    {ev.eventData.eventInfo.date}
                  </p>
                </div>
                <div>
                  <p className='text-gray-700'>
                    <span className='font-semibold'>Location:</span>{' '}
                    {ev.eventData.eventInfo.location}
                  </p>
                </div>
                <div>
                  <p className='text-gray-700 italic'>
                    {ev.eventData.eventInfo.description}
                  </p>
                </div>
              </div>

              <h3 className='mb-3 text-xl font-semibold text-gray-800'>
                Approvals
              </h3>
              <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                {Object.entries(ev.approvals).map(([role, status]) => (
                  <div
                    key={role}
                    className='flex items-center space-x-3 rounded-lg border bg-white p-4 shadow-sm'
                  >
                    {approvalStatusIcon(status)}
                    <div>
                      <p className='font-semibold text-gray-900 capitalize'>
                        {role}
                      </p>
                      <p
                        className={`${
                          status === true
                            ? 'text-green-600'
                            : status === false
                              ? 'text-yellow-600'
                              : status === 'rejected'
                                ? 'text-red-600'
                                : 'text-gray-500'
                        }`}
                      >
                        {approvalStatusText(status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className='mb-3 text-xl font-semibold text-gray-800'>
                Review Comments
              </h3>
              <div className='space-y-3'>
                {Object.entries(ev.reviews).some(([comment]) => comment) ? (
                  Object.entries(ev.reviews).map(([role, comment]) =>
                    comment ? (
                      <div
                        key={role}
                        className='rounded-md border-l-4 border-indigo-500 bg-indigo-100 p-4'
                      >
                        <p className='mb-1 font-semibold capitalize'>
                          {role} says:
                        </p>
                        <p className='text-gray-800 italic'>"{comment}"</p>
                      </div>
                    ) : null
                  )
                ) : (
                  <p className='text-gray-500 italic'>
                    No review comments yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div
            className='relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10'
            style={{borderTop: '6px solid rgb(197, 34, 34)'}}
          >
            <h2 className='mb-4 text-lg font-bold'>Confirm Deletion</h2>
            <p className='mb-6'>Are you sure you want to delete this event?</p>
            <div className='flex justify-end gap-4'>
              <button
                onClick={closeModal}
                className='rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyInbox
