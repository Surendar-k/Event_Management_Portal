import { useState, } from 'react';

import {
  FaInfoCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaUtensils,
  FaCheckCircle,
} from 'react-icons/fa';

import EventInfo from './Tabs_in_eventcreation/EventInfo';
import Agenda from './Tabs_in_eventcreation/Agenda';
import FinancialPlanning from './Tabs_in_eventcreation/FinancialPlanning';
import FoodTravel from './Tabs_in_eventcreation/FoodTravel';
import Checklist from './Tabs_in_eventcreation/Checklist';

const tabs = [
  { id: 'eventInfo', label: 'Event Info', icon: <FaInfoCircle size={18} /> },
  { id: 'agenda', label: 'Agenda', icon: <FaCalendarAlt size={18} /> },
  { id: 'financialPlanning', label: 'Financial Planning', icon: <FaDollarSign size={18} /> },
  { id: 'foodTravel', label: 'Food & Travel', icon: <FaUtensils size={18} /> },
  { id: 'checklist', label: 'Checklist', icon: <FaCheckCircle size={18} /> },
];

const CreateEvent = () => {
  const [activeTab, setActiveTab] = useState('eventInfo');
  const [eventId, setEventId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [eventData, setEventData] = useState({
    eventInfo: {
      title: '',
      date: '',
      location: '',
      startDate: '',
      endDate: '',
    },
    agenda: {
      objectives: '',
      outcomes: '',
      brochure: null,
      sessions: [],
    },
    financialPlanning: { budget: '', expenses: [], startDate: '', endDate: '' },
    foodTravel: {
      foodArrangements: '',
      travelDetails: '',
      startDate: '',
      endDate: '',
    },
    checklist: [],
  });

  const updateSection = (section, data) => {
    setEventData((prev) => ({
      ...prev,
      [section]: data,
    }));
    if (section === 'eventInfo') {
      if (data.startDate) setStartDate(data.startDate);
      if (data.endDate) setEndDate(data.endDate);
    }
  };

 


  const handleSaveAll = async () => {
    try {
      const payload = {
        
        eventinfo: eventData.eventInfo,
        agenda: eventData.agenda,
        financialplanning: eventData.financialPlanning,
        foodandtransport: eventData.foodTravel,
        checklist: eventData.checklist,
      };

      const response = await fetch('http://localhost:5000/api/submit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Event saved successfully!');
      } else {
        alert(`Save failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('An error occurred while saving the event.');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'eventInfo':
        return (
          <EventInfo
            data={eventData.eventInfo}
            onChange={(data) => updateSection('eventInfo', data)}
            setEventId={setEventId}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        );
      case 'agenda':
        return (
          <Agenda
            data={eventData.agenda}
            onChange={(data) => updateSection('agenda', data)}
            eventId={eventId}
            eventStartDate={startDate}
            eventEndDate={endDate}
          />
        );
      case 'financialPlanning':
        return (
          <FinancialPlanning
            data={eventData.financialPlanning}
            onChange={(data) => updateSection('financialPlanning', data)}
            eventId={eventId}
          />
        );
      case 'foodTravel':
        return (
          <FoodTravel
            data={eventData.foodTravel}
            onChange={(data) => updateSection('foodTravel', data)}
            eventId={eventId}
          />
        );
      case 'checklist':
        return (
          <Checklist
            data={eventData.checklist}
            onChange={(data) => updateSection('checklist', data)}
            eventId={eventId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-7xl rounded-2xl border p-6 shadow-xl bg-gradient-to-r from-gray-100 via-white to-gray-100 border-gray-300">
      <h1 className="mb-8 text-center text-4xl font-extrabold text-gray-700">Create New Event</h1>

      <nav className="mb-10 flex flex-wrap justify-center gap-6 border-b-4 pb-4 border-gray-300">
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-t-xl shadow-md transition-transform duration-300 ${
                isActive
                  ? 'bg-gray-700 text-white border-b-4 border-gray-300 scale-105'
                  : 'text-gray-700 bg-transparent'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <section
        id={`${activeTab}-panel`}
        className="min-h-[350px] rounded-xl border p-8 shadow-inner bg-white border-gray-300 text-gray-700"
      >
        {renderActiveTab()}
      </section>

      <div className="mt-6 text-center">
        <button
          onClick={handleSaveAll}
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:bg-green-700"
        >
          Save All
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
