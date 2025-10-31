import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTrades } from "@/hooks/useTrades";
import AIBotChart from "@/components/AIBotChart";
import { supabase } from "@/integrations/supabase/client";

const cryptoList = [
  { name: "Bitcoin", symbol: "BTC", price: "$52,291", change: "+2.45%", positive: true, icon: "₿" },
  { name: "Ethereum", symbol: "ETH", price: "$2,980", change: "+1.82%", positive: true, icon: "Ξ" },
  { name: "Cardano", symbol: "ADA", price: "$0.45", change: "-0.95%", positive: false, icon: "₳" },
  { name: "Solana", symbol: "SOL", price: "$98.75", change: "+5.21%", positive: true, icon: "◎" },
  { name: "Polkadot", symbol: "DOT", price: "$7.23", change: "-1.24%", positive: false, icon: "●" },
  { name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "+12.87%", positive: true, icon: "Ð" },
];

const Cryptocurrency = () => {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [tradeAmount, setTradeAmount] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();
  const { trades, createTrade, calculateCurrentValue } = useTrades('crypto');

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_crypto')
        .eq('id', user.id)
        .single();

      if (profile) {
        setBalance(profile.balance_crypto || 0);
      }
    };

    fetchBalance();
  }, [trades]);

  const handleTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    const selectedCryptoData = cryptoList.find(c => c.symbol === selectedCrypto);
    if (!selectedCryptoData) return;

    createTrade.mutate({
      asset_symbol: selectedCrypto,
      asset_name: selectedCryptoData.name,
      initial_amount: parseFloat(tradeAmount),
    });
    setTradeAmount("");
  };

  const activeTrade = trades.find(t => t.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Crypto</h1>
        <p className="text-muted-foreground">AI-powered cryptocurrency trading</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <Card className="lg:col-span-1 bg-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Start Trade</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Balance</span>
                </div>
                <span className="text-lg font-bold">${balance.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label>Cryptocurrency</Label>
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoList.map((crypto) => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        {crypto.name} ({crypto.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <Button 
                onClick={handleTrade} 
                className="w-full gap-2"
                disabled={createTrade.isPending || !!activeTrade || balance === 0}
              >
                <Bot className="w-4 h-4" />
                {balance === 0 ? "No Balance" : activeTrade ? "Trade Active" : "Start AI Trade"}
              </Button>

              {activeTrade && (
                <p className="text-sm text-muted-foreground text-center">
                  You have an active trade running
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Bot Chart */}
        <div className="lg:col-span-2">
          {activeTrade ? (
            <AIBotChart trade={activeTrade} calculateCurrentValue={calculateCurrentValue} />
          ) : (
            <Card className="bg-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">AI Bot Status</h2>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active trades</p>
                  <p className="text-sm text-muted-foreground">
                    Enter an amount and select a cryptocurrency to start your AI-powered trade
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cryptocurrency;
