import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, RefreshCcw, TrendingUp, Bitcoin, DollarSign, ArrowDownToLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";
import { WalletConnectDeposit } from "@/components/WalletConnectDeposit";
import { PortfolioTracker } from "@/components/PortfolioTracker";

const chartData = [
  { time: "2:00pm", btc: 8420, eth: 2980 },
  { time: "3:00pm", btc: 8200, eth: 2850 },
  { time: "4:00pm", btc: 8350, eth: 2920 },
  { time: "5:00pm", btc: 8500, eth: 3010 },
  { time: "6:00pm", btc: 8450, eth: 2950 },
  { time: "7:00pm", btc: 8650, eth: 3050 },
  { time: "8:00pm", btc: 8750, eth: 3100 },
  { time: "9:00pm", btc: 8420, eth: 2980 },
];

const paymentHistory = [
  { name: "Achain", icon: "🔵", change: "-8.43%", date: "12 Jun, 2024", price: "$14,923.33", status: "Successfully", positive: false },
  { name: "Cardano", icon: "🔷", change: "+2.94%", date: "16 May, 2024", price: "$2,439.90", status: "Pending", positive: true },
  { name: "Digibyte", icon: "🔹", change: "+16.84", date: "21 Feb, 2024", price: "$219", status: "Failed", positive: true },
  { name: "Ethereum", icon: "💎", change: "-34.34%", date: "19 Dec, 2023", price: "$5,891", status: "Failed", positive: false },
];

const Overview = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [balanceCrypto, setBalanceCrypto] = useState(0);
  const [balanceForex, setBalanceForex] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [cryptoDepositOpen, setCryptoDepositOpen] = useState(false);
  const [depositWallet, setDepositWallet] = useState("crypto");
  const [withdrawWallet, setWithdrawWallet] = useState("crypto");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawChain, setWithdrawChain] = useState("ETH");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const { data: cryptoData, isLoading } = useCryptoData();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, balance_crypto, balance_forex, total_profit')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setFullName(profile.full_name || "");
          const cryptoBal = Number(profile.balance_crypto) || 0;
          const forexBal = Number(profile.balance_forex) || 0;
          const profit = Number(profile.total_profit) || 0;
          
          setBalanceCrypto(cryptoBal);
          setBalanceForex(forexBal);
          setTotalProfit(profit);
          
          // Calculate total deposited (current balances + profit from trades)
          // This assumes initial deposit = current balance + active trade amounts - profit
          const currentPortfolio = cryptoBal + forexBal;
          
          // Get value locked in active trades
          const { data: activeTrades } = await supabase
            .from('trades')
            .select('initial_amount')
            .eq('user_id', user.id)
            .eq('is_active', true);
          
          const activeTradeValue = activeTrades?.reduce((sum, trade) => 
            sum + Number(trade.initial_amount), 0) || 0;
          
          // Total deposited = current balance + active trades - profit earned
          const deposited = currentPortfolio + activeTradeValue - profit;
          setTotalDeposited(Math.max(0, deposited));
        }
      }
    };
    getUser();
  }, []);

  const handleCryptoDeposit = async (usdAmount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ balance_crypto: balanceCrypto + usdAmount })
      .eq('id', user.id);

    if (!error) {
      setBalanceCrypto(balanceCrypto + usdAmount);
      toast({
        title: "Deposit Confirmed",
        description: `$${usdAmount.toFixed(2)} added to your crypto wallet`,
      });
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateField = depositWallet === "crypto" ? "balance_crypto" : "balance_forex";
    const currentBalance = depositWallet === "crypto" ? balanceCrypto : balanceForex;

    const { error } = await supabase
      .from('profiles')
      .update({ [updateField]: currentBalance + amount })
      .eq('id', user.id);

    if (!error) {
      if (depositWallet === "crypto") {
        setBalanceCrypto(currentBalance + amount);
      } else {
        setBalanceForex(currentBalance + amount);
      }
      setDepositAmount("");
      setDepositOpen(false);
      toast({
        title: "Success",
        description: `Deposited $${amount.toFixed(2)} to ${depositWallet === "crypto" ? "Crypto" : "Forex"} wallet`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to deposit funds",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a withdrawal wallet address",
        variant: "destructive",
      });
      return;
    }

    // Show the "Wrong Withdrawal Wallet" error
    toast({
      title: "Error",
      description: "Wrong Withdrawal Wallet",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back{fullName ? `, ${fullName}` : ""}</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your performance and analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Deposit</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select value={depositWallet} onValueChange={setDepositWallet}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto Wallet</SelectItem>
                      <SelectItem value="forex">Forex Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Button onClick={handleDeposit} className="w-full">
                    Deposit (Demo)
                  </Button>
                  <Button 
                    onClick={() => {
                      setDepositOpen(false);
                      setCryptoDepositOpen(true);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Deposit with Crypto
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <WalletConnectDeposit 
            open={cryptoDepositOpen}
            onOpenChange={setCryptoDepositOpen}
            onDepositComplete={handleCryptoDeposit}
          />
          
          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowDownToLine className="w-4 h-4" />
                <span className="hidden sm:inline">Withdraw</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Wallet</Label>
                  <Select value={withdrawWallet} onValueChange={setWithdrawWallet}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto Wallet</SelectItem>
                      <SelectItem value="forex">Forex Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Chain</Label>
                  <Select value={withdrawChain} onValueChange={setWithdrawChain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    type="text"
                    placeholder="Enter your wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Available Balance</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-lg font-bold">
                      ${(withdrawWallet === "crypto" ? balanceCrypto : balanceForex).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    max={withdrawWallet === "crypto" ? balanceCrypto : balanceForex}
                    step="0.01"
                  />
                </div>
                <Button onClick={handleWithdraw} className="w-full">
                  Withdraw
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="icon">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Crypto Balance</p>
              <Bitcoin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-bold">${balanceCrypto.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Forex Balance</p>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-bold">${balanceForex.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-bold">${totalProfit.toFixed(2)}</p>
            <p className={cn("text-xs mt-1", totalProfit >= 0 ? "text-primary" : "text-destructive")}>
              Lifetime Earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Tracker */}
        <div className="lg:col-span-2">
          <PortfolioTracker />
        </div>

        {/* Profit Percentage */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-sm text-muted-foreground mb-4">Percentage Profit</div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35%"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35%"
                    stroke={totalProfit >= 0 ? "#4ADE80" : "#EF4444"}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${Math.min(Math.abs(totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : 0), 100) * 2.2} ${100 * 2.2}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className={cn(
                  "text-2xl md:text-4xl font-bold",
                  totalProfit >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {totalDeposited > 0 
                    ? `${totalProfit >= 0 ? '+' : ''}${((totalProfit / totalDeposited) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm">Profit margin</div>
              <div className={cn("text-xs mt-1", totalProfit >= 0 ? "text-primary" : "text-destructive")}>
                {totalProfit >= 0 ? "↑" : "↓"} ${Math.abs(totalProfit).toFixed(2)} Lifetime
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Market Data */}
      <Card>
        <CardHeader>
          <CardTitle>Top Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead className="hidden md:table-cell">Market Cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : cryptoData ? (
                  cryptoData.slice(0, 5).map((coin) => (
                    <TableRow key={coin.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                          <span className="hidden sm:inline">{coin.name}</span>
                          <span className="sm:hidden">{coin.symbol.toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">${coin.current_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          coin.price_change_percentage_24h >= 0 ? "text-primary" : "text-destructive"
                        )}>
                          {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ${(coin.market_cap / 1e9).toFixed(2)}B
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Failed to load data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
