import React, { useState, useEffect } from 'react';

const Agenda = ({ eventStartDate }) => {
  // State for objectives and outcomes
  const [objectives, setObjectives] = useState('');
  const [outcomes, setOutcomes] = useState('');

  // State for brochure file
  const [brochure, setBrochure] = useState(null);

  // State for sessions and session form inputs
  const [sessions, setSessions] = useState([]);
  const [sessionDate, setSessionDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [topic, setTopic] = useState('');
  const [speakerName, setSpeakerName] = useState('');

  useEffect(() => {
    if (eventStartDate) {
      const d = new Date(eventStartDate);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      setSessionDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [eventStartDate]);

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleAddSession = () => {
    if (!sessionDate || !fromTime || !toTime || !topic || !speakerName) {
      alert('Please fill all fields for the session before adding.');
      return;
    }
    setSessions([...sessions, { sessionDate, fromTime, toTime, topic, speakerName }]);
    setFromTime('');
    setToTime('');
    setTopic('');
    setSpeakerName('');
  };

  const handleBrochureUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      e.target.value = null;
      return;
    }
    setBrochure(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (countWords(objectives) > 200) {
      alert('Objectives of event must be within 200 words.');
      return;
    }
    if (countWords(outcomes) > 200) {
      alert('Outcomes of event must be within 200 words.');
      return;
    }
    const formData = { objectives, outcomes, brochure, sessions };
    console.log('Agenda submitted:', formData);
    alert('Agenda saved successfully!');
  };

  return (
    <form
      onSubmit={handleSubmit}
       className="max-w-8xl mx-auto px-6 py-10 rounded-xl space-y-12"
      style={{ fontFeatureSettings: "'liga' 1" }}
    >
      {/* ===== Objectives & Outcomes Section ===== */}
      <section className="border border-gray-300 rounded-lg p-8 bg-gray-50 shadow-sm">
       <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-[#575757] pb-2">
          About the Event
        </h2>

        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Objectives of the Event <span className="text-gray-500 text-sm">(max 200 words)</span>
        </label>
        <textarea
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          rows={5}
          maxLength={1200}
          className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black transition shadow-sm"
          placeholder="Enter objectives..."
        />
        <p className="text-sm text-gray-500 mt-1 text-right">{countWords(objectives)} / 200 words</p>

        <label className="block text-lg font-semibold text-gray-800 mt-8 mb-2">
          Outcomes of the Event <span className="text-gray-500 text-sm">(max 200 words)</span>
        </label>
        <textarea
          value={outcomes}
          onChange={(e) => setOutcomes(e.target.value)}
          rows={5}
          maxLength={1200}
          className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black transition shadow-sm"
          placeholder="Enter outcomes..."
        />
        <p className="text-sm text-gray-500 mt-1 text-right">{countWords(outcomes)} / 200 words</p>
      </section>

      {/* ===== Brochure Upload Section ===== */}
      <section className="border border-gray-300 rounded-lg p-8 bg-gray-50 shadow-sm">
       <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-[#575757] pb-2">
          Proposed Event Brochure/Poster (PDF upload)
        </h2>
        <div className="flex items-center gap-4">
          <label
            htmlFor="brochure-upload"
            className="cursor-pointer bg-black hover:bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg shadow transition select-none"
          >
            Choose File
          </label>
          <input
            id="brochure-upload"
            type="file"
            accept="application/pdf"
            onChange={handleBrochureUpload}
            className="hidden"
          />
          <span className="text-gray-700 italic">{brochure ? brochure.name : 'No file chosen'}</span>
        </div>
      </section>

      {/* ===== Technical Session Details Section ===== */}
      <section className="border border-gray-300 rounded-lg p-8 bg-gray-50 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b border-[#575757] pb-2">Technical Session Details</h2>

        {/* Add session inputs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">From Time</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">To Time</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-md font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Session topic"
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-md font-medium text-gray-700 mb-1">Speaker Name</label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="Speaker"
              className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddSession}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg shadow transition"
            >
              + Add Session
            </button>
          </div>
        </div>

        {/* List of added sessions */}
        {sessions.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-300 mt-8">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-gray-100 text-gray-900 text-sm font-semibold border-b border-gray-300">
                <tr>
                  <th className="p-3 border-r border-gray-300">Date</th>
                  <th className="p-3 border-r border-gray-300">From Time</th>
                  <th className="p-3 border-r border-gray-300">To Time</th>
                  <th className="p-3 border-r border-gray-300">Topic</th>
                  <th className="p-3">Speaker Name</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess, idx) => (
                  <tr
                    key={idx}
                    className={`text-gray-800 text-sm border-b border-gray-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="p-3 border-r border-gray-300">
                      {new Date(sess.sessionDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3 border-r border-gray-300">{sess.fromTime}</td>
                    <td className="p-3 border-r border-gray-300">{sess.toTime}</td>
                    <td className="p-3 border-r border-gray-300">{sess.topic}</td>
                    <td className="p-3">{sess.speakerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== Submit Button ===== */}
     <div className="text-center mt-10">
  <button
    type="submit"
    className="inline-block bg-black hover:bg-gray-900 text-white font-bold text-base px-6 py-2 rounded-md shadow-md transition"
  >
    Save Agenda
  </button>
</div>

    </form>
  );
};

export default Agenda;
