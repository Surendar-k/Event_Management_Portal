import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import EventInfo from './Tabs_in_eventcreation/EventInfo';
import Agenda from './Tabs_in_eventcreation/Agenda';
import FinancialPlanning from './Tabs_in_eventcreation/FinancialPlanning';
import FoodTravel from './Tabs_in_eventcreation/FoodTravel';
import Checklist from './Tabs_in_eventcreation/Checklist';

import {
  FaInfoCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaUtensils,
  FaCheckCircle,
} from 'react-icons/fa';

const tabs = [
  { id: 'eventInfo', label: 'Event Info', icon: <FaInfoCircle size={18} /> },
  { id: 'agenda', label: 'Agenda', icon: <FaCalendarAlt size={18} /> },
  { id: 'financialPlanning', label: 'Financial Planning', icon: <FaDollarSign size={18} /> },
  { id: 'foodTravel', label: 'Food & Travel', icon: <FaUtensils size={18} /> },
  { id: 'checklist', label: 'Checklist', icon: <FaCheckCircle size={18} /> },
];

// Initial default state
const defaultState = {
  eventInfo: {},
  startDate: '',
  endDate: '',
  agenda: { sessions: [] },
  checklist: [],
  financialPlanning: {},
  foodAndTransport: {
    meals: [],
    refreshments: [],
    travels: [],
    travelBy: 'college',
  },
};

const CreateEvent = () => {
  const { eventId } = useParams();
  const isEditMode = !!eventId;

  const [activeTab, setActiveTab] = useState('eventInfo');

  // Form states
  const [eventInfo, setEventInfo] = useState(defaultState.eventInfo);
  const [startDate, setStartDate] = useState(defaultState.startDate);
  const [endDate, setEndDate] = useState(defaultState.endDate);
  const [agenda, setAgenda] = useState(defaultState.agenda);
  const [checklist, setChecklist] = useState(defaultState.checklist);
  const [financialPlanning, setFinancialPlanning] = useState(defaultState.financialPlanning);
  const [foodAndTransport, setFoodAndTransport] = useState(defaultState.foodAndTransport);
const [loginName, setLoginName] = useState('');

  useEffect(() => {
    const resetToDefault = () => {
      setEventInfo(defaultState.eventInfo);
      setStartDate(defaultState.startDate);
      setEndDate(defaultState.endDate);
      setAgenda(defaultState.agenda);
      setChecklist(defaultState.checklist);
      setFinancialPlanning(defaultState.financialPlanning);
      setFoodAndTransport(defaultState.foodAndTransport);
      
    };

    if (isEditMode) {
      const fetchEventData = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
            credentials: 'include',
          });
        const data = await res.json();
    

          if (res.ok && data.eventinfo) {
            setEventInfo(data.eventinfo);
            setStartDate(data.eventinfo?.startDate || '');
            setEndDate(data.eventinfo?.endDate || '');
            setAgenda({ ...(data.agenda || {}), sessions: data.agenda?.sessions || [] });
            setChecklist(Array.isArray(data.checklist) ? data.checklist : []);
            setFinancialPlanning(data.financialplanning || {});
            setFoodAndTransport(data.foodandtransport || defaultState.foodAndTransport);
          } else {
            console.error('Invalid structure received for event data');
            resetToDefault();
          }
        } catch (err) {
          console.error('Error fetching event:', err);
          resetToDefault();
        }
      };

      fetchEventData();
    } else {
      // Create mode: Clear all data
      resetToDefault();
    }
  }, [eventId]);

const handleSaveAll = async () => {
  // Safely resolve the funding source
  const fundingSource =
    eventInfo.fundingSource === 'Others'
      ? eventInfo.otherFunding
      : eventInfo.fundingSource;

  // Prepare FormData
  const formData = new FormData();
  const finalEventInfo = {
    ...eventInfo,
    fundingSource, // overwrite with actual value
  };

  formData.append("eventinfo", JSON.stringify(finalEventInfo));
  formData.append("agenda", JSON.stringify(agenda));
  formData.append("financialplanning", JSON.stringify(financialPlanning));
  formData.append("foodandtransport", JSON.stringify(foodAndTransport));
  formData.append("checklist", JSON.stringify(checklist));

  // Include brochure if present
  if (agenda.brochure) {
    formData.append("brochure", agenda.brochure);
  }

  // Include event ID if editing
  if (isEditMode) {
    formData.append("event_id", parseInt(eventId));
  }

  const url = isEditMode
    ? `http://localhost:5000/api/events/${eventId}`
    : "http://localhost:5000/api/submit-event";

  const method = isEditMode ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      alert(isEditMode ? "Event updated successfully!" : "Event created successfully!");
    } else {
      alert(`Save failed: ${result.error}`);
    }
  } catch (err) {
    console.error("Save failed:", err);
    alert("An error occurred while saving the event.");
  }
};


  const renderActiveTab = () => {
    switch (activeTab) {
      case 'eventInfo':
        return (
          <EventInfo
            data={eventInfo}
            onChange={setEventInfo}
            setEventId={() => {}}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            loginName={loginName}
          />
        );
      case 'agenda':
        return (
          <Agenda
            data={agenda}
            onChange={setAgenda}
            eventId={eventId}
            eventStartDate={startDate}
            eventEndDate={endDate}
          />
        );
      case 'financialPlanning':
        return (
          <FinancialPlanning
            data={financialPlanning}
            onChange={setFinancialPlanning}
          />
        );
      case 'foodTravel':
        return (
          <FoodTravel
            data={foodAndTransport}
            onChange={setFoodAndTransport}
             eventStartDate={startDate}
            eventEndDate={endDate}
          />
        );
      case 'checklist':
        return <Checklist data={checklist} onChange={setChecklist} />;
      default:
        return null;
    }
  };
useEffect(() => {
  const fetchSession = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/session', {
        credentials: 'include'
      });
      const data = await res.json();
      setLoginName(data?.user?.faculty_name || '');
    } catch (err) {
      console.error('❌ Failed to fetch session:', err);
    }
  };

  fetchSession();
}, []);

  return (
    <div className="mx-auto mt-10 max-w-8xl text-lg rounded-2xl border p-6 shadow-xl bg-gradient-to-r from-black-100 via-white to-black-100 border-gray-300">
      <h1 className="mb-10 text-center text-5xl font-extrabold tracking-wide text-gray-800 drop-shadow-md">
      {isEditMode ? '✏️ Edit Event' : '🎉 Create New Event'}
    </h1>

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
