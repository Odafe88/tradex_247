import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const tradeSchema = z.object({
  asset_symbol: z.string().trim().min(1).max(20).regex(/^[A-Z0-9/]+$/, "Invalid asset symbol format"),
  asset_name: z.string().trim().min(1).max(100),
  initial_amount: z.number().positive("Amount must be positive").min(1, "Minimum trade amount is $1").max(1000000, "Maximum trade amount is $1,000,000"),
});

export interface Trade {
  id: string;
  user_id: string;
  trade_type: 'crypto' | 'forex';
  asset_symbol: string;
  asset_name: string;
  initial_amount: number;
  current_value: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export const useTrades = (tradeType: 'crypto' | 'forex') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', tradeType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('trade_type', tradeType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
  });

  const createTrade = useMutation({
    mutationFn: async ({
      asset_symbol,
      asset_name,
      initial_amount,
    }: {
      asset_symbol: string;
      asset_name: string;
      initial_amount: number;
    }) => {
      // Validate inputs
      try {
        tradeSchema.parse({ asset_symbol, asset_name, initial_amount });
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const start_time = new Date();
      const end_time = new Date(start_time.getTime() + 24 * 60 * 60 * 1000);

      // Use atomic database function to prevent race conditions
      const { data, error } = await supabase.rpc('create_trade_atomic', {
        p_trade_type: tradeType,
        p_asset_symbol: asset_symbol,
        p_asset_name: asset_name,
        p_initial_amount: initial_amount,
        p_start_time: start_time.toISOString(),
        p_end_time: end_time.toISOString(),
      });

      if (error) throw error;
      if (!data) throw new Error('Failed to create trade');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', tradeType] });
      toast({
        title: "Trade Started",
        description: "Your AI bot is now tracking this trade",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the current trade
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (tradeError) throw tradeError;
      if (!trade) throw new Error('Trade not found');

      // Calculate current value
      const currentValue = calculateCurrentValue(trade as Trade);
      const profit = currentValue - trade.initial_amount;

      // Update trade to inactive and set final current_value
      const { error: updateTradeError } = await supabase
        .from('trades')
        .update({ 
          is_active: false, 
          current_value: currentValue,
          end_time: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (updateTradeError) throw updateTradeError;

      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance_crypto, balance_forex, total_profit')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Update profile with profit and return balance
      const balanceField = tradeType === 'crypto' ? 'balance_crypto' : 'balance_forex';
      const currentBalance = tradeType === 'crypto' ? profile.balance_crypto : profile.balance_forex;
      
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ 
          [balanceField]: (currentBalance || 0) + currentValue,
          total_profit: (profile.total_profit || 0) + profit
        })
        .eq('id', user.id);

      if (updateProfileError) throw updateProfileError;

      return { profit, currentValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades', tradeType] });
      toast({
        title: "Trade Ended",
        description: `Profit: $${data.profit.toFixed(2)} | Final Value: $${data.currentValue.toFixed(2)}`,
        variant: data.profit >= 0 ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateCurrentValue = (trade: Trade) => {
    const now = new Date();
    const startTime = new Date(trade.start_time);
    const endTime = new Date(trade.end_time);
    
    if (now >= endTime || !trade.is_active) {
      return trade.current_value;
    }

    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const growthRate = 0.002; // 0.2% per hour
    const currentValue = trade.initial_amount * Math.pow(1 + growthRate, hoursElapsed);
    
    return currentValue;
  };

  return {
    trades,
    isLoading,
    createTrade,
    endTrade,
    calculateCurrentValue,
  };
};