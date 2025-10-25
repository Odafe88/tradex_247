import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const assets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: "0.5432",
    value: "23,487.50",
    change: "+2.45%",
    positive: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: "5.2341",
    value: "11,937.82",
    change: "+1.82%",
    positive: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: "142.5",
    value: "14,071.87",
    change: "-0.95%",
    positive: false,
  },
  {
    symbol: "USDT",
    name: "Tether",
    amount: "10,000",
    value: "10,000.00",
    change: "0.00%",
    positive: true,
  },
];

const Assets = () => {
  const [hideBalance, setHideBalance] = useState(false);
  const totalValue = assets.reduce(
    (acc, asset) => acc + parseFloat(asset.value.replace(",", "")),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Assets</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setHideBalance(!hideBalance)}
          className="border-white/10"
        >
          {hideBalance ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Total Balance Card */}
      <div className="glass rounded-xl p-8">
        <div className="text-sm text-gray-400 mb-2">Total Balance</div>
        <div className="flex items-end gap-4">
          <div className="text-4xl font-bold">
            {hideBalance ? "****" : `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="flex items-center gap-1 text-green-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>+4.2%</span>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Holdings</h2>
        <div className="space-y-3">
          {assets.map((asset) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="font-bold">{asset.symbol}</span>
                </div>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-gray-400">
                    {hideBalance ? "****" : asset.amount} {asset.symbol}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium">
                  {hideBalance ? "****" : `$${asset.value}`}
                </div>
                <div
                  className={`text-sm flex items-center gap-1 justify-end ${
                    asset.positive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {asset.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {asset.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-2">Portfolio Distribution</h3>
          <div className="text-sm text-gray-400">
            View detailed breakdown of your holdings
          </div>
        </div>
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-2">Transaction History</h3>
          <div className="text-sm text-gray-400">
            View all your deposits, withdrawals, and trades
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
