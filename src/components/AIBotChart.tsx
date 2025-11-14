import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { Bot, TrendingUp } from "lucide-react";
import { Trade } from "@/hooks/useTrades";
import { Button } from "@/components/ui/button";

type TimeFrame = 'day' | 'week' | 'month';

interface AIBotChartProps {
  trade: Trade;
  calculateCurrentValue: (trade: Trade) => number;
}

const AIBotChart = ({ trade, calculateCurrentValue }: AIBotChartProps) => {
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
  const [currentValue, setCurrentValue] = useState(trade.initial_amount);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');

  useEffect(() => {
    const updateChart = () => {
      const now = new Date();
      const startTime = new Date(trade.start_time);
      const endTime = new Date(trade.end_time);
      
      if (now >= endTime) {
        return;
      }

      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const newValue = calculateCurrentValue(trade);
      setCurrentValue(newValue);

      const getTimeLabel = () => {
        if (timeFrame === 'day') {
          return `${Math.floor(hoursElapsed)}h`;
        } else if (timeFrame === 'week') {
          const daysElapsed = Math.floor(hoursElapsed / 24);
          return `${daysElapsed}d`;
        } else {
          const weeksElapsed = Math.floor(hoursElapsed / (24 * 7));
          return `${weeksElapsed}w`;
        }
      };

      const newDataPoint = {
        time: getTimeLabel(),
        value: parseFloat(newValue.toFixed(2)),
      };

      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        const maxDataPoints = timeFrame === 'day' ? 24 : timeFrame === 'week' ? 168 : 720;
        return updated.slice(-maxDataPoints);
      });
    };

    updateChart();
    const interval = setInterval(updateChart, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trade, calculateCurrentValue, timeFrame]);

  const profit = currentValue - trade.initial_amount;
  const profitPercentage = ((profit / trade.initial_amount) * 100).toFixed(2);
  const hoursRemaining = Math.max(0, Math.floor((new Date(trade.end_time).getTime() - new Date().getTime()) / (1000 * 60 * 60)));

  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Trading Bot</h3>
            <p className="text-sm text-muted-foreground">{trade.asset_name} ({trade.asset_symbol})</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Initial</p>
            <p className="text-lg font-bold">${trade.initial_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-lg font-bold">${currentValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit</p>
            <p className="text-lg font-bold text-green-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              ${profit.toFixed(2)} ({profitPercentage}%)
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time Left</p>
            <p className="text-lg font-bold">{hoursRemaining}h</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
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
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIBotChart;