import React, { useState, useEffect, useMemo } from 'react';
import {
  FaEdit,
  FaPaperPlane,
  FaTimesCircle,
  FaTrashAlt,
  FaClock,
  FaClipboardList,
  FaExclamationTriangle,
  FaUserCheck
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const staticApprovers = ['HOD', 'CSO', 'Principal'];

const isFormComplete = (data) => {
  return (
    data?.eventInfo?.title &&
    data?.eventInfo?.startDate &&
    data?.eventInfo?.venue &&
    Object.keys(data?.agenda || {}).length > 0 &&
    data?.financialPlanning?.budget &&
    data?.foodTransport?.foodArrangements &&
    Array.isArray(data?.checklist) &&
    data.checklist.length > 0
  );
};

const EventLogs = () => {
  const [events, setEvents] = useState([]);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      const normalized = res.data.map((ev) => ({
        id: ev.eventId,
        eventData: {
          eventInfo: ev.eventData.eventInfo || {},
          agenda: ev.eventData.agenda || {},
          financialPlanning: ev.eventData.financialPlanning || {},
          foodTransport: ev.eventData.foodTransport || {},
          checklist: ev.eventData.checklist || []
        },
        status: ev.status || 'draft',
        approvals: ev.approvals || {}
      }));
      setEvents(normalized);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (eventId) => {
    navigate(`/create-event/${eventId}`);
  };

  const openApprovalPopup = (event) => {
    setSelectedEvent(event);
    setSelectedApprovers([]);
    setShowApprovalPopup(true);
  };

  const closeApprovalPopup = () => {
    setSelectedEvent(null);
    setSelectedApprovers([]);
    setShowApprovalPopup(false);
  };

  const handleRequestApproval = async () => {
    if (selectedApprovers.length === 0) {
      alert('Please select at least one approver');
      return;
    }

    const approvalObj = selectedApprovers.reduce((acc, role) => {
      acc[role.toLowerCase()] = false;
      return acc;
    }, {});

    const updatedEventData = {
      eventinfo: selectedEvent.eventData.eventInfo,
      agenda: selectedEvent.eventData.agenda,
      financialplanning: selectedEvent.eventData.financialPlanning,
      foodandtransport: selectedEvent.eventData.foodTransport,
      checklist: selectedEvent.eventData.checklist,
      status: 'submitted',
      approvals: approvalObj,
      event_id: selectedEvent.id
    };

    try {
      await axios.put(`http://localhost:5000/api/events/${selectedEvent.id}`, updatedEventData);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id
            ? { ...ev, status: 'submitted', approvals: approvalObj }
            : ev
        )
      );
      closeApprovalPopup();
    } catch (err) {
      console.error('Error requesting approval:', err);
    }
  };

  const handleCancelApprovalClick = (event) => {
    setEventToCancel(event);
    setShowCancelConfirm(true);
  };

  const confirmCancelApproval = async () => {
    if (!eventToCancel) return;

    const updatedEventData = {
      eventinfo: eventToCancel.eventData.eventInfo,
      agenda: eventToCancel.eventData.agenda,
      financialplanning: eventToCancel.eventData.financialPlanning,
      foodandtransport: eventToCancel.eventData.foodTransport,
      checklist: eventToCancel.eventData.checklist,
      status: 'draft',
      approvals: {},
      event_id: eventToCancel.id
    };

    try {
      await axios.put(`http://localhost:5000/api/events/${eventToCancel.id}`, updatedEventData);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventToCancel.id
            ? { ...ev, status: 'draft', approvals: {} }
            : ev
        )
      );
      setShowCancelConfirm(false);
      setEventToCancel(null);
    } catch (err) {
      console.error('Error cancelling approval:', err);
    }
  };

  const cancelCancelApproval = () => {
    setShowCancelConfirm(false);
    setEventToCancel(null);
  };

  const openModal = (id) => {
    setSelectedEventId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEventId(null);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${selectedEventId}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== selectedEventId));
      closeModal();
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const getStatusAndColor = (ev) => {
    const formComplete = isFormComplete(ev.eventData);
    if (!formComplete)
      return {
        label: 'Draft',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FaClock className='mr-2 inline' />
      };

    if (formComplete && ev.status === 'draft')
      return {
        label: 'Pending Approval',
        color: 'text-purple-800',
        icon: <FaClipboardList className='mr-2 inline' />
      };

    if (ev.status === 'submitted') {
      const approvalsPending = Object.values(ev.approvals || {}).some((v) => v === false);
      return approvalsPending
        ? {
            label: 'Approval Sent',
            color: 'text-blue-800',
            icon: <FaPaperPlane className='mr-2 inline' />
          }
        : {
            label: 'Approved',
            color: 'text-green-800',
            icon: <FaUserCheck className='mr-2 inline' />
          };
    }

    return { label: 'Unknown', color: 'text-gray-800', icon: null };
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const { label } = getStatusAndColor(ev);
      const matchesStatus =
        statusFilter === 'all' ? true : label.toLowerCase() === statusFilter;
      const title = ev.eventData.eventInfo?.title || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchTerm]);

  return (
    <>
      <div className='mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl'>
        <h1 className='mb-8 text-center text-4xl font-extrabold'>Logs of created Events</h1>

        {/* Filter Controls */}
        <div className='mb-8 flex flex-col justify-between gap-4 md:flex-row'>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='border-black-300 rounded-lg border bg-black px-4 py-2 text-lg font-medium text-white'
          >
            <option value='all'>All Statuses</option>
            <option value='draft'>Draft</option>
            <option value='pending approval'>Pending Approval</option>
            <option value='approval sent'>Approval Sent</option>
            <option value='approved'>Approved</option>
          </select>

          <input
            type='text'
            placeholder='Search by event name'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border border-gray-300 bg-black px-4 py-2 text-lg font-medium text-white md:w-80'
          />
        </div>

        {filteredEvents.length === 0 ? (
          <p className='text-center text-lg text-gray-500 italic'>No events found.</p>
        ) : (
          <section className='space-y-8'>
            {filteredEvents.map((ev) => {
              const { label: status, color: statusColor, icon: statusIcon } = getStatusAndColor(ev);

              const eventInfo = ev.eventData.eventInfo || {};
              const title = eventInfo.title || 'Untitled Event';
              console.log("Rendering title:", title);
              

              const date = eventInfo.startDate || '-';
              const location = eventInfo.venue || '-';

              return (
                <article
                  key={ev.id}
                  className='flex flex-col items-center justify-between gap-6 rounded-2xl border bg-[#d7d7d7] px-6 py-6 shadow-md transition duration-300 hover:shadow-2xl md:flex-row md:px-10 md:py-8'
                >
                  <div className='w-full flex-1'>
                    <h2 className='mb-2 flex items-center gap-2 truncate text-2xl font-bold text-gray-800 md:text-3xl'>
                      {title}
                    </h2>
                    <dl className='space-y-1 text-lg text-gray-600'>
                      <div>
                        <dt className='inline font-semibold'>Date:</dt>{' '}
                        <dd className='inline'>{date}</dd>
                      </div>
                      <div>
                        <dt className='inline font-semibold'>Location:</dt>{' '}
                        <dd className='inline'>{location}</dd>
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
                    onClick={() => handleEdit(ev.id)}

                      className='flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2 font-semibold text-white transition hover:bg-yellow-500'
                    >
                      <FaEdit /> Edit
                    </button>

                    {(status === 'Draft' || status === 'Pending Approval') && (
                      <button
                        onClick={() => openApprovalPopup(ev)}
                        className='flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 font-semibold text-white transition hover:bg-indigo-700'
                      >
                        <FaPaperPlane /> Request Approval
                      </button>
                    )}

                    {status === 'Approval Sent' && (
                      <button
                        onClick={() => handleCancelApprovalClick(ev)}
                        className='flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700'
                      >
                        <FaTimesCircle /> Cancel Approval
                      </button>
                    )}

                    <button
                      onClick={() => openModal(ev.id)}
                      className='flex items-center gap-2 rounded-xl bg-gray-600 px-6 py-2 font-semibold text-white transition hover:bg-gray-700'
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </article>
              );
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
            <h3 className='mb-6 border-b pb-4 text-3xl font-extrabold text-gray-900' id='approval-popup-title'>
              Request Approval
            </h3>

            <div className='mb-6 max-h-60 space-y-4 overflow-y-auto' role='list'>
              {staticApprovers.map(approver => (
                <label key={approver} className='block cursor-pointer rounded-lg px-4 py-2 text-lg text-gray-800 transition select-none hover:bg-indigo-50'>
                  <input
                    type='checkbox'
                    value={approver}
                    checked={selectedApprovers.includes(approver)}
                    onChange={e => {
                      const value = e.target.value;
                      setSelectedApprovers(prev =>
                        prev.includes(value)
                          ? prev.filter(a => a !== value)
                          : [...prev, value]
                      );
                    }}
                    className='mr-4 h-5 w-5 align-middle'
                  />
                  {approver}
                </label>
              ))}
            </div>

            {selectedApprovers.length > 0 && (
              <div className='mb-6'>
                <h4 className='mb-3 border-b pb-2 text-lg font-semibold'>Selected Approvers:</h4>
                <ul className='max-h-40 space-y-2 overflow-y-auto' role='list'>
                  {selectedApprovers.map(approver => (
                    <li key={approver} className='flex items-center justify-between rounded-lg bg-indigo-100 px-4 py-2 text-indigo-900'>
                      <span className='font-medium'>{approver}</span>
                      <button
                        onClick={() => setSelectedApprovers(prev => prev.filter(a => a !== approver))}
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
            <div className='mb-6 flex items-center gap-4'>
              <div className='rounded-full bg-yellow-100 p-3'>
                <FaExclamationTriangle className='text-3xl text-yellow-600' />
              </div>
              <h3 id='cancel-approval-title' className='text-2xl font-bold text-gray-900 sm:text-3xl'>
                Cancel Approval Request
              </h3>
            </div>

            <p className='mb-8 text-lg leading-relaxed text-gray-700'>
              Are you sure you want to cancel the approval request for{' '}
              <span className='font-semibold text-gray-900'>
                {eventToCancel?.eventData?.eventInfo?.title || 'this event'}
              </span>
              ?
            </p>

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
  );
};

export default EventLogs;
