import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTrades } from "@/hooks/useTrades";
import AIBotChart from "@/components/AIBotChart";
import { supabase } from "@/integrations/supabase/client";

const forexPairs = [
  { pair: "EUR/USD", price: "1.0892", change: "+0.15%", positive: true, name: "Euro / US Dollar" },
  { pair: "GBP/USD", price: "1.2734", change: "+0.28%", positive: true, name: "British Pound / US Dollar" },
  { pair: "USD/JPY", price: "149.82", change: "-0.12%", positive: false, name: "US Dollar / Japanese Yen" },
  { pair: "USD/CHF", price: "0.8845", change: "-0.08%", positive: false, name: "US Dollar / Swiss Franc" },
  { pair: "AUD/USD", price: "0.6521", change: "+0.42%", positive: true, name: "Australian Dollar / US Dollar" },
  { pair: "USD/CAD", price: "1.3678", change: "-0.21%", positive: false, name: "US Dollar / Canadian Dollar" },
  { pair: "NZD/USD", price: "0.5892", change: "+0.33%", positive: true, name: "New Zealand Dollar / US Dollar" },
  { pair: "EUR/GBP", price: "0.8552", change: "-0.05%", positive: false, name: "Euro / British Pound" },
];

const Forex = () => {
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();
  const { trades, createTrade, calculateCurrentValue } = useTrades('forex');

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_forex')
        .eq('id', user.id)
        .single();

      if (profile) {
        setBalance(profile.balance_forex || 0);
      }
    };

    fetchBalance();
  }, [trades]);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    const selectedPairData = forexPairs.find(p => p.pair === selectedPair);
    if (!selectedPairData) return;

    createTrade.mutate({
      asset_symbol: selectedPair,
      asset_name: selectedPairData.name,
      initial_amount: parseFloat(amount),
    });
    setAmount("");
  };

  const activeTrade = trades.find(t => t.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Forex Trading</h1>
        <p className="text-muted-foreground">Trade popular forex currency pairs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit Panel */}
        <Card className="lg:col-span-1 bg-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Deposit & Trade</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Balance</span>
                </div>
                <span className="text-lg font-bold">${balance.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label>Currency Pair</Label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {forexPairs.map((pair) => (
                      <SelectItem key={pair.pair} value={pair.pair}>
                        {pair.pair}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <Button 
                onClick={handleDeposit} 
                className="w-full gap-2"
                disabled={createTrade.isPending || !!activeTrade || balance === 0}
              >
                <Wallet className="w-4 h-4" />
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
                    Deposit funds and select a currency pair to start your AI-powered trade
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Market Stats */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Market Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Daily Volume</div>
              <div className="text-2xl font-bold">$6.6T</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Active Pairs</div>
              <div className="text-2xl font-bold">180+</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avg. Spread</div>
              <div className="text-2xl font-bold">0.8 pips</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Trading Hours</div>
              <div className="text-2xl font-bold">24/5</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forex;
