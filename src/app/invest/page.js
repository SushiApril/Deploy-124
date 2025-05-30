'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const symbols = ['AAPL', 'MSFT', 'GOOGL'];

export default function InvestPage() {
  const [stocks, setStocks] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          symbols.map(sym =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=d0t2jt1r01qid5qcbvrgd0t2jt1r01qid5qcbvs0`)
          )
        );
        const data = {};
        symbols.forEach((symbol, idx) => {
          data[symbol] = responses[idx].data;
        });
        setStocks(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching stock info');
      }
    };
    fetchData();
  }, []);

  const renderChart = (symbol, stock) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full md:w-1/2">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{symbol}</h2>
        <p className="text-gray-700">Current Price: <strong>${stock.c}</strong></p>
        <p className="text-gray-600">Change: {stock.d} ({stock.dp}%)</p>
        <p className="text-gray-500">High: ${stock.h} | Low: ${stock.l}</p>

        {/* Dummy chart: You can replace with real historic data from another API */}
        <Line
          data={{
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM'],
            datasets: [
              {
                label: `${symbol} Price`,
                data: [stock.c - 2, stock.c - 1, stock.c, stock.c + 1, stock.c],
                fill: false,
                borderColor: 'rgb(99, 102, 241)',
              },
            ],
          }}
        />
      </div>
    );
  };

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="bg-indigo-600 text-white p-6 rounded-lg text-center shadow-md">
        <h1 className="text-3xl font-bold">📈 Invest</h1>
        <p className="text-lg mt-2">Check out today’s top stock picks!</p>
      </div>

      {error ? (
        <p className="text-red-500 mt-6">{error}</p>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center mt-6">
          {Object.entries(stocks).map(([symbol, data]) => (
            <React.Fragment key={symbol}>
                {renderChart(symbol, data)}
            </React.Fragment>
            ))}

        </div>
      )}
    </main>
  );
}
