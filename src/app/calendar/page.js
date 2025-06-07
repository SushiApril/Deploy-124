"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [allTx, setAllTx] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Displayed month state
  const [displayDate, setDisplayDate] = useState(new Date());
  const year = displayDate.getFullYear();
  const monthIndex = displayDate.getMonth();
  const currentMonthLabel = displayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Fetch all transactions once
  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/financial/transactions')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setAllTx(data.transactions || []);
      })
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [status]);

  // Filter whenever allTx or displayDate changes
  useEffect(() => {
    const monthTx = allTx.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });
    setFilteredTx(monthTx);
  }, [allTx, year, monthIndex]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Loading...</p></div>;
  if (status === 'unauthenticated') return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Please sign in.</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-red-600">{error}</p></div>;

  // Compute totals
  const monthIncome = filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netMonth = monthIncome - monthExpense;
  const totalIncome = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const endingBalance = totalIncome - totalExpense;

  const getTransactionTag = day => {
    const tx = filteredTx.find(t => new Date(t.date).getDate() === day);
    if (!tx) return null;
    const color = tx.type === 'income' ? 'text-green-500' : 'text-red-500';
    const sign = tx.type === 'income' ? '+' : '-';
    return <span className={`${color} text-xs font-medium`} title={tx.description || ''}>{sign}${tx.amount}</span>;
  };

  const prevMonth = () => {
    const d = new Date(year, monthIndex - 1, 1);
    setDisplayDate(d);
  };
  const nextMonth = () => {
    const d = new Date(year, monthIndex + 1, 1);
    setDisplayDate(d);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row md:justify-between"
        >
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button onClick={prevMonth} className="p-2 bg-blue-700 rounded-full hover:bg-blue-800 transition"><ChevronLeft size={24}/></button>
            <h2 className="text-2xl font-bold">{currentMonthLabel}</h2>
            <button onClick={nextMonth} className="p-2 bg-blue-700 rounded-full hover:bg-blue-800 transition"><ChevronRight size={24}/></button>
          </div>
          <div className="flex space-x-6 text-center">
            <div>
              <p className="text-sm">This Month Net</p>
              <p className={`text-xl font-bold ${netMonth>=0?'text-green-400':'text-red-400'}`}>${netMonth}</p>
            </div>
            <div>
              <p className="text-sm">Ending Balance</p>
              <p className="text-xl font-bold text-white">${endingBalance}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-7 gap-4 text-center text-gray-700 font-semibold mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: daysInMonth }).map((_,i)=>{
            const day = i+1;
            return (
              <div key={day} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition flex flex-col items-center">
                <span className="font-medium text-blue-600">{day}</span>
                <div className="mt-1">{getTransactionTag(day)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}