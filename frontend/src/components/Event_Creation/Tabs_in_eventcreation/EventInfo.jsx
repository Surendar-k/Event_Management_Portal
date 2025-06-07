import React, { useState, useEffect } from 'react';

const colleges = {
  'College A': ['Dept A1', 'Dept A2'],
  'College B': ['Dept B1', 'Dept B2'],
};

const EventInfo = ({ loginName }) => {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [facultyCoordinators, setFacultyCoordinators] = useState('');
  const [eventNature, setEventNature] = useState('');
  const [otherNature, setOtherNature] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [otherFunding, setOtherFunding] = useState('');
  const [venueType, setVenueType] = useState('');
  const [venue, setVenue] = useState('');
  const [audience, setAudience] = useState('');
  const [scope, setScope] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numDays, setNumDays] = useState('');
  const [speakers, setSpeakers] = useState([
    { name: '', designation: '', affiliation: '', contact: '', email: '' },
  ]);
  const [participants, setParticipants] = useState({ students: '', faculty: '', total: '' });
  const [guestServices, setGuestServices] = useState({
    accommodation: '',
    transportation: '',
    dining: '',
  });

  useEffect(() => {
    setDepartments(colleges[selectedCollege] || []);
  }, [selectedCollege]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = (end - start) / (1000 * 3600 * 24);
      setNumDays(diff >= 0 ? diff + 1 : 0);
    }
  }, [startDate, endDate]);

  const handleSpeakerChange = (index, field, value) => {
    const updated = [...speakers];
    updated[index][field] = value;
    setSpeakers(updated);
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', designation: '', affiliation: '', contact: '', email: '' }]);
  };

  const removeSpeaker = (index) => {
    if (speakers.length === 1) return;
    const updated = speakers.filter((_, i) => i !== index);
    setSpeakers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      title,
      selectedCollege,
      selectedDepartment,
      loginName,
      facultyCoordinators,
      startDate,
      endDate,
      numDays,
      eventNature: eventNature === 'Others' ? otherNature : eventNature,
      fundingSource: fundingSource === 'Others' ? otherFunding : fundingSource,
      venueType,
      venue,
      audience,
      scope,
      speakers,
      participants,
      guestServices,
    };

    console.log("Saving Event Data:", eventData);
    alert("Event Info Saved!");
    // Here you can send `eventData` to backend using fetch/axios
  };
