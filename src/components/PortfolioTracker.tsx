import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/hooks/useTrades";

type TimeFrame = 'minutes' | 'hours' | 'day' | 'week' | 'month' | 'year';

interface PortfolioDataPoint {
  time: string;
  crypto: number;
  forex: number;
}

export const PortfolioTracker = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [chartData, setChartData] = useState<PortfolioDataPoint[]>([]);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [forexBalance, setForexBalance] = useState(0);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current balances
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_crypto, balance_forex')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCryptoBalance(Number(profile.balance_crypto) || 0);
        setForexBalance(Number(profile.balance_forex) || 0);
      }

      // Get all trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!trades || trades.length === 0) {
        // No trades yet, show current balances
        setChartData([
          {
            time: 'Now',
            crypto: Number(profile?.balance_crypto) || 0,
            forex: Number(profile?.balance_forex) || 0,
          }
        ]);
        return;
      }

      // Calculate portfolio value over time based on trades
      const portfolioHistory = calculatePortfolioHistory(trades as Trade[], timeFrame);
      setChartData(portfolioHistory);
    };

    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeFrame]);

  const calculatePortfolioHistory = (trades: Trade[], timeFrame: TimeFrame): PortfolioDataPoint[] => {
    const now = new Date();
    const dataPoints: PortfolioDataPoint[] = [];
    
    // Determine time range and intervals
    let startTime: Date;
    let intervalMs: number;
    let pointCount: number;

    switch (timeFrame) {
      case 'minutes':
        startTime = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
        intervalMs = 5 * 60 * 1000; // 5 minute intervals
        pointCount = 12;
        break;
      case 'hours':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        intervalMs = 60 * 60 * 1000; // 1 hour intervals
        pointCount = 24;
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        intervalMs = 2 * 60 * 60 * 1000; // 2 hour intervals
        pointCount = 12;
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
        intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
        pointCount = 7;
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
        pointCount = 30;
        break;
      case 'year':
        startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // Last year
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 day intervals
        pointCount = 12;
        break;
    }

    // Calculate portfolio value at each time point
    for (let i = 0; i <= pointCount; i++) {
      const timestamp = new Date(startTime.getTime() + i * intervalMs);
      let cryptoValue = cryptoBalance;
      let forexValue = forexBalance;

      // Add back current active trades (they're deducted from balance)
      trades.forEach(trade => {
        const tradeStart = new Date(trade.start_time);
        const tradeEnd = new Date(trade.end_time);
        
        if (tradeStart <= timestamp) {
          if (trade.is_active || tradeEnd > timestamp) {
            // Trade was active at this time, calculate its value
            const hoursElapsed = Math.min(
              (timestamp.getTime() - tradeStart.getTime()) / (1000 * 60 * 60),
              (tradeEnd.getTime() - tradeStart.getTime()) / (1000 * 60 * 60)
            );
            const growthRate = 0.002;
            const tradeValue = trade.initial_amount * Math.pow(1 + growthRate, hoursElapsed);
            
            if (trade.trade_type === 'crypto') {
              cryptoValue += tradeValue;
            } else {
              forexValue += tradeValue;
            }
          } else if (tradeEnd <= timestamp) {
            // Trade completed before this time, value is already in balance
            // No adjustment needed
          }
        }
      });

      const timeLabel = formatTimeLabel(timestamp, timeFrame);
      dataPoints.push({
        time: timeLabel,
        crypto: parseFloat(cryptoValue.toFixed(2)),
        forex: parseFloat(forexValue.toFixed(2)),
      });
    }

    return dataPoints;
  };

  const formatTimeLabel = (date: Date, timeFrame: TimeFrame): string => {
    switch (timeFrame) {
      case 'minutes':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'hours':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const totalPortfolio = cryptoBalance + forexBalance;
  const cryptoPercentage = totalPortfolio > 0 ? (cryptoBalance / totalPortfolio * 100).toFixed(1) : 0;
  const forexPercentage = totalPortfolio > 0 ? (forexBalance / totalPortfolio * 100).toFixed(1) : 0;

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Tracker</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={timeFrame === 'minutes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('minutes')}
            >
              Min
            </Button>
            <Button
              variant={timeFrame === 'hours' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('hours')}
            >
              Hours
            </Button>
            <Button
              variant={timeFrame === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('day')}
            >
              Day
            </Button>
            <Button
              variant={timeFrame === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('week')}
            >
              Week
            </Button>
            <Button
              variant={timeFrame === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('month')}
            >
              Month
            </Button>
            <Button
              variant={timeFrame === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFrame('year')}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">
              Crypto: ${cryptoBalance.toFixed(2)} ({cryptoPercentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">
              Forex: ${forexBalance.toFixed(2)} ({forexPercentage}%)
            </span>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="crypto" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Crypto"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="forex" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Forex"
                dot={{ fill: 'hsl(var(--secondary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
