import React, { useMemo, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import PageShell from '../components/layout/PageShell';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const buildInitialCards = (name) => [
  {
    id: 'visa',
    brand: 'Visa',
    nickname: 'Daily driver',
    holder: name,
    last4: '9214',
    limit: 150000,
    balance: 56240,
    spendCap: 60000,
    isFrozen: false,
  },
  {
    id: 'master',
    brand: 'Mastercard',
    nickname: 'Travel card',
    holder: name,
    last4: '4488',
    limit: 200000,
    balance: 98200,
    spendCap: 120000,
    isFrozen: true,
  },
];

const Cards = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { formatWhole } = useCurrencyFormatter();
  const [cards, setCards] = useState(buildInitialCards(user?.name || 'You'));
  const [selectedCard, setSelectedCard] = useState(cards[0]?.id || null);

  const activeCard = useMemo(() => cards.find((card) => card.id === selectedCard) || cards[0], [cards, selectedCard]);

  const handleToggleFreeze = (id) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, isFrozen: !card.isFrozen } : card)));
  };

  const handleSpendCapChange = (id, value) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, spendCap: Number(value) } : card))
    );
  };

  const handleAddCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      brand: 'Virtual',
      nickname: 'New card',
      holder: user?.name || 'You',
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      limit: 100000,
      balance: 0,
      spendCap: 25000,
      isFrozen: false,
    };
    setCards((prev) => [newCard, ...prev]);
    setSelectedCard(newCard.id);
  };

  return (
    <PageShell
      title="Cards"
      badge="Payments"
      description="Control every card in one place—freeze, set spending rules, and keep tabs on balances."
      actions={
        <button
          onClick={handleAddCard}
          className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
        >
          + Create virtual card
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className={`w-full text-left border rounded-3xl p-4 shadow-sm transition-shadow ${
                selectedCard === card.id ? 'border-indigo-200 shadow-lg shadow-indigo-100' : 'border-slate-100 bg-white dark:bg-slate-800'
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">{card.brand}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{card.nickname}</p>
              <p className="text-sm text-slate-500 mt-1">•••• {card.last4}</p>
              <p className="text-xs text-slate-400 mt-2">
                Limit {formatWhole(card.limit)} · Balance {formatWhole(card.balance)}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeCard ? (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-3xl p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/80">{activeCard.brand} • {activeCard.nickname}</p>
                  <p className="text-2xl font-semibold mt-2">{activeCard.holder}</p>
                </div>
                <p className="text-sm font-semibold">{activeCard.isFrozen ? 'Frozen' : 'Active'}</p>
              </div>
              <div className="mt-10 flex items-center justify-between text-lg font-semibold">
                <span>•••• •••• •••• {activeCard.last4}</span>
                <span>{new Date().getFullYear() + 3}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm text-slate-500">
              Add a card to get started.
            </div>
          )}

          {activeCard && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Card status</p>
                  <p className="text-lg font-semibold text-slate-900">{activeCard.isFrozen ? 'Frozen' : 'Ready to spend'}</p>
                </div>
                <button
                  onClick={() => handleToggleFreeze(activeCard.id)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border ${
                    activeCard.isFrozen ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-rose-200 text-rose-600 bg-rose-50'
                  }`}
                >
                  {activeCard.isFrozen ? 'Unfreeze card' : 'Freeze card'}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2 text-slate-500">
                  <span>Spending cap</span>
                  <span>
                    {formatWhole(activeCard.spendCap)} / {formatWhole(activeCard.limit)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={activeCard.limit}
                  value={activeCard.spendCap}
                  onChange={(e) => handleSpendCapChange(activeCard.id, e.target.value)}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Recent activity</p>
                <div className="space-y-3">
                  {['OneCard Recharge', 'Swiggy Instamart', 'Uber Ride'].map((txn, index) => (
                    <div key={txn} className="flex items-center justify-between border border-slate-100 rounded-2xl px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{txn}</p>
                        <p className="text-xs text-slate-500">{index + 12} Jun 2025</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{formatWhole(Math.random() * 2000 + 500)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Cards;
