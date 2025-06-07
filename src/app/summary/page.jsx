'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const [frequency, setFrequency] = useState('monthly');
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    setLoading(true);
    setError(null);

    fetch(`/api/financial/summary?freq=${frequency}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setSummary(data.summary || {}))
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load data.');
      })
      .finally(() => setLoading(false));
  }, [frequency, status]);

  if (status === 'loading') {
    return <p className="text-center mt-10">Loading session…</p>;
  }
  if (status === 'unauthenticated') {
    return <p className="text-center mt-10">Please sign in to view your summary.</p>;
  }

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const periods = Object.entries(summary);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="bg-indigo-600 text-white py-14 text-center px-4"
      >
        <h1 className="text-4xl font-bold mb-2">Financial Summaries</h1>
        <p className="text-sm text-indigo-100">
          Roll up your transactions by day, week, or month
        </p>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="flex justify-center mt-8 space-x-4"
      >
        {['daily', 'weekly', 'monthly'].map(freq => (
          <button
            key={freq}
            onClick={() => setFrequency(freq)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              frequency === freq
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {freq.charAt(0).toUpperCase() + freq.slice(1)}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto mt-6 px-4"
      >
        {loading && <p className="text-center text-gray-600">Loading data…</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && periods.length === 0 && (
          <p className="text-center text-gray-600">No data available.</p>
        )}
        {!loading && !error && periods.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-700">Period</th>
                  <th className="px-4 py-2 text-right text-gray-700">Income</th>
                  <th className="px-4 py-2 text-right text-gray-700">Expense</th>
                  <th className="px-4 py-2 text-right text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(([period, { income, expense, net }]) => (
                  <tr key={period} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-gray-800">{period}</td>
                    <td className="px-4 py-2 text-right text-green-600">${income}</td>
                    <td className="px-4 py-2 text-right text-red-600">${expense}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${
                          net >= 0 ? 'text-green-800' : 'text-red-800'
                        }`}>${net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
