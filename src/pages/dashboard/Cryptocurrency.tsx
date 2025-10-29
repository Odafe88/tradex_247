import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

const cryptoList = [
  { name: "Bitcoin", symbol: "BTC", price: "$52,291", change: "+2.45%", positive: true, icon: "₿" },
  { name: "Ethereum", symbol: "ETH", price: "$2,980", change: "+1.82%", positive: true, icon: "Ξ" },
  { name: "Cardano", symbol: "ADA", price: "$0.45", change: "-0.95%", positive: false, icon: "₳" },
  { name: "Solana", symbol: "SOL", price: "$98.75", change: "+5.21%", positive: true, icon: "◎" },
  { name: "Polkadot", symbol: "DOT", price: "$7.23", change: "-1.24%", positive: false, icon: "●" },
  { name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "+12.87%", positive: true, icon: "Ð" },
];

const Cryptocurrency = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cryptocurrency</h1>
          <p className="text-muted-foreground">Track and analyze cryptocurrency prices</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cryptocurrencies..."
            className="pl-10 bg-card border-border"
          />
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
