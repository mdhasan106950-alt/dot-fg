import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ServerSettings, Order } from '../../types';
import {
  CreditCard,
  Save,
  CheckCircle2,
  Phone,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPayments: React.FC = () => {
  const queryClient = useQueryClient();
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchTx, setSearchTx] = useState('');

  const { data: settings } = useQuery<ServerSettings>({
    queryKey: ['serverSettings'],
    queryFn: () => api.getCMS(),
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: () => api.getOrders(),
  });

  useEffect(() => {
    if (settings) {
      setBkashNumber(settings.bkashNumber || '01821925430');
      setNagadNumber(settings.nagadNumber || '01821925430');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<ServerSettings>) => api.updateAdminSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverSettings'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(`Failed to save payment settings: ${err.message}`);
    },
  });

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      bkashNumber,
      nagadNumber,
    });
  };

  const totalRevenue = orders
    ?.filter((o) => ['PAID', 'DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + (o.finalTotal || 0), 0) || 0;

  const pendingVerificationCount = orders?.filter((o) =>
    ['PAYMENT_SUBMITTED', 'VERIFYING'].includes(o.status)
  ).length || 0;

  const filteredTransactions = orders?.filter((o) => {
    if (!searchTx) return true;
    return (
      o.transactionRef.toLowerCase().includes(searchTx.toLowerCase()) ||
      o.senderNumber.includes(searchTx) ||
      o.id.toLowerCase().includes(searchTx.toLowerCase()) ||
      o.buyer.email.toLowerCase().includes(searchTx.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Payments & Merchant Gateways
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure receiving merchant numbers for bKash and Nagad, audit transaction references, and track gross store receipts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Payment receiving credentials updated successfully!</span>
        </div>
      )}

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Verified Paid Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ৳{totalRevenue} <span className="text-xs text-emerald-400">BDT</span>
          </div>
          <div className="text-[11px] text-zinc-500">Delivered & verified orders</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Awaiting Verification</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {pendingVerificationCount}
          </div>
          <div className="text-[11px] text-zinc-500">Manual review needed in Orders queue</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Supported Gateways</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#e2136e]/20 text-[#e2136e] font-mono text-xs font-bold border border-[#e2136e]/30">
              bKash
            </span>
            <span className="px-2 py-0.5 rounded bg-[#f7941d]/20 text-[#f7941d] font-mono text-xs font-bold border border-[#f7941d]/30">
              Nagad
            </span>
          </div>
          <div className="text-[11px] text-zinc-500">Bangladeshi MFS Personal / Merchant 'Send Money'</div>
        </div>
      </div>

      {/* Payment Gateway Account Configuration */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-400" />
              <span>Active Payment Receiving Numbers</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              These phone numbers are displayed directly on the customer checkout page for "Send Money" payments.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAccounts} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5 font-mono">
                <span>bKash Personal / Agent Number</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">018XXXXXXXX</span>
            </div>
            <input
              type="text"
              required
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              placeholder="01821925430"
              className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
            />
            <p className="text-[11px] text-zinc-500">
              Displayed as the official bKash destination account.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                <span>Nagad Personal / Agent Number</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">018XXXXXXXX</span>
            </div>
            <input
              type="text"
              required
              value={nagadNumber}
              onChange={(e) => setNagadNumber(e.target.value)}
              placeholder="01821925430"
              className="w-full px-3 py-2 rounded-lg bg-black border border-zinc-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500">
              Displayed as the official Nagad destination account.
            </p>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-purple-950/40"
            >
              <Save className="w-4 h-4" />
              <span>{updateMutation.isPending ? 'Saving Numbers...' : 'Save Payment Numbers'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Transaction Quick Search & Audit Feed */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Payment Transaction Lookup</h2>
            <p className="text-xs text-zinc-400">Search customer transaction IDs (TrxID) to verify in bKash/Nagad app.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TrxID or Sender Phone..."
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Sender Phone</th>
                <th className="py-2.5 px-3">TrxID / Reference</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredTransactions.slice(0, 10).map((o) => (
                <tr key={o.id} className="hover:bg-zinc-900/40">
                  <td className="py-3 px-3 text-white font-bold">{o.id}</td>
                  <td className="py-3 px-3 uppercase font-bold text-purple-400">{o.paymentMethod}</td>
                  <td className="py-3 px-3 text-zinc-300">{o.senderNumber}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{o.transactionRef}</td>
                  <td className="py-3 px-3 text-white">৳{o.finalTotal} BDT</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.status === 'DELIVERED' || o.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-purple-400 hover:text-white inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
