import React, { useState, useMemo } from 'react'
import {
  FaEdit,
  FaPaperPlane,
  FaTimesCircle,
  FaTrashAlt,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaUserCheck,
  FaExclamationTriangle
} from 'react-icons/fa'

// Static approvers list
const staticApprovers = ['HOD', 'CSO', 'Principal']

// Sample event data
const sampleEvents = [
  {
    id: 'event1',
    creatorEmail: 'sivakumar@shanmugha.edu.in',
    status: 'draft',
    approvals: {},
    eventData: {
      eventInfo: {
        title: 'AI Seminar',
        date: '2025-07-20',
        location: 'Auditorium'
      },
      agenda: [{ time: '10:00 AM', topic: 'Intro to AI' }],
      financialPlanning: { budget: 5000, expenses: [] },
      foodTravel: { foodArrangements: 'Snacks', travelDetails: '' },
      checklist: ['Projector', 'Seating arranged']
    }
  },
  {
    id: 'event2',
    creatorEmail: 'hod.ai_ds@shanmugha.edu.in',
    status: 'submitted',
    approvals: { principal: false },
    eventData: {
      eventInfo: {
        title: 'Data Science Workshop',
        date: '2025-07-25',
        location: 'Lab 3'
      },
      agenda: [{ time: '09:00 AM', topic: 'Python Basics' }],
      financialPlanning: { budget: 7000, expenses: [] },
      foodTravel: { foodArrangements: 'Lunch', travelDetails: 'Bus arranged' },
      checklist: ['Laptops', 'WiFi']
    }
  }
]

// Check if form is complete
const isFormComplete = data => {
  if (
    !data.eventInfo.title ||
    !data.eventInfo.date ||
    !data.eventInfo.location ||
    !data.agenda?.length ||
    !data.financialPlanning.budget ||
    !data.foodTravel.foodArrangements ||
    !data.checklist?.length
  ) {
    return false
  }
  return true
}

