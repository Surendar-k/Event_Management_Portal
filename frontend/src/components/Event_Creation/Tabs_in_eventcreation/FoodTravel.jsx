import { useState, useEffect } from 'react';

const FoodTravel = ({ data = { meals: [], refreshments: [], travels: [], travelBy: 'college' }, onChange }) => {
  const [activeTab, setActiveTab] = useState('meal');

  const [meal, setMeal] = useState({ from: '', to: '', time: '', mealType: '', category: '', menu: '', personCount: '', servedAt: '', note: '' });
  const [refreshment, setRefreshment] = useState({ from: '', to: '', time: '', session: '', category: '', items: '', personCount: '', servedAt: '', note: '' });
  const [travel, setTravel] = useState({ category: '', mode: '', date: '', time: '', pickup: '', drop: '', remarks: '' });
  const [travelBy, setTravelBy] = useState(data.travelBy || 'college');

  const tabButton = (id, label) => (
    <button
  className={`border-b-2 px-4 py-2 text-sm font-medium ${
    activeTab === id ? 'border-black text-black' : 'border-transparent text-gray-500'
  }`}
  onClick={() => setActiveTab(id)}
>
  {label}
</button>

  );

  useEffect(() => {
    onChange({ ...data, travelBy });
  }, [travelBy]);

  const updateData = (key, list) => {
    onChange({ ...data, [key]: list });
  };

  const handleMealAdd = () => {
    const updatedMeals = [...(data.meals || []), meal];
    updateData('meals', updatedMeals);
    setMeal({ from: '', to: '', time: '', mealType: '', category: '', menu: '', personCount: '', servedAt: '', note: '' });
  };

  const handleRefreshmentAdd = () => {
    const updatedRefreshments = [...(data.refreshments || []), refreshment];
    updateData('refreshments', updatedRefreshments);
    setRefreshment({ from: '', to: '', time: '', session: '', category: '', items: '', personCount: '', servedAt: '', note: '' });
  };

  const handleTravelAdd = () => {
    const updatedTravels = [...(data.travels || []), travel];
    updateData('travels', updatedTravels);
    setTravel({ category: '', mode: '', date: '', time: '', pickup: '', drop: '', remarks: '' });
  };

  const mealList = data.meals || [];
  const refreshmentList = data.refreshments || [];
  const travelList = data.travels || [];

  return (
    <div className='space-y-10 p-6'>
      <h2 className='mb-4 text-3xl font-bold'>Food & Travel Arrangements</h2>

      {/* Tabs */}
      <div className='flex space-x-4 border-b'>
        {tabButton('meal', 'Meal')}
        {tabButton('refreshment', 'Refreshment')}
        {tabButton('travel', 'Travel')}
      </div>

      {/* Meal Arrangement */}
      {activeTab === 'meal' && (
        <div className='space-y-4 rounded border bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-xl font-bold'>Meal Arrangements</h3>
          <div className='grid gap-4 md:grid-cols-4'>
            <input
              type='date'
              value={meal.from}
              onChange={e => setMeal({...meal, from: e.target.value})}
              className='rounded border p-2'
            />
            <input
              type='date'
              value={meal.to}
              onChange={e => setMeal({...meal, to: e.target.value})}
              className='rounded border p-2'
            />
            <input
              type='time'
              value={meal.time}
              onChange={e => setMeal({...meal, time: e.target.value})}
              className='rounded border p-2'
            />
            <select
              value={meal.mealType}
              onChange={e => setMeal({...meal, mealType: e.target.value})}
              className='rounded border p-2'
            >
              <option value=''>Meal Type</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
            <select
              value={meal.category}
              onChange={e => setMeal({...meal, category: e.target.value})}
              className='rounded border p-2'
            >
              <option value=''>Category</option>
              <option>Guest</option>
              <option>Student</option>
              <option>Staff</option>
            </select>
            <select
              value={meal.menu}
              onChange={e => setMeal({...meal, menu: e.target.value})}
              className='rounded border p-2'
            >
              <option value=''>Menu</option>
              <option>Standard Veg</option>
              <option>Standard Nonveg</option>
              <option>Special Veg</option>
              <option>Special Nonveg</option>
            </select>
            <input
              type='number'
              value={meal.personCount}
              onChange={e => setMeal({...meal, personCount: e.target.value})}
              className='rounded border p-2'
              placeholder='Person Count'
            />
            <select
              value={meal.servedAt}
              onChange={e => setMeal({...meal, servedAt: e.target.value})}
              className='rounded border p-2'
            >
              <option value=''>Served At</option>
              <option>Dining Hall</option>
              <option>Venue</option>
            </select>
            <textarea
              value={meal.note}
              onChange={e => setMeal({...meal, note: e.target.value})}
              className='col-span-2 rounded border p-2'
              placeholder='Special Note'
            />
          </div>
          <button
            onClick={handleMealAdd}
            className='mt-2 rounded bg-black px-6 py-2 text-white'
          >
            Add Meal
          </button>

          {mealList.length > 0 && (
            <div className='mt-4 overflow-x-auto'>
              <table className='w-full border text-sm'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border p-2'>From - To</th>
                    <th className='border p-2'>Time</th>
                    <th className='border p-2'>Meal</th>
                    <th className='border p-2'>Category</th>
                    <th className='border p-2'>Menu</th>
                    <th className='border p-2'>Count</th>
                    <th className='border p-2'>Served At</th>
                    <th className='border p-2'>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {mealList.map((item, i) => (
                    <tr key={i}>
                      <td className='border p-2'>
                        {item.from} - {item.to}
                      </td>
                      <td className='border p-2'>{item.time}</td>
                      <td className='border p-2'>{item.mealType}</td>
                      <td className='border p-2'>{item.category}</td>
                      <td className='border p-2'>{item.menu}</td>
                      <td className='border p-2'>{item.personCount}</td>
                      <td className='border p-2'>{item.servedAt}</td>
                      <td className='border p-2'>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Refreshment */}
      {activeTab === 'refreshment' && (
        <div className='space-y-4 rounded border bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-xl font-bold'>Refreshment Arrangements</h3>
          <div className='grid gap-4 md:grid-cols-4'>
            <input
              type='date'
              value={refreshment.from}
              onChange={e =>
                setRefreshment({...refreshment, from: e.target.value})
              }
              className='rounded border p-2'
            />
            <input
              type='date'
              value={refreshment.to}
              onChange={e =>
                setRefreshment({...refreshment, to: e.target.value})
              }
              className='rounded border p-2'
            />
            <input
              type='time'
              value={refreshment.time}
              onChange={e =>
                setRefreshment({...refreshment, time: e.target.value})
              }
              className='rounded border p-2'
            />
            <select
              value={refreshment.session}
              onChange={e =>
                setRefreshment({...refreshment, session: e.target.value})
              }
              className='rounded border p-2'
            >
              <option value=''>Session</option>
              <option>Forenoon</option>
              <option>Afternoon</option>
            </select>
            <select
              value={refreshment.category}
              onChange={e =>
                setRefreshment({...refreshment, category: e.target.value})
              }
              className='rounded border p-2'
            >
              <option value=''>Category</option>
              <option>Guest</option>
              <option>Student</option>
              <option>Staff</option>
            </select>
            <select
              value={refreshment.items}
              onChange={e =>
                setRefreshment({...refreshment, items: e.target.value})
              }
              className='rounded border p-2'
            >
              <option value=''>Items</option>
              <option>Tea/Coffee</option>
              <option>Tea/Coffee with Biscuits</option>
            </select>
            <input
              type='number'
              value={refreshment.personCount}
              onChange={e =>
                setRefreshment({...refreshment, personCount: e.target.value})
              }
              className='rounded border p-2'
              placeholder='Person Count'
            />
            <select
              value={refreshment.servedAt}
              onChange={e =>
                setRefreshment({...refreshment, servedAt: e.target.value})
              }
              className='rounded border p-2'
            >
              <option value=''>Served At</option>
              <option>Dining Hall</option>
              <option>Venue</option>
            </select>
            <textarea
              value={refreshment.note}
              onChange={e =>
                setRefreshment({...refreshment, note: e.target.value})
              }
              className='col-span-2 rounded border p-2'
              placeholder='Special Note'
            />
          </div>
          <button
            onClick={handleRefreshmentAdd}
            className='mt-2 rounded bg-black px-6 py-2 text-white'
          >
            Add Refreshment
          </button>

          {refreshmentList.length > 0 && (
            <div className='mt-4 overflow-x-auto'>
              <table className='w-full border text-sm'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border p-2'>From - To</th>
                    <th className='border p-2'>Time</th>
                    <th className='border p-2'>Session</th>
                    <th className='border p-2'>Category</th>
                    <th className='border p-2'>Items</th>
                    <th className='border p-2'>Count</th>
                    <th className='border p-2'>Served At</th>
                    <th className='border p-2'>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {refreshmentList.map((item, i) => (
                    <tr key={i}>
                      <td className='border p-2'>
                        {item.from} - {item.to}
                      </td>
                      <td className='border p-2'>{item.time}</td>
                      <td className='border p-2'>{item.session}</td>
                      <td className='border p-2'>{item.category}</td>
                      <td className='border p-2'>{item.items}</td>
                      <td className='border p-2'>{item.personCount}</td>
                      <td className='border p-2'>{item.servedAt}</td>
                      <td className='border p-2'>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Travel */}
      {activeTab === 'travel' && (
        <div className='space-y-4 rounded border bg-white p-6 shadow-md'>
          <h3 className='mb-4 text-xl font-bold'>Travel Arrangements</h3>

          <div className='flex gap-6'>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                value='college'
                checked={travelBy === 'college'}
                onChange={() => setTravelBy('college')}
              />
              By College Management
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='radio'
                value='own'
                checked={travelBy === 'own'}
                onChange={() => setTravelBy('own')}
              />
              By Own
            </label>
          </div>

          {travelBy === 'own' ? (
            <p className='text-gray-600 italic'>
              Travel arranged by individual (no travel form required).
            </p>
          ) : (
            <>
              <div className='grid gap-4 md:grid-cols-4'>
                <select
                  value={travel.category}
                  onChange={e =>
                    setTravel({...travel, category: e.target.value})
                  }
                  className='rounded border p-2'
                >
                  <option value=''>Category</option>
                  <option>Guest</option>
                  <option>Student</option>
                  <option>Staff</option>
                </select>
                <select
                  value={travel.mode}
                  onChange={e => setTravel({...travel, mode: e.target.value})}
                  className='rounded border p-2'
                >
                  <option value=''>Mode</option>
                  <option>Car</option>
                  <option>Bus</option>
                  <option>Train</option>
                  <option>Flight</option>
                </select>
                <input
                  type='date'
                  value={travel.date}
                  onChange={e => setTravel({...travel, date: e.target.value})}
                  className='rounded border p-2'
                />
                <input
                  type='time'
                  value={travel.time}
                  onChange={e => setTravel({...travel, time: e.target.value})}
                  className='rounded border p-2'
                />
                <input
                  type='text'
                  placeholder='Pickup Location'
                  value={travel.pickup}
                  onChange={e => setTravel({...travel, pickup: e.target.value})}
                  className='rounded border p-2'
                />
                <input
                  type='text'
                  placeholder='Drop Location'
                  value={travel.drop}
                  onChange={e => setTravel({...travel, drop: e.target.value})}
                  className='rounded border p-2'
                />
                <input
                  type='text'
                  placeholder='Remarks'
                  value={travel.remarks}
                  onChange={e =>
                    setTravel({...travel, remarks: e.target.value})
                  }
                  className='col-span-2 rounded border p-2'
                />
              </div>
              <button
                onClick={handleTravelAdd}
                className='mt-2 rounded bg-black px-6 py-2 text-white'
              >
                Add Travel
              </button>

              {travelList.length > 0 && (
                <div className='mt-4 overflow-x-auto'>
                  <table className='w-full border text-sm'>
                    <thead className='bg-gray-100'>
                      <tr>
                        <th className='border p-2'>Category</th>
                        <th className='border p-2'>Mode</th>
                        <th className='border p-2'>Date</th>
                        <th className='border p-2'>Time</th>
                        <th className='border p-2'>Pickup</th>
                        <th className='border p-2'>Drop</th>
                        <th className='border p-2'>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {travelList.map((item, i) => (
                        <tr key={i}>
                          <td className='border p-2'>{item.category}</td>
                          <td className='border p-2'>{item.mode}</td>
                          <td className='border p-2'>{item.date}</td>
                          <td className='border p-2'>{item.time}</td>
                          <td className='border p-2'>{item.pickup}</td>
                          <td className='border p-2'>{item.drop}</td>
                          <td className='border p-2'>{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
};

export default FoodTravel