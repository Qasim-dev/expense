import React from 'react';
import PageShell from '../components/layout/PageShell';

const faqs = [
  {
    question: 'How do I add an expense?',
    answer: 'Use the “+ Add Expense” button on any ledger page, fill the form, and save. Entries sync automatically.',
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Yes. We cache your data locally and sync to the server whenever you regain connectivity.',
  },
  {
    question: 'How do I track a goal?',
    answer: 'Visit the Goals page, set a target amount/date, and log contributions as you save.',
  },
];

const Help = () => {
  return (
    <PageShell
      title="Help Center"
      badge="Support"
      description="Browse quick answers or reach out to us directly—your expense coach is always nearby."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">FAQs</h2>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                <p className="text-sm text-slate-500 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Contact us</h2>
          <div className="border border-slate-100 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Email</p>
            <p className="text-sm font-semibold text-slate-900">support@expense.app</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-4">
            <p className="text-xs text-slate-500 uppercase">Live chat</p>
            <p className="text-sm text-slate-500">Available 9am–9pm IST</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Help;