const EventLogs = ({ onEditEvent }) => {
  const [events, setEvents] = useState(sampleEvents)
  const [showApprovalPopup, setShowApprovalPopup] = useState(false)
  const [selectedApprovers, setSelectedApprovers] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const openApprovalPopup = event => {
    setSelectedEvent(event)
    setSelectedApprovers([])
    setShowApprovalPopup(true)
  }

  const closeApprovalPopup = () => {
    setSelectedEvent(null)
    setSelectedApprovers([])
    setShowApprovalPopup(false)
  }

  const handleRequestApproval = () => {
    if (selectedApprovers.length === 0) {
      alert('Please select at least one approver')
      return
    }

    const updatedEvents = events.map(ev =>
      ev.id === selectedEvent.id
        ? {
            ...ev,
            status: 'submitted',
            approvals: selectedApprovers.reduce((acc, role) => {
              acc[role.toLowerCase()] = false
              return acc
            }, {})
          }
        : ev
    )

    setEvents(updatedEvents)
    closeApprovalPopup()
  }
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [eventToCancel, setEventToCancel] = useState(null)
  const handleCancelApprovalClick = event => {
    setEventToCancel(event)
    setShowCancelConfirm(true)
  }

  // Confirm cancellation
  const confirmCancelApproval = () => {
    if (!eventToCancel) return
    const updatedEvents = events.map(ev =>
      ev.id === eventToCancel.id
        ? { ...ev, status: 'draft', approvals: {} }
        : ev
    )
    setEvents(updatedEvents)
    setShowCancelConfirm(false)
    setEventToCancel(null)
  }

  // Cancel cancellation action
  const cancelCancelApproval = () => {
    setShowCancelConfirm(false)
    setEventToCancel(null)
  }

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

  const getFirstIncompleteTab = data => {
    if (
      !data.eventInfo.title ||
      !data.eventInfo.date ||
      !data.eventInfo.location
    )
      return 'eventInfo'
    if (!data.agenda?.length) return 'agenda'
    if (!data.financialPlanning.budget) return 'financialPlanning'
    if (!data.foodTravel.foodArrangements) return 'foodTravel'
    if (!data.checklist?.length) return 'checklist'
    return null
  }

  const getStatusAndColor = ev => {
    const formComplete = isFormComplete(ev.eventData)
    if (!formComplete)
      return {
        label: 'Draft',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FaClock className='mr-2 inline' />
      }
    if (formComplete && ev.status === 'draft')
      return {
        label: 'Pending Approval',
        color: ' text-purple-800',
        icon: <FaClipboardList className='mr-2 inline' />
      }
    if (ev.status === 'submitted') {
      const approvalsPending = Object.values(ev.approvals).some(
        val => val === false
      )
      return approvalsPending
        ? {
            label: 'Approval Sent',
            color: 'text-blue-800',
            icon: <FaPaperPlane className='mr-2 inline' />
          }
        : {
            label: 'Approved',
            color: ' text-green-800',
            icon: <FaUserCheck className='mr-2 inline' />
          }
    }
    return { label: 'Unknown', color: ' text-gray-800', icon: null }
  }

  // Filtered events based on status filter and search term
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const { label: statusLabel } = getStatusAndColor(ev)
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusLabel.toLowerCase() === statusFilter.toLowerCase()
      const matchesSearch = ev.eventData.eventInfo.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [events, statusFilter, searchTerm])

  return (
    <>
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
          style={{
            color: '#575757',
            textShadow: '1px 1px 2px rgba(87,87,87,0.2)'
          }}
        >
          Logs of created Events
        </h1>

        {/* Filter Controls */}
        <div className='mb-8 flex flex-col justify-between gap-4 md:flex-row'>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='border-black-300 rounded-lg border bg-black px-4 py-2 text-lg font-medium text-white'
              aria-label='Filter events by status'
            >
              <option value='all'>All Statuses</option>
              <option value='draft'>Draft</option>
              <option value='pending approval'>Pending Approval</option>
              <option value='approval sent'>Approval Sent</option>
              <option value='approved'>Approved</option>
            </select>
          </div>

          <div>
            <input
              type='text'
              placeholder='Search by event name'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-black px-4 py-2 text-lg font-medium text-white md:w-80'
              aria-label='Search events by name'
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className='text-center text-lg text-gray-500 italic'>
            No events found.
          </p>
        ) : (
          <section className='space-y-8'>
            {filteredEvents.map(ev => {
              const incompleteTab = getFirstIncompleteTab(ev.eventData)
              const {
                label: status,
                color: statusColor,
                icon: statusIcon
              } = getStatusAndColor(ev)

              return (
                <article
                  key={ev.id}
                  className='flex flex-col items-center justify-between gap-6 rounded-2xl border bg-[#d7d7d7] px-6 py-6 shadow-md transition duration-300 hover:shadow-2xl md:flex-row md:px-10 md:py-8'
                >
                  <div className='w-full flex-1'>
                    <h2
                      className='mb-2 flex items-center gap-2 truncate text-2xl font-bold text-gray-800 md:text-3xl'
                      title={ev.eventData.eventInfo.title || 'Untitled Event'}
                    >
                      {ev.eventData.eventInfo.title || 'Untitled Event'}
                    </h2>
                    <dl className='space-y-1 text-lg text-gray-600'>
                      <div>
                        <dt className='inline font-semibold'>Date:</dt>{' '}
                        <dd className='inline'>
                          {ev.eventData.eventInfo.date || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className='inline font-semibold'>Location:</dt>{' '}
                        <dd className='inline'>
                          {ev.eventData.eventInfo.location || '-'}
                        </dd>
                      </div>
                    </dl>
                    <p className='mt-4 inline-block cursor-default rounded-full px-4 py-1 text-sm font-semibold tracking-wide select-none'>
                      <span className={`${statusColor} flex items-center`}>
                        {statusIcon} {status}
                      </span>
                    </p>
                  </div>

                  <div className='flex flex-wrap justify-end gap-3 md:flex-col'>
                    <button
                      onClick={() => onEditEvent(ev.id, incompleteTab)}
                      className='flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2 font-semibold text-white transition hover:bg-yellow-500'
                      aria-label={`Edit event ${ev.eventData.eventInfo.title}`}
                    >
                      <FaEdit /> Edit
                    </button>

                    {(status === 'Draft' || status === 'Pending Approval') && (
                      <button
                        onClick={() => openApprovalPopup(ev)}
                        className='flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700'
                        aria-label={`Request approval for event ${ev.eventData.eventInfo.title}`}
                      >
                        <FaPaperPlane /> Request Approval
                      </button>
                    )}

                    {status === 'Approval Sent' && (
                      <button
                        onClick={() => handleCancelApprovalClick(ev)}
                        className='flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700'
                        aria-label={`Cancel approval for event ${ev.eventData.eventInfo.title}`}
                      >
                        <FaTimesCircle /> Cancel Approval
                      </button>
                    )}

                    <button
                      onClick={() => openModal(ev.id)}
                      className='flex items-center gap-2 rounded-xl bg-gray-600 px-6 py-2 font-semibold text-white transition hover:bg-gray-700'
                      aria-label={`Delete event ${ev.eventData.eventInfo.title}`}
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>

      {showApprovalPopup && selectedEvent && (
        <div
          className='bg-opacity-60 fixed inset-0 z-50 flex items-center justify-center bg-black p-6 backdrop-blur-sm'
          onClick={closeApprovalPopup}
          aria-modal='true'
          role='dialog'
          aria-labelledby='approval-popup-title'
        >
          <div
            className='w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10'
            style={{ borderTop: '6px solid rgb(34, 105, 197)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              className='mb-6 border-b pb-4 text-3xl font-extrabold text-gray-900'
              id='approval-popup-title'
            >
              Request Approval
            </h3>

            <div
              className='mb-6 max-h-60 space-y-4 overflow-y-auto'
              role='list'
            >
              {staticApprovers.map(approver => (
                <label
                  key={approver}
                  className='block cursor-pointer rounded-lg px-4 py-2 text-lg text-gray-800 transition select-none hover:bg-indigo-50'
                >
                  <input
                    type='checkbox'
                    value={approver}
                    checked={selectedApprovers.includes(approver)}
                    onChange={e => {
                      const value = e.target.value
                      setSelectedApprovers(prev =>
                        prev.includes(value)
                          ? prev.filter(a => a !== value)
                          : [...prev, value]
                      )
                    }}
                    className='mr-4 h-5 w-5 align-middle'
                  />
                  {approver}
                </label>
              ))}
            </div>

            {selectedApprovers.length > 0 && (
              <div className='mb-6'>
                <h4 className='mb-3 border-b pb-2 text-lg font-semibold'>
                  Selected Approvers:
                </h4>
                <ul className='max-h-40 space-y-2 overflow-y-auto' role='list'>
                  {selectedApprovers.map(approver => (
                    <li
                      key={approver}
                      className='flex items-center justify-between rounded-lg bg-indigo-100 px-4 py-2 text-indigo-900'
                    >
                      <span className='font-medium'>{approver}</span>
                      <button
                        onClick={() =>
                          setSelectedApprovers(prev =>
                            prev.filter(a => a !== approver)
                          )
                        }
                        className='text-lg font-bold text-red-600 hover:text-red-800'
                        aria-label={`Remove ${approver}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='mt-6 flex justify-end gap-4'>
              <button
                onClick={closeApprovalPopup}
                className='rounded-xl bg-gray-300 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleRequestApproval}
                className='rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700'
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}
      {/* NEW: Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div
          className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm'
          onClick={cancelCancelApproval}
          aria-modal='true'
          role='dialog'
          aria-labelledby='cancel-approval-title'
        >
          <div
            className='relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10'
            style={{ borderTop: '6px solid rgb(197, 34, 34)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Warning Icon and Title */}
            <div className='mb-6 flex items-center gap-4'>
              <div className='rounded-full bg-yellow-100 p-3'>
                <FaExclamationTriangle className='text-3xl text-yellow-600' />
              </div>
              <h3
                id='cancel-approval-title'
                className='text-2xl font-bold text-gray-900 sm:text-3xl'
              >
                Cancel Approval Request
              </h3>
            </div>

            {/* Confirmation Text */}
            <p className='mb-8 text-lg leading-relaxed text-gray-700'>
              Are you sure you want to cancel the approval request for{' '}
              <span className='font-semibold text-gray-900'>
                {eventToCancel?.eventData?.eventInfo?.title || 'this event'}
              </span>
              ?
            </p>

            {/* Buttons */}
            <div className='flex justify-end gap-4'>
              <button
                onClick={cancelCancelApproval}
                className='flex items-center gap-2 rounded-xl bg-gray-200 px-6 py-2 font-semibold text-gray-800 transition hover:bg-gray-300'
              >
                <span className='text-lg'>❌</span> No, Keep
              </button>
              <button
                onClick={confirmCancelApproval}
                className='flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700'
              >
                <span className='text-lg'>✅</span> Yes, Cancel
              </button>
            </div>

            {/* Close icon top-right (optional) */}
            <button
              onClick={cancelCancelApproval}
              className='absolute top-4 right-4 text-xl text-gray-400 transition hover:text-gray-600'
              aria-label='Close'
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black'>
          <div
            className='relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10'
            style={{ borderTop: '6px solid rgb(197, 34, 34)' }}
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
    </>
  )
}

export default EventLogs
