'use client'; // Ensure this directive is at the top of your file

import { useState } from 'react';
import styles from './Header.module.css'; // Import the CSS module

const CalendarPage = () => {
  // Initial data for the month (can be dynamic or pulled from an API in a real application)
  const [currentBalance, setCurrentBalance] = useState(350);

  // Sample data for transactions (this could be dynamic in a real app)
  const transactions = [
    { date: 1, type: 'income', amount: 2500, description: 'Payday' },
    { date: 2, type: 'income', amount: 2000 },
    { date: 8, type: 'expense', amount: 150, description: 'Expense 1' },
    { date: 12, type: 'expense', amount: 200, description: 'Rent' },
    { date: 15, type: 'expense', amount: 50, description: 'Expense 2' },
    { date: 25, type: 'expense', amount: 120, description: 'Expense 3' },
    // Add more transactions as needed
  ];

  // Get the current month and year (you can modify it for dynamic month-year display)
  const currentMonth = 'May 2025';

  // Calculate total income and total expenses to compute net gain/loss
  const calculateNetGainLoss = () => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const netGainLoss = totalIncome - totalExpenses;
    return netGainLoss;
  };

  const netGainLoss = calculateNetGainLoss();

  // Function to format the amount with a positive/negative sign
  const formatAmount = (amount) => {
    return amount > 0 ? `+${amount}` : amount;
  };

  // Function to display transactions on the calendar
  const getTransactionForDate = (date) => {
    const transaction = transactions.find((t) => t.date === date);
    return transaction ? (
      <span style={{ color: transaction.type === 'income' ? 'green' : 'red' }}>
        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
      </span>
    ) : null;
  };

  return (
    <div className="container">
      {/* Header Box with styles from the CSS module */}
      <div className={styles.headerBox}>
        <header className={styles.headerContent}>
          <h2>{currentMonth}</h2>
          <div className={styles.balanceInfo}>
            <p>Net Gain/Loss: ${netGainLoss}</p>
            <p>Current Balance: ${currentBalance}</p>
          </div>
        </header>
      </div>

      {/* Calendar */}
      <div className="calendar">
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="calendar-cell header">{day}</div>
          ))}
          {Array.from({ length: 30 }).map((_, index) => {
            const date = index + 1;
            return (
              <div key={date} className="calendar-cell">
                <span>{date}</span>
                {getTransactionForDate(date)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