const [technicalSetup, setTechnicalSetup] = useState({
  audioVisual: '',
  speakerSystem: '',
  airConditioningType: '',
  airConditioningUnits: '',
  presentationMaterials: '',
  recording: [],
  additional: ''
});

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-8xl mx-auto px-6 py-10 rounded-xl space-y-12"
    >
      {/* Event Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-400">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-400 pb-2">
          Event Details & Scheduling
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            placeholder="Title of the Event"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-1 md:col-span-3 border border-gray-400 p-2 rounded shadow-sm text-gray-700"
          />

          <div>
            <label className="block font-medium mb-1 text-gray-700">Organizing Institution</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select College</option>
              {Object.keys(colleges).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Organizing Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select Dept</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Lead Coordinator</label>
            <input
              type="text"
              value={loginName}
              readOnly
              className="w-full border border-gray-400 p-2 rounded bg-gray-200 text-gray-800"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Faculty Coordinators</label>
            <input
              type="text"
              value={facultyCoordinators}
              onChange={(e) => setFacultyCoordinators(e.target.value)}
              placeholder="Faculty Coordinators"
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            />
          </div>

          {/* Date and Time */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">No. of Days</label>
            <input
              type="number"
              value={numDays}
              readOnly
              className="w-full border border-gray-400 p-2 rounded bg-gray-200 text-gray-800"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Nature of Event</label>
            <select
              value={eventNature}
              onChange={(e) => setEventNature(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select</option>
              <option>Seminar</option>
              <option>Symposium</option>
              <option>Hackathon</option>
              <option>Conference</option>
              <option value="Others">Others</option>
            </select>
            {eventNature === 'Others' && (
              <input
                type="text"
                value={otherNature}
                onChange={(e) => setOtherNature(e.target.value)}
                placeholder="Specify Nature"
                className="mt-2 w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
              />
            )}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Venue Type</label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Venue</label>
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select Venue</option>
              <option>Seminar Hall</option>
              <option>Auditorium</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Intended Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option>Students</option>
              <option>Faculty</option>
              <option>Both</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select</option>
              <option>Department</option>
              <option>State</option>
              <option>National</option>
              <option>International</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Funding Source</label>
            <select
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
            >
              <option value="">Select</option>
              <option>Management</option>
              <option>Funding Agency</option>
              <option>Others</option>
            </select>
            {fundingSource === 'Others' && (
              <input
                type="text"
                value={otherFunding}
                onChange={(e) => setOtherFunding(e.target.value)}
                placeholder="Specify Funding"
                className="mt-2 w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
              />
            )}
          </div>
        </div>
      </section>

      {/* Speaker Section */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-400">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-400 pb-2">
          Speaker Details
        </h2>
        {speakers.map((speaker, index) => (
          <div key={index} className="border rounded p-4 mb-6 bg-gray-200 shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-800">
              Speaker {index + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['name', 'designation', 'affiliation', 'contact', 'email'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize text-gray-700">
                    {field}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    placeholder={`Enter ${field}`}
                    value={speaker[field]}
                    onChange={(e) => handleSpeakerChange(index, field, e.target.value)}
                    className="border border-gray-400 p-2 rounded w-full shadow-sm text-gray-700"
                  />
                </div>
              ))}
            </div>
            {speakers.length > 1 && (
              <button
                type="button"
                onClick={() => removeSpeaker(index)}
                className="mt-4 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSpeaker}
          className="text-gray-800 border border-gray-800 px-4 py-2 rounded hover:bg-gray-800 hover:text-white"
        >
          + Add Speaker
        </button>
      </section>

      {/* Participants Section */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-400">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-400 pb-2">
          Estimated Participation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Student Participation"
            value={participants.students}
            onChange={(e) => setParticipants({ ...participants, students: e.target.value })}
            className="border border-gray-400 p-2 rounded shadow-sm text-gray-700"
          />
          <input
            type="number"
            placeholder="Faculty Participation"
            value={participants.faculty}
            onChange={(e) => setParticipants({ ...participants, faculty: e.target.value })}
            className="border border-gray-400 p-2 rounded shadow-sm text-gray-700"
          />
          <input
            type="number"
            placeholder="Total Attendees"
            value={participants.total}
            onChange={(e) => setParticipants({ ...participants, total: e.target.value })}
            className="border border-gray-400 p-2 rounded shadow-sm text-gray-700"
          />
        </div>
      </section>

      {/* Guest Services Section */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-400">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-400 pb-2">
          Guest Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'accommodation', label: 'Guest Accommodation' },
            { key: 'transportation', label: 'Guest Transportation' },
            { key: 'dining', label: 'Dining Arrangements' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block font-medium mb-1 text-gray-700">{label}</label>
              <select
                value={guestServices[key]}
                onChange={(e) => setGuestServices({ ...guestServices, [key]: e.target.value })}
                className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
              >
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    {/* Technical Setup Section */}
<section className="bg-white p-6 rounded-lg shadow-md border border-gray-400">
  <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-400 pb-2">
    Technical Setup
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {/* Audio-Visual Setup */}
    <div>
      <label className="block font-medium mb-1 text-gray-700">Audio-Visual Setup</label>
      <select
        value={technicalSetup.audioVisual}
        onChange={(e) =>
          setTechnicalSetup({ ...technicalSetup, audioVisual: e.target.value })
        }
        className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
      >
        <option value="">Select</option>
        <option>Projector</option>
        <option>LED Display</option>
        <option>Microphones</option>
        <option>All of the above</option>
      </select>
    </div>

    {/* Speaker System */}
    <div>
      <label className="block font-medium mb-1 text-gray-700">Speakers</label>
      <select
        value={technicalSetup.speakerSystem}
        onChange={(e) =>
          setTechnicalSetup({ ...technicalSetup, speakerSystem: e.target.value })
        }
        className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
      >
        <option value="">Select</option>
        <option>Mono</option>
        <option>Stereo</option>
        <option>Surround</option>
      </select>
    </div>

    {/* Air Conditioner & Ventilation */}
    <div className="col-span-1 lg:col-span-2">
      <label className="block font-medium mb-1 text-gray-700">
        Air Conditioner & Ventilation
      </label>
      <div className="flex gap-4">
        <select
          value={technicalSetup.airConditioningType}
          onChange={(e) =>
            setTechnicalSetup({ ...technicalSetup, airConditioningType: e.target.value })
          }
          className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
        >
          <option value="">Select Type</option>
          <option>Air Conditioner</option>
          <option>Fans Only</option>
          <option>Natural Ventilation</option>
        </select>
        <input
          type="number"
          placeholder="No. of Units"
          min="0"
          value={technicalSetup.airConditioningUnits || ''}
          onChange={(e) =>
            setTechnicalSetup({ ...technicalSetup, airConditioningUnits: e.target.value })
          }
          className="w-1/2 border border-gray-400 p-2 rounded shadow-sm text-gray-700"
        />
      </div>
    </div>

    {/* Presentation Materials */}
    <div>
      <label className="block font-medium mb-1 text-gray-700">
        Presentation Materials
      </label>
      <select
        value={technicalSetup.presentationMaterials}
        onChange={(e) =>
          setTechnicalSetup({ ...technicalSetup, presentationMaterials: e.target.value })
        }
        className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
      >
        <option value="">Select</option>
        <option>Projector & Screen</option>
        <option>Whiteboard & Markers</option>
        <option>All of the above</option>
      </select>
    </div>

    {/* Recording & Documentation */}
    <div className="lg:col-span-2">
      <label className="block font-medium mb-1 text-gray-700">
        Recording & Documentation
      </label>
      <div className="grid grid-cols-2 gap-2">
        {['Photography', 'Videography', 'Professional Lighting', 'Live Stream'].map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={technicalSetup.recording?.includes(option) || false}
              onChange={(e) => {
                const selected = technicalSetup.recording || [];
                const updated = e.target.checked
                  ? [...selected, option]
                  : selected.filter((item) => item !== option);
                setTechnicalSetup({ ...technicalSetup, recording: updated });
              }}
              className="accent-gray-700"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* Additional Needs */}
    <div className="lg:col-span-3">
      <label className="block font-medium mb-1 text-gray-700">Additional Technical Requirements</label>
      <textarea
        rows="3"
        placeholder="Enter any additional setup required..."
        value={technicalSetup.additional || ''}
        onChange={(e) =>
          setTechnicalSetup({ ...technicalSetup, additional: e.target.value })
        }
        className="w-full border border-gray-400 p-2 rounded shadow-sm text-gray-700"
      />
    </div>
  </div>
</section>


      {/* Submit Button */}
      <div className="text-center pt-4">
        <button
          type="submit"
          className="bg-gray-800 text-white px-8 py-2 rounded hover:bg-gray-600 transition"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EventInfo;
