"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [localUser, setLocalUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setLocalUser(JSON.parse(userData));
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/financial/transactions')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setTransactions(data.transactions || []))
      .catch(err => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [status]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    signOut({ callbackUrl: '/login' });
    router.push('/login');
  };

  const user = localUser || session?.user;
  if (status === 'loading' && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Please sign in.</div>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const thisMonthsTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const monthlyIncome = thisMonthsTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = thisMonthsTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Find the biggest expense this month
  const biggestExpense = thisMonthsTransactions
    .filter(t => t.type === 'expense')
    .reduce((max, current) => current.amount > (max?.amount || 0) ? current : max, null);

  const savingsRate = monthlyIncome ? ((monthlyBalance / monthlyIncome) * 100) : 0;
  const cappedSavings = Math.min(savingsRate, 50);
  const financialHealthScore = Math.round((cappedSavings / 50) * 100);

  const healthEmoji = financialHealthScore >= 80 ? '💪' : financialHealthScore >= 50 ? '🙂' : financialHealthScore >= 20 ? '😟' : '😵';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      <motion.div {...fadeIn} className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white mt-4 py-14 px-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-4xl font-bold">Welcome back, {user.name?.split(' ')[0]} 👋</h1>
          <p className="text-md text-indigo-100">
            Staying on top of your finances starts here. Log any income or expenses for <span className="font-semibold">{monthName}</span> to keep your budget updated.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/expense">
              <button className="bg-white text-indigo-700 px-5 py-2 rounded font-medium hover:bg-indigo-100 transition">
                Add Expense
              </button>
            </Link>
            <Link href="/income">
              <button className="bg-white text-indigo-700 px-5 py-2 rounded font-medium hover:bg-green-100 transition">
                Add Income
              </button>
            </Link>
            <Link href="/calendar">
              <button className="bg-white text-indigo-700 px-5 py-2 rounded font-medium hover:bg-indigo-100 transition flex items-center gap-1">
                <CalendarDays size={18} /> Calendar
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <motion.div {...fadeIn} className="pt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">{monthName}'s Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-sm text-gray-500">Expenses</h3>
              <p className="text-2xl font-semibold text-red-600">${monthlyExpenses}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-sm text-gray-500">Income</h3>
              <p className="text-2xl font-semibold text-green-600">${monthlyIncome}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-sm text-gray-500">Remaining</h3>
              <p className="text-2xl font-semibold text-blue-600">${monthlyBalance}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-sm text-gray-500">Health Score</h3>
              <motion.p
                className="text-2xl font-semibold text-indigo-600"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {financialHealthScore}/100 {healthEmoji}
              </motion.p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/summary">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full text-sm shadow transition-all">
                View Full Summary
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Budgeting Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 mb-2">Tip 1</h3>
              <p className="text-sm text-gray-700">Manage your expenses wisely.</p>
              <div className="mt-2 flex gap-2 text-xs text-white">
                <span className="bg-blue-500 rounded-full px-2 py-1">Budgeting</span>
                <span className="bg-purple-500 rounded-full px-2 py-1">Finance</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 mb-2">Tip 2</h3>
              <p className="text-sm text-gray-700">Set saving goals for a secure future.</p>
              <div className="mt-2 flex gap-2 text-xs text-white">
                <span className="bg-green-500 rounded-full px-2 py-1">Saving</span>
                <span className="bg-pink-500 rounded-full px-2 py-1">Goals</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="py-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Saving Recommendations</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
            {biggestExpense ? (
              <>
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2">Biggest Expense This Month</h4>
                  <p className="text-sm text-gray-700">
                    Your largest expense was <span className="font-semibold text-red-600">${biggestExpense.amount.toFixed(2)}</span> for {biggestExpense.description} on {new Date(biggestExpense.date).toLocaleDateString()}.
                  </p>
                  {biggestExpense.category && (
                    <p className="text-sm text-gray-600 mt-1">
                      Category: <span className="font-medium">{biggestExpense.category}</span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Consider reviewing your spending patterns and look for opportunities to reduce expenses in this category.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-700 mb-4">
                Add more expense entries to receive personalized saving recommendations based on your spending patterns.
              </p>
            )}
            <div className="flex gap-2">
              {!biggestExpense && <span className="bg-gray-200 px-2 py-1 rounded text-xs">Coming Soon</span>}
              <Link href="/expense">
                <button className="bg-indigo-600 text-white px-4 py-1 rounded text-sm">Add Expenses</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed top-4 right-4 z-10">
        <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition">
          Sign Out
        </button>
      </div>
    </div>
  );
}
