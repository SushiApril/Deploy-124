'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [localUser, setLocalUser] = useState(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setLocalUser(JSON.parse(userData));
    } else if (status === 'unauthenticated' && !session) {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleLogout = () => {
    if (localUser) {
      localStorage.removeItem('user');
      setLocalUser(null);
    } else {
      signOut({ callbackUrl: '/login' });
    }
    router.push('/login');
  };

  const user = localUser || session?.user;

  if (status === 'loading' && !localUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      {/* Header Banner */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="bg-indigo-600 text-white py-14 text-center px-4"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome, {user.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-indigo-100">Track your expenses and manage your budget effectively.</p>
        <Link href="/expense">
          <button className="mt-6 bg-white text-indigo-700 px-5 py-2 rounded font-medium hover:bg-indigo-100 transition">
            Add Expense
          </button>
        </Link>
      </motion.div>

      {/* Budgeting Tips */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.3 }}
        className="py-12 px-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Budgeting Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-2">Tip 1</h3>
            <p className="text-sm text-gray-700 mb-2">Manage your expenses wisely.</p>
            <div className="flex gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Budgeting</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Finance</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-2">Tip 2</h3>
            <p className="text-sm text-gray-700 mb-2">Set saving goals for a secure future.</p>
            <div className="flex gap-2">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Saving</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Goals</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Budget Overview */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.5 }}
        className="py-12 px-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Budget Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-xl font-semibold text-gray-900">$XXXX</p>
            <p className="text-sm text-red-500">-5%</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Remaining Budget</h3>
            <p className="text-xl font-semibold text-gray-900">$XXXX</p>
            <p className="text-sm text-green-500">+10%</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">Monthly Income</h3>
            <p className="text-xl font-semibold text-gray-900">$XXXX</p>
          </div>
        </div>
      </motion.div>

      {/* Personalized Saving Recommendations */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        transition={{ delay: 0.7 }}
        className="py-12 px-6 max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Saving Recommendations</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Placeholder Recommendation */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600 mb-2">Add more expense entries to receive personalized saving recommendations based on your spending patterns.</p>
              <div className="flex gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Coming Soon</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Add Expenses</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 text-center">
            <Link href="/expense">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition">
                Add Expenses
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
