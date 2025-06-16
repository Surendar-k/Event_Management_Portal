import { useEffect } from 'react';

const colleges = {
  'College A': ['Dept A1', 'Dept A2'],
  'College B': ['Dept B1', 'Dept B2']
};

const coordinators = [
  'Dr. S. Karthik',
  'Prof. N. Priya',
  'Dr. R. Balaji',
  'Ms. K. Kavitha',
  'Mr. Arun Raj'
];

const EventInfo = ({
  loginName,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  data = {},
  onChange
}) => {
  const setField = (key, value) => onChange({ ...data, [key]: value });

  const updateNested = (key, subKey, value) => {
    onChange({
      ...data,
      [key]: {
        ...data[key],
        [subKey]: value
      }
    });
  };

  useEffect(() => {
    setField('departments', colleges[data.selectedCollege] || []);
  }, [data.selectedCollege]);

 useEffect(() => {  
  if (startDate !== data.startDate) {
    setField('startDate', startDate);
  }
  if (endDate !== data.endDate) {
    setField('endDate', endDate);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = end >= start ? Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 : 0;
    setField('numDays', diffDays);
  }
}, [startDate, endDate]);


useEffect(() => {
    if (data.startTime && data.endTime) {
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      const diff = (endH * 60 + endM) - (startH * 60 + startM);
      const hours = diff > 0 ? (diff / 60).toFixed(2) : 0;
      setField('numHours', hours);
    }
  }, [data.startTime, data.endTime]);

  const handleSpeakerChange = (index, field, value) => {
    const updated = [...(data.speakers || [])];
    updated[index][field] = value;
    setField('speakers', updated);
  };

  const addSpeaker = () => {
    const updated = [...(data.speakers || []), { name: '', designation: '', affiliation: '', contact: '', email: '' }];
    setField('speakers', updated);
  };

  const removeSpeaker = (index) => {
    const updated = [...(data.speakers || [])];
    if (updated.length > 1) {
      updated.splice(index, 1);
      setField('speakers', updated);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.trim()) {
      const filtered = coordinators.filter(
        name => name.toLowerCase().includes(value.toLowerCase()) &&
          !(data.selectedCoordinators || []).includes(name)
      );
      onChange({ ...data, filteredSuggestions: filtered, showSuggestions: true });
    } else {
      onChange({ ...data, showSuggestions: false });
    }
  };

  const handleSelect = (name) => {
  const updated = [...(data.selectedCoordinators || []), name];

  onChange({
    ...data,
    selectedCoordinators: updated,
    filteredSuggestions: [],
    showSuggestions: false
  });
};


 const handleRemove = (nameToRemove) => {
  const updated = (data.selectedCoordinators || []).filter(name => name !== nameToRemove);

  onChange({
    ...data,
    selectedCoordinators: updated
  });
};

 
  return (
    <form className='max-w-8xl mx-auto space-y-12 rounded-xl px-6 py-10'>
      {/* Event Details Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
  <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
    Event Details & Scheduling
  </h2>

  <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
    {/* 1. Title */}
    <input
       type='text'
  placeholder='Title of the Event'
  value={data.title || ''}
      onChange={e => setField('title', e.target.value)}
      className='col-span-1 rounded border border-gray-400 p-2 text-gray-700 shadow-sm md:col-span-3'
    />

    {/* 2. Organizing Institution */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Organizing Institution</label>
      <select
        value={data.selectedCollege}
        onChange={e => setField('selectedCollege', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select College</option>
        {Object.keys(colleges).map(c => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>

   {/* Organizing Department */}
<div>
  <label className='block mb-1 font-medium text-gray-700'>Organizing Department</label>
  <select
    value={data.selectedDepartment}
    onChange={e => setField('selectedDepartment', e.target.value)}
    className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
  >
    <option value=''>Select Dept</option>
    {(data.departments || []).map(d => (
      <option key={d}>{d}</option>
    ))}
  </select>
</div>


    {/* Scope */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Scope</label>
      <select
        value={data.scope}
        onChange={e => setField('scope', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Department</option>
        <option>State</option>
        <option>National</option>
        <option>International</option>
      </select>
    </div>

    {/* 3. Venue Mode, Venue Type, Venue */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Venue Mode</label>
      <select
    value={data.venueType}
    onChange={e => setField('venueType', e.target.value)}
    className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
  >
    <option value=''>Select</option>
    <option>Online</option>
    <option>Offline</option>
  </select>
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>Mode of Conduct</label>
      <select
        value={data.venueCategory}
        onChange={e => setField('venueCategory', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>On-Campus</option>
        <option>Off-Campus</option>
      </select>
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>Venue</label>
      <select
        value={data.venue}
        onChange={e => setField('venue', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select Venue</option>
        <option>Seminar Hall</option>
        <option>Auditorium</option>
      </select>
    </div>

    {/* 4. Start Date, End Date, No. of Days */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Start Date</label>
     <input
  type='date'
  value={data.startDate || ''}
  onChange={e => {
    setStartDate(e.target.value);
    setField('startDate', e.target.value);
  }}
  className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
/>
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>End Date</label>
      <input
  type='date'
  value={data.endDate || ''}
  onChange={e => {
    setEndDate(e.target.value);
    setField('endDate', e.target.value);
  }}
  className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
/>
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>No. of Days</label>
      <input
        type='number'
        value={data.numDays}
         onChange={e => setField('numDays', e.target.value)}
        readOnly
        className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
      />
    </div>

    {/* 5. Start Time, End Time, No. of Hours */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Start Time</label>
      <input
         type='time'
            value={data.startTime || ''}
            onChange={e => setField('startTime', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>End Time</label>
      <input
         type='time'
            value={data.endTime || ''}
            onChange={e => setField('endTime', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

   <div>
  <label className='block mb-1 font-medium text-gray-700'>No. of Hours</label>
  <input
    type='number'
         value={data.numHours ?? ''}

    readOnly
    className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
  />
</div>


    {/* 6. Funding Source */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Funding Source</label>
      <select
        value={data.fundingSource}
        onChange={e => setField('fundingSource', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Management</option>
        <option>Funding Agency</option>
        <option>Others</option>
      </select>
      {data.fundingSource === 'Others' && (
        <input
          type='text'
          value={data.otherFunding}
          onChange={e => setField('otherFunding', e.target.value)}
          placeholder='Specify Funding'
          className='mt-2 w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
        />
      )}
    </div>

    {/* 7. Lead Coordinator */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Lead Coordinator</label>
      <input
        type='text'
        value={loginName}
        readOnly
        className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
      />
    </div>

 {/* Faculty Coordinators */}
      <div className='relative'>
        <label className='block mb-1 font-medium text-gray-700'>Faculty Coordinators</label>
        <input
          type='text'
          onChange={handleChange}
          className='w-full rounded border border-gray-400 p-2 text-gray-800'
          placeholder='Type a name...'
        />
        {data.showSuggestions && (
          <ul className='absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow'>
            {data.filteredSuggestions && data.filteredSuggestions.length > 0 ? (
              data.filteredSuggestions.map((name, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(name)}
                  className='cursor-pointer p-2 hover:bg-gray-100'
                >
                  {name}
                </li>
              ))
            ) : (
              <li className='p-2 text-gray-500'>No matches found</li>
            )}
          </ul>
        )}
       <div className='mt-2 flex flex-wrap gap-2'>
  {(data.selectedCoordinators || []).map((name, idx) => (
    <span
      key={idx}
      className='flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-800'
    >
      {name}
      <button
        type='button'
        onClick={() => handleRemove(name)}
        className='font-bold text-red-500 hover:text-red-700'
      >
        ×
      </button>
    </span>
  ))}
</div>

      </div>

  </div>
</section>


       {/* Speaker Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Speaker Details
        </h2>
        {(data.speakers || []).map((speaker, index) => (
          <div
            key={index}
            className='mb-6 rounded border bg-gray-200 p-4 shadow-sm'
          >
            <h3 className='mb-3 font-semibold text-gray-800'>
              Speaker {index + 1}
            </h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {['name', 'designation', 'affiliation', 'contact', 'email'].map(
                field => (
                  <div key={field}>
                    <label className='block text-sm font-medium text-gray-700 capitalize'>
                      {field}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={`Enter ${field}`}
                      value={speaker[field]}
                      onChange={e =>
                        handleSpeakerChange(index, field, e.target.value)
                      }
                      className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
                    />
                  </div>
                )
              )}
            </div>
            {(data.speakers || []).length > 1 && (
              <button
                type='button'
                onClick={() => removeSpeaker(index)}
                className='mt-4 text-red-600 hover:text-red-800'
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type='button'
          onClick={addSpeaker}
          className='rounded border border-gray-800 px-4 py-2 text-gray-800 hover:bg-gray-800 hover:text-white'
        >
          + Add Speaker
        </button>
      </section>

{/* Estimated Participation Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Estimated Participation
        </h2>

        {/* Audience Dropdown */}
        <div className='mb-6'>
          <label className='mb-1 block font-medium text-gray-700'>Intended Audience</label>
          <select
            value={data.audience}
            onChange={e => setField('audience', e.target.value)}
            className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          >
            <option value=''>Select</option>
            <option value='Students'>Students</option>
            <option value='Faculty'>Faculty</option>
            <option value='Both'>Both</option>
          </select>
        </div>

        {/* Input Fields */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {(data.audience === 'Students' || data.audience === 'Both') && (
            <input
              type='number'
              placeholder='Student Count'
              value={data.participants?.students || ''}
              onChange={e => updateNested('participants', 'students', Number(e.target.value))}
              className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          )}

          {(data.audience === 'Faculty' || data.audience === 'Both') && (
            <input
              type='number'
              placeholder='Faculty Count'
              value={data.participants?.faculty || ''}
              onChange={e => updateNested('participants', 'faculty', Number(e.target.value))}
              className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          )}

          <input
            type='number'
            placeholder='Coordinator Count'
            value={data.participants?.coordinators || ''}
            onChange={e => updateNested('participants', 'coordinators', Number(e.target.value))}
            className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          />

          {/* Total Count - Read-only */}
          <input
            type='number'
            placeholder='Total Count'
            value={
              (parseInt(data.participants?.students) || 0) +
              (parseInt(data.participants?.faculty) || 0) +
              (parseInt(data.participants?.coordinators) || 0)
            }
            readOnly
            className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm bg-gray-100 cursor-not-allowed'
          />
        </div>
      </section>

     {data.venueType !== 'Online' && (
        <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md mt-6'>
          <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
            Guest Services
          </h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[
              { key: 'accommodation', label: 'Guest Accommodation' },
              { key: 'transportation', label: 'Guest Transportation' },
              { key: 'dining', label: 'Dining Arrangements' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className='mb-1 block font-medium text-gray-700'>{label}</label>
                <select
                  value={data.guestServices?.[key] || ''}
                  onChange={e => updateNested('guestServices', key, e.target.value)}
                  className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
                >
                  <option value=''>Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            ))}
          </div>
        </section>
)}
 {/* Technical Setup Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Technical Setup
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Audio-Visual Setup</label>
            <select
              value={data.technicalSetup?.audioVisual || ''}
              onChange={e => updateNested('technicalSetup', 'audioVisual', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Projector</option>
              <option>LED Display</option>
              <option>All of the above</option>
            </select>
          </div>

          <div className='w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Microphone Type</label>
            <select
              value={data.technicalSetup?.microphoneType || ''}
              onChange={e => updateNested('technicalSetup', 'microphoneType', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Handheld</option>
              <option>Collar</option>
              <option>Both</option>
              <option>Not Required</option>
            </select>
          </div>

          <div className='w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Speakers</label>
            <select
              value={data.technicalSetup?.speakers || ''}
              onChange={e => updateNested('technicalSetup', 'speakers', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          <div className='lg:col-span-2 w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Air Conditioning</label>
            <div className='flex gap-4'>
              <select
                value={data.technicalSetup?.airConditioning || ''}
                onChange={e => updateNested('technicalSetup', 'airConditioning', e.target.value)}
                className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
              >
                <option value=''>Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
              {data.technicalSetup?.airConditioning === 'Yes' && (
                <input
                  type='number'
                  placeholder='No. of Units'
                  min='0'
                  value={data.technicalSetup?.airConditioningUnits || ''}
                  onChange={e => updateNested('technicalSetup', 'airConditioningUnits', e.target.value)}
                  className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
                />
              )}
            </div>
          </div>

          <div className='w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Additional Ventilation</label>
            <input
              type='text'
              placeholder='Describe ventilation'
              value={data.technicalSetup?.additionalVentilation || ''}
              onChange={e => updateNested('technicalSetup', 'additionalVentilation', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          </div>

          <div className='lg:col-span-3 w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Presentation Materials</label>
            <div className='flex flex-wrap gap-4'>
              {[
                'Projector & Screen',
                'Whiteboard & Markers',
                'Laser Pointer',
                'Flip Charts',
                'All of the above'
              ].map(item => (
                <label key={item} className='flex items-center gap-2 whitespace-nowrap'>
                  <input
                    type='checkbox'
                    checked={data.technicalSetup?.presentationMaterials?.includes(item) || false}
                    onChange={e => {
                      const selected = data.technicalSetup?.presentationMaterials || [];
                      const updated = e.target.checked
                        ? [...selected, item]
                        : selected.filter(i => i !== item);
                      updateNested('technicalSetup', 'presentationMaterials', updated);
                    }}
                    className='accent-gray-700'
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div className='lg:col-span-3 w-full'>
            <label className='mb-1 block font-medium text-gray-700'>Other Additional Requirements</label>
            <textarea
              rows='3'
              placeholder='Specify other technical setup needs...'
              value={data.technicalSetup?.additional || ''}
              onChange={e => updateNested('technicalSetup', 'additional', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          </div>
        </div>
      </section>

    </form>
  )
}
export default EventInfo