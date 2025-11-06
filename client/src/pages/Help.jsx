import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Help = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const faqs = [
    {
      question: 'How do I add an expense?',
      answer: 'Click on the "+ Add Expense" button on the dashboard or All Expenses page, fill in the details, and click "Add Expense".',
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Yes! The app works offline. All your data is stored locally and will sync when you come back online.',
    },
    {
      question: 'How do I set up a goal?',
      answer: 'Go to the Goals page, click "+ Add Goal", enter your target amount and date, and start tracking your progress.',
    },
    {
      question: 'How do I manage bills?',
      answer: 'Navigate to Bills & Subscriptions page, add your recurring bills, and track their due dates.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
            <p className="text-gray-600 mt-2">Find answers to common questions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;

