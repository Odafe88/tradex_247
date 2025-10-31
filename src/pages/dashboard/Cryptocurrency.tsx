import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const cryptoList = [
  { name: "Bitcoin", symbol: "BTC", price: "$52,291", change: "+2.45%", positive: true, icon: "₿" },
  { name: "Ethereum", symbol: "ETH", price: "$2,980", change: "+1.82%", positive: true, icon: "Ξ" },
  { name: "Cardano", symbol: "ADA", price: "$0.45", change: "-0.95%", positive: false, icon: "₳" },
  { name: "Solana", symbol: "SOL", price: "$98.75", change: "+5.21%", positive: true, icon: "◎" },
  { name: "Polkadot", symbol: "DOT", price: "$7.23", change: "-1.24%", positive: false, icon: "●" },
  { name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "+12.87%", positive: true, icon: "Ð" },
];

const Cryptocurrency = () => {
  const [depositCurrency, setDepositCurrency] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Deposit Initiated",
      description: `Processing ${depositAmount} ${depositCurrency} deposit to your wallet`,
    });
    setOpen(false);
    setDepositAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cryptocurrency</h1>
          <p className="text-muted-foreground">Track and analyze cryptocurrency prices</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Wallet className="w-4 h-4" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit to Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT (Tether)</SelectItem>
                      <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                  <p className="text-xs font-mono break-all">
                    {depositCurrency === "BTC" 
                      ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      : "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}
                  </p>
                </div>
                <Button onClick={handleDeposit} className="w-full">
                  Confirm Deposit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptoList.map((crypto) => (
          <Card key={crypto.symbol} className="bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {crypto.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{crypto.name}</div>
                    <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{crypto.price}</div>
                <div className={`flex items-center gap-1 text-sm ${crypto.positive ? "text-green-500" : "text-red-500"}`}>
                  {crypto.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {crypto.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
              <div className="text-2xl font-bold">$2.1T</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
              <div className="text-2xl font-bold">$89.5B</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">BTC Dominance</div>
              <div className="text-2xl font-bold">48.5%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Active Cryptos</div>
              <div className="text-2xl font-bold">12,847</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cryptocurrency;
