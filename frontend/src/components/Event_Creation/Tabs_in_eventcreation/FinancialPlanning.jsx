import React, { useState } from 'react';

const fundingOptions = [
  'Management Funding',
  'Department Funding',
  'Participant Contribution / Registration Fees',
  'Industry / Companies Funding',
  'Government Grants',
  'Alumni Funding',
  'Professional Societies / Student Chapters',
  'Tech Clubs / Innovation Cells',
  'Event Collaborations',
  'Others',
];

const budgetOptions = [
  'Resource Person Honorarium',
  'Travel Allowance',
  'Banners / Flex / Backdrop',
  'Printing - Certificates, Brochures, Posters',
  'Ceremonial Arrangements / Mementos / Gifts',
  'Technical Arrangements',
  'Stationery & Event Materials',
  'Accommodation & Hospitality',
  'Food & Refreshments',
  'Logistics & Venue',
  'Photography / Videography',
  'Digital Promotion & Media',
  'Miscellaneous / Contingency',
];

const FinancialPlanning = () => {
  const [activeTab, setActiveTab] = useState('funding');

  const [fundingSource, setFundingSource] = useState('');
  const [customFundingSource, setCustomFundingSource] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingRemark, setFundingRemark] = useState('');
  const [fundingData, setFundingData] = useState([]);

  const [budgetParticular, setBudgetParticular] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetRemark, setBudgetRemark] = useState('');
  const [budgetData, setBudgetData] = useState([]);

  const addFunding = () => {
    if (!fundingSource || !fundingAmount) {
      alert('Please fill all required funding fields');
      return;
    }

    const source = fundingSource === 'Others' ? customFundingSource : fundingSource;

    setFundingData([
      ...fundingData,
      { source, amount: parseFloat(fundingAmount), remark: fundingRemark },
    ]);

    setFundingSource('');
    setCustomFundingSource('');
    setFundingAmount('');
    setFundingRemark('');
  };

  const addBudget = () => {
    if (!budgetParticular || !budgetAmount) {
      alert('Please fill all required budget fields');
      return;
    }

    setBudgetData([
      ...budgetData,
      { particular: budgetParticular, amount: parseFloat(budgetAmount), remark: budgetRemark },
    ]);

    setBudgetParticular('');
    setBudgetAmount('');
    setBudgetRemark('');
  };

  const getBudgetTotal = () => {
    return budgetData.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
  };

  const getFundingTotal = () => {
    return fundingData.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
  };

  const handleSaveFunding = () => {
    console.log('Saving Funding Data:', fundingData);
    alert('Funding data saved!');
  };

  const handleSaveBudget = () => {
    console.log('Saving Budget Data:', budgetData);
    alert('Budget data saved!');
  };

  return (
    <div className="max-w-8xl mx-auto px-6 py-10 rounded-xl space-y-12"
>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Financial Planning</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'funding' ? 'bg-gray-200' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('funding')}
        >
          Funding Sources
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'budget' ? 'bg-gray-200' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('budget')}
        >
          Estimated Budget
        </button>
      </div>

      {/* Funding Tab */}
      {activeTab === 'funding' && (
        <section className="border rounded p-6 bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Funding Sources</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <select
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              className="p-4 text-base border rounded w-full"
            >
              <option value="">Select Funding Source</option>
              {fundingOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {fundingSource === 'Others' && (
              <input
                type="text"
                placeholder="Specify other source"
                value={customFundingSource}
                onChange={(e) => setCustomFundingSource(e.target.value)}
                className="p-4 text-base border rounded w-full"
              />
            )}

            <input
              type="number"
              placeholder="Enter amount"
              value={fundingAmount}
              onChange={(e) => setFundingAmount(e.target.value)}
              className="p-4 text-base border rounded w-full"
            />

            <input
              type="text"
              placeholder="Remarks"
              value={fundingRemark}
              onChange={(e) => setFundingRemark(e.target.value)}
              className="p-4 text-base border rounded w-full"
            />
          </div>
          <button
            onClick={addFunding}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-900"
          >
            + Add Funding
          </button>

          {fundingData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border text-left text-sm">
                <thead className="bg-gray-200 font-semibold">
                  <tr>
                    <th className="p-2 border">S.No</th>
                    <th className="p-2 border">Source</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{idx + 1}</td>
                      <td className="p-2 border">{item.source}</td>
                      <td className="p-2 border">₹{item.amount.toFixed(2)}</td>
                      <td className="p-2 border">{item.remark}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={2} className="p-2 border text-right">
                      Total Funding
                    </td>
                    <td className="p-2 border">₹{getFundingTotal()}</td>
                    <td className="p-2 border"></td>
                  </tr>
                </tbody>
              </table>
              <button
                onClick={handleSaveFunding}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Funding Data
              </button>
            </div>
          )}
        </section>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <section className="border rounded p-6 bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Estimated Budget</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <select
              value={budgetParticular}
              onChange={(e) => setBudgetParticular(e.target.value)}
              className="p-4 text-base border rounded w-full"
            >
              <option value="">Select Particular</option>
              {budgetOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Enter amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="p-4 text-base border rounded w-full"
            />

            <input
              type="text"
              placeholder="Remarks"
              value={budgetRemark}
              onChange={(e) => setBudgetRemark(e.target.value)}
              className="p-4 text-base border rounded w-full"
            />
          </div>
          <button
            onClick={addBudget}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-900"
          >
            + Add Budget Item
          </button>

          {budgetData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border text-left text-sm">
                <thead className="bg-gray-200 font-semibold">
                  <tr>
                    <th className="p-2 border">S.No</th>
                    <th className="p-2 border">Particular</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{idx + 1}</td>
                      <td className="p-2 border">{item.particular}</td>
                      <td className="p-2 border">₹{item.amount.toFixed(2)}</td>
                      <td className="p-2 border">{item.remark}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={2} className="p-2 border text-right">
                      Total Estimated Budget
                    </td>
                    <td className="p-2 border">₹{getBudgetTotal()}</td>
                    <td className="p-2 border"></td>
                  </tr>
                </tbody>
              </table>
              <button
                onClick={handleSaveBudget}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Budget Data
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default FinancialPlanning;
