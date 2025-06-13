// FinancialPlanning.jsx (Updated to persist data & expose to parent)
import { useState, useImperativeHandle, forwardRef } from 'react';
import { FaTrash } from 'react-icons/fa';

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
  'Others'
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
  'Miscellaneous / Contingency'
];

const FinancialPlanning = forwardRef(({ data = {}, onChange = () => {} }, ref) => {
  const [activeTab, setActiveTab] = useState('funding');

  const [fundingSource, setFundingSource] = useState('');
  const [customFundingSource, setCustomFundingSource] = useState('');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingRemark, setFundingRemark] = useState('');

  const [budgetParticular, setBudgetParticular] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetRemark, setBudgetRemark] = useState('');

  const addFunding = () => {
    if (!fundingSource || !fundingAmount) {
      alert('Please fill all required funding fields');
      return;
    }
    const source = fundingSource === 'Others' ? customFundingSource : fundingSource;
    const updated = [...(data.funding || []), { source, amount: parseFloat(fundingAmount), remark: fundingRemark }];
    onChange({ ...data, funding: updated });
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
    const updated = [...(data.budget || []), { particular: budgetParticular, amount: parseFloat(budgetAmount), remark: budgetRemark }];
    onChange({ ...data, budget: updated });
    setBudgetParticular('');
    setBudgetAmount('');
    setBudgetRemark('');
  };

  const removeFunding = index => {
    const updated = [...(data.funding || [])];
    updated.splice(index, 1);
    onChange({ ...data, funding: updated });
  };

  const removeBudget = index => {
    const updated = [...(data.budget || [])];
    updated.splice(index, 1);
    onChange({ ...data, budget: updated });
  };

  const getBudgetTotal = () => (data.budget || []).reduce((acc, item) => acc + item.amount, 0).toFixed(2);
  const getFundingTotal = () => (data.funding || []).reduce((acc, item) => acc + item.amount, 0).toFixed(2);

  useImperativeHandle(ref, () => ({
    getFinancialData: () => data
  }));

  return (
    <div className='max-w-8xl mx-auto space-y-12 rounded-xl px-6 py-10'>
      <div className='mb-4 flex space-x-4'>
  <button
    className={`rounded-t-lg px-4 py-2 font-medium ${activeTab === 'funding' ? 'bg-gray-200' : 'bg-gray-100'}`}
    onClick={() => setActiveTab('funding')}
  >
    Funding Sources
  </button>
  <button
    className={`rounded-t-lg px-4 py-2 font-medium ${activeTab === 'budget' ? 'bg-gray-200' : 'bg-gray-100'}`}
    onClick={() => setActiveTab('budget')}
  >
    Estimated Budget
  </button>
</div>
      {activeTab === 'funding' && (
        <section className='rounded border bg-gray-50 p-6 shadow-sm'>
          <h3 className='mb-4 text-xl font-semibold text-gray-700'>Funding Sources</h3>
          <div className='mb-4 grid gap-4 md:grid-cols-4'>
            <select value={fundingSource} onChange={e => setFundingSource(e.target.value)} className='w-full rounded border p-4 text-base'>
              <option value=''>Select Funding Source</option>
              {fundingOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            {fundingSource === 'Others' && (
              <input type='text' placeholder='Specify other source' value={customFundingSource} onChange={e => setCustomFundingSource(e.target.value)} className='w-full rounded border p-4 text-base' />
            )}
            <input type='number' placeholder='Enter amount' value={fundingAmount} onChange={e => setFundingAmount(e.target.value)} className='w-full rounded border p-4 text-base' />
            <input type='text' placeholder='Remarks' value={fundingRemark} onChange={e => setFundingRemark(e.target.value)} className='w-full rounded border p-4 text-base' />
          </div>
          <button onClick={addFunding} className='rounded bg-black px-6 py-2 text-white hover:bg-gray-900'>+ Add Funding</button>
          {(data.funding || []).length > 0 && (
            <div className='mt-6 overflow-x-auto'>
              <table className='min-w-full border text-left text-sm'>
                <thead className='bg-gray-200 font-semibold'>
                  <tr><th className='border p-2'>S.No</th><th className='border p-2'>Source</th><th className='border p-2'>Amount</th><th className='border p-2'>Remarks</th><th className='border p-2'>Action</th></tr>
                </thead>
                <tbody>
                  {data.funding.map((item, idx) => (
                    <tr key={idx}>
                      <td className='border p-2'>{idx + 1}</td>
                      <td className='border p-2'>{item.source}</td>
                      <td className='border p-2'>₹{item.amount.toFixed(2)}</td>
                      <td className='border p-2'>{item.remark}</td>
                      <td className='border p-2 text-center'>
                        <button onClick={() => removeFunding(idx)} className='rounded-full p-2 transition-colors hover:bg-red-100' title='Remove'>
                          <FaTrash className='text-red-600 hover:text-red-800 text-lg' />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className='bg-gray-100 font-bold'><td colSpan={2} className='border p-2 text-right'>Total Funding</td><td className='border p-2'>₹{getFundingTotal()}</td><td className='border p-2' colSpan={2}></td></tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'budget' && (
        <section className='rounded border bg-gray-50 p-6 shadow-sm'>
          <h3 className='mb-4 text-xl font-semibold text-gray-700'>Estimated Budget</h3>
          <div className='mb-4 grid gap-4 md:grid-cols-4'>
            <select value={budgetParticular} onChange={e => setBudgetParticular(e.target.value)} className='w-full rounded border p-4 text-base'>
              <option value=''>Select Particular</option>
              {budgetOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            <input type='number' placeholder='Enter amount' value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} className='w-full rounded border p-4 text-base' />
            <input type='text' placeholder='Remarks' value={budgetRemark} onChange={e => setBudgetRemark(e.target.value)} className='w-full rounded border p-4 text-base' />
          </div>
          <button onClick={addBudget} className='rounded bg-black px-6 py-2 text-white hover:bg-gray-900'>+ Add Budget Item</button>
          {(data.budget || []).length > 0 && (
            <div className='mt-6 overflow-x-auto'>
              <table className='min-w-full border text-left text-sm'>
                <thead className='bg-gray-200 font-semibold'>
                  <tr><th className='border p-2'>S.No</th><th className='border p-2'>Particular</th><th className='border p-2'>Amount</th><th className='border p-2'>Remarks</th><th className='border p-2'>Action</th></tr>
                </thead>
                <tbody>
                  {data.budget.map((item, idx) => (
                    <tr key={idx}>
                      <td className='border p-2'>{idx + 1}</td>
                      <td className='border p-2'>{item.particular}</td>
                      <td className='border p-2'>₹{item.amount.toFixed(2)}</td>
                      <td className='border p-2'>{item.remark}</td>
                      <td className='border p-2 text-center'>
                        <button onClick={() => removeBudget(idx)} className='rounded-full p-2 transition-colors hover:bg-red-100' title='Remove'>
                          <FaTrash className='text-red-600 hover:text-red-800 text-lg' />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className='bg-gray-100 font-bold'><td colSpan={2} className='border p-2 text-right'>Total Estimated Budget</td><td className='border p-2'>₹{getBudgetTotal()}</td><td className='border p-2' colSpan={2}></td></tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
});

export default FinancialPlanning;