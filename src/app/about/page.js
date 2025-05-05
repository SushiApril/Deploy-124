'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      title: "User Authentication & Profiles",
      items: [
        "Secure registration and login (includiting two-factor authentication)",
        "Personalized dashboards showing income, expenses, and overallbance"
      ]
    },
    {
      title: "Expense and Income Tracking",
      items: [
        "Manual entry of income and expenses with date, description, amount, and payment method",
        "Categorization of transactions (e.g., groceries, rent, utilities, entertainment)"
      ]
    },
    {
      title: "Budget Planning & Monitoring",
      items: [
        "Setting monthly or weekly budget limits per spending category",
        "Visual progress indicators (progress bars, color-coded alerts) to track spending against budgets",
        "Notifications for approaching or exceeding budget limits"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Our Financial Management App
          </h1>
          <p className="text-xl text-gray-600">
            Your comprehensive solution for personal finance management
          </p>
        </motion.div>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {feature.title}
                </h2>
                <ul className="space-y-4">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            Ready to take control of your finances?{' '}
            <a href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Get started today
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 