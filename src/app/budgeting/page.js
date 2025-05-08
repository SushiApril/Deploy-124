'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';

const budgetData = [
  { name: 'Housing', amount: 1500 },
  { name: 'Food', amount: 600 },
  { name: 'Transportation', amount: 400 },
  { name: 'Savings', amount: 300 },
];

export default function BudgetPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      {/* Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="bg-indigo-600 text-white py-14 text-center px-4"
      >
        <h1 className="text-4xl font-bold mb-2">Budgeting Dashboard</h1>
        <p className="text-sm text-indigo-100">Visualize and manage your finances</p>
        <Link href="/dashboard">
          <button className="mt-6 bg-white text-indigo-700 px-5 py-2 rounded font-medium hover:bg-indigo-100 transition">
            Go to Dashboard
          </button>
        </Link>
      </motion.div>

      {/* Chart + Summary */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="py-12 px-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Spending Breakdown</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4B5563" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border rounded p-4 w-full md:w-1/3">
            <h3 className="font-semibold mb-2">Category Totals</h3>
            <ul className="space-y-2">
              {budgetData.map((item, index) => (
                <li key={index} className="flex justify-between text-gray-700">
                  <span>{item.name}</span>
                  <span>${item.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Budget Summary Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.4 }}
        className="py-12 px-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Budget Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Total Budget</h3>
            <p className="text-xl font-semibold text-gray-900">$2800</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Spent</h3>
            <p className="text-xl font-semibold text-gray-900">$2500</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Remaining</h3>
            <p className="text-xl font-semibold text-gray-900">$300</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}