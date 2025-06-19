import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEnvelopeOpenText,
  FaTrashAlt
} from 'react-icons/fa';
import axios from 'axios';

axios.defaults.withCredentials = true;

const approvalStatusIcon = status => {
  switch (status) {
    case true:
      return <FaCheckCircle className='text-xl text-green-600' title='Approved' />;
    case false:
      return <FaClock className='text-xl text-yellow-500' title='Pending' />;
    case 'rejected':
      return <FaTimesCircle className='text-xl text-red-500' title='Rejected' />;
    default:
      return <FaEnvelopeOpenText className='text-xl text-gray-400' title='No Status' />;
  }
};

const approvalStatusText = status => {
  if (status === true) return 'Approved';
  if (status === false) return 'Pending';
  if (status === 'rejected') return 'Rejected';
  return 'N/A';
};

const tryParse = (field, fallback = {}) => {
  try {
    if (typeof field === 'string') return JSON.parse(field);
    return field ?? fallback;
  } catch {
    return fallback;
  }
};

const eventColors = [
  'bg-blue-50',
  'bg-yellow-50',
  'bg-green-50',
  'bg-pink-50',
  'bg-purple-50',
  'bg-orange-50'
];

const FacultyInbox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/by-user');
       const parsed = res.data.map(ev => ({
  id: ev.eventId,
  approvals: tryParse(ev.approvals, {}),
  expectedApprovals: ev.expectedApprovals || [],
  creatorRole: ev.creatorRole || 'Unknown',
  creatorEmail: ev.creatorEmail || 'Unknown',
  eventData: {
    eventInfo: tryParse(ev.eventData?.eventInfo, {}),
    reviews: tryParse(ev.eventData?.reviews, {})
  }
}));

        setEvents(parsed);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchEvents();
  }, []);

  const openModal = id => {
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
      setEvents(events.filter(ev => ev.id !== selectedEventId));
      closeModal();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const filteredEvents = events.filter(ev =>
    ev.eventData?.eventInfo?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='mx-auto max-w-6xl px-4 py-12'>
      <h1 className='mb-10 text-center text-4xl font-bold text-gray-800'>📥 Faculty Event Inbox</h1>

      <div className='mx-auto mb-10 max-w-md'>
        <input
          type='text'
          placeholder='🔍 Search events...'
          className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className='text-center text-lg text-gray-500'>No matching events found.</p>
      ) : (
        <div className='space-y-10'>
          {filteredEvents.map((ev, index) => (
            <div
              key={ev.id}
              className={`rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition duration-300 ${eventColors[index % eventColors.length]}`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-4'>
                  <FaCalendarAlt className='mt-1 text-2xl text-indigo-500' />
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-900'>
                      {ev.eventData.eventInfo.title}
                    </h2>
                    <p className='text-sm text-gray-600'>
                      Created by <strong>{ev.creatorRole}</strong> | {ev.creatorEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(ev.id)}
                  className='rounded-full p-2 text-red-500 hover:bg-red-100'
                  title='Delete this event'
                >
                  <FaTrashAlt />
                </button>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 text-gray-700'>
                <p><strong>Date:</strong> {ev.eventData.eventInfo.date || 'N/A'}</p>
                <p><strong>Location:</strong> {ev.eventData.eventInfo.location || 'N/A'}</p>
                <p className='italic text-gray-600'>{ev.eventData.eventInfo.description || ''}</p>
              </div>

              <div className='mt-6'>
                <h3 className='mb-3 text-lg font-semibold text-gray-800'>Approvals</h3>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  {Object.entries(ev.approvals).map(([role, status]) => (
                    <div
                      key={role}
                      className='flex items-center space-x-3 rounded-md border bg-white p-3 shadow-sm'
                    >
                      {approvalStatusIcon(status)}
                      <div>
                        <p className='font-semibold capitalize text-gray-800'>{role}</p>
                        <p
                          className={`text-sm ${
                            status === true
                              ? 'text-green-600'
                              : status === 'rejected'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {approvalStatusText(status)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='mt-6'>
                <h3 className='mb-3 text-lg font-semibold text-gray-800'>Review Comments</h3>
                {Object.values(ev.eventData.reviews).some(comment => comment) ? (
                  Object.entries(ev.eventData.reviews).map(([role, comment]) =>
                    comment ? (
                      <div
                        key={role}
                        className='rounded-md border-l-4 border-indigo-500 bg-indigo-50 px-4 py-3'
                      >
                        <p className='mb-1 font-semibold capitalize text-indigo-700'>{role} says:</p>
                        <p className='italic text-gray-700'>"{comment}"</p>
                      </div>
                    ) : null
                  )
                ) : (
                  <p className='text-sm italic text-gray-500'>No review comments available.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-lg'>
            <h2 className='mb-4 text-xl font-bold text-gray-800'>Confirm Deletion</h2>
            <p className='mb-6 text-gray-600'>Are you sure you want to delete this event?</p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={closeModal}
                className='rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300'
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
  );
};

export default FacultyInbox;
