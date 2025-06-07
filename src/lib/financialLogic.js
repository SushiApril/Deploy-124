// src/lib/financialLogic.js

// Helper to format a Date object as YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get week label by Sunday start date (YYYY-MM-DD)
function getWeekLabel(date) {
  // JavaScript getDay: Sunday=0
  const day = date.getDay();
  const diff = date.getDate() - day; // shift back to Sunday
  const sunday = new Date(date);
  sunday.setDate(diff);
  return formatDate(sunday);
}

// Get month label as YYYY-MM
function getMonthLabel(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function summarize(docs, labelFn) {
  return docs.reduce((acc, { date, type, amount }) => {
    const dt = new Date(date);
    const label = labelFn(dt);

    if (!acc[label]) acc[label] = { income: 0, expense: 0, net: 0 };

    if (type === 'income') {
      acc[label].income += amount;
      acc[label].net += amount;
    } else if (type === 'expense') {
      acc[label].expense += amount;
      acc[label].net -= amount;
    }

    return acc;
  }, {});
}

export function summarizeByDay(docs) {
  return summarize(docs, formatDate);
}

export function summarizeByWeek(docs) {
  return summarize(docs, getWeekLabel);
}

export function summarizeByMonth(docs) {
  return summarize(docs, getMonthLabel);
}
