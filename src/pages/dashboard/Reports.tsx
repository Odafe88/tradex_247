import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTrades } from "@/hooks/useTrades";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";

// const portfolioData = [
//   { name: "Bitcoin", value: 40 },
//   { name: "Ethereum", value: 30 },
//   { name: "Others", value: 30 },
// ];

const COLORS = ["#4ADE80", "#FBBF24", "#60A5FA"];

const Reports = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);

  const { trades: cryptoTrades } = useTrades('crypto');
  const { trades: forexTrades } = useTrades('forex');

  const activeTrades = [...cryptoTrades, ...forexTrades].filter(t => t.is_active).length;
  const allTrades = [...cryptoTrades, ...forexTrades];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_crypto, balance_forex, total_profit, created_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        const cryptoBalance = Number(profile.balance_crypto) || 0;
        const forexBalance = Number(profile.balance_forex) || 0;
        const profit = Number(profile.total_profit) || 0;
        const deposit = cryptoBalance + forexBalance;

        setTotalProfit(profit);
        setTotalDeposit(deposit);
        setTotalRevenue((profit / 100) * deposit);
        setUserCreatedAt(new Date(profile.created_at));

        // Calculate success rate from trades
        if (allTrades.length > 0) {
          const totalProfitPercentage = allTrades.reduce((sum, trade) => {
            const profitPercent = ((trade.current_value - trade.initial_amount) / trade.initial_amount) * 100;
            return sum + profitPercent;
          }, 0);
          setSuccessRate((totalProfitPercentage / allTrades.length));
        } else {
          setSuccessRate(0);
        }

        // Generate monthly data from user creation date
        if (profile.created_at) {
          const createdDate = new Date(profile.created_at);
          const now = new Date();
          const monthsToShow = Math.min(5, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1);
          
          const data = [];
          for (let i = monthsToShow - 1; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            
            // Calculate trades in this month
            const monthTrades = allTrades.filter(trade => {
              const tradeDate = new Date(trade.created_at);
              return tradeDate >= monthStart && tradeDate <= monthEnd;
            });

            const monthRevenue = monthTrades.reduce((sum, trade) => {
              return sum + (trade.current_value - trade.initial_amount);
            }, 0);

            const monthExpenses = monthTrades.reduce((sum, trade) => {
              return sum + trade.initial_amount * 0.1; // Assume 10% expenses
            }, 0);

            data.push({
              month: format(monthDate, 'MMM'),
              revenue: Math.max(0, monthRevenue),
              expenses: Math.max(0, monthExpenses),
            });
          }
          
          setMonthlyData(data);
        }
      }
    };

    fetchUserData();
  }, [allTrades.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">Detailed analytics and performance reports</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="revenue" fill="#4ADE80" />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* <Card className="bg-card">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-1">Profit/100 × Total Deposit</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Trades</div>
            <div className="text-3xl font-bold">{activeTrades}</div>
            <div className="text-sm text-muted-foreground mt-1">From Crypto & Forex</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
            <div className="text-3xl font-bold">{successRate.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground mt-1">Avg profit per trade</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
