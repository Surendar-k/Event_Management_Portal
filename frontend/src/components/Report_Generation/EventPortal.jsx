import { useState } from 'react';
import { FaClipboardList, FaChartBar } from 'react-icons/fa';
import ManageEvents from './ManageEvents';

import ReportGeneration from './ReportGeneration';

const EventPortal = () => {
  const [activeTab, setActiveTab] = useState('manage');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        🎓 Event Portal Management
      </h1>

      {/* Tab Buttons */}
      <div className="flex justify-center space-x-6 mb-6">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-2 rounded-full text-white ${
            activeTab === 'manage' ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <FaClipboardList className="inline mr-2" />
          Event Management
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-6 py-2 rounded-full text-white ${
            activeTab === 'report' ? 'bg-green-600' : 'bg-gray-400'
          }`}
        >
          <FaChartBar className="inline mr-2" />
          Report Generation
        </button>
      </div>

      {/* Dynamic Component Rendering */}
      <div className="bg-white p-4 shadow-lg rounded-lg">
        {activeTab === 'manage' && <ManageEvents />}
        {activeTab === 'report' && <ReportGeneration />}
      </div>
    </div>
  );
};

export default EventPortal;
