import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Search, Bitcoin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const cryptoPairs = [
  { pair: "BTC/USDT", price: "43,250.00", change: "+2.45%", positive: true },
  { pair: "ETH/USDT", price: "2,280.50", change: "+1.82%", positive: true },
  { pair: "SOL/USDT", price: "98.75", change: "-0.95%", positive: false },
  { pair: "BNB/USDT", price: "312.40", change: "+3.21%", positive: true },
  { pair: "XRP/USDT", price: "0.5842", change: "-1.24%", positive: false },
  { pair: "ADA/USDT", price: "0.4521", change: "+0.87%", positive: true },
];

const forexPairs = [
  { pair: "EUR/USD", price: "1.0845", change: "+0.12%", positive: true },
  { pair: "GBP/USD", price: "1.2634", change: "-0.08%", positive: false },
  { pair: "USD/JPY", price: "148.52", change: "+0.34%", positive: true },
  { pair: "AUD/USD", price: "0.6523", change: "-0.15%", positive: false },
  { pair: "USD/CAD", price: "1.3542", change: "+0.21%", positive: true },
  { pair: "EUR/GBP", price: "0.8584", change: "+0.05%", positive: true },
];

const Trading = () => {
  const [selectedPair, setSelectedPair] = useState(cryptoPairs[0]);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [marketType, setMarketType] = useState<"crypto" | "forex">("crypto");

  const currentPairs = marketType === "crypto" ? cryptoPairs : forexPairs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trading</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search pairs..."
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      </div>

      <Tabs value={marketType} onValueChange={(v) => setMarketType(v as "crypto" | "forex")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-primary">
            <Bitcoin className="w-4 h-4 mr-2" />
            Cryptocurrency
          </TabsTrigger>
          <TabsTrigger value="forex" className="data-[state=active]:bg-primary">
            <DollarSign className="w-4 h-4 mr-2" />
            Forex
          </TabsTrigger>
        </TabsList>

        <TabsContent value={marketType} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Pairs */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                {marketType === "crypto" ? "Crypto Pairs" : "Forex Pairs"}
              </h2>
              <div className="space-y-2">
                {currentPairs.map((pair) => (
              <button
                key={pair.pair}
                onClick={() => setSelectedPair(pair)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedPair.pair === pair.pair
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pair.pair}</span>
                  <span
                    className={
                      pair.positive ? "text-green-500" : "text-red-500"
                    }
                  >
                    {pair.change}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mt-1">${pair.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{selectedPair.pair}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${selectedPair.price}</span>
              <span
                className={`flex items-center gap-1 ${
                  selectedPair.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {selectedPair.positive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {selectedPair.change}
              </span>
            </div>
          </div>
          <div className="h-[300px] bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
            Chart visualization area
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="glass rounded-xl p-6">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setOrderType("buy")}
            className={orderType === "buy" ? "button-gradient" : ""}
            variant={orderType === "buy" ? "default" : "outline"}
          >
            Buy
          </Button>
          <Button
            onClick={() => setOrderType("sell")}
            className={orderType === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
            variant={orderType === "sell" ? "default" : "outline"}
          >
            Sell
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Price</label>
              <Input
                type="number"
                placeholder={selectedPair.price}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Total</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button
              className={
                orderType === "buy"
                  ? "button-gradient w-full"
                  : "bg-red-600 hover:bg-red-700 w-full"
              }
            >
              {orderType === "buy" ? "Buy" : "Sell"} {selectedPair.pair.split("/")[0]}
            </Button>
            </div>
          </div>
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trading;
