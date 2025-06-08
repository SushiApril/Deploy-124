'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

const fetcher = (url) =>
  fetch(url, { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then(data => data.expenses);

export default function ExpensePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // 1. SWR load & revalidate every 30s
  const { data: expenses = [], error, mutate } = useSWR(
    '/api/expense',
    fetcher,
    { refreshInterval: 30000 }
  );

  if (error) return <div className="text-red-600">Error loading expenses.</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ date: '', description: '', category: '', amount: '' });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/expense?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete expense: ${res.status} ${res.statusText}`);
      }

      // Update the cache by removing the deleted expense
      mutate(prev => prev.filter(expense => expense._id !== id), false);
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete expense. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = '/api/expense';
      const body = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        body._id = editingExpense._id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingExpense ? 'update' : 'add'} expense: ${res.status} ${res.statusText}`);
      }

      const saved = await res.json();
      
      if (editingExpense) {
        // Update the cache by replacing the edited expense
        mutate(prev => prev.map(expense => 
          expense._id === saved._id ? saved : expense
        ), false);
      } else {
        // Append to cache for new expenses
        mutate(prev => [...prev, saved], false);
      }

      resetForm();
    } catch (err) {
      console.error(`${editingExpense ? 'Update' : 'Add'} error:`, err);
      alert(err.message || `Failed to ${editingExpense ? 'update' : 'add'} expense. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, x) => sum + x.amount, 0);
  const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

  // Calculate average per category
  const categoryAverages = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, count: 0 };
    }
    acc[expense.category].total += expense.amount;
    acc[expense.category].count += 1;
    return acc;
  }, {});

  // Calculate final averages per category
  Object.keys(categoryAverages).forEach(category => {
    categoryAverages[category] = categoryAverages[category].total / categoryAverages[category].count;
  });

  const getRowColor = (amount) => {
    if (expenses.length === 0) return 'bg-white';
    return amount > averageAmount ? 'bg-red-200' : 'bg-green-200';
  };

  const shouldShowFlag = (expense) => {
    const categoryAvg = categoryAverages[expense.category];
    // Show flag if expense is more than 50% higher than category average
    return categoryAvg && expense.amount > (categoryAvg * 1.5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-gray-900 mb-8"
        >
          Expenses
        </motion.h1>

        {expenses.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">
              Average Expense: <span className="font-semibold text-gray-800">${averageAmount.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              🚩 indicates expenses that are 50% higher than their category average
            </p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition"
          >
            {showForm ? 'Cancel' : 'Add Expense'}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            {['date','description','category','amount'].map((field) => (
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
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-black"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition"
              >
                {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              {editingExpense && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.form>
        )}

        <table className="w-full table-auto border-collapse bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-700">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Amount</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className={`${getRowColor(expense.amount)} border border-gray-300`}>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">{expense.date}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {expense.description}
                  {shouldShowFlag(expense) && (
                    <span className="ml-2" title={`This expense is significantly higher than the average for ${expense.category}`}>
                      🚩
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {expense.category}
                  {shouldShowFlag(expense) && (
                    <span className="text-sm text-gray-600 ml-2">
                      (Avg: ${categoryAverages[expense.category].toFixed(2)})
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-2 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                      title="Edit expense"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      disabled={deleteLoading === expense._id}
                      className="px-2 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete expense"
                    >
                      {deleteLoading === expense._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length > 0 && (
              <tr className="font-semibold bg-gray-200 border border-gray-300">
                <td className="border border-gray-300 px-4 py-2 text-gray-900" colSpan="4">Total</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">${totalAmount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
