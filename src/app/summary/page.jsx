'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Friendly display formatters
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
});
function friendlyDayLabel(iso) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  return `${dateFormatter.format(d)} (${weekday})`;
}
function friendlyWeekLabel(iso) {
  const d = new Date(iso);
  return `Week of ${dateFormatter.format(d)}`;
}
function friendlyMonthLabel(iso) {
  const [year, month] = iso.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const [frequency, setFrequency] = useState('monthly');
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState({});

  // Fetch summary + all txns on freq or auth change
  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/financial/summary?freq=${frequency}`)
        .then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`/api/financial/transactions`)
        .then(r => r.ok ? r.json() : Promise.reject())
    ])
      .then(([sumData, txData]) => {
        setSummary(sumData.summary || {});
        setTransactions(txData.transactions || []);
        setExpanded({});
      })
      .catch(() => setError('Failed to load data.'))
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

  const labelFn =
    frequency === 'daily'
      ? friendlyDayLabel
      : frequency === 'weekly'
      ? friendlyWeekLabel
      : friendlyMonthLabel;

  // Group by the raw key
  const txByRaw = transactions.reduce((acc, tx) => {
    let key;
    if (frequency === 'monthly') {
      key = tx.date.slice(0, 7);       // "YYYY-MM"
    } else {
      key = tx.date.slice(0, 10);      // "YYYY-MM-DD"
    }
    (acc[key] = acc[key] || []).push(tx);
    return acc;
  }, {});

  // Prepare and sort periods descending by date string
  const periods = Object.entries(summary)
    .sort(([aKey], [bKey]) => {
      // parse aKey, bKey into Date for proper sort
      const dateA = frequency === 'monthly'
        ? new Date(`${aKey}-01`)
        : new Date(aKey);
      const dateB = frequency === 'monthly'
        ? new Date(`${bKey}-01`)
        : new Date(bKey);
      return dateB - dateA;
    });

  const toggle = (raw) => {
    setExpanded(prev => ({ ...prev, [raw]: !prev[raw] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      {/* Header */}
      <motion.div {...fadeIn} className="bg-indigo-600 text-white py-14 text-center px-4">
        <h1 className="text-4xl font-bold mb-2">Financial Summaries</h1>
        <p className="text-sm text-indigo-100">Roll up your transactions by day, week, or month</p>
      </motion.div>

      {/* Frequency Selector */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="flex justify-center mt-8 space-x-4">
        {['daily','weekly','monthly'].map(freq => (
          <button
            key={freq}
            onClick={() => setFrequency(freq)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              frequency === freq
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {freq[0].toUpperCase() + freq.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="max-w-4xl mx-auto mt-6 px-4">
        {loading && <p className="text-center text-gray-600">Loading data…</p>}
        {error   && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && periods.length === 0 && (
          <p className="text-center text-gray-600">No data available.</p>
        )}

        {!loading && !error && periods.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2" />
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-right">Income</th>
                  <th className="px-4 py-2 text-right">Expense</th>
                  <th className="px-4 py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(([raw,{income,expense,net}])=>(
                  <React.Fragment key={raw}>
                    <tr
                      className="cursor-pointer bg-white hover:bg-gray-50"
                      onClick={()=>toggle(raw)}
                    >
                      <td className="px-4 py-2">
                        {expanded[raw]
                          ? <ChevronDown size={20} className="text-indigo-600"/>
                          : <ChevronRight size={20} className="text-indigo-600"/>}
                      </td>
                      <td className="px-4 py-2">{labelFn(raw)}</td>
                      <td className="px-4 py-2 text-right text-green-600">${income}</td>
                      <td className="px-4 py-2 text-right text-red-600">${expense}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${
                        net>=0?'text-green-800':'text-red-800'
                      }`}>${net}</td>
                    </tr>

                    {expanded[raw] && (txByRaw[raw]||[]).map((tx,i)=>(
                      <tr key={i} className="bg-gray-50">
                        <td/>
                        <td className="px-4 py-1 text-sm text-gray-600">
                          {new Date(tx.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} — {tx.description}
                        </td>
                        <td className="px-4 py-1 text-sm text-right text-green-600">
                          {tx.type==='income'?`+${tx.amount}`:''}
                        </td>
                        <td className="px-4 py-1 text-sm text-right text-red-600">
                          {tx.type==='expense'?`−${tx.amount}`:''}
                        </td>
                        <td/>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
