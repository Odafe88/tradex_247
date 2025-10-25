import { motion } from "framer-motion";
import { Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC20)" },
  { symbol: "USDT", name: "Tether", network: "Ethereum (ERC20)" },
  { symbol: "SOL", name: "Solana", network: "Solana Network" },
];

const Deposit = () => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const { toast } = useToast();
  const depositAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9";

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    toast({
      title: "Address copied",
      description: "Deposit address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deposit Crypto</h1>
        <p className="text-gray-400">
          Select a cryptocurrency to deposit into your account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crypto Selection */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Select Cryptocurrency</h2>
          <div className="space-y-2">
            {cryptoOptions.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => setSelectedCrypto(crypto)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedCrypto.symbol === crypto.symbol
                    ? "bg-white/10 border-2 border-primary"
                    : "border-2 border-white/10 hover:bg-white/5"
                }`}
              >
                <div className="font-medium">{crypto.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {crypto.symbol} • {crypto.network}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Deposit Details */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Deposit Address</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Network
              </label>
              <Input
                value={selectedCrypto.network}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Deposit Address
              </label>
              <div className="flex gap-2">
                <Input
                  value={depositAddress}
                  disabled
                  className="bg-white/5 border-white/10 flex-1"
                />
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  size="icon"
                  className="border-white/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 flex flex-col items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400 text-center">
                QR Code for {selectedCrypto.symbol}
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="font-medium text-yellow-500 mb-2">Important</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Only send {selectedCrypto.symbol} to this address</li>
                <li>• Ensure you're using the {selectedCrypto.network}</li>
                <li>• Minimum deposit: 0.001 {selectedCrypto.symbol}</li>
                <li>• Deposits require 3 network confirmations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deposits */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Deposits</h2>
        <div className="text-center py-8 text-gray-400">
          No recent deposits found
        </div>
      </div>
    </div>
  );
};

export default Deposit;
