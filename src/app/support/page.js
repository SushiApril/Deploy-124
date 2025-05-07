'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SupportPage() {
  const [showContactForm, setShowContactForm] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const articles = [
    {
      title: 'Getting Started',
      items: [
        'Step-by-step setup instructions for new users.',
        'Common onboarding issues and how to resolve them.',
      ],
      link: '/support/getting-started',
    },
    {
      title: 'Managing Your Account',
      items: [
        'Update your profile, password, and email settings.',
        'Enable two-factor authentication and set preferences.',
      ],
      link: '/support/managing-your-account',
    },
    {
      title: 'Billing and Payments',
      items: [
        'Understand invoices and billing cycles.',
        'Update credit card or cancel subscription.',
      ],
      link: '/support/billing-and-payments',
    },
    {
      title: 'Data Security',
      items: [
        'How we store and protect your data.',
        'User controls and permissions.',
      ],
      link: '/support/data-security',
    },
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-xl text-gray-600">
            Search our knowledge base or contact us for help
          </p>
        </motion.div>

        <div className="space-y-10">
          {articles.map((section, index) => (
            <motion.a
              href={section.link}
              key={index}
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ delay: index * 0.2 }}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1"
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
            </motion.a>
          ))}
        </div>

        <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="mt-16 max-w-4xl mx-auto"
            >
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Still need help?</h2>
                <p className="text-sm text-gray-600 mb-6">
                Can’t find your answer? Drop us a message and we’ll get back to you shortly.
                </p>

                <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-md hover:bg-indigo-500 transition mb-4"
                >
                {showContactForm ? 'Hide Contact Form' : 'Contact Support'}
                </button>

                {showContactForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                >
                    <form className="space-y-6 pt-4">
                    <div>
                        <label className="block text-gray-800 font-medium text-sm mb-1">Your name</label>
                        <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 font-medium text-sm mb-1">Your email</label>
                        <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 font-medium text-sm mb-1">Your message</label>
                        <textarea
                        rows="5"
                        placeholder="Type your message here..."
                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
                        >
                        Send message
                        </button>
                    </div>
                    </form>
                </motion.div>
                )}
            </div>
            </motion.div>


      </div>
    </div>
  );
}
