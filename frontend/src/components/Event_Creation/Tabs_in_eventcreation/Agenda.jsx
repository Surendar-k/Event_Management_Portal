import {useState, useEffect} from 'react'

const Agenda = ({eventStartDate}) => {
  const [objectives, setObjectives] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [brochure, setBrochure] = useState(null)

  const [sessions, setSessions] = useState([])

  // Session input fields
  const [sessionDate, setSessionDate] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [topic, setTopic] = useState('')
  const [speakerName, setSpeakerName] = useState('')



  // Count words helper
  const countWords = text => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  // Set initial sessionDate on eventStartDate change
  useEffect(() => {
    if (eventStartDate) {
      const d = new Date(eventStartDate)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      setSessionDate(`${yyyy}-${mm}-${dd}`)
    }
  }, [eventStartDate])

 
  const handleAddSession = () => {
    if (!sessionDate || !fromTime || !toTime || !topic || !speakerName) {
      alert('Please fill all fields for the session before adding.')
      return
    }
    setSessions([
      ...sessions,
      {sessionDate, fromTime, toTime, topic, speakerName}
    ])
    setFromTime('')
    setToTime('')
    setTopic('')
    setSpeakerName('')
  }

  const handleBrochureUpload = e => {
    const file = e.target.files[0]
    if (file && file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.')
      e.target.value = null
      return
    }
    setBrochure(file)
  }

  
  return (
    <form
     
      className='max-w-8xl mx-auto space-y-12 rounded-xl px-6 py-10'
      style={{fontFeatureSettings: "'liga' 1"}}
    >
      {/* Objectives & Outcomes Section */}
      <section className='rounded-lg border border-gray-300 bg-gray-50 p-8 shadow-sm'>
        <h2 className='mb-4 border-b border-[#575757] pb-2 text-2xl font-bold text-gray-900'>
          About the Event
        </h2>

        <label className='mb-2 block text-lg font-semibold text-gray-800'>
          Objectives of the Event{' '}
          <span className='text-sm text-gray-500'>(max 200 words)</span>
        </label>
        <textarea
          value={objectives}
          onChange={e => setObjectives(e.target.value)}
          rows={5}
          maxLength={1200}
          className='w-full rounded-lg border border-gray-300 p-4 shadow-sm transition focus:ring-2 focus:ring-black focus:outline-none'
          placeholder='Enter objectives...'
        />
        <p className='mt-1 text-right text-sm text-gray-500'>
          {countWords(objectives)} / 200 words
        </p>

        <label className='mt-8 mb-2 block text-lg font-semibold text-gray-800'>
          Outcomes of the Event{' '}
          <span className='text-sm text-gray-500'>(max 200 words)</span>
        </label>
        <textarea
          value={outcomes}
          onChange={e => setOutcomes(e.target.value)}
          rows={5}
          maxLength={1200}
          className='w-full rounded-lg border border-gray-300 p-4 shadow-sm transition focus:ring-2 focus:ring-black focus:outline-none'
          placeholder='Enter outcomes...'
        />
        <p className='mt-1 text-right text-sm text-gray-500'>
          {countWords(outcomes)} / 200 words
        </p>
      </section>

      {/* Brochure Upload Section */}
      <section className='rounded-lg border border-gray-300 bg-gray-50 p-8 shadow-sm'>
        <h2 className='mb-4 border-b border-[#575757] pb-2 text-2xl font-bold text-gray-900'>
          Proposed Event Brochure/Poster (PDF upload)
        </h2>
        <div className='flex items-center gap-4'>
          <label
            htmlFor='brochure-upload'
            className='cursor-pointer rounded-lg bg-black px-6 py-2 font-semibold text-white shadow transition select-none hover:bg-gray-900'
          >
            Choose File
          </label>
          <input
            id='brochure-upload'
            type='file'
            accept='application/pdf'
            onChange={handleBrochureUpload}
            className='hidden'
          />
          <span className='text-gray-700 italic'>
            {brochure ? brochure.name : 'No file chosen'}
          </span>
        </div>
      </section>

      {/* Technical Session Details Section */}
      <section className='rounded-lg border border-gray-300 bg-gray-50 p-8 shadow-sm'>
        <h2 className='mb-4 border-b border-[#575757] pb-2 text-2xl font-bold text-gray-900'>
          Technical Session Details
        </h2>

        {/* Add session inputs */}
        <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-6'>
          <div>
            <label className='text-md mb-1 block font-medium text-gray-700'>
              Date
            </label>
            <input
              type='date'
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-black focus:outline-none'
            />
          </div>

          <div>
            <label className='text-md mb-1 block font-medium text-gray-700'>
              From Time
            </label>
            <input
              type='time'
              value={fromTime}
              onChange={e => setFromTime(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-black focus:outline-none'
            />
          </div>

          <div>
            <label className='text-md mb-1 block font-medium text-gray-700'>
              To Time
            </label>
            <input
              type='time'
              value={toTime}
              onChange={e => setToTime(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-black focus:outline-none'
            />
          </div>

          <div className='md:col-span-1'>
            <label className='text-md mb-1 block font-medium text-gray-700'>
              Topic
            </label>
            <input
              type='text'
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder='Session topic'
              className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-black focus:outline-none'
            />
          </div>

          <div className='md:col-span-1'>
            <label className='text-md mb-1 block font-medium text-gray-700'>
              Speaker Name
            </label>
            <input
              type='text'
              value={speakerName}
              onChange={e => setSpeakerName(e.target.value)}
              placeholder='Speaker'
              className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-black focus:outline-none'
            />
          </div>

          <div>
            <button
              type='button'
              onClick={handleAddSession}
              className='w-full rounded-lg bg-black py-3 font-semibold text-white shadow transition hover:bg-gray-900'
            >
              + Add Session
            </button>
          </div>
        </div>

        {/* List of added sessions */}
        {sessions.length > 0 && (
          <div className='mt-8 overflow-x-auto rounded-lg border border-gray-300 shadow-md'>
            <table className='w-full min-w-[700px] border-collapse text-left'>
              <thead className='border-b border-gray-300 bg-gray-100 text-sm font-semibold text-gray-900'>
                <tr>
                  <th className='border-r border-gray-300 p-3'>Date</th>
                  <th className='border-r border-gray-300 p-3'>From Time</th>
                  <th className='border-r border-gray-300 p-3'>To Time</th>
                  <th className='border-r border-gray-300 p-3'>Topic</th>
                  <th className='p-3'>Speaker Name</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-300 text-sm text-gray-800 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className='border-r border-gray-300 p-3'>
                      {new Date(sess.sessionDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className='border-r border-gray-300 p-3'>
                      {sess.fromTime}
                    </td>
                    <td className='border-r border-gray-300 p-3'>
                      {sess.toTime}
                    </td>
                    <td className='border-r border-gray-300 p-3'>
                      {sess.topic}
                    </td>
                    <td className='p-3'>{sess.speakerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      
    </form>
  )
}

export default Agenda
