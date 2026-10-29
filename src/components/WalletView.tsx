import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CreatorWallet, PayoutRecord } from '../types';
import { soundEffects } from '../utils/audio';

interface WalletViewProps {
  wallet: CreatorWallet;
  onWithdraw: (record: PayoutRecord) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet, onWithdraw }) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>(
    wallet.availableBalance > 0 ? wallet.availableBalance.toFixed(2) : '100.00'
  );
  const [withdrawMethod, setWithdrawMethod] = useState<'PayPal' | 'Bank Wire' | 'Stripe' | 'USDC Crypto'>('PayPal');
  const [destinationAccount, setDestinationAccount] = useState<string>('alex.rivera@creativemail.io');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<PayoutRecord | null>(null);

  // Earnings Simulator state
  const [calcViews, setCalcViews] = useState<number>(50000);
  const [calcTipsPerVideo, setCalcTipsPerVideo] = useState<number>(35);
  const [calcVideosPerMonth, setCalcVideosPerMonth] = useState<number>(8);

  // Payout math:
  // - Creator Fund: ~$2.50 per 1,000 views
  // - Direct Tips: calcVideosPerMonth * calcTipsPerVideo
  // - Bounty Bonus: 1 bounty participation estimated $200
  const estimatedFund = (calcViews / 1000) * 2.5;
  const estimatedTips = calcVideosPerMonth * calcTipsPerVideo;
  const estimatedBounties = calcVideosPerMonth >= 4 ? 350 : 150;
  const totalEstimatedMonthly = estimatedFund + estimatedTips + estimatedBounties;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > wallet.availableBalance) return;

    setIsProcessing(true);

    setTimeout(() => {
      soundEffects.playCashoutDing();
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#38bdf8'],
      });

      const newRecord: PayoutRecord = {
        id: `tx_${Date.now().toString().slice(-4)}`,
        amount,
        method: withdrawMethod,
        destination: destinationAccount.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      };

      onWithdraw(newRecord);
      setSuccessReceipt(newRecord);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header section with Balance Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Creator Earnings & Wallet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time revenue from viewer super-tips, creator fund pools, and sponsored bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-300">Payout Status:</span>
            <span className="text-xs font-bold text-emerald-400">Next Payout Ready</span>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards (§1.C: single-elevation depth) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available to Cash Out</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            ${wallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            Ready for instant withdrawal (0% transfer fee)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lifetime Creator Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            ${wallet.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500">
            Generated across all posted video clips
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Revenue Breakdown</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Viewer Tips:</span>
              <span className="font-mono tabular-nums font-semibold text-amber-400">
                ${wallet.tipsEarned.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Creator Fund:</span>
              <span className="font-mono tabular-nums font-semibold text-sky-400">
                ${wallet.creatorFundEarned.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Bounty Prizes:</span>
              <span className="font-mono tabular-nums font-semibold text-rose-400">
                ${wallet.bountiesEarned.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashout Drawer & Earnings Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cashout / Withdrawal Flow */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Withdraw Creator Funds</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Balance: ${wallet.availableBalance.toFixed(2)}
            </span>
          </div>

          {successReceipt && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Payout Dispatched Successfully!</span>
              </div>
              <p>
                Sent ${successReceipt.amount.toFixed(2)} via {successReceipt.method} to{' '}
                <strong className="text-white">{successReceipt.destination}</strong>.
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Transaction Ref: {successReceipt.txHash}
              </p>
            </div>
          )}

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-slate-300">Withdrawal Amount ($USD)</label>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(wallet.availableBalance.toFixed(2))}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Withdraw All Max
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  max={wallet.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-8 pr-4 py-2 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Withdrawal Destination Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['PayPal', 'Bank Wire', 'Stripe', 'USDC Crypto'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setWithdrawMethod(method);
                      if (method === 'PayPal') setDestinationAccount('alex.rivera@creativemail.io');
                      else if (method === 'Bank Wire') setDestinationAccount('Chase Checking ····4821');
                      else if (method === 'Stripe') setDestinationAccount('acct_1NZs9120');
                      else setDestinationAccount('0x32A...79f1 (Polygon USDC)');
                    }}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center truncate ${
                      withdrawMethod === method
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Account Email / IBAN / Wallet Address
              </label>
              <input
                type="text"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet.availableBalance}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-400/10 active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isProcessing
                  ? 'Processing Transfer...'
                  : `Execute Payout of $${parseFloat(withdrawAmount || '0').toFixed(2)}`}
              </span>
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Transfers arrive in 1–2 business hours. Bank wire settlements follow ACH schedules.
            </p>
          </form>
        </div>

        {/* Right: Dynamic Video Earnings Simulator */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Video Earnings Potential Calculator</h3>
            </div>
            <span className="text-xs font-semibold text-amber-400">Interactive</span>
          </div>

          <p className="text-xs text-slate-400">
            Estimate how much money you can earn each month on VidPulse based on your posting consistency and audience interaction.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Monthly Video Views:</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  {calcViews.toLocaleString()} views
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcViews}
                onChange={(e) => setCalcViews(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Videos Posted Per Month:</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  {calcVideosPerMonth} videos
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={calcVideosPerMonth}
                onChange={(e) => setCalcVideosPerMonth(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Average Tips Per Video:</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  ${calcTipsPerVideo} / video
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={calcTipsPerVideo}
                onChange={(e) => setCalcTipsPerVideo(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 block">Estimated Monthly Earnings</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              ${totalEstimatedMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-slate-500 font-normal ml-1">/ month</span>
            </div>
            <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
              <span>• Tips: ${estimatedTips.toFixed(0)}</span>
              <span>• Creator Fund: ${estimatedFund.toFixed(0)}</span>
              <span>• Bounties: ${estimatedBounties.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Payout Records</h3>
            <p className="text-xs text-slate-400">Complete audit trail of all withdrawals and disbursements.</p>
          </div>
          <button
            onClick={() => {
              alert('Downloading monthly tax and earnings statement (PDF/CSV)...');
            }}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Transaction ID</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5">Destination</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {wallet.payoutHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-300 font-medium">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">{item.date}</td>
                  <td className="py-3.5 px-5 text-white font-medium">{item.method}</td>
                  <td className="py-3.5 px-5 text-slate-400 font-mono truncate max-w-[200px]">
                    {item.destination}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-emerald-400">
                    +${item.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {item.status}
                    </span>
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
