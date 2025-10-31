import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [tradeType, setTradeType] = useState("buy");
  const { toast } = useToast();

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Trade Executed",
      description: `${tradeType === "buy" ? "Bought" : "Sold"} ${amount} ${selectedPair}`,
    });
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Forex Trading</h1>
        <p className="text-muted-foreground">Trade popular forex currency pairs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <Card className="lg:col-span-1 bg-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Place Trade</h2>
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label>Trade Type</Label>
                <Select value={tradeType} onValueChange={setTradeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleTrade} className="w-full gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Execute Trade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card className="lg:col-span-2 bg-card">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forexPairs.map((pair) => (
                <Card key={pair.pair} className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{pair.pair}</div>
                        <div className="text-xs text-muted-foreground">{pair.name}</div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${pair.positive ? "text-green-500" : "text-red-500"}`}>
                        {pair.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {pair.change}
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{pair.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
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
