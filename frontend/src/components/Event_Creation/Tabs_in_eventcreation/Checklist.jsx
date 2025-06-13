import {useState} from 'react'

const allTasks = {
  online: [
    'Event Agenda',
    'Guest Invitations & Confirmation',
    'Participation Notification & Communication',
    'Website & Social Media Pre-Event Updates',
    'Photography & Videography Coverage',
    'Event Report Preparation & Submission',
    'Website and Social Media Post-Event Updates',
    'Certificate for Guest & Participants / Feedback From The Participants'
  ],
  offline: [
    'Event Agenda',
    'Guest Invitations & Confirmation',
    'Participation Notification & Communication',
    'Newspaper Engagement (Event Column)',
    'Flex Banner Design & Installation',
    'Signage & Directional Boards Placement',
    'Hall Setup & Technical Requirements',
    'Floral Arrangements, Mementos, Shawl, Return Gifts',
    'Reception Desk & Welcome Setup',
    'Tree Plantation Ceremony',
    'Guest Reception At Campus',
    'Lift Coordinator Assigned',
    'Guest Book Signing & 2-Min Video Byte',
    'Photography & Videography Coverage',
    'Event Report Preparation & Submission',
    'Website and Social Media Post-Event Updates',
    'Certificate for Guest & Participants / Feedback From The Participants'
  ]
}

const Checklist = ({data=[],onChange}) => {
  const [eventType, setEventType] = useState('')
 
  const [showAddTasks, setShowAddTasks] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const addTask = task => {
    if (!data.some(t => t.activity === task)) {
      const updated = [...data, { activity: task, inCharge: '', date: '', remarks: '' }];
      onChange(updated);
    }
  };

 const removeTask = activity => {
    const updated = data.filter(t => t.activity !== activity);
    onChange(updated);
  };

 const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    onChange(updated);
  };

 const filteredTasks = eventType && allTasks[eventType] ?
    allTasks[eventType].filter(
      task => task.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !data.some(t => t.activity === task)
    ) : [];



  return (
    <div className='mx-auto max-w-7xl rounded-lg bg-white p-8 shadow-lg'>
      <h2 className='mb-8 border-b border-gray-300 pb-3 text-3xl font-extrabold text-gray-900'>
        Event Checklist
      </h2>

      <div className='mb-6 flex items-center space-x-4'>
        <label
          htmlFor='eventType'
          className='min-w-[130px] text-lg font-semibold text-gray-800'
        >
          Select Event Type:
        </label>
        <select
          id='eventType'
          value={eventType}
          onChange={e => {
            setEventType(e.target.value)
            onChange([]);
            setShowAddTasks(false)
            setSearchTerm('')
          }}
          className='rounded-md border border-gray-400 px-4 py-2 focus:ring-2 focus:ring-gray-600 focus:outline-none'
        >
          <option value=''>-- Choose --</option>
          <option value='online'>Online</option>
          <option value='offline'>Offline</option>
        </select>
      </div>

      {eventType && (
        <>
          <button
            className='mb-6 inline-block rounded-md bg-gray-900 px-6 py-2 font-semibold text-white transition hover:bg-gray-800'
            onClick={() => setShowAddTasks(true)}
          >
            + Add Tasks
          </button>

          {showAddTasks && (
            <div className='mx-auto mb-10 max-w-xl rounded-lg border border-gray-400 p-5 shadow-md'>
              <div className='mb-3 flex items-center justify-between'>
                <input
                  type='text'
                  placeholder='Search tasks...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='mr-4 w-full rounded-md border border-gray-400 px-4 py-2 focus:ring-2 focus:ring-gray-600 focus:outline-none'
                />
                <button
                  className='font-semibold text-gray-700 transition hover:text-gray-900'
                  onClick={() => setShowAddTasks(false)}
                  aria-label='Close Add Tasks'
                >
                  ✕
                </button>
              </div>

              <div
                style={{maxHeight: 240, overflowY: 'auto'}}
                className='rounded-md border border-gray-300 p-3'
              >
                {filteredTasks.length ? (
                  filteredTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className='mb-2 cursor-pointer rounded p-3 text-gray-900 hover:bg-gray-200'
                      onClick={() => addTask(task)}
                      role='button'
                      tabIndex={0}
                     
                    >
                      {task}
                    </div>
                  ))
                ) : (
                  <p className='py-10 text-center text-gray-500'>
                    No tasks found or all added
                  </p>
                )}
              </div>
            </div>
          )}

          {data.length > 0 ? (
            <>
              <div className='overflow-x-auto rounded-lg shadow-md'>
                <table className='min-w-full table-auto border-collapse'>
                  <thead className='bg-gray-200 text-gray-900'>
                    <tr>
                      <th className='border border-gray-400 px-4 py-3 text-left text-sm font-semibold'>
                        S.NO
                      </th>
                      <th className='border border-gray-400 px-4 py-3 text-left text-sm font-semibold'>
                        ACTIVITY
                      </th>
                      <th className='border border-gray-400 px-4 py-3 text-left text-sm font-semibold'>
                        IN-CHARGE
                      </th>
                      <th className='border border-gray-400 px-4 py-3 text-left text-sm font-semibold'>
                        DATE
                      </th>
                      <th className='border border-gray-400 px-4 py-3 text-left text-sm font-semibold'>
                        REMARKS
                      </th>
                      <th className='border border-gray-400 px-4 py-3 text-center text-sm font-semibold'>
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className='border border-gray-300 px-4 py-3 text-center text-sm text-gray-800'>
                          {index + 1}
                        </td>
                        <td className='border border-gray-300 px-4 py-3 text-sm text-gray-900'>
                          {item.activity}
                        </td>
                        <td className='border border-gray-300 px-4 py-3'>
                          <input
                            type='text'
                            value={item.inCharge}
                            onChange={e =>
                              handleChange(index, 'inCharge', e.target.value)
                            }
                            placeholder='In-charge'
                            className='w-full rounded-md border border-gray-400 px-3 py-1 focus:ring-2 focus:ring-gray-600 focus:outline-none'
                          />
                        </td>
                        <td className='border border-gray-300 px-4 py-3 text-center'>
                          <input
                            type='date'
                            value={item.date}
                            onChange={e =>
                              handleChange(index, 'date', e.target.value)
                            }
                            className='mx-auto block w-full max-w-[140px] rounded-md border border-gray-400 px-3 py-1 focus:ring-2 focus:ring-gray-600 focus:outline-none'
                          />
                        </td>
                        <td className='border border-gray-300 px-4 py-3'>
                          <input
                            type='text'
                            value={item.remarks}
                            onChange={e =>
                              handleChange(index, 'remarks', e.target.value)
                            }
                            placeholder='Remarks'
                            className='w-full rounded-md border border-gray-400 px-3 py-1 focus:ring-2 focus:ring-gray-600 focus:outline-none'
                          />
                        </td>
                        <td className='border border-gray-300 px-4 py-3 text-center'>
                          <button
                            className='font-semibold text-red-600 transition hover:text-red-800'
                            onClick={() => removeTask(item.activity)}
                            aria-label={`Remove task ${item.activity}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             
            </>
          ) : (
            <p className='text-center text-gray-700 italic'>
              No tasks added yet. Click <strong>+ Add Tasks</strong> to start.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default Checklist
