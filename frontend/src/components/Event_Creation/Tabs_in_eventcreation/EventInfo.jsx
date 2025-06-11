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
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diff = (end - start) / (1000 * 3600 * 24)
      setEventField('numDays', diff >= 0 ? diff + 1 : 0)
    }
  }, [startDate, endDate, setEventField])

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
          <input
            type='text'
            placeholder='Title of the Event'
            value={event.title}
            onChange={e => setEventField('title', e.target.value)}
            className='col-span-1 rounded border border-gray-400 p-2 text-gray-700 shadow-sm md:col-span-3'
          />

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Organizing Institution
            </label>
            <select
              value={event.selectedCollege}
              onChange={e => setEventField('selectedCollege', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select College</option>
              {Object.keys(colleges).map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Organizing Department
            </label>
            <select
              value={event.selectedDepartment}
              onChange={e =>
                setEventField('selectedDepartment', e.target.value)
              }
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select Dept</option>
              {event.departments.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Lead Coordinator
            </label>
            <input
              type='text'
              value={loginName}
              readOnly
              className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
            />
          </div>

          <div className='relative'>
            <label className='mb-1 block font-medium text-gray-700'>
              Faculty Coordinators
            </label>

            <div className='mb-2 flex flex-wrap gap-2'>
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
          </div>

          {/* Date and Time */}
          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Start Date
            </label>
            <input
              type='date'
              value={startDate}
              min={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              End Date
            </label>
            <input
              type='date'
              value={endDate}
              max={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            />
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              No. of Days
            </label>
            <input
              type='number'
              value={event.numDays}
              readOnly
              className='w-full rounded border border-gray-400 bg-gray-200 p-2 text-gray-800'
            />
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Nature of Event
            </label>
            <select
              value={event.eventNature}
              onChange={e => setEventField('eventNature', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Seminar</option>
              <option>Symposium</option>
              <option>Hackathon</option>
              <option>Conference</option>
              <option value='Others'>Others</option>
            </select>
            {event.eventNature === 'Others' && (
              <input
                type='text'
                value={event.otherNature}
                onChange={e => setEventField('otherNature', e.target.value)}
                placeholder='Specify Nature'
                className='mt-2 w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
              />
            )}
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Venue Type
            </label>
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
            <label className='mb-1 block font-medium text-gray-700'>
              Venue
            </label>
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

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Intended Audience
            </label>
            <select
              value={event.audience}
              onChange={e => setEventField('audience', e.target.value)}
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option>Students</option>
              <option>Faculty</option>
              <option>Both</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Scope
            </label>
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

          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Funding Source
            </label>
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

      {/* Participants Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Estimated Participation
        </h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <input
            type='number'
            placeholder='Student Participation'
            value={participants.students}
            onChange={e =>
              setEventField('participants', {
                ...participants,
                students: e.target.value
              })
            }
            className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          />
          <input
            type='number'
            placeholder='Faculty Participation'
            value={participants.faculty}
            onChange={e =>
              setEventField('participants', {
                ...participants,
                faculty: e.target.value
              })
            }
            className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          />
          <input
            type='number'
            placeholder='Total Attendees'
            value={participants.total}
            onChange={e =>
              setEventField('participants', {
                ...participants,
                total: e.target.value
              })
            }
            className='rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
          />
        </div>
      </section>

      {/* Guest Services Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Guest Services
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {[
            {key: 'accommodation', label: 'Guest Accommodation'},
            {key: 'transportation', label: 'Guest Transportation'},
            {key: 'dining', label: 'Dining Arrangements'}
          ].map(({key, label}) => (
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
      {/* Technical Setup Section */}
      <section className='rounded-lg border border-gray-400 bg-white p-6 shadow-md'>
        <h2 className='mb-4 border-b border-gray-400 pb-2 text-2xl font-bold text-gray-800'>
          Technical Setup
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Audio-Visual Setup */}
          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Audio-Visual Setup
            </label>
            <select
              value={technicalSetup.audioVisual}
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

          {/* Speaker System */}
          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Speakers
            </label>
            <select
              value={technicalSetup.speakerSystem}
              onChange={e =>
                setEventField('technicalSetup', {
                  ...technicalSetup,
                  speakerSystem: e.target.value
                })
              }
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Mono</option>
              <option>Stereo</option>
              <option>Surround</option>
            </select>
          </div>

          {/* Air Conditioner & Ventilation */}
          <div className='col-span-1 lg:col-span-2'>
            <label className='mb-1 block font-medium text-gray-700'>
              Air Conditioner & Ventilation
            </label>
            <div className='flex gap-4'>
              <select
                value={technicalSetup.airConditioningType}
                onChange={e =>
                  setEventField('technicalSetup', {
                    ...technicalSetup,
                    airConditioningType: e.target.value
                  })
                }
                className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
              >
                <option value=''>Select Type</option>
                <option>Air Conditioner</option>
                <option>Fans Only</option>
                <option>Natural Ventilation</option>
              </select>
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
                className='w-1/2 rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
              />
            </div>
          </div>

          {/* Presentation Materials */}
          <div>
            <label className='mb-1 block font-medium text-gray-700'>
              Presentation Materials
            </label>
            <select
              value={technicalSetup.presentationMaterials}
              onChange={e =>
                setEventField('technicalSetup', {
                  ...technicalSetup,
                  presentationMaterials: e.target.value
                })
              }
              className='w-full rounded border border-gray-400 p-2 text-gray-700 shadow-sm'
            >
              <option value=''>Select</option>
              <option>Projector & Screen</option>
              <option>Whiteboard & Markers</option>
              <option>All of the above</option>
            </select>
          </div>

          {/* Recording & Documentation */}
          <div className='lg:col-span-2'>
            <label className='mb-1 block font-medium text-gray-700'>
              Recording & Documentation
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {[
                'Photography',
                'Videography',
                'Professional Lighting',
                'Live Stream'
              ].map(option => (
                <label key={option} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={
                      technicalSetup.recording?.includes(option) || false
                    }
                    onChange={e => {
                      const selected = technicalSetup.recording || []
                      const updated = e.target.checked
                        ? [...selected, option]
                        : selected.filter(item => item !== option)
                      setEventField('technicalSetup', {
                        ...technicalSetup,
                        recording: updated
                      })
                    }}
                    className='accent-gray-700'
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Additional Needs */}
          <div className='lg:col-span-3'>
            <label className='mb-1 block font-medium text-gray-700'>
              Additional Technical Requirements
            </label>
            <textarea
              rows='3'
              placeholder='Enter any additional setup required...'
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
