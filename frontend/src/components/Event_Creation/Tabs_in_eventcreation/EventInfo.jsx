import {useEffect} from 'react'
import useFormStore from '../../../store/formStore'

const colleges = {
  'College A': ['Dept A1', 'Dept A2'],
  'College B': ['Dept B1', 'Dept B2']
}
const coordinators = [
  'Dr. S. Karthik',
  'Prof. N. Priya',
  'Dr. R. Balaji',
  'Ms. K. Kavitha',
  'Mr. Arun Raj'
]
const EventInfo = ({
  loginName,
  // setEventId,
  startDate,
  endDate,
  setStartDate,
  setEndDate
}) => {
  const event = useFormStore(s => s.event)
  const {
    setEventField,
    speakers,
    selectedCoordinators,
    technicalSetup,
    participants
  } = event
  useEffect(() => {
    setEventField('departments', colleges[event.selectedCollege] || [])
  }, [event.selectedCollege, setEventField])

useEffect(() => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end >= start) {
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // include both start and end
      setEventField('numDays', diffDays);
    } else {
      setEventField('numDays', 0); // or show validation message
    }
  }
}, [startDate, endDate, setEventField]);

useEffect(() => {
  if (event.startTime && event.endTime) {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const diff = end - start;
    const hours = diff > 0 ? (diff / 60).toFixed(2) : 0;
    setEventField('numHours', hours);
  }
}, [event.startTime, event.endTime, setEventField]);


  const handleSpeakerChange = (index, field, value) => {
    event.updateSpeaker(index, field, value)
  }

  const addSpeaker = () => {
    event.setSpeakers([
      ...speakers,
      {name: '', designation: '', affiliation: '', contact: '', email: ''}
    ])
  }

  const removeSpeaker = index => {
    if (speakers.length === 1) return
    const updated = speakers.filter((_, i) => i !== index)
    event.setSpeakers(updated)
  }

  const handleChange = e => {
    const value = e.target.value

    if (value.trim()) {
      const filtered = coordinators.filter(
        name =>
          name.toLowerCase().includes(value.toLowerCase()) &&
          !selectedCoordinators.includes(name)
      )
      setEventField('filteredSuggestions', filtered)
      setEventField('showSuggestions', true)
    } else {
      setEventField('showSuggestions', false)
    }
  }

  const handleSelect = name => {
    if (!selectedCoordinators.includes(name)) {
      setEventField('selectedCoordinators', [...selectedCoordinators, name])
    }

    setEventField('showSuggestions', false)
  }

  const handleRemove = nameToRemove => {
    setEventField(
      'selectedCoordinators',
      selectedCoordinators.filter(name => name !== nameToRemove)
    )
  }
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
  value={event.title || ''}
      onChange={e => setEventField('title', e.target.value)}
      className='col-span-1 rounded border border-gray-400 p-2 text-gray-700 shadow-sm md:col-span-3'
    />

    {/* 2. Organizing Institution */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Organizing Institution</label>
      <select
        value={event.selectedCollege}
        onChange={e => setEventField('selectedCollege', e.target.value)}
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
        value={event.selectedDepartment}
        onChange={e => setEventField('selectedDepartment', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select Dept</option>
        {event.departments.map(d => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </div>

    {/* Scope */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Scope</label>
      <select
        value={event.scope}
        onChange={e => setEventField('scope', e.target.value)}
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
    value={event.venueType}
    onChange={e => setEventField('venueType', e.target.value)}
    className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
  >
    <option value=''>Select</option>
    <option>Online</option>
    <option>Offline</option>
  </select>
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>Venue Type</label>
      <select
        value={event.venueCategory}
        onChange={e => setEventField('venueCategory', e.target.value)}
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
        value={event.venue}
        onChange={e => setEventField('venue', e.target.value)}
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
        value={startDate || ''}
        min={startDate || ''}
        onChange={e => setStartDate(e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>End Date</label>
      <input
        type='date'
        value={endDate}
        max={endDate}
        onChange={e => setEndDate(e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>No. of Days</label>
      <input
        type='number'
        value={event.numDays}
        readOnly
        className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
      />
    </div>

    {/* 5. Start Time, End Time, No. of Hours */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Start Time</label>
      <input
        type='time'
        value={event.startTime || ''}
        onChange={e => setEventField('startTime', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

    <div>
      <label className='block mb-1 font-medium text-gray-700'>End Time</label>
      <input
        type='time'
        value={event.endTime || ''}
        onChange={e => setEventField('endTime', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

   <div>
  <label className='block mb-1 font-medium text-gray-700'>No. of Hours</label>
  <input
    type='number'
    value={event.numHours || ''}
    readOnly
    className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
  />
</div>


    {/* 6. Funding Source */}
    <div>
      <label className='block mb-1 font-medium text-gray-700'>Funding Source</label>
      <select
        value={event.fundingSource}
        onChange={e => setEventField('fundingSource', e.target.value)}
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Management</option>
        <option>Funding Agency</option>
        <option>Others</option>
      </select>
      {event.fundingSource === 'Others' && (
        <input
          type='text'
          value={event.otherFunding}
          onChange={e => setEventField('otherFunding', e.target.value)}
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

  {event.showSuggestions && (
    <ul className='absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow'>
      {event.filteredSuggestions.length > 0 ? (
        event.filteredSuggestions.map((name, idx) => (
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

  {/* Move this section BELOW the input + suggestions */}
  <div className='mt-2 flex flex-wrap gap-2'>
    {selectedCoordinators.map((name, idx) => (
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
        {speakers.map((speaker, index) => (
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
            {speakers.length > 1 && (
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
    <label className='mb-1 block font-medium text-gray-700'>
      Intended Audience
    </label>
    <select
      value={event.audience}
      onChange={e => setEventField('audience', e.target.value)}
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
    {(event.audience === 'Students' || event.audience === 'Both') && (
      <input
        type='number'
        placeholder='Student Count'
        value={participants.students}
        onChange={e =>
          setEventField('participants', {
            ...participants,
            students: Number(e.target.value)
          })
        }
        className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    )}

    {(event.audience === 'Faculty' || event.audience === 'Both') && (
      <input
        type='number'
        placeholder='Faculty Count'
        value={participants.faculty}
        onChange={e =>
          setEventField('participants', {
            ...participants,
            faculty: Number(e.target.value)
          })
        }
        className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    )}

    <input
      type='number'
      placeholder='Coordinator Count'
      value={participants.coordinators}
      onChange={e =>
        setEventField('participants', {
          ...participants,
          coordinators: Number(e.target.value)
        })
      }
      className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
    />

    {/* Total Count - Read-only */}
    <input
      type='number'
      placeholder='Total Count'
      value={
        (parseInt(participants.students) || 0) +
        (parseInt(participants.faculty) || 0) +
        (parseInt(participants.coordinators) || 0)
      }
      readOnly
      className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm bg-gray-100 cursor-not-allowed'
    />
  </div>
</section>


      {/* Guest Services Section */}
      {event.venueType !== 'Online' && (
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
          <label className='mb-1 block font-medium text-gray-700'>
            {label}
          </label>
          <select
            value={event.guestServices[key]}
            onChange={e =>
              setEventField('guestServices', {
                ...event.guestServices,
                [key]: e.target.value
              })
            }
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
  <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
  <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
    Technical Setup
  </h2>

  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
    {/* Audio-Visual Setup */}
    <div className='w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Audio-Visual Setup</label>
      <select
        value={technicalSetup.audioVisual || ''}
        onChange={e =>
          setEventField('technicalSetup', {
            ...technicalSetup,
            audioVisual: e.target.value
          })
        }
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Projector</option>
        <option>LED Display</option>
        <option>Microphones</option>
        <option>All of the above</option>
      </select>
    </div>

    {/* Microphone Type */}
    <div className='w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Microphone Type</label>
      <select
        value={technicalSetup.microphoneType || ''}
        onChange={e =>
          setEventField('technicalSetup', {
            ...technicalSetup,
            microphoneType: e.target.value
          })
        }
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Handheld</option>
        <option>Collar</option>
        <option>Both</option>
        <option>Not Required</option>
      </select>
    </div>

    {/* Speakers Dropdown */}
    <div className='w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Speakers</label>
      <select
        value={technicalSetup.speakers || ''}
        onChange={e =>
          setEventField('technicalSetup', {
            ...technicalSetup,
            speakers: e.target.value
          })
        }
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      >
        <option value=''>Select</option>
        <option>Yes</option>
        <option>No</option>
      </select>
    </div>

    {/* Air Conditioning Dropdown + Units */}
    <div className='lg:col-span-2 w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Air Conditioning</label>
      <div className='flex gap-4'>
        <select
          value={technicalSetup.airConditioning || ''}
          onChange={e =>
            setEventField('technicalSetup', {
              ...technicalSetup,
              airConditioning: e.target.value
            })
          }
          className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
        >
          <option value=''>Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {technicalSetup.airConditioning === 'Yes' && (
          <input
            type='number'
            placeholder='No. of Units'
            min='0'
            value={technicalSetup.airConditioningUnits || ''}
            onChange={e =>
              setEventField('technicalSetup', {
                ...technicalSetup,
                airConditioningUnits: e.target.value
              })
            }
            className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          />
        )}
      </div>
    </div>

    {/* Additional Ventilation */}
    <div className='w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Additional Ventilation</label>
      <input
        type='text'
        placeholder='Describe ventilation'
        value={technicalSetup.additionalVentilation || ''}
        onChange={e =>
          setEventField('technicalSetup', {
            ...technicalSetup,
            additionalVentilation: e.target.value
          })
        }
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>

    {/* Presentation Materials - Checkboxes in a row */}
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
              checked={technicalSetup.presentationMaterials?.includes(item) || false}
              onChange={e => {
                const selected = technicalSetup.presentationMaterials || []
                const updated = e.target.checked
                  ? [...selected, item]
                  : selected.filter(i => i !== item)
                setEventField('technicalSetup', {
                  ...technicalSetup,
                  presentationMaterials: updated
                })
              }}
              className='accent-gray-700'
            />
            {item}
          </label>
        ))}
      </div>
    </div>

    {/* Other Additional Requirements */}
    <div className='lg:col-span-3 w-full'>
      <label className='mb-1 block font-medium text-gray-700'>Other Additional Requirements</label>
      <textarea
        rows='3'
        placeholder='Specify other technical setup needs...'
        value={technicalSetup.additional || ''}
        onChange={e =>
          setEventField('technicalSetup', {
            ...technicalSetup,
            additional: e.target.value
          })
        }
        className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
      />
    </div>
  </div>
</section>

    </form>
  )
}
export default EventInfo
