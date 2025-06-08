'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API error: ${res.status} ${msg}`);
  }
  const json = await res.json();
  if (!json.incomes || !Array.isArray(json.incomes)) {
    throw new Error('Unexpected shape: ' + JSON.stringify(json));
  }
  return json.incomes;
};

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    source: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  // 1️⃣ Load & revalidate
  const { data: incomes = [], error, mutate } = useSWR(
    '/api/income',
    fetcher,
    { refreshInterval: 30000 }
  );

  if (error) return <p className="text-red-600">Error loading incomes:<br/>{error.message}</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json(); // should include _id

      // 2️⃣ Append to cache
      await mutate(prev => [...prev, saved], false);

      setFormData({ date: '', description: '', source: '', amount: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add income: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = incomes.reduce((sum, x) => sum + x.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-8"
        >
          Incomes
        </motion.h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
          >
            {showForm ? 'Cancel' : 'Add Income'}
          </button>
        </div>

        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-6 bg-white rounded-lg shadow space-y-4"
          >
            {['date','description','source','amount'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'amount' ? 'number' : field === 'date' ? 'date' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  step={field === 'amount' ? '0.01' : undefined}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none text-black"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-500 transition"
            >
              {loading ? 'Submitting...' : 'Submit Income'}
            </button>
          </motion.form>
        )}

        <table className="w-full table-auto border-collapse bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-700">
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Source</th>
              <th className="border px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map(inc => (
              <tr key={inc._id} className="text-gray-800">
                <td className="border px-4 py-2">{inc.date}</td>
                <td className="border px-4 py-2">{inc.description}</td>
                <td className="border px-4 py-2">{inc.source}</td>
                <td className="border px-4 py-2">${inc.amount.toFixed(2)}</td>
              </tr>
            ))}
            {incomes.length > 0 && (
              <tr className="font-semibold text-gray-900">
                <td className="border px-4 py-2" colSpan={3}>Total</td>
                <td className="border px-4 py-2">${totalIncome.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
