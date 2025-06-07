"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

// Formatters
const dateFormatter = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const currency = (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// Preset ranges
const today = new Date();
const formatYMD = (d) => d.toISOString().slice(0, 10);
const presetRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', custom: (d) => [new Date(d.getFullYear(), d.getMonth(), 1), d] },
  { label: 'Year to date', custom: (d) => [new Date(d.getFullYear(), 0, 1), d] }
];

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // date range state
  const [range, setRange] = useState([new Date(today.getTime() - 6 * 86400000), today]);

  // fetch transactions
  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/financial/transactions')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setTransactions(data.transactions || []))
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [status]);

  // compute summary and filter transactions
  const { totalIncome, totalExpense, net, categoryData, timeline, filteredTx } = useMemo(() => {
    const [start, end] = range;
    let income = 0,
      expense = 0;
    const catMap = {};
    const dayMap = {};
    const filteredTx = [];

    transactions.forEach(tx => {
      const d = new Date(tx.date);
      if (d < start || d > end) return;
      filteredTx.push(tx);
      if (tx.type === 'income') income += tx.amount;
      else {
        expense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
      const key = formatYMD(d);
      dayMap[key] = dayMap[key] || { date: key, income: 0, expense: 0 };
      dayMap[key][tx.type] += tx.amount;
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const timeline = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = formatYMD(d);
      const { income: inc = 0, expense: exp = 0 } = dayMap[key] || {};
      timeline.push({ date: key, Net: inc - exp });
    }

    return { totalIncome: income, totalExpense: expense, net: income - expense, categoryData, timeline, filteredTx };
  }, [transactions, range]);

  if (status === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  if (status === 'unauthenticated')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Please sign in.</p>
      </div>
    );

  const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {/* Date Range Picker */}
        <motion.div className="bg-indigo-600 text-white p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {presetRanges.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  if (p.custom) setRange(p.custom(new Date()));
                  else setRange([new Date(today.getTime() - (p.days - 1) * 86400000), today]);
                }}
                className="px-3 py-1 bg-white text-indigo-700 rounded hover:bg-indigo-200 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={formatYMD(range[0])}
              onChange={e => setRange([new Date(e.target.value), range[1]])}
              className="border px-2 py-1 bg-white text-indigo-700 rounded"
            />
            <span>to</span>
            <input
              type="date"
              value={formatYMD(range[1])}
              onChange={e => setRange([range[0], new Date(e.target.value)])}
              className="border px-2 py-1 bg-white text-indigo-700 rounded"
            />
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Income', value: totalIncome, color: 'text-green-600' },
            { label: 'Expense', value: totalExpense, color: 'text-red-600' },
            { label: 'Net', value: net, color: net >= 0 ? 'text-green-800' : 'text-red-800' },
            { label: 'Savings Rate', value: totalIncome ? (net / totalIncome * 100).toFixed(1) : 0, suffix: '%', color: 'text-blue-600' }
          ].map((k, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
              whileHover={{ y: -2 }}
            >
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className={`text-2xl font-semibold mt-1 ${k.color}`}> {currency(k.value)}{k.suffix || ''} </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {categoryData.map((e, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={val => currency(val)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No expenses</p>
            )}
          </motion.div>

          <motion.div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Net Cash Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" tickFormatter={dateFormatter} />
                <YAxis />
                <Tooltip formatter={val => currency(val)} />
                <Legend />
                <Line type="monotone" dataKey="Net" stroke="#4ade80" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-indigo-600 hover:underline text-sm"
            >
              {showAll ? 'Show Less' : 'Show All'}
            </button>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {(showAll ? filteredTx : filteredTx.slice(0, 5))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((tx, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {dateFormatter(tx.date)} — {tx.description}
                  </span>
                  <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'income' ? '+' : '-'}{currency(tx.amount)}
                  </span>
                </li>
              ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
