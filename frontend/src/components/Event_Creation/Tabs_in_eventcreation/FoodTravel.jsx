import React, { useState } from "react";

const FoodTravel = () => {
  const [activeTab, setActiveTab] = useState("meal");

  const [mealList, setMealList] = useState([]);
  const [refreshmentList, setRefreshmentList] = useState([]);
  const [travelList, setTravelList] = useState([]);
  const [travelBy, setTravelBy] = useState("college");

  const [meal, setMeal] = useState({
    from: "",
    to: "",
    time: "",
    mealType: "",
    category: "",
    menu: "",
    personCount: "",
    servedAt: "",
    note: "",
  });

  const [refreshment, setRefreshment] = useState({
    from: "",
    to: "",
    time: "",
    session: "",
    category: "",
    items: "",
    personCount: "",
    servedAt: "",
    note: "",
  });

  const [travel, setTravel] = useState({
    category: "",
    mode: "",
    date: "",
    time: "",
    pickup: "",
    drop: "",
    remarks: "",
  });

  const handleMealAdd = () => {
    setMealList([...mealList, meal]);
    setMeal({
      from: "",
      to: "",
      time: "",
      mealType: "",
      category: "",
      menu: "",
      personCount: "",
      servedAt: "",
      note: "",
    });
  };

  const handleRefreshmentAdd = () => {
    setRefreshmentList([...refreshmentList, refreshment]);
    setRefreshment({
      from: "",
      to: "",
      time: "",
      session: "",
      category: "",
      items: "",
      personCount: "",
      servedAt: "",
      note: "",
    });
  };

  const handleTravelAdd = () => {
    setTravelList([...travelList, travel]);
    setTravel({
      category: "",
      mode: "",
      date: "",
      time: "",
      pickup: "",
      drop: "",
      remarks: "",
    });
  };

  const tabButton = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-semibold rounded-t-md ${
        activeTab === tab ? "bg-black text-white" : "bg-gray-200 text-black"
      }`}
    >
      {label}
    </button>
  );

  const handleSaveAll = () => {
    const fullData = {
      meals: mealList,
      refreshments: refreshmentList,
      travels: travelList,
    };
    console.log("Saving data:", fullData);
    alert("Data saved! Check console for output.");

    // Here you can do further saving like API call:
    // axios.post('/api/save-arrangements', fullData)
    //   .then(() => alert("Data saved successfully!"))
    //   .catch(err => console.error(err));
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-3xl font-bold mb-4">Food & Travel Arrangements</h2>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {tabButton("meal", "Meal")}
        {tabButton("refreshment", "Refreshment")}
        {tabButton("travel", "Travel")}
      </div>

      {/* Meal Arrangement */}
      {activeTab === "meal" && (
        <div className="border rounded p-6 shadow-md bg-white space-y-4">
          <h3 className="text-xl font-bold mb-4">Meal Arrangements</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="date"
              value={meal.from}
              onChange={(e) => setMeal({ ...meal, from: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={meal.to}
              onChange={(e) => setMeal({ ...meal, to: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="time"
              value={meal.time}
              onChange={(e) => setMeal({ ...meal, time: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={meal.mealType}
              onChange={(e) => setMeal({ ...meal, mealType: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Meal Type</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
            <select
              value={meal.category}
              onChange={(e) => setMeal({ ...meal, category: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Category</option>
              <option>Guest</option>
              <option>Student</option>
              <option>Staff</option>
            </select>
            <select
              value={meal.menu}
              onChange={(e) => setMeal({ ...meal, menu: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Menu</option>
              <option>Standard Veg</option>
              <option>Standard Nonveg</option>
              <option>Special Veg</option>
              <option>Special Nonveg</option>
            </select>
            <input
              type="number"
              value={meal.personCount}
              onChange={(e) => setMeal({ ...meal, personCount: e.target.value })}
              className="p-2 border rounded"
              placeholder="Person Count"
            />
            <select
              value={meal.servedAt}
              onChange={(e) => setMeal({ ...meal, servedAt: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Served At</option>
              <option>Dining Hall</option>
              <option>Venue</option>
            </select>
            <textarea
              value={meal.note}
              onChange={(e) => setMeal({ ...meal, note: e.target.value })}
              className="p-2 border rounded col-span-2"
              placeholder="Special Note"
            />
          </div>
          <button
            onClick={handleMealAdd}
            className="bg-black text-white px-6 py-2 rounded mt-2"
          >
            Add Meal
          </button>

          {mealList.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">From - To</th>
                    <th className="border p-2">Time</th>
                    <th className="border p-2">Meal</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Menu</th>
                    <th className="border p-2">Count</th>
                    <th className="border p-2">Served At</th>
                    <th className="border p-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {mealList.map((item, i) => (
                    <tr key={i}>
                      <td className="border p-2">
                        {item.from} - {item.to}
                      </td>
                      <td className="border p-2">{item.time}</td>
                      <td className="border p-2">{item.mealType}</td>
                      <td className="border p-2">{item.category}</td>
                      <td className="border p-2">{item.menu}</td>
                      <td className="border p-2">{item.personCount}</td>
                      <td className="border p-2">{item.servedAt}</td>
                      <td className="border p-2">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Refreshment */}
      {activeTab === "refreshment" && (
        <div className="border rounded p-6 shadow-md bg-white space-y-4">
          <h3 className="text-xl font-bold mb-4">Refreshment Arrangements</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="date"
              value={refreshment.from}
              onChange={(e) => setRefreshment({ ...refreshment, from: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={refreshment.to}
              onChange={(e) => setRefreshment({ ...refreshment, to: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="time"
              value={refreshment.time}
              onChange={(e) => setRefreshment({ ...refreshment, time: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={refreshment.session}
              onChange={(e) => setRefreshment({ ...refreshment, session: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Session</option>
              <option>Forenoon</option>
              <option>Afternoon</option>
            </select>
            <select
              value={refreshment.category}
              onChange={(e) => setRefreshment({ ...refreshment, category: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Category</option>
              <option>Guest</option>
              <option>Student</option>
              <option>Staff</option>
            </select>
            <select
              value={refreshment.items}
              onChange={(e) => setRefreshment({ ...refreshment, items: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Items</option>
              <option>Tea/Coffee</option>
              <option>Tea/Coffee with Biscuits</option>
            </select>
            <input
              type="number"
              value={refreshment.personCount}
              onChange={(e) => setRefreshment({ ...refreshment, personCount: e.target.value })}
              className="p-2 border rounded"
              placeholder="Person Count"
            />
            <select
              value={refreshment.servedAt}
              onChange={(e) => setRefreshment({ ...refreshment, servedAt: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Served At</option>
              <option>Dining Hall</option>
              <option>Venue</option>
            </select>
            <textarea
              value={refreshment.note}
              onChange={(e) => setRefreshment({ ...refreshment, note: e.target.value })}
              className="p-2 border rounded col-span-2"
              placeholder="Special Note"
            />
          </div>
          <button
            onClick={handleRefreshmentAdd}
            className="bg-black text-white px-6 py-2 rounded mt-2"
          >
            Add Refreshment
          </button>

          {refreshmentList.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">From - To</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Session</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Items</th>
                    <th className="p-2 border">Count</th>
                    <th className="p-2 border">Served At</th>
                    <th className="p-2 border">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {refreshmentList.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{item.from} - {item.to}</td>
                      <td className="p-2 border">{item.time}</td>
                      <td className="p-2 border">{item.session}</td>
                      <td className="p-2 border">{item.category}</td>
                      <td className="p-2 border">{item.items}</td>
                      <td className="p-2 border">{item.personCount}</td>
                      <td className="p-2 border">{item.servedAt}</td>
                      <td className="p-2 border">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Travel */}
      {activeTab === "travel" && (
        <div className="border rounded p-6 shadow-md bg-white space-y-4">
          <h3 className="text-xl font-bold mb-4">Travel Arrangements</h3>

          <div className="flex gap-6">
            <label className="flex gap-2 items-center">
              <input
                type="radio"
                value="college"
                checked={travelBy === "college"}
                onChange={() => setTravelBy("college")}
              />
              By College Management
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="radio"
                value="own"
                checked={travelBy === "own"}
                onChange={() => setTravelBy("own")}
              />
              By Own
            </label>
          </div>

          {travelBy === "own" ? (
            <p className="italic text-gray-600">
              Travel arranged by individual (no travel form required).
            </p>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-4">
                <select
                  value={travel.category}
                  onChange={(e) => setTravel({ ...travel, category: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="">Category</option>
                  <option>Guest</option>
                  <option>Student</option>
                  <option>Staff</option>
                </select>
                <select
                  value={travel.mode}
                  onChange={(e) => setTravel({ ...travel, mode: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="">Mode</option>
                  <option>Car</option>
                  <option>Bus</option>
                  <option>Train</option>
                  <option>Flight</option>
                </select>
                <input
                  type="date"
                  value={travel.date}
                  onChange={(e) => setTravel({ ...travel, date: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  value={travel.time}
                  onChange={(e) => setTravel({ ...travel, time: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Pickup Location"
                  value={travel.pickup}
                  onChange={(e) => setTravel({ ...travel, pickup: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Drop Location"
                  value={travel.drop}
                  onChange={(e) => setTravel({ ...travel, drop: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Remarks"
                  value={travel.remarks}
                  onChange={(e) => setTravel({ ...travel, remarks: e.target.value })}
                  className="p-2 border rounded col-span-2"
                />
              </div>
              <button
                onClick={handleTravelAdd}
                className="bg-black text-white px-6 py-2 rounded mt-2"
              >
                Add Travel
              </button>

              {travelList.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Category</th>
                        <th className="p-2 border">Mode</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Time</th>
                        <th className="p-2 border">Pickup</th>
                        <th className="p-2 border">Drop</th>
                        <th className="p-2 border">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {travelList.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2 border">{item.category}</td>
                          <td className="p-2 border">{item.mode}</td>
                          <td className="p-2 border">{item.date}</td>
                          <td className="p-2 border">{item.time}</td>
                          <td className="p-2 border">{item.pickup}</td>
                          <td className="p-2 border">{item.drop}</td>
                          <td className="p-2 border">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={handleSaveAll}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow-lg"
                  >
                    Save All Arrangements
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodTravel;
