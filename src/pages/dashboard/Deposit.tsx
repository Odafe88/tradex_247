import { motion } from "framer-motion";
import { Copy, QrCode, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC20)", address: "0x504b5de09385b6b776baab7076a08d7cc34f3217" },
  { symbol: "USDT", name: "Tether", network: "Ethereum (ERC20)", address: "0x504b5de09385b6b776baab7076a08d7cc34f3217" },
  { symbol: "SOL", name: "Solana", network: "Solana Network", address: "33qzZwAYnz8GDGcoYWAyxhGQQ1pnFwQtM9SJwodPiu9L" },
];

const Deposit = () => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [transactionHash, setTransactionHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's deposits
  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    toast({
      title: "Address copied",
      description: "Deposit address copied to clipboard",
    });
  };

  const verifyDeposit = async () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction hash",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('verify-deposit', {
        body: { 
          transactionHash: transactionHash.trim(), 
          chain: selectedCrypto.symbol 
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Deposit verified and credited to your account",
      });

      setTransactionHash("");
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify deposit. Please check the transaction hash and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
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
                  value={selectedCrypto.address}
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
                <li>• After sending, submit your transaction hash below to verify</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Verify Your Deposit</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter transaction hash"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="bg-white/5 border-white/10 flex-1"
                />
                <Button
                  onClick={verifyDeposit}
                  disabled={isVerifying || !transactionHash.trim()}
                  className="bg-primary hover:bg-primary/80"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Paste your transaction hash here after sending funds to verify and credit your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deposits */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Deposit History</h2>
        {depositsLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : deposits && deposits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2">Chain</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Transaction</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b border-white/5">
                    <td className="py-3 px-2">{deposit.chain}</td>
                    <td className="py-3 px-2">{deposit.amount.toFixed(6)}</td>
                    <td className="py-3 px-2">
                      <span className={`flex items-center gap-1 ${
                        deposit.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {deposit.status === 'confirmed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        {deposit.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <a
                        href={
                          deposit.chain === 'SOL'
                            ? `https://solscan.io/tx/${deposit.transaction_hash}`
                            : `https://etherscan.io/tx/${deposit.transaction_hash}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {deposit.transaction_hash.substring(0, 8)}...
                      </a>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-400">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No deposits found. After sending funds, submit your transaction hash above to verify.
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
